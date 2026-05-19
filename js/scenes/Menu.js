// Menu.js — Main menu game RARA
class Menu extends Phaser.Scene {
  constructor() {
    super({ key: "Menu" });
  }

  create() {
    const W = CFG.WIDTH,
      H = CFG.HEIGHT;
    this.cameras.main.fadeIn(400);

    // Background
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x2c1810, 0x2c1810, 0x0d0505, 0x0d0505, 1);
    bg.fillRect(0, 0, W, H);

    // Panel tengah
    const panelG = this.add.graphics();
    panelG.fillStyle(0x000000, 0.4);
    panelG.fillRoundedRect(W / 2 - 200, 80, 400, 290, 16);
    DrawUtils.sulselBorder(panelG, W / 2 - 200, 80, 400, 290, 0.9);

    // Judul
    this.add.text(W / 2, 40, "RARA: Jaga Dirimu!", CFG.F.TITLE).setOrigin(0.5);
    this.add
      .text(W / 2, 75, "✦ Game Edukasi Keselamatan Anak Indonesia ✦", {
        ...CFG.F.SMALL,
        color: "#FFCC88",
      })
      .setOrigin(0.5);

    // Dekorasi Rara kecil di sisi kiri
    const deco = this.add.graphics().setScrollFactor(0).setDepth(5);
    DrawUtils.rara(deco, 90, 320, "idle");

    // Karakter NPC bayangan di sisi kanan
    const decoNpc = this.add.graphics().setScrollFactor(0).setDepth(5);
    DrawUtils.shadowNpc(decoNpc, W - 90, 320, false);

    // Tombol-tombol
    const buttons = [
      { label: "▶  MAIN", key: "play", color: CFG.C.AMAN },
      { label: "⚙  PENGATURAN", key: "settings", color: CFG.C.NEUTRAL },
      { label: "★  KREDIT", key: "credits", color: CFG.C.RAGU },
      { label: "✕  KELUAR", key: "quit", color: 0x555555 },
    ];

    buttons.forEach((btn, i) => {
      const by = 120 + i * 60;
      this._makeButton(W / 2, by, 280, 44, btn.label, btn.color, () => {
        this._onButton(btn.key);
      });
    });

    // Tombol LANJUTKAN jika ada save data
    if (GameState.hasSave()) {
      this._makeLanjutkanButton(W);
    }

    // Versi & kredit singkat
    this.add
      .text(W - 10, H - 10, "v1.0 | Dibuat dengan Phaser 3", {
        ...CFG.F.SMALL,
        fontSize: "11px",
        color: "#888",
      })
      .setOrigin(1, 1);

    // Hiasan bintang
    this._drawDecorativeStars();

