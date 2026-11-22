// The world: one room's live state and the fixed-step rules that move it.
// The thief, the guards, the cameras, the loot, the alarm meter and the
// tools all live here; the renderer only paints what this module decides.
import {
  ALARM_CAMERA_RATE,
  ALARM_DECAY_RATE,
  ALARM_SEEN_RATE,
  ALARM_TOUCH_SPIKE,
  CAMERA_CONE_HALF_ANGLE,
  CAMERA_CONE_RANGE,
  GUARD_CONE_HALF_ANGLE,
  GUARD_CONE_RANGE,
  SHADOW_VISIBILITY,
  SNEAK_VISIBILITY,
  STEP,
  THIEF_RADIUS,
  THIEF_SNEAK_SPEED,
  THIEF_WALK_SPEED,
} from './config.js';
import { LEVELS } from './levels.js';
import {
  angleDifference,
  circleBlocked,
  createGuard,
  losClear,
  moveBlockers,
  sightBlockers,
  stepGuard,
} from './guards.js';

export const EVENT_PICKUP = 1;
export const EVENT_STAR = 2;
export const EVENT_CLEAR = 4;
export const EVENT_BUSTED = 8;
export const EVENT_ALARM = 16;
export const EVENT_NOISE = 32;
export const EVENT_EMP = 64;
export const EVENT_TOUCH = 128;

export function createWorld(random) {
  return {
    random,
    levelIndex: 0,
    level: LEVELS[0],
    time: 0,
    alarm: 0,
    peakAlarm: 0,
    score: 0,
    thief: { x: 0, y: 0, facing: -Math.PI / 2, sneaking: false, moving: false, radius: THIEF_RADIUS },
    guards: [],
    cameras: [],
    loot: [],
    noiseCount: 0,
    empCount: 0,
    noise: null,
    noiseId: 0,
    noisePulse: null,
    status: 'playing',
    hint: '',
    clearTimer: 0,
    clearBonus: 0,
    ghostBonus: false,
    blockers: [],
    sight: [],
  };
}

export function loadLevel(world, index) {
  const level = LEVELS[index];
  world.levelIndex = index;
  world.level = level;
  world.time = 0;
  world.alarm = 0;
  world.peakAlarm = 0;
  world.thief.x = level.spawn.x;
  world.thief.y = level.spawn.y;
  world.thief.facing = -Math.PI / 2;
  world.guards = level.guards.map((def, i) => createGuard(def, i, world.random));
  world.cameras = level.cameras.map((def) => ({ ...def, angle: def.center, disabled: 0 }));
  world.loot = level.loot.map((item) => ({ ...item, taken: false, sparkle: world.random() * Math.PI * 2 }));
  world.noiseCount = level.tools.noise;
  world.empCount = level.tools.emp;
  world.noise = null;
  world.noisePulse = null;
  world.status = 'playing';
  world.hint = '';
  world.clearTimer = 0;
  world.blockers = moveBlockers(level);
  world.sight = sightBlockers(level);
}

export function resetRun(world) {
  world.score = 0;
  loadLevel(world, 0);
}

function inShadow(world, x, y) {
  for (const zone of world.level.shadows) {
    if (x >= zone.x && x <= zone.x + zone.w && y >= zone.y && y <= zone.y + zone.h) return true;
  }
  return false;
}

/** How strongly an eye sees the thief: 0 when out of cone, blocked, or too far. */
function visibility(eyeX, eyeY, facing, range, halfAngle, world) {
  const t = world.thief;
  const dx = t.x - eyeX;
  const dy = t.y - eyeY;
  const dist = Math.hypot(dx, dy);
  if (dist > range) return 0;
  const toThief = Math.atan2(dy, dx);
  if (Math.abs(angleDifference(toThief, facing)) > halfAngle) return 0;
  if (!losClear(eyeX, eyeY, t.x, t.y, world.sight)) return 0;
  let factor = 1.15 - dist / range;
  if (factor < 0.25) factor = 0.25;
  if (inShadow(world, t.x, t.y)) factor *= SHADOW_VISIBILITY;
  if (t.sneaking) factor *= SNEAK_VISIBILITY;
  return factor;
}

