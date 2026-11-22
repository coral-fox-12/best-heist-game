// The staged scenes behind ?shot=cover|play|caught|title. Each one plays the
// real rules forward from a fresh room with a scripted thief — a fixed walk,
// then a wait in a guard's cone — so the frame is what a short game really
// looks like, and the same seed always stages the same frame.
import { STEP } from './config.js';
import { loadLevel, stepWorld } from './world.js';
import { SCREEN_BUSTED, SCREEN_PLAY, SCREEN_TITLE } from './render.js';

function walk(world, dx, dy, seconds, sneak = false) {
  const steps = Math.round(seconds / STEP);
  for (let i = 0; i < steps; i += 1) {
    if (world.status !== 'playing') return;
    stepWorld(world, { dx, dy, sneak, throwNoise: null, emp: false });
  }
}

function waitFor(world, seconds, test) {
  const steps = Math.round(seconds / STEP);
  for (let i = 0; i < steps; i += 1) {
    if (world.status !== 'playing' || (test && test(world))) return;
    stepWorld(world, { dx: 0, dy: 0, sneak: false, throwNoise: null, emp: false });
  }
}

// Level 1: cross the east wing, slip through the door gap, and hold just
// below the Amber Star while a patrol cone and the ceiling camera sweep
// over the thief.
function stageCover(world) {
  loadLevel(world, 0);
  walk(world, 0, -1, 1.35); // up the left wall into the shadow
  walk(world, 1, 0, 2.5); // across the lower room
  walk(world, 1, 0, 0.7); // line up with the door gap
  walk(world, 0, -1, 1.3); // up through the gap into the top room
  walk(world, 1, 0, 0.45, true); // sneak right, below the Star
  waitFor(world, 8, (w) => w.alarm >= 34);
  return { screen: SCREEN_PLAY, best: 0 };
}

// Level 2: through the middle chamber's shadow, with a sweeping camera and
// two patrols in frame.
function stagePlay(world) {
  loadLevel(world, 1);
  walk(world, 0, -1, 1.7); // clear of the corner case
  walk(world, 1, 0, 2.2); // through the first wall gap
  walk(world, 0, -1, 0.6, true);
  walk(world, 1, 0, 1.3, true);
  walk(world, 0, 1, 0.5, true); // settle into the shadow
  waitFor(world, 3.5, (w) => w.alarm >= 22);
  return { screen: SCREEN_PLAY, best: 0 };
}

// Level 1 again: stand under the ceiling camera until the alarm is nearly
// full, then break away with the patrol already closing in.
function stageCaught(world) {
  loadLevel(world, 0);
  walk(world, 0, -1, 1.35);
  walk(world, 1, 0, 2.5);
  walk(world, 1, 0, 0.7);
  walk(world, 0, -1, 1.3);
  walk(world, 1, 0, 0.45, true); // under the camera, below the Star
  waitFor(world, 9, (w) => w.alarm >= 66);
  if (world.status === 'playing') walk(world, -1, 0, 0.9);
  return { screen: world.status === 'playing' ? SCREEN_PLAY : SCREEN_BUSTED, best: 0 };
}

export function stageShot(name, world) {
  if (name === 'play') return stagePlay(world);
  if (name === 'caught') return stageCaught(world);
  if (name === 'title') {
    loadLevel(world, 0);
    return { screen: SCREEN_TITLE, best: 1250 };
  }
  return stageCover(world);
}
