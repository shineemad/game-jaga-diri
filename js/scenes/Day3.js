// Day3.js — Hari 3: Hujan di Parkiran Sekolah
// Bagian: (1) Chat V2 intens, (2) Cek Plat Ojol, (3) Boss Dialog + Voice Meter, (4) Panic Button
class Day3 extends Phaser.Scene {
  constructor() {
    super({ key: "Day3" });
  }

  // ══════════════════════════════════════════════════════════════════════
  create() {
    GameState.day = 3;
    // Fix #6: BGM Hari 3 — melodi gelap/misterius
    AudioManager.startBGM(75, "day3");
    this.cameras.main.fadeIn(600);
    const W = CFG.WIDTH,
      H = CFG.HEIGHT;

    // Phase: intro | chat_v2 | plat_check | boss_approach |
    //        boss_dialog | panic | educard | complete
    this.phase = "intro";
    this.chatV2Idx = 0;
    this.bossDialog = 0;
    this.bossMental = 1.0; // 0 = boss kalah
    this.voiceAccum = 0; // ms voice held
    this.voiceTarget = 5000; // 5 detik teriak non-stop
    this.panicUsed = false;
    this._rainTimer = 0;
    this._paused = false;

    // Background
    this.bgGfx = this.add.graphics().setDepth(0);
    this.rainGfx = this.add.graphics().setDepth(1);
    this.charGfx = this.add.graphics().setDepth(10);

    this._drawParkiranBackground();

    // HUD
    this._buildHUD();

    // Dialog
    this.dlg = new DialogManager(this);

    // Voice meter
    voiceMeter.start().then((ok) => {
      if (!ok) this._buildTeraikBtn();
    });

    this._showIntro();
  }

