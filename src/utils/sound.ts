// Centralized Audio Manager for Choo-Choo Khitan Adventure

let audioCtx: AudioContext | null = null;
let melodyTimer: number | null = null;
let isMelodyActive = false;
let backgroundAudio: HTMLAudioElement | null = null;

let currentMusicUrl = '/lagu-undangan.mp3';
let isMusicActive = false;
const musicListeners = new Set<(active: boolean) => void>();

function notifyMusicListeners(active: boolean): void {
  isMusicActive = active;
  musicListeners.forEach((fn) => {
    try {
      fn(active);
    } catch {
      // Ignore listener errors
    }
  });
}

export function subscribeMusicState(fn: (active: boolean) => void): () => void {
  musicListeners.add(fn);
  fn(isMusicActive);
  return () => {
    musicListeners.delete(fn);
  };
}

export function isBackgroundMusicActive(): boolean {
  if (backgroundAudio) {
    return !backgroundAudio.paused && isMusicActive;
  }
  return isMusicActive || isMelodyActive;
}

export function setBackgroundMusicUrl(url: string | null | undefined): void {
  if (!url) return;
  if (currentMusicUrl === url) return;
  currentMusicUrl = url;

  if (backgroundAudio) {
    const wasPlaying = !backgroundAudio.paused;
    backgroundAudio.pause();
    backgroundAudio.src = currentMusicUrl;
    backgroundAudio.load();
    if (wasPlaying) {
      void backgroundAudio.play().catch(() => {});
    }
  }
}

export function getBackgroundMusicUrl(): string {
  return currentMusicUrl;
}

export function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) {
    audioCtx = new Ctx();
  }
  if (audioCtx.state === 'suspended') {
    void audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Creates a buffer of white noise for pressurized steam hiss effect.
 */
function createNoiseBuffer(ctx: AudioContext, seconds: number): AudioBuffer {
  const bufferSize = ctx.sampleRate * seconds;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

/**
 * Plays a realistic, long steam locomotive train whistle ("TOOOOOOT... TOOOOOT!").
 * Used specifically for the opening sequence when the guest clicks "BUKA UNDANGAN".
 * Duration: ~2.8 seconds.
 */
export function playLongTrainWhistle(): number {
  const ctx = getAudioContext();
  if (!ctx) return 0;

  const now = ctx.currentTime;
  // Authentic American/British 3-chime steam locomotive whistle chord:
  // D5 (587.33), F#5 (739.99), A5 (880.00), with a warm lower sub-fifth and slight detune
  const whistleNotes = [
    { freq: 587.33, gain: 0.08, type: 'triangle' as OscillatorType, detune: -4 },
    { freq: 587.33, gain: 0.06, type: 'sine' as OscillatorType, detune: 2 },
    { freq: 739.99, gain: 0.07, type: 'triangle' as OscillatorType, detune: 3 },
    { freq: 739.99, gain: 0.05, type: 'sine' as OscillatorType, detune: -2 },
    { freq: 880.0, gain: 0.06, type: 'triangle' as OscillatorType, detune: 5 },
    { freq: 880.0, gain: 0.04, type: 'sine' as OscillatorType, detune: -3 },
    { freq: 1174.66, gain: 0.025, type: 'sine' as OscillatorType, detune: 4 }, // Octave harmonic shimmer
  ];

  // Steam valve timing:
  // Blast 1: Long majestic blast from 0.0s to 1.45s
  // Gap: 0.12s
  // Blast 2: Energetic second blast from 1.57s to 2.55s with reverb decay to 2.85s
  const scheduleBlast = (startTime: number, blastDuration: number, isFinal: boolean) => {
    // 1. Steam Whistle Chime Oscillators
    whistleNotes.forEach(({ freq, gain: peakGain, type, detune }) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      // Flutter LFO (creates realistic turbulent steam pressure tremor ~5.5Hz)
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(5.8, startTime);
      lfoGain.gain.setValueAtTime(4.2, startTime); // ±4 Hz flutter
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start(startTime);
      lfo.stop(startTime + blastDuration + 0.3);

      osc.type = type;
      osc.detune.setValueAtTime(detune, startTime);

      // Pitch valve rise: initial rush starts slightly sharp then settles
      osc.frequency.setValueAtTime(freq * 1.018, startTime);
      osc.frequency.exponentialRampToValueAtTime(freq, startTime + 0.06);

      // Amplitude envelope
      gainNode.gain.setValueAtTime(0.0001, startTime);
      // Quick organic swell (attack)
      gainNode.gain.exponentialRampToValueAtTime(peakGain, startTime + 0.07);
      // Slight swell mid-blast
      gainNode.gain.setValueAtTime(peakGain, startTime + blastDuration - 0.1);
      // Decay / release
      const releaseTime = isFinal ? 0.35 : 0.12;
      gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + blastDuration + releaseTime);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + blastDuration + releaseTime + 0.05);
    });

    // 2. High-Pressure Pressurized Steam Hiss (Air rush noise)
    try {
      const noiseBuffer = createNoiseBuffer(ctx, blastDuration + 0.3);
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      // Bandpass filter to sculpt the steam acoustic frequency (1.8 kHz - 3.2 kHz)
      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(2400, startTime);
      bandpass.Q.setValueAtTime(1.8, startTime);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.0001, startTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.038, startTime + 0.05);
      noiseGain.gain.setValueAtTime(0.032, startTime + blastDuration - 0.08);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, startTime + blastDuration + 0.2);

      noiseSource.connect(bandpass);
      bandpass.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      noiseSource.start(startTime);
      noiseSource.stop(startTime + blastDuration + 0.25);
    } catch {
      // Fallback if buffer creation fails
    }
  };

  // Execute two-blast long whistle sequence:
  // Blast 1: 1.45s
  scheduleBlast(now, 1.45, false);
  // Blast 2: 1.0s (starting at now + 1.58s)
  scheduleBlast(now + 1.58, 0.95, true);

  return 2.85; // Total duration in seconds
}

