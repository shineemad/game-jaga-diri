// Day1.js — Hari 1: Jalan Kaki ke Sekolah (Side-scrolling + Encounter System)
// Setting: Jalan menuju sekolah → Gang Sepi → SMP Harapan
class Day1 extends Phaser.Scene {
  constructor() {
    super({ key: "Day1" });
  }

  // ══════════════════════════════════════════════════════════════════════
  create() {
    // Fix #6: BGM Hari 1 — melodi pagi bersemangat
    AudioManager.startBGM(90, "day1");
    const W = CFG.WIDTH,
      H = CFG.HEIGHT;
    const WW = CFG.WORLD_DAY1; // 3200

    // ── Physics world ──────────────────────────────────────────────
    this.physics.world.setBounds(0, 0, WW, H);
    this.cameras.main.setBounds(0, 0, WW, H);

    // ── State machine ──────────────────────────────────────────────
    // Phases: intro | tutorial | walking | encounter1 | path_choice |
    //         walking2 | encounter2 | walking3 | encounter3 | educard | complete
    this.phase = "intro";
    this.dialogActive = false;
    this.encounterDone = { e1: false, path: false, e2: false, e3: false };
    this.voiceHeld = 0;
    this.npcApproach = 0; // accumulate approach timer
    this.shoutCooldown = 0;
    this.tutComplete = false;
    this.pathChosen = false;
    this._paused = false;

    // ── Background (world space, static) ──────────────────────────
    this.bgGfx = this.add.graphics().setDepth(0);
    this._drawWorld();

    // ── Path-specific overlay (filled after choice) ────────────────
    this.pathBgGfx = this.add.graphics().setDepth(1);
    // ── Rara physics body ──────────────────────────────────────────
    this.raraX = 80;
    this.raraY = 307;
    this.raraBody = this.physics.add
      .image(80, 320, "__px")
      .setDisplaySize(24, 64)
      .setVisible(false)
      .setCollideWorldBounds(true);
    this.cameras.main.startFollow(this.raraBody, true, 0.08, 0.08);

    // ── NPC state objects ──────────────────────────────────────────
    this.npcs = this._createNPCState();

    // ── Dynamic character graphics ─────────────────────────────────
    this.charGfx = this.add.graphics().setDepth(10);

    // ── HUD (scroll-fixed) ─────────────────────────────────────────
    this._buildHUD();

    // ── Input ──────────────────────────────────────────────────────
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE,
    );

    // ── Dialog manager ─────────────────────────────────────────────
    this.dlg = new DialogManager(this);

    // ── Microphone ────────────────────────────────────────────────
    voiceMeter.start().then((ok) => {
      if (!ok) this._buildTeraikBtn();
    });

