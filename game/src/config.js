// Tuning for The Amber Star: a top-down stealth heist in three gallery rooms.
// All distances are pixels in the 1280x720 world; all times are seconds.
export const VIEW_WIDTH = 1280;
export const VIEW_HEIGHT = 720;
export const WALL = 24;
export const STEP = 1 / 60;

export const THIEF_RADIUS = 14;
export const THIEF_WALK_SPEED = 158;
export const THIEF_SNEAK_SPEED = 86;
export const GUARD_PATROL_SPEED = 56;
export const GUARD_CHASE_SPEED = 108;
export const GUARD_TOUCH_RADIUS = 30;

export const GUARD_CONE_RANGE = 178;
export const GUARD_CONE_HALF_ANGLE = 0.62;
export const CAMERA_CONE_RANGE = 232;
export const CAMERA_CONE_HALF_ANGLE = 0.42;

// How fast the alarm meter (0..100) fills while the thief is fully seen.
export const ALARM_SEEN_RATE = 52;
export const ALARM_CAMERA_RATE = 74;
export const ALARM_DECAY_RATE = 7;
export const ALARM_CHASE_AT = 70;
export const ALARM_TOUCH_SPIKE = 40;
// A thief standing in a shadow, or sneaking, is much harder to spot.
export const SHADOW_VISIBILITY = 0.34;
export const SNEAK_VISIBILITY = 0.5;

export const COLORS = {
  floorA: '#2b2f3a',
  floorB: '#262a34',
  floorEdge: '#1d2029',
  wall: '#4a4238',
  wallTop: '#6b5f4e',
  wallEdge: '#2e2820',
  rug: '#5a2430',
  rugEdge: '#7d3547',
  gold: '#d9a441',
  goldDim: '#8a6a2c',
  caseGlass: 'rgba(150, 200, 230, 0.16)',
  caseEdge: '#c8b273',
  shadow: 'rgba(6, 8, 18, 0.55)',
  lamp: 'rgba(255, 214, 130, 0.10)',
  thief: '#e8e4da',
  thiefCloak: '#3d4a6b',
  guard: '#2e4a7a',
  guardCap: '#1d3157',
  coneGuard: 'rgba(255, 196, 66, 0.30)',
  coneGuardEdge: 'rgba(255, 196, 66, 0.65)',
  coneCamera: 'rgba(255, 84, 84, 0.26)',
  coneCameraEdge: 'rgba(255, 84, 84, 0.6)',
  coneOff: 'rgba(120, 120, 130, 0.07)',
  gem: '#ffb62e',
  coin: '#f2d06b',
  star: '#ffcf3d',
  exit: '#3fae6a',
  exitDark: '#245c3c',
  hud: 'rgba(10, 12, 20, 0.72)',
  hudText: '#f2ead8',
  alarmLow: '#58b368',
  alarmMid: '#e0a83c',
  alarmHigh: '#e04a3c',
};
