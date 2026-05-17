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

  _showSettings() {
    const W = CFG.WIDTH,
      H = CFG.HEIGHT;
    const overlay = this.add.graphics().setDepth(50);
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, W, H);

    const panel = this.add.graphics().setDepth(51);
    panel.fillStyle(CFG.C.PANEL, 0.95);
    panel.fillRoundedRect(W / 2 - 180, H / 2 - 120, 360, 240, 14);
    DrawUtils.sulselBorder(panel, W / 2 - 180, H / 2 - 120, 360, 240, 0.8);

    const title = this.add
      .text(W / 2, H / 2 - 100, "⚙ Pengaturan", {
        ...CFG.F.SUBTITLE,
        color: "#FFD700",
      })
      .setOrigin(0.5)
      .setDepth(52);

    const info = this.add
      .text(
        W / 2,
        H / 2 - 60,
        'Izinkan mikrofon di browser Anda\nuntuk fitur TERIAK! yang lebih imersif.\n\nJika tidak tersedia, gunakan tombol\n"TERIAK!" yang muncul saat gameplay.',
        { ...CFG.F.BODY, align: "center", wordWrap: { width: 320 } },
      )
      .setOrigin(0.5)
      .setDepth(52);

    const closeBtn = this.add
      .text(W / 2, H / 2 + 80, "[ TUTUP ]", {
        ...CFG.F.BUTTON,
        color: "#FFD700",
      })
      .setOrigin(0.5)
      .setDepth(52)
      .setInteractive({ useHandCursor: true });

    closeBtn.on("pointerdown", () => {
      [overlay, panel, title, info, closeBtn].forEach((o) => o.destroy());
    });
  }

  _showQuitConfirm() {
    const W = CFG.WIDTH,
      H = CFG.HEIGHT;
    const overlay = this.add.graphics().setDepth(50);
    overlay.fillStyle(0x000000, 0.75);
    overlay.fillRect(0, 0, W, H);

    const txt = this.add
      .text(W / 2, H / 2 - 20, "Yakin ingin keluar dari game?", CFG.F.SUBTITLE)
      .setOrigin(0.5)
      .setDepth(51);

    const yes = this.add
      .text(W / 2 - 70, H / 2 + 30, "[ YA ]", {
        ...CFG.F.BUTTON,
        color: "#FF4444",
      })
      .setOrigin(0.5)
      .setDepth(51)
      .setInteractive({ useHandCursor: true });

    const no = this.add
      .text(W / 2 + 70, H / 2 + 30, "[ TIDAK ]", {
        ...CFG.F.BUTTON,
        color: "#44FF88",
      })
      .setOrigin(0.5)
      .setDepth(51)
      .setInteractive({ useHandCursor: true });

    yes.on("pointerdown", () => window.close());
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
