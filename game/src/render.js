// Every pixel of The Amber Star: the gallery floor, the walls and cases,
// the vision cones, the thief and the guards, the loot, the HUD and every
// screen. Nothing here loads a file; all art is drawn shapes.
import {
  CAMERA_CONE_HALF_ANGLE,
  CAMERA_CONE_RANGE,
  COLORS,
  GUARD_CONE_HALF_ANGLE,
  GUARD_CONE_RANGE,
  VIEW_HEIGHT,
  VIEW_WIDTH,
} from './config.js';
import { conePolygon, sightBlockers } from './guards.js';
import { lootCount, starTaken } from './world.js';

const TITLE_FONT = 'Georgia, "Times New Roman", serif';
const HUD_FONT = 'Verdana, Geneva, sans-serif';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_CLEAR = 'clear';
export const SCREEN_BUSTED = 'busted';
export const SCREEN_WIN = 'win';

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  const sightCache = new WeakMap();

  function sightFor(level) {
    if (!sightCache.has(level)) sightCache.set(level, sightBlockers(level));
    return sightCache.get(level);
  }

  function drawFloor(level, time) {
    const tile = 40;
    for (let y = 0; y < VIEW_HEIGHT; y += tile) {
      for (let x = 0; x < VIEW_WIDTH; x += tile) {
        ctx.fillStyle = ((x + y) / tile) % 2 === 0 ? COLORS.floorA : COLORS.floorB;
        ctx.fillRect(x, y, tile, tile);
      }
    }
    ctx.strokeStyle = COLORS.floorEdge;
    ctx.lineWidth = 1;
    for (let x = 0; x <= VIEW_WIDTH; x += tile) {
      ctx.beginPath();
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, VIEW_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y <= VIEW_HEIGHT; y += tile) {
      ctx.beginPath();
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(VIEW_WIDTH, y + 0.5);
      ctx.stroke();
    }
    for (const rug of level.rugs) {
      ctx.fillStyle = COLORS.rug;
      ctx.fillRect(rug.x, rug.y, rug.w, rug.h);
      ctx.strokeStyle = COLORS.rugEdge;
      ctx.lineWidth = 3;
      ctx.strokeRect(rug.x + 4, rug.y + 4, rug.w - 8, rug.h - 8);
      ctx.strokeStyle = 'rgba(217, 164, 65, 0.35)';
      ctx.lineWidth = 1;
      ctx.strokeRect(rug.x + 12, rug.y + 12, rug.w - 24, rug.h - 24);
    }
    for (const zone of level.shadows) {
      ctx.fillStyle = 'rgba(6, 8, 18, 0.38)';
      ctx.fillRect(zone.x, zone.y, zone.w, zone.h);
      const grad = ctx.createRadialGradient(
        zone.x + zone.w / 2, zone.y + zone.h / 2, 10,
        zone.x + zone.w / 2, zone.y + zone.h / 2, Math.max(zone.w, zone.h) * 0.62,
      );
      grad.addColorStop(0, 'rgba(4, 6, 14, 0.42)');
      grad.addColorStop(1, 'rgba(6, 8, 18, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(zone.x - 20, zone.y - 20, zone.w + 40, zone.h + 40);
    }
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const lamp of level.lamps) {
      const grad = ctx.createRadialGradient(lamp.x, lamp.y, 8, lamp.x, lamp.y, lamp.r);
      grad.addColorStop(0, COLORS.lamp);
      grad.addColorStop(1, 'rgba(255, 214, 130, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(lamp.x, lamp.y, lamp.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    void time;
  }

  function drawWalls(level) {
    const border = [
      { x: 0, y: 0, w: VIEW_WIDTH, h: 24 },
      { x: 0, y: VIEW_HEIGHT - 24, w: VIEW_WIDTH, h: 24 },
      { x: 0, y: 0, w: 24, h: VIEW_HEIGHT },
      { x: VIEW_WIDTH - 24, y: 0, w: 24, h: VIEW_HEIGHT },
    ];
    for (const wall of border.concat(level.walls)) {
      ctx.fillStyle = COLORS.wall;
      ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
      ctx.fillStyle = COLORS.wallTop;
      ctx.fillRect(wall.x, wall.y, wall.w, 4);
      ctx.strokeStyle = COLORS.wallEdge;
      ctx.lineWidth = 2;
      ctx.strokeRect(wall.x + 1, wall.y + 1, wall.w - 2, wall.h - 2);
    }
    for (const frame of level.frames) {
      ctx.fillStyle = COLORS.goldDim;
      ctx.fillRect(frame.x - 3, frame.y - 3, frame.w + 6, frame.h + 6);
      ctx.fillStyle = '#31404f';
      ctx.fillRect(frame.x, frame.y, frame.w, frame.h);
      ctx.strokeStyle = COLORS.gold;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(frame.x + 6, frame.y + frame.h - 6);
      ctx.quadraticCurveTo(frame.x + frame.w / 2, frame.y - 4, frame.x + frame.w - 6, frame.y + 6);
      ctx.stroke();
    }
    for (const box of level.cases) {
      ctx.fillStyle = COLORS.caseGlass;
      ctx.fillRect(box.x, box.y, box.w, box.h);
      ctx.strokeStyle = COLORS.caseEdge;
      ctx.lineWidth = 3;
      ctx.strokeRect(box.x + 1.5, box.y + 1.5, box.w - 3, box.h - 3);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(box.x + 10, box.y + box.h - 8);
      ctx.lineTo(box.x + box.w - 24, box.y + 8);
      ctx.stroke();
      ctx.fillStyle = 'rgba(217, 164, 65, 0.8)';
      ctx.beginPath();
      ctx.arc(box.x + box.w / 2, box.y + box.h / 2, 6, 0, Math.PI * 2);
      ctx.fill();
    }
    for (const ped of level.pedestals) {
      ctx.fillStyle = '#565b66';
      ctx.fillRect(ped.x, ped.y, ped.w, ped.h);
      ctx.fillStyle = '#7d838f';
      ctx.fillRect(ped.x, ped.y, ped.w, 6);
      ctx.strokeStyle = '#2c2f36';
      ctx.lineWidth = 2;
      ctx.strokeRect(ped.x + 1, ped.y + 1, ped.w - 2, ped.h - 2);
    }
  }

  function drawExit(world, time) {
    const exit = world.level.exit;
    const taken = starTaken(world);
    const pulse = 0.5 + 0.5 * Math.sin(time * 3);
    ctx.fillStyle = taken ? `rgba(63, 174, 106, ${0.28 + 0.14 * pulse})` : 'rgba(224, 168, 60, 0.18)';
    ctx.fillRect(exit.x, exit.y, exit.w, exit.h);
    ctx.strokeStyle = taken ? COLORS.exit : COLORS.alarmMid;
    ctx.lineWidth = 3;
    ctx.strokeRect(exit.x + 2, exit.y + 2, exit.w - 4, exit.h - 4);
    ctx.fillStyle = taken ? '#dff5e6' : '#f2e2b8';
    ctx.font = `bold 22px ${HUD_FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('EXIT', exit.x + exit.w / 2, exit.y + exit.h / 2 - 10);
    if (!taken) {
      ctx.font = `bold 13px ${HUD_FONT}`;
      ctx.fillText('LOCKED', exit.x + exit.w / 2, exit.y + exit.h / 2 + 14);
    } else {
      ctx.font = `bold 15px ${HUD_FONT}`;
      ctx.fillText('GO!', exit.x + exit.w / 2, exit.y + exit.h / 2 + 14);
    }
  }

  function drawGem(x, y, radius, time, sparkle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.shadowColor = COLORS.star;
    ctx.shadowBlur = 22;
    ctx.fillStyle = COLORS.star;
    ctx.beginPath();
    for (let i = 0; i < 10; i += 1) {
      const angle = -Math.PI / 2 + (i * Math.PI) / 5;
      const r = i % 2 === 0 ? radius : radius * 0.45;
      const px = Math.cos(angle) * r;
      const py = Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff3c4';
    ctx.beginPath();
    ctx.arc(-radius * 0.18, -radius * 0.2, radius * 0.22, 0, Math.PI * 2);
    ctx.fill();
    const tw = 0.5 + 0.5 * Math.sin(time * 2.4 + sparkle);
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.35 + 0.5 * tw})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-radius - 8, 0);
    ctx.lineTo(-radius + 6, 0);
    ctx.moveTo(0, -radius - 8);
    ctx.lineTo(0, -radius + 6);
    ctx.stroke();
    ctx.restore();
  }

  function drawLoot(world, time) {
    for (const item of world.loot) {
      if (item.taken) continue;
      const bob = Math.sin(time * 2 + item.sparkle) * 3;
      if (item.kind === 'star') {
        drawGem(item.x, item.y + bob, 20, time, item.sparkle);
      } else if (item.kind === 'gem') {
        ctx.save();
        ctx.translate(item.x, item.y + bob);
        ctx.shadowColor = '#7de3d0';
        ctx.shadowBlur = 14;
        ctx.fillStyle = '#4ecdb8';
        ctx.beginPath();
        ctx.moveTo(0, -12);
        ctx.lineTo(10, 0);
        ctx.lineTo(0, 12);
        ctx.lineTo(-10, 0);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255,255,255,0.75)';
        ctx.beginPath();
        ctx.moveTo(0, -12);
        ctx.lineTo(5, -2);
        ctx.lineTo(0, 2);
        ctx.lineTo(-5, -2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      } else {
        ctx.save();
        ctx.translate(item.x, item.y + bob);
        ctx.shadowColor = COLORS.coin;
        ctx.shadowBlur = 10;
        ctx.fillStyle = COLORS.coin;
        ctx.beginPath();
        ctx.arc(0, 0, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#9a7420';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  function drawCone(ox, oy, angle, range, halfAngle, rects, fill, edge, disabled) {
    const poly = conePolygon(ox, oy, angle, range, halfAngle, rects);
    const path = () => {
      ctx.beginPath();
      ctx.moveTo(poly[0].x, poly[0].y);
      for (let i = 1; i < poly.length; i += 1) ctx.lineTo(poly[i].x, poly[i].y);
      ctx.closePath();
    };
    if (!disabled) {
      // A flat wash first so the cone reads at a glance, then the gradient.
      ctx.fillStyle = fill;
      path();
      ctx.fill();
    }
    const grad = ctx.createRadialGradient(ox, oy, 8, ox, oy, range);
    grad.addColorStop(0, fill);
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = disabled ? COLORS.coneOff : grad;
    path();
    ctx.fill();
    if (!disabled) {
      ctx.strokeStyle = edge;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(poly[0].x, poly[0].y);
      ctx.lineTo(poly[1].x, poly[1].y);
      ctx.moveTo(poly[0].x, poly[0].y);
      ctx.lineTo(poly[poly.length - 1].x, poly[poly.length - 1].y);
      ctx.stroke();
    }
  }

  function drawGuard(g, time) {
    ctx.save();
    ctx.translate(g.x, g.y);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 10, 14, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.rotate(g.facing);
    ctx.fillStyle = COLORS.guard;
    ctx.beginPath();
    ctx.arc(0, 0, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = COLORS.guardCap;
    ctx.beginPath();
    ctx.arc(2, -2, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e8e4da';
    ctx.beginPath();
    ctx.arc(5, -1, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#10131c';
    ctx.beginPath();
    ctx.arc(6.5, -1, 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = COLORS.gold;
    ctx.fillRect(11, -2, 7, 4);
    ctx.restore();
    if (g.mode === 'suspicious') {
      drawMark(g.x, g.y - 28, '?', COLORS.gold, time);
    } else if (g.mode === 'chase') {
      drawMark(g.x, g.y - 28, '!', COLORS.alarmHigh, time);
    } else if (g.mode === 'investigate') {
      drawMark(g.x, g.y - 28, '?', '#9fc3e8', time);
    }
  }

  function drawMark(x, y, text, color, time) {
    const bob = Math.sin(time * 5) * 2;
    ctx.font = `bold 22px ${HUD_FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(10, 12, 20, 0.8)';
    ctx.beginPath();
    ctx.arc(x, y + bob, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = color;
    ctx.fillText(text, x, y + bob + 1);
  }

  function drawThief(t, time) {
    ctx.save();
    ctx.translate(t.x, t.y);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(0, 10, 14, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    const squash = t.sneaking ? 0.78 : 1;
    ctx.scale(1, squash);
    ctx.rotate(t.facing + Math.PI / 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 2;
    ctx.fillStyle = COLORS.thiefCloak;
    ctx.beginPath();
    ctx.moveTo(0, -16);
    ctx.quadraticCurveTo(13, -2, 10, 13);
    ctx.quadraticCurveTo(0, 17, -10, 13);
    ctx.quadraticCurveTo(-13, -2, 0, -16);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = COLORS.thief;
    ctx.beginPath();
    ctx.arc(0, -6, 6.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#10131c';
    ctx.beginPath();
    ctx.arc(0, -6, 6.5, Math.PI * 0.15, Math.PI * 0.85);
    ctx.fill();
    ctx.fillStyle = COLORS.gold;
    ctx.fillRect(-2, 10, 4, 5);
    ctx.restore();
    if (t.sneaking) {
      ctx.font = `bold 11px ${HUD_FONT}`;
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(232, 228, 218, 0.8)';
      ctx.fillText('SNEAKING', t.x, t.y - 26);
    }
  }

  function drawCamera(cam, rects) {
    drawCone(cam.x, cam.y, cam.angle, CAMERA_CONE_RANGE, CAMERA_CONE_HALF_ANGLE, rects,
      COLORS.coneCamera, COLORS.coneCameraEdge, cam.disabled > 0);
    ctx.save();
    ctx.translate(cam.x, cam.y);
    ctx.fillStyle = '#3a3f4a';
    ctx.fillRect(-8, -6, 16, 12);
    ctx.fillStyle = cam.disabled > 0 ? '#555' : '#e04a3c';
    ctx.beginPath();
    ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    if (cam.disabled > 0) {
      ctx.font = `bold 11px ${HUD_FONT}`;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#c8c8d0';
      ctx.fillText('OFFLINE', cam.x, cam.y - 14);
    }
  }

  function drawHud(world, screen, best, muted) {
    const level = world.level;
    ctx.fillStyle = COLORS.hud;
    ctx.fillRect(0, 0, VIEW_WIDTH, 54);
    ctx.fillStyle = COLORS.hudText;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.font = `bold 18px ${HUD_FONT}`;
    ctx.fillText(`${world.levelIndex + 1}. ${level.name}`, 18, 20);
    ctx.font = `15px ${HUD_FONT}`;
    ctx.fillStyle = '#c9bfa5';
    ctx.fillText(level.sub, 18, 40);
    // Alarm meter, dead centre, impossible to miss.
    const meterW = 380;
    const meterX = VIEW_WIDTH / 2 - meterW / 2;
    const meterY = 16;
    ctx.font = `bold 15px ${HUD_FONT}`;
    ctx.textAlign = 'right';
    ctx.fillStyle = COLORS.hudText;
    ctx.fillText('ALARM', meterX - 10, meterY + 10);
    ctx.fillStyle = '#1a1d27';
    ctx.fillRect(meterX, meterY, meterW, 20);
    const frac = world.alarm / 100;
    const alarmColor = world.alarm >= 70 ? COLORS.alarmHigh : world.alarm >= 40 ? COLORS.alarmMid : COLORS.alarmLow;
    ctx.fillStyle = alarmColor;
    ctx.fillRect(meterX + 2, meterY + 2, (meterW - 4) * frac, 16);
    ctx.strokeStyle = '#f2ead8';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(meterX, meterY, meterW, 20);
    ctx.fillStyle = '#f2ead8';
    ctx.font = `bold 13px ${HUD_FONT}`;
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.round(world.alarm)}%`, meterX + meterW / 2, meterY + 11);
    // Right side: loot, score, time, tools.
    ctx.textAlign = 'right';
    ctx.font = `bold 17px ${HUD_FONT}`;
    ctx.fillStyle = COLORS.star;
    ctx.fillText(`◆ ${lootCount(world)}/${world.loot.length}`, VIEW_WIDTH - 300, 20);
    ctx.fillStyle = COLORS.hudText;
    ctx.fillText(`SCORE ${world.score}`, VIEW_WIDTH - 180, 20);
    const mins = Math.floor(world.time / 60);
    const secs = Math.floor(world.time % 60);
    ctx.fillText(`${mins}:${String(secs).padStart(2, '0')}`, VIEW_WIDTH - 18, 20);
    ctx.font = `14px ${HUD_FONT}`;
    ctx.fillStyle = '#c9bfa5';
    ctx.fillText(`NOISE ×${world.noiseCount} (Q / click)   EMP ×${world.empCount} (E)${muted ? '   MUTED (M)' : ''}`, VIEW_WIDTH - 18, 40);
    // Objective hint along the bottom.
    if (screen === SCREEN_PLAY && world.hint) {
      ctx.font = `16px ${HUD_FONT}`;
      ctx.textAlign = 'center';
      const tw = ctx.measureText(world.hint).width + 28;
      ctx.fillStyle = 'rgba(10, 12, 20, 0.66)';
      ctx.fillRect(VIEW_WIDTH / 2 - tw / 2, VIEW_HEIGHT - 36, tw, 26);
      ctx.fillStyle = '#e8dfc8';
      ctx.fillText(world.hint, VIEW_WIDTH / 2, VIEW_HEIGHT - 22);
    }
    void best;
  }

  function drawVignette(alarm) {
    const grad = ctx.createRadialGradient(
      VIEW_WIDTH / 2, VIEW_HEIGHT / 2, VIEW_HEIGHT * 0.42,
      VIEW_WIDTH / 2, VIEW_HEIGHT / 2, VIEW_HEIGHT * 0.85,
    );
    grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0.45)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
    if (alarm > 50) {
      const strength = (alarm - 50) / 50;
      ctx.strokeStyle = `rgba(224, 74, 60, ${0.25 + 0.45 * strength})`;
      ctx.lineWidth = 10;
      ctx.strokeRect(5, 5, VIEW_WIDTH - 10, VIEW_HEIGHT - 10);
    }
  }

  function panel(x, y, w, h) {
    ctx.fillStyle = 'rgba(8, 10, 18, 0.88)';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = COLORS.gold;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);
  }

  function drawTitle(world, best) {
    ctx.fillStyle = 'rgba(5, 6, 12, 0.62)';
    ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
    ctx.textAlign = 'center';
    ctx.fillStyle = COLORS.gold;
    ctx.font = `bold 64px ${TITLE_FONT}`;
    ctx.fillText('THE AMBER STAR', VIEW_WIDTH / 2, 150);
    ctx.fillStyle = '#e8dfc8';
    ctx.font = `italic 24px ${TITLE_FONT}`;
    ctx.fillText('a quiet heist at the Halcyon Gallery', VIEW_WIDTH / 2, 192);
    panel(VIEW_WIDTH / 2 - 330, 232, 660, 272);
    ctx.fillStyle = COLORS.hudText;
    ctx.font = `19px ${HUD_FONT}`;
    ctx.textAlign = 'left';
    const lines = [
      'Steal the Amber Star from each of the 3 rooms, then slip out the green exit.',
      'Guards patrol with cones of sight — cameras sweep them too. Being seen',
      'fills the ALARM meter. At 100% the night is over.',
      '',
      'WASD / arrows — move        Shift — sneak (slower, harder to spot)',
      'Q or click — throw a noisemaker to pull a guard away',
      'E — EMP burst: blinds every camera for 6 seconds',
      'Dark floor patches hide you. Cases and walls block every cone.',
      'P — pause        M — mute',
    ];
    lines.forEach((line, i) => {
      ctx.fillText(line, VIEW_WIDTH / 2 - 300, 266 + i * 25);
    });
    ctx.textAlign = 'center';
    ctx.font = `bold 22px ${HUD_FONT}`;
    ctx.fillStyle = COLORS.star;
    ctx.fillText('CLICK OR PRESS ENTER TO START', VIEW_WIDTH / 2, 542);
    ctx.font = `16px ${HUD_FONT}`;
    ctx.fillStyle = '#c9bfa5';
    ctx.fillText(`Best getaway score: ${best}`, VIEW_WIDTH / 2, 578);
    ctx.fillText('An original game. No network, no accounts — it plays from its own files.', VIEW_WIDTH / 2, 614);
  }

  function drawPaused() {
    ctx.fillStyle = 'rgba(5, 6, 12, 0.6)';
    ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
    panel(VIEW_WIDTH / 2 - 230, VIEW_HEIGHT / 2 - 90, 460, 180);
    ctx.textAlign = 'center';
    ctx.fillStyle = COLORS.hudText;
    ctx.font = `bold 40px ${TITLE_FONT}`;
    ctx.fillText('PAUSED', VIEW_WIDTH / 2, VIEW_HEIGHT / 2 - 30);
    ctx.font = `18px ${HUD_FONT}`;
    ctx.fillText('Press P or Enter to keep sneaking.', VIEW_WIDTH / 2, VIEW_HEIGHT / 2 + 22);
  }

  function drawBusted(world) {
    ctx.fillStyle = 'rgba(60, 8, 8, 0.55)';
    ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
    panel(VIEW_WIDTH / 2 - 280, VIEW_HEIGHT / 2 - 110, 560, 220);
    ctx.textAlign = 'center';
    ctx.fillStyle = COLORS.alarmHigh;
    ctx.font = `bold 52px ${TITLE_FONT}`;
    ctx.fillText('BUSTED', VIEW_WIDTH / 2, VIEW_HEIGHT / 2 - 40);
    ctx.fillStyle = COLORS.hudText;
    ctx.font = `19px ${HUD_FONT}`;
    ctx.fillText('The alarm hit 100% — the guards walk you out.', VIEW_WIDTH / 2, VIEW_HEIGHT / 2 + 8);
    ctx.fillText(`Room ${world.levelIndex + 1} keeps its loot. Score so far: ${world.score}`, VIEW_WIDTH / 2, VIEW_HEIGHT / 2 + 38);
    ctx.fillStyle = COLORS.star;
    ctx.font = `bold 20px ${HUD_FONT}`;
    ctx.fillText('PRESS ENTER TO TRY THE ROOM AGAIN', VIEW_WIDTH / 2, VIEW_HEIGHT / 2 + 76);
  }

  function drawClear(world) {
    ctx.fillStyle = 'rgba(5, 10, 6, 0.55)';
    ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
    panel(VIEW_WIDTH / 2 - 280, VIEW_HEIGHT / 2 - 130, 560, 260);
    ctx.textAlign = 'center';
    ctx.fillStyle = COLORS.exit;
    ctx.font = `bold 44px ${TITLE_FONT}`;
    ctx.fillText('ROOM CLEAR', VIEW_WIDTH / 2, VIEW_HEIGHT / 2 - 66);
    ctx.fillStyle = COLORS.hudText;
    ctx.font = `19px ${HUD_FONT}`;
    const mins = Math.floor(world.time / 60);
    const secs = Math.floor(world.time % 60);
    ctx.fillText(`Out in ${mins}:${String(secs).padStart(2, '0')} — peak alarm ${Math.round(world.peakAlarm)}%`, VIEW_WIDTH / 2, VIEW_HEIGHT / 2 - 18);
    ctx.fillText(`Time bonus + ghost bonus: +${world.clearBonus}`, VIEW_WIDTH / 2, VIEW_HEIGHT / 2 + 14);
    if (world.ghostBonus) {
      ctx.fillStyle = COLORS.star;
      ctx.fillText('GHOST — never raised above half alarm', VIEW_WIDTH / 2, VIEW_HEIGHT / 2 + 44);
    }
    ctx.fillStyle = COLORS.hudText;
    ctx.fillText(`Score: ${world.score}`, VIEW_WIDTH / 2, VIEW_HEIGHT / 2 + 74);
    ctx.fillStyle = COLORS.star;
    ctx.font = `bold 20px ${HUD_FONT}`;
    ctx.fillText('PRESS ENTER FOR THE NEXT ROOM', VIEW_WIDTH / 2, VIEW_HEIGHT / 2 + 106);
  }

  function drawWin(world, best) {
    ctx.fillStyle = 'rgba(5, 6, 12, 0.66)';
    ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
    ctx.textAlign = 'center';
    ctx.fillStyle = COLORS.gold;
    ctx.font = `bold 58px ${TITLE_FONT}`;
    ctx.fillText('CLEAN GETAWAY', VIEW_WIDTH / 2, 170);
    ctx.fillStyle = '#e8dfc8';
    ctx.font = `italic 24px ${TITLE_FONT}`;
    ctx.fillText('The Amber Star is gone before dawn. The gallery never knew.', VIEW_WIDTH / 2, 214);
    panel(VIEW_WIDTH / 2 - 280, 260, 560, 170);
    ctx.fillStyle = COLORS.hudText;
    ctx.font = `22px ${HUD_FONT}`;
    ctx.fillText(`Final score: ${world.score}`, VIEW_WIDTH / 2, 316);
    ctx.fillText(`Best getaway score: ${Math.max(best, world.score)}`, VIEW_WIDTH / 2, 352);
    const rating = world.score >= 4200 ? 'LEGEND OF THE GALLERY' : world.score >= 3200 ? 'MASTER THIEF' : world.score >= 2400 ? 'SMOOTH OPERATOR' : 'LUCKY AMATEUR';
    ctx.fillStyle = COLORS.star;
    ctx.font = `bold 22px ${HUD_FONT}`;
    ctx.fillText(rating, VIEW_WIDTH / 2, 392);
    ctx.fillStyle = COLORS.star;
    ctx.font = `bold 20px ${HUD_FONT}`;
    ctx.fillText('PRESS ENTER TO STEAL IT ALL AGAIN', VIEW_WIDTH / 2, 486);
  }

  function drawWorld(world, time) {
    const level = world.level;
    const rects = sightFor(level);
    drawFloor(level, time);
    drawExit(world, time);
    drawWalls(level);
    drawLoot(world, time);
    for (const cam of world.cameras) drawCamera(cam, rects);
    for (const g of world.guards) {
      drawCone(g.x, g.y, g.facing, GUARD_CONE_RANGE, GUARD_CONE_HALF_ANGLE, rects,
        COLORS.coneGuard, COLORS.coneGuardEdge, false);
    }
    for (const g of world.guards) drawGuard(g, time);
    drawThief(world.thief, time);
    if (world.noisePulse) {
      const age = world.noisePulse.age;
      ctx.strokeStyle = `rgba(242, 208, 107, ${1 - age / 0.9})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(world.noisePulse.x, world.noisePulse.y, 12 + age * 90, 0, Math.PI * 2);
      ctx.stroke();
    }
    drawVignette(world.alarm);
  }

  return {
    draw(world, screen, best, muted, time) {
      ctx.clearRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
      drawWorld(world, time);
      if (screen === SCREEN_TITLE) {
        drawTitle(world, best);
        return;
      }
      drawHud(world, screen, best, muted);
      if (screen === SCREEN_PAUSED) drawPaused();
      else if (screen === SCREEN_BUSTED) drawBusted(world);
      else if (screen === SCREEN_CLEAR) drawClear(world);
      else if (screen === SCREEN_WIN) drawWin(world, best);
    },
  };
}
