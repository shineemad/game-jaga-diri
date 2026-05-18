// GameState.js — Status global permainan
const GameState = {
  lives: 3,
  maxLives: 3,
  score: 0,
  day: 1,
  playerName: "Rara",

  // Pilihan & keputusan pemain
  pathChoice: "safe", // 'safe' | 'dangerous'
  screenshotTaken: false,
  platChecked: false,
  micAvailable: false,

  // Rekam pilihan untuk laporan akhir
  choices: [], // [{ day, label, category, points }]
  achievements: [], // nama achievement

  // Checkpoint agar pemain tidak frustrasi
  checkpoints: { d1: false, d2: false, d3: false },

  reset() {
    this.lives = 3;
    this.maxLives = 3;
    this.score = 0;
    this.day = 1;
    this.playerName = this.playerName || "Rara";
    this.pathChoice = "safe";
    this.screenshotTaken = false;
    this.platChecked = false;
    this.micAvailable = false;
    this.choices = [];
    this.achievements = [];
    this.checkpoints = { d1: false, d2: false, d3: false };
  },

  addChoice(day, label, category, overridePts) {
    const pts =
      overridePts !== undefined ? overridePts : (CFG.SCORE[category] ?? 0);
    this.score += pts;
    this.choices.push({ day, label, category, pts });
  },

  addScore(pts) {
    this.score += pts;
  },

  loseLife() {
    this.lives = Math.max(0, this.lives - 1);
    return this.lives;
  },

  isAlive() {
    return this.lives > 0;
  },

  earnAchievement(name) {
    if (!this.achievements.includes(name)) {
      this.achievements.push(name);
    }
  },

  // Nilai akhir — berdasarkan total skor max 1000
  grade() {
    const pct = this.score / 1000;
    if (pct >= 0.8) return { label: "★ PAHLAWAN SEJATI ★", color: "#FFD700" };
    if (pct >= 0.6) return { label: "Sang Jagoan", color: "#C0C0C0" };
    if (pct >= 0.4) return { label: "Si Pemberani", color: "#CD7F32" };
    return { label: "Masih Perlu Belajar", color: "#FF6B6B" };
  },
};
