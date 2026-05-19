// VoiceMeter.js — Sistem mikrofon real-time (Web Audio API)
// Jika mic tidak tersedia, fallback ke tombol TERIAK!

class VoiceMeter {
  constructor() {
    this.ctx = null;
    this.analyser = null;
    this.source = null;
    this.data = null;
    this.active = false;
    this.level = 0; // 0-1 normalized
    this.smoothed = 0;
    this._simTimer = 0;
  }

  async start() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.5;
      this.source = this.ctx.createMediaStreamSource(stream);
      this.source.connect(this.analyser);
      this.data = new Float32Array(this.analyser.fftSize);
      this.active = true;
      GameState.micAvailable = true;
      return true;
    } catch {
      this.active = false;
      return false;
    }
  }

  stop() {
    if (this.source) this.source.disconnect();
    if (this.ctx) this.ctx.close();
    this.active = false;
    this.level = 0;
    this.smoothed = 0;
  }

  // Dipanggil tiap frame dari scene update()
  tick() {
    if (this._simTimer > 0) {
      this._simTimer -= 16;
      this.smoothed = 0.95;
      return;
    }
    if (!this.active || !this.analyser) {
      this.smoothed = Math.max(0, this.smoothed - 0.05);
      return;
    }
    this.analyser.getFloatTimeDomainData(this.data);
    let sum = 0;
    for (const v of this.data) sum += v * v;
    const rms = Math.sqrt(sum / this.data.length);
    // Konversi ke dB, normalkan ke 0-1 (range -60dB .. 0dB)
    const db = rms > 0 ? 20 * Math.log10(rms) : -100;
    const raw = Math.max(0, Math.min(1, (db + 60) / 60));
    this.smoothed = this.smoothed * 0.6 + raw * 0.4;
    this.level = this.smoothed;
  }

  // Simulasi teriakan untuk fallback button
  simulateShout(ms = 800) {
    this._simTimer = ms;
  }

  isShout() {
    return this.smoothed >= CFG.VOICE.THRESHOLD;
  }

  // Kembalikan level suara: 'normal' (hijau) | 'medium' (kuning) | 'high' (merah)
  getLevel() {
    if (this.smoothed >= CFG.VOICE.THRESHOLD) return "high";
    if (this.smoothed >= 0.35) return "medium";
    return "normal";
  }

  // 0-1
  get() {
    return this.smoothed;
  }
}

const voiceMeter = new VoiceMeter();
