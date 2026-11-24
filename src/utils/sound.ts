let audioCtx: AudioContext | null = null;
let melodyTimer: number | null = null;
let isMelodyActive = false;
let backgroundAudio: HTMLAudioElement | null = null;

let currentMusicUrl = '/lagu-undangan.mp3';

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

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctx =
    window.AudioContext ||
    (window as unknown as {webkitAudioContext?: typeof AudioContext}).webkitAudioContext;
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
 * Plays a cheerful two-tone steam train whistle ("Toot-Toot!").
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
 * Starts or stops a gentle storybook music-box celebratory loop or MP3 background music.
 */
export function toggleBackgroundMusic(shouldPlay: boolean, customUrl?: string): boolean {
  if (customUrl) {
    setBackgroundMusicUrl(customUrl);
  }

  if (!shouldPlay) {
    isMelodyActive = false;
    if (melodyTimer !== null) {
      window.clearInterval(melodyTimer);
      melodyTimer = null;
    }
    if (backgroundAudio) {
      backgroundAudio.pause();
    }
    return false;
  }

  if (backgroundAudio) {
    backgroundAudio.volume = 0.5;
    backgroundAudio.loop = true;
    void backgroundAudio.play()
      .then(() => {
        isMelodyActive = true;
        if (melodyTimer !== null) {
          window.clearInterval(melodyTimer);
          melodyTimer = null;
        }
      })
      .catch(() => {
        // Browser can reject playback; fallback to synth
      });
    return true;
  }

  const mp3Audio = new Audio(currentMusicUrl);
  mp3Audio.volume = 0.5;
  mp3Audio.loop = true;
  mp3Audio.preload = 'auto';
  backgroundAudio = mp3Audio;

  void mp3Audio.play()
    .then(() => {
      isMelodyActive = true;
      if (melodyTimer !== null) {
        window.clearInterval(melodyTimer);
        melodyTimer = null;
      }
    })
    .catch(() => {
      // Browser can reject auto-play without user interaction; app uses synth fallback below
    });

  const ctx = getAudioContext();
  if (!ctx) return false;

  isMelodyActive = true;
  // Gentle joyful pentatonic music-box sequence (C major)
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
  return true;
}
