// Guards, cameras and the sight rules: patrols, vision cones, line of sight,
// suspicion, investigation and the chase. A guard never sees through a wall
// or a display case; a camera never sees through one either.
import {
  GUARD_CHASE_SPEED,
  GUARD_PATROL_SPEED,
  GUARD_TOUCH_RADIUS,
  WALL,
  VIEW_HEIGHT,
  VIEW_WIDTH,
} from './config.js';

/** The rects that block movement and sight: the border plus walls and cases. */
export function sightBlockers(level) {
  const border = [
    { x: 0, y: 0, w: VIEW_WIDTH, h: WALL },
    { x: 0, y: VIEW_HEIGHT - WALL, w: VIEW_WIDTH, h: WALL },
    { x: 0, y: 0, w: WALL, h: VIEW_HEIGHT },
    { x: VIEW_WIDTH - WALL, y: 0, w: WALL, h: VIEW_HEIGHT },
  ];
  return border.concat(level.walls, level.cases);
}

/** The rects that block movement: sight blockers plus low pedestals. */
export function moveBlockers(level) {
  return sightBlockers(level).concat(level.pedestals);
}

export function pointInRect(x, y, rect) {
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}

export function pointBlocked(x, y, rects) {
  for (let i = 0; i < rects.length; i += 1) {
    if (pointInRect(x, y, rects[i])) return true;
  }
  return false;
}

/** True when the straight segment between two points crosses no blocker. */
export function losClear(x1, y1, x2, y2, rects) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.hypot(dx, dy);
  const steps = Math.max(1, Math.ceil(dist / 6));
  for (let i = 1; i < steps; i += 1) {
    const t = i / steps;
    if (pointBlocked(x1 + dx * t, y1 + dy * t, rects)) return false;
  }
  return true;
}

/** Distance from an eye along an angle to the first blocker, or maxDist. */
export function castRay(ox, oy, angle, maxDist, rects) {
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  for (let d = 6; d <= maxDist; d += 6) {
    if (pointBlocked(ox + dx * d, oy + dy * d, rects)) return d;
  }
  return maxDist;
}

/** The vision polygon of a cone, as a list of points from the eye out. */
export function conePolygon(ox, oy, angle, range, halfAngle, rects, rays = 26) {
  const points = [{ x: ox, y: oy }];
  for (let i = 0; i <= rays; i += 1) {
    const a = angle - halfAngle + (2 * halfAngle * i) / rays;
    const d = castRay(ox, oy, a, range, rects);
    points.push({ x: ox + Math.cos(a) * d, y: oy + Math.sin(a) * d });
  }
  return points;
}

export function angleDifference(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  return d;
}

export function turnToward(current, target, maxTurn) {
  const d = angleDifference(target, current);
  if (Math.abs(d) <= maxTurn) return target;
  return current + Math.sign(d) * maxTurn;
}

export function createGuard(def, index, random) {
  const start = def.path[0];
  return {
    index,
    x: start[0],
    y: start[1],
    facing: 0,
    path: def.path,
    waypoint: 1 % def.path.length,
    pause: def.pause,
    pauseTimer: random() * 0.8,
    mode: 'patrol',
    scanPhase: random() * Math.PI * 2,
    lastSeen: null,
    lastSeenAge: 99,
    investigate: null,
    heardNoise: 0,
    lookTimer: 0,
    touchCooldown: 0,
    alerted: false,
  };
}

/**
 * Advance one guard. ctx carries what the guard can sense this frame:
 * the thief's position, whether this guard can see the thief, the alarm
 * level, the newest noise, and an onTouch hook the world owns.
 */
