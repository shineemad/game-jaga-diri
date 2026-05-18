// config.js — Konfigurasi global game RARA: Jaga Dirimu!

const CFG = {
  WIDTH: 800,
  HEIGHT: 450,

  // Warna utama
  C: {
    // UI & Brand
    PRIMARY: 0xc41e3a, // Merah
    GOLD: 0xffd700, // Emas
    DARK: 0x1a0a00, // Gelap tropis
    PANEL: 0x240c0c, // Panel dialog
    PANEL_ALT: 0x1c1830,

    // Karakter
    RARA: 0x9b59b6, // Sweater ungu
    RARA_SKIN: 0xc68642, // Kulit sawo matang
    RARA_HAIR: 0x1a0a00,
    SHADOW: 0x111111, // Siluet NPC asing
    BOSS: 0x2c0000,

    // Aksi
    AMAN: 0x27ae60, // Hijau = aman
    RAGU: 0xf39c12, // Kuning = ragu
    BAHAYA: 0xe74c3c, // Merah = bahaya
    NEUTRAL: 0x3498db,

    // Environment
    SKY_DAY: 0x87ceeb,
    SKY_DUSK: 0xff6b35,
    SKY_RAIN: 0x4a5568,
    ROAD: 0x4a4a4a,
    SIDEWALK: 0x9e9e9e,
    GRASS: 0x2ecc71,
    GROUND: 0x8b6914,
    MOUNTAIN: 0x6b8e6b,

    // HUD
    HP_FULL: 0xe74c3c,
    HP_EMPTY: 0x555555,
    VOICE_LO: 0x3498db,
    VOICE_MI: 0xf39c12,
    VOICE_HI: 0xe74c3c,
  },

  // Font styles
  F: {
    TITLE: {
      fontFamily: "Georgia, serif",
      fontSize: "36px",
      color: "#FFD700",
      fontStyle: "bold",
      stroke: "#1a0a00",
      strokeThickness: 4,
    },
    SUBTITLE: { fontFamily: "Arial", fontSize: "18px", color: "#FFD700" },
    BODY: { fontFamily: "Arial", fontSize: "16px", color: "#FFFFFF" },
    SMALL: { fontFamily: "Arial", fontSize: "13px", color: "#CCCCCC" },
    SPEAKER: {
      fontFamily: "Arial",
      fontSize: "15px",
      color: "#FFD700",
      fontStyle: "bold",
    },
    DIALOG: {
      fontFamily: "Arial",
      fontSize: "15px",
      color: "#FFFFFF",
      wordWrap: { width: 480 },
    },
    CHOICE: {
      fontFamily: "Arial",
      fontSize: "13px",
      color: "#FFFFFF",
      wordWrap: { width: 220 },
      align: "center",
    },
    HUD: {
      fontFamily: "Arial",
      fontSize: "15px",
      color: "#FFFFFF",
      fontStyle: "bold",
    },
    BUTTON: {
      fontFamily: "Arial",
      fontSize: "15px",
      color: "#FFFFFF",
      fontStyle: "bold",
    },
    EDUCARD: {
      fontFamily: "Arial",
      fontSize: "14px",
      color: "#FFFFCC",
      wordWrap: { width: 480 },
    },
  },

  // Skor
  SCORE: { AMAN: 100, RAGU: 50, BAHAYA: 0, QUIZ: 200, LAPOR: 500 },

  // Voice meter
  VOICE: {
    THRESHOLD: 0.7, // 0-1 normalized level
    SHOUT_MS: 300, // ms minimum shout
  },

  // World dimensions
  WORLD_DAY1: 3200,
  WORLD_DAY3: 2800,

  // Encounter x-positions Day1
  ENC_DAY1: {
    TUT: 350,
    E1: 850,
    PATH: 1100,
    E2: 1500,
    E3: 2000,
    EDU: 2400,
    END: 2900,
  },

  LOKASI: {
    D1: "Jalan Menuju Sekolah",
    D2: "Angkot Jurusan Sekolah",
    D3: "Parkiran SMP — Musim Hujan",
  },
};