/**
 * Plays a short, cheerful two-tone steam train whistle ("Toot-Toot!").
 * Used for the interactive button on the boarding pass ticket.
 */
export function playTrainWhistle(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const playChime = (start: number, duration: number) => {
    const freqs = [523.25, 659.25, 783.99]; // C5 - E5 - G5 warm brass chord
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = idx === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq * 0.98, start);
      osc.frequency.exponentialRampToValueAtTime(freq, start + 0.04);

      gain.gain.setValueAtTime(0.001, start);
      gain.gain.exponentialRampToValueAtTime(0.055 / (idx + 1), start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + duration + 0.02);
    });
  };

  playChime(now, 0.18);
  playChime(now + 0.23, 0.34);
}

/**
 * Smoothly starts background music with gentle fade-in.
 * Ensures it doesn't clash with whistle sound effect.
 */
export function startBackgroundMusic(customUrl?: string, fadeDurationMs = 1200): boolean {
  if (customUrl) {
    setBackgroundMusicUrl(customUrl);
  }

  // Ensure AudioContext is resumed
  getAudioContext();

  if (!backgroundAudio) {
    const mp3Audio = new Audio(currentMusicUrl);
    mp3Audio.loop = true;
    mp3Audio.preload = 'auto';
    backgroundAudio = mp3Audio;
  }

  backgroundAudio.volume = 0.05;

  const playPromise = backgroundAudio.play();
  if (playPromise !== undefined) {
    playPromise
      .then(() => {
        notifyMusicListeners(true);
        // Smooth volume ramp up to 0.45
        if (backgroundAudio) {
          const startTime = performance.now();
          const targetVol = 0.45;
          const initialVol = 0.05;

          const fadeInterval = window.setInterval(() => {
            if (!backgroundAudio || backgroundAudio.paused) {
              window.clearInterval(fadeInterval);
              return;
            }
            const elapsed = performance.now() - startTime;
            const progress = Math.min(elapsed / fadeDurationMs, 1);
            backgroundAudio.volume = initialVol + (targetVol - initialVol) * progress;
            if (progress >= 1) {
              window.clearInterval(fadeInterval);
            }
          }, 40);
        }
      })
      .catch(() => {
        // Autoplay may be restricted by browser until user gesture
        notifyMusicListeners(false);
      });
    return true;
  }

  return false;
}

/**
 * Pauses background music without resetting time.
 */
export function pauseBackgroundMusic(): void {
  if (backgroundAudio) {
    backgroundAudio.pause();
  }
  if (melodyTimer !== null) {
    window.clearInterval(melodyTimer);
    melodyTimer = null;
  }
  isMelodyActive = false;
  notifyMusicListeners(false);
}

/**
 * Starts or stops celebratory background music (Thomas theme MP3 with synth fallback).
 */
export function toggleBackgroundMusic(shouldPlay?: boolean, customUrl?: string): boolean {
  if (customUrl) {
    setBackgroundMusicUrl(customUrl);
  }

  const nextState = shouldPlay !== undefined ? shouldPlay : !isBackgroundMusicActive();

  if (!nextState) {
    pauseBackgroundMusic();
    return false;
  }

  // Resume or start MP3 audio
  if (backgroundAudio) {
    backgroundAudio.volume = 0.45;
    backgroundAudio.loop = true;
    backgroundAudio
      .play()
      .then(() => {
        notifyMusicListeners(true);
        if (melodyTimer !== null) {
          window.clearInterval(melodyTimer);
          melodyTimer = null;
        }
        isMelodyActive = false;
      })
      .catch(() => {
        // Fallback to synth melody if audio playback rejected
        startSynthMelodyFallback();
        notifyMusicListeners(true);
      });
    return true;
  }

  return startBackgroundMusic(customUrl);
}

/**
 * Fallback synthesizer music-box sequence (joyful pentatonic tune)
 */
function startSynthMelodyFallback(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  isMelodyActive = true;
  const notes = [523.25, 659.25, 783.99, 659.25, 880.0, 783.99, 659.25, 587.33];
  let step = 0;

  const playNote = () => {
    if (!isMelodyActive || !audioCtx) return;
    const freq = notes[step % notes.length];
    step += 1;

    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.035, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.45);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.48);
  };

  playNote();
  if (melodyTimer !== null) {
    window.clearInterval(melodyTimer);
  }
  melodyTimer = window.setInterval(playNote, 520);
}
