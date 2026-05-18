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
    GameState.checkpoints.d2 = true; // bisa retry dari Day2 tanpa ulang prolog
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

    // Halte
    g.fillStyle(0x4169e1);
    g.fillRect(W * 0.3, H * 0.28, 180, 55);
    g.fillStyle(0x3355cc);
    g.fillRect(W * 0.28, H * 0.23, 184, 8);
    g.fillStyle(0xc0c0c0);
    g.fillRect(W * 0.3, H * 0.28, 5, H * 0.27);
    g.fillRect(W * 0.3 + 175, H * 0.28, 5, H * 0.27);
    this.add.text(W * 0.3 + 8, H * 0.29, "HALTE ANGKOT\nJalan Menuju Sekolah", {
      fontFamily: "Arial",
      fontSize: "11px",
      color: "#FFFFFF",
      lineSpacing: 2,
    });

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
        this.phase = "halte";
        this._startHalteScene();
      },
    });
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
          text: "Rara sampai di halte. Angkot menuju sekolah sudah datang.\nAda beberapa penumpang di dalam...",
        },
        {
          speaker: "Narasi",
          portrait: "rara",
          text: "Di dalam angkot, ada penumpang yang kelihatan tidak beres.\nRara harus tetap waspada!",
        },
      ],
      () => {
        this.phase = "in_pete";
        this._drawPeteInterior();
        this.charGfx.clear();
        this.time.delayedCall(600, () => this._startQuiz());
      },
    );
  }

  // ══════════════════════════════════════════════════════════════════════
  // QUIZ BODY SAFETY
  _startQuiz() {
    this.phase = "quiz";
    this.quizScore = 0;
    this._quizFinished = false;
    // Drag-drop body zone quiz
    this._showInlineTutorial(
      "\ud83d\udcf1 MISI KUIS!",
      "Jawab 4 pertanyaan tentang keselamatan diri.\nTidak ada batas waktu \u2014 pilih dengan bijak!\n\n\u2713 AMAN = poin penuh\n\u26a0 Salah = cukup baca penjelasannya, tidak ada hukuman nyawa",
      () => this._showBodyZoneQuiz(),
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

  _showBodyZoneQuiz() {
    const W = CFG.WIDTH,
      H = CFG.HEIGHT;
    const self = this;
    const CHIP_W = 112,
      CHIP_H = 36;
    const ZONE_Y = 45,
      ZONE_W = 195,
      ZONE_H = H - 55;
    const ZONE2_X = W - ZONE_W - 5;
    const AMAN_CX = 5 + ZONE_W / 2;
    const BAH_CX = ZONE2_X + ZONE_W / 2;

    // AMAN zone (left)
    const amanG = this.add.graphics().setScrollFactor(0).setDepth(40);
    amanG._isQuizObj = true;
    amanG.fillStyle(0x003300, 0.65);
    amanG.fillRoundedRect(5, ZONE_Y, ZONE_W, ZONE_H, 10);
    amanG.lineStyle(3, 0x44ff88, 0.8);
    amanG.strokeRoundedRect(5, ZONE_Y, ZONE_W, ZONE_H, 10);

    // BAHAYA zone (right)
    const bahayaG = this.add.graphics().setScrollFactor(0).setDepth(40);
    bahayaG._isQuizObj = true;
    bahayaG.fillStyle(0x330000, 0.65);
    bahayaG.fillRoundedRect(ZONE2_X, ZONE_Y, ZONE_W, ZONE_H, 10);
    bahayaG.lineStyle(3, 0xff4444, 0.8);
    bahayaG.strokeRoundedRect(ZONE2_X, ZONE_Y, ZONE_W, ZONE_H, 10);

    // Zone labels
    const mkLbl = (cx, y, txt, col) => {
      const t = this.add
        .text(cx, y, txt, {
          fontFamily: "Arial",
          fontSize: "11px",
          color: col,
          fontStyle: "bold",
          align: "center",
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(41);
      t._isQuizObj = true;
    };
    mkLbl(AMAN_CX, ZONE_Y + 22, "BOLEH\nDISENTUH", "#44FF88");
    mkLbl(BAH_CX, ZONE_Y + 22, "AREA\nPRIVAT", "#FF6666");

    // Instruction + timer (top center, between zones)
    const instrTxt = this.add
      .text(W / 2, 13, "Drag bagian tubuh ke zona yang tepat!", {
        fontFamily: "Arial",
        fontSize: "11px",
        color: "#CCCCCC",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(55);
    instrTxt._isQuizObj = true;

    self._quizTimeLeft = 30;
    const timerTxt = this.add
      .text(W / 2, 31, "30", {
        fontFamily: "Arial",
        fontSize: "15px",
        color: "#FFD700",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(55);
    timerTxt._isQuizObj = true;

    // Items: 3 AMAN + 3 BAHAYA (shuffled)
    const items = [
      { label: "Tangan", correct: "AMAN" },
      { label: "Pipi", correct: "AMAN" },
      { label: "Bahu", correct: "AMAN" },
      { label: "Perut", correct: "BAHAYA" },
      { label: "Paha", correct: "BAHAYA" },
      { label: "Privat", correct: "BAHAYA" },
    ];
    for (let _i = items.length - 1; _i > 0; _i--) {
      const _j = Math.floor(Math.random() * (_i + 1));
      [items[_i], items[_j]] = [items[_j], items[_i]];
    }

    // Starting positions — 2 rows of 3 in center strip
    const starts = [
      { x: W / 2 - 130, y: 110 },
      { x: W / 2, y: 110 },
      { x: W / 2 + 130, y: 110 },
      { x: W / 2 - 130, y: 170 },
      { x: W / 2, y: 170 },
      { x: W / 2 + 130, y: 170 },
    ];

    // Create draggable chip containers
    const chips = [];
    items.forEach((item, idx) => {
      const sp = starts[idx];
      const chipBg = this.add.graphics();
      chipBg.fillStyle(0x334477, 0.92);
      chipBg.fillRoundedRect(-CHIP_W / 2, -CHIP_H / 2, CHIP_W, CHIP_H, 8);
      chipBg.lineStyle(2, 0x8899cc, 0.8);
      chipBg.strokeRoundedRect(-CHIP_W / 2, -CHIP_H / 2, CHIP_W, CHIP_H, 8);
      const chipTxt = this.add
        .text(0, 0, item.label, {
          fontFamily: "Arial",
          fontSize: "14px",
          color: "#FFFFFF",
          fontStyle: "bold",
        })
        .setOrigin(0.5);
      const chip = this.add.container(sp.x, sp.y, [chipBg, chipTxt]);
      chip.setSize(CHIP_W, CHIP_H);
      chip.setInteractive({ draggable: true });
      chip.setScrollFactor(0);
      chip.setDepth(85);
      chip._isQuizObj = true;
      chip._correct = item.correct;
      chip._placed = null;
      chip._startX = sp.x;
      chip._startY = sp.y;
      chip._chipBg = chipBg;
      chips.push(chip);
    });

    // Zone bounds for hit testing
    const amanBounds = { x: 5, y: ZONE_Y, w: ZONE_W, h: ZONE_H };
    const bahBounds = { x: ZONE2_X, y: ZONE_Y, w: ZONE_W, h: ZONE_H };
    const inBounds = (cx, cy, b) =>
      cx >= b.x && cx <= b.x + b.w && cy >= b.y && cy <= b.y + b.h;

    const finishQuiz = () => {
      if (self._quizFinished) return;
      self._quizFinished = true;
      if (self._quizTimer) {
        self._quizTimer.remove();
        self._quizTimer = null;
      }
      self.input.off("drag");
      self.input.off("dragend");

      const correct = chips.filter((c) => c._placed === c._correct).length;
      const pts =
        correct === 6
          ? CFG.SCORE.QUIZ
          : correct >= 4
            ? CFG.SCORE.AMAN
            : CFG.SCORE.RAGU;
      GameState.addScore(pts);
      GameState.choices.push({
        day: 2,
        label: "Quiz Tubuh " + correct + "/6 benar",
        category: correct === 6 ? "AMAN" : "RAGU",
        pts,
      });
      if (correct === 6) GameState.earnAchievement("Penjaga Batas Tubuh");
      correct === 6 ? AudioManager.sfxCorrect() : AudioManager.sfxNeutral();

      chips.forEach((c) => {
        if (c && c.active) c.destroy();
      });
      self.children.list
        .filter((c) => c._isQuizObj && c.active)
        .forEach((c) => c.destroy());

      // Feedback panel
      const fbG = self.add.graphics().setScrollFactor(0).setDepth(90);
      fbG.fillStyle(correct === 6 ? 0x003300 : 0x332200, 0.94);
      fbG.fillRoundedRect(15, H / 2 - 95, W - 30, 190, 12);
      fbG.lineStyle(3, correct === 6 ? CFG.C.AMAN : CFG.C.RAGU);
      fbG.strokeRoundedRect(15, H / 2 - 95, W - 30, 190, 12);

      const scoreLabel =
        correct === 6
          ? "SEMPURNA! +" + CFG.SCORE.QUIZ
          : correct + "/6 Benar! +" + pts;
      const icon = self.add
        .text(W / 2, H / 2 - 72, scoreLabel, {
          fontFamily: "Arial",
          fontSize: "22px",
          color: correct === 6 ? "#44FF88" : "#FFD700",
          fontStyle: "bold",
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(91);

      const eduTxt = self.add
        .text(
          W / 2,
          H / 2 - 10,
          [
            "Area Privat = bagian yang tertutup pakaian renang",
            "BOLEH DISENTUH: Tangan, Pipi, Bahu",
            "AREA PRIVAT: Perut, Paha, Privat",
            "",
            "Tidak ada yang boleh menyentuhnya tanpa izinmu!",
          ].join("\n"),
          {
            fontFamily: "Arial",
            fontSize: "13px",
            color: "#FFFFCC",
            wordWrap: { width: W - 60 },
            align: "center",
            lineSpacing: 4,
          },
        )
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(91);

      const nextBtn = self.add
        .text(W / 2, H / 2 + 72, "[ LANJUT ]", {
          ...CFG.F.BUTTON,
          color: "#FFD700",
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(91)
        .setInteractive({ useHandCursor: true });
      nextBtn.on("pointerdown", () => {
        [fbG, icon, eduTxt, nextBtn].forEach((o) => o.destroy());
        self.phase = "chat_sim";
        self._startChatSim();
      });
    };

    // Drag handlers
    this.input.on("drag", (pointer, obj, dragX, dragY) => {
      if (!obj._isQuizObj || obj._correct === undefined) return;
      obj.x = dragX;
      obj.y = dragY;
      obj.setDepth(90);
    });

    this.input.on("dragend", (pointer, obj) => {
      if (!obj._isQuizObj || obj._correct === undefined) return;
      obj.setDepth(85);

      if (inBounds(obj.x, obj.y, amanBounds)) {
        // Alat Privat TIDAK boleh masuk zona BOLEH DISENTUH
        if (obj._correct === "BAHAYA") {
          obj._placed = null;
          obj.x = obj._startX;
          obj.y = obj._startY;
          obj._chipBg.clear();
          obj._chipBg.fillStyle(0x334477, 0.92);
          obj._chipBg.fillRoundedRect(
            -CHIP_W / 2,
            -CHIP_H / 2,
            CHIP_W,
            CHIP_H,
            8,
          );
          obj._chipBg.lineStyle(2, 0xff4444, 0.9);
          obj._chipBg.strokeRoundedRect(
            -CHIP_W / 2,
            -CHIP_H / 2,
            CHIP_W,
            CHIP_H,
            8,
          );
          // Feedback edukatif
          const fbTxt = self.add
            .text(
              W / 2,
              H * 0.46,
              "⚠ Ini area privat!\nHanya boleh masuk ke zona AREA PRIVAT.",
              {
                fontFamily: "Arial",
                fontSize: "13px",
                color: "#FF8888",
                fontStyle: "bold",
                align: "center",
                stroke: "#000",
                strokeThickness: 2,
              },
            )
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(95);
          fbTxt._isQuizObj = true;
          self.time.delayedCall(1600, () => {
            if (fbTxt.active) fbTxt.destroy();
          });
          return;
        }
        obj._placed = "AMAN";
        const countBefore = chips.filter(
          (c) => c._placed === "AMAN" && c !== obj,
        ).length;
        obj.x = AMAN_CX;
        obj.y = ZONE_Y + 70 + countBefore * 60;
        obj._chipBg.clear();
        obj._chipBg.fillStyle(0x005522, 0.92);
        obj._chipBg.fillRoundedRect(
          -CHIP_W / 2,
          -CHIP_H / 2,
          CHIP_W,
          CHIP_H,
          8,
        );
        obj._chipBg.lineStyle(2, 0x44ff88);
        obj._chipBg.strokeRoundedRect(
          -CHIP_W / 2,
          -CHIP_H / 2,
          CHIP_W,
          CHIP_H,
          8,
        );
      } else if (inBounds(obj.x, obj.y, bahBounds)) {
        obj._placed = "BAHAYA";
        const countBefore = chips.filter(
          (c) => c._placed === "BAHAYA" && c !== obj,
        ).length;
        obj.x = BAH_CX;
        obj.y = ZONE_Y + 70 + countBefore * 60;
        obj._chipBg.clear();
        obj._chipBg.fillStyle(0x660000, 0.92);
        obj._chipBg.fillRoundedRect(
          -CHIP_W / 2,
          -CHIP_H / 2,
          CHIP_W,
          CHIP_H,
          8,
        );
        obj._chipBg.lineStyle(2, 0xff4444);
        obj._chipBg.strokeRoundedRect(
          -CHIP_W / 2,
          -CHIP_H / 2,
          CHIP_W,
          CHIP_H,
          8,
        );
      } else {
        // Snap back to start
        obj._placed = null;
        obj.x = obj._startX;
        obj.y = obj._startY;
        obj._chipBg.clear();
        obj._chipBg.fillStyle(0x334477, 0.92);
        obj._chipBg.fillRoundedRect(
          -CHIP_W / 2,
          -CHIP_H / 2,
          CHIP_W,
          CHIP_H,
          8,
        );
        obj._chipBg.lineStyle(2, 0x8899cc, 0.8);
        obj._chipBg.strokeRoundedRect(
          -CHIP_W / 2,
          -CHIP_H / 2,
          CHIP_W,
          CHIP_H,
          8,
        );
      }

      if (chips.every((c) => c._placed !== null)) finishQuiz();
    });

    // 15-second countdown
    self._quizTimer = this.time.addEvent({
      delay: 1000,
      repeat: -1,
      callback: () => {
        if (self._quizFinished) return;
        self._quizTimeLeft--;
        if (timerTxt && timerTxt.active) {
          timerTxt.setText(String(self._quizTimeLeft));
          if (self._quizTimeLeft <= 5) timerTxt.setColor("#FF4444");
        }
        if (self._quizTimeLeft <= 0) {
          chips
            .filter((c) => c._placed === null)
            .forEach((c) => {
              c._placed = "TIMEOUT";
            });
          finishQuiz();
        }
      },
    });
  }

  // ══════════════════════════════════════════════════════════════════════
  // CHAT SIMULASI
  get _chatMessages() {
    return [
      { from: "asing", text: "Hai sayang, sekolahnya mana? Ikut om aja deh!" },
      { from: "asing", text: "Foto dong seragamnya. Cantik sekali kayaknya." },
      {
        from: "asing",
        text: "Rahasia kita ya, jangan bilang mama! Ini hadiah buat kamu.",
      },
      {
        from: "choice",
        text: "Rara harus memilih tindakan:",
        choices: [
          {
            label: '"Iya om boleh!"',
            category: "BAHAYA",
            edu: "BAHAYA! Jangan pernah kirim foto ke orang asing!\nSegera blokir dan lapor ke orang tua atau guru!",
          },
          {
            label: '"Maaf, salah kirim."',
            category: "RAGU",
            points: 50,
          },
          {
            label: '"JANGAN GANGGU! Saya teriak ya!" + Voice keras',
            category: "AMAN",
            points: 150,
            onPick: () => GameState.earnAchievement("Berani Bersuara"),
          },
          {
            label: "📸 Screenshot + BLOKIR sekarang!",
            category: "AMAN",
            points: 100,
            onPick: () => {
              GameState.screenshotTaken = true;
              GameState.earnAchievement("Pemblokir Handal");
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

    // Bersihkan chat objects
    this.children.list.filter((c) => c._isChatObj).forEach((c) => c.destroy());

    // Header HP chat
    this._drawHPHeader();

    if (msg.from === "choice") {
      this._showChatChoices(msg);
      return;
    }

    // Bubble pesan masuk
    const bx = 20,
      bw = W * 0.6;
    const bg = this.add.graphics().setScrollFactor(0).setDepth(80);
    bg._isChatObj = true;
    const by = H * 0.25 + this.chatIdx * 15;
    bg.fillStyle(0x1e1e2e, 0.95);
    bg.fillRoundedRect(bx, H * 0.2, bw, 60, 10);

    // Auto-type effect (WA style)
    const txt = this.add
      .text(bx + 12, H * 0.21, "", {
        fontFamily: "Arial",
        fontSize: "14px",
        color: "#EEEEEE",
        wordWrap: { width: bw - 24 },
      })
      .setScrollFactor(0)
      .setDepth(81);
    txt._isChatObj = true;
    const fullText = msg.text;
    let charIdx = 0;
    const typeTimer = this.time.addEvent({
      delay: 30,
      repeat: fullText.length - 1,
      callback: () => {
        txt.setText(fullText.slice(0, ++charIdx));
      },
    });
    txt._typeTimer = typeTimer;

    // Tombol lanjut (juga skip typewriter jika masih berjalan)
    const next = this.add
      .text(W - 20, H - 30, "▶ TAP", CFG.F.SMALL)
      .setOrigin(1, 1)
      .setScrollFactor(0)
      .setDepth(81)
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
      if (typeTimer && typeTimer.getProgress() < 1) {
        // Skip animasi — tampilkan langsung
        typeTimer.remove();
        txt.setText(fullText);
        return;
      }
      this.chatIdx++;
      this._showNextChatMsg();
    });
  }

  _showChatChoices(msg) {
    const W = CFG.WIDTH,
      H = CFG.HEIGHT;
    const panG = this.add.graphics().setScrollFactor(0).setDepth(80);
    panG._isChatObj = true;
    panG.fillStyle(CFG.C.PANEL, 0.96);
    panG.fillRoundedRect(15, H * 0.38, W - 30, 195, 12);
    DrawUtils.sulselBorder(panG, 15, H * 0.38, W - 30, 195, 0.7);

    // Countdown 8 detik — sesuai spec "Chat Simulasi V1 menggunakan timer"
    let _chatCountLeft = 8;
    const chatCountTxt = this.add
      .text(W - 28, H * 0.4, "8", {
        fontFamily: "Arial",
        fontSize: "20px",
        color: "#FFD700",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(82);
    chatCountTxt._isChatObj = true;

    const chatCountTimer = this.time.addEvent({
      delay: 1000,
      repeat: -1,
      callback: () => {
        _chatCountLeft--;
        if (chatCountTxt && chatCountTxt.active) {
          chatCountTxt.setText(String(_chatCountLeft));
          if (_chatCountLeft <= 3) chatCountTxt.setColor("#FF4444");
        }
        if (_chatCountLeft <= 0) {
          chatCountTimer.remove();
          // Timeout → otomatis RAGU (diam = ragu-ragu)
          this.children.list
            .filter((c) => c._isChatObj)
            .forEach((c) => c.destroy());
          // Visual feedback: Rara terlihat takut
          this.charGfx.clear();
          DrawUtils.rara(this.charGfx, W * 0.15, H * 0.55, "scared");
          const fb = this.add
            .text(W / 2, H / 2, "⏰ Waktu habis! Rara diam kebingungan...", {
              fontFamily: "Arial",
              fontSize: "14px",
              color: "#FFAAAA",
              fontStyle: "bold",
              align: "center",
              stroke: "#000",
              strokeThickness: 2,
            })
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(200);
          GameState.addChoice(2, "(Diam — tidak merespons)", "RAGU", 0);
          this.time.delayedCall(1500, () => {
            if (fb.active) fb.destroy();
            this.chatIdx++;
            this._showNextChatMsg();
          });
        }
      },
    });

    const qTxt = this.add
      .text(W / 2, H * 0.4, msg.text, {
        fontFamily: "Arial",
        fontSize: "14px",
        color: "#FFD700",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(81);
    qTxt._isChatObj = true;

    msg.choices.forEach((c, i) => {
      const by = H * 0.45 + i * 48;
      const bg2 = this.add.graphics().setScrollFactor(0).setDepth(80);
      bg2._isChatObj = true;
      const col =
        c.category === "AMAN"
          ? CFG.C.AMAN
          : c.category === "BAHAYA"
            ? CFG.C.BAHAYA
            : CFG.C.RAGU;
      bg2.fillStyle(col, 0.75);
      bg2.fillRoundedRect(20, by, W - 40, 40, 8);

      const lbl = this.add
        .text(W / 2, by + 20, c.label, {
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
        chatCountTimer.remove();
        GameState.addChoice(2, c.label, c.category);
        if (c.onPick) c.onPick();
        // Fix #1: BAHAYA di chat sim TIDAK mengurangi nyawa — hanya feedback edukatif
        this.children.list
          .filter((cc) => cc._isChatObj)
          .forEach((cc) => cc.destroy());

        // Visual feedback: Rara terlihat takut jika pilih BAHAYA/RAGU
        if (c.category === "BAHAYA" || c.category === "RAGU") {
          this.charGfx.clear();
          DrawUtils.rara(this.charGfx, W * 0.15, H * 0.55, "scared");
          this.time.delayedCall(1800, () => {
            this.charGfx.clear();
            DrawUtils.rara(this.charGfx, W * 0.15, H * 0.55, "idle");
          });
        }

        if (c.category === "BAHAYA" && c.edu) {
          // Tampilkan panel edukatif sebelum lanjut
          const eduOv = this.add.graphics().setScrollFactor(0).setDepth(200);
          eduOv.fillStyle(0x330000, 0.93);
          eduOv.fillRoundedRect(15, H / 2 - 80, W - 30, 160, 12);
          eduOv.lineStyle(3, CFG.C.BAHAYA, 0.9);
          eduOv.strokeRoundedRect(15, H / 2 - 80, W - 30, 160, 12);
          const eduTitle = this.add
            .text(W / 2, H / 2 - 65, "⚠ PERHATIAN PENTING!", {
              fontFamily: "Arial",
              fontSize: "15px",
              color: "#FF4444",
              fontStyle: "bold",
            })
            .setOrigin(0.5)
            .setScrollFactor(0)
            .setDepth(201);
          const eduTxt = this.add
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
          const nextBtn = this.add
            .text(W / 2, H / 2 + 55, "[ MENGERTI, LANJUT ]", {
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
          // AMAN / RAGU: floating feedback lalu lanjut
          const fb = this.add
            .text(
              W / 2,
              H / 2,
              c.category === "AMAN"
                ? "✓ Pilihan tepat! +100"
                : "⚠ Bisa lebih baik... +50",
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
  // LAPOR SOPIR
  _startLaporScene() {
    this.children.list.filter((c) => c._isChatObj).forEach((c) => c.destroy());
    this._drawPeteInterior();

    this.charGfx.clear();
    DrawUtils.rara(this.charGfx, CFG.WIDTH * 0.35, CFG.HEIGHT * 0.48, "scared");
    DrawUtils.shadowNpc(
      this.charGfx,
      CFG.WIDTH * 0.65,
      CFG.HEIGHT * 0.44,
      true,
      true,
    );

    this.dlg.show(
      [
        {
          speaker: "Narasi",
          portrait: "rara",
          text: "Di dalam angkot, penumpang mencurigakan terus mendekat ke Rara!",
        },
        {
          speaker: "Rara (dalam hati)",
          portrait: "rara",
          text: "Rara harus minta bantuan kepada sopir angkot!",
        },
        {
          speaker: "— PILIH TINDAKAN —",
          portrait: "sopir",
          text: "Bagaimana Rara meminta bantuan sopir?",
          choices: [
            {
              label: "📢 Teriak LAPOR! + bergerak ke depan",
              category: "AMAN",
              points: CFG.SCORE.LAPOR,
              onPick: () => {
                GameState.earnAchievement("Berani Lapor");
              },
            },
            {
              label: "Bisik-bisik ke penumpang sebelah dulu",
              category: "RAGU",
            },
            {
              label: "Diam dan pura-pura tidak terjadi apa-apa",
              category: "BAHAYA",
            },
          ],
        },
        {
          speaker: "Ibu Sopir",
          portrait: "sopir",
          text: '"Ada apa dek? Ayo naik ke depan sama Ibu. Tenang saja, Ibu ada di sini ki!"\n\nGood job Rara! Berani meminta bantuan adalah hal yang tepat!',
        },
      ],
      () => {
        this.phase = "educard";
        this._showEduCard();
      },
    );
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
        h: "🛡 Tubuhku adalah Milikku",
        b: "Area privat tidak boleh disentuh siapapun tanpa izin.\nDokter boleh memeriksa dengan izin orang tua dan kamu hadir.",
      },
      {
        h: "📱 Aman di Dunia Digital",
        b: "• Jangan bagikan foto dirimu ke orang asing\n• Blokir dan screenshot pesan mencurigakan\n• Ceritakan ke orang tua/guru jika ada pesan tidak nyaman",
      },
      {
        h: "✊ Kekuatan Rara",
        b: '"KATAKAN TIDAK" adalah hakmu yang tidak bisa\ndiambil oleh siapapun!',
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
        "📞 Hotline Perlindungan Anak: 129 | KPAI: 021-31901556",
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

    // Draw karakter jika di luar fase quiz/chat (dengan bobbing)
    if (!["quiz", "chat_sim"].includes(this.phase)) {
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