    // Init audio saat pertama ada interaksi (browser policy)
    this.input.once("pointerdown", () => {
      AudioManager.init();
      AudioManager.startBGM(90, "menu");
    });
  }

  _makeButton(cx, y, w, h, label, color, onClick) {
    const x = cx - w / 2;
    const bg = this.add.graphics();
    const draw = (hover) => {
      bg.clear();
      bg.fillStyle(color, hover ? 1.0 : 0.75);
      bg.fillRoundedRect(x, y, w, h, 10);
      bg.lineStyle(2, CFG.C.GOLD, hover ? 1 : 0.5);
      bg.strokeRoundedRect(x, y, w, h, 10);
    };
    draw(false);

    const txt = this.add
      .text(cx, y + h / 2, label, CFG.F.BUTTON)
      .setOrigin(0.5);
    const zone = this.add
      .zone(x, y, w, h)
      .setOrigin(0)
      .setInteractive({ useHandCursor: true });

    zone.on("pointerover", () => {
      draw(true);
      txt.setColor("#FFD700");
    });
    zone.on("pointerout", () => {
      draw(false);
      txt.setColor("#FFFFFF");
    });
    zone.on("pointerdown", () => {
      AudioManager.sfxClick();
      this.tweens.add({
        targets: [bg, txt],
        scaleX: 0.95,
        scaleY: 0.95,
        duration: 80,
        yoyo: true,
        onComplete: onClick,
      });
    });
  }

  _onButton(key) {
    switch (key) {
      case "play":
        const nm = window.prompt("Siapa namamu, Jagoan?", "Rara") || "Rara";
        GameState.reset();
        GameState.playerName = nm.trim().substring(0, 20) || "Rara";
        AudioManager.stopBGM();
        this.cameras.main.fadeOut(400);
        this.time.delayedCall(400, () => this.scene.start("Prolog1"));
        break;
      case "settings":
        this._showSettings();
        break;
      case "credits":
        this.cameras.main.fadeOut(300);
        this.time.delayedCall(300, () => this.scene.start("Credits"));
        break;
      case "quit":
        this._showQuitConfirm();
        break;
    }
  }

  _makeLanjutkanButton(W) {
    // Parse save data untuk info tampil
    let saveInfo = "";
    try {
      const d = JSON.parse(localStorage.getItem("rara_save") || "{}");
      if (d.day)
        saveInfo = `Hari ${d.day}  |  Skor: ${d.score || 0}  |  ${d.playerName || "Rara"}`;
    } catch (e) {}

    const by = 368;
    const bg = this.add.graphics().setDepth(10);
    const drawBtn = (hover) => {
      bg.clear();
      bg.fillStyle(0x004422, hover ? 1.0 : 0.88);
      bg.fillRoundedRect(W / 2 - 145, by, 290, 46, 10);
      bg.lineStyle(2, 0x44ff88, hover ? 1.0 : 0.7);
      bg.strokeRoundedRect(W / 2 - 145, by, 290, 46, 10);
    };
    drawBtn(false);

    const lbl = this.add
      .text(W / 2, by + 14, "🎮 LANJUTKAN", {
        ...CFG.F.BUTTON,
        color: "#44FF88",
        fontSize: "17px",
      })
      .setOrigin(0.5)
      .setDepth(11);

    this.add
      .text(W / 2, by + 32, saveInfo, {
        fontFamily: "Arial",
        fontSize: "10px",
        color: "#AAFFCC",
      })
      .setOrigin(0.5)
      .setDepth(11);

    const zone = this.add
      .zone(W / 2 - 145, by, 290, 46)
      .setOrigin(0)
      .setDepth(12)
      .setInteractive({ useHandCursor: true });
    zone.on("pointerover", () => {
      drawBtn(true);
      lbl.setColor("#FFFFFF");
    });
    zone.on("pointerout", () => {
      drawBtn(false);
      lbl.setColor("#44FF88");
    });
    zone.on("pointerdown", () => {
      AudioManager.sfxClick();
      if (!GameState.load()) return;
      AudioManager.stopBGM();
      this.cameras.main.fadeOut(400);
      this.time.delayedCall(400, () => {
        const cp = GameState.checkpoints;
        if (GameState.day >= 3) this.scene.start(cp.d3 ? "Day3" : "Prolog3");
        else if (GameState.day >= 2)
          this.scene.start(cp.d2 ? "Day2" : "Prolog2");
        else this.scene.start("Prolog1");
      });
    });

    // Tombol hapus save (kecil di kanan)
    const delG = this.add.graphics().setDepth(12);
    delG.fillStyle(0x440000, 0.7);
    delG.fillRoundedRect(W / 2 + 152, by + 6, 32, 34, 6);
    const delLbl = this.add
      .text(W / 2 + 168, by + 23, "🗑", {
        fontFamily: "Arial",
        fontSize: "14px",
      })
      .setOrigin(0.5)
      .setDepth(13)
      .setInteractive({ useHandCursor: true });
    delLbl.on("pointerdown", () => {
      if (confirm("Hapus data simpan?")) {
        GameState.clearSave();
        bg.destroy();
        lbl.destroy();
        zone.destroy();
        delG.destroy();
        delLbl.destroy();
      }
    });
  }

  _showSettings() {
    const W = CFG.WIDTH,
      H = CFG.HEIGHT;
    const objs = [];

    const overlay = this.add.graphics().setDepth(50);
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, W, H);
    objs.push(overlay);

    const panel = this.add.graphics().setDepth(51);
    panel.fillStyle(CFG.C.PANEL, 0.95);
    panel.fillRoundedRect(W / 2 - 185, H / 2 - 150, 370, 300, 14);
    DrawUtils.sulselBorder(panel, W / 2 - 185, H / 2 - 150, 370, 300, 0.8);
    objs.push(panel);

    const title = this.add
      .text(W / 2, H / 2 - 132, "⚙  Pengaturan", {
        ...CFG.F.SUBTITLE,
        color: "#FFD700",
      })
      .setOrigin(0.5)
      .setDepth(52);
    objs.push(title);

    // ── Toggle BGM ─────────────────────────────────────────────────
    const _makeToggle = (label, y, isOn, onToggle) => {
      const lbl = this.add
        .text(W / 2 - 90, y, label, {
          fontFamily: "Arial",
          fontSize: "15px",
          color: "#CCCCCC",
        })
        .setDepth(52);
      objs.push(lbl);

      const btnG = this.add.graphics().setDepth(52);
      const btnT = this.add
        .text(W / 2 + 50, y + 1, "", {
          fontFamily: "Arial",
          fontSize: "14px",
          fontStyle: "bold",
        })
        .setDepth(53)
        .setInteractive({ useHandCursor: true });
      objs.push(btnG);
      objs.push(btnT);

      const redraw = (on) => {
        btnG.clear();
        btnG.fillStyle(on ? 0x22aa55 : 0x882222, 0.9);
        btnG.fillRoundedRect(W / 2 + 40, y - 3, 90, 26, 8);
        btnT.setText(on ? "🔊  NYALA" : "🔇  MATI");
        btnT.setColor(on ? "#44FF88" : "#FF8888");
        btnT.setX(W / 2 + 85).setOrigin(0.5, 0);
      };
      redraw(isOn);

      let state = isOn;
      btnT.on("pointerdown", () => {
        AudioManager.sfxClick();
        state = onToggle();
        redraw(state);
      });
      btnT.on("pointerover", () => btnG.setAlpha(0.6));
      btnT.on("pointerout", () => btnG.setAlpha(1));
    };

    _makeToggle("🎵  Musik (BGM)", H / 2 - 90, AudioManager.isBGMOn(), () =>
      AudioManager.toggleBGM(),
    );
    _makeToggle("🔔  Efek Suara", H / 2 - 45, AudioManager.isSFXOn(), () =>
      AudioManager.toggleSFX(),
    );

    // ── Divider ────────────────────────────────────────────────────
    const divG = this.add.graphics().setDepth(52);
    divG.lineStyle(1, 0x555555, 0.7);
    divG.lineBetween(W / 2 - 160, H / 2 + 5, W / 2 + 160, H / 2 + 5);
    objs.push(divG);

    // ── Info mikrofon ──────────────────────────────────────────────
    const info = this.add
      .text(
        W / 2,
        H / 2 + 40,
        "🎤  Mikrofon\nIzinkan akses mikrofon di browser untuk\nfitur TERIAK! yang lebih imersif.\nJika tidak tersedia, tombol TERIAK!\nakan muncul otomatis saat gameplay.",
        {
          fontFamily: "Arial",
          fontSize: "13px",
          color: "#AAAAAA",
          align: "center",
          wordWrap: { width: 330 },
          lineSpacing: 3,
        },
      )
      .setOrigin(0.5)
      .setDepth(52);
    objs.push(info);

    // ── Tutup ──────────────────────────────────────────────────────
    const closeBtn = this.add
      .text(W / 2, H / 2 + 128, "[ TUTUP ]", {
        ...CFG.F.BUTTON,
        color: "#FFD700",
      })
      .setOrigin(0.5)
      .setDepth(52)
      .setInteractive({ useHandCursor: true });
    objs.push(closeBtn);
    closeBtn.on("pointerdown", () => {
      AudioManager.sfxClick();
      objs.forEach((o) => o.destroy());
    });
  }

  _showQuitConfirm() {
    const W = CFG.WIDTH,
      H = CFG.HEIGHT;
    const overlay = this.add.graphics().setDepth(50);
    overlay.fillStyle(0x000000, 0.75);
    overlay.fillRect(0, 0, W, H);

    const txt = this.add
      .text(
        W / 2,
        H / 2 - 20,
        "Yakin ingin restart game?\n(Semua progres akan hilang)",
        {
          ...CFG.F.SUBTITLE,
          align: "center",
          wordWrap: { width: 340 },
        },
      )
      .setOrigin(0.5)
      .setDepth(51);

    const yes = this.add
      .text(W / 2 - 70, H / 2 + 40, "[ YA, RESTART ]", {
        ...CFG.F.BUTTON,
        color: "#FF4444",
      })
      .setOrigin(0.5)
      .setDepth(51)
      .setInteractive({ useHandCursor: true });

    const no = this.add
      .text(W / 2 + 70, H / 2 + 40, "[ BATAL ]", {
        ...CFG.F.BUTTON,
        color: "#44FF88",
      })
      .setOrigin(0.5)
      .setDepth(51)
      .setInteractive({ useHandCursor: true });

    yes.on("pointerdown", () => window.location.reload());
    no.on("pointerdown", () => {
      [overlay, txt, yes, no].forEach((o) => o.destroy());
    });
  }

  _drawDecorativeStars() {
    const W = CFG.WIDTH,
      H = CFG.HEIGHT;
    const g = this.add.graphics().setDepth(1);
    g.fillStyle(CFG.C.GOLD, 0.3);
    for (let i = 0; i < 20; i++) {
      const sx = Phaser.Math.Between(0, W);
      const sy = Phaser.Math.Between(0, H);
      g.fillCircle(sx, sy, Phaser.Math.Between(1, 2));
    }
  }
}
