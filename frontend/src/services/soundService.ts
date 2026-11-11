export class SoundService {
  private static playTone(freq: number, startOffset: number, duration: number, ctx: AudioContext) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime + startOffset);

    gain.gain.setValueAtTime(0.001, ctx.currentTime + startOffset);
    gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + startOffset + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startOffset + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime + startOffset);
    osc.stop(ctx.currentTime + startOffset + duration);
  }

  static playCompletionChime(enabled = true) {
    if (!enabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      SoundService.playTone(523.25, 0, 0.22, ctx);
      SoundService.playTone(659.25, 0.16, 0.24, ctx);
      SoundService.playTone(783.99, 0.32, 0.38, ctx);
      SoundService.playTone(1046.5, 0.5, 0.55, ctx);
    } catch {
      // Ignore audio autoplay restriction errors
    }
  }
}

