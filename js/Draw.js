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
    // 3 warna sesuai GDD: Hijau (Normal) / Kuning (Sedang) / Merah (KERAS)
    let color;
    if (level < 0.35)
      color = CFG.C.VOICE_LO; // Hijau
    else if (level < CFG.VOICE.THRESHOLD)
      color = CFG.C.VOICE_MI; // Kuning
    else color = CFG.C.VOICE_HI; // Merah
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

  // ── NAME TAG (label referensi Unity di atas karakter) ───────────────────
  nameTag(g, x, y, name, color = 0xffd700) {
    const w = name.length * 7 + 14;
    g.fillStyle(0x000000, 0.7);
    g.fillRoundedRect(x - w / 2, y - 4, w, 15, 4);
    g.lineStyle(1, color, 0.9);
    g.strokeRoundedRect(x - w / 2, y - 4, w, 15, 4);
    // Teks ditampilkan via add.text di scene — nameTag hanya latar
  },

  // ── PAMAN BAIK (encounter 1: tawaran permen) ────────────────────────────
  pamanBaik(g, x, y) {
    const t = Date.now();
    const pulse = 0.08 + 0.04 * Math.sin(t / 400);

    // Aura kuning-oranye (tampak "ramah" tapi mencurigakan)
    g.fillStyle(0xff8800, pulse);
    g.fillCircle(x, y - 5, 44);

    // Tubuh — coklat gelap (lebih terang dari shadowNpc)
    g.fillStyle(0x4a2800);
    g.fillRect(x - 12, y - 5, 24, 26); // badan
    g.fillRect(x - 18, y - 3, 7, 18); // lengan kiri
    g.fillRect(x + 11, y - 3, 7, 18); // lengan kanan
    g.fillRect(x - 9, y + 21, 7, 20); // kaki kiri
    g.fillRect(x + 2, y + 21, 7, 20); // kaki kanan
    g.fillStyle(0x5c3210);
    g.fillCircle(x, y - 16, 14); // kepala

    // Topi fedora / topi pak tua
    g.fillStyle(0x3a1e00);
    g.fillRect(x - 16, y - 28, 32, 6); // pinggiran topi
    g.fillRect(x - 10, y - 40, 20, 14); // badan topi

    // Mata berkilau (ramah tapi tidak dapat dipercaya)
    g.fillStyle(0xffaa00);
    g.fillCircle(x - 5, y - 18, 2.5);
    g.fillCircle(x + 5, y - 18, 2.5);

    // Permen di tangan (3 lingkaran warna-warni)
    g.fillStyle(0xff4444);
    g.fillCircle(x + 20, y + 2, 4);
    g.fillStyle(0x44ff44);
    g.fillCircle(x + 26, y - 2, 3.5);
    g.fillStyle(0x4444ff);
    g.fillCircle(x + 23, y + 7, 3);
    // Batang permen
    g.lineStyle(1.5, 0xffffff, 0.8);
    g.lineBetween(x + 18, y + 4, x + 20, y + 12);

    // Tanda seru kuning (peringatan untuk pemain)
    g.fillStyle(0xffdd00, 0.7 + 0.3 * Math.sin(t / 200));
    g.fillTriangle(x, y - 52, x - 8, y - 38, x + 8, y - 38);
    g.fillStyle(0x000000);
    g.fillRect(x - 1.5, y - 50, 3, 7);
    g.fillRect(x - 1.5, y - 41, 3, 3);
  },

  // ── MOTOR NPC (encounter 2: motor nyasar, tawaran tumpangan) ────────────
  motorNpc(g, x, y) {
    const t = Date.now();

    // Motor — badan utama
    g.fillStyle(0x444444);
    g.fillRect(x - 28, y + 8, 56, 18); // rangka
    g.fillStyle(0x666666);
    g.fillRect(x - 14, y - 2, 28, 12); // bodi atas / tangki
    // Roda
    g.fillStyle(0x222222);
    g.fillCircle(x - 22, y + 26, 11);
    g.fillCircle(x + 22, y + 26, 11);
    g.fillStyle(0x888888);
    g.fillCircle(x - 22, y + 26, 5);
    g.fillCircle(x + 22, y + 26, 5);
    // Knalpot
    g.fillStyle(0x888888);
    g.fillRect(x + 22, y + 14, 18, 4);
    // Lampu
    g.fillStyle(0xffff88);
    g.fillRect(x - 30, y + 4, 6, 5);

    // Pengendara
    g.fillStyle(0x2c4a1a); // jaket hijau gelap
    g.fillRect(x - 10, y - 20, 20, 22);
    g.fillStyle(0x1a3310);
    g.fillCircle(x, y - 22, 13); // helm

    // Tangan menunjuk (tanya arah)
    g.fillStyle(0xc8a07a);
    g.fillRect(x + 10, y - 14, 22, 5);
    g.fillCircle(x + 32, y - 12, 5);

    // Aura merah tipis (bahaya tersamar)
    g.fillStyle(0xff2200, 0.06 + 0.04 * Math.sin(t / 350));
    g.fillCircle(x, y, 48);
  },

  // ── GANG BLOCKER (encounter 3 / jalur bahaya) ───────────────────────────
  gangGroup(g, x, y) {
    const t = Date.now();
    // 3 figur gelap bertumpang tindih
    const offsets = [-22, 0, 22];
    offsets.forEach((ox, i) => {
      const px = x + ox;
      const scale = i === 1 ? 1.15 : 0.9; // figur tengah sedikit lebih besar
      g.fillStyle(0x1a0000, 0.95);
      g.fillRect(px - 9 * scale, y - 5, 18 * scale, 26 * scale);
      g.fillRect(px - 15 * scale, y - 3, 7 * scale, 16 * scale);
      g.fillRect(px + 8 * scale, y - 3, 7 * scale, 16 * scale);
      g.fillRect(px - 8, y + 21 * scale, 7, 20);
      g.fillRect(px + 1, y + 21 * scale, 7, 20);
      g.fillStyle(0x110000, 0.95);
      g.fillCircle(px, y - 18 * scale, 14 * scale);
      // Mata merah semua
      g.fillStyle(0xff0000, 0.8);
      g.fillCircle(px - 4 * scale, y - 20 * scale, 2.5);
      g.fillCircle(px + 4 * scale, y - 20 * scale, 2.5);
    });
    // Aura merah kuat
    g.fillStyle(0xff0000, 0.12 + 0.08 * Math.sin(t / 180));
    g.fillCircle(x, y, 65);
    // Tangan bentang menghadang
    g.fillStyle(0x1a0000);
    g.fillRect(x - 60, y + 5, 30, 6);
    g.fillRect(x + 30, y + 5, 30, 6);
  },

  // ── ANGKOT (minivan khas Indonesia) ─────────────────────────────────────
  angkot(g, x, y, color = 0x1a8a2a) {
    // Badan utama
    g.fillStyle(color);
    g.fillRect(x - 55, y - 28, 110, 52);
    // Atap melengkung
    g.fillStyle(color);
    g.fillEllipse(x, y - 28, 100, 20);
    // Strip putih horizontal
    g.fillStyle(0xffffff, 0.5);
    g.fillRect(x - 55, y - 10, 110, 5);
    // Kaca depan
    g.fillStyle(0x88ccff, 0.7);
    g.fillRect(x + 28, y - 24, 22, 18);
    // Kaca samping
    g.fillStyle(0x88ccff, 0.5);
    g.fillRect(x - 44, y - 22, 34, 16);
    g.fillRect(x - 4, y - 22, 26, 16);
    // Pintu samping
    g.lineStyle(1.5, 0x007700, 0.8);
    g.lineBetween(x - 12, y - 22, x - 12, y + 24);
    // Roda
    g.fillStyle(0x222222);
    g.fillCircle(x - 32, y + 26, 13);
    g.fillCircle(x + 30, y + 26, 13);
    g.fillStyle(0x888888);
    g.fillCircle(x - 32, y + 26, 6);
    g.fillCircle(x + 30, y + 26, 6);
    // Lampu depan
    g.fillStyle(0xffff88);
    g.fillRect(x + 50, y - 16, 8, 8);
    // Label ANGKOT di badan
    g.fillStyle(0xffffff, 0.6);
    g.fillRect(x - 52, y - 2, 60, 14);
    g.lineStyle(1, 0x007700);
    g.strokeRect(x - 52, y - 2, 60, 14);
  },

  // ── HALTE BUS (referensi tempat nunggu angkot) ───────────────────────────
  halte(g, x, y) {
    // Atap
    g.fillStyle(0x1a5c8a);
    g.fillRect(x - 55, y - 58, 110, 10);
    g.fillRect(x - 60, y - 58, 8, 10); // tiang kiri
    g.fillRect(x + 52, y - 58, 8, 10); // tiang kanan
    // Dinding kaca samping
    g.fillStyle(0x88ccff, 0.3);
    g.fillRect(x - 55, y - 48, 110, 48);
    g.lineStyle(1.5, 0x1a5c8a, 0.8);
    g.strokeRect(x - 55, y - 48, 110, 48);
    // Bangku
    g.fillStyle(0x3a3a3a);
    g.fillRect(x - 40, y - 14, 80, 8);
    g.fillRect(x - 38, y - 6, 8, 8);
    g.fillRect(x + 30, y - 6, 8, 8);
    // Tiang kiri-kanan bawah
    g.fillStyle(0x1a5c8a);
    g.fillRect(x - 54, y - 48, 5, 48);
    g.fillRect(x + 50, y - 48, 5, 48);
    // Label
    g.fillStyle(0x1a5c8a);
    g.fillRect(x - 30, y - 72, 60, 16);
    g.fillStyle(0xffffff);
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
