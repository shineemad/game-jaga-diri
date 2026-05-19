// Day2.js — Hari 2: Naik Angkot (Quiz Body Safety + Chat Simulasi)
// Tiga bagian: (1) Jalan ke halte, (2) Quiz multiple-choice di dalam angkot,
//              (3) Chat simulasi + Lapor Sopir
class Day2 extends Phaser.Scene {
  constructor() {
    super({ key: "Day2" });
  }

  // ══════════════════════════════════════════════════════════════════════
  create() {
    GameState.day = 2;
    // Fix #6: BGM Hari 2 — melodi sedikit tegang
    AudioManager.startBGM(80, "day2");
    this.cameras.main.fadeIn(500);
    const W = CFG.WIDTH,
      H = CFG.HEIGHT;

    // Phase: intro | halte | in_pete | quiz | chat_sim | lapor | educard | complete
    this.phase = "intro";
    this.quizIdx = 0;
    this.quizScore = 0;
    this.chatIdx = 0;
    this._paused = false;

    // Background
    this.bgGfx = this.add.graphics().setDepth(0);
    this._drawHalte();

    // Karakter graphic
    this.charGfx = this.add.graphics().setDepth(10);

    // HUD
    this._buildHUD();

    // Dialog
    this.dlg = new DialogManager(this);

    // Voice
    voiceMeter.start().then((ok) => {
      if (!ok) this._buildTeraikBtn();
    });

    this._showIntro();
  }

