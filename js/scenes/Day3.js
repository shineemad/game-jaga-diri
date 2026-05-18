// Day3.js — Hari 3: Hujan di Parkiran Sekolah
// Bagian: (1) Chat V2 intens, (2) Cek Plat Ojol, (3) Boss Dialog + Voice Meter, (4) Panic Button
class Day3 extends Phaser.Scene {
  constructor() {
    super({ key: "Day3" });
  }

  // ══════════════════════════════════════════════════════════════════════
  create() {
    GameState.day = 3;
    GameState.checkpoints.d3 = true; // bisa retry dari Day3 tanpa ulang prolog
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
    this._screenshotBtnShown = false;
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
        this.phase = "chat_v2";
        this._startChatV2();
      },
    });
  }

  // ══════════════════════════════════════════════════════════════════════
  // CHAT V2 — Pesan Agresif
  get _chatV2Msgs() {
    return [
      { from: "boss", text: "Hai cantik! Hujan deras ya 😢" },
      { from: "boss", text: "Mau jemput? Gratis kok, kasihan basah!" },
      { from: "boss", text: "Cepat balas dong sayang 🥺 Mana foto kamu?" },
      {
        from: "choice",
        choices: [
          {
            label: "Balas dengan foto",
            category: "BAHAYA",
            edu: "BAHAYA! Jangan kirim foto ke orang yang tidak dikenal!\nFoto bisa disalahgunakan untuk tujuan jahat!",
          },
          {
            label: '"Iya om, jemput sini!"',
            category: "BAHAYA",
            edu: "BAHAYA BESAR! Jangan ikut kendaraan orang asing!\nSelalu minta dijemput orang tua atau yang terpercaya!",
            onPick: () => {
              GameState.lives = 0;
            },
          },
          {
            label: "Blokir nomor ini & Lapor ke orang tua!",
            category: "AMAN",
            points: 200,
            onPick: () => {
              GameState.earnAchievement("Blokir Cepat");
            },
          },
          {
            label: "📸 Screenshot dulu, lalu blokir!",
            category: "AMAN",
            points: 100,
            onPick: () => {
              GameState.screenshotTaken = true;
            },
          },
        ],
      },
      {
        from: "boss",
        text: "Kamu tidak bisa kabur. Ikut saja ke tempat yang aman.",
      },
      {
        from: "boss",
        text: "Ini rahasia kita. Jangan bilang siapa-siapa, nanti kamu yang kena masalah...",
      },
      {
        from: "choice",
        choices: [
          {
            label: "🚫 BLOKIR + CERITAKAN ke guru/orang tua!",
            category: "AMAN",
          },
          { label: '"Saya takut..." (diam)', category: "RAGU" },
          { label: '"Baik, saya ikut..."', category: "BAHAYA" },
        ],
      },
    ];
  }

  _startChatV2() {
    this.chatV2Idx = 0;
    this._showChatV2Msg();
  }

  _showChatV2Msg() {
    const msgs = this._chatV2Msgs;
    if (this.chatV2Idx >= msgs.length) {
      this.phase = "plat_check";
      this._startPlatCheck();
      return;
    }

    const msg = msgs[this.chatV2Idx];
    this.children.list.filter((c) => c._isChatV2).forEach((c) => c.destroy());
    this._drawChatV2Header();

    if (msg.from === "choice") {
      this._showChatV2Choices(msg.choices);
      return;
    }

    const W = CFG.WIDTH,
      H = CFG.HEIGHT;
    const bubble = this.add.graphics().setScrollFactor(0).setDepth(80);
    bubble._isChatV2 = true;
    bubble.fillStyle(0x330000, 0.95);
    bubble.fillRoundedRect(18, H * 0.2, W * 0.7, 65, 10);
    bubble.lineStyle(2, 0xff4444, 0.6);
    bubble.strokeRoundedRect(18, H * 0.2, W * 0.7, 65, 10);

    const txt = this.add
      .text(30, H * 0.21, "", {
        fontFamily: "Arial",
        fontSize: "14px",
        color: "#FFAAAA",
        wordWrap: { width: W * 0.65 },
      })
      .setScrollFactor(0)
      .setDepth(81);
    txt._isChatV2 = true;
    const fullText = msg.text;
    let charIdx = 0;
    const typeTimer = this.time.addEvent({
      delay: 28,
      repeat: fullText.length - 1,
      callback: () => {
        txt.setText(fullText.slice(0, ++charIdx));
      },
    });

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
      if (typeTimer && typeTimer.getProgress() < 1) {
        typeTimer.remove();
        txt.setText(fullText);
        return;
      }
      this.chatV2Idx++;
      this._showChatV2Msg();
    });
  }

  _showChatV2Choices(choices) {
    const W = CFG.WIDTH,
      H = CFG.HEIGHT;
    const panG = this.add.graphics().setScrollFactor(0).setDepth(80);
    panG._isChatV2 = true;
    panG.fillStyle(CFG.C.PANEL, 0.96);
    panG.fillRoundedRect(15, H * 0.28, W - 30, 210, 12);
    DrawUtils.sulselBorder(panG, 15, H * 0.28, W - 30, 210, 0.7);

    this.add
      .text(W / 2, H * 0.3, "Rara harus memilih tindakan yang tepat!", {
        fontFamily: "Arial",
        fontSize: "13px",
        color: "#FF8888",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(81)._isChatV2 = true;

    // Countdown timer — 6 detik untuk memilih
    let _countLeft = 6;
    const timerTxt = this.add
      .text(W - 28, H * 0.3, "6", {
        fontFamily: "Arial",
        fontSize: "20px",
        color: "#FFD700",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(82);
    timerTxt._isChatV2 = true;

    const doPick = (c) => {
      if (this._chatV2CountTimer) {
        this._chatV2CountTimer.remove();
        this._chatV2CountTimer = null;
      }
      GameState.addChoice(3, c.label, c.category, c.points);
      if (c.onPick) c.onPick();
      if (c.category === "BAHAYA") GameState.loseLife();
      if (!GameState.isAlive()) {
        this._goGameOver();
        return;
      }
      this.children.list
        .filter((cc) => cc._isChatV2)
        .forEach((cc) => cc.destroy());
      this.chatV2Idx++;
      this._showChatV2Msg();
    };

    this._chatV2CountTimer = this.time.addEvent({
      delay: 1000,
      repeat: -1,
      callback: () => {
        _countLeft--;
        if (timerTxt && timerTxt.active) {
          timerTxt.setText(String(_countLeft));
          if (_countLeft <= 3) timerTxt.setColor("#FF4444");
        }
        if (_countLeft <= 0) {
          this._chatV2CountTimer.remove();
          this._chatV2CountTimer = null;
          // Auto-pick RAGU (ragu-ragu / tidak bereaksi)
          const fallback =
            choices.find((c) => c.category === "RAGU") ||
            choices[choices.length - 1];
          doPick(fallback);
        }
      },
    });

    choices.forEach((c, i) => {
      const by = H * 0.34 + i * 46;
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

      lbl.on("pointerdown", () => doPick(c));
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
      .text(W / 2, 63, "💀 Si Bayangan Gelap — Nomor Asing", {
        fontFamily: "Arial",
        fontSize: "13px",
        color: "#FFAAAA",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(80);
    lbl._isChatV2 = true;

    // Tombol Screenshot Evidence (spec: "fitur Screenshot untuk bonus poin + Achievement")
    if (!this._screenshotBtnShown) {
      this._screenshotBtnShown = true;
      const snapBg = this.add.graphics().setScrollFactor(0).setDepth(82);
      snapBg._isChatV2 = true;
      snapBg.fillStyle(0x222244, 0.9);
      snapBg.fillRoundedRect(W - 98, 43, 88, 38, 8);
      snapBg.lineStyle(2, 0x4477ff, 0.8);
      snapBg.strokeRoundedRect(W - 98, 43, 88, 38, 8);

      const snapBtn = this.add
        .text(W - 54, 62, "📸 SIMPAN", {
          fontFamily: "Arial",
          fontSize: "11px",
          color: "#88CCFF",
          fontStyle: "bold",
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(83)
        .setInteractive({ useHandCursor: true });
      snapBtn._isChatV2 = true;

      snapBtn.on("pointerover", () => snapBtn.setColor("#FFFFFF"));
      snapBtn.on("pointerout", () => snapBtn.setColor("#88CCFF"));
      snapBtn.once("pointerdown", () => {
        if (GameState.screenshotTaken) return;
        GameState.screenshotTaken = true;
        GameState.earnAchievement("Screenshot Evidence");
        GameState.addScore(50);
        AudioManager.sfxCorrect();
        // Flash putih seperti foto diambil
        const flash = this.add.graphics().setScrollFactor(0).setDepth(300);
        flash.fillStyle(0xffffff, 0.85);
        flash.fillRect(0, 0, W, H);
        this.tweens.add({
          targets: flash,
          alpha: 0,
          duration: 350,
          onComplete: () => flash.destroy(),
        });
        // Badge konfirmasi
        const badge = this.add
          .text(
            W / 2,
            H * 0.44,
            "📸 Screenshot tersimpan! +50\n🏆 Achievement: Screenshot Evidence",
            {
              fontFamily: "Arial",
              fontSize: "13px",
              color: "#88CCFF",
              fontStyle: "bold",
              align: "center",
              stroke: "#000",
              strokeThickness: 2,
            },
          )
          .setOrigin(0.5)
          .setScrollFactor(0)
          .setDepth(301);
        this.tweens.add({
          targets: badge,
          y: badge.y - 30,
          alpha: 0,
          duration: 2000,
          onComplete: () => badge.destroy(),
        });
        snapBg.setAlpha(0.3);
        snapBtn.setText("✓ TERSIMPAN").setColor("#44FF88").disableInteractive();
      });
    }
  }

  // ══════════════════════════════════════════════════════════════════════
  // CEK PLAT OJOL
  _startPlatCheck() {
    if (this._chatV2CountTimer) {
      this._chatV2CountTimer.remove();
      this._chatV2CountTimer = null;
    }
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
        "Pesanan ojol Rara memiliki plat: DD 3472 WK\nMana yang cocok?",
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
          "Selalu cek plat nomor sebelum naik ojol!\nTelepon driver terlebih dahulu untuk konfirmasi.",
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

    this.dlg.show(
      [
        {
          speaker: "Narasi",
          portrait: "rara",
          text: 'Di parkiran sekolah, seseorang tiba-tiba menghalangi jalan Rara.\nIni adalah "Si Bayangan Gelap" — orang berbahaya yang Rara sudah curigai!',
        },
        {
          speaker: "Si Bayangan Gelap",
          portrait: "boss",
          text: '"Hei, kemana mau pergi? Ikut dulu. Ada keperluan penting sama kamu~"',
        },
        {
          speaker: "Rara",
          portrait: "rara",
          text: "Rara merasa sangat takut. Tapi Rara ingat — dia harus BERANI dan BERSUARA KERAS!",
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
      "\ud83d\udc4a HADAPI SI BAYANGAN!",
      "Pilih kata-kata terkuat untuk melawan ancaman.\n\nTahan tombol TERIAK! untuk mengisi gauge suara.\nJika gauge suara penuh = Si Bayangan pergi!\n\nPilihan AMAN lebih efektif menguras mentalnya.",
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
      .text(W / 2, H / 2 + 94, "\u26a1 SIAP MELAWAN!", {
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
        // Fase A
        bossText: '"Hujan nih, mau dianter? Kasihan basah! Naik sini aja~"',
        choices: [
          {
            label: "Tidak mau! Saya tunggu jemputan sendiri!",
            category: "AMAN",
            dmg: 0.2,
          },
          { label: '"Mmm... bentar ya"', category: "RAGU", dmg: 0.1 },
          { label: '"Iya om, makasih..."', category: "BAHAYA", dmg: 0 },
        ],
      },
      {
        // Fase B
        bossText: '"Kamu cantik ya, pacar mana? Mau om temenin?"',
        choices: [
          {
            label: '"JANGAN GANGGU SAYA!" (langkah mundur)',
            category: "AMAN",
            dmg: 0.2,
          },
          {
            label: '"Tidak punya om..."(malu-malu)',
            category: "RAGU",
            dmg: 0.1,
          },
          { label: '"Boleh deh om..."', category: "BAHAYA", dmg: 0 },
        ],
      },
      {
        // Fase C
        bossText:
          '"Rahasia ya kita, jangan bilang orang tua! Mereka pasti marah."',
        choices: [
          {
            label: '"Saya PASTI cerita ke orang tua saya!"',
            category: "AMAN",
            dmg: 0.2,
          },
          { label: '"Emm... oke deh om..."', category: "BAHAYA", dmg: 0 },
          {
            label: '"Saya tidak tahu harus bagaimana..."',
            category: "RAGU",
            dmg: 0.1,
          },
        ],
      },
      {
        // Fase D
        bossText:
          '"Foto dong bentar. Untuk kenang-kenangan aja~ Cantik soalnya!"',
        choices: [
          {
            label: "📸 Screenshot pesan ini + LARI!",
            category: "AMAN",
            dmg: 0.2,
          },
          {
            label: '"Tidak mau om..."(tapi diam ditempat)',
            category: "RAGU",
            dmg: 0.1,
          },
          {
            label: '"Bentar ya om, satu foto aja..."',
            category: "BAHAYA",
            dmg: 0,
          },
        ],
      },
      {
        // Fase E — Final
        bossText:
          '"Cepat dong! Ikut saja sama om. Dijamin aman kok, nggak usah takut!"',
        choices: [
          { label: "(Diam, badan membeku...)", category: "BAHAYA", dmg: 0 },
          {
            label: '"Mmm... makasih om tapi nggak usah..."',
            category: "RAGU",
            dmg: 0.1,
          },
          {
            label: '"JANGAN DEKATI SAYA! TOLONG!!! TOLONG!!!"',
            category: "AMAN",
            dmg: 0.3,
            points: 300,
          },
          {
            label: "🆘 PANIC BUTTON — Teriak + Lari!",
            category: "AMAN",
            dmg: 0.4,
            isPanic: true,
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
        `Ronde ${this.bossDialog + 1} / ${this._bossRounds.length}`,
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
        GameState.addChoice(3, c.label, c.category, c.points);
        if (c.category === "BAHAYA") GameState.loseLife();
        if (!GameState.isAlive()) {
          this._goGameOver();
          return;
        }
        this.bossMental = Math.max(0, this.bossMental - (c.dmg || 0));
        // Feature #12: SFX + camera shake berdasarkan pilihan
        if (c.category === "AMAN") {
          AudioManager.sfxBossHit();
          AudioManager.sfxBossGroan();
          this.cameras.main.shake(180, 0.007);
        } else if (c.category === "RAGU") {
          AudioManager.sfxNeutral();
        } else {
          AudioManager.sfxWrong();
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
    GameState.earnAchievement("Pahlawan Diri Sendiri");

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
      .text(W / 2, H / 2 + 75, "TEKAN TOMBOL PANIK!", {
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

    // Boss kabur
    DrawUtils.shadowNpc(this.charGfx, W * 0.65, H * 0.45, true);

    this.tweens.add({
      targets: helperGfx,
      x: W * 0.3,
      duration: 1200,
      ease: "Power2",
    });

    this.dlg.show(
      [
        {
          speaker: "Pak Guru",
          portrait: "polisi",
          text: '"Hei! Ada apa di sini?! Kami dengar kamu teriak!"\n\nSi Bayangan Gelap lari terbirit-birit melihat guru dan polisi datang!',
        },
        {
          speaker: "Rara",
          portrait: "rara",
          text: '"Pak Guru, tadi ada orang yang mengancam saya! Namanya Si Petta!"\n\nRara memberanikan diri untuk bercerita. Ini keputusan terbaik!',
        },
        {
          speaker: "Pak Guru",
          portrait: "polisi",
          text: '"Tenang Rara, kamu sudah sangat berani! Kamu tidak salah.\nKami akan bantu lapor ke pihak berwajib. Makasih sudah bilang ki!"',
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
        b: "Grooming adalah manipulasi oleh orang dewasa untuk mendekati\nanak secara tidak sehat — online maupun offline.",
      },
      {
        h: "🦁 Kamu Bisa Melawan!",
        b: "• Berteriak KERAS jika terancam\n• Tekan Panic Button / minta bantuan orang terdekat\n• Ceritakan kepada orang tua, guru, atau polisi SEGERA",
      },
      {
        h: "📣 INGAT SELALU:",
        b: "Kamu TIDAK PERNAH bersalah jika menjadi korban.\nBerani bercerita adalah tindakan PALING BERANI!",
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

    // Voice accumulate saat boss fight — isi penuh = damage ke boss
    if (this.phase === "boss_dialog" && voiceMeter.isShout()) {
      this.voiceAccum += delta;
      if (this.voiceAccum >= this.voiceTarget) {
        this.voiceAccum = 0;
        this.bossMental = Math.max(0, this.bossMental - 0.2);
        AudioManager.sfxBossHit();
        AudioManager.sfxBossGroan();
        this.cameras.main.shake(220, 0.009);
        // Feedback teks
        const fb = this.add
          .text(CFG.WIDTH / 2, CFG.HEIGHT * 0.47, "🔊 SUARA KUAT! -20%", {
            fontFamily: "Arial",
            fontSize: "16px",
            color: "#FFD700",
            fontStyle: "bold",
            stroke: "#000",
            strokeThickness: 3,
          })
          .setOrigin(0.5)
          .setScrollFactor(0)
          .setDepth(200);
        this.tweens.add({
          targets: fb,
          y: fb.y - 45,
          alpha: 0,
          duration: 1200,
          onComplete: () => fb.destroy(),
        });
        if (this.bossMental <= 0) this._bossDies();
      }
    }
  }
}