export function stepWorld(world, input) {
  const dt = STEP;
  let events = 0;
  if (world.status !== 'playing') return events;
  world.time += dt;
  const t = world.thief;
  const wasAlarmHigh = world.alarm >= 70;

  // --- the thief moves, axis by axis so walls slide instead of snagging.
  const speed = input.sneak ? THIEF_SNEAK_SPEED : THIEF_WALK_SPEED;
  t.sneaking = input.sneak;
  const mag = Math.hypot(input.dx, input.dy);
  t.moving = mag > 0.1;
  if (t.moving) {
    const nx = t.x + (input.dx / Math.max(mag, 1)) * speed * dt;
    const ny = t.y + (input.dy / Math.max(mag, 1)) * speed * dt;
    if (!circleBlocked(nx, t.y, t.radius, world.blockers)) t.x = nx;
    if (!circleBlocked(t.x, ny, t.radius, world.blockers)) t.y = ny;
    t.facing = Math.atan2(input.dy, input.dx);
  }

  // --- tools: a thrown noisemaker, and the EMP burst that blinds cameras.
  if (input.throwNoise && world.noiseCount > 0) {
    world.noiseCount -= 1;
    world.noiseId += 1;
    world.noise = { id: world.noiseId, x: input.throwNoise.x, y: input.throwNoise.y };
    world.noisePulse = { x: input.throwNoise.x, y: input.throwNoise.y, age: 0 };
    events |= EVENT_NOISE;
  }
  if (input.emp && world.empCount > 0) {
    world.empCount -= 1;
    for (const cam of world.cameras) cam.disabled = 6;
    events |= EVENT_EMP;
  }
  if (world.noisePulse) {
    world.noisePulse.age += dt;
    if (world.noisePulse.age > 0.9) world.noisePulse = null;
  }

  // --- cameras sweep; the alarm rises while any eye holds the thief.
  let seen = 0;
  for (const cam of world.cameras) {
    cam.disabled = Math.max(0, cam.disabled - dt);
    cam.angle = cam.center + Math.sin(world.time * cam.speed) * cam.spread;
    if (cam.disabled <= 0) {
      const v = visibility(cam.x, cam.y, cam.angle, CAMERA_CONE_RANGE, CAMERA_CONE_HALF_ANGLE, world);
      if (v > seen) seen = v;
      if (v > 0) world.alarm += ALARM_CAMERA_RATE * v * dt;
    }
  }
  const guardSeen = [];
  for (const g of world.guards) {
    const v = visibility(g.x, g.y, g.facing, GUARD_CONE_RANGE, GUARD_CONE_HALF_ANGLE, world);
    guardSeen.push(v);
    if (v > seen) seen = v;
    if (v > 0) world.alarm += ALARM_SEEN_RATE * v * dt;
  }
  if (seen <= 0) world.alarm = Math.max(0, world.alarm - ALARM_DECAY_RATE * dt);
  world.alarm = Math.min(100, world.alarm);
  if (world.alarm > world.peakAlarm) world.peakAlarm = world.alarm;
  if (!wasAlarmHigh && world.alarm >= 70) events |= EVENT_ALARM;

  // --- guards act on what they sense.
  for (let i = 0; i < world.guards.length; i += 1) {
    const g = world.guards[i];
    stepGuard(g, dt, {
      thiefX: t.x,
      thiefY: t.y,
      thiefVisible: guardSeen[i] > 0,
      alarm: world.alarm,
      blockers: world.blockers,
      noise: world.noise,
      time: world.time,
      onTouch: (guard) => {
        world.alarm = Math.min(100, world.alarm + ALARM_TOUCH_SPIKE);
        guard.mode = 'chase';
        guard.lastSeen = { x: t.x, y: t.y };
        guard.lastSeenAge = 0;
        events |= EVENT_TOUCH;
      },
    });
  }
  world.noise = null;

  // --- loot: walking over a prize takes it.
  for (const item of world.loot) {
    if (item.taken) continue;
    if (Math.hypot(item.x - t.x, item.y - t.y) < 28) {
      item.taken = true;
      if (item.kind === 'star') {
        world.score += 500;
        events |= EVENT_STAR;
      } else if (item.kind === 'gem') {
        world.score += 250;
        events |= EVENT_PICKUP;
      } else {
        world.score += 150;
        events |= EVENT_PICKUP;
      }
    }
  }

  const starTaken = world.loot.some((item) => item.kind === 'star' && item.taken);

  // --- the exit, and the contextual hint the HUD shows.
  const exit = world.level.exit;
  const onExit = t.x >= exit.x && t.x <= exit.x + exit.w && t.y >= exit.y && t.y <= exit.y + exit.h;
  if (onExit && starTaken) {
    world.status = 'cleared';
    world.clearTimer = 0;
    const timeBonus = Math.max(0, Math.round((world.level.par - world.time) * 10));
    world.ghostBonus = world.peakAlarm < 50;
    world.clearBonus = timeBonus + (world.ghostBonus ? 500 : 0);
    world.score += world.clearBonus;
    events |= EVENT_CLEAR;
  } else if (onExit && !starTaken) {
    world.hint = 'The exit is locked — take the Amber Star first.';
  } else if (!starTaken) {
    world.hint = 'Steal the Amber Star, then reach the green exit.';
  } else {
    world.hint = 'Star secured — get to the green exit!';
  }

  if (world.alarm >= 100) {
    world.status = 'busted';
    events |= EVENT_BUSTED;
  }
  return events;
}

export function starTaken(world) {
  return world.loot.some((item) => item.kind === 'star' && item.taken);
}

export function lootCount(world) {
  return world.loot.filter((item) => item.taken).length;
}