  // ══════════════════════════════════════════════════════════════════════
  // BACKGROUND SCENES
  _drawHalte() {
    const g = this.bgGfx;
    const W = CFG.WIDTH,
      H = CFG.HEIGHT;
    g.clear();

    DrawUtils.skyDay(g, W, H);

    // Jalan
    g.fillStyle(CFG.C.ROAD);
    g.fillRect(0, H * 0.6, W, H * 0.4);
    g.fillStyle(CFG.C.SIDEWALK);
    g.fillRect(0, H * 0.54, W, H * 0.07);
    g.fillStyle(0xffffff, 0.5);
    for (let x = 0; x < W; x += 100) g.fillRect(x + 10, H * 0.72, 70, 5);

    // Halte — pakai DrawUtils.halte
    DrawUtils.halte(g, W * 0.3 + 55, H * 0.54);
    this.add
      .text(W * 0.3 + 8, H * 0.29, "HALTE ANGKOT", {
        fontFamily: "Arial",
        fontSize: "11px",
        color: "#FFFFFF",
        fontStyle: "bold",
        backgroundColor: "#1a5c8a",
        padding: { x: 4, y: 2 },
      })
      .setDepth(2);

    // Angkot — pakai DrawUtils.angkot (hijau khas angkot)
    DrawUtils.angkot(g, W * 0.62, H * 0.62, 0x1a8a2a);
    this.add
      .text(W * 0.62, H * 0.62 - 2, "SEKOLAH", {
        fontFamily: "Arial",
        fontSize: "9px",
        color: "#FFFFFF",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(3);

    // Shadow NPC (pelaku grooming) di dalam halte
    DrawUtils.shadowNpc(g, W * 0.44, H * 0.48, false, false);
    this.add
      .text(W * 0.44, H * 0.48 - 55, "⚠ Pria Asing", {
        fontFamily: "Arial",
        fontSize: "10px",
        color: "#FF8888",
        fontStyle: "bold",
        backgroundColor: "#00000099",
        padding: { x: 3, y: 1 },
      })
      .setOrigin(0.5)
      .setDepth(3);

    // Bangunan di belakang
    [
      [60, 0xe8d5a3],
      [620, 0xffe4b5],
      [720, 0xd5c4a0],
    ].forEach(([bx, c]) => {
      g.fillStyle(c);
      g.fillRect(bx, H * 0.25, 90, H * 0.29);
      g.fillStyle(0x8b4513);
      g.fillTriangle(bx - 5, H * 0.25, bx + 95, H * 0.25, bx + 45, H * 0.14);
    });

    // Pohon
    [210, 550].forEach((tx) => {
      g.fillStyle(0x8b4513);
      g.fillRect(tx, H * 0.38, 7, 30);
      g.fillStyle(0x228b22);
      g.fillCircle(tx + 3, H * 0.36, 18);
    });
  }

  _drawPeteInterior() {
    const g = this.bgGfx;
    const W = CFG.WIDTH,
      H = CFG.HEIGHT;
    g.clear();

    // Dinding/bodi angkot (warna solid)
    g.fillStyle(0xe8a800);
    g.fillRect(0, 0, W, H);

    // Langit-langit
    g.fillStyle(0xcc8800);
    g.fillRect(0, 0, W, 28);

    // Dua baris bangku
    const seatColor = 0x993300;
    // Kiri
    g.fillStyle(seatColor);
    g.fillRect(10, 35, 60, H - 80);
    // Kanan
    g.fillRect(W - 70, 35, 60, H - 80);

    // Jendela kiri
    for (let j = 0; j < 3; j++) {
      g.fillStyle(0x87ceeb, 0.8);
      g.fillRect(12, 42 + (j * (H - 80)) / 3, 56, (H - 80) / 3 - 6);
      g.lineStyle(2, 0x664400);
      g.strokeRect(12, 42 + (j * (H - 80)) / 3, 56, (H - 80) / 3 - 6);
    }
    // Jendela kanan
    for (let j = 0; j < 3; j++) {
      g.fillStyle(0x87ceeb, 0.8);
      g.fillRect(W - 68, 42 + (j * (H - 80)) / 3, 56, (H - 80) / 3 - 6);
      g.lineStyle(2, 0x664400);
      g.strokeRect(W - 68, 42 + (j * (H - 80)) / 3, 56, (H - 80) / 3 - 6);
    }

    // Lantai angkot
    g.fillStyle(0x8b4500);
    g.fillRect(0, H - 45, W, 45);

    // Dekorasi panel stiker
    g.fillStyle(0xff4444, 0.7);
    g.fillRect(90, 0, W - 180, 28);
    // Hapus teks header lama agar tidak dobel saat _drawPeteInterior dipanggil ulang
    this.children.list
      .filter(
        (c) =>
          c.type === "Text" &&
          typeof c.text === "string" &&
          c.text.includes("ANGKOT JURUSAN SEKOLAH"),
      )
      .forEach((c) => c.destroy());
    this.add
      .text(W / 2, 2, "✦ ANGKOT JURUSAN SEKOLAH ✦", {
        fontFamily: "Arial",
        fontSize: "11px",
        color: "#FFFFFF",
        fontStyle: "bold",
      })
      .setOrigin(0.5, 0)
      .setDepth(3);
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
        pDay = 2;
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
    const bg = this.add.graphics().setScrollFactor(0).setDepth(60);
    bg.fillStyle(CFG.C.BAHAYA, 0.9);
    bg.fillRoundedRect(W - 110, H - 60, 100, 44, 10);
    this.teraikBtn = this.add
      .text(W - 60, H - 38, "📢 TERIAK!", {
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
    this.hudGfx.fillStyle(0x000000, 0.5);
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
  }

  // ══════════════════════════════════════════════════════════════════════
  _showIntro() {
    const W = CFG.WIDTH,
      H = CFG.HEIGHT;
    const overlay = this.add.graphics().setScrollFactor(0).setDepth(100);
    overlay.fillStyle(0x000000, 0.75);
    overlay.fillRect(0, 0, W, H);
    const t = this.add
      .text(W / 2, H / 2 - 20, "HARI 2: Naik Angkot", {
        ...CFG.F.TITLE,
        fontSize: "24px",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(101);
    const s = this.add
      .text(W / 2, H / 2 + 20, "📍 " + CFG.LOKASI.D2, {
        ...CFG.F.SUBTITLE,
        color: "#FFCCAA",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(101);
    this.tweens.add({
      targets: [overlay, t, s],
      alpha: 0,
      duration: 700,
      delay: 2000,
      onComplete: () => {
        overlay.destroy();
        t.destroy();
        s.destroy();
        this.phase = "walk_intro";
        this._startWalkIntro();
      },
    });
  }

  // ══════════════════════════════════════════════════════════════════════
  // WALK INTRO — Side-scrolling jalan ke halte
  _startWalkIntro() {
    const W = CFG.WIDTH,
      H = CFG.HEIGHT;
    const worldW = 1200;

    // Setup camera & world bounds
    this.cameras.main.setBounds(0, 0, worldW, H);
    this._walkX = 80;
    this._walkBoosted = false;

    // Bersihkan label teks halte yang di-add dari _drawHalte() di create()
    this.children.list
      .filter((c) => c.type === "Text" && c.depth <= 5)
      .forEach((c) => c.destroy());

    // Gambar dunia lebar
    this.bgGfx.clear();
    this._drawWideStreet(worldW, H);

    // Rara berdiri sebelum narasi pembuka
    this.charGfx.clear();
    DrawUtils.rara(this.charGfx, this._walkX, H * 0.46, "idle");

    // Narasi pembuka — konteks Rara berangkat dari rumah
    this.dlg.show(
      [
        {
          speaker: "Narasi",
          portrait: "rara",
          text: "Pagi ini Rara harus berangkat sendiri ke sekolah.\nHari ini pertama kalinya Rara naik angkot sendirian!",
        },
        {
          speaker: "Rara",
          portrait: "rara",
          text: '"Bismillah, aku pasti bisa! 😤\nHaltenya ada di ujung jalan — ayo cepat sebelum angkotnya pergi!"',
        },
        {
          speaker: "Narasi",
          portrait: "rara",
          text: "Ingat ya — kalau ada yang mencurigakan di jalan atau angkot:\nTERIAK keras dan cari orang dewasa terdekat! 📢",
        },
      ],
      () => {
        // Mulai berjalan setelah dialog tutup
        this.charGfx.clear();
        DrawUtils.rara(this.charGfx, this._walkX, H * 0.46, "walk");

        // Petunjuk (scroll-fixed)
        this._walkHintTxt = this.add
          .text(W / 2, 54, "➔ Jalan ke halte — TERIAK buat lari lebih cepat! 📢", {
            ...CFG.F.SMALL,
            color: "#FFD700",
            stroke: "#000",
            strokeThickness: 2,
          })
          .setOrigin(0.5)
          .setScrollFactor(0)
          .setDepth(20);

        // Tap anywhere untuk boost
        this._walkTapHandler = () => {
          this._walkBoosted = true;
        };
        this.input.on("pointerdown", this._walkTapHandler);
      },
    );
  }

  _drawWideStreet(worldW, H) {
    const g = this.bgGfx;
    g.clear();

    // Langit pagi
    g.fillGradientStyle(0x87ceeb, 0x87ceeb, 0xe8f4f8, 0xe8f4f8, 1);
    g.fillRect(0, 0, worldW, H * 0.52);

    // Awan
    [
      [120, 30, 180, 50],
      [350, 20, 220, 45],
      [600, 35, 160, 40],
      [850, 25, 200, 50],
      [1050, 30, 170, 42],
    ].forEach(([cx, cy, rw, rh]) => {
      g.fillStyle(0xffffff, 0.85);
      g.fillEllipse(cx, cy, rw, rh);
    });

    // Jalan
    g.fillStyle(CFG.C.ROAD);
    g.fillRect(0, H * 0.6, worldW, H * 0.4);
    // Trotoar
    g.fillStyle(CFG.C.SIDEWALK);
    g.fillRect(0, H * 0.54, worldW, H * 0.07);
    // Marka jalan
    g.fillStyle(0xffffff, 0.5);
    for (let x = 30; x < worldW; x += 100) g.fillRect(x, H * 0.72, 65, 5);

    // Bangunan kiri (asal Rara)
    const buildings = [
      [0, 0xffe4b5, 80, H * 0.28],
      [85, 0xe8d5a3, 95, H * 0.22],
      [190, 0xdcc08c, 75, H * 0.3],
      [275, 0xf0d090, 90, H * 0.25],
      [380, 0xc8b890, 80, H * 0.28],
      [470, 0xe0c870, 100, H * 0.2],
      [580, 0xd4a87c, 85, H * 0.26],
      [680, 0xffe4b5, 90, H * 0.24],
    ];
    buildings.forEach(([bx, col, bw, bh]) => {
      g.fillStyle(col);
      g.fillRect(bx, bh, bw, H * 0.54 - bh);
      // Jendela
      g.fillStyle(0x87ceeb, 0.6);
      g.fillRect(bx + 10, bh + 8, 20, 18);
      if (bw > 70) g.fillRect(bx + bw - 32, bh + 8, 20, 18);
    });

    // Pohon di trotoar
    [60, 200, 340, 480, 620, 760].forEach((tx) => {
      g.fillStyle(0x5c3a1e);
      g.fillRect(tx, H * 0.42, 7, 30);
      g.fillStyle(0x2d7a2d);
      g.fillCircle(tx + 3, H * 0.38, 20);
      g.fillStyle(0x3a9e3a, 0.6);
      g.fillCircle(tx + 3, H * 0.36, 14);
    });

    // Halte di ujung (destination) ~x=880 — DrawUtils.halte
    DrawUtils.halte(g, 970, H * 0.54);
    this.add
      .text(938, H * 0.29, "HALTE ANGKOT", {
        fontFamily: "Arial",
        fontSize: "11px",
        color: "#FFFFFF",
        fontStyle: "bold",
        backgroundColor: "#1a5c8a",
        padding: { x: 4, y: 2 },
      })
      .setDepth(2);

    // Angkot menunggu di halte — DrawUtils.angkot
    DrawUtils.angkot(g, 1120, H * 0.62, 0xe8a800);
    this.add
      .text(1120, H * 0.62 - 2, "SEKOLAH", {
        fontFamily: "Arial",
        fontSize: "9px",
        color: "#FFFFFF",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(2);
  }

  _tickWalkIntro(delta) {
    if (this.dlg && this.dlg.open) return; // tunggu dialog pembuka selesai
    const W = CFG.WIDTH,
      H = CFG.HEIGHT;
    const speed = voiceMeter.isShout() ? 280 : this._walkBoosted ? 210 : 150;
    this._walkBoosted = false; // reset tap boost setiap frame

    this._walkX += (speed * delta) / 1000;
    this.cameras.main.scrollX = Math.max(0, this._walkX - W * 0.4);

    const anim = voiceMeter.isShout() ? "run" : "walk";
    this.charGfx.clear();
    DrawUtils.rara(this.charGfx, this._walkX, H * 0.46, anim);

    // Update hint
    if (this._walkHintTxt) {
      const dist = Math.max(0, Math.round((950 - this._walkX) / 10));
      this._walkHintTxt.setText(
        dist > 0
          ? `➔ Halte ${dist * 10}px lagi...  (TERIAK untuk berlari!)`
          : "✓ Sampai di halte!",
      );
    }

    // Tiba di halte
    if (this._walkX >= 950) {
      this.input.off("pointerdown", this._walkTapHandler);
      if (this._walkHintTxt) {
        this._walkHintTxt.destroy();
        this._walkHintTxt = null;
      }
      this.cameras.main.scrollX = 0;
      this.cameras.main.setBounds(0, 0, W, H);
      this.phase = "halte";
      this._startHalteScene();
    }
  }

  // ══════════════════════════════════════════════════════════════════════
  // FASE HALTE
  _startHalteScene() {
    this._drawHalte();
    this.charGfx.clear();
    DrawUtils.rara(this.charGfx, CFG.WIDTH * 0.5, CFG.HEIGHT * 0.46, "idle");

    this.dlg.show(
      [
        {
          speaker: "Rara",
          portrait: "rara",
          text: "Akhirnya sampai di halte! Angkotnya udah ada nih.\nAda beberapa orang yang lagi nunggu di sini...",
        },
        {
          speaker: "Rara (dalam hati)",
          portrait: "rara",
          text: "Hmm... ada bapak-bapak yang dari tadi ngelirik ke sini.\nRara ngerasa nggak nyaman...",
        },
        {
          speaker: "Pria Asing",
          portrait: "shadow",
          text: '"Eh dek, sendirian ke sekolah?" *senyum-senyum*',
        },
        {
          speaker: "Rara (dalam hati)",
          portrait: "rara",
          text: "Rara nggak kenal orang ini sama sekali...",
        },
        {
          speaker: "Pria Asing",
          portrait: "shadow",
          text: '"Cantik ya! FB-nya berapa dek? 😊\nOm bisa antar ke sekolah kok — gratis, nggak usah naik angkot!"',
        },
        {
          speaker: "Rara (dalam hati)",
          portrait: "rara",
          text: "🚩 Langsung minta kontak DAN nawarin tumpangan?!\nIni aneh banget — ini TANDA BAHAYA!",
        },
        {
          speaker: "— PILIH RESPONS RARA —",
          choices: [
            {
              label: "Abaikan & pindah posisi menjauh",
              category: "AMAN",
              onPick: () => {
                GameState.score += CFG.SCORE.AMAN;
              },
            },
            {
              label: '"Hmm... nggak usah pak, makasih."',
              category: "RAGU",
              onPick: () => {
                GameState.score += CFG.SCORE.RAGU;
              },
            },
            {
              label: "Kasih nomor FB",
              category: "BAHAYA",
              onPick: () => {},
            },
          ],
        },
        {
          speaker: "Tips Keamanan",
          portrait: "rara",
          text: "💡 Orang asing yang langsung minta kontak atau nawarin tumpangan = WASPADA!\nJangan pernah kasih nomor HP atau medsos ke orang yang baru dikenal!",
        },
      ],
      () => {
        this.phase = "in_pete";
        // Bersihkan label teks halte (dari _drawHalte & _drawWideStreet) sebelum masuk angkot
        this.children.list
          .filter((c) => c.type === "Text" && c.depth <= 5)
          .forEach((c) => c.destroy());
        this._drawPeteInterior();
        this.charGfx.clear();
        DrawUtils.rara(
          this.charGfx,
          CFG.WIDTH * 0.5,
          CFG.HEIGHT * 0.46,
          "idle",
        );
        // Transisi naik angkot — menghubungkan pria asing di halte ke dalam angkot
        this.dlg.show(
          [
            {
              speaker: "Narasi",
              portrait: "rara",
              text: "Angkot datang! Rara naik dan langsung pilih tempat duduk\npaling depan, deket sopir. ✓",
            },
            {
              speaker: "Rara (dalam hati)",
              portrait: "rara",
              text: "Eh... pria tadi ikut naik angkot yang sama! 😨\nRara harus tetap waspada dan jangan duduk dekatnya!",
            },
            {
              speaker: "Narasi",
              portrait: "rara",
              text: "Sambil nunggu sampai sekolah, Rara buka catatan PR Kesehatan\ntentang keselamatan tubuh.",
            },
          ],
          () => this._startQuiz(),
        );
      },
    );
  }

  // ══════════════════════════════════════════════════════════════════════
  // QUIZ BODY SAFETY — Drag & Drop
  _startQuiz() {
    this.phase = "quiz";
    this.quizScore = 0;
    this._ddCorrect = 0;
    this._ddPlaced = 0;
    this._ddTimerMs = 15000;
    this._ddActive = false;
    this._ddChoiceStart = GameState.choices.length; // snapshot sebelum quiz
    this._showInlineTutorial(
      "🧩 QUIZ: KENALI BATAS TUBUH!",
      "Seret (drag) label bagian tubuh ke zona yang tepat!\n\n✅ ZONA AMAN = boleh disentuh teman & keluarga\n❌ ZONA BAHAYA = area privat, TIDAK boleh!\n\n⏰ Waktu: 15 detik — cepat!",
      () => this._buildDragDropQuiz(),
    );
  }

  // Fix #8: Helper modal tutorial sekali-pakai (dipakai Day2 & Day3)
  _showInlineTutorial(title, body, onReady) {
    const W = CFG.WIDTH,
      H = CFG.HEIGHT;
    const tutObjs = [];
    const ov = this.add.graphics().setScrollFactor(0).setDepth(220);
    ov.fillStyle(0x000000, 0.75);
    ov.fillRect(0, 0, W, H);
    tutObjs.push(ov);
    const panel = this.add.graphics().setScrollFactor(0).setDepth(221);
    panel.fillStyle(0x112244, 0.97);
    panel.fillRoundedRect(W / 2 - 190, H / 2 - 110, 380, 220, 14);
    panel.lineStyle(3, 0x55aaff, 0.9);
    panel.strokeRoundedRect(W / 2 - 190, H / 2 - 110, 380, 220, 14);
    tutObjs.push(panel);
    tutObjs.push(
      this.add
        .text(W / 2, H / 2 - 96, title, {
          fontFamily: "Arial",
          fontSize: "17px",
          color: "#FFD700",
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
          color: "#CCDDFF",
          align: "center",
          wordWrap: { width: 340 },
          lineSpacing: 5,
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(222),
    );
    // Tombol SIAP
    const btnG = this.add.graphics().setScrollFactor(0).setDepth(222);
    btnG.fillStyle(0x006633, 0.9);
    btnG.fillRoundedRect(W / 2 - 75, H / 2 + 78, 150, 32, 10);
    btnG.lineStyle(2, 0x44ff88, 0.7);
    btnG.strokeRoundedRect(W / 2 - 75, H / 2 + 78, 150, 32, 10);
    tutObjs.push(btnG);
    const btnLbl = this.add
      .text(W / 2, H / 2 + 94, "\u25b6 SIAP, MULAI!", {
        fontFamily: "Arial",
        fontSize: "14px",
        color: "#44FF88",
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
      btnLbl.setColor("#44FF88");
    });
    btnLbl.on("pointerdown", () => {
      AudioManager.sfxClick();
      tutObjs.forEach((o) => o.destroy());
      if (onReady) onReady();
    });
  }

  // ══════════════════════════════════════════════════════════════════════
  // DRAG-DROP QUIZ — 6 label tubuh ke ZONA AMAN / ZONA BAHAYA
  _buildDragDropQuiz() {
    const W = CFG.WIDTH,
      H = CFG.HEIGHT;
    this._ddObjs = [];
    this._ddChips = [];
    this._ddActive = true;
    this._amanNextY = 118;
    this._bahayaNextY = 118;

    const ITEMS = [
      {
        label: "Tangan",
        zone: "AMAN",
        eduOk: "Tangan boleh disentuh teman/saudara ✓",
        eduWrong: "Salah! Tangan bukan area privat.",
      },
      {
        label: "Pipi",
        zone: "AMAN",
        eduOk: "Pipi boleh dicium orang tua ✓",
        eduWrong: "Salah! Pipi bukan area privat.",
      },
      {
        label: "Bahu",
        zone: "AMAN",
        eduOk: "Bahu boleh disentuh teman dekat ✓",
        eduWrong: "Salah! Bahu bukan area privat.",
      },
      {
        label: "Perut",
        zone: "BAHAYA",
        eduOk: "Perut = area privat, dilarang disentuh! ✓",
        eduWrong: "Salah! Perut adalah area privat!",
      },
      {
        label: "Paha",
        zone: "BAHAYA",
        eduOk: "Paha = area privat, hanya untuk dokter! ✓",
        eduWrong: "Salah! Paha adalah area privat!",
      },
      {
        label: "Privat",
        zone: "BAHAYA",
        eduOk: "Area celana dalam = TERLARANG disentuh! ✓",
        eduWrong: "Salah! Ini area privat paling sensitif!",
      },
    ];
    // Shuffle chips
    for (let i = ITEMS.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [ITEMS[i], ITEMS[j]] = [ITEMS[j], ITEMS[i]];
    }

    // ── Title bar
    const titleBg = this.add.graphics().setScrollFactor(0).setDepth(80);
    titleBg.fillStyle(0x001133, 0.97);
    titleBg.fillRoundedRect(0, 0, W, 44, 0);
    this._ddObjs.push(titleBg);

    this._ddObjs.push(
      this.add
        .text(W / 2, 8, "🧩 QUIZ: Seret label ke zona yang tepat!", {
          fontFamily: "Arial",
          fontSize: "14px",
          color: "#FFD700",
          fontStyle: "bold",
        })
        .setOrigin(0.5, 0)
        .setScrollFactor(0)
        .setDepth(81),
    );

    this._ddTimerTxt = this.add
      .text(W - 12, 8, "⏰ 15s", {
        fontFamily: "Arial",
        fontSize: "15px",
        color: "#FFD700",
        fontStyle: "bold",
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(81);
    this._ddObjs.push(this._ddTimerTxt);

    // ── Drop zones
    const zY = 48,
      zH = H - 65;
    const zoneW = 175;

    const amanG = this.add.graphics().setScrollFactor(0).setDepth(80);
    amanG.fillStyle(0x002200, 0.75);
    amanG.fillRoundedRect(4, zY, zoneW, zH, 8);
    amanG.lineStyle(2, 0x44ff88, 0.85);
    amanG.strokeRoundedRect(4, zY, zoneW, zH, 8);
    this._ddObjs.push(amanG);
    this._ddObjs.push(
      this.add
        .text(4 + zoneW / 2, zY + 8, "✅ ZONA AMAN", {
          fontFamily: "Arial",
          fontSize: "12px",
          color: "#44FF88",
          fontStyle: "bold",
        })
        .setOrigin(0.5, 0)
        .setScrollFactor(0)
        .setDepth(81),
    );
    this._ddObjs.push(
      this.add
        .text(4 + zoneW / 2, zY + 26, "Boleh disentuh\nteman/keluarga", {
          fontFamily: "Arial",
          fontSize: "10px",
          color: "#AAFFCC",
          align: "center",
        })
        .setOrigin(0.5, 0)
        .setScrollFactor(0)
        .setDepth(81),
    );

    const bahayaG = this.add.graphics().setScrollFactor(0).setDepth(80);
    bahayaG.fillStyle(0x220000, 0.75);
    bahayaG.fillRoundedRect(W - 4 - zoneW, zY, zoneW, zH, 8);
    bahayaG.lineStyle(2, 0xff4444, 0.85);
    bahayaG.strokeRoundedRect(W - 4 - zoneW, zY, zoneW, zH, 8);
    this._ddObjs.push(bahayaG);
    this._ddObjs.push(
      this.add
        .text(W - 4 - zoneW / 2, zY + 8, "❌ ZONA BAHAYA", {
          fontFamily: "Arial",
          fontSize: "12px",
          color: "#FF4444",
          fontStyle: "bold",
        })
        .setOrigin(0.5, 0)
        .setScrollFactor(0)
        .setDepth(81),
    );
    this._ddObjs.push(
      this.add
        .text(W - 4 - zoneW / 2, zY + 26, "Area privat\nDilarang disentuh!", {
          fontFamily: "Arial",
          fontSize: "10px",
          color: "#FFAAAA",
          align: "center",
        })
        .setOrigin(0.5, 0)
        .setScrollFactor(0)
        .setDepth(81),
    );

    // Zone hit bounds
    this._amanZone = {
      left: 4,
      right: 4 + zoneW,
      top: zY + 50,
      bottom: zY + zH,
    };
    this._bahayaZone = {
      left: W - 4 - zoneW,
      right: W - 4,
      top: zY + 50,
      bottom: zY + zH,
    };

    // ── Body figure in center
    this.charGfx.clear();
    DrawUtils.rara(this.charGfx, W / 2, H * 0.52, "idle");

    // ── Hint arrows
    const arrG = this.add.graphics().setScrollFactor(0).setDepth(81);
    arrG.lineStyle(1, 0xffd700, 0.45);
    arrG.lineBetween(186, H / 2, 290, H / 2);
    arrG.lineBetween(510, H / 2, W - 186, H / 2);
    arrG.fillStyle(0xffd700, 0.5);
    arrG.fillTriangle(186, H / 2 - 5, 186, H / 2 + 5, 196, H / 2);
    arrG.fillTriangle(W - 186, H / 2 - 5, W - 186, H / 2 + 5, W - 196, H / 2);
    this._ddObjs.push(arrG);

    // ── 6 draggable chips (2×3 grid center)
    const chipPos = [
      [300, 160],
      [490, 160],
      [300, 220],
      [490, 220],
      [300, 280],
      [490, 280],
    ];
    ITEMS.forEach((item, i) => {
      const chip = this._makeChip(
        chipPos[i][0],
        chipPos[i][1],
        item.label,
        item.zone,
        item.eduOk,
        item.eduWrong,
      );
      this._ddChips.push(chip);
      this._ddObjs.push(chip);
    });

    // ── Drag hint text bottom
    const hint = this.add
      .text(W / 2, H - 12, "← Seret ke AMAN  |  Seret ke BAHAYA →", {
        fontFamily: "Arial",
        fontSize: "11px",
        color: "#FFCC88",
      })
      .setOrigin(0.5, 1)
      .setScrollFactor(0)
      .setDepth(81);
    this._ddObjs.push(hint);

    // ── Feedback text (shared)
    this._ddFeedbackTxt = this.add
      .text(W / 2, zY + zH / 2 + 10, "", {
        fontFamily: "Arial",
        fontSize: "12px",
        color: "#FFFFCC",
        align: "center",
        wordWrap: { width: zoneW - 10 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(86)
      .setAlpha(0);
    this._ddObjs.push(this._ddFeedbackTxt);

    this._setupDragHandlers();
  }

  _makeChip(cx, cy, label, correctZone, eduOk, eduWrong) {
    const chip = this.add.container(cx, cy).setScrollFactor(0).setDepth(85);
    const bg = this.add.graphics();
    bg.fillStyle(0x223366, 0.95);
    bg.fillRoundedRect(-52, -14, 104, 28, 8);
    bg.lineStyle(2, 0x6688cc);
    bg.strokeRoundedRect(-52, -14, 104, 28, 8);
    const txt = this.add
      .text(0, 0, label, {
        fontFamily: "Arial",
        fontSize: "13px",
        color: "#FFFFFF",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    chip.add([bg, txt]);
    chip.setSize(104, 28);
    chip.setInteractive({ draggable: true });
    chip._correct = correctZone;
    chip._label = label;
    chip._eduOk = eduOk;
    chip._eduWrong = eduWrong;
    chip._placed = false;
    chip._origX = cx;
    chip._origY = cy;
    return chip;
  }

  _setupDragHandlers() {
    this._onDragStart = (ptr, go) => {
      if (!go._label || go._placed) return;
      this.children.bringToTop(go);
    };
    this._onDragMove = (ptr, go, dx, dy) => {
      if (!go._label || go._placed) return;
      go.setPosition(dx, dy);
    };
    this._onDragEnd = (ptr, go) => {
      if (!go._label || go._placed) return;
      const ax = go.x,
        ay = go.y;
      const inAman =
        ax >= this._amanZone.left &&
        ax <= this._amanZone.right &&
        ay >= this._amanZone.top &&
        ay <= this._amanZone.bottom;
      const inBahaya =
        ax >= this._bahayaZone.left &&
        ax <= this._bahayaZone.right &&
        ay >= this._bahayaZone.top &&
        ay <= this._bahayaZone.bottom;
      if (inAman || inBahaya) {
        this._onChipDrop(go, inAman ? "AMAN" : "BAHAYA");
      } else {
        this.tweens.add({
          targets: go,
          x: go._origX,
          y: go._origY,
          duration: 200,
          ease: "Back.Out",
        });
      }
    };
    this.input.on("dragstart", this._onDragStart);
    this.input.on("drag", this._onDragMove);
    this.input.on("dragend", this._onDragEnd);
  }

  _onChipDrop(chip, droppedZone) {
    const correct = chip._correct === droppedZone;
    chip._placed = true;
    chip.disableInteractive();

    // Record
    GameState.addChoice(2, chip._label, correct ? "AMAN" : "BAHAYA");
    if (correct) {
      this._ddCorrect++;
      AudioManager.sfxCorrect();
    } else {
      AudioManager.sfxWrong();
    }
    this._ddPlaced++;

    // Flash screen
    const W = CFG.WIDTH,
      H = CFG.HEIGHT;
    const flash = this.add.graphics().setScrollFactor(0).setDepth(90);
    flash.fillStyle(correct ? 0x00ff88 : 0xff4444, 0.25);
    flash.fillRect(0, 0, W, H);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 350,
      onComplete: () => flash.destroy(),
    });

    // Move chip into zone
    const isAman = droppedZone === "AMAN";
    const targetX = isAman ? 4 + 87 : W - 4 - 87;
    const targetY = isAman ? this._amanNextY : this._bahayaNextY;
    if (isAman) this._amanNextY += 36;
    else this._bahayaNextY += 36;

    // Recolor chip
    const chipBg = chip.list[0];
    chipBg.clear();
    chipBg.fillStyle(correct ? 0x004400 : 0x440000, 0.95);
    chipBg.fillRoundedRect(-52, -14, 104, 28, 8);
    chipBg.lineStyle(2, correct ? 0x44ff88 : 0xff4444);
    chipBg.strokeRoundedRect(-52, -14, 104, 28, 8);

    this.tweens.add({
      targets: chip,
      x: targetX,
      y: targetY,
      duration: 250,
      ease: "Power2",
    });

    // Feedback text in zone
    const eduMsg = correct ? chip._eduOk : chip._eduWrong;
    const fbTxt = this.add
      .text(targetX, targetY + 18, eduMsg, {
        fontFamily: "Arial",
        fontSize: "9px",
        color: correct ? "#88FF88" : "#FF8888",
        wordWrap: { width: 162 },
        align: "center",
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(86);
    this._ddObjs.push(fbTxt);

    if (this._ddPlaced >= 6) {
      this._ddActive = false;
      this.time.delayedCall(900, () => this._finishDragDrop());
    }
  }

  _onDDTimeout() {
    if (!this._ddActive) return;
    this._ddActive = false;
    this._ddChips.forEach((chip) => {
      if (!chip._placed) {
        chip._placed = true;
        chip.disableInteractive();
        GameState.addChoice(2, chip._label + " (timeout)", "BAHAYA");
        this._ddPlaced++;
      }
    });
    this.time.delayedCall(300, () => this._finishDragDrop());
  }

  _finishDragDrop() {
    // Remove drag handlers
    this.input.off("dragstart", this._onDragStart);
    this.input.off("drag", this._onDragMove);
    this.input.off("dragend", this._onDragEnd);

    // Achievement untuk 6/6
    if (this._ddCorrect === 6) {
      GameState.earnAchievement("Penjaga Batas Tubuh");
      GameState.score += 200;
    }
    // Checkpoint d2: quiz selesai — skip halte jika Game Over
    GameState.checkpoints.d2 = true;
    GameState.save();
    this.quizScore = this._ddCorrect * CFG.SCORE.AMAN;
    this._showQuizAnalysis();
  }

  // ══════════════════════════════════════════════════════════════════════
  // ANALISIS HASIL KUIS
  _showQuizAnalysis() {
    const W = CFG.WIDTH,
      H = CFG.HEIGHT;
    // Cleanup drag-drop objects
    if (this._ddObjs) {
      this._ddObjs.forEach((o) => {
        if (o && o.active) o.destroy();
      });
      this._ddObjs = [];
    }
    this.charGfx.clear();

    const correct = this._ddCorrect ?? 0;
    const total = 6;
    const pct = correct / total;

    // Grade kuis
    let gradeLabel, gradeColor;
    if (pct === 1) {
      gradeLabel = "🏆 SEMPURNA!";
      gradeColor = "#FFD700";
    } else if (pct >= 0.75) {
      gradeLabel = "✓ Hebat!";
      gradeColor = "#44FF88";
    } else if (pct >= 0.5) {
      gradeLabel = "⚠ Cukup Baik";
      gradeColor = "#FFD700";
    } else {
      gradeLabel = "📖 Perlu Belajar Lagi";
      gradeColor = "#FF8888";
    }

    // Overlay + panel
    const ov = this.add.graphics().setScrollFactor(0).setDepth(120);
    ov.fillStyle(0x000000, 0.82);
    ov.fillRect(0, 0, W, H);

    const panG = this.add.graphics().setScrollFactor(0).setDepth(121);
    panG.fillStyle(0x0a1a2a, 0.98);
    panG.fillRoundedRect(18, 20, W - 36, H - 45, 14);
    panG.lineStyle(3, 0x4488ff, 0.9);
    panG.strokeRoundedRect(18, 20, W - 36, H - 45, 14);
    DrawUtils.sulselBorder(panG, 18, 20, W - 36, H - 45, 0.6);

    this.add
      .text(W / 2, 38, "📊 ANALISIS HASIL KUIS", {
        fontFamily: "Arial",
        fontSize: "17px",
        color: "#4488FF",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(122);

    // Grade & skor
    this.add
      .text(W / 2, 65, gradeLabel, {
        fontFamily: "Arial",
        fontSize: "22px",
        color: gradeColor,
        fontStyle: "bold",
        stroke: "#000",
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(122);

    this.add
      .text(
        W / 2,
        92,
        `${correct} / ${total} jawaban benar  |  +${this.quizScore} poin`,
        {
          fontFamily: "Arial",
          fontSize: "13px",
          color: "#CCDDFF",
        },
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(122);

    // Progress bar skor kuis
    const barG = this.add.graphics().setScrollFactor(0).setDepth(122);
    barG.fillStyle(0x222233);
    barG.fillRoundedRect(W / 2 - 140, 108, 280, 14, 5);
    barG.fillStyle(pct === 1 ? 0xffd700 : pct >= 0.5 ? 0x44ff88 : 0xff6644);
    barG.fillRoundedRect(W / 2 - 140, 108, 280 * pct, 14, 5);

    // Rekap per soal
    this.add
      .text(30, 132, "Rekap Jawaban:", {
        fontFamily: "Arial",
        fontSize: "13px",
        color: "#FFCC88",
        fontStyle: "bold",
      })
      .setScrollFactor(0)
      .setDepth(122);

    // Ambil tepat 6 choices drag-drop
    const quizChoices = GameState.choices.slice(
      this._ddChoiceStart ?? 0,
      (this._ddChoiceStart ?? 0) + total,
    );
    quizChoices.forEach((c, i) => {
      const isOk = c.category === "AMAN";
      const rowY = 152 + i * 38;

      const rowG = this.add.graphics().setScrollFactor(0).setDepth(121);
      rowG.fillStyle(isOk ? 0x003a00 : 0x3a0000, 0.7);
      rowG.fillRoundedRect(25, rowY, W - 50, 32, 6);
      rowG.lineStyle(1, isOk ? 0x44ff88 : 0xff4444, 0.6);
      rowG.strokeRoundedRect(25, rowY, W - 50, 32, 6);

      this.add
        .text(38, rowY + 9, `${isOk ? "✓" : "✗"} Soal ${i + 1}:`, {
          fontFamily: "Arial",
          fontSize: "12px",
          color: isOk ? "#44FF88" : "#FF4444",
          fontStyle: "bold",
        })
        .setScrollFactor(0)
        .setDepth(122);

      this.add
        .text(100, rowY + 9, c.label, {
          fontFamily: "Arial",
          fontSize: "12px",
          color: isOk ? "#AAFFCC" : "#FFAAAA",
          wordWrap: { width: W - 140 },
        })
        .setScrollFactor(0)
        .setDepth(122);
    });

    // Pesan edukatif bawah
    const eduMsg =
      pct === 1
        ? "🌟 Kamu memahami semua tentang keselamatan tubuh!"
        : "💡 Ingat: Tubuhmu milikmu. Tidak ada yang boleh memaksamu!";
    this.add
      .text(W / 2, H - 60, eduMsg, {
        fontFamily: "Arial",
        fontSize: "12px",
        color: "#FFFFCC",
        align: "center",
        wordWrap: { width: W - 50 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(122);

    // Tombol lanjut
    const btnG = this.add.graphics().setScrollFactor(0).setDepth(122);
    btnG.fillStyle(0x005522, 0.9);
    btnG.fillRoundedRect(W / 2 - 100, H - 38, 200, 30, 10);
    btnG.lineStyle(2, 0x44ff88, 0.8);
    btnG.strokeRoundedRect(W / 2 - 100, H - 38, 200, 30, 10);

    const btn = this.add
      .text(W / 2, H - 23, "▶  LANJUT KE CHAT SIM", {
        fontFamily: "Arial",
        fontSize: "12px",
        color: "#44FF88",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(123)
      .setInteractive({ useHandCursor: true });

    btn.on("pointerover", () => {
      btnG.setAlpha(0.65);
      btn.setColor("#FFFFFF");
    });
    btn.on("pointerout", () => {
      btnG.setAlpha(1);
      btn.setColor("#44FF88");
    });
    btn.on("pointerdown", () => {
      AudioManager.sfxClick();
      [ov, panG, barG, btnG, btn].forEach((o) => o.destroy());
      this.children.list
        .filter((o) => o.depth >= 120 && o.depth <= 123)
        .forEach((o) => o.destroy());
      this.phase = "chat_sim";
      // Setup narasi sebelum chat sim: HP Rara berbunyi
      this.charGfx.clear();
      DrawUtils.rara(this.charGfx, CFG.WIDTH * 0.5, CFG.HEIGHT * 0.46, "idle");
      this.dlg.show(
        [
          {
            speaker: "Narasi",
            portrait: "rara",
            text: "Di dalam angkot, HP Rara tiba-tiba berbunyi! 📱\nAda pesan masuk dari nomor yang nggak tersimpan...",
          },
          {
            speaker: "Rara (dalam hati)",
            portrait: "rara",
            text: "Eh? Nggak ada namanya... Rara nggak kenal nomor ini sama sekali.",
          },
        ],
        () => this._startChatSim(),
      );
    });
  }

  // ══════════════════════════════════════════════════════════════════════
  // CHAT SIMULASI
  get _chatMessages() {
    return [
      { from: "asing", text: "Hai sayang, sekolahnya mana? 😊" },
      { from: "asing", text: "Foto dong seragamnya 🥰 Cantik banget pasti~" },
      { from: "asing", text: "Rahasia kita ya, jangan bilang mama! 🤫" },
      {
        from: "choice",
        text: "Gimana Rara harus bales?",
        hasScreenshot: true,
        choices: [
          {
            label: "Iya om boleh, ini fotonya! 📸",
            category: "BAHAYA",
            edu: "Jangan PERNAH kirim foto ke orang yang nggak kamu kenal!\nOrang yang minta foto + minta dirahasiain dari ortu = GROOMER!\nLangsung BLOKIR dan ceritain ke ortu sekarang!",
            penalty: true,
          },
          {
            label: "Maaf, kayaknya salah kirim 🙏",
            category: "RAGU",
            points: 50,
          },
          {
            label: "JANGAN GANGGU AKU! 👿",
            category: "AMAN",
            points: 150,
            onPick: () => {
              GameState.earnAchievement("Berani Bersuara");
              if (typeof voiceMeter !== "undefined" && voiceMeter.isShout()) {
                GameState.score += 50; // bonus suara keras
              }
            },
          },
        ],
      },
    ];
  }

  _startChatSim() {
    this.chatIdx = 0;
    this._showNextChatMsg();
  }

  _showNextChatMsg() {
    const W = CFG.WIDTH,
      H = CFG.HEIGHT;
    const msgs = this._chatMessages;
    if (this.chatIdx >= msgs.length) {
      this.phase = "lapor";
      this._startLaporScene();
      return;
    }

    const msg = msgs[this.chatIdx];

    // Bersihkan hanya non-bubble — bubble lama tetap tampil sebagai riwayat chat
    this.children.list
      .filter((c) => c._isChatObj && !c._isChatBubble)
      .forEach((c) => c.destroy());

    // Header HP chat
    this._drawHPHeader();

    if (msg.from === "choice") {
      this._showChatChoices(msg);
      return;
    }

    // Bubble pesan — posisi tetap berdasarkan indeks agar riwayat terlihat
    const bx = 20,
      bw = W * 0.6;
    const bY = 100 + this.chatIdx * 42; // setiap pesan 42px di bawah yang sebelumnya
    const bg = this.add.graphics().setScrollFactor(0).setDepth(80);
    bg._isChatObj = true;
    bg._isChatBubble = true; // tetap tampil saat pesan berikutnya muncul
    bg.fillStyle(0x1e1e2e, 0.95);
    bg.fillRoundedRect(bx, bY, bw, 38, 10);
    // Sudut kiri — penanda pengirim asing
    bg.fillStyle(0x4466cc, 0.6);
    bg.fillTriangle(bx, bY + 12, bx + 8, bY + 19, bx, bY + 26);

    const txt = this.add
      .text(bx + 12, bY + 6, msg.text, {
        fontFamily: "Arial",
        fontSize: "13px",
        color: "#EEEEEE",
        wordWrap: { width: bw - 24 },
      })
      .setScrollFactor(0)
      .setDepth(81);
    txt._isChatObj = true;
    txt._isChatBubble = true;

    // Indikator TAP — bukan bubble, dihapus saat pesan berikutnya
    const next = this.add
      .text(W - 12, bY + 4, "▶ TAP", {
        fontFamily: "Arial",
        fontSize: "11px",
        color: "#FFD700",
        stroke: "#000",
        strokeThickness: 1,
      })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(82)
      .setInteractive({ useHandCursor: true });
    next._isChatObj = true;
    this.tweens.add({
      targets: next,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1,
    });
    next.on("pointerdown", () => {
      this.chatIdx++;
      this._showNextChatMsg();
    });
  }

  _showChatChoices(msg) {
    const W = CFG.WIDTH,
      H = CFG.HEIGHT;

    // Cancel any previous timer
    if (this._chatChoiceTimer) {
      this._chatChoiceTimer.remove(false);
      this._chatChoiceTimer = null;
    }

    const panG = this.add.graphics().setScrollFactor(0).setDepth(80);
    panG._isChatObj = true;
    panG.fillStyle(CFG.C.PANEL, 0.96);
    panG.fillRoundedRect(15, 228, W - 30, H - 233, 12);
    DrawUtils.sulselBorder(panG, 15, 228, W - 30, H - 233, 0.7);

    const qTxt = this.add
      .text(W / 2 - 30, 240, msg.text, {
        fontFamily: "Arial",
        fontSize: "14px",
        color: "#FFD700",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(81);
    qTxt._isChatObj = true;

    // ── 8-detik countdown timer (GDD: "timer 6-10 detik")
    let countdownSec = 8;
    const timerTxt = this.add
      .text(W - 28, 240, "⏱ 8s", {
        fontFamily: "Arial",
        fontSize: "13px",
        color: "#FFD700",
        fontStyle: "bold",
      })
      .setOrigin(1, 0.5)
      .setScrollFactor(0)
      .setDepth(82);
    timerTxt._isChatObj = true;

    const _stopTimer = () => {
      if (this._chatChoiceTimer) {
        this._chatChoiceTimer.remove(false);
        this._chatChoiceTimer = null;
      }
    };

    this._chatChoiceTimer = this.time.addEvent({
      delay: 1000,
      repeat: -1,
      callback: () => {
        countdownSec--;
        if (timerTxt.active) {
          timerTxt.setText("⏱ " + countdownSec + "s");
          if (countdownSec <= 3) timerTxt.setColor("#FF4444");
        }
        if (countdownSec <= 0) {
          _stopTimer();
          this._onChatTimeout(msg);
        }
      },
    });

    // ── Screenshot bonus button
    if (msg.hasScreenshot && !GameState.screenshotTaken) {
      const ssY = 260;
      const ssBg = this.add.graphics().setScrollFactor(0).setDepth(82);
      ssBg._isChatObj = true;
      ssBg.fillStyle(0x003355, 0.85);
      ssBg.fillRoundedRect(20, ssY, W - 40, 26, 8);
      ssBg.lineStyle(1.5, 0x44aaff, 0.8);
      ssBg.strokeRoundedRect(20, ssY, W - 40, 26, 8);

      const ssLbl = this.add
        .text(
          W / 2,
          ssY + 13,
          "📸 Screenshot percakapan ini! (+100 poin BONUS)",
          {
            fontFamily: "Arial",
            fontSize: "12px",
            color: "#88CCFF",
          },
        )
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(83)
        .setInteractive({ useHandCursor: true });
      ssLbl._isChatObj = true;

      ssLbl.on("pointerdown", () => {
        if (GameState.screenshotTaken) return;
        GameState.screenshotTaken = true;
        GameState.score += 100;
        GameState.earnAchievement("Pemblokir Handal");
        AudioManager.sfxCorrect();
        ssBg.setAlpha(0.3);
        ssLbl.setText("✓ Screenshot tersimpan! +100 poin").setColor("#44FF88");
        ssLbl.disableInteractive();
      });
    }

    const choiceStartY = msg.hasScreenshot ? 292 : 264;
    msg.choices.forEach((c, i) => {
      const by = choiceStartY + i * 40;
      const bg2 = this.add.graphics().setScrollFactor(0).setDepth(80);
      bg2._isChatObj = true;
      const col =
        c.category === "AMAN"
          ? CFG.C.AMAN
          : c.category === "BAHAYA"
            ? CFG.C.BAHAYA
            : CFG.C.RAGU;
      bg2.fillStyle(col, 0.75);
      bg2.fillRoundedRect(20, by, W - 40, 36, 8);

      const lbl = this.add
        .text(W / 2, by + 18, c.label, {
          fontFamily: "Arial",
          fontSize: "13px",
          color: "#FFF",
          wordWrap: { width: W - 60 },
          align: "center",
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(81)
        .setInteractive({ useHandCursor: true });
      lbl._isChatObj = true;

      lbl.on("pointerdown", () => {
        _stopTimer();
        GameState.addChoice(2, c.label, c.category);
        if (c.onPick) c.onPick();
        // Hapus UI pilihan saja — bubble riwayat chat (_isChatBubble) tetap tampil
        this.children.list
          .filter((cc) => cc._isChatObj && !cc._isChatBubble)
          .forEach((cc) => cc.destroy());

        if (c.category === "BAHAYA" && c.edu) {
          if (c.penalty) GameState.loseLife();
          // Visual: Rara ketakutan
          this.charGfx.clear();
          DrawUtils.rara(this.charGfx, W * 0.18, H * 0.5, "scared");
          const eduOv = this.add.graphics().setScrollFactor(0).setDepth(200);
          eduOv.fillStyle(0x330000, 0.93);
          eduOv.fillRoundedRect(15, H / 2 - 90, W - 30, 180, 12);
          eduOv.lineStyle(3, CFG.C.BAHAYA, 0.9);
          eduOv.strokeRoundedRect(15, H / 2 - 90, W - 30, 180, 12);
          const eduTitle = this.add
            .text(
              W / 2,
              H / 2 - 75,
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
          const eduTxt = this.add
            .text(W / 2, H / 2 - 22, c.edu, {
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
          const nextBtn = this.add
            .text(W / 2, H / 2 + 68, "[ MENGERTI, LANJUT ]", {
              fontFamily: "Arial",
              fontSize: "13px",
              color: "#FFD700",
              fontStyle: "bold",
            })
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(201)
            .setInteractive({ useHandCursor: true });
          nextBtn.on("pointerdown", () => {
            [eduOv, eduTitle, eduTxt, nextBtn].forEach((o) => o.destroy());
            this.chatIdx++;
            this._showNextChatMsg();
          });
        } else {
          const pts =
            c.points != null ? c.points : c.category === "AMAN" ? 100 : 50;
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
              this.chatIdx++;
              this._showNextChatMsg();
            },
          });
        }
      });
    });

    // ── BLOKIR + LAPOR KPAI (GDD AKSI TAMBAHAN: Screenshot / Blokir / Lapor)
    const blokY = choiceStartY + msg.choices.length * 40 + 6;
    const halfW = Math.floor((W - 46) / 2);

    // --- BLOKIR button (left half) ---
    const blokBg = this.add.graphics().setScrollFactor(0).setDepth(80);
    blokBg._isChatObj = true;
    blokBg.fillStyle(0x222222, 0.9);
    blokBg.fillRoundedRect(20, blokY, halfW, 28, 8);
    blokBg.lineStyle(1.5, 0xaaaaaa, 0.7);
    blokBg.strokeRoundedRect(20, blokY, halfW, 28, 8);

    const blokLbl = this.add
      .text(20 + halfW / 2, blokY + 14, "🚫 BLOKIR", {
        fontFamily: "Arial",
        fontSize: "13px",
        color: "#CCCCCC",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(81)
      .setInteractive({ useHandCursor: true });
    blokLbl._isChatObj = true;

    blokLbl.on("pointerdown", () => {
      _stopTimer();
      GameState.addChoice(2, "Blokir nomor", "AMAN");
      GameState.score += CFG.SCORE.LAPOR;
      GameState.earnAchievement("Pemblokir Handal");
      AudioManager.sfxCorrect();
      this.children.list
        .filter((cc) => cc._isChatObj)
        .forEach((cc) => cc.destroy());

      // Feedback blokir
      const fbG = this.add.graphics().setScrollFactor(0).setDepth(200);
      fbG.fillStyle(0x002211, 0.94);
      fbG.fillRoundedRect(15, H / 2 - 70, W - 30, 140, 12);
      fbG.lineStyle(2, CFG.C.AMAN);
      fbG.strokeRoundedRect(15, H / 2 - 70, W - 30, 140, 12);
      const fbT = this.add
        .text(W / 2, H / 2 - 50, "🚫 DIBLOKIR! +500 poin", {
          fontFamily: "Arial",
          fontSize: "18px",
          color: "#44FF88",
          fontStyle: "bold",
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(201);
      const fbT2 = this.add
        .text(
          W / 2,
          H / 2,
          "Ngeblokir orang asing + cerita ke ortu\n= tindakan PALING TEPAT yang bisa kamu lakuin! ✓",
          {
            fontFamily: "Arial",
            fontSize: "12px",
            color: "#CCFFCC",
            align: "center",
            wordWrap: { width: W - 60 },
          },
        )
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(201);
      const fbBtn = this.add
        .text(W / 2, H / 2 + 52, "[ LANJUT ]", {
          fontFamily: "Arial",
          fontSize: "13px",
          color: "#FFD700",
          fontStyle: "bold",
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(201)
        .setInteractive({ useHandCursor: true });
      fbBtn.on("pointerdown", () => {
        [fbG, fbT, fbT2, fbBtn].forEach((o) => o.destroy());
        // Skip sisa chat, langsung ke lapor
        this.phase = "lapor";
        this._startLaporScene();
      });
    });

    // --- LAPOR KPAI button (right half) ---
    const kpaiX = 20 + halfW + 6;
    const kpaiBg = this.add.graphics().setScrollFactor(0).setDepth(80);
    kpaiBg._isChatObj = true;
    kpaiBg.fillStyle(0x003344, 0.9);
    kpaiBg.fillRoundedRect(kpaiX, blokY, halfW, 28, 8);
    kpaiBg.lineStyle(1.5, 0x44ddcc, 0.8);
    kpaiBg.strokeRoundedRect(kpaiX, blokY, halfW, 28, 8);

    const kpaiLbl = this.add
      .text(kpaiX + halfW / 2, blokY + 14, "📞 Lapor KPAI", {
        fontFamily: "Arial",
        fontSize: "13px",
        color: "#44DDCC",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(81)
      .setInteractive({ useHandCursor: true });
    kpaiLbl._isChatObj = true;

    kpaiLbl.on("pointerdown", () => {
      _stopTimer();
      GameState.addChoice(2, "Lapor KPAI", "AMAN");
      GameState.score += 100;
      GameState.earnAchievement("Lapor KPAI");
      AudioManager.sfxCorrect();
      this.children.list
        .filter((cc) => cc._isChatObj)
        .forEach((cc) => cc.destroy());
      this._showKPAIPopup();
    });
  }

  // Virtual KPAI call popup (GDD: AKSI TAMBAHAN — "Call KPAI virtual")
  _showKPAIPopup() {
    const W = CFG.WIDTH,
      H = CFG.HEIGHT;
    const popG = this.add.graphics().setScrollFactor(0).setDepth(200);
    popG.fillStyle(0x002233, 0.96);
    popG.fillRoundedRect(15, H / 2 - 105, W - 30, 210, 14);
    popG.lineStyle(3, 0x44ddcc, 0.9);
    popG.strokeRoundedRect(15, H / 2 - 105, W - 30, 210, 14);

    const popTitle = this.add
      .text(W / 2, H / 2 - 88, "📞 KPAI — Komisi Perlindungan Anak", {
        fontFamily: "Arial",
        fontSize: "14px",
        color: "#44DDCC",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(201);

    // Animated "calling" effect
    const ring = this.add
      .text(W / 2, H / 2 - 54, "📱 Memanggil... ☎", {
        fontFamily: "Arial",
        fontSize: "20px",
        color: "#FFFFFF",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(201);
    this.tweens.add({
      targets: ring,
      alpha: 0.2,
      duration: 500,
      yoyo: true,
      repeat: 3,
    });

    const popMsg = this.add
      .text(
        W / 2,
        H / 2 + 4,
        '"Halo, ini KPAI! Keren banget kamu berani lapor!\nSimpan screenshot-nya sebagai bukti ya.\nHubungi kami kapanpun di Hotline 129 — kamu nggak sendirian!" 💙',
        {
          fontFamily: "Arial",
          fontSize: "12px",
          color: "#CCFFFF",
          align: "center",
          wordWrap: { width: W - 60 },
          lineSpacing: 4,
        },
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(201);

    const popPts = this.add
      .text(W / 2, H / 2 + 68, "+100 poin  🎖 Achievement: Lapor KPAI", {
        fontFamily: "Arial",
        fontSize: "12px",
        color: "#FFD700",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(201);

    const popBtn = this.add
      .text(W / 2, H / 2 + 92, "[ TUTUP & LANJUT ]", {
        fontFamily: "Arial",
        fontSize: "13px",
        color: "#FFD700",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(201)
      .setInteractive({ useHandCursor: true });
    popBtn.on("pointerdown", () => {
      [popG, popTitle, ring, popMsg, popPts, popBtn].forEach((o) =>
        o.destroy(),
      );
      // Continue to next chat message
      this.chatIdx++;
      this._showNextChatMsg();
    });
  }

  // Timer habis — Rara ketakutan, auto-pilih respons lambat
  _onChatTimeout(msg) {
    this.children.list.filter((c) => c._isChatObj).forEach((c) => c.destroy());
    const W = CFG.WIDTH,
      H = CFG.HEIGHT;
    GameState.addChoice(2, "Terlalu lama merespons", "BAHAYA");
    GameState.loseLife(); // Penalti nyawa — diam terlalu lama = berbahaya

    // Visual feedback: Rara ketakutan (GDD spec)
    this.charGfx.clear();
    DrawUtils.rara(this.charGfx, W * 0.18, H * 0.5, "scared");

    const ovG = this.add.graphics().setScrollFactor(0).setDepth(200);
    ovG.fillStyle(0x330000, 0.92);
    ovG.fillRoundedRect(15, H / 2 - 85, W - 30, 170, 12);
    ovG.lineStyle(2, CFG.C.BAHAYA);
    ovG.strokeRoundedRect(15, H / 2 - 85, W - 30, 170, 12);
    this.add
      .text(W / 2, H / 2 - 68, "⏰ TERLALU LAMA! Rara panik...", {
        fontFamily: "Arial",
        fontSize: "15px",
        color: "#FF4444",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(201);
    this.add
      .text(
        W / 2,
        H / 2 - 20,
        "Merespons cepat itu penting banget!\nDiam terlalu lama bisa dianggap setuju sama si pengirim.\nKalau ada yang ganggu di chat — langsung BLOKIR atau BALAS TEGAS!",
        {
          fontFamily: "Arial",
          fontSize: "12px",
          color: "#FFCCCC",
          wordWrap: { width: W - 60 },
          align: "center",
          lineSpacing: 4,
        },
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(201);
    const okBtn = this.add
      .text(W / 2, H / 2 + 62, "[ LANJUT ]", {
        fontFamily: "Arial",
        fontSize: "13px",
        color: "#FFD700",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(201)
      .setInteractive({ useHandCursor: true });
    okBtn.on("pointerdown", () => {
      [ovG, okBtn].forEach((o) => o.destroy());
      this.children.list
        .filter((c) => c.depth === 201)
        .forEach((c) => c.destroy());
      this.chatIdx++;
      this._showNextChatMsg();
    });
  }

  _drawHPHeader() {
    const W = CFG.WIDTH;
    const hdr = this.add.graphics().setScrollFactor(0).setDepth(79);
    hdr._isChatObj = true;
    hdr.fillStyle(0x25d366, 0.95);
    hdr.fillRect(0, 50, W, 44);
    const lbl = this.add
      .text(W / 2, 72, "💬 Nomor Asing (+62xxx)", {
        fontFamily: "Arial",
        fontSize: "13px",
        color: "#FFFFFF",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(80);
    lbl._isChatObj = true;
  }

  // ══════════════════════════════════════════════════════════════════════
  // LAPOR SOPIR — Voice Challenge
  _startLaporScene() {
    this.children.list.filter((c) => c._isChatObj).forEach((c) => c.destroy());
    this._drawPeteInterior();

    // Tampilkan dulu narasi singkat lewat dialog
    this.charGfx.clear();
    // Rara di kanan-tengah (dekat NPC), konsisten dengan posisi awal voice challenge
    DrawUtils.rara(this.charGfx, CFG.WIDTH * 0.6, CFG.HEIGHT * 0.48, "scared");
    DrawUtils.shadowNpc(
      this.charGfx,
      CFG.WIDTH * 0.82,
      CFG.HEIGHT * 0.44,
      true,
      true,
    );

    this.dlg.show(
      [
        {
          speaker: "Narasi",
          portrait: "rara",
          text: "Tiba-tiba pria asing itu geser duduk makin deket ke arah Rara... 😨",
        },
        {
          speaker: "Rara (dalam hati)",
          portrait: "rara",
          text: "Eh?! Nggak nyaman banget! Kenapa dia pindah ke sini?!",
        },
        {
          speaker: "Pria Asing",
          portrait: "shadow_angry",
          text: '"Eh dek, gimana sekolahnya? Nggak usah takut, Om nggak gigit kok~"',
        },
        {
          speaker: "Rara (dalam hati)",
          portrait: "rara",
          text: "Rara HARUS minta tolong sekarang!\nKalau TERIAK keras, sopir pasti denger! 📢",
        },
      ],
      () => {
        this.phase = "lapor_voice";
        this._startLaporVoiceChallenge();
      },
    );
  }

  _startLaporVoiceChallenge() {
    const W = CFG.WIDTH,
      H = CFG.HEIGHT;

    this._laporShoutAccum = 0;
    this._laporCountdown = 12000; // 12 detik
    this._laporDone = false;
    this._laporRaraX = W * 0.6; // Rara mulai di posisi sama dengan dialog (kanan-tengah)

    // Hitung timer countdown display
    this._laporObjs = [];

    const ov = this.add.graphics().setScrollFactor(0).setDepth(90);
    ov.fillStyle(0x000000, 0.55);
    ov.fillRect(0, 0, W, H);
    this._laporObjs.push(ov);

    // Sopir di kiri (tujuan)
    const sopirG = this.add.graphics().setScrollFactor(0).setDepth(91);
    sopirG.fillStyle(0xffd700, 0.9);
    sopirG.fillCircle(60, H * 0.4, 18); // kepala sopir
    sopirG.fillStyle(0xff8800);
    sopirG.fillRect(42, H * 0.4 + 18, 36, 40); // badan
    this.add
      .text(48, H * 0.4 - 28, "SOPIR\nANGKOT", {
        fontFamily: "Arial",
        fontSize: "9px",
        color: "#FFD700",
        align: "center",
      })
      .setScrollFactor(0)
      .setDepth(92);
    this._laporObjs.push(sopirG);

    // Panah arah tujuan
    const arrG = this.add.graphics().setScrollFactor(0).setDepth(91);
    arrG.fillStyle(0xffd700, 0.6);
    arrG.fillTriangle(100, H * 0.38, 130, H * 0.42, 100, H * 0.46);
    this._laporObjs.push(arrG);

    // Instruksi utama
    const instrTxt = this.add
      .text(W / 2, H * 0.1, "📢 TERIAK untuk memanggil sopir!", {
        fontFamily: "Arial",
        fontSize: "16px",
        color: "#FFD700",
        fontStyle: "bold",
        stroke: "#000",
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(92);
    this._laporObjs.push(instrTxt);

    // Besar voice meter di tengah
    this._laporVoiceBarBg = this.add.graphics().setScrollFactor(0).setDepth(91);
    this._laporVoiceBarFg = this.add.graphics().setScrollFactor(0).setDepth(92);
    this._laporVoiceBarBg.fillStyle(0x333333);
    this._laporVoiceBarBg.fillRoundedRect(W / 2 - 120, H * 0.78, 240, 22, 8);
    this._laporObjs.push(this._laporVoiceBarBg);
    this._laporObjs.push(this._laporVoiceBarFg);

    this._laporVoiceLbl = this.add
      .text(W / 2, H * 0.74, "🎤 Teriak keras-keras!", {
        fontFamily: "Arial",
        fontSize: "13px",
        color: "#FFAAAA",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(92);
    this._laporObjs.push(this._laporVoiceLbl);

    // Countdown timer display
    this._laporTimerTxt = this.add
      .text(W - 20, H * 0.1, "⏱ 12", {
        fontFamily: "Arial",
        fontSize: "17px",
        color: "#FF8888",
        fontStyle: "bold",
      })
      .setOrigin(1, 0.5)
      .setScrollFactor(0)
      .setDepth(92);
    this._laporObjs.push(this._laporTimerTxt);

    // Shout progress ring di sekitar Rara
    this._laporRingGfx = this.add.graphics().setScrollFactor(0).setDepth(92);
    this._laporObjs.push(this._laporRingGfx);

    // Fallback button (mic tidak tersedia)
    if (!GameState.micAvailable) {
      this._buildLaporFallbackBtn();
    }
  }

  _buildLaporFallbackBtn() {
    const W = CFG.WIDTH,
      H = CFG.HEIGHT;
    const fbBg = this.add.graphics().setScrollFactor(0).setDepth(93);
    fbBg.fillStyle(CFG.C.BAHAYA, 0.9);
    fbBg.fillRoundedRect(W / 2 - 95, H * 0.87, 190, 38, 10);
    const fbLbl = this.add
      .text(W / 2, H * 0.87 + 19, "📢 TERIAK! (tap)", {
        fontFamily: "Arial",
        fontSize: "14px",
        color: "#FFF",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(94)
      .setInteractive({ useHandCursor: true });
    fbLbl.on("pointerdown", () => voiceMeter.simulateShout(1200));
    this._laporObjs.push(fbBg);
    this._laporObjs.push(fbLbl);
  }

  _tickLaporVoice(delta) {
    if (this._laporDone) return;
    const W = CFG.WIDTH,
      H = CFG.HEIGHT;

    this._laporCountdown -= delta;

    // Timer display
    const secLeft = Math.max(0, Math.ceil(this._laporCountdown / 1000));
    if (this._laporTimerTxt) {
      this._laporTimerTxt.setText(`⏱ ${secLeft}`);
      this._laporTimerTxt.setColor(secLeft <= 4 ? "#FF3333" : "#FF8888");
    }

    // Rara bergerak ke kiri saat berteriak
    if (voiceMeter.isShout()) {
      this._laporShoutAccum += delta;
      this._laporRaraX = Math.max(
        W * 0.25,
        this._laporRaraX - (180 * delta) / 1000,
      );

      // Ring animasi shout
      const pct = Math.min(1, this._laporShoutAccum / 1000);
      if (this._laporRingGfx) {
        this._laporRingGfx.clear();
        this._laporRingGfx.lineStyle(3, 0xffd700, 0.85);
        this._laporRingGfx.strokeCircle(
          this._laporRaraX,
          H * 0.46,
          28 + pct * 14,
        );
        this._laporRingGfx.lineStyle(2, 0xff8800, 0.5);
        this._laporRingGfx.strokeCircle(
          this._laporRaraX,
          H * 0.46,
          38 + pct * 14,
        );
      }
      if (this._laporVoiceLbl)
        this._laporVoiceLbl.setText("📢 BAGUS! Terus teriak!");
    } else {
      if (this._laporRingGfx) this._laporRingGfx.clear();
      if (this._laporVoiceLbl)
        this._laporVoiceLbl.setText("🎤 Teriak keras-keras!");
    }

    // Update besar voice bar
    const vmVal = voiceMeter.get();
    if (this._laporVoiceBarFg) {
      this._laporVoiceBarFg.clear();
      this._laporVoiceBarFg.fillStyle(vmVal >= 0.7 ? 0x44ff88 : 0xff6600);
      this._laporVoiceBarFg.fillRoundedRect(
        W / 2 - 120,
        H * 0.78,
        240 * vmVal,
        22,
        8,
      );
    }

    // Gambar Rara bergerak
    this.charGfx.clear();
    DrawUtils.rara(
      this.charGfx,
      this._laporRaraX,
      H * 0.46,
      voiceMeter.isShout() ? "run" : "scared",
    );

    // Sukses: 1 detik teriak akumulasi
    if (this._laporShoutAccum >= 1000) {
      this._laporDone = true;
      this._laporSuccess();
      return;
    }

    // Timeout: tampilkan fallback pilihan dialog
    if (this._laporCountdown <= 0) {
      this._laporDone = true;
      this._laporTimeout();
    }
  }

  _laporSuccess() {
    this._clearLaporObjs();
    const W = CFG.WIDTH,
      H = CFG.HEIGHT;
    GameState.addChoice(2, "📢 Berteriak memanggil sopir!", "AMAN");
    GameState.score += CFG.SCORE.LAPOR; // +500 bonus lapor
    GameState.earnAchievement("Berani Lapor");
    AudioManager.sfxCorrect();

    // Flash hijau + animasi sopir datang
    const flash = this.add.graphics().setScrollFactor(0).setDepth(200);
    flash.fillStyle(0x00ff88, 0.35);
    flash.fillRect(0, 0, W, H);
    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 500,
      onComplete: () => flash.destroy(),
    });

    this.charGfx.clear();
    DrawUtils.rara(this.charGfx, W * 0.35, H * 0.46, "idle");
    DrawUtils.shadowNpc(this.charGfx, W * 0.65, H * 0.44, false, false);

    this.dlg.show(
      [
        {
          speaker: "Ibu Sopir",
          portrait: "sopir",
          text: '"Ada apa dek?! Ayo ke depan sini sama Ibu!\nTenang ya, ada Ibu di sini~"\n\n✓ KEREN! Bersuara keras = tindakan paling berani dan tepat! +500 poin',
        },
      ],
      () => {
        this.phase = "educard";
        this._showEduCard();
      },
    );
  }

  _laporTimeout() {
    this._clearLaporObjs();
    const W = CFG.WIDTH,
      H = CFG.HEIGHT;

    // Tampilkan pilihan fallback (dialog)
    this.charGfx.clear();
    DrawUtils.rara(this.charGfx, W * 0.35, H * 0.46, "scared");

    this.dlg.show(
      [
        {
          speaker: "Narasi",
          portrait: "rara",
          text: "Waktu hampir habis! Rara HARUS bertindak SEKARANG! ⏰",
        },
        {
          speaker: "— PILIH TINDAKAN —",
          portrait: "sopir",
          text: "Gimana Rara minta bantuan sopir?",
          choices: [
            {
              label: "📢 Teriak keras 'TOLONG!'",
              category: "AMAN",
              onPick: () => {
                GameState.earnAchievement("Berani Lapor");
                GameState.score += 200;
              },
            },
            { label: "Bisik ke penumpang sebelah", category: "RAGU" },
            { label: "Diam dan berharap aman", category: "BAHAYA" },
          ],
        },
      ],
      () => {
        // Akhir cerita berbeda sesuai pilihan yang diambil
        const lastChoice = GameState.choices[GameState.choices.length - 1];
        const cat = lastChoice ? lastChoice.category : "BAHAYA";
        if (cat !== "BAHAYA") {
          // AMAN / RAGU: suara Rara terdengar, sopir datang membantu
          this.dlg.show(
            [
              {
                speaker: "Ibu Sopir",
                portrait: "sopir",
                text: '"Hei dek! Ada apa?! Ayo ke depan sini sama Ibu ya!"',
              },
            ],
            () => {
              this.phase = "educard";
              this._showEduCard();
            },
          );
        } else {
          // BAHAYA: Rara diam — sopir tidak tahu ada masalah
          this.dlg.show(
            [
              {
                speaker: "Narasi",
                portrait: "rara",
                text: "Rara cuma bisa diam... Untungnya angkot udah sampai di sekolah.\n⚠ Ingat: kalau merasa nggak aman, TERIAK keras! Jangan diam aja!",
              },
            ],
            () => {
              this.phase = "educard";
              this._showEduCard();
            },
          );
        }
      },
    );
  }

  _clearLaporObjs() {
    if (this._laporObjs) {
      this._laporObjs.forEach((o) => {
        if (o && o.active) o.destroy();
      });
      this._laporObjs = [];
    }
    this._laporVoiceBarBg = null;
    this._laporVoiceBarFg = null;
    this._laporVoiceLbl = null;
    this._laporTimerTxt = null;
    this._laporRingGfx = null;
  }

  // ══════════════════════════════════════════════════════════════════════
  // EDU CARD
  _showEduCard() {
    const W = CFG.WIDTH,
      H = CFG.HEIGHT;
    const ov = this.add.graphics().setScrollFactor(0).setDepth(150);
    ov.fillStyle(0x000000, 0.85);
    ov.fillRect(0, 0, W, H);

    const card = this.add.graphics().setScrollFactor(0).setDepth(151);
    card.fillStyle(0x1a0a00, 0.97);
    card.fillRoundedRect(20, 25, W - 40, H - 55, 14);
    DrawUtils.sulselBorder(card, 20, 25, W - 40, H - 55, 1.0);

    this.add
      .text(W / 2, 42, "📚 Kartu Edukasi — Hari 2", {
        fontFamily: "Arial",
        fontSize: "17px",
        color: "#4488FF",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(152);

    const content = [
      {
        h: "🛡 Tubuhku = Milikku!",
        b: "Bagian privat tubuhmu NGGAK BOLEH disentuh siapapun\ntanpa izinmu — kecuali dokter dan ada ortu yang mendampingi.",
      },
      {
        h: "📱 Aman di Dunia Online:",
        b: "• Jangan kirim foto dirimu ke orang yang nggak dikenal!\n• Chat nggak nyaman? Langsung BLOKIR + screenshot-nya\n• Ceritain ke ortu atau guru — jangan pendam sendiri!",
      },
      {
        h: "✊ Ingat Ini Selalu!",
        b: '"Tidak" adalah kata yang KUAT dan itu HAK kamu!\nNggak ada yang boleh maksa kamu melakukan\nhal yang bikin kamu nggak nyaman.',
      },
    ];
    let y = 72;
    content.forEach((c) => {
      this.add
        .text(35, y, c.h, {
          fontFamily: "Arial",
          fontSize: "14px",
          color: "#88CCFF",
          fontStyle: "bold",
        })
        .setScrollFactor(0)
        .setDepth(152);
      this.add
        .text(35, y + 22, c.b, {
          fontFamily: "Arial",
          fontSize: "13px",
          color: "#FFFFCC",
          wordWrap: { width: W - 75 },
          lineSpacing: 3,
        })
        .setScrollFactor(0)
        .setDepth(152);
      y += 88;
    });

    this.add
      .text(
        W / 2,
        H - 55,
        "📞 Butuh bantuan? Hotline Anak: 129 | KPAI: 021-31901556",
        {
          fontFamily: "Arial",
          fontSize: "12px",
          color: "#FFD700",
          align: "center",
        },
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(152);

    const btn = this.add
      .text(W / 2, H - 28, "[ LANJUT ]", {
        ...CFG.F.BUTTON,
        color: "#FFD700",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(152)
      .setInteractive({ useHandCursor: true });
    btn.on("pointerdown", () => {
      this.cameras.main.fadeOut(400);
      this.time.delayedCall(400, () => this.scene.start("Result2"));
    });
  }

  _goGameOver() {
    this.cameras.main.fadeOut(500);
    this.time.delayedCall(500, () =>
      this.scene.start("GameOver", { fromDay: 2 }),
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
      "🚫 Jangan pernah ikut orang asing,\n    apapun alasan yang mereka berikan.",
      "📢 Jika terancam: TERIAK KERAS, LARI\n    ke tempat ramai, CARI orang dewasa!",
      "📱 Nomor darurat: Polisi 110\n    Kemensos 129 | KPAI 021-31901556",
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

    // Walk intro phase
    if (this.phase === "walk_intro") {
      this._tickWalkIntro(delta);
      return;
    }

    // Lapor voice challenge phase
    if (this.phase === "lapor_voice") {
      this._tickLaporVoice(delta);
      return;
    }

    // Drag-drop quiz timer
    if (this.phase === "quiz" && this._ddActive) {
      this._ddTimerMs -= delta;
      if (this._ddTimerTxt) {
        const s = Math.max(0, Math.ceil(this._ddTimerMs / 1000));
        this._ddTimerTxt
          .setText("⏰ " + s + "s")
          .setColor(s <= 5 ? "#FF3333" : "#FFD700");
      }
      if (this._ddTimerMs <= 0) {
        this._onDDTimeout();
      }
    }

    // Draw karakter jika di luar fase quiz/chat/lapor (dengan bobbing)
    if (!["quiz", "chat_sim", "lapor"].includes(this.phase)) {
      this.charGfx.clear();
      const bobY = Math.sin(this.time.now / 500) * 2;
      DrawUtils.rara(
        this.charGfx,
        CFG.WIDTH * 0.45,
        CFG.HEIGHT * 0.46 + bobY,
        "idle",
      );
    }
  }
}