  // ══════════════════════════════════════════════════════════════════════
  _drawParkiranBackground() {
    const g = this.bgGfx;
    const W = CFG.WIDTH,
      H = CFG.HEIGHT;
    g.clear();

    // Langit hujan
    g.fillStyle(CFG.C.SKY_RAIN);
    g.fillRect(0, 0, W, H);
    g.fillStyle(0x2d3748, 0.9);
    g.fillEllipse(W * 0.3, 25, 280, 70);
    g.fillEllipse(W * 0.72, 15, 320, 80);
    g.fillEllipse(W * 0.55, 30, 200, 60);

    // Aspal parkiran
    g.fillStyle(0x2d2d2d);
    g.fillRect(0, H * 0.52, W, H * 0.48);
    // Garis parkir
    g.lineStyle(2, 0xffffff, 0.25);
    for (let x = 80; x < W; x += 120) {
      g.lineBetween(x, H * 0.52, x, H * 0.92);
    }
    // Garis kuning jalan
    g.lineStyle(2, 0xffff00, 0.3);
    g.lineBetween(0, H * 0.7, W, H * 0.7);

    // Dinding sekolah (latar)
    g.fillStyle(0xbbccbb);
    g.fillRect(0, H * 0.18, W, H * 0.35);
    g.fillStyle(0x3366cc);
    g.fillRect(0, H * 0.14, W, 8); // garis atap

    // Jendela sekolah
    for (let wx = 60; wx < W; wx += 120) {
      g.fillStyle(0x87ceeb, 0.6);
      g.fillRect(wx, H * 0.22, 60, 40);
      g.lineStyle(1, 0x555);
      g.strokeRect(wx, H * 0.22, 60, 40);
    }

    // Logo sekolah
    this.add
      .text(W / 2, H * 0.16, "SMP HARAPAN", {
        fontFamily: "Arial",
        fontSize: "12px",
        color: "#FFFFFF",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(2);

    // Mobil parkir
    [
      [80, H * 0.55, 0x336688],
      [220, H * 0.55, 0x553322],
      [560, H * 0.55, 0x334455],
    ].forEach(([mx, my, mc]) => {
      g.fillStyle(mc);
      g.fillRoundedRect(mx, my, 120, 50, 6);
      g.fillStyle(0x87ceeb, 0.5);
      g.fillRect(mx + 8, my + 5, 50, 22);
      g.fillStyle(0x222);
      g.fillCircle(mx + 20, my + 50, 9);
      g.fillCircle(mx + 100, my + 50, 9);
    });
  }

  // ══════════════════════════════════════════════════════════════════════
  // HUD
  _buildHUD() {
    const W = CFG.WIDTH;
    this.hudGfx = this.add.graphics().setScrollFactor(0).setDepth(50);
    this.hudLives = this.add.graphics().setScrollFactor(0).setDepth(51);
    this.hudScore = this.add
      .text(10, 10, "Skor: " + GameState.score, CFG.F.HUD)
      .setScrollFactor(0)
      .setDepth(51);
    this.hudVoice = this.add.graphics().setScrollFactor(0).setDepth(51);

    // Feature #8: Progress indicator Hari 1→2→3
    {
      const pxA = [W / 2 - 82, W / 2, W / 2 + 82],
        pcy = 17,
        pr = 8,
        pDay = 3;
      const pg = this.add.graphics().setScrollFactor(0).setDepth(53);
      for (let i = 0; i < 2; i++) {
        pg.lineStyle(2, pDay > i + 1 ? 0x33aa55 : 0x3a3a3a, 0.9);
        pg.lineBetween(pxA[i] + pr + 1, pcy, pxA[i + 1] - pr - 1, pcy);
      }
      [
        [1, "H1"],
        [2, "H2"],
        [3, "H3"],
      ].forEach(([d, lbl], i) => {
        const cx = pxA[i],
          done = d < pDay,
          curr = d === pDay;
        if (done) {
          pg.fillStyle(0x33aa55, 1);
          pg.fillCircle(cx, pcy, pr);
        } else if (curr) {
          pg.fillStyle(0xffd700, 1);
          pg.fillCircle(cx, pcy, pr);
        } else {
          pg.fillStyle(0x222222, 0.85);
          pg.fillCircle(cx, pcy, pr);
          pg.lineStyle(1, 0x555555);
          pg.strokeCircle(cx, pcy, pr);
        }
        this.add
          .text(cx, pcy, done ? "\u2713" : `${d}`, {
            fontFamily: "Arial",
            fontSize: "11px",
            color: done ? "#AAFFCC" : curr ? "#000000" : "#555555",
            fontStyle: curr ? "bold" : "normal",
          })
          .setOrigin(0.5)
          .setScrollFactor(0)
          .setDepth(54);
        this.add
          .text(cx, pcy + 12, lbl, {
            fontFamily: "Arial",
            fontSize: "8px",
            color: done ? "#44FF88" : curr ? "#FFD700" : "#444444",
          })
          .setOrigin(0.5)
          .setScrollFactor(0)
          .setDepth(54);
      });
    }
    this.voiceBarLbl = this.add
      .text(10, CFG.HEIGHT - 45, "", {
        ...CFG.F.SMALL,
        color: "#FF8888",
      })
      .setScrollFactor(0)
      .setDepth(51);
    this.voiceBarGfx = this.add.graphics().setScrollFactor(0).setDepth(51);

    // Tombol pause di pojok kiri bawah (di atas voiceBarLbl)
    const pauseBg = this.add.graphics().setScrollFactor(0).setDepth(55);
    pauseBg.fillStyle(0x000000, 0.55);
    pauseBg.fillRoundedRect(5, CFG.HEIGHT - 24, 56, 20, 4);
    this.add
      .text(33, CFG.HEIGHT - 14, "⏸ JEDA", {
        fontFamily: "Arial",
        fontSize: "10px",
        color: "#FFD700",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(56);
    this.add
      .zone(5, CFG.HEIGHT - 24, 56, 20)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(57)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => this._showPause());
  }

  _buildTeraikBtn() {
    const W = CFG.WIDTH,
      H = CFG.HEIGHT;
    const bgB = this.add.graphics().setScrollFactor(0).setDepth(60);
    bgB.fillStyle(CFG.C.BAHAYA, 0.9);
    bgB.fillRoundedRect(W - 110, H - 62, 100, 44, 10);
    this.teraikBtn = this.add
      .text(W - 60, H - 40, "📢 TERIAK!", {
        fontFamily: "Arial",
        fontSize: "14px",
        color: "#FFF",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(61)
      .setInteractive({ useHandCursor: true });
    this.teraikBtn.on("pointerdown", () => voiceMeter.simulateShout(900));
  }

  _updateHUD() {
    this.hudGfx.clear();
    this.hudGfx.fillStyle(0x000000, 0.55);
    this.hudGfx.fillRoundedRect(5, 5, 160, 30, 6);
    DrawUtils.hearts(
      this.hudLives.clear(),
      14,
      20,
      GameState.lives,
      GameState.maxLives,
    );
    this.hudScore.setText("Skor: " + GameState.score);
    DrawUtils.voiceMeterBar(
      this.hudVoice.clear(),
      CFG.WIDTH - 135,
      10,
      120,
      16,
      voiceMeter.get(),
    );

    // Boss fight voice progress
    if (this.phase === "boss_dialog") {
      const pct = Math.min(1, this.voiceAccum / this.voiceTarget);
      this.voiceBarLbl.setText(`📢 Tahan TERIAK: ${Math.round(pct * 100)}%`);
      this.voiceBarGfx.clear();
      this.voiceBarGfx.fillStyle(0x333333);
      this.voiceBarGfx.fillRoundedRect(10, CFG.HEIGHT - 40, 200, 14, 5);
      this.voiceBarGfx.fillStyle(pct >= 1 ? CFG.C.AMAN : CFG.C.BAHAYA);
      this.voiceBarGfx.fillRoundedRect(10, CFG.HEIGHT - 40, 200 * pct, 14, 5);
    } else {
      this.voiceBarLbl.setText("");
      this.voiceBarGfx.clear();
    }
  }

  // ══════════════════════════════════════════════════════════════════════
  _showIntro() {
    const W = CFG.WIDTH,
      H = CFG.HEIGHT;
    const ov = this.add.graphics().setScrollFactor(0).setDepth(100);
    ov.fillStyle(0x000000, 0.75);
    ov.fillRect(0, 0, W, H);
    const t = this.add
      .text(W / 2, H / 2 - 25, "HARI 3: FINAL", {
        ...CFG.F.TITLE,
        fontSize: "26px",
        color: "#FF4444",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(101);
    const s = this.add
      .text(W / 2, H / 2 + 20, "📍 " + CFG.LOKASI.D3, {
        ...CFG.F.SUBTITLE,
        color: "#FFAAAA",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(101);
    this.tweens.add({
      targets: [ov, t, s],
      alpha: 0,
      duration: 700,
      delay: 2200,
      onComplete: () => {
        ov.destroy();
        t.destroy();
        s.destroy();
        // Konteks narasi: kenapa Rara ke parkiran sendirian
        this.dlg.show(
          [
            {
              speaker: "Narasi",
              portrait: "rara",
              text: "Bel pulang udah bunyi di SMP Harapan! 🔔\nTapi hujan deras banget hari ini...\nIbu Rara nggak bisa jemput. Rara harus pulang sendiri.",
            },
            {
              speaker: "Rara",
              portrait: "rara",
              text: '"Yah... tapi nggak apa-apa kok! 😤\nAku udah pesen ojol lewat HP.\nTinggal jalan dikit ke parkiran deh."',
            },
            {
              speaker: "Narasi",
              portrait: "rara",
              text: "Tap layar / TERIAK buat jalan ke parkiran!\nSemakin keras teriak = makin cepet jalannya! 🏃",
            },
          ],
          () => {
            this.phase = "walk_intro";
            this._startWalkIntroRain();
          },
        );
      },
    });
  }

  // ══════════════════════════════════════════════════════════════════════
  // WALK INTRO — Berjalan di hujan menuju parkiran
  _startWalkIntroRain() {
    const W = CFG.WIDTH,
      H = CFG.HEIGHT;
    const worldW = 1100;

    this.cameras.main.setBounds(0, 0, worldW, H);
    this._walkX = 80;
    this._walkBoosted = false;

    // Fix #D3-2: Hapus text orphan dari _drawParkiranBackground() sebelum wide world
    this.children.list
      .filter((c) => c.type === "Text" && c.depth <= 5)
      .forEach((c) => c.destroy());

    // Gambar dunia lebar (hujan)
    this.bgGfx.clear();
    this._drawWideRainWorld(worldW, H);

    this.charGfx.clear();
    DrawUtils.rara(this.charGfx, this._walkX, H * 0.47, "walk");

    this._walkHintTxt = this.add
      .text(
        W / 2,
        54,
        "➔ Jalan ke parkiran sekolah — TERIAK buat lari lebih cepat! 🏃",
        {
          ...CFG.F.SMALL,
          color: "#FFAAAA",
          stroke: "#000",
          strokeThickness: 2,
        },
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(20);

    this._walkTapHandler = () => {
      this._walkBoosted = true;
    };
    this.input.on("pointerdown", this._walkTapHandler);
  }

  _drawWideRainWorld(worldW, H) {
    const g = this.bgGfx;
    g.clear();

    // Langit hujan (full world)
    g.fillStyle(0x2a3340);
    g.fillRect(0, 0, worldW, H);

    // Awan gelap
    [
      [100, 18, 260, 65],
      [380, 10, 310, 75],
      [700, 20, 240, 60],
      [940, 15, 200, 55],
    ].forEach(([cx, cy, rw, rh]) => {
      g.fillStyle(0x1e2535, 0.9);
      g.fillEllipse(cx, cy, rw, rh);
    });

    // Aspal jalan sepanjang dunia
    g.fillStyle(0x2d2d2d);
    g.fillRect(0, H * 0.58, worldW, H * 0.42);
    // Trotoar
    g.fillStyle(0x404040);
    g.fillRect(0, H * 0.52, worldW, H * 0.07);
    // Marka jalan
    g.lineStyle(2, 0xffffff, 0.25);
    for (let x = 0; x < worldW; x += 90)
      g.lineBetween(x + 5, H * 0.7, x + 60, H * 0.7);

    // Bangunan sekolah (terlihat sejak awal di kejauhan)
    g.fillStyle(0x3a4a3a);
    g.fillRect(0, H * 0.2, worldW, H * 0.33);
    g.fillStyle(0x2d5a9e);
    g.fillRect(0, H * 0.16, worldW, 6);

    // Jendela sekolah (berulang sepanjang dunia)
    for (let wx = 40; wx < worldW; wx += 110) {
      const lit = Math.random() > 0.4;
      g.fillStyle(lit ? 0xffe8a0 : 0x2a4060, 0.75);
      g.fillRect(wx, H * 0.22, 60, 38);
      g.lineStyle(1, 0x335577, 0.6);
      g.strokeRect(wx, H * 0.22, 60, 38);
    }

    // Mobil parkir sepanjang rute
    [
      [80, H * 0.56, 0x335566],
      [280, H * 0.56, 0x553322],
      [480, H * 0.56, 0x334455],
      [680, H * 0.56, 0x446644],
      [850, H * 0.56, 0x332244],
    ].forEach(([mx, my, mc]) => {
      g.fillStyle(mc);
      g.fillRoundedRect(mx, my, 110, 45, 5);
      g.fillStyle(0x87ceeb, 0.4);
      g.fillRect(mx + 6, my + 5, 45, 20);
      g.fillStyle(0x111);
      g.fillCircle(mx + 18, my + 45, 8);
      g.fillCircle(mx + 92, my + 45, 8);
    });

    // Pohon kurus (hujan)
    [150, 360, 560, 760].forEach((tx) => {
      g.fillStyle(0x2a2010, 0.8);
      g.fillRect(tx, H * 0.38, 5, H * 0.15);
      g.fillStyle(0x1a3a15, 0.7);
      g.fillTriangle(tx - 18, H * 0.4, tx + 23, H * 0.4, tx + 2, H * 0.22);
    });

    // Area parkiran di ujung — destination
    const px = 940;
    g.fillStyle(0x1a1a1a);
    g.fillRect(px, H * 0.52, 140, H * 0.3);
    g.lineStyle(2, 0xffd700, 0.5);
    g.strokeRect(px, H * 0.52, 140, H * 0.3);
    this.add
      .text(px + 70, H * 0.55, "PARKIRAN\nSMP HARAPAN", {
        fontFamily: "Arial",
        fontSize: "10px",
        color: "#FFD700",
        align: "center",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(2);

    // Panah tujuan
    g.fillStyle(0xffd700, 0.7);
    for (let ax = 895; ax <= 930; ax += 18) {
      g.fillTriangle(ax, H * 0.5 - 5, ax + 13, H * 0.5, ax, H * 0.5 + 5);
    }
  }

  _tickWalkIntroRain(delta) {
    const W = CFG.WIDTH,
      H = CFG.HEIGHT;
    const speed = voiceMeter.isShout() ? 270 : this._walkBoosted ? 200 : 145;
    this._walkBoosted = false;

    this._walkX += (speed * delta) / 1000;
    this.cameras.main.scrollX = Math.max(0, this._walkX - W * 0.4);

    const anim = voiceMeter.isShout() ? "run" : "walk";
    this.charGfx.clear();
    DrawUtils.rara(this.charGfx, this._walkX, H * 0.47, anim);

    // Animasi hujan sederhana (gunakan rainGfx)
    this._rainTimer += delta;
    if (this._rainTimer > 40) {
      this._rainTimer = 0;
      this.rainGfx.clear();
      DrawUtils.skyRain(this.rainGfx, CFG.WIDTH, CFG.HEIGHT * 0.55);
    }

    if (this._walkHintTxt) {
      const dist = Math.max(0, Math.round((950 - this._walkX) / 10));
      this._walkHintTxt.setText(
        dist > 0
          ? `➔ Parkiran ${dist * 10}px lagi... (TERIAK untuk berlari!)`
          : "⚠ Rara tiba di parkiran...",
      );
    }

    if (this._walkX >= 950) {
      this.input.off("pointerdown", this._walkTapHandler);
      if (this._walkHintTxt) {
        this._walkHintTxt.destroy();
        this._walkHintTxt = null;
      }
      this.rainGfx.clear();
      this.cameras.main.scrollX = 0;
      this.cameras.main.setBounds(0, 0, CFG.WIDTH, CFG.HEIGHT);
      this._drawParkiranBackground();
      this.phase = "chat_v2";
      // Dialog kedatangan: konteks Rara sampai di parkiran + pesan mencurigakan
      this.dlg.show(
        [
          {
            speaker: "Narasi",
            portrait: "rara",
            text: "Rara akhirnya sampai di parkiran. Basah kuyup kena hujan! 😅\nDia langsung buka HP buat ngecek ojol-nya udah nyampe belum...",
          },
          {
            speaker: "Rara",
            portrait: "rara",
            text: '"Eh?! Ada notif dari nomor yang nggak aku kenal?! 😨\nSiapa nih... *deg-degan banget*"',
          },
        ],
        () => {
          this._startChatV2();
        },
      );
    }
  }

  // ══════════════════════════════════════════════════════════════════════
  // CHAT V2 — Pesan Agresif
  get _chatV2Msgs() {
    return [
      // GDD: 3 pesan berurutan dari "Paman Baik" — tema hujan/jemput
      {
        from: "boss",
        text: "Hai cantik! Hujan deras ya 😢 Hati-hati basah...",
      },
      {
        from: "boss",
        text: "Mau jemput? Gratis kok, kasihan kamu basah sendirian!",
      },
      { from: "boss", text: "🥺📱 Cepat balas dong sayang... Mana foto kamu?" },
      {
        from: "choice",
        choices: [
          {
            label: "📸 Oke, ini foto seragamku~",
            category: "BAHAYA",
            penalty: true,
            edu: "STOP! Jangan kirim foto ke orang yang nggak kamu kenal!\nFoto bisa dipakai buat ngemerasa atau ngancam kamu!",
          },
          {
            label: "🚗 Iya Om, aku di parkiran SMP. Jemput ya!",
            category: "BAHAYA",
            gameOver: true,
          },
          {
            label: "🚫 BLOKIR sekarang + lapor ke ortu!",
            category: "AMAN",
            points: 200,
            onPick: () => {
              GameState.earnAchievement("Pahlawan Diri Sendiri");
              AudioManager.sfxCorrect();
            },
          },
          {
            label: "� Screenshot dulu buat bukti... baru lapor",
            category: "RAGU",
            points: 100,
            onPick: () => {
              GameState.screenshotTaken = true;
              GameState.earnAchievement("Screenshot Evidence");
            },
          },
        ],
      },
    ];
  }

  _startChatV2() {
    this.chatV2Idx = 0;
    this._chatV2History = []; // Riwayat pesan untuk stacking
    this._showChatV2Msg();
  }

  _showChatV2Msg() {
    const msgs = this._chatV2Msgs;
    if (this.chatV2Idx >= msgs.length) {
      // Fix #D3-4: Tambah narasi transisi sebelum Cek Plat Ojol
      this.children.list.filter((c) => c._isChatV2).forEach((c) => c.destroy());
      this.dlg.show(
        [
          {
            speaker: "Narasi",
            portrait: "rara",
            text: "Yes! Rara berhasil, nggak terpancing pesan mencurigakan itu! 💪\nNah, ojol pesanan Rara baru aja tiba di parkiran!\nTapi jangan langsung naik — cek plat nomor dulu ya!",
          },
        ],
        () => {
          this.phase = "plat_check";
          this._startPlatCheck();
        },
      );
      return;
    }

    const msg = msgs[this.chatV2Idx];
    this.children.list.filter((c) => c._isChatV2).forEach((c) => c.destroy());
    this._drawChatV2Header();

    if (msg.from !== "choice") {
      // Tambah ke riwayat sebelum render (untuk stacking)
      if (!this._chatV2History) this._chatV2History = [];
      this._chatV2History.push(msg.text);
    }

    if (msg.from === "choice") {
      // Tampilkan riwayat pesan di atas panel pilihan
      this._drawChatV2Stack();
      this._showChatV2Choices(msg.choices);
      return;
    }

    const W = CFG.WIDTH,
      H = CFG.HEIGHT;
    // Tampilkan semua riwayat pesan bertumpuk (termasuk pesan baru)
    this._drawChatV2Stack();

    const next = this.add
      .text(W - 20, H - 28, "▶ TAP", CFG.F.SMALL)
      .setOrigin(1, 1)
      .setScrollFactor(0)
      .setDepth(81)
      .setInteractive({ useHandCursor: true });
    next._isChatV2 = true;
    this.tweens.add({
      targets: next,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1,
    });
    next.on("pointerdown", () => {
      this.chatV2Idx++;
      this._showChatV2Msg();
    });
  }

  // Render semua riwayat pesan chat secara bertumpuk (terlihat saat pilihan muncul)
  _drawChatV2Stack() {
    if (!this._chatV2History || this._chatV2History.length === 0) return;
    const W = CFG.WIDTH;
    const startY = 92;
    const bubbleH = 36;
    const gap = 8;
    this._chatV2History.forEach((text, i) => {
      const y = startY + i * (bubbleH + gap);
      const isCurrent = i === this._chatV2History.length - 1;
      const bubble = this.add.graphics().setScrollFactor(0).setDepth(80);
      bubble._isChatV2 = true;
      bubble.fillStyle(0x330000, isCurrent ? 0.95 : 0.62);
      bubble.fillRoundedRect(18, y, W * 0.76, bubbleH, 8);
      bubble.lineStyle(1.5, isCurrent ? 0xff4444 : 0x882222, 0.8);
      bubble.strokeRoundedRect(18, y, W * 0.76, bubbleH, 8);
      const txt = this.add
        .text(28, y + 9, text, {
          fontFamily: "Arial",
          fontSize: "13px",
          color: isCurrent ? "#FFAAAA" : "#CC7777",
          wordWrap: { width: W * 0.7 },
        })
        .setScrollFactor(0)
        .setDepth(81);
      txt._isChatV2 = true;
    });
  }

  _showChatV2Choices(choices) {
    const W = CFG.WIDTH,
      H = CFG.HEIGHT;
    const PANEL_Y = 222; // Di bawah 3 pesan bertumpuk (3×44px dari y=92)

    // Cancel previous timer if any
    if (this._chatV2Timer) {
      this._chatV2Timer.remove(false);
      this._chatV2Timer = null;
    }

    const panG = this.add.graphics().setScrollFactor(0).setDepth(80);
    panG._isChatV2 = true;
    panG.fillStyle(CFG.C.PANEL, 0.96);
    panG.fillRoundedRect(15, PANEL_Y, W - 30, 228, 12);
    DrawUtils.sulselBorder(panG, 15, PANEL_Y, W - 30, 228, 0.7);

    this.add
      .text(W / 2, PANEL_Y + 14, "Pilih respons Rara yang paling tepat!", {
        fontFamily: "Arial",
        fontSize: "13px",
        color: "#FF8888",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(81)._isChatV2 = true;

    // ── 6-detik countdown timer (GDD spec)
    let secs = 6;
    const timerTxt = this.add
      .text(W - 24, PANEL_Y + 14, "⏱ 6s", {
        fontFamily: "Arial",
        fontSize: "13px",
        color: "#FFD700",
        fontStyle: "bold",
      })
      .setOrigin(1, 0.5)
      .setScrollFactor(0)
      .setDepth(82);
    timerTxt._isChatV2 = true;

    const _stopV2Timer = () => {
      if (this._chatV2Timer) {
        this._chatV2Timer.remove(false);
        this._chatV2Timer = null;
      }
    };

    this._chatV2Timer = this.time.addEvent({
      delay: 1000,
      repeat: -1,
      callback: () => {
        secs--;
        if (timerTxt.active) {
          timerTxt.setText("⏱ " + secs + "s");
          if (secs <= 3) timerTxt.setColor("#FF4444");
        }
        if (secs <= 0) {
          _stopV2Timer();
          // Timeout: Rara panik, dianggap BAHAYA
          this.children.list
            .filter((c) => c._isChatV2)
            .forEach((c) => c.destroy());
          GameState.addChoice(3, "Terlalu lama merespons", "BAHAYA");
          GameState.loseLife();
          if (!GameState.isAlive()) {
            this._goGameOver();
            return;
          }
          this.chatV2Idx++;
          this._showChatV2Msg();
        }
      },
    });

    choices.forEach((c, i) => {
      const by = PANEL_Y + 34 + i * 42;
      const bw = W - 40;
      const bg2 = this.add.graphics().setScrollFactor(0).setDepth(80);
      bg2._isChatV2 = true;
      const col =
        c.category === "AMAN"
          ? CFG.C.AMAN
          : c.category === "BAHAYA"
            ? CFG.C.BAHAYA
            : CFG.C.RAGU;
      bg2.fillStyle(col, 0.75);
      bg2.fillRoundedRect(20, by, bw, 38, 8);

      const lbl = this.add
        .text(W / 2, by + 19, c.label, {
          fontFamily: "Arial",
          fontSize: "13px",
          color: "#FFF",
          wordWrap: { width: bw - 20 },
          align: "center",
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(81)
        .setInteractive({ useHandCursor: true });
      lbl._isChatV2 = true;

      lbl.on("pointerdown", () => {
        _stopV2Timer();
        // Fix #D3-3: Gunakan overridePts agar tidak double-counting skor
        GameState.addChoice(3, c.label, c.category, c.points);
        if (c.onPick) c.onPick();

        // "Iya Om Jemput" = instant Game Over (GDD: most dangerous choice)
        if (c.gameOver) {
          this.children.list
            .filter((cc) => cc._isChatV2)
            .forEach((cc) => cc.destroy());
          const goG = this.add.graphics().setScrollFactor(0).setDepth(200);
          goG.fillStyle(0x330000, 0.96);
          goG.fillRoundedRect(15, H / 2 - 90, W - 30, 180, 12);
          goG.lineStyle(3, CFG.C.BAHAYA, 0.9);
          goG.strokeRoundedRect(15, H / 2 - 90, W - 30, 180, 12);
          this.add
            .text(W / 2, H / 2 - 74, "☠ GAME OVER", {
              fontFamily: "Arial",
              fontSize: "22px",
              color: "#FF4444",
              fontStyle: "bold",
            })
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(201);
          this.add
            .text(
              W / 2,
              H / 2 - 36,
              "Rara pergi sama orang nggak dikenal dari internet! 😱\nJangan PERNAH kasih lokasi atau minta dijemput orang asing!",
              {
                fontFamily: "Arial",
                fontSize: "13px",
                color: "#FFCCCC",
                align: "center",
                wordWrap: { width: W - 60 },
              },
            )
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(201);
          this.time.delayedCall(3500, () => this._goGameOver());
          return;
        }

        if (c.category === "BAHAYA" && c.penalty) {
          GameState.loseLife();
          if (!GameState.isAlive()) {
            this._goGameOver();
            return;
          }
        }

        this.children.list
          .filter((cc) => cc._isChatV2)
          .forEach((cc) => cc.destroy());

        // Edu popup for BAHAYA choices with edu text
        if (c.category === "BAHAYA" && c.edu) {
          const eduG = this.add.graphics().setScrollFactor(0).setDepth(200);
          eduG.fillStyle(0x330000, 0.93);
          eduG.fillRoundedRect(15, H / 2 - 85, W - 30, 170, 12);
          eduG.lineStyle(3, CFG.C.BAHAYA, 0.9);
          eduG.strokeRoundedRect(15, H / 2 - 85, W - 30, 170, 12);
          const eduT = this.add
            .text(
              W / 2,
              H / 2 - 68,
              "⚠ BAHAYA! " + (c.penalty ? "(-1 ❤)" : ""),
              {
                fontFamily: "Arial",
                fontSize: "15px",
                color: "#FF4444",
                fontStyle: "bold",
              },
            )
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(201);
          const eduB = this.add
            .text(W / 2, H / 2 - 20, c.edu, {
              fontFamily: "Arial",
              fontSize: "13px",
              color: "#FFCCCC",
              wordWrap: { width: W - 60 },
              align: "center",
              lineSpacing: 5,
            })
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(201);
          const eduBtn = this.add
            .text(W / 2, H / 2 + 66, "[ MENGERTI ]", {
              fontFamily: "Arial",
              fontSize: "13px",
              color: "#FFD700",
              fontStyle: "bold",
            })
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(201)
            .setInteractive({ useHandCursor: true });
          eduBtn.on("pointerdown", () => {
            [eduG, eduT, eduB, eduBtn].forEach((o) => o.destroy());
            this.chatV2Idx++;
            this._showChatV2Msg();
          });
          return;
        }

        // Score feedback for non-BAHAYA picks
        const pts =
          c.points != null
            ? c.points
            : c.category === "AMAN"
              ? CFG.SCORE.AMAN
              : CFG.SCORE.RAGU;
        // Tidak perlu tambah skor lagi — sudah ditangani oleh GameState.addChoice() di atas
        const fb = this.add
          .text(
            W / 2,
            H / 2,
            c.category === "AMAN"
              ? `✓ Pilihan tepat! +${pts}`
              : `⚠ Bisa lebih baik... +${pts}`,
            {
              fontFamily: "Arial",
              fontSize: "18px",
              color: c.category === "AMAN" ? "#44FF88" : "#FFD700",
              fontStyle: "bold",
              stroke: "#000",
              strokeThickness: 3,
            },
          )
          .setOrigin(0.5)
          .setScrollFactor(0)
          .setDepth(200);
        this.tweens.add({
          targets: fb,
          y: H / 2 - 40,
          alpha: 0,
          duration: 1200,
          onComplete: () => {
            fb.destroy();
            this.chatV2Idx++;
            this._showChatV2Msg();
          },
        });
      });
    });
  }

  _drawChatV2Header() {
    const W = CFG.WIDTH,
      H = CFG.HEIGHT;
    const hdr = this.add.graphics().setScrollFactor(0).setDepth(79);
    hdr._isChatV2 = true;
    hdr.fillStyle(0x8b0000, 0.95);
    hdr.fillRect(0, 40, W, 46);
    const lbl = this.add
      .text(W / 2, 63, "💀 Paman Baik — Nomor Tidak Dikenal", {
        fontFamily: "Arial",
        fontSize: "13px",
        color: "#FFAAAA",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(80);
    lbl._isChatV2 = true;
  }

  // ══════════════════════════════════════════════════════════════════════
  // CEK PLAT OJOL
  _startPlatCheck() {
    this.children.list.filter((c) => c._isChatV2).forEach((c) => c.destroy());
    const W = CFG.WIDTH,
      H = CFG.HEIGHT;
    this.charGfx.clear();
    DrawUtils.rara(this.charGfx, W * 0.15, H * 0.55, "idle");

    // Panel cek plat
    const panG = this.add.graphics().setScrollFactor(0).setDepth(80);
    panG.fillStyle(CFG.C.PANEL, 0.97);
    panG.fillRoundedRect(15, 40, W - 30, H - 80, 14);
    DrawUtils.sulselBorder(panG, 15, 40, W - 30, H - 80, 0.9);
    panG._isPlatObj = true;

    this.add
      .text(W / 2, 58, "🏍 CEK PLAT NOMOR OJOL", {
        fontFamily: "Arial",
        fontSize: "17px",
        color: "#FFD700",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(81)._isPlatObj = true;

    this.add
      .text(
        W / 2,
        85,
        "Di aplikasi, plat ojol Rara: DD 3472 WK\nPilih motor yang platnya SAMA ya!",
        {
          fontFamily: "Arial",
          fontSize: "14px",
          color: "#EEE",
          align: "center",
        },
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(81)._isPlatObj = true;

    const options = [
      { plat: "DD 3472 WK", correct: true },
      { plat: "DB 8831 QP", correct: false },
      { plat: "DT 5619 MN", correct: false },
    ];

    options.forEach((opt, i) => {
      const by = 140 + i * 65;
      const bg2 = this.add.graphics().setScrollFactor(0).setDepth(80);
      bg2._isPlatObj = true;
      bg2.fillStyle(0x222244, 0.85);
      bg2.fillRoundedRect(W / 2 - 130, by, 260, 52, 10);
      bg2.lineStyle(2, 0x4466aa);
      bg2.strokeRoundedRect(W / 2 - 130, by, 260, 52, 10);

      const lbl = this.add
        .text(W / 2, by + 26, opt.plat, {
          fontFamily: "Courier New, monospace",
          fontSize: "22px",
          color: "#FFFF00",
          fontStyle: "bold",
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(81)
        .setInteractive({ useHandCursor: true });
      lbl._isPlatObj = true;

      lbl.on("pointerover", () => lbl.setColor("#FFFFFF"));
      lbl.on("pointerout", () => lbl.setColor("#FFFF00"));
      lbl.on("pointerdown", () => this._onPlatChoice(opt));
    });

    this.add
      .text(W / 2, H - 60, "⚠ WAJIB cek plat nomor sebelum naik ojol!", {
        fontFamily: "Arial",
        fontSize: "13px",
        color: "#FF8888",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(81)._isPlatObj = true;
  }

  _onPlatChoice(opt) {
    this.children.list.filter((c) => c._isPlatObj).forEach((c) => c.destroy());
    const W = CFG.WIDTH,
      H = CFG.HEIGHT;

    if (!opt.correct) {
      // GAME OVER variasi — naik ojol palsu
      GameState.addChoice(3, "Naik ojol tanpa cek plat", "BAHAYA");
      const ov = this.add.graphics().setScrollFactor(0).setDepth(200);
      ov.fillStyle(0x000000, 0.92);
      ov.fillRect(0, 0, W, H);
      this.add
        .text(W / 2, H / 2 - 40, "🚨 PLAT SALAH!\nRara naik ojol palsu!", {
          fontFamily: "Arial",
          fontSize: "22px",
          color: "#FF4444",
          align: "center",
          fontStyle: "bold",
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(201);
      this.add
        .text(
          W / 2,
          H / 2 + 30,
          "Selalu cocokin plat di aplikasi sama plat di motor!\nKalau beda, jangan naik! Telpon driver dulu buat konfirmasi.",
          {
            fontFamily: "Arial",
            fontSize: "14px",
            color: "#FFCCCC",
            align: "center",
            wordWrap: { width: W - 60 },
          },
        )
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(201);
      this.time.delayedCall(3500, () => this._goGameOver());
      return;
    }

    GameState.addChoice(3, "Cek plat nomor dengan teliti", "AMAN");
    GameState.platChecked = true;
    GameState.earnAchievement("Cek Plat Sebelum Naik");

    const ok = this.add
      .text(W / 2, H / 2, "✓ PLAT BENAR! Rara aman!", {
        fontFamily: "Arial",
        fontSize: "22px",
        color: "#44FF88",
        fontStyle: "bold",
        stroke: "#000",
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(200);
    this.tweens.add({
      targets: ok,
      alpha: 0,
      delay: 1500,
      duration: 600,
      onComplete: () => {
        ok.destroy();
        // Checkpoint d3: cek plat selesai — skip langsung ke boss jika Game Over
        GameState.checkpoints.d3 = true;
        GameState.save();
        this.phase = "boss_approach";
        this._startBossApproach();
      },
    });
  }

  // ══════════════════════════════════════════════════════════════════════
  // BOSS APPROACH
  _startBossApproach() {
    this.charGfx.clear();
    const W = CFG.WIDTH,
      H = CFG.HEIGHT;

    // Gambar suasana parkiran — Rara takut, Si Bayangan menghalangi jalan
    DrawUtils.rara(this.charGfx, W * 0.22, H * 0.52, "scared");
    DrawUtils.shadowNpc(this.charGfx, W * 0.66, H * 0.46, false);

    this.dlg.show(
      [
        {
          speaker: "Narasi",
          portrait: "rara",
          text: "TUNGGU! Rara mau naik ojol...\ntapi seseorang tiba-tiba menghadang jalannya! 😱\nItu dia — si pengirim pesan tadi — muncul langsung di depan Rara!!",
        },
        {
          speaker: "Si Bayangan Gelap",
          portrait: "boss",
          text: '"Eh hei, mau kemana sendirian? 😏\nIkut aku dulu deh. Sebentar aja kok~"',
        },
        {
          speaker: "Rara",
          portrait: "rara",
          text: '"Aku... AKU NGGAK KENAL KAMU! MINGGIR!! 😤"\n\nRara ingat: DIAM ITU BAHAYA!\nDia harus TERIAK SEKERAS-KERASNYA dan MINTA TOLONG!',
        },
      ],
      () => {
        this.phase = "boss_dialog";
        this._startBossFight();
      },
    );
  }

  // ══════════════════════════════════════════════════════════════════════
  // BOSS FIGHT — Dialog Klimaks + Voice Meter
  _startBossFight() {
    // Fix #6: Ganti ke boss music saat mulai boss fight!
    AudioManager.startBGM(100, "boss");
    // Fix #8: Tutorial modal sebelum boss fight
    this._showInlineTutorial(
      "👊 LAWAN SI BAYANGAN!",
      "Pilih kata-kata yang PALING BERANI buat melawan!\n\nTahan tombol TERIAK! buat isi gauge suara.\nGauge penuh? Si Bayangan langsung kabur! 💨\n\nPilihan HIJAU (AMAN) paling ampuh nguras nyalinya!",
      () => {
        this.bossMental = 1.0;
        this.voiceAccum = 0;
        this.bossDialog = 0;
        this._showBossRound();
      },
    );
  }

  // Fix #8: Helper modal tutorial sekali-pakai untuk Day3
  _showInlineTutorial(title, body, onReady) {
    const W = CFG.WIDTH,
      H = CFG.HEIGHT;
    const tutObjs = [];
    const ov = this.add.graphics().setScrollFactor(0).setDepth(220);
    ov.fillStyle(0x000000, 0.75);
    ov.fillRect(0, 0, W, H);
    tutObjs.push(ov);
    const panel = this.add.graphics().setScrollFactor(0).setDepth(221);
    panel.fillStyle(0x220011, 0.97);
    panel.fillRoundedRect(W / 2 - 190, H / 2 - 110, 380, 220, 14);
    panel.lineStyle(3, 0xff4455, 0.9);
    panel.strokeRoundedRect(W / 2 - 190, H / 2 - 110, 380, 220, 14);
    tutObjs.push(panel);
    tutObjs.push(
      this.add
        .text(W / 2, H / 2 - 96, title, {
          fontFamily: "Arial",
          fontSize: "17px",
          color: "#FF8888",
          fontStyle: "bold",
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(222),
    );
    tutObjs.push(
      this.add
        .text(W / 2, H / 2 - 20, body, {
          fontFamily: "Arial",
          fontSize: "13px",
          color: "#FFDDDD",
          align: "center",
          wordWrap: { width: 340 },
          lineSpacing: 5,
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(222),
    );
    const btnG = this.add.graphics().setScrollFactor(0).setDepth(222);
    btnG.fillStyle(0x880022, 0.9);
    btnG.fillRoundedRect(W / 2 - 75, H / 2 + 78, 150, 32, 10);
    btnG.lineStyle(2, 0xff4455, 0.7);
    btnG.strokeRoundedRect(W / 2 - 75, H / 2 + 78, 150, 32, 10);
    tutObjs.push(btnG);
    const btnLbl = this.add
      .text(W / 2, H / 2 + 94, "⚡ SIAP! AYO LAWAN! 💪", {
        fontFamily: "Arial",
        fontSize: "14px",
        color: "#FF8888",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(223)
      .setInteractive({ useHandCursor: true });
    tutObjs.push(btnLbl);
    btnLbl.on("pointerover", () => {
      btnG.setAlpha(0.65);
      btnLbl.setColor("#FFFFFF");
    });
    btnLbl.on("pointerout", () => {
      btnG.setAlpha(1);
      btnLbl.setColor("#FF8888");
    });
    btnLbl.on("pointerdown", () => {
      AudioManager.sfxClick();
      tutObjs.forEach((o) => o.destroy());
      if (onReady) onReady();
    });
  }

  get _bossRounds() {
    return [
      {
        bossText:
          '"Sssst! Jangan teriak-teriak, nanti kamu yang dimarahin orang. Diam aja ya~"',
        choices: [
          {
            label: '"JANGAN DEKET-DEKET! TOLONG!! 🔊" (Teriak KERAS!)',
            category: "AMAN",
            dmg: 0.25,
          },
          {
            label: '"T-tolong..." (suaranya hampir nggak kedengeran)',
            category: "RAGU",
            dmg: 0.1,
          },
          {
            label: "(beku di tempat, nggak bisa ngomong...)",
            category: "BAHAYA",
            dmg: 0,
          },
        ],
      },
      {
        bossText:
          '"Haha, emangnya siapa yang bakal percaya sama kamu? Nggak ada! Diam aja~"',
        choices: [
          {
            label: '"PERGI! Aku PERCAYA SAMA DIRI SENDIRI! TOLONG!! 💪"',
            category: "AMAN",
            dmg: 0.25,
          },
          {
            label: '"Emangnya... kenapa sih?" (masih ragu-ragu)',
            category: "RAGU",
            dmg: 0.1,
          },
          {
            label: "(nangis diem-diem, nggak berani berbuat apa-apa)",
            category: "BAHAYA",
            dmg: 0,
          },
        ],
      },
      {
        bossText:
          '"Ini rahasia kita berdua ya. Kalau kamu ngadu — kamu sendiri yang bakal kena masalah!"',
        choices: [
          {
            label: '"Bohong! AKU BAKAL CERITA ke guru sekarang! 🔊"',
            category: "AMAN",
            dmg: 0.25,
          },
          {
            label: '"Mungkin... emang salah aku ya..." (mulai pasrah)',
            category: "BAHAYA",
            dmg: 0,
          },
          {
            label: '"Aku nggak tau harus ngapain..." (bingung banget)',
            category: "RAGU",
            dmg: 0.1,
          },
        ],
      },
      {
        bossText:
          '"Udah deh, ikut aja. Aku janji nggak bakal nyakitin kamu kok~"',
        choices: [
          {
            label: '"JANGAN SENTUH AKU!! TOLONG!!! 🆘" (Voice MAX)',
            category: "AMAN",
            dmg: 0.3,
            isPanic: true,
          },
          {
            label: '"Se-sebentar aja ya..." (hampir menyerah)',
            category: "BAHAYA",
            dmg: 0,
          },
          {
            label: '"A-aku mau kabur..." (tapi nggak tau caranya)',
            category: "RAGU",
            dmg: 0.1,
          },
        ],
      },
      // GDD Stage E: Ronde Final — Panic Button
      {
        bossText:
          '"Pasrah aja lah! Nggak ada yang bisa nolongin kamu di sini!"',
        choices: [
          {
            label: "📢 TERIAK SEKERAS-KERASNYA!! TO-LONG!!! 🆘 (Voice MAX!!)",
            category: "AMAN",
            dmg: 0.35,
            isPanic: true,
          },
          {
            label: '"T-tolong..." (berbisik, hampir menyerah...)',
            category: "RAGU",
            dmg: 0.1,
          },
          {
            label: "(pasrah total... nggak ada tenaga lagi buat melawan)",
            category: "BAHAYA",
            dmg: 0,
          },
        ],
      },
    ];
  }

  _showBossRound() {
    if (this.bossDialog >= this._bossRounds.length || this.bossMental <= 0) {
      this._bossDies();
      return;
    }

    const round = this._bossRounds[this.bossDialog];
    const W = CFG.WIDTH,
      H = CFG.HEIGHT;

    // Draw boss
    this.charGfx.clear();
    DrawUtils.rara(this.charGfx, W * 0.15, H * 0.55, "scared");
    DrawUtils.boss(this.charGfx, W * 0.7, H * 0.44, this.bossMental);

    // Boss text bubble
    this.children.list
      .filter((c) => c._isBossRound)
      .forEach((c) => c.destroy());

    const bubble = this.add.graphics().setScrollFactor(0).setDepth(80);
    bubble._isBossRound = true;
    bubble.fillStyle(0x330000, 0.97);
    bubble.fillRoundedRect(15, H * 0.12, W - 30, 75, 10);
    bubble.lineStyle(2, 0xff4444, 0.8);
    bubble.strokeRoundedRect(15, H * 0.12, W - 30, 75, 10);

    const bTxt = this.add
      .text(W / 2, H * 0.14, round.bossText, {
        fontFamily: "Arial",
        fontSize: "14px",
        color: "#FFAAAA",
        wordWrap: { width: W - 50 },
        align: "center",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(81);
    bTxt._isBossRound = true;

    // Round indicator
    const ri = this.add
      .text(
        W / 2,
        H * 0.3,
        `⚔️ Ronde ${this.bossDialog + 1} dari ${this._bossRounds.length}`,
        {
          fontFamily: "Arial",
          fontSize: "13px",
          color: "#FF8888",
        },
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(81);
    ri._isBossRound = true;

    // Pilihan
    round.choices.forEach((c, i) => {
      const by = H * 0.34 + i * 52;
      const bg2 = this.add.graphics().setScrollFactor(0).setDepth(80);
      bg2._isBossRound = true;
      const col =
        c.category === "AMAN"
          ? CFG.C.AMAN
          : c.category === "BAHAYA"
            ? CFG.C.BAHAYA
            : CFG.C.RAGU;
      bg2.fillStyle(col, 0.78);
      bg2.fillRoundedRect(20, by, W - 40, 44, 8);
      bg2.lineStyle(1.5, 0xffffff, 0.3);
      bg2.strokeRoundedRect(20, by, W - 40, 44, 8);

      const lbl = this.add
        .text(W / 2, by + 22, c.label, {
          fontFamily: "Arial",
          fontSize: "14px",
          color: "#FFF",
          wordWrap: { width: W - 60 },
          align: "center",
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(81)
        .setInteractive({ useHandCursor: true });
      lbl._isBossRound = true;

      lbl.on("pointerover", () => lbl.setAlpha(0.7));
      lbl.on("pointerout", () => lbl.setAlpha(1.0));
      lbl.on("pointerdown", () => {
        GameState.addChoice(3, c.label, c.category);
        if (c.category === "BAHAYA") GameState.loseLife();
        if (!GameState.isAlive()) {
          this._goGameOver();
          return;
        }
        this.bossMental = Math.max(0, this.bossMental - (c.dmg || 0));
        // SFX + camera shake + floating reaction text
        if (c.category === "AMAN") {
          AudioManager.sfxBossHit();
          AudioManager.sfxBossGroan();
          this.cameras.main.shake(180, 0.007);
          const hitTxt = this.add
            .text(
              W * 0.68,
              H * 0.28,
              `💥 -${Math.round((c.dmg || 0) * 100)}% Mental!`,
              {
                fontFamily: "Arial",
                fontSize: "16px",
                color: "#FFD700",
                fontStyle: "bold",
                stroke: "#000",
                strokeThickness: 3,
              },
            )
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(200);
          this.tweens.add({
            targets: hitTxt,
            y: H * 0.12,
            alpha: 0,
            duration: 1000,
            onComplete: () => hitTxt.destroy(),
          });
          const reactTxt = this.add
            .text(W * 0.2, H * 0.42, "💪 BERANI!", {
              fontFamily: "Arial",
              fontSize: "14px",
              color: "#44FF88",
              fontStyle: "bold",
              stroke: "#000",
              strokeThickness: 2,
            })
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(200);
          this.tweens.add({
            targets: reactTxt,
            y: H * 0.32,
            alpha: 0,
            duration: 900,
            delay: 100,
            onComplete: () => reactTxt.destroy(),
          });
        } else if (c.category === "RAGU") {
          AudioManager.sfxNeutral();
          const raguTxt = this.add
            .text(W * 0.5, H * 0.35, "😟 Kurang kuat...", {
              fontFamily: "Arial",
              fontSize: "14px",
              color: "#FFD700",
              stroke: "#000",
              strokeThickness: 2,
            })
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(200);
          this.tweens.add({
            targets: raguTxt,
            y: H * 0.25,
            alpha: 0,
            duration: 900,
            onComplete: () => raguTxt.destroy(),
          });
        } else {
          AudioManager.sfxWrong();
          const badTxt = this.add
            .text(W * 0.5, H * 0.38, "😨 Bahaya! -1 ❤", {
              fontFamily: "Arial",
              fontSize: "14px",
              color: "#FF4444",
              fontStyle: "bold",
              stroke: "#000",
              strokeThickness: 2,
            })
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(200);
          this.tweens.add({
            targets: badTxt,
            y: H * 0.28,
            alpha: 0,
            duration: 900,
            onComplete: () => badTxt.destroy(),
          });
        }
        if (c.isPanic) {
          this._triggerPanicButton();
        } else {
          this.children.list
            .filter((cc) => cc._isBossRound)
            .forEach((cc) => cc.destroy());
          this.bossDialog++;
          this._showBossRound();
        }
      });
    });
  }

  // ══════════════════════════════════════════════════════════════════════
  // PANIC BUTTON
  _triggerPanicButton() {
    this.children.list
      .filter((c) => c._isBossRound)
      .forEach((c) => c.destroy());
    this.phase = "panic";
    this.panicUsed = true;
    GameState.earnAchievement("Panic Button Hero");

    const W = CFG.WIDTH,
      H = CFG.HEIGHT;
    const ov = this.add.graphics().setScrollFactor(0).setDepth(150);
    ov.fillStyle(0xff0000, 0.25);
    ov.fillRect(0, 0, W, H);

    // Tombol darurat besar
    const btnG = this.add.graphics().setScrollFactor(0).setDepth(151);
    btnG.fillStyle(0xff0000, 0.92);
    btnG.fillCircle(W / 2, H / 2 - 20, 80);
    btnG.lineStyle(6, 0xffffff, 0.9);
    btnG.strokeCircle(W / 2, H / 2 - 20, 80);

    const btnTxt = this.add
      .text(W / 2, H / 2 - 20, "🆘\nPANIC\nBUTTON", {
        fontFamily: "Arial",
        fontSize: "18px",
        color: "#FFFFFF",
        fontStyle: "bold",
        align: "center",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(152)
      .setInteractive({ useHandCursor: true });

    // Kedip
    this.tweens.add({
      targets: btnG,
      alpha: 0.5,
      duration: 300,
      yoyo: true,
      repeat: 4,
    });

    this.add
      .text(W / 2, H / 2 + 75, "TAP TOMBOL PANIK!! 🆘", {
        fontFamily: "Arial",
        fontSize: "16px",
        color: "#FFD700",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(152);

    btnTxt.once("pointerdown", () => {
      [ov, btnG, btnTxt].forEach((o) => o.destroy());
      this.children.list
        .filter((c) => c.depth === 152)
        .forEach((c) => c.destroy());
      this._showRescue();
    });
  }

  _showRescue() {
    const W = CFG.WIDTH,
      H = CFG.HEIGHT;
    this.charGfx.clear();
    DrawUtils.rara(this.charGfx, W * 0.35, H * 0.5, "idle");

    // Polisi & guru datang
    const helperGfx = this.add.graphics().setDepth(12);
    // Polisi kiri
    helperGfx.fillStyle(CFG.C.RARA_SKIN);
    helperGfx.fillCircle(W * 0.1, H * 0.48, 14);
    helperGfx.fillStyle(0x003399);
    helperGfx.fillRect(W * 0.1 - 14, H * 0.48 + 8, 28, 30);
    helperGfx.fillStyle(CFG.C.GOLD);
    helperGfx.fillRect(W * 0.1 - 6, H * 0.45, 12, 5);
    // Guru kanan
    helperGfx.fillStyle(CFG.C.RARA_SKIN);
    helperGfx.fillCircle(W * 0.88, H * 0.48, 14);
    helperGfx.fillStyle(0x336633);
    helperGfx.fillRect(W * 0.88 - 14, H * 0.48 + 8, 28, 30);

    // Boss kabur — objek terpisah supaya bisa di-tween
    const bossFleeGfx = this.add.graphics().setDepth(12);
    DrawUtils.shadowNpc(bossFleeGfx, W * 0.65, H * 0.45, true);
    this.tweens.add({
      targets: bossFleeGfx,
      x: W * 0.5,
      alpha: 0,
      duration: 900,
      ease: "Power2",
      onComplete: () => bossFleeGfx.destroy(),
    });

    this.tweens.add({
      targets: helperGfx,
      x: W * 0.3,
      duration: 1200,
      ease: "Power2",
    });

    this.dlg.show(
      [
        {
          speaker: "Pak Guru & Polisi",
          portrait: "polisi",
          text: '"HEEEI! Ada apa ini?! Kami denger ada yang teriak!" 🚔\n\nSi Bayangan Gelap langsung kabur terbirit-birit! Pengecut!',
        },
        {
          speaker: "Rara",
          portrait: "rara",
          text: '"Pak Guru! Tadi ada orang asing yang ngancam aku!\nDia kirim pesan-pesan aneh ke HP-ku, terus tiba-tiba ngadang di sini!"\n\nRara berani cerita! Ini pilihan PALING TEPAT! 💪',
        },
        {
          speaker: "Pak Guru & Polisi",
          portrait: "polisi",
          text: '"Tenang Rara, kamu udah berani banget! Kamu nggak salah sama sekali.\nKami bakal bantu laporin ke polisi. Makasih ya udah mau cerita!"',
        },
      ],
      () => {
        helperGfx.destroy();
        this.bossMental = 0;
        this._bossDies();
      },
    );
  }

  _bossDies() {
    this.phase = "educard";
    GameState.earnAchievement("Pahlawan Diri Sendiri");
    this.charGfx.clear();
    DrawUtils.rara(this.charGfx, CFG.WIDTH * 0.5, CFG.HEIGHT * 0.52, "idle");

    const W = CFG.WIDTH,
      H = CFG.HEIGHT;
    const flash = this.add.graphics().setScrollFactor(0).setDepth(150);
    flash.fillStyle(0xffffff, 0.8);
    flash.fillRect(0, 0, W, H);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 600,
      onComplete: () => {
        flash.destroy();
        this._showEduCard();
      },
    });
  }

  // ══════════════════════════════════════════════════════════════════════
  // EDU CARD FINAL
  _showEduCard() {
    const W = CFG.WIDTH,
      H = CFG.HEIGHT;
    const ov = this.add.graphics().setScrollFactor(0).setDepth(150);
    ov.fillStyle(0x000000, 0.88);
    ov.fillRect(0, 0, W, H);

    const card = this.add.graphics().setScrollFactor(0).setDepth(151);
    card.fillStyle(0x0d0505, 0.98);
    card.fillRoundedRect(15, 22, W - 30, H - 50, 14);
    DrawUtils.sulselBorder(card, 15, 22, W - 30, H - 50, 1.0);

    this.add
      .text(W / 2, 38, "🏆 Kartu Edukasi — Hari 3: FINAL", {
        fontFamily: "Arial",
        fontSize: "17px",
        color: "#FFD700",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(152);

    const content = [
      {
        h: "⚠ Apa itu Grooming?",
        b: "Grooming = ada orang dewasa yang pura-pura 'baik' buat\nmendekati anak — lewat chat, sosmed, atau langsung ketemu.\nIni KEJAHATAN. Kamu boleh lapor!",
      },
      {
        h: "🦁 Cara Melindungi Diri:",
        b: "• Terasa nggak aman? TERIAK keras dan minta tolong!\n• Chat mencurigakan? Blokir + screenshot + cerita ke ortu\n• Guru dan polisi ADA untuk melindungi kamu!",
      },
      {
        h: "📣 Yang Paling Penting:",
        b: "Kalau kamu jadi korban, itu BUKAN salahmu!\nBerani cerita ke orang yang dipercaya\n= tindakan paling berani yang bisa kamu lakuin! 💪",
      },
    ];
    let y = 70;
    content.forEach((c) => {
      this.add
        .text(30, y, c.h, {
          fontFamily: "Arial",
          fontSize: "14px",
          color: "#FF8888",
          fontStyle: "bold",
        })
        .setScrollFactor(0)
        .setDepth(152);
      this.add
        .text(30, y + 22, c.b, {
          fontFamily: "Arial",
          fontSize: "13px",
          color: "#FFFFCC",
          wordWrap: { width: W - 62 },
          lineSpacing: 3,
        })
        .setScrollFactor(0)
        .setDepth(152);
      y += 90;
    });

    this.add
      .text(
        W / 2,
        H - 55,
        "🆘 Darurat: Polisi 110 | Hotline Anak 129 | KPAI 021-31901556",
        {
          fontFamily: "Arial",
          fontSize: "11px",
          color: "#FFD700",
          align: "center",
        },
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(152);

    const btn = this.add
      .text(W / 2, H - 30, "[ LIHAT HASIL AKHIR ]", {
        ...CFG.F.BUTTON,
        color: "#FFD700",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(152)
      .setInteractive({ useHandCursor: true });
    btn.on("pointerdown", () => {
      this.cameras.main.fadeOut(500);
      this.time.delayedCall(500, () => this.scene.start("Result3"));
    });
  }

  _goGameOver() {
    this.cameras.main.fadeOut(500);
    this.time.delayedCall(500, () =>
      this.scene.start("GameOver", { fromDay: 3 }),
    );
  }

  // ══════════════════════════════════════════════════════════════════════
  // PAUSE MENU
  _showPause() {
    if (this._paused) return;
    this._paused = true;
    const W = CFG.WIDTH,
      H = CFG.HEIGHT;
    const objs = [];

    const ov = this.add.graphics().setScrollFactor(0).setDepth(500);
    ov.fillStyle(0x000000, 0.78);
    ov.fillRect(0, 0, W, H);
    objs.push(ov);

    const pan = this.add.graphics().setScrollFactor(0).setDepth(501);
    pan.fillStyle(CFG.C.PANEL, 0.97);
    pan.fillRoundedRect(W / 2 - 210, H / 2 - 130, 420, 265, 14);
    DrawUtils.sulselBorder(pan, W / 2 - 210, H / 2 - 130, 420, 265, 0.9);
    objs.push(pan);

    objs.push(
      this.add
        .text(W / 2, H / 2 - 112, "⏸  JEDA — TIPS KESELAMATAN", {
          fontFamily: "Arial",
          fontSize: "15px",
          color: "#FFD700",
          fontStyle: "bold",
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(502),
    );

    const tips = [
      "🚫 Jangan pernah ikut orang asing —\n    apapun alasan & janji yang mereka kasih!",
      "📢 Kalau terancam: TERIAK KERAS, LARI\n    ke tempat rame, CARI orang dewasa!",
      "📱 Darurat: Polisi 110\n    Hotline Anak 129 | KPAI 021-31901556",
    ];
    tips.forEach((t, i) => {
      objs.push(
        this.add
          .text(W / 2 - 190, H / 2 - 80 + i * 60, t, {
            fontFamily: "Arial",
            fontSize: "13px",
            color: "#FFFFCC",
            wordWrap: { width: 385 },
            lineSpacing: 2,
          })
          .setScrollFactor(0)
          .setDepth(502),
      );
    });

    const resBg = this.add.graphics().setScrollFactor(0).setDepth(501);
    resBg.fillStyle(CFG.C.AMAN, 0.9);
    resBg.fillRoundedRect(W / 2 - 100, H / 2 + 102, 200, 34, 10);
    objs.push(resBg);
    objs.push(
      this.add
        .text(W / 2, H / 2 + 119, "▶  LANJUTKAN", {
          ...CFG.F.BUTTON,
          fontSize: "13px",
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(502),
    );
    this.add
      .zone(W / 2 - 100, H / 2 + 102, 200, 34)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(503)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        objs.forEach((o) => o.destroy());
        this._paused = false;
        AudioManager.sfxClick();
      });
  }

  // ══════════════════════════════════════════════════════════════════════
  update(time, delta) {
    if (this._paused) return;
    voiceMeter.tick();
    this._updateHUD();

    // Walk intro phase (rain walk)
    if (this.phase === "walk_intro") {
      this._tickWalkIntroRain(delta);
      return;
    }

    // Hujan animasi
    this._rainTimer += delta;
    if (this._rainTimer > 50) {
      this._rainTimer = 0;
      this.rainGfx.clear();
      if (
        ["boss_dialog", "boss_approach", "plat_check", "panic"].includes(
          this.phase,
        )
      ) {
        DrawUtils.skyRain(this.rainGfx, CFG.WIDTH, CFG.HEIGHT * 0.55);
      }
    }

    // Voice accumulate saat boss fight — tahan teriak melemahkan boss
    if (this.phase === "boss_dialog" && voiceMeter.isShout()) {
      this.voiceAccum += delta;
      // Setiap 5 detik teriak terus = drain boss mental (GDD: 5 detik non-stop)
      if (this.voiceAccum >= this.voiceTarget) {
        this.voiceAccum = 0;
        this.bossMental = Math.max(0, this.bossMental - 0.35);
        AudioManager.sfxBossGroan();
        this.cameras.main.shake(200, 0.008);

        // Floating teks feedback
        const W = CFG.WIDTH,
          H = CFG.HEIGHT;
        const vfb = this.add
          .text(W / 2, H * 0.3, "💪 SUARAMU MELEMAHKAN BOSS! -35%", {
            fontFamily: "Arial",
            fontSize: "15px",
            color: "#FFD700",
            fontStyle: "bold",
            stroke: "#000",
            strokeThickness: 3,
          })
          .setOrigin(0.5)
          .setScrollFactor(0)
          .setDepth(200);
        this.tweens.add({
          targets: vfb,
          y: H * 0.2,
          alpha: 0,
          duration: 1000,
          onComplete: () => vfb.destroy(),
        });

        if (this.bossMental <= 0) this._bossDies();
      }
    } else if (this.phase === "boss_dialog" && !voiceMeter.isShout()) {
      // Suara berhenti = akumulator direset (harus teriak non-stop sesuai GDD)
      this.voiceAccum = Math.max(0, this.voiceAccum - delta * 0.5);
    }
  }
}
