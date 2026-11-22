// Synthesized sound: every cue is an oscillator through WebAudio, no audio
// files, nothing fetched. The context starts on the first gesture, and M
// (or the speaker key) mutes the whole board.
export function createAudio() {
  let context = null;
  let muted = false;

  function ensure() {
    if (!context) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return null;
      context = new AudioContext();
    }
    if (context.state === 'suspended') context.resume();
    return context;
  }

  function tone(freq, dur, type, gain, when = 0, slideTo = null) {
    if (muted) return;
    const ctx = ensure();
    if (!ctx) return;
    const start = ctx.currentTime + when;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, start + dur);
    amp.gain.setValueAtTime(0.0001, start);
    amp.gain.exponentialRampToValueAtTime(gain, start + 0.012);
    amp.gain.exponentialRampToValueAtTime(0.0001, start + dur);
    osc.connect(amp).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + dur + 0.05);
  }

  return {
    unlock() {
      ensure();
    },
    toggleMute() {
      muted = !muted;
      return muted;
    },
    get muted() {
      return muted;
    },
    click() {
      tone(660, 0.07, 'triangle', 0.08);
    },
    pickup() {
      tone(880, 0.09, 'sine', 0.1);
      tone(1320, 0.12, 'sine', 0.08, 0.07);
    },
    star() {
      tone(523, 0.12, 'triangle', 0.11);
      tone(659, 0.12, 'triangle', 0.11, 0.1);
      tone(784, 0.16, 'triangle', 0.11, 0.2);
      tone(1047, 0.24, 'triangle', 0.11, 0.3);
    },
    alarm() {
      tone(320, 0.22, 'sawtooth', 0.06, 0, 520);
      tone(520, 0.22, 'sawtooth', 0.06, 0.22, 320);
    },
    busted() {
      tone(392, 0.3, 'sawtooth', 0.09, 0, 196);
      tone(196, 0.5, 'sawtooth', 0.09, 0.28, 98);
    },
    win() {
      tone(523, 0.14, 'triangle', 0.11);
      tone(659, 0.14, 'triangle', 0.11, 0.12);
      tone(784, 0.14, 'triangle', 0.11, 0.24);
      tone(1047, 0.3, 'triangle', 0.12, 0.36);
    },
    noise() {
      tone(1900, 0.08, 'square', 0.05, 0, 900);
    },
    emp() {
      tone(1400, 0.3, 'sawtooth', 0.07, 0, 120);
    },
    touch() {
      tone(180, 0.16, 'square', 0.1, 0, 90);
    },
  };
}
