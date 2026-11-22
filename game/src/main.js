// Boot and the one loop: input is read every frame, the world advances in
// fixed 1/60 s steps, and the renderer paints what is there. The game moves
// between title, play, paused, room-clear, busted and getaway screens.
//
// ?seed=N fixes the patrol pauses. ?shot=cover|play|caught|title (with
// &seed=N) stages that scene instead of running the loop, paints it twice
// and sets window.__shotReady for a screenshot.
import { STEP } from './config.js';
import { createRandom } from './random.js';
import { createWorld, EVENT_ALARM, EVENT_BUSTED, EVENT_CLEAR, EVENT_EMP, EVENT_NOISE, EVENT_PICKUP, EVENT_STAR, EVENT_TOUCH, loadLevel, resetRun, stepWorld } from './world.js';
import { ACTION_CONFIRM, ACTION_MUTE, ACTION_PAUSE, createInput } from './input.js';
import { createAudio } from './audio.js';
import { SCREEN_BUSTED, SCREEN_CLEAR, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN, createRenderer } from './render.js';
import { stageShot } from './shots.js';

const BEST_KEY = 'amberStarBest';
const MAX_FRAME = 0.25;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const world = createWorld(createRandom(seed));
const renderer = createRenderer(canvas);
const audio = createAudio();

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off: the best score then lasts this visit only.
  }
}

function announce(message) {
  status.textContent = message;
}

function runShot(name) {
  const scene = stageShot(name, world);
  let painted = 0;
  function paint() {
    renderer.draw(world, scene.screen, scene.best, audio.muted, world.time);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  const input = createInput(canvas, (x, y) => ({ x, y }));
  let screen = SCREEN_TITLE;
  let best = readBest();
  let scoreAtLevelStart = 0;
  let accumulator = 0;
  let last = performance.now();
  let muted = false;

  function startRun() {
    resetRun(world);
    scoreAtLevelStart = 0;
    screen = SCREEN_PLAY;
    announce('Playing. Steal the Amber Star, then reach the green exit.');
  }

  function enterLevel(index) {
    scoreAtLevelStart = world.score;
    loadLevel(world, index);
    screen = SCREEN_PLAY;
  }

  function retryLevel() {
    world.score = scoreAtLevelStart;
    loadLevel(world, world.levelIndex);
    screen = SCREEN_PLAY;
    announce('Trying the room again.');
  }

  function playEvents(events) {
    if (events & EVENT_PICKUP) audio.pickup();
    if (events & EVENT_STAR) audio.star();
    if (events & EVENT_ALARM) audio.alarm();
    if (events & EVENT_NOISE) audio.noise();
    if (events & EVENT_EMP) audio.emp();
    if (events & EVENT_TOUCH) audio.touch();
    if (events & EVENT_BUSTED) {
      screen = SCREEN_BUSTED;
      audio.busted();
      announce('Busted. The alarm hit 100 percent.');
    }
    if (events & EVENT_CLEAR) {
      if (world.score > best) {
        best = world.score;
        saveBest(best);
      }
      if (world.levelIndex >= 2) {
        screen = SCREEN_WIN;
        audio.win();
        announce(`Clean getaway. Final score ${world.score}.`);
      } else {
        screen = SCREEN_CLEAR;
        audio.win();
        announce(`Room clear. Score ${world.score}.`);
      }
    }
  }

  function handleActions() {
    const actions = input.takeActions();
    if (actions & ACTION_MUTE) {
      muted = audio.toggleMute();
    }
    if (actions & ACTION_PAUSE && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Paused.');
      return;
    }
    if (actions & ACTION_PAUSE && screen === SCREEN_PAUSED) {
      screen = SCREEN_PLAY;
      announce('Playing.');
      return;
    }
    if (!(actions & ACTION_CONFIRM)) return;
    audio.unlock();
    audio.click();
    if (screen === SCREEN_TITLE) startRun();
    else if (screen === SCREEN_BUSTED) retryLevel();
    else if (screen === SCREEN_CLEAR) enterLevel(world.levelIndex + 1);
    else if (screen === SCREEN_WIN) {
      screen = SCREEN_TITLE;
      loadLevel(world, 0);
      announce('The Amber Star. Press Enter to start.');
    } else if (screen === SCREEN_PAUSED) {
      screen = SCREEN_PLAY;
      announce('Playing.');
    }
  }

  function handleClicks() {
    const point = input.clickPoint();
    if (!point) return;
    audio.unlock();
    if (screen === SCREEN_PLAY) {
      // A click during play throws a noisemaker at that spot.
      const snapshot = input.snapshot();
      snapshot.throwNoise = point;
      const events = stepWorld(world, snapshot);
      input.clearShots();
      playEvents(events);
    } else {
      audio.click();
      if (screen === SCREEN_TITLE) startRun();
      else if (screen === SCREEN_BUSTED) retryLevel();
      else if (screen === SCREEN_CLEAR) enterLevel(world.levelIndex + 1);
      else if (screen === SCREEN_WIN) {
        screen = SCREEN_TITLE;
        loadLevel(world, 0);
      } else if (screen === SCREEN_PAUSED) screen = SCREEN_PLAY;
    }
  }

  function step() {
    const snapshot = input.snapshot();
    const events = stepWorld(world, snapshot);
    input.clearShots();
    playEvents(events);
  }

  function frame(now) {
    requestAnimationFrame(frame);
    accumulator += Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    handleActions();
    handleClicks();
    if (screen === SCREEN_PLAY) {
      while (accumulator >= STEP) {
        step();
        accumulator -= STEP;
        if (screen !== SCREEN_PLAY) {
          accumulator = 0;
          break;
        }
      }
    } else {
      accumulator = 0;
    }
    renderer.draw(world, screen, best, muted, world.time);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Paused.');
    }
  });

  loadLevel(world, 0);
  announce('The Amber Star. Press Enter or click to start.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