    // ── Start ─────────────────────────────────────────────────────
    this._showIntro();
  }

  // ══════════════════════════════════════════════════════════════════════
  // WORLD BUILDING
  _drawWorld() {
    const g = this.bgGfx;
    const H = CFG.HEIGHT;
    const WW = CFG.WORLD_DAY1;

    // Sky
    g.fillStyle(0x87ceeb);
    g.fillRect(0, 0, WW, 220);

    // Clouds
    g.fillStyle(0xffffff, 0.8);
    [
      [150, 40, 80, 28],
      [400, 55, 100, 32],
      [720, 30, 70, 24],
      [1100, 50, 90, 30],
      [1500, 35, 75, 26],
      [2000, 45, 85, 28],
      [2400, 38, 65, 22],
      [2800, 55, 90, 30],
    ].forEach(([cx, cy, cw, ch]) => {
      g.fillEllipse(cx, cy, cw, ch);
      g.fillEllipse(cx - cw * 0.32, cy + 5, cw * 0.6, ch * 0.75);
      g.fillEllipse(cx + cw * 0.32, cy + 5, cw * 0.6, ch * 0.75);
    });

    // Pegunungan di kejauhan
    g.fillStyle(0x6b8e6b, 0.55);
    [0, 600, 1200, 1800, 2400, 3000].forEach((ox) => {
      g.fillTriangle(ox, 220, ox + 350, 100, ox + 600, 220);
    });

    // Tanah & trotoar
    g.fillStyle(0x8b6914);
    g.fillRect(0, 220, WW, 90); // tanah
    g.fillStyle(0x9e9e9e);
    g.fillRect(0, 295, WW, 45); // trotoar
    g.fillStyle(0x555555);
    g.fillRect(0, 340, WW, 80); // jalan
    // Garis jalan
    g.fillStyle(0xffffff, 0.6);
    for (let x = 0; x < WW; x += 120) g.fillRect(x + 20, 370, 80, 6);

    // Bangunan & landmark di jalan
    this._drawBuildings(g);

    // Pohon
    [
      180, 380, 560, 740, 970, 1170, 1380, 1590, 1780, 2050, 2250, 2480, 2680,
      2900, 3080,
    ].forEach((tx) => {
      g.fillStyle(0x8b4513);
      g.fillRect(tx, 258, 7, 38);
      g.fillStyle(0x228b22);
      g.fillCircle(tx + 3, 246, 20);
      g.fillStyle(0x2ecc71);
      g.fillCircle(tx + 3, 239, 14);
    });

    // Pembatas gang di x=1050
    g.fillStyle(0x333333);
    g.fillRect(1045, 250, 6, 95); // gerbang gang kiri
    g.fillRect(1220, 250, 6, 95); // gerbang gang kanan
    g.fillStyle(0xff4444, 0.6);
    g.fillTriangle(1048, 248, 1043, 238, 1053, 238); // segitiga merah

    // Tanda sekolah di akhir
    g.fillStyle(0x3366cc);
    g.fillRect(2750, 180, 200, 120);
    g.fillStyle(0xffffff);
    g.fillRect(2760, 190, 180, 25); // spanduk
    // Teks pada spanduk (pakai this.add.text — Graphics tidak punya fillText)
    this.add.text(2765, 191, "SMP HARAPAN", {
      fontFamily: "Arial",
      fontSize: "12px",
      color: "#3366CC",
      fontStyle: "bold",
    });

    // Plang lokasi
    this._drawSignboard(g, 40, 265, "Jalan Sekolah");
    this._drawSignboard(g, 1040, 243, "Gang Sepi ⚠");
    this._drawSignboard(g, 2740, 265, "SMP Harapan");
  }

  _drawBuildings(g) {
    const defs = [
      { x: 30, w: 110, h: 80, c: 0xe8d5a3, type: "rumah", lbl: "Rumah Rara" },
      {
        x: 250,
        w: 90,
        h: 70,
        c: 0xffe4b5,
        type: "warung",
        lbl: "Warung Makan",
      },
      { x: 460, w: 100, h: 85, c: 0xd5c4a0, type: "rumah", lbl: "" },
      { x: 680, w: 80, h: 65, c: 0xe8e8c8, type: "toko", lbl: "Toko" },
      {
        x: 850,
        w: 140,
        h: 55,
        c: 0x6699cc,
        type: "halte",
        lbl: "Halte Angkot",
      },
      { x: 1260, w: 95, h: 90, c: 0xe8d5a3, type: "rumah", lbl: "" },
      { x: 1450, w: 100, h: 95, c: 0xd4a574, type: "masjid", lbl: "Masjid" },
      { x: 1680, w: 85, h: 60, c: 0xc8d8a0, type: "toko", lbl: "" },
      { x: 1880, w: 70, h: 55, c: 0xffe4b5, type: "warung", lbl: "Pisang Epe" },
      { x: 2150, w: 120, h: 60, c: 0xeeeecc, type: "toko", lbl: "Minimarket" },
      { x: 2400, w: 90, h: 85, c: 0xd5c4a0, type: "rumah", lbl: "" },
      { x: 2650, w: 180, h: 75, c: 0xccddcc, type: "sekolah", lbl: "" },
    ];
    const H = CFG.HEIGHT;
    defs.forEach((b) => {
      const y = 295 - b.h;
      g.fillStyle(b.c);
      g.fillRect(b.x, y, b.w, b.h);
      if (b.type === "rumah" || b.type === "warung") {
        g.fillStyle(0x8b4513);
        g.fillTriangle(b.x - 5, y, b.x + b.w + 5, y, b.x + b.w / 2, y - 30);
      } else if (b.type === "halte") {
        g.fillStyle(0x4169e1);
        g.fillRect(b.x - 10, y - 12, b.w + 20, 13);
        g.fillRect(b.x, y, 4, H - y);
        g.fillRect(b.x + b.w - 4, y, 4, H - y);
      } else if (b.type === "masjid") {
        g.fillStyle(0x2ecc71);
        g.fillCircle(b.x + b.w / 2, y, 24);
        g.fillStyle(0x228b22);
        g.fillRect(b.x + b.w - 14, y - 50, 11, 50);
        g.fillTriangle(
          b.x + b.w - 14,
          y - 50,
          b.x + b.w - 3,
          y - 50,
          b.x + b.w - 8,
          y - 68,
        );
      } else if (b.type === "sekolah") {
        g.fillStyle(0x3366cc);
        g.fillRect(b.x, y - 8, b.w, 10);
      }
      // Jendela
      if (b.w > 70) {
        g.fillStyle(0xadd8e6);
        g.fillRect(b.x + 10, y + 10, 22, 20);
        if (b.w > 100) g.fillRect(b.x + b.w - 32, y + 10, 22, 20);
      }
      // Pintu
      g.fillStyle(0x5c3317);
      g.fillRect(b.x + b.w / 2 - 9, y + b.h - 28, 18, 28);
    });
  }

  _drawSignboard(g, x, y, label) {
    g.fillStyle(0xffd700);
    g.fillRect(x, y, 8, 30);
    g.fillStyle(0x8b0000, 0.9);
    g.fillRoundedRect(x - 40, y - 16, 100, 20, 4);
    g.fillStyle(0xffffff, 0.9);
    // Label via text (added as game object)
    this.add.text(x + 9, y - 8, label, {
      fontFamily: "Arial",
      fontSize: "10px",
      color: "#FFFFFF",
      fontStyle: "bold",
    });
  }

  // ══════════════════════════════════════════════════════════════════════
  // NPC STATE
  _createNPCState() {
    return {
      stranger1: {
        x: 950,
        y: 307,
        active: true,
        angry: false,
        approachTimer: 0,
        approached: false,
        type: "pamanBaik",
        label: "Paman Baik",
      },
      giftMan: {
        x: 1550,
        y: 307,
        active: true,
        angry: false,
        noApproach: true, // dialog-only encounter, bukan approach-based
        approachTimer: 0,
        approached: false,
        type: "motorNpc",
        label: "Motor Nyasar",
      },
      runner: {
        x: 2100,
        y: 307,
        active: false, // diaktifkan hanya saat jalur berbahaya dipilih
        angry: true,
        noApproach: true, // dialog encounter, bukan approach-based
        approachTimer: 0,
        approached: false,
        type: "gangGroup",
        label: "Gang Penghadang",
      },
    };
  }

  // ══════════════════════════════════════════════════════════════════════
  // HUD
  _buildHUD() {
    const W = CFG.WIDTH;
    this.hudGfx = this.add.graphics().setScrollFactor(0).setDepth(50);

    this.hudLives = this.add.graphics().setScrollFactor(0).setDepth(51);
    this.hudScore = this.add
      .text(10, 10, "Skor: 0", CFG.F.HUD)
      .setScrollFactor(0)
      .setDepth(51);
    this.hudVoiceLbl = this.add
      .text(W - 140, 10, "🔊", CFG.F.SMALL)
      .setScrollFactor(0)
      .setDepth(51);
    this.hudVoiceGfx = this.add.graphics().setScrollFactor(0).setDepth(51);

    // Feature #8: Progress indicator Hari 1→2→3
    {
      const pxA = [W / 2 - 82, W / 2, W / 2 + 82],
        pcy = 17,
        pr = 8,
        pDay = 1;
      const pg = this.add.graphics().setScrollFactor(0).setDepth(51);
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
          .setDepth(52);
        this.add
          .text(cx, pcy + 12, lbl, {
            fontFamily: "Arial",
            fontSize: "8px",
            color: done ? "#44FF88" : curr ? "#FFD700" : "#444444",
          })
          .setOrigin(0.5)
          .setScrollFactor(0)
          .setDepth(52);
      });
    }
    // Phase label
    this.phaseLbl = this.add
      .text(W / 2, CFG.HEIGHT - 18, "", {
        ...CFG.F.SMALL,
        color: "#FFD700",
      })
      .setScrollFactor(0)
      .setDepth(51)
      .setOrigin(0.5, 1);

    // Tombol pause (pojok kiri bawah)
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
    const btnG = this.add.graphics().setScrollFactor(0).setDepth(60);
    btnG.fillStyle(CFG.C.BAHAYA, 0.9);
    btnG.fillRoundedRect(W - 110, H - 60, 100, 44, 10);
    btnG.lineStyle(2, CFG.C.GOLD);
    btnG.strokeRoundedRect(W - 110, H - 60, 100, 44, 10);

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

    this.teraikBtn.on("pointerdown", () => {
      voiceMeter.simulateShout(900);
      this.tweens.add({
        targets: this.teraikBtn,
        scaleX: 0.88,
        scaleY: 0.88,
        duration: 80,
        yoyo: true,
      });
    });
  }

  _updateHUD() {
    this.hudGfx.clear();
    // Lives bar background
    this.hudGfx.fillStyle(0x000000, 0.5);
    this.hudGfx.fillRoundedRect(5, 5, 160, 30, 6);
    DrawUtils.hearts(
      this.hudLives.clear(),
      14,
      20,
      GameState.lives,
      GameState.maxLives,
    );

    // Score
    this.hudScore.setText(`Skor: ${GameState.score}`);

    // Indikator jalur berbahaya — strip merah di tepi layar
    if (
      GameState.pathChoice === "dangerous" &&
      ["walking2", "walking3", "encounter2", "encounter3"].includes(this.phase)
    ) {
      const pulse = 0.15 + 0.08 * Math.sin(this.time.now / 400);
      this.hudGfx.fillStyle(0xff0000, pulse);
      this.hudGfx.fillRect(0, 0, 6, CFG.HEIGHT);
      this.hudGfx.fillRect(CFG.WIDTH - 6, 0, 6, CFG.HEIGHT);
      this.hudGfx.fillRect(0, 0, CFG.WIDTH, 4);
      this.hudGfx.fillRect(0, CFG.HEIGHT - 4, CFG.WIDTH, 4);
    }

    // Voice meter
    this.hudVoiceGfx.clear();
    DrawUtils.voiceMeterBar(
      this.hudVoiceGfx,
      CFG.WIDTH - 135,
      10,
      120,
      16,
      voiceMeter.get(),
    );

    // Phase hint — berbeda berdasarkan jalur yang dipilih
    const isDangerRoute = GameState.pathChoice === "dangerous";
    const hints = {
      tutorial: "⟰⟱ Gerak | TERIAK buat hancurin rintangan!",
      walking: "➟ Jalan terus! 📢 TERIAK kalau ada yang mencurigakan",
      walking2: isDangerRoute
        ? "🌑 GANG SEPI — BAHAYA BANGET! Teriak sekeras mungkin!"
        : "🏙 JALAN RAMAI — tetap waspada ya!",
      walking3: isDangerRoute
        ? "⚠ Udah mau sampai... jangan berhenti bersuara!"
        : "✅ Jalur aman — sebentar lagi sampai sekolah!",
      encounter1: "⚠ Ada orang asing mendekat! Pilih respons Rara!",
      path_choice: "Pilih jalur ke sekolah!",
      encounter2: isDangerRoute
        ? "🚨 Ada pengendara mencurigakan! TERIAK atau LARI!"
        : "⚠ Ada orang yang nawarin tumpangan!",
      encounter3: "🏃 LARI atau TERIAK KERAS!",
      educard: "Baca kartu edukasi dulu!",
    };
    this.phaseLbl.setText(hints[this.phase] || "");
  }

  // ══════════════════════════════════════════════════════════════════════
  // PHASE INTRO
  _showIntro() {
    const W = CFG.WIDTH,
      H = CFG.HEIGHT;
    const overlay = this.add.graphics().setScrollFactor(0).setDepth(100);
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, W, H);

    const title = this.add
      .text(W / 2, H / 2 - 30, "HARI 1: Jalan Kaki ke Sekolah", {
        ...CFG.F.TITLE,
        fontSize: "24px",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(101);

    const sub = this.add
      .text(W / 2, H / 2 + 15, "📍 " + CFG.LOKASI.D1, {
        ...CFG.F.SUBTITLE,
        color: "#CCFFCC",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(101);

    this.tweens.add({
      targets: [overlay, title, sub],
      alpha: 0,
      duration: 800,
      delay: 2200,
      onComplete: () => {
        overlay.destroy();
        title.destroy();
        sub.destroy();
        // Dialog konteks sebelum tutorial
        this.dlg.show(
          [
            {
              speaker: "Narasi",
              portrait: "rara",
              text: "Pagi ini Rara harus jalan kaki ke sekolah sendirian.\nIbu dan Ayah udah berangkat kerja tadi.",
            },
            {
              speaker: "Rara",
              portrait: "rara",
              text: '"Oke, bismillah! SMP Harapan nggak jauh kok. 😤\nAku pasti bisa jalan sendiri!"',
            },
            {
              speaker: "Narasi",
              portrait: "rara",
              text: "Sebelum jalan, latih dulu suaramu! 📢\nTeriak KERAS = kamu lebih aman di jalan!",
            },
          ],
          () => {
            this.phase = "tutorial";
            this._startTutorial();
          },
        );
      },
    });
  }

  // ── TUTORIAL MIC ───────────────────────────────────────────────────
  _startTutorial() {
    this.phaseLbl.setText("📢 TERIAK buat hancurin rintangan di depan!");

    // Rintangan (barrier) di x=350
    const bG = this.add.graphics().setDepth(5);
    bG.fillStyle(0x8b0000, 0.9);
    bG.fillRect(340, 260, 18, 80);
    bG.fillRect(370, 260, 18, 80);
    bG.fillStyle(0xffd700);
    bG.fillRect(338, 255, 54, 8);
    this.add
      .text(330, 237, "RINTANGAN", {
        fontFamily: "Arial",
        fontSize: "10px",
        color: "#FFD700",
        fontStyle: "bold",
      })
      .setDepth(5);

    const lbl = this.add
      .text(355, 230, "TERIAK!", {
        fontFamily: "Arial",
        fontSize: "14px",
        color: "#FF4444",
        fontStyle: "bold",
      })
      .setDepth(5);
    this.tweens.add({
      targets: lbl,
      y: 220,
      duration: 500,
      yoyo: true,
      repeat: -1,
    });

    this._tutBarrier = bG;
    this._tutLbl = lbl;
    this._tutX = 358; // barrier center X

    if (!this.teraikBtn) this._buildTeraikBtn();
  }

  _checkTutorial() {
    if (this.tutComplete) return;
    const dist = Math.abs(this.raraBody.x - this._tutX);
    if (dist < 120 && voiceMeter.isShout()) {
      // Hancurkan rintangan
      this._tutBarrier.destroy();
      this._tutLbl.destroy();
      this.tutComplete = true;

      const boom = this.add
        .text(this._tutX, 250, "💥 KEREN! Rintangan hancur!", {
          fontFamily: "Arial",
          fontSize: "18px",
          color: "#FFD700",
          fontStyle: "bold",
        })
        .setDepth(10);
      this.tweens.add({
        targets: boom,
        y: 200,
        alpha: 0,
        duration: 900,
        onComplete: () => {
          boom.destroy();
          this.phase = "walking";
        },
      });
    }
    // Rara berhenti di depan barrier jika belum teriak
    if (!this.tutComplete && this.raraBody.x > 320) {
      this.raraBody.x = 320;
    }
  }

  // ══════════════════════════════════════════════════════════════════════
  // NPC ENCOUNTER TRIGGERS
  _checkEncounters(delta) {
    const rx = this.raraBody.x;

    // ── ENCOUNTER 1: PAMAN BAIK (tawaran permen) ─────────────────
    if (!this.encounterDone.e1 && rx > 820 && this.phase === "walking") {
      this.encounterDone.e1 = true;
      this.phase = "encounter1";
      this.raraBody.setVelocityX(0);
      this.dlg.show(this._dialogs.stranger1(), () => {
        // Kembali berjalan — path_choice dipicu saat mencapai x=1100
        this.phase = "walking";
      });
    }

    // ── PATH CHOICE: Persimpangan Gang Sepi di x=1100 ─────────────
    if (!this.encounterDone.path && rx > 1100 && this.phase === "walking") {
      this.encounterDone.path = true;
      this.phase = "path_choice";
      this.raraBody.setVelocityX(0);
      this._showPathChoice();
    }

    // ── ENCOUNTER 2: MOTOR NYASAR (tawaran tumpangan) ─────────────
    // Gang sepi: dialog lebih awal (NPC sudah menghadang di gang)
    // Jalan ramai: dialog di posisi normal setelah persimpangan
    const e2Trigger = GameState.pathChoice === "dangerous" ? 1280 : 1480;
    if (!this.encounterDone.e2 && rx > e2Trigger && this.phase === "walking2") {
      this.encounterDone.e2 = true;
      this.phase = "encounter2";
      this.raraBody.setVelocityX(0);
      // Dialog berbeda berdasarkan jalur: gang sepi lebih mengancam
      const e2Dialog =
        GameState.pathChoice === "dangerous"
          ? this._dialogs.giftManDanger()
          : this._dialogs.giftMan();
      this._gangAbducted = false; // reset flag penculikan
      this.dlg.show(e2Dialog, () => {
        // NPC Motor Nyasar pergi setelah encounter
        this.npcs.giftMan.active = false;
        if (this._gangAbducted) {
          // Pilihan BAHAYA di gang sepi = game over (penculikan)
          this._triggerGameOver();
          return;
        }
        this.phase = "walking3";
      });
    }

    // ── ENCOUNTER 3: GANG BLOCKER / REWARD SEKOLAH ───────────────────
    // Gang sepi: blocker muncul di x=2050 (di dalam gang)
    // Jalan ramai: reward muncul di x=2700 (sampai di depan sekolah)
    const e3Trigger = GameState.pathChoice === "dangerous" ? 2050 : 2700;
    if (!this.encounterDone.e3 && rx > e3Trigger && this.phase === "walking3") {
      this.encounterDone.e3 = true;
      if (GameState.pathChoice === "dangerous") {
        // Jalur berbahaya: Rara ketemu blocker
        this.phase = "encounter3";
        this.raraBody.setVelocityX(0);
        this._blockAbducted = false; // reset flag
        this.dlg.show(this._dialogs.blocker(), () => {
          if (this._blockAbducted) {
            this._triggerGameOver();
            return;
          }
          this.phase = "educard";
          this._showEduCard();
        });
      } else {
        // Jalur aman: langsung ke educard, tampilkan pujian
        this.phase = "educard";
        this.raraBody.setVelocityX(0);
        this._showSafeRouteReward();
      }
    }

    // ── NPC APPROACH: kurangi nyawa jika diam terlalu lama ─────────
    if (["walking", "walking2", "walking3"].includes(this.phase)) {
      this._updateNPCApproach(delta);
    }
  }

  _updateNPCApproach(delta) {
    const rx = this.raraBody.x;
    const G = this.charGfx;

    Object.entries(this.npcs).forEach(([key, npc]) => {
      if (!npc.active || npc.approached) return;
      const dist = npc.x - rx;
      if (npc.noApproach) return; // dialog-only NPC, skip approach
      if (dist < 200 && dist > 0) {
        // NPC mendekat — gang sepi: lebih cepat & agresif
        const pathMult = GameState.pathChoice === "dangerous" ? 1.6 : 0.8;
        npc.x -= ((npc.angry ? 60 : 35) * pathMult * delta) / 1000;
        npc.approachTimer += delta;

        if (voiceMeter.isShout()) {
          // Teriak = NPC lari
          npc.x += 180;
          npc.approachTimer = 0;
          npc.approached = true;
          const fxt = this.add
            .text(npc.x, 270, "😨 LARI!", {
              fontFamily: "Arial",
              fontSize: "16px",
              color: "#FF8888",
            })
            .setDepth(12);
          this.tweens.add({
            targets: fxt,
            y: 240,
            alpha: 0,
            duration: 800,
            onComplete: () => fxt.destroy(),
          });
        } else if (dist < 40) {
          // Terlalu dekat → kurangi nyawa, NPC pergi
          npc.approached = true;
          GameState.loseLife();
          const warn = this.add
            .text(
              CFG.WIDTH / 2,
              CFG.HEIGHT / 2 - 40,
              "💔 Nyawa berkurang!\nKalau ada orang asing mendekat, TERIAK keras-keras!",
              {
                fontFamily: "Arial",
                fontSize: "16px",
                color: "#FF4444",
                fontStyle: "bold",
                align: "center",
                stroke: "#000",
                strokeThickness: 3,
              },
            )
            .setScrollFactor(0)
            .setDepth(200)
            .setOrigin(0.5);
          this.tweens.add({
            targets: warn,
            y: warn.y - 30,
            alpha: 0,
            duration: 2000,
            onComplete: () => warn.destroy(),
          });
          if (!GameState.isAlive()) this._triggerGameOver();
        }
      }
    });
  }

  // ══════════════════════════════════════════════════════════════════════
  // DIALOG SCRIPTS
  get _dialogs() {
    return {
      // GDD Encounter 1: PAMAN BAIK — "Mau permen? Ikut om ke warung bentar ya!"
      stranger1: () => [
        {
          speaker: "Paman Baik",
          portrait: "shadow",
          text: '"Eh dek, mau permen? Enak lho~\nIkut om ke warung bentar ya, dekat kok!"',
        },
        {
          speaker: "Rara",
          portrait: "rara",
          text: "*Rara kaget! Ini orang asing, nggak pernah lihat sebelumnya!*\nOrang ini nawarin permen dan mau ngajak Rara pergi... Hati-hati! ⚠",
        },
        {
          speaker: "— PILIH RESPONS —",
          portrait: "rara",
          text: "Gimana Rara harus merespons?",
          choices: [
            {
              label: '"Nggak mau! Aku nggak kenal Bapak!" (lari ke tempat rame)',
              category: "AMAN",
              onPick: () => {
                GameState.score += 100;
              },
            },
            {
              label: '"Makasih, tapi aku udah mau telat sekolah nih!"',
              category: "RAGU",
              onPick: () => {
                GameState.score += 50;
              },
            },
            {
              label: '"Boleh dong, om punya permen apa aja?"',
              category: "BAHAYA",
              onPick: () => {},
            },
          ],
        },
        {
          speaker: "Narasi",
          portrait: "rara",
          text: "🚩 ORANG ASING KASIH HADIAH = TANDA BAHAYA!\nJangan pernah ikut atau terima apapun dari orang yang nggak kamu kenal!",
        },
      ],
      // GDD Encounter 2: MOTOR NYASAR — "Mbak, sekolahnya yang mana ya?"
      giftMan: () => [
        {
          speaker: "Pria Motor",
          portrait: "shadow",
          text: '"Mbak, maaf ya — SMP Harapan yang mana?\nKebetulan aku searah nih, naik aja gratis!~"',
        },
        {
          speaker: "Rara",
          portrait: "rara",
          text: "Ada pria di motor tanya arah, terus langsung nawarin tumpangan. Hati-hati banget! 🚨",
        },
        {
          speaker: "— PILIH RESPONS —",
          portrait: "rara",
          text: "Apa yang Rara lakuin?",
          choices: [
            {
              label: '"Nggak mau naik! Makasih, aku jalan sendiri aja!"',
              category: "AMAN",
              onPick: () => {
                GameState.score += 100;
              },
            },
            {
              label: '"Nggak, makasih. Sebentar lagi juga sampai kok."',
              category: "RAGU",
              onPick: () => {
                GameState.score += 50;
              },
            },
            {
              label: '"Wah, searah? Oke deh, makasih ya!"',
              category: "BAHAYA",
              onPick: () => {},
            },
          ],
        },
        {
          speaker: "Narasi",
          portrait: "rara",
          text: "⚠ Jangan PERNAH naik kendaraan orang yang nggak kamu kenal!\nTolak dengan tegas dan pergi ke tempat rame.",
        },
      ],
      // Encounter 2 VERSI GANG — motor nyasar lebih agresif & mengancam
      giftManDanger: () => [
        {
          speaker: "Pria Motor",
          portrait: "shadow_angry",
          text: '"HEI! Kamu sendirian di sini?! Naik sini dong,\naku antar ke mana aja kamu mau!"',
        },
        {
          speaker: "Rara (dalam hati)",
          portrait: "rara",
          text: "Di gang sepi ini Rara ngerasa nggak aman banget. 😨\nPria ini terasa sangat mengancam! Harus bertindak CEPAT!",
        },
        {
          speaker: "Pria Motor",
          portrait: "shadow_angry",
          text: '"Diem aja? Sini lah, aku nggak gigit kok.\nGang ini bahaya banget buat anak sendirian!"',
        },
        {
          speaker: "— PILIH TINDAKAN CEPAT! —",
          portrait: "rara",
          text: "Rara HARUS bertindak sekarang juga! Apa yang dilakukan?",
          choices: [
            {
              label: "📢 TERIAK SEKERAS-KERASNYA & LARI ke jalan rame!",
              category: "AMAN",
              onPick: () => {
                GameState.score += 100;
              },
            },
            {
              label: '"E-eh... nggak mau deh Pak. Aku sendiri aja..."',
              category: "RAGU",
              onPick: () => {
                GameState.score += 50;
              },
            },
            {
              label: '"I-iya deh... makasih ya Pak."',
              category: "BAHAYA",
              // Game Over: Rara naik dengan orang asing di gang sepi = penculikan
              onPick: () => {
                this._gangAbducted = true;
              },
            },
          ],
        },
        {
          speaker: "Narasi",
          portrait: "rara",
          text: "🚨 Gang sepi = BAHAYA NYATA! Kalau ada yang maksa, TERIAK sekeras mungkin!\nLari ke keramaian dan cari orang dewasa yang bisa dipercaya!",
        },
      ],
      blocker: () => [
        {
          speaker: "Orang Gelap",
          portrait: "shadow_angry",
          text: '"HEI! Mau kemana kamu?! Ikut sama saya dulu, sebentar aja!"',
        },
        {
          speaker: "Rara (dalam hati)",
          portrait: "rara",
          text: "Seseorang tiba-tiba menghalangi jalan Rara. Rara ngerasa nggak aman banget! 😨",
        },
        {
          speaker: "— PILIH TINDAKAN —",
          portrait: "rara",
          text: "Rara harus bertindak CEPAT! Apa yang dilakukan?",
          choices: [
            {
              label: "📢 TERIAK KERAS + LARI ke tempat rame!",
              category: "AMAN",
              onPick: () => {
                GameState.score += 100;
              },
            },
            {
              label: "(Diam dan berdiri panik di tempat...)",
              category: "RAGU",
              // Diam di depan orang mengancam = berbahaya, kena penalti nyawa
              onPick: () => {
                GameState.score += 30;
                GameState.loseLife();
                if (!GameState.isAlive()) this._blockAbducted = true;
              },
            },
            {
              label: "(Pasrah... ikut orang itu)",
              category: "BAHAYA",
              onPick: () => {
                this._blockAbducted = true;
              },
            },
          ],
        },
        {
          speaker: "Narasi",
          portrait: "rara",
          text: "✓ Kalau dihadang orang asing:\nTERIAK → LARI → CARI orang dewasa yang bisa bantu!",
        },
      ],
    };
  }

  // ══════════════════════════════════════════════════════════════════════
  // PATH CHOICE
  _showPathChoice() {
    const W = CFG.WIDTH,
      H = CFG.HEIGHT;
    const overlay = this.add.graphics().setScrollFactor(0).setDepth(150);
    overlay.fillStyle(0x000000, 0.85);
    overlay.fillRect(0, 0, W, H);

    const panG = this.add.graphics().setScrollFactor(0).setDepth(151);
    panG.fillStyle(CFG.C.PANEL, 0.95);
    panG.fillRoundedRect(W / 2 - 220, 28, 440, 390, 14);
    DrawUtils.sulselBorder(panG, W / 2 - 220, 28, 440, 390, 0.9);

    // ── Visual Y-Fork jalan ────────────────────────────────────────
    const forkG = this.add.graphics().setScrollFactor(0).setDepth(152);
    const fx = W / 2,
      fy = 80;
    // Jalan masuk (dari bawah ke atas)
    forkG.fillStyle(0x777777);
    forkG.fillRect(fx - 16, fy, 32, 60); // trotoar
    forkG.fillStyle(0x555555);
    forkG.fillRect(fx - 12, fy + 4, 24, 52); // aspal

    // Cabang kiri (AMAN) — warna hijau
    forkG.fillStyle(0x558855);
    forkG.fillRect(fx - 120, fy - 18, 32, 24);
    forkG.fillRect(fx - 115, fy - 38, 22, 20);
    forkG.fillRect(fx - 108, fy - 52, 16, 16);
    // Garis diagonal kiri
    forkG.lineStyle(3, 0x33aa55, 0.8);
    forkG.lineBetween(fx - 12, fy + 4, fx - 90, fy - 44);
    // Label kiri
    forkG.fillStyle(0x003311, 0.85);
    forkG.fillRoundedRect(fx - 190, fy - 64, 100, 22, 5);
    forkG.lineStyle(1.5, 0x44ff88);
    forkG.strokeRoundedRect(fx - 190, fy - 64, 100, 22, 5);

    // Cabang kanan (BAHAYA) — warna merah gelap
    forkG.fillStyle(0x664444);
    forkG.fillRect(fx + 88, fy - 18, 32, 24);
    forkG.fillRect(fx + 93, fy - 38, 22, 20);
    forkG.fillRect(fx + 92, fy - 52, 16, 16);
    // Garis diagonal kanan
    forkG.lineStyle(3, 0xff4444, 0.8);
    forkG.lineBetween(fx + 12, fy + 4, fx + 90, fy - 44);
    // Label kanan
    forkG.fillStyle(0x330000, 0.85);
    forkG.fillRoundedRect(fx + 90, fy - 64, 100, 22, 5);
    forkG.lineStyle(1.5, 0xff4444);
    forkG.strokeRoundedRect(fx + 90, fy - 64, 100, 22, 5);

    // Teks label fork
    this.add
      .text(fx - 140, fy - 56, "🏙 Jalan Ramai", {
        fontFamily: "Arial",
        fontSize: "11px",
        color: "#44FF88",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(153);
    this.add
      .text(fx + 140, fy - 56, "🌑 Gang Sepi", {
        fontFamily: "Arial",
        fontSize: "11px",
        color: "#FF6666",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(153);

    // Gambar mini NPC gang (icon peringatan) di cabang kanan
    forkG.fillStyle(0xff2200, 0.7);
    forkG.fillCircle(fx + 152, fy - 82, 10);
    forkG.fillStyle(0xffffff);
    forkG.fillRect(fx + 150, fy - 89, 3, 7);
    forkG.fillRect(fx + 150, fy - 80, 3, 3);

    this.add
      .text(W / 2, fy + 74, "⚠ ADA DUA JALUR!", {
        ...CFG.F.SUBTITLE,
        color: "#FFD700",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(152);

    this.add
      .text(
        W / 2,
        fy + 103,
        "Rara harus pilih jalur ke sekolah.\nMana yang menurutmu lebih aman buat Rara?",
        {
          fontFamily: "Arial",
          fontSize: "14px",
          color: "#EEE",
          align: "center",
        },
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(152);

    const choices = [
      {
        label: "🏙 Jalan Ramai\n(aman, banyak orang)",
        cat: "AMAN",
        y: fy + 135,
      },
      {
        label: "🌑 Gang Sepi\n(lebih cepat, tapi... bahaya!)",
        cat: "BAHAYA",
        y: fy + 208,
      },
    ];

    choices.forEach((c) => {
      const bg2 = this.add.graphics().setScrollFactor(0).setDepth(151);
      const color = c.cat === "AMAN" ? CFG.C.AMAN : CFG.C.BAHAYA;
      bg2.fillStyle(color, 0.75);
      bg2.fillRoundedRect(W / 2 - 170, c.y, 340, 52, 10);

      const lbl = this.add
        .text(W / 2, c.y + 26, c.label, {
          fontFamily: "Arial",
          fontSize: "14px",
          color: "#FFF",
          align: "center",
          wordWrap: { width: 320 },
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(152)
        .setInteractive({ useHandCursor: true });

      lbl.on("pointerover", () => lbl.setAlpha(0.7));
      lbl.on("pointerout", () => lbl.setAlpha(1.0));
      lbl.on("pointerdown", () => {
        GameState.pathChoice = c.cat === "AMAN" ? "safe" : "dangerous";
        GameState.addChoice(1, c.label.split("\n")[0], c.cat);
        // Checkpoint d1 — pemain tidak perlu ulang dari awal jika Game Over
        GameState.checkpoints.d1 = true;
        GameState.save();

        if (c.cat === "AMAN") {
          // ── JALUR RAMAI ──────────────────────────────────────────
          // Gang blocker tidak akan muncul
          this.npcs.runner.active = false;
          // Motor nyasar tetap ada tapi tidak agresif
          this.npcs.giftMan.angry = false;
          // Bonus poin pilihan bijak
          GameState.score += 50;
          AudioManager.sfxCorrect();
          // BGM tetap ceria
          AudioManager.startBGM(90, "day1");
        } else {
          // ── JALUR GANG SEPI ──────────────────────────────────────
          GameState.loseLife();
          // Gang blocker aktif tapi hanya visual — dialog encounter (noApproach)
          this.npcs.runner.active = true;
          this.npcs.runner.angry = true;
          // Motor Nyasar: posisikan di dalam gang, tetap terlihat (dialog-only via noApproach)
          this.npcs.giftMan.active = true;
          this.npcs.giftMan.x = 1350; // berdiri di dalam gang menghadang
          this.npcs.giftMan.angry = true; // tampilan agresif
          // Tambah dua pengintai approach-based di gang (setelah E2)
          this.npcs.lurker1 = {
            x: 1750,
            y: 307,
            active: true,
            angry: true,
            noApproach: false,
            approachTimer: 0,
            approached: false,
            type: "gangGroup",
            label: "Pengintai",
          };
          this.npcs.lurker2 = {
            x: 1950,
            y: 307,
            active: true,
            angry: true,
            noApproach: false,
            approachTimer: 0,
            approached: false,
            type: "gangGroup",
            label: "Pengintai",
          };
          // BGM berganti ke nuansa menegangkan
          AudioManager.startBGM(70, "boss");
          AudioManager.sfxWrong();
        }

        // Hapus semua UI path choice (overlay, panel, bg2 buttons, labels)
        [...this.children.list]
          .filter(
            (o) =>
              o.depth === 150 ||
              o.depth === 151 ||
              o.depth === 152 ||
              o.depth === 153,
          )
          .forEach((o) => o.destroy());
        this._applyPathScene(c.cat);
        this.phase = "walking2";
        if (!GameState.isAlive()) this._triggerGameOver();
      });
    });
  }

  // ══════════════════════════════════════════════════════════════════════
  // PATH SCENE CHANGE (setelah pilih jalur)
  _applyPathScene(cat) {
    const g = this.pathBgGfx;
    const W = CFG.WIDTH;
    const H = CFG.HEIGHT;
    const x0 = 975;
    const xEnd = CFG.WORLD_DAY1 - 200;
    const len = xEnd - x0;

    g.clear();

    // ── Overlay transisi layar penuh (screen-space) ─────────────────
    const isBahaya = cat === "BAHAYA";
    const transOv = this.add.graphics().setScrollFactor(0).setDepth(200);
    transOv.fillStyle(isBahaya ? 0x220000 : 0x003311, 0.88);
    transOv.fillRect(0, 0, W, H);
    const transTxt = this.add
      .text(
        W / 2,
        H / 2,
        isBahaya
          ? "🌑 Rara masuk ke Gang Sepi...\nBahaya ada di mana-mana! 😰 Hati-hati banget!"
          : "🏙 Rara pilih Jalan Ramai! 🌟\nPilihan paling tepat dan aman!",
        {
          fontFamily: "Arial",
          fontSize: "20px",
          color: isBahaya ? "#FF4444" : "#44FF88",
          stroke: "#000",
          strokeThickness: 4,
          align: "center",
          fontStyle: "bold",
        },
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(201);
    this.tweens.add({
      targets: [transOv, transTxt],
      alpha: 0,
      duration: 900,
      delay: 1400,
      onComplete: () => {
        transOv.destroy();
        transTxt.destroy();
      },
    });

    if (isBahaya) {
      // ════════════════════════════════════════════════════════════
      // GANG SEPI — gelap & menyeramkan
      // ════════════════════════════════════════════════════════════

      // ── LANGIT SENJA UNGU GELAP (twilight horror) ─────────────────
      g.fillStyle(0x0a0018, 1);
      g.fillRect(x0, 0, len, 80);
      g.fillStyle(0x18062a, 1);
      g.fillRect(x0, 80, len, 80);
      g.fillStyle(0x2d1050, 1);
      g.fillRect(x0, 160, len, 60);

      // Bintang-bintang kecil
      g.fillStyle(0xffffff, 0.7);
      [
        [x0 + 55, 18],
        [x0 + 180, 10],
        [x0 + 340, 25],
        [x0 + 510, 8],
        [x0 + 680, 20],
        [x0 + 850, 14],
        [x0 + 1020, 30],
        [x0 + 1190, 12],
        [x0 + 1360, 22],
        [x0 + 1530, 8],
        [x0 + 1700, 18],
        [x0 + 1880, 26],
        [x0 + 95, 40],
        [x0 + 265, 35],
        [x0 + 430, 50],
        [x0 + 600, 38],
        [x0 + 770, 46],
        [x0 + 940, 32],
      ].forEach(([sx, sy]) => g.fillRect(sx, sy, 2, 2));

      // Bulan sabit
      g.fillStyle(0xfffce8, 0.9);
      g.fillCircle(x0 + 1850, 28, 18);
      g.fillStyle(0x18062a, 1);
      g.fillCircle(x0 + 1857, 26, 15);

      // Awan hitam tebal
      g.fillStyle(0x120820, 1);
      for (let cx = x0 + 100; cx < xEnd - 50; cx += 230) {
        g.fillEllipse(cx, 62, 210, 72);
        g.fillEllipse(cx - 70, 75, 120, 52);
        g.fillEllipse(cx + 70, 70, 130, 54);
      }

      // Cover area bangunan dengan dinding bata tinggi
      g.fillStyle(0x2e1808, 1);
      g.fillRect(x0, 185, len, 112);

      // Pola bata di dinding
      g.lineStyle(1, 0x1a0c04, 0.9);
      for (let wy = 185; wy < 295; wy += 15) {
        const off = Math.floor((wy - 185) / 15) % 2 === 0 ? 0 : 28;
        for (let wx = x0 + off; wx < xEnd; wx += 58) {
          g.strokeRect(wx, wy, 56, 13);
        }
      }

      // Noda lembab / air menetes di dinding
      g.fillStyle(0x1c0e06, 0.62);
      for (let drx = x0 + 90; drx < xEnd - 30; drx += 175) {
        g.fillRect(drx, 195, 3, 50 + (drx % 38));
        g.fillRect(drx + 6, 210, 2, 35 + (drx % 25));
      }

      // Tanah gelap & lembab
      g.fillStyle(0x1a0e05, 1);
      g.fillRect(x0, 220, len, 75);

      // Trotoar gelap & basah
      g.fillStyle(0x181818, 1);
      g.fillRect(x0, 295, len, 45);

      // Jalan gelap & rusak
      g.fillStyle(0x111111, 1);
      g.fillRect(x0, 340, len, 80);

      // Retakan di jalan
      g.lineStyle(1, 0x383838, 0.75);
      for (let rx = x0 + 55; rx < xEnd - 20; rx += 95) {
        g.lineBetween(rx, 344, rx + 24, 358);
        g.lineBetween(rx + 12, 358, rx + 40, 390);
      }

      // Genangan air beracun (kehijauan gelap)
      g.fillStyle(0x091a10, 0.85);
      for (let px = x0 + 85; px < xEnd - 40; px += 195) {
        g.fillEllipse(px, 318, 72, 16);
      }
      g.fillStyle(0x1a4418, 0.5);
      for (let px = x0 + 90; px < xEnd - 40; px += 195) {
        g.fillEllipse(px - 4, 313, 24, 6);
      }

      // Police / caution tape (pita kuning-hitam)
      g.fillStyle(0xffdd00, 0.82);
      g.fillRect(x0, 267, len, 7);
      g.fillStyle(0x111111, 0.65);
      for (let tx = x0 - 5; tx < xEnd; tx += 18) {
        g.fillTriangle(tx, 267, tx + 9, 267, tx, 274);
      }

      // Lampu jalan redup, sebagian rusak/miring
      for (let lx = x0 + 130; lx < xEnd - 60; lx += 320) {
        const broken = Math.floor((lx - x0) / 320) % 2 === 1;
        g.fillStyle(0x444444);
        g.fillRect(lx + (broken ? 3 : 0), 248, 5, 50);
        g.fillStyle(broken ? 0x333333 : 0x555555);
        g.fillRect(lx - 5, 248, 16, 5);
        if (!broken) {
          g.fillStyle(0xff6600, 0.18);
          g.fillCircle(lx + 2, 248, 40);
          g.fillStyle(0xff8800, 0.55);
          g.fillCircle(lx + 2, 248, 7);
        }
      }

      // Pohon mati / skeletal dead trees
      for (let tx = x0 + 80; tx < xEnd - 60; tx += 290) {
        g.fillStyle(0x1a0e04);
        g.fillRect(tx, 230, 7, 66);
        g.lineStyle(3, 0x1c1008, 1);
        g.lineBetween(tx + 3, 250, tx - 18, 232);
        g.lineBetween(tx + 3, 262, tx - 12, 244);
        g.lineBetween(tx + 4, 250, tx + 22, 234);
        g.lineBetween(tx + 4, 260, tx + 14, 242);
        g.lineStyle(1, 0x1c1008, 0.8);
        g.lineBetween(tx - 18, 232, tx - 28, 224);
        g.lineBetween(tx + 22, 234, tx + 30, 224);
      }

      // Tempat sampah menumpuk
      for (let tx = x0 + 165; tx < xEnd - 60; tx += 290) {
        g.fillStyle(0x333333);
        g.fillRect(tx, 262, 22, 35);
        g.fillStyle(0x252525);
        g.fillRect(tx - 2, 257, 26, 7);
        g.fillStyle(0x3d2a18, 0.88);
        g.fillEllipse(tx + 11, 297, 50, 12);
        g.fillStyle(0x1a1a1a, 0.9);
        g.fillEllipse(tx + 28, 275, 18, 14);
      }

      // Tikus di dekat sampah
      for (let tx = x0 + 190; tx < xEnd - 60; tx += 290) {
        g.fillStyle(0x2a2218);
        g.fillEllipse(tx + 42, 289, 16, 8);
        g.fillEllipse(tx + 52, 287, 8, 6);
        g.fillStyle(0x3d2a22);
        g.fillCircle(tx + 53, 283, 3);
        g.fillStyle(0x2a2218);
        g.fillRect(tx + 34, 289, 8, 1);
        g.fillRect(tx + 30, 290, 5, 1);
      }

      // Mata merah mengintai — beberapa ketinggian
      const eyeData = [
        [x0 + 220, 228, 10, 8],
        [x0 + 560, 245, 9, 7],
        [x0 + 890, 231, 8, 6],
        [x0 + 1200, 238, 10, 8],
        [x0 + 1540, 226, 9, 7],
        [x0 + 1820, 242, 8, 6],
        [x0 + 350, 285, 7, 5],
        [x0 + 720, 278, 7, 5],
        [x0 + 1080, 283, 6, 5],
      ];
      eyeData.forEach(([ex, ey, ew, eh]) => {
        g.fillStyle(0xff0000, 0.9);
        g.fillEllipse(ex, ey, ew, eh);
        g.fillEllipse(ex + ew + 4, ey, ew, eh);
        g.fillStyle(0xff7777, 0.5);
        g.fillEllipse(ex + 2, ey - 1, ew * 0.4, eh * 0.4);
        g.fillEllipse(ex + ew + 6, ey - 1, ew * 0.4, eh * 0.4);
      });

      // Grafiti salib merah di dinding + tetesan cat
      g.fillStyle(0xcc1111, 0.75);
      for (let gx2 = x0 + 200; gx2 < xEnd - 50; gx2 += 460) {
        g.fillRect(gx2, 202, 22, 5);
        g.fillRect(gx2 + 8, 195, 5, 20);
        g.fillStyle(0xaa0a0a, 0.55);
        g.fillEllipse(gx2 + 3, 224, 5, 8);
        g.fillEllipse(gx2 + 18, 225, 4, 6);
        g.fillStyle(0xcc1111, 0.75);
      }

      // Bayangan sosok gelap mengancam
      [x0 + 440, x0 + 1250, x0 + 1850].forEach((fx) => {
        g.fillStyle(0x000000, 0.5);
        g.fillCircle(fx, 270, 7);
        g.fillRect(fx - 6, 277, 12, 18);
        g.fillRect(fx - 4, 295, 4, 10);
        g.fillRect(fx + 1, 295, 4, 10);
      });

      // Label
      this.add
        .text(x0 + 38, 188, "⚠ GANG SEPI", {
          fontFamily: "Arial",
          fontSize: "13px",
          color: "#FF4444",
          fontStyle: "bold",
          stroke: "#000",
          strokeThickness: 2,
        })
        .setDepth(3);
    } else {
      // ════════════════════════════════════════════════════════════
      // JALAN RAMAI — cerah & ramai
      // ════════════════════════════════════════════════════════════

      // ── LANGIT SORE HANGAT & CERAH (golden afternoon) ────────────
      g.fillStyle(0x4aa8e8, 1);
      g.fillRect(x0, 0, len, 100);
      g.fillStyle(0x6bbfee, 1);
      g.fillRect(x0, 100, len, 70);
      g.fillStyle(0xaad8f0, 1);
      g.fillRect(x0, 170, len, 50);

      // Matahari (sinar kuning-oranye hangat)
      g.fillStyle(0xffe44a, 0.2);
      g.fillCircle(x0 + len - 60, 30, 80);
      g.fillStyle(0xffdd22, 0.42);
      g.fillCircle(x0 + len - 60, 30, 50);
      g.fillStyle(0xfff060, 0.82);
      g.fillCircle(x0 + len - 60, 30, 28);
      g.fillStyle(0xffffff, 0.9);
      g.fillCircle(x0 + len - 65, 26, 10);

      // Sinar matahari samar
      g.lineStyle(2, 0xffe080, 0.1);
      for (let ri = 0; ri < 8; ri++) {
        const ang = (ri * Math.PI) / 4;
        const sx = x0 + len - 60,
          sy = 30;
        g.lineBetween(
          sx,
          sy,
          sx + Math.cos(ang) * 110,
          sy + Math.sin(ang) * 110,
        );
      }

      // Burung kecil di langit (V-shapes)
      g.fillStyle(0x334466, 0.6);
      [
        [x0 + 120, 35],
        [x0 + 310, 22],
        [x0 + 490, 40],
        [x0 + 720, 28],
        [x0 + 950, 18],
        [x0 + 1180, 32],
        [x0 + 1400, 24],
        [x0 + 1620, 38],
      ].forEach(([bx, by]) => {
        g.fillTriangle(bx, by, bx + 6, by + 4, bx + 3, by + 2);
        g.fillTriangle(bx + 3, by + 2, bx + 9, by, bx + 6, by + 4);
      });

      // Awan putih cerah dengan sentuhan golden
      g.fillStyle(0xffffff, 0.95);
      for (let cx = x0 + 90; cx < xEnd - 50; cx += 265) {
        g.fillEllipse(cx, 52, 118, 42);
        g.fillEllipse(cx - 36, 62, 80, 32);
        g.fillEllipse(cx + 38, 60, 85, 34);
        g.fillStyle(0xfff5d0, 0.4);
        g.fillEllipse(cx, 66, 90, 20);
        g.fillStyle(0xffffff, 0.95);
      }

      // Tanah terang
      g.fillStyle(0x9b7a1a, 1);
      g.fillRect(x0, 220, len, 75);

      // Rumput kecil di tepi tanah
      g.fillStyle(0x4a8c2a, 0.7);
      for (let gx3 = x0 + 5; gx3 < xEnd; gx3 += 22) {
        g.fillTriangle(gx3, 295, gx3 + 4, 295, gx3 + 2, 287 + (gx3 % 6));
      }

      // Trotoar warm cream dengan pola alternating
      g.fillStyle(0xd8d0b8, 1);
      g.fillRect(x0, 295, len, 45);
      g.fillStyle(0xc8c0a8, 0.45);
      for (let px = x0; px < xEnd; px += 30) {
        for (let py = 295; py < 340; py += 15) {
          if (
            (Math.floor((px - x0) / 30) + Math.floor((py - 295) / 15)) % 2 ===
            0
          ) {
            g.fillRect(px, py, 29, 14);
          }
        }
      }

      // Jalan bersih
      g.fillStyle(0x686868, 1);
      g.fillRect(x0, 340, len, 80);
      g.fillStyle(0xffffff, 0.55);
      for (let rx = x0; rx < xEnd; rx += 120) g.fillRect(rx + 20, 372, 80, 6);

      // Kios warna-warni — y = 295 - h (formula _drawBuildings)
      const kioDefs = [
        { x: x0 + 30, w: 92, h: 72, c: 0xffcc44 },
        { x: x0 + 228, w: 85, h: 65, c: 0xff6688 },
        { x: x0 + 420, w: 95, h: 80, c: 0x44cc88 },
        { x: x0 + 622, w: 88, h: 68, c: 0x6688ff },
        { x: x0 + 815, w: 90, h: 75, c: 0xffaa44 },
        { x: x0 + 1010, w: 85, h: 65, c: 0xcc4488 },
        { x: x0 + 1200, w: 95, h: 72, c: 0x44aaff },
        { x: x0 + 1400, w: 88, h: 78, c: 0xffcc44 },
        { x: x0 + 1592, w: 90, h: 65, c: 0xff6688 },
        { x: x0 + 1785, w: 85, h: 72, c: 0x44cc88 },
      ];
      kioDefs.forEach(({ x: bx, w: bw, h: bh, c }) => {
        const by = 295 - bh;
        // Badan kios
        g.fillStyle(c, 0.9);
        g.fillRect(bx, by, bw, bh);
        // Highlight cahaya sore di sisi kanan
        g.fillStyle(0xffffff, 0.1);
        g.fillRect(bx + bw - 8, by, 8, bh);
        // Atap tenda segitiga
        g.fillStyle(c, 1);
        g.fillTriangle(bx - 5, by, bx + bw + 5, by, bx + bw / 2, by - 22);
        // Garis putih di atap (awning stripes)
        g.fillStyle(0xffffff, 0.28);
        for (let s = bx; s < bx + bw; s += 12) g.fillRect(s, by - 20, 5, 20);
        // Jendela
        g.fillStyle(0xadd8e6, 0.85);
        g.fillRect(bx + 8, by + 10, 20, 16);
        if (bw > 70) g.fillRect(bx + bw - 29, by + 10, 20, 16);
        // Pintu
        g.fillStyle(0x5c3317);
        g.fillRect(bx + bw / 2 - 8, by + bh - 26, 16, 26);
        // Pot bunga di samping pintu
        g.fillStyle(0x8b4513);
        g.fillRect(bx + bw / 2 - 19, by + bh - 12, 10, 8);
        g.fillStyle(0xff5588, 0.9);
        g.fillEllipse(bx + bw / 2 - 14, by + bh - 16, 12, 8);
        g.fillStyle(0x44bb44, 0.8);
        g.fillEllipse(bx + bw / 2 - 20, by + bh - 18, 8, 6);
        // Display buah di depan kios (meja kecil + buah warna-warni)
        const dispX = bx + bw / 2 - 15;
        const dispY = by + bh - 8;
        g.fillStyle(0x8b5e2a, 0.82);
        g.fillRect(dispX, dispY, 30, 5);
        g.fillRect(dispX + 2, dispY + 5, 4, 5);
        g.fillRect(dispX + 24, dispY + 5, 4, 5);
        const fruitColors = [0xff4422, 0xffaa22, 0xffee22, 0x44cc22];
        for (let fi = 0; fi < 4; fi++) {
          g.fillStyle(fruitColors[fi], 0.9);
          g.fillCircle(dispX + 4 + fi * 7, dispY - 4, 5);
        }
      });

      // Pohon di ANTARA kios (koordinat persis = _drawWorld)
      [
        x0 + 162,
        x0 + 358,
        x0 + 552,
        x0 + 748,
        x0 + 950,
        x0 + 1145,
        x0 + 1340,
        x0 + 1535,
        x0 + 1725,
      ].forEach((tx) => {
        g.fillStyle(0x8b4513);
        g.fillRect(tx, 258, 7, 38);
        g.fillStyle(0x228b22, 1);
        g.fillCircle(tx + 3, 246, 20);
        g.fillStyle(0x2ecc71);
        g.fillCircle(tx + 3, 239, 14);
        g.fillStyle(0x55ee88, 0.6);
        g.fillCircle(tx + 3, 234, 9);
        // Bayangan pohon di trotoar
        g.fillStyle(0x44aa22, 0.18);
        g.fillEllipse(tx + 3, 295, 28, 5);
        // Buah merah kecil
        g.fillStyle(0xff5533, 0.9);
        g.fillCircle(tx + 11, 241, 5);
        g.fillCircle(tx - 5, 244, 4);
      });

      // Kucing oranye di trotoar
      [x0 + 370, x0 + 1090, x0 + 1690].forEach((cx) => {
        g.fillStyle(0xff8844, 0.9);
        g.fillEllipse(cx, 283, 22, 12);
        g.fillCircle(cx + 12, 278, 7);
        g.fillStyle(0xff7733);
        g.fillTriangle(cx + 8, 273, cx + 12, 269, cx + 16, 273);
        g.fillTriangle(cx + 14, 272, cx + 18, 268, cx + 21, 272);
        g.fillStyle(0x111111);
        g.fillCircle(cx + 11, 278, 2);
        g.fillCircle(cx + 14, 278, 2);
        g.fillStyle(0xff8844, 0.9);
        g.fillEllipse(cx - 10, 282, 14, 5);
      });

      // Orang berjalan (campuran dewasa & anak kecil) + payung vendor
      const skins = [0xffcc88, 0xff9966, 0xeeaa88, 0xffddaa, 0xcc9966];
      const shirts = [0x4444aa, 0xaa4444, 0x44aa66, 0x884488, 0x886622];
      for (let px = x0 + 130; px < xEnd - 40; px += 215) {
        const idx = Math.floor((px - x0) / 215);
        const py = 308 + (idx % 2 === 0 ? 0 : 4);
        const isChild = idx % 4 === 3;
        const s = isChild ? 0.68 : 1;
        g.fillStyle(skins[idx % 5]);
        g.fillCircle(px, py - Math.round(22 * s), Math.round(8 * s));
        g.fillStyle(shirts[idx % 5]);
        g.fillRect(
          px - Math.round(7 * s),
          py - Math.round(14 * s),
          Math.round(14 * s),
          Math.round(16 * s),
        );
        g.fillStyle(0x333333);
        g.fillRect(
          px - Math.round(5 * s),
          py + Math.round(2 * s),
          Math.round(5 * s),
          Math.round(10 * s),
        );
        g.fillRect(
          px + Math.round(1 * s),
          py + Math.round(2 * s),
          Math.round(5 * s),
          Math.round(10 * s),
        );
        // Payung vendor warna-warni
        if (!isChild && idx % 3 === 0) {
          const uc = [0xff4444, 0x44aaff, 0xffcc22, 0x44cc88][idx % 4];
          g.fillStyle(uc, 0.72);
          g.fillEllipse(px, py - 40, 34, 18);
          g.fillStyle(0xffffff, 0.18);
          g.fillEllipse(px - 6, py - 44, 14, 7);
        }
      }

      // Garland / bendera warna-warni di atas kios
      const flagCols = [
        0xff4444, 0xffee44, 0x44ff44, 0x4488ff, 0xff44ff, 0x44ffff,
      ];
      for (let fx = x0 + 18; fx < xEnd - 20; fx += 36) {
        g.fillStyle(flagCols[Math.floor((fx - x0) / 36) % 6], 0.88);
        g.fillTriangle(fx, 208, fx + 13, 208, fx + 6, 220);
      }
      g.lineStyle(1, 0xaa8833, 0.55);
      g.lineBetween(x0, 208, xEnd, 208);

      // Lampu jalan cerah dengan orb dekoratif
      for (let lx = x0 + 178; lx < xEnd - 40; lx += 305) {
        g.fillStyle(0x999999);
        g.fillRect(lx, 248, 6, 48);
        g.fillRect(lx - 6, 248, 20, 6);
        g.fillStyle(0x777777, 0.7);
        g.fillCircle(lx + 3, 248, 12);
        g.fillStyle(0xffffee, 0.96);
        g.fillCircle(lx + 3, 248, 9);
        g.fillStyle(0xffee88, 0.28);
        g.fillCircle(lx + 3, 248, 30);
        g.fillStyle(0xffff99, 0.6);
        g.fillCircle(lx + 3, 248, 9);
      }

      // Label
      this.add
        .text(x0 + 28, 192, "✅ JALAN RAMAI", {
          fontFamily: "Arial",
          fontSize: "13px",
          color: "#44FF88",
          fontStyle: "bold",
          stroke: "#000",
          strokeThickness: 2,
        })
        .setDepth(3);
    }
  }

  // ══════════════════════════════════════════════════════════════════════
  // SAFE ROUTE REWARD — muncul saat Rara berhasil lewat jalur aman tanpa blocker
  _showSafeRouteReward() {
    const W = CFG.WIDTH,
      H = CFG.HEIGHT;
    GameState.score += CFG.SCORE.AMAN;

    const rewG = this.add.graphics().setScrollFactor(0).setDepth(150);
    rewG.fillStyle(0x002211, 0.92);
    rewG.fillRoundedRect(W / 2 - 200, H / 2 - 80, 400, 160, 14);
    rewG.lineStyle(3, CFG.C.AMAN, 0.9);
    rewG.strokeRoundedRect(W / 2 - 200, H / 2 - 80, 400, 160, 14);

    const rewT = this.add
      .text(W / 2, H / 2 - 55, "🎉 Yeay! Rara Sampai di Sekolah! +100 poin", {
        fontFamily: "Arial",
        fontSize: "18px",
        color: "#44FF88",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(151);

    const rewT2 = this.add
      .text(
        W / 2,
        H / 2 - 10,
        "Rara pilih Jalan Ramai dan tiba dengan selamat! ✅\n\nSelalu pilih tempat rame ya — lebih banyak orang = lebih aman!",
        {
          fontFamily: "Arial",
          fontSize: "13px",
          color: "#CCFFCC",
          align: "center",
          wordWrap: { width: 370 },
        },
      )
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(151);

    const rewBtn = this.add
      .text(W / 2, H / 2 + 55, "[ LANJUT → KARTU EDUKASI ]", {
        fontFamily: "Arial",
        fontSize: "13px",
        color: "#FFD700",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(151)
      .setInteractive({ useHandCursor: true });

    rewBtn.on("pointerdown", () => {
      [rewG, rewT, rewT2, rewBtn].forEach((o) => o.destroy());
      this._showEduCard();
    });
  }

  // ══════════════════════════════════════════════════════════════════════
  // EDU CARD
  _showEduCard() {
    const W = CFG.WIDTH,
      H = CFG.HEIGHT;
    const overlay = this.add.graphics().setScrollFactor(0).setDepth(150);
    overlay.fillStyle(0x000000, 0.82);
    overlay.fillRect(0, 0, W, H);

    const card = this.add.graphics().setScrollFactor(0).setDepth(151);
    card.fillStyle(0x1a0a00, 0.97);
    card.fillRoundedRect(20, 30, W - 40, H - 70, 14);
    DrawUtils.sulselBorder(card, 20, 30, W - 40, H - 70, 1.0);

    this.add
      .text(W / 2, 52, "📚 Kartu Edukasi — Hari 1", {
        fontFamily: "Arial",
        fontSize: "17px",
        color: "#FFD700",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(152);

    const tips = [
      {
        h: "� ORANG ASING KASIH HADIAH = RED FLAG!",
        b: "Permen, snack, mainan, atau tumpangan GRATIS dari orang yang\nbaru dikenal adalah tanda bahaya. Jangan terima, langsung pergi!",
      },
      {
        h: "✅ Yang Harus Dilakukan:",
        b: "• Tolak dengan tegas — kamu BOLEH berkata TIDAK!\n• Teriak KERAS dan lari ke tempat ramai\n• Ceritakan ke orang tua, guru, atau orang dewasa terpercaya",
      },
      {
        h: '🛡 "Tidak" adalah Hakmu!',
        b: "Kamu berhak menolak siapapun yang membuatmu tidak nyaman —\ntermasuk orang dewasa atau orang yang mengaku baik.",
      },
    ];
    let y = 80;
    tips.forEach((t) => {
      this.add
        .text(40, y, t.h, {
          fontFamily: "Arial",
          fontSize: "14px",
          color: "#FF8888",
          fontStyle: "bold",
        })
        .setScrollFactor(0)
        .setDepth(152);
      this.add
        .text(40, y + 22, t.b, {
          fontFamily: "Arial",
          fontSize: "13px",
          color: "#FFFFCC",
          wordWrap: { width: W - 80 },
          lineSpacing: 3,
        })
        .setScrollFactor(0)
        .setDepth(152);
      y += 85;
    });

    this.add
      .text(
        W / 2,
        H - 60,
        "📞 Kalau ada yang ganggu atau bikin kamu nggak nyaman:\nCERITAIN ke ortu, guru, atau Hotline Anak 129!",
        {
          fontFamily: "Arial",
          fontSize: "13px",
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
      [overlay, card].forEach((o) => o.destroy());
      this.children.list
        .filter((c) => c.depth === 152)
        .forEach((c) => c.destroy());
      this.phase = "complete";
      this._goResult();
    });
  }

  // ══════════════════════════════════════════════════════════════════════
  _triggerGameOver() {
    this._paused = true;
    this.physics.pause();
    this.cameras.main.fadeOut(600);
    this.time.delayedCall(600, () => {
      this.scene.start("GameOver", { fromDay: 1 });
    });
  }

  _goResult() {
    this.cameras.main.fadeOut(500);
    this.time.delayedCall(500, () => this.scene.start("Result1"));
  }

  // ══════════════════════════════════════════════════════════════════════
  // PAUSE MENU
  _showPause() {
    if (this._paused) return;
    this._paused = true;
    this.physics.pause();
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
        this.physics.resume();
        AudioManager.sfxClick();
      });
  }

  // ══════════════════════════════════════════════════════════════════════
  // UPDATE LOOP
  update(time, delta) {
    if (this.phase === "intro") return;
    if (this._paused) return;
    if (this.dlg.open) return;

    voiceMeter.tick();

    // Kontrol gerakan Rara
    // Di gang sepi: kecepatan dasar sedikit lebih lambat (ketakutan) dan NPC lebih mengancam
    const isDangerous = GameState.pathChoice === "dangerous";
    const baseSpeed = voiceMeter.isShout() ? 220 : isDangerous ? 120 : 150;
    if (
      this.phase !== "encounter1" &&
      this.phase !== "encounter2" &&
      this.phase !== "encounter3" &&
      this.phase !== "path_choice" &&
      this.phase !== "educard" &&
      this.phase !== "complete"
    ) {
      if (this.cursors.left.isDown) {
        this.raraBody.setVelocityX(-baseSpeed);
      } else if (this.cursors.right.isDown || this.phase === "tutorial") {
        this.raraBody.setVelocityX(baseSpeed * 0.5); // auto walk slow
        if (this.cursors.right.isDown) this.raraBody.setVelocityX(baseSpeed);
      } else {
        this.raraBody.setVelocityX(30); // gentle auto-walk
      }
    } else {
      this.raraBody.setVelocityX(0);
    }

    this.raraX = this.raraBody.x;
    this.raraY = this.raraBody.y - 32;

    // Tutorial barrier check
    if (this.phase === "tutorial") this._checkTutorial();

    // Encounters
    this._checkEncounters(delta);

    // Cooldown
    if (this.shoutCooldown > 0) this.shoutCooldown -= delta;

    // Redraw characters
    this.charGfx.clear();
    this._drawCharacters();

    // HUD update
    this._updateHUD();

    // End of level
    if (this.raraBody.x > CFG.WORLD_DAY1 - 100 && this.phase === "walking3") {
      this.phase = "educard";
      this.raraBody.setVelocityX(0);
      this._showEduCard();
    }
  }

  _drawCharacters() {
    const g = this.charGfx;
    const rx = this.raraBody.x,
      ry = this.raraBody.y - 32;
    const isMoving = this.raraBody.body.velocity.x !== 0;
    const isDangerousPath = GameState.pathChoice === "dangerous";
    // Di gang sepi: Rara terlihat takut saat berdiri diam
    const raraState = isMoving ? "walk" : isDangerousPath ? "scared" : "idle";
    const bobY = raraState === "idle" ? Math.sin(this.time.now / 500) * 2 : 0;
    DrawUtils.rara(g, rx, ry + bobY, raraState);

    // Label "RARA" atas karakter utama
    if (!this._raraLabel) {
      this._raraLabel = this.add
        .text(0, 0, "RARA", {
          fontFamily: "Arial",
          fontSize: "10px",
          color: "#FFD700",
          fontStyle: "bold",
          backgroundColor: "#000000aa",
          padding: { x: 3, y: 1 },
        })
        .setDepth(12);
    }
    this._raraLabel.setPosition(rx - 16, ry - 50);

    // Draw active NPCs — type-specific sprites + name labels
    Object.values(this.npcs).forEach((npc) => {
      if (!npc.active) return;
      const dist = npc.x - rx;
      if (dist > -300 && dist < 500) {
        const approach = dist < 150 && dist > 0;
        if (npc.type === "pamanBaik") {
          DrawUtils.pamanBaik(g, npc.x, npc.y);
        } else if (npc.type === "motorNpc") {
          DrawUtils.motorNpc(g, npc.x, npc.y - 10);
        } else if (npc.type === "gangGroup") {
          DrawUtils.gangGroup(g, npc.x, npc.y);
        } else {
          DrawUtils.shadowNpc(g, npc.x, npc.y, npc.angry, approach);
        }
        // Floating name label (dibuat sekali, di-update posisinya)
        if (!npc._lbl) {
          npc._lbl = this.add
            .text(npc.x, npc.y - 68, npc.label || "?", {
              fontFamily: "Arial",
              fontSize: "10px",
              color: "#FF8888",
              fontStyle: "bold",
              backgroundColor: "#00000099",
              padding: { x: 3, y: 1 },
            })
            .setDepth(13)
            .setOrigin(0.5);
        }
        npc._lbl.setPosition(npc.x, npc.y - 68);
        npc._lbl.setVisible(true);
      } else if (npc._lbl) {
        npc._lbl.setVisible(false);
      }
    });
  }
}
