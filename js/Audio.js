// Audio.js — AudioManager: BGM procedural + SFX via Web Audio API
// Semua suara dibuat sintetis — tidak membutuhkan file audio eksternal
const AudioManager = (() => {
  let _ctx = null;
  let _bgmNode = null;
  let _bgmGain = null;
  let _sfxGain = null;
  let _enabled = true;
  let _bgmInterval = null;

  // Lazy init AudioContext (harus setelah interaksi user)
  function _init() {
    if (_ctx) return;
    try {
      _ctx = new (window.AudioContext || window.webkitAudioContext)();
      _bgmGain = _ctx.createGain();
      _bgmGain.gain.value = 0.18;
      _bgmGain.connect(_ctx.destination);
      _sfxGain = _ctx.createGain();
      _sfxGain.gain.value = 0.45;
      _sfxGain.connect(_ctx.destination);
    } catch (e) {
      _enabled = false;
    }
  }

  // ── Tone primitif ────────────────────────────────────────────────
  function _tone(
    freq,
    duration,
    type = "sine",
    gainNode = null,
    startDelay = 0,
  ) {
    if (!_ctx || !_enabled) return;
    try {
      const osc = _ctx.createOscillator();
      const g = _ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0, _ctx.currentTime + startDelay);
      g.gain.linearRampToValueAtTime(1, _ctx.currentTime + startDelay + 0.01);
      g.gain.exponentialRampToValueAtTime(
        0.001,
        _ctx.currentTime + startDelay + duration,
      );
      osc.connect(g);
      g.connect(gainNode || _sfxGain);
      osc.start(_ctx.currentTime + startDelay);
      osc.stop(_ctx.currentTime + startDelay + duration);
    } catch (e) {}
  }

  // ── BGM: multi-tema melodi (Fix #6) ─────────────────────────────
  const _melodies = {
    menu: [392, 440, 494, 523, 494, 440, 392, 330], // G A B C — cerah/gembira
    day1: [261, 293, 329, 349, 392, 349, 329, 293], // C D E F G — pagi bersemangat
    day2: [220, 247, 262, 294, 330, 294, 262, 247], // A B C D E — sedikit tegang
    day3: [196, 220, 233, 262, 294, 262, 233, 220], // G A Bb C D — misterius/gelap
    boss: [150, 165, 175, 196, 175, 165, 150, 140], // Nada rendah — mengancam
  };
  let _currentMelody = _melodies.day1;
  let _melIdx = 0;

  function _bgmTick() {
    if (!_ctx || !_enabled || !_bgmGain) return;
    if (_ctx.state === "suspended") _ctx.resume();
    const freq = _currentMelody[_melIdx % _currentMelody.length];
    _melIdx++;
    _tone(freq, 0.5, "triangle", _bgmGain);
    // Bass note setiap 4 ketuk
    if (_melIdx % 4 === 0) _tone(freq * 0.5, 0.8, "sine", _bgmGain);
  }

  // ══════════════════════════════════════════════════════════════════
  // PUBLIC API
  return {
    // Panggil saat pertama kali ada interaksi user
    init() {
      _init();
    },

    // BGM on/off (Fix #6: tambah parameter theme)
    startBGM(bpm = 110, theme = "day1") {
      if (!_enabled) return;
      _init();
      this.stopBGM();
      _currentMelody = _melodies[theme] || _melodies.day1;
      _melIdx = 0; // reset posisi melodi saat ganti tema
      const interval = Math.round((60 / bpm) * 1000);
      _bgmInterval = setInterval(_bgmTick, interval);
    },

    stopBGM() {
      if (_bgmInterval) {
        clearInterval(_bgmInterval);
        _bgmInterval = null;
      }
    },

    setBGMVolume(v) {
      if (_bgmGain) _bgmGain.gain.value = Math.max(0, Math.min(1, v));
    },

    setSFXVolume(v) {
      if (_sfxGain) _sfxGain.gain.value = Math.max(0, Math.min(1, v));
    },

    mute() {
      this.stopBGM();
      if (_bgmGain) _bgmGain.gain.value = 0;
      if (_sfxGain) _sfxGain.gain.value = 0;
    },

    unmute() {
      if (_bgmGain) _bgmGain.gain.value = 0.18;
      if (_sfxGain) _sfxGain.gain.value = 0.45;
    },

    // ── SFX ──────────────────────────────────────────────────────
    // Klik tombol
    sfxClick() {
      _init();
      _tone(880, 0.08, "square");
      _tone(1100, 0.06, "square", null, 0.07);
    },

    // Pilihan AMAN / benar
    sfxCorrect() {
      _init();
      _tone(523, 0.15, "sine"); // C5
      _tone(659, 0.15, "sine", null, 0.15); // E5
      _tone(784, 0.3, "sine", null, 0.3); // G5
    },

    // Pilihan BAHAYA / salah
    sfxWrong() {
      _init();
      _tone(220, 0.12, "sawtooth");
      _tone(196, 0.25, "sawtooth", null, 0.12);
    },

    // RAGU — nada netral
    sfxNeutral() {
      _init();
      _tone(440, 0.1, "triangle");
      _tone(480, 0.1, "triangle", null, 0.1);
    },

    // Nyawa berkurang
    sfxLoseLife() {
      _init();
      _tone(400, 0.1, "sawtooth");
      _tone(300, 0.15, "sawtooth", null, 0.1);
      _tone(200, 0.3, "sawtooth", null, 0.25);
    },

    // Sukses / selamat
    sfxSuccess() {
      _init();
      [523, 659, 784, 1047].forEach((f, i) => {
        _tone(f, 0.2, "sine", null, i * 0.15);
      });
    },

    // Teriak / voice shout
    sfxShout() {
      _init();
      _tone(600, 0.05, "square");
      _tone(900, 0.08, "square", null, 0.05);
      _tone(1200, 0.12, "square", null, 0.1);
    },

    // Scene transition
    sfxTransition() {
      _init();
      _tone(329, 0.12, "sine");
      _tone(261, 0.18, "sine", null, 0.12);
    },

    // Achievement unlock
    sfxAchievement() {
      _init();
      [784, 988, 1175, 1568].forEach((f, i) => {
        _tone(f, 0.18, "sine", null, i * 0.12);
      });
    },

    // Feature #12: Boss fight — debaran saat pilih AMAN (hantam musuh)
    sfxBossHit() {
      _init();
      _tone(65, 0.18, "sawtooth"); // bass punch
      _tone(220, 0.09, "square", null, 0.06); // crack impact
      _tone(440, 0.14, "triangle", null, 0.12); // resonance
      _tone(659, 0.22, "sine", null, 0.22); // power ring (E5)
      _tone(880, 0.16, "sine", null, 0.38); // sparkle high (A5)
    },

    // Feature #12: Boss fight — erangan boss saat terkena serangan
    sfxBossGroan() {
      _init();
      _tone(280, 0.1, "sawtooth");
      _tone(200, 0.14, "sawtooth", null, 0.09);
      _tone(140, 0.22, "sawtooth", null, 0.2);
    },
  };
})();
