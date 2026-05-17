// Draw.js — Utilitas menggambar karakter & elemen dengan Phaser Graphics
// Semua fungsi menerima (graphics, x, y, ...) agar bisa dipakai di scene manapun

const DrawUtils = {
  // ── RARA (protagonis) ────────────────────────────────────────────────────
  rara(g, x, y, state = "idle") {
    const t = Date.now();
    const walk = state === "walk" || state === "run";
    const scared = state === "scared";
    const legSwing = walk ? Math.sin(t / (state === "run" ? 120 : 220)) * 8 : 0;

    // Bayangan
    g.fillStyle(0x000000, 0.25);
    g.fillEllipse(x, y + 42, 32, 9);

    // Kaki
    g.fillStyle(CFG.C.RARA_SKIN);
    g.fillRect(x - 9, y + 22, 8, 20 + legSwing);
    g.fillRect(x + 1, y + 22, 8, 20 - legSwing);

    // Rok ungu
    g.fillStyle(0x7d3c98);
    g.fillTriangle(x - 14, y + 22, x + 14, y + 22, x - 18, y + 40);
    g.fillTriangle(x - 14, y + 22, x + 14, y + 22, x + 18, y + 40);
    // Garis motif
    g.lineStyle(1, CFG.C.GOLD, 0.6);
    g.lineBetween(x - 10, y + 26, x - 15, y + 38);
    g.lineBetween(x + 10, y + 26, x + 15, y + 38);

    // Badan (sweater ungu)
    g.fillStyle(CFG.C.RARA);
    g.fillRect(x - 13, y, 26, 24);
    // Lengan
    g.fillRect(x - 20, y + 2, 8, 18);
    g.fillRect(x + 12, y + 2, 8, 18);

    // Kepala
    g.fillStyle(CFG.C.RARA_SKIN);
    g.fillCircle(x, y - 11, 14);

    // Rambut
    g.fillStyle(CFG.C.RARA_HAIR);
    g.fillRect(x - 14, y - 24, 28, 15);
    g.fillCircle(x, y - 23, 14);
    // Kuncir
    g.fillCircle(x + 13, y - 26, 5);
    g.fillRect(x + 13, y - 26, 4, 10);

    // Mata
    if (scared) {
      g.fillStyle(0xffffff);
      g.fillEllipse(x - 5, y - 12, 7, 9);
      g.fillEllipse(x + 5, y - 12, 7, 9);
      g.fillStyle(0x000000);
      g.fillCircle(x - 5, y - 12, 3);
      g.fillCircle(x + 5, y - 12, 3);
      // Air mata
      g.fillStyle(0x87ceeb, 0.8);
      g.fillRect(x - 5, y - 9, 2, 6);
    } else {
      g.fillStyle(0x000000);
      g.fillCircle(x - 5, y - 12, 3);
      g.fillCircle(x + 5, y - 12, 3);
      g.fillStyle(0xffffff);
      g.fillCircle(x - 4, y - 13, 1);
      g.fillCircle(x + 6, y - 13, 1);
    }

    // Mulut — digambar dengan fillEllipse dan fillRect (tanpa arc)
    g.fillStyle(0x222222);
    if (scared) {
      // Mulut terbuka (O)
      g.fillEllipse(x, y - 5, 11, 8);
      g.fillStyle(0xaa3333);
      g.fillEllipse(x, y - 5, 7, 5);
    } else {
      // Senyum: garis pendek + dua sudut sedikit naik
      g.fillRect(x - 4, y - 6, 8, 2);
      g.fillRect(x - 5, y - 7, 2, 2);
      g.fillRect(x + 3, y - 7, 2, 2);
    }
  },

  // ── NPC SILUET (orang asing / bahaya) ───────────────────────────────────
  shadowNpc(g, x, y, angry = false, approach = false) {
    const pulse = 0.12 + 0.06 * Math.sin(Date.now() / 300);
    const glowC = angry ? 0xff2222 : 0xff6600;

    // Aura
    g.fillStyle(glowC, pulse);
    g.fillCircle(x, y - 5, 50);

    // Siluet hitam
    g.fillStyle(CFG.C.SHADOW);
    g.fillRect(x - 9, y + 20, 8, 22); // kaki kiri
    g.fillRect(x + 1, y + 20, 8, 22); // kaki kanan
    g.fillRect(x - 15, y - 5, 30, 28); // badan
    g.fillRect(x - 22, y - 3, 9, 20); // lengan kiri
    g.fillRect(x + 13, y - 3, 9, 20); // lengan kanan
    g.fillCircle(x, y - 17, 17); // kepala

    // Mata bercahaya
    g.fillStyle(glowC);
    g.fillCircle(x - 6, y - 19, 3.5);
    g.fillCircle(x + 6, y - 19, 3.5);

    if (angry) {
      // Alis miring
      g.lineStyle(2, 0xff0000);
      g.lineBetween(x - 10, y - 24, x - 3, y - 21);
      g.lineBetween(x + 3, y - 21, x + 10, y - 24);
    }

    if (approach) {
      // Tanda bahaya bergerak
      g.fillStyle(0xff0000, 0.6 + 0.4 * Math.sin(Date.now() / 150));
      g.fillTriangle(x, y - 50, x - 10, y - 35, x + 10, y - 35);
      g.fillStyle(0xffffff);
      g.fillRect(x - 1.5, y - 47, 3, 8);
      g.fillRect(x - 1.5, y - 37, 3, 3);
    }
  },

  // ── BOSS (Si Bayangan Gelap) ─────────────────────────────────────────
  boss(g, x, y, mentalRatio = 1.0) {
    const t = Date.now();
    const pulse = 0.2 + 0.15 * Math.sin(t / 200);

    // Aura boss
    g.fillStyle(0x8b0000, pulse);
    g.fillCircle(x, y, 70);
    g.fillStyle(0xff0000, pulse * 0.5);
    g.fillCircle(x, y, 55);

    // Jubah
    g.fillStyle(0x220000);
    g.fillTriangle(x - 22, y - 5, x - 35, y + 65, x + 5, y + 55);
    g.fillTriangle(x + 22, y - 5, x + 35, y + 65, x - 5, y + 55);
    // Badan
    g.fillStyle(0x0d0000);
    g.fillRect(x - 20, y - 5, 40, 40);
    // Kaki
    g.fillRect(x - 14, y + 35, 11, 28);
    g.fillRect(x + 3, y + 35, 11, 28);
    // Kepala
    g.fillCircle(x, y - 22, 22);

    // Mahkota (jabatan sosial predator)
    g.fillStyle(0x8b0000);
    for (let i = -2; i <= 2; i++) {
      g.fillTriangle(
        x + i * 9,
        y - 44,
        x + i * 9 - 4,
        y - 36,
        x + i * 9 + 4,
        y - 36,
      );
    }

    // Mata merah menyala
    g.fillStyle(0xff0000);
    g.fillEllipse(x - 8, y - 24, 9, 7);
    g.fillEllipse(x + 8, y - 24, 9, 7);

    // Bar mental boss
    const bw = 90,
      bh = 12;
    const bx = x - bw / 2,
      by = y - 68;
    g.fillStyle(0x333333);
    g.fillRect(bx, by, bw, bh);
    const barColor = Phaser.Display.Color.GetColor(
      Math.round(220 * mentalRatio),
      Math.round(220 * (1 - mentalRatio)),
      0,
    );
    g.fillStyle(barColor);
    g.fillRect(bx, by, bw * mentalRatio, bh);
    g.lineStyle(2, 0xffffff, 0.8);
    g.strokeRect(bx, by, bw, bh);
  },

  // ── HEARTS (nyawa) ───────────────────────────────────────────────────────
  hearts(g, x, y, current, max) {
    for (let i = 0; i < max; i++) {
      const hx = x + i * 28;
      g.fillStyle(i < current ? CFG.C.HP_FULL : CFG.C.HP_EMPTY);
      g.fillCircle(hx - 5, y, 6);
      g.fillCircle(hx + 5, y, 6);
      g.fillTriangle(hx - 11, y + 2, hx + 11, y + 2, hx, y + 14);
    }
  },

  // ── VOICE METER ─────────────────────────────────────────────────────────
  voiceMeterBar(g, x, y, w, h, level) {
    g.fillStyle(0x333333);
    g.fillRect(x, y, w, h);
    let color;
    if (level < 0.5) color = CFG.C.VOICE_LO;
    else if (level < CFG.VOICE.THRESHOLD) color = CFG.C.VOICE_MI;
    else color = CFG.C.VOICE_HI;
    g.fillStyle(color);
    g.fillRect(x, y, w * level, h);
    // Garis threshold
    const tx = x + w * CFG.VOICE.THRESHOLD;
    g.lineStyle(2, 0xff0000);
    g.lineBetween(tx, y - 2, tx, y + h + 2);
    g.lineStyle(1.5, 0xffffff, 0.6);
    g.strokeRect(x, y, w, h);
  },

  // ── BORDER BERSIH (dekoratif) ─────────────────────────────────────────
  drawBorder(g, x, y, w, h, alpha = 1) {
    // Border luar emas
    g.lineStyle(2, CFG.C.GOLD, alpha);
    g.strokeRect(x, y, w, h);
    // Border dalam tipis
    g.lineStyle(1, CFG.C.PRIMARY, alpha * 0.5);
    g.strokeRect(x + 4, y + 4, w - 8, h - 8);
    // Sudut dekoratif
    const cs = 12;
    g.lineStyle(2, CFG.C.GOLD, alpha * 0.8);
    [
      [x, y],
      [x + w, y],
      [x, y + h],
      [x + w, y + h],
    ].forEach(([cx, cy]) => {
      const dx = cx === x ? 1 : -1;
      const dy = cy === y ? 1 : -1;
      g.lineBetween(cx, cy, cx + dx * cs, cy);
      g.lineBetween(cx, cy, cx, cy + dy * cs);
    });
  },

  // Alias lama agar kompatibel
  sulselBorder(...args) {
    return DrawUtils.drawBorder(...args);
  },

  // ── BACKGROUND SCENE ────────────────────────────────────────────────────
  skyDay(g, w, h) {
    g.fillStyle(0x87ceeb);
    g.fillRect(0, 0, w, h * 0.5);
    // Awan
    g.fillStyle(0xffffff, 0.8);
    const clouds = [
      [100, 30, 60, 25],
      [300, 50, 80, 28],
      [600, 25, 70, 22],
      [750, 60, 50, 20],
    ];
    clouds.forEach(([cx, cy, cw, ch]) => {
      g.fillEllipse(cx, cy, cw, ch);
      g.fillEllipse(cx - cw * 0.3, cy + 5, cw * 0.6, ch * 0.8);
      g.fillEllipse(cx + cw * 0.3, cy + 5, cw * 0.6, ch * 0.8);
    });
  },

  skyRain(g, w, h) {
    g.fillStyle(0x4a5568);
    g.fillRect(0, 0, w, h);
    // Awan gelap
    g.fillStyle(0x2d3748, 0.9);
    g.fillEllipse(w * 0.3, 30, 250, 60);
    g.fillEllipse(w * 0.7, 20, 300, 70);
    // Hujan
    g.lineStyle(1, 0x90cdf4, 0.3);
    const t = Date.now();
    for (let i = 0; i < 30; i++) {
      const rx = (i * 87 + t * 0.5) % w;
      const ry = (i * 43 + t * 0.8) % h;
      g.lineBetween(rx, ry, rx - 4, ry + 14);
    }
  },
};
