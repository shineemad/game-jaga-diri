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
    this.quizIdx = 0;
    this.quizScore = 0;
    // Fix #8: Tutorial modal sekali-pakai sebelum kuis dimulai
    this._showInlineTutorial(
      "\ud83d\udcf1 MISI KUIS!",
      "Jawab 4 pertanyaan tentang keselamatan diri.\nTidak ada batas waktu \u2014 pilih dengan bijak!\n\n\u2713 AMAN = poin penuh\n\u26a0 Salah = cukup baca penjelasannya, tidak ada hukuman nyawa",
      () => this._showQuizQuestion(),
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

  get _quizQuestions() {
    return [
      {
        q: 'Bagian mana saja dari tubuh yang disebut "Area Privat"?',
        choices: [
          { t: "Bagian yang ditutupi pakaian renang", correct: true },
          { t: "Tangan dan kaki", correct: false },
          { t: "Hanya bagian tertentu yang spesial", correct: false },
          { t: "Semua bagian tubuh yang terasa geli", correct: false },
        ],
        edu: "Area privat adalah bagian tubuh yang tertutup pakaian renang.\nTidak ada orang yang boleh menyentuh kecuali dokter dengan izin orang tua!",
      },
      {
        q: "Apa yang harus kamu lakukan jika ada orang dewasa yang menyentuh area privatmu?",
        choices: [
          { t: "KATAKAN TIDAK, PERGI, dan CERITAKAN", correct: true },
          { t: "Diam saja agar tidak menimbulkan masalah", correct: false },
          { t: "Marah-marah sendirian", correct: false },
          { t: "Merahasiakannya karena malu", correct: false },
        ],
        edu: "3 langkah penting: KATAKAN TIDAK dengan keras,\nPERGI dari situasi itu, dan CERITAKAN pada orang dewasa terpercaya!",
      },
      {
        q: 'Jika ada orang yang berkata "ini rahasia kita berdua saja" setelah menyentuhmu, artinya...',
        choices: [
          { t: "Ini adalah tanda bahaya — segera lapor!", correct: true },
          { t: "Mereka hanya bercanda dan bermain", correct: false },
          { t: "Tidak ada yang perlu dikhawatirkan", correct: false },
          { t: "Kamu harus merahasiakannya", correct: false },
        ],
        edu: "RAHASIA BURUK adalah rahasia yang membuatmu takut atau tidak nyaman.\nKamu WAJIB menceritakannya kepada orang tua atau guru!",
      },
      {
        q: "Ada orang yang terus-terusan mengirim pesan di HP memintamu kirim foto. Apa yang kamu lakukan?",
        choices: [
          { t: "Blokir nomor & lapor ke orang tua", correct: true },
          { t: "Balas pesannya dan tanya mengapa", correct: false },
          { t: "Kirim foto tapi yang biasa saja", correct: false },
          { t: "Abaikan dan hapus pesannya saja", correct: false },
        ],
        edu: "Jangan pernah kirim foto kepada orang asing!\nBlokir → Screenshot bukti → Lapor ke orang tua / guru / Hotline 129!",
      },
    ];
  }

  _showQuizQuestion() {
    const W = CFG.WIDTH,
      H = CFG.HEIGHT;
    const q = this._quizQuestions[this.quizIdx];

    // Bersihkan tombol sebelumnya
    this.children.list.filter((c) => c._isQuizObj).forEach((c) => c.destroy());

    // Panel soal
    const panel = this.add.graphics().setScrollFactor(0).setDepth(80);
    panel._isQuizObj = true;
    panel.fillStyle(CFG.C.PANEL, 0.96);
    panel.fillRoundedRect(15, 30, W - 30, 90, 12);
    DrawUtils.sulselBorder(panel, 15, 30, W - 30, 90, 0.8);

    const qnum = this.add
      .text(
        W / 2,
        40,
        `❓ Soal ${this.quizIdx + 1} / ${this._quizQuestions.length}`,
        {
          fontFamily: "Arial",
          fontSize: "13px",
          color: "#FFD700",
          fontStyle: "bold",
        },
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(81);
    qnum._isQuizObj = true;

    const qtxt = this.add
      .text(W / 2, 72, q.q, {
        fontFamily: "Arial",
        fontSize: "14px",
        color: "#FFFFFF",
        wordWrap: { width: W - 50 },
        align: "center",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(81);
    qtxt._isQuizObj = true;

    // Tombol jawaban (2 kolom) — dikocok agar jawaban benar tidak selalu di posisi sama
    const _shuffled = q.choices.slice();
    for (let _s = _shuffled.length - 1; _s > 0; _s--) {
      const _j = Math.floor(Math.random() * (_s + 1));
      [_shuffled[_s], _shuffled[_j]] = [_shuffled[_j], _shuffled[_s]];
    }
    _shuffled.forEach((c, i) => {
      const col = i % 2,
        row = Math.floor(i / 2);
      const bx = 18 + col * (W / 2 - 10);
      const by = 132 + row * 70;
      const bw = W / 2 - 28;

      const bg2 = this.add.graphics().setScrollFactor(0).setDepth(80);
      bg2._isQuizObj = true;
      bg2.fillStyle(0x333366, 0.85);
      bg2.fillRoundedRect(bx, by, bw, 58, 10);
      bg2.lineStyle(2, 0x6688cc, 0.7);
      bg2.strokeRoundedRect(bx, by, bw, 58, 10);

      const lbl = this.add
        .text(bx + bw / 2, by + 29, c.t, {
          fontFamily: "Arial",
          fontSize: "13px",
          color: "#FFFFFF",
          wordWrap: { width: bw - 16 },
          align: "center",
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(81)
        .setInteractive({ useHandCursor: true });
      lbl._isQuizObj = true;

      lbl.on("pointerover", () => {
        bg2.clear();
        bg2.fillStyle(0x4455aa);
        bg2.fillRoundedRect(bx, by, bw, 58, 10);
        lbl.setColor("#FFD700");
      });
      lbl.on("pointerout", () => {
        bg2.clear();
        bg2.fillStyle(0x333366, 0.85);
        bg2.fillRoundedRect(bx, by, bw, 58, 10);
        bg2.lineStyle(2, 0x6688cc, 0.7);
        bg2.strokeRoundedRect(bx, by, bw, 58, 10);
        lbl.setColor("#FFFFFF");
      });
      lbl.on("pointerdown", () => this._onQuizAnswer(c, q.edu));
    });

    // Rara kecil di pojok
    this.charGfx.clear();
    DrawUtils.rara(this.charGfx, 55, H - 55, "idle");
  }

  _onQuizAnswer(choice, edu) {
    this.children.list.filter((c) => c._isQuizObj).forEach((c) => c.destroy());
    const W = CFG.WIDTH,
      H = CFG.HEIGHT;

    if (choice.correct) {
      this.quizScore += CFG.SCORE.AMAN;
      GameState.addChoice(2, choice.t, "AMAN");
      AudioManager.sfxCorrect();
    } else {
      GameState.addChoice(2, choice.t, "BAHAYA");
      AudioManager.sfxWrong();
    }

    // Feedback panel
    const fbG = this.add.graphics().setScrollFactor(0).setDepth(90);
    fbG.fillStyle(choice.correct ? 0x003300 : 0x330000, 0.94);
    fbG.fillRoundedRect(15, H / 2 - 90, W - 30, 180, 12);
    fbG.lineStyle(3, choice.correct ? CFG.C.AMAN : CFG.C.BAHAYA);
    fbG.strokeRoundedRect(15, H / 2 - 90, W - 30, 180, 12);

    const icon = this.add
      .text(W / 2, H / 2 - 70, choice.correct ? "✓ BENAR!" : "✗ Kurang Tepat", {
        fontFamily: "Arial",
        fontSize: "22px",
        color: choice.correct ? "#44FF88" : "#FF4444",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(91);

    const eduTxt = this.add
      .text(W / 2, H / 2 - 20, edu, {
        fontFamily: "Arial",
        fontSize: "13px",
        color: "#FFFFCC",
        wordWrap: { width: W - 60 },
        align: "center",
        lineSpacing: 4,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(91);

    const nextBtn = this.add
      .text(W / 2, H / 2 + 65, "[ LANJUT ]", {
        ...CFG.F.BUTTON,
        color: "#FFD700",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(91)
      .setInteractive({ useHandCursor: true });

    nextBtn.on("pointerdown", () => {
      [fbG, icon, eduTxt, nextBtn].forEach((o) => o.destroy());
      this.quizIdx++;
      if (this.quizIdx < this._quizQuestions.length) {
        this._showQuizQuestion();
      } else {
        this.phase = "chat_sim";
        this._startChatSim();
      }
    });
  }

  // ══════════════════════════════════════════════════════════════════════
  // CHAT SIMULASI
  get _chatMessages() {
    return [
      { from: "asing", text: "Hei dek, namaku Budi. Cantik sekali 😊" },
      { from: "asing", text: "Ayo berteman sama saya. Pasti seru deh!" },
      {
        from: "choice",
        text: "Rara mau membalas apa?",
        choices: [
          { label: "Tidak membalas (abaikan)", category: "AMAN" },
          { label: '"Siapa ini? Saya tidak kenal."', category: "RAGU" },
          {
            label: '"Hei, ya ayo berteman!"',
            category: "BAHAYA",
            edu: "Jangan berteman dengan orang asing di media sosial!\nOrang yang tidak kita kenal bisa berbahaya meski terlihat baik.",
          },
        ],
      },
      {
        from: "asing",
        text: "Eh dek, jangan cerita ke orang tua ya. Ini rahasia kita saja 🤫",
      },
      {
        from: "choice",
        text: "Sekarang Rara harus...",
        choices: [
          { label: "📸 Screenshot + Lapor ke orang tua!", category: "AMAN" },
          { label: "Diam saja, tidak usah dilaporkan.", category: "RAGU" },
          {
            label: '"Oke, rahasia kita saja ya!"',
            category: "BAHAYA",
            edu: "RAHASIA yang membuatmu tidak nyaman BUKAN rahasia yang perlu dijaga!\nSelalu ceritakan pada orang tua atau guru yang kamu percaya.",
          },
        ],
      },
      { from: "asing", text: "Kirim foto kamu dong dek. Saya mau lihat 📸" },
      {
        from: "choice",
        text: "Tindakan Rara?",
        choices: [
          {
            label: "🚫 BLOKIR nomor ini!",
            category: "AMAN",
            onPick: () => GameState.earnAchievement("Pemblokir Handal"),
          },
          { label: 'Balas "Maaf tidak bisa"', category: "RAGU" },
          {
            label: "Kirim foto biasa dulu",
            category: "BAHAYA",
            edu: "JANGAN pernah kirim foto ke orang yang tidak dikenal!\nFoto bisa disalahgunakan. Blokir dan lapor ke orang tua!",
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

    const txt = this.add
      .text(bx + 12, H * 0.21, msg.text, {
        fontFamily: "Arial",
        fontSize: "14px",
        color: "#EEEEEE",
        wordWrap: { width: bw - 24 },
      })
      .setScrollFactor(0)
      .setDepth(81);
    txt._isChatObj = true;

    // Tombol lanjut
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
        GameState.addChoice(2, c.label, c.category);
        if (c.onPick) c.onPick();
        // Fix #1: BAHAYA di chat sim TIDAK mengurangi nyawa — hanya feedback edukatif
        this.children.list
          .filter((cc) => cc._isChatObj)
          .forEach((cc) => cc.destroy());

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
