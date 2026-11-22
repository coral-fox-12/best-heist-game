// The three rooms of the Halcyon Gallery. Every rect is {x, y, w, h} in the
// 1280x720 world. walls block movement and sight; cases (display cabinets)
// block movement and sight; pedestals block movement only; shadows slow
// detection; rugs and frames are decoration; lamps are pools of warm light.
//
// Layout notes are written for the player reading the map: each room has at
// least two routes to the Amber Star, and a shadowed route for a quiet run.

export const LEVELS = [
  {
    name: 'East Wing',
    sub: 'The Halcyon Gallery after closing',
    par: 75,
    spawn: { x: 84, y: 648 },
    exit: { x: 1168, y: 606, w: 88, h: 90 },
    tools: { noise: 3, emp: 2 },
    walls: [
      { x: 24, y: 300, w: 500, h: 24 },
      { x: 644, y: 300, w: 196, h: 24 },
      { x: 880, y: 96, w: 24, h: 220 },
      { x: 880, y: 436, w: 24, h: 200 },
    ],
    cases: [
      { x: 300, y: 130, w: 130, h: 64 },
      { x: 980, y: 130, w: 130, h: 64 },
      { x: 300, y: 520, w: 140, h: 64 },
      { x: 940, y: 496, w: 120, h: 64 },
    ],
    pedestals: [{ x: 620, y: 150, w: 40, h: 40 }],
    shadows: [
      { x: 60, y: 400, w: 240, h: 140 },
      { x: 940, y: 60, w: 260, h: 110 },
      { x: 560, y: 420, w: 200, h: 100 },
    ],
    rugs: [
      { x: 360, y: 120, w: 360, h: 130 },
      { x: 360, y: 470, w: 360, h: 130 },
    ],
    frames: [
      { x: 200, y: 28, w: 92, h: 10 },
      { x: 480, y: 28, w: 92, h: 10 },
      { x: 760, y: 28, w: 92, h: 10 },
      { x: 28, y: 180, w: 10, h: 92 },
      { x: 28, y: 460, w: 10, h: 92 },
      { x: 1242, y: 180, w: 10, h: 92 },
    ],
    lamps: [
      { x: 640, y: 120, r: 150 },
      { x: 320, y: 480, r: 130 },
      { x: 1000, y: 480, r: 130 },
    ],
    guards: [
      { path: [[220, 110], [760, 110], [760, 250], [220, 250]], pause: 1.4 },
      { path: [[180, 620], [760, 620], [760, 400], [180, 400]], pause: 1.1 },
    ],
    cameras: [
      { x: 660, y: 40, center: Math.PI / 2, spread: 0.62, speed: 0.5 },
      { x: 1240, y: 380, center: Math.PI, spread: 0.5, speed: 0.42 },
    ],
    loot: [
      { x: 640, y: 170, kind: 'star' },
      { x: 140, y: 110, kind: 'coin' },
      { x: 1140, y: 110, kind: 'coin' },
      { x: 140, y: 610, kind: 'coin' },
      { x: 1140, y: 560, kind: 'coin' },
      { x: 520, y: 620, kind: 'gem' },
    ],
  },
  {
    name: 'The Vault Corridor',
    sub: 'Three chambers, one long night',
    par: 90,
    spawn: { x: 84, y: 648 },
    exit: { x: 1168, y: 606, w: 88, h: 90 },
    tools: { noise: 3, emp: 2 },
    walls: [
      { x: 400, y: 24, w: 24, h: 300 },
      { x: 400, y: 444, w: 24, h: 252 },
      { x: 840, y: 24, w: 24, h: 380 },
      { x: 840, y: 500, w: 24, h: 196 },
      { x: 424, y: 520, w: 180, h: 24 },
      { x: 724, y: 520, w: 116, h: 24 },
    ],
    cases: [
      { x: 140, y: 130, w: 130, h: 64 },
      { x: 560, y: 130, w: 130, h: 64 },
      { x: 980, y: 330, w: 130, h: 64 },
      { x: 560, y: 600, w: 130, h: 64 },
      { x: 140, y: 420, w: 110, h: 60 },
    ],
    pedestals: [{ x: 1040, y: 160, w: 40, h: 40 }],
    shadows: [
      { x: 60, y: 60, w: 200, h: 120 },
      { x: 460, y: 340, w: 180, h: 90 },
      { x: 900, y: 560, w: 220, h: 110 },
      { x: 1060, y: 60, w: 160, h: 100 },
    ],
    rugs: [
      { x: 120, y: 250, w: 200, h: 110 },
      { x: 940, y: 250, w: 200, h: 110 },
    ],
    frames: [
      { x: 200, y: 28, w: 92, h: 10 },
      { x: 600, y: 28, w: 92, h: 10 },
      { x: 1000, y: 28, w: 92, h: 10 },
      { x: 28, y: 300, w: 10, h: 92 },
      { x: 1242, y: 560, w: 10, h: 92 },
    ],
    lamps: [
      { x: 220, y: 300, r: 140 },
      { x: 640, y: 300, r: 150 },
      { x: 1060, y: 300, r: 140 },
    ],
    guards: [
      { path: [[120, 100], [320, 100], [320, 620], [120, 620]], pause: 1.2 },
      { path: [[500, 100], [760, 100], [760, 440], [500, 440]], pause: 1.5 },
      { path: [[920, 620], [1180, 620], [1180, 120], [920, 120]], pause: 1.0 },
    ],
    cameras: [
      { x: 412, y: 384, center: 0, spread: 0.55, speed: 0.5 },
      { x: 852, y: 440, center: Math.PI, spread: 0.55, speed: 0.45 },
      { x: 640, y: 40, center: Math.PI / 2, spread: 0.6, speed: 0.38 },
    ],
    loot: [
      { x: 1060, y: 180, kind: 'star' },
      { x: 220, y: 90, kind: 'coin' },
      { x: 640, y: 90, kind: 'coin' },
      { x: 300, y: 640, kind: 'coin' },
      { x: 700, y: 640, kind: 'coin' },
      { x: 1180, y: 300, kind: 'gem' },
      { x: 500, y: 300, kind: 'gem' },
    ],
  },
  {
    name: 'The Amber Vault',
    sub: 'The Star sleeps behind one locked door',
    par: 105,
    spawn: { x: 84, y: 84 },
    exit: { x: 60, y: 606, w: 88, h: 90 },
    tools: { noise: 4, emp: 3 },
    walls: [
      { x: 440, y: 220, w: 160, h: 24 },
      { x: 680, y: 220, w: 160, h: 24 },
      { x: 440, y: 476, w: 160, h: 24 },
      { x: 680, y: 476, w: 160, h: 24 },
      { x: 440, y: 244, w: 24, h: 232 },
      { x: 816, y: 244, w: 24, h: 232 },
    ],
    cases: [
      { x: 200, y: 130, w: 120, h: 60 },
      { x: 960, y: 130, w: 120, h: 60 },
      { x: 200, y: 530, w: 120, h: 60 },
      { x: 960, y: 530, w: 120, h: 60 },
      { x: 540, y: 300, w: 60, h: 50 },
      { x: 680, y: 380, w: 60, h: 50 },
    ],
    pedestals: [{ x: 620, y: 340, w: 40, h: 40 }],
    shadows: [
      { x: 60, y: 300, w: 180, h: 120 },
      { x: 1040, y: 300, w: 180, h: 120 },
      { x: 520, y: 60, w: 240, h: 90 },
    ],
    rugs: [
      { x: 540, y: 120, w: 200, h: 70 },
      { x: 540, y: 540, w: 200, h: 70 },
    ],
    frames: [
      { x: 200, y: 28, w: 92, h: 10 },
      { x: 480, y: 28, w: 92, h: 10 },
      { x: 760, y: 28, w: 92, h: 10 },
      { x: 1040, y: 28, w: 92, h: 10 },
      { x: 28, y: 300, w: 10, h: 92 },
      { x: 1242, y: 300, w: 10, h: 92 },
    ],
    lamps: [
      { x: 640, y: 360, r: 170 },
      { x: 260, y: 360, r: 130 },
      { x: 1020, y: 360, r: 130 },
    ],
    guards: [
      { path: [[120, 100], [1160, 100], [1160, 620], [120, 620]], pause: 1.0 },
      { path: [[360, 180], [360, 540], [920, 540], [920, 180]], pause: 1.3 },
      { path: [[500, 280], [780, 280], [780, 450], [500, 450]], pause: 1.6 },
      { path: [[640, 90], [640, 200], [360, 200], [360, 90]], pause: 1.2 },
    ],
    cameras: [
      { x: 640, y: 40, center: Math.PI / 2, spread: 0.5, speed: 0.5 },
      { x: 600, y: 236, center: Math.PI / 2, spread: 0.45, speed: 0.6 },
      { x: 1240, y: 360, center: Math.PI, spread: 0.5, speed: 0.4 },
    ],
    loot: [
      { x: 640, y: 360, kind: 'star' },
      { x: 140, y: 90, kind: 'coin' },
      { x: 1140, y: 90, kind: 'coin' },
      { x: 140, y: 610, kind: 'coin' },
      { x: 1140, y: 610, kind: 'coin' },
      { x: 640, y: 640, kind: 'gem' },
      { x: 300, y: 360, kind: 'gem' },
      { x: 980, y: 360, kind: 'gem' },
    ],
  },
];