export function stepGuard(g, dt, ctx) {
  g.touchCooldown = Math.max(0, g.touchCooldown - dt);
  g.lastSeenAge += dt;
  if (ctx.thiefVisible) {
    g.lastSeen = { x: ctx.thiefX, y: ctx.thiefY };
    g.lastSeenAge = 0;
  }

  const distToThief = Math.hypot(ctx.thiefX - g.x, ctx.thiefY - g.y);
  if (distToThief < GUARD_TOUCH_RADIUS && g.touchCooldown <= 0 && (g.mode === 'chase' || g.mode === 'suspicious')) {
    g.touchCooldown = 1.5;
    ctx.onTouch(g);
  }

  if (ctx.alarm >= 70 && g.lastSeenAge < 4) {
    if (g.mode !== 'chase') g.mode = 'chase';
  } else if (g.mode === 'chase' && ctx.alarm < 55) {
    g.mode = 'patrol';
    g.waypoint = nearestWaypoint(g);
  }

  if (g.mode !== 'chase' && ctx.noise && g.heardNoise !== ctx.noise.id) {
    const d = Math.hypot(ctx.noise.x - g.x, ctx.noise.y - g.y);
    if (d < 300) {
      g.mode = 'investigate';
      g.investigate = { x: ctx.noise.x, y: ctx.noise.y };
      g.heardNoise = ctx.noise.id;
    }
  }

  if (g.mode === 'chase' && g.lastSeen) {
    moveToward(g, g.lastSeen.x, g.lastSeen.y, GUARD_CHASE_SPEED, dt, ctx.blockers);
    g.facing = turnToward(g.facing, Math.atan2(g.lastSeen.y - g.y, g.lastSeen.x - g.x), 6 * dt);
    if (ctx.thiefVisible) g.alerted = true;
    return;
  }

  if (g.mode === 'investigate' && g.investigate) {
    const arrived = moveToward(g, g.investigate.x, g.investigate.y, GUARD_PATROL_SPEED * 1.35, dt, ctx.blockers);
    g.facing = turnToward(g.facing, Math.atan2(g.investigate.y - g.y, g.investigate.x - g.x), 4 * dt);
    if (arrived) {
      g.lookTimer += dt;
      g.facing += Math.sin(ctx.time * 2.2 + g.scanPhase) * 1.4 * dt;
      if (g.lookTimer > 2.5) {
        g.lookTimer = 0;
        g.investigate = null;
        g.mode = 'patrol';
        g.waypoint = nearestWaypoint(g);
      }
    }
    return;
  }

  if (ctx.thiefVisible && g.mode === 'patrol') {
    g.mode = 'suspicious';
  }
  if (g.mode === 'suspicious') {
    if (!ctx.thiefVisible) {
      g.lookTimer += dt;
      if (g.lookTimer > 1.2) {
        g.lookTimer = 0;
        g.mode = 'patrol';
        g.waypoint = nearestWaypoint(g);
      }
    } else {
      g.lookTimer = 0;
      g.facing = turnToward(g.facing, Math.atan2(ctx.thiefY - g.y, ctx.thiefX - g.x), 5 * dt);
    }
    return;
  }

  // Patrol: walk the loop, pausing at each waypoint to scan the room.
  const target = g.path[g.waypoint];
  if (g.pauseTimer > 0) {
    g.pauseTimer -= dt;
    g.facing += Math.sin(ctx.time * 1.1 + g.scanPhase) * 0.9 * dt;
    return;
  }
  const arrived = moveToward(g, target[0], target[1], GUARD_PATROL_SPEED, dt, ctx.blockers);
  g.facing = turnToward(g.facing, Math.atan2(target[1] - g.y, target[0] - g.x), 3.5 * dt);
  if (arrived) {
    g.waypoint = (g.waypoint + 1) % g.path.length;
    g.pauseTimer = g.pause;
  }
}

function nearestWaypoint(g) {
  let best = 0;
  let bestDist = Infinity;
  for (let i = 0; i < g.path.length; i += 1) {
    const d = Math.hypot(g.path[i][0] - g.x, g.path[i][1] - g.y);
    if (d < bestDist) {
      bestDist = d;
      best = i;
    }
  }
  return best;
}

/**
 * Move toward a point with axis-separated collision. Returns true when the
 * mover arrives within a step of the point.
 */
export function moveToward(mover, tx, ty, speed, dt, blockers) {
  const dx = tx - mover.x;
  const dy = ty - mover.y;
  const dist = Math.hypot(dx, dy);
  if (dist < 4) return true;
  const step = Math.min(dist, speed * dt);
  const nx = mover.x + (dx / dist) * step;
  const ny = mover.y + (dy / dist) * step;
  if (!circleBlocked(nx, mover.y, mover.radius ?? 13, blockers)) mover.x = nx;
  if (!circleBlocked(mover.x, ny, mover.radius ?? 13, blockers)) mover.y = ny;
  return Math.hypot(tx - mover.x, ty - mover.y) < 6;
}

export function circleBlocked(cx, cy, radius, rects) {
  for (let i = 0; i < rects.length; i += 1) {
    const r = rects[i];
    const nearestX = Math.max(r.x, Math.min(cx, r.x + r.w));
    const nearestY = Math.max(r.y, Math.min(cy, r.y + r.h));
    if (Math.hypot(cx - nearestX, cy - nearestY) < radius) return true;
  }
  return false;
}
