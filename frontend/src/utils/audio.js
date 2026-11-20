/**
 * audio.js
 * Synthesizes the authentic Pokémon Center "Your Pokémon have been fully healed!"
 * recovery fanfare sequence using Web Audio API with dual-voice retro Pulse harmony
 * and resolution chimes. Plays strictly once upon opening/loading the website.
 */

let audioCtx = null;
let hasPlayedThisSession = false;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  return audioCtx;
}

/**
 * Authentic Pokémon Center "Fully Healed!" recovery fanfare.
 * Includes:
 * 1. Pulse Voice 1 (Melody): G4 - G4 - G4 - C5 - E5 - G5
 * 2. Pulse Voice 2 (Harmony): E4 - E4 - E4 - G4 - C5 - E5
 * 3. Restored Twinkle Chimes: C6 & G6 sparkling bells on final note
 */
export function playPokemonCenterFullyHealedSound(volume = 0.25) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().then(() => synthesizeFanfare(ctx, volume)).catch(() => {});
    } else {
      synthesizeFanfare(ctx, volume);
    }
  } catch (err) {
    console.debug('Audio error:', err);
  }
}

function synthesizeFanfare(ctx, masterVol) {
  const now = ctx.currentTime + 0.05;

  // 1. Lead Melody Channel
  const leadNotes = [
    { freq: 392.00, time: 0.00, dur: 0.11 }, // G4
    { freq: 392.00, time: 0.13, dur: 0.11 }, // G4
    { freq: 392.00, time: 0.26, dur: 0.11 }, // G4
    { freq: 523.25, time: 0.39, dur: 0.12 }, // C5
    { freq: 659.25, time: 0.52, dur: 0.13 }, // E5
    { freq: 783.99, time: 0.67, dur: 0.65 }, // G5 (Hold & Resolution)
  ];

  // 2. Harmonizing Channel (Authentic Game Boy 2nd Pulse Channel)
  const harmonyNotes = [
    { freq: 329.63, time: 0.00, dur: 0.11 }, // E4
    { freq: 329.63, time: 0.13, dur: 0.11 }, // E4
    { freq: 329.63, time: 0.26, dur: 0.11 }, // E4
    { freq: 392.00, time: 0.39, dur: 0.12 }, // G4
    { freq: 523.25, time: 0.52, dur: 0.13 }, // C5
    { freq: 659.25, time: 0.67, dur: 0.65 }, // E5
  ];

  // 3. Sparkling "Restored" Bell Twinkles on resolution
  const twinkleNotes = [
    { freq: 1046.50, time: 0.67, dur: 0.45 }, // C6
    { freq: 1567.98, time: 0.72, dur: 0.40 }, // G6
  ];

  // Play Lead
  leadNotes.forEach(({ freq, time, dur }) => {
    playPulseTone(ctx, freq, now + time, dur, masterVol * 0.7, 'square', 3400);
  });

  // Play Counter-Harmony
  harmonyNotes.forEach(({ freq, time, dur }) => {
    playPulseTone(ctx, freq, now + time, dur, masterVol * 0.45, 'triangle', 2600);
  });

  // Play Resolution Twinkles
  twinkleNotes.forEach(({ freq, time, dur }) => {
    playPulseTone(ctx, freq, now + time, dur, masterVol * 0.22, 'sine', 5000);
  });
}

function playPulseTone(ctx, freq, start, duration, vol, type, filterCutoff) {
  const osc = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);

  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(filterCutoff, start);

  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.linearRampToValueAtTime(vol, start + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.start(start);
  osc.stop(start + duration + 0.05);
}

/**
 * Initializes startup sound ONLY when opening the website/app.
 * Avoids repeated re-triggering during in-app navigation.
 */
export function initPokecenterStartupSound() {
  if (hasPlayedThisSession) return;

  const tryPlay = () => {
    if (hasPlayedThisSession) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'running') {
      hasPlayedThisSession = true;
      playPokemonCenterFullyHealedSound();
      removeListeners();
    } else {
      ctx.resume().then(() => {
        if (ctx.state === 'running' && !hasPlayedThisSession) {
          hasPlayedThisSession = true;
          playPokemonCenterFullyHealedSound();
          removeListeners();
        }
      }).catch(() => {});
    }
  };

  const removeListeners = () => {
    window.removeEventListener('pointerdown', tryPlay);
    window.removeEventListener('click', tryPlay);
    window.removeEventListener('keydown', tryPlay);
  };

  // Attempt direct playback on startup
  tryPlay();

  // If browser blocks autoplay before user interaction, queue for the very first gesture
  if (!hasPlayedThisSession) {
    window.addEventListener('pointerdown', tryPlay, { once: true });
    window.addEventListener('click', tryPlay, { once: true });
    window.addEventListener('keydown', tryPlay, { once: true });
  }
}
