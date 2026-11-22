// Keyboard and mouse: WASD or arrows to move, Shift to sneak, Q or a click
// to throw a noisemaker, E for the EMP burst, Enter or Space to confirm,
// P or Escape to pause, M to mute. The game reads a fresh snapshot each
// frame and clears one-shot actions after the world consumes them.
export const ACTION_CONFIRM = 1;
export const ACTION_PAUSE = 2;
export const ACTION_MUTE = 4;

const MOVE_KEYS = {
  KeyW: 'up',
  ArrowUp: 'up',
  KeyS: 'down',
  ArrowDown: 'down',
  KeyA: 'left',
  ArrowLeft: 'left',
  KeyD: 'right',
  ArrowRight: 'right',
};

export function createInput(canvas, toWorld) {
  const keys = new Set();
  let actions = 0;
  let throwNoise = null;
  let emp = false;
  let mouse = { x: 0, y: 0, clicked: false };

  function updateMouse(event) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * canvas.width;
    mouse.y = ((event.clientY - rect.top) / rect.height) * canvas.height;
  }

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    keys.add(event.code);
    if (event.code === 'Enter' || event.code === 'Space') {
      actions |= ACTION_CONFIRM;
      event.preventDefault();
    }
    if (event.code === 'KeyP' || event.code === 'Escape') actions |= ACTION_PAUSE;
    if (event.code === 'KeyM') actions |= ACTION_MUTE;
    if (event.code === 'KeyQ') {
      const point = toWorld(mouse.x, mouse.y);
      throwNoise = point;
    }
    if (event.code === 'KeyE') emp = true;
    if (MOVE_KEYS[event.code] || event.code === 'ShiftLeft' || event.code === 'ShiftRight') {
      event.preventDefault();
    }
  });
  window.addEventListener('keyup', (event) => {
    keys.delete(event.code);
  });
  window.addEventListener('blur', () => keys.clear());
  canvas.addEventListener('mousemove', updateMouse);
  canvas.addEventListener('click', (event) => {
    updateMouse(event);
    mouse.clicked = true;
  });
  canvas.addEventListener('contextmenu', (event) => event.preventDefault());

  function direction() {
    let dx = 0;
    let dy = 0;
    if (keys.has('KeyA') || keys.has('ArrowLeft')) dx -= 1;
    if (keys.has('KeyD') || keys.has('ArrowRight')) dx += 1;
    if (keys.has('KeyW') || keys.has('ArrowUp')) dy -= 1;
    if (keys.has('KeyS') || keys.has('ArrowDown')) dy += 1;
    return { dx, dy };
  }

  return {
    snapshot() {
      const dir = direction();
      return {
        dx: dir.dx,
        dy: dir.dy,
        sneak: keys.has('ShiftLeft') || keys.has('ShiftRight') || keys.has('KeyC'),
        throwNoise,
        emp,
        mouse: { ...mouse },
      };
    },
    clearShots() {
      throwNoise = null;
      emp = false;
      mouse.clicked = false;
    },
    takeActions() {
      const taken = actions;
      actions = 0;
      return taken;
    },
    clickPoint() {
      if (!mouse.clicked) return null;
      mouse.clicked = false;
      return toWorld(mouse.x, mouse.y);
    },
    mousePosition() {
      return { ...mouse };
    },
  };
}
