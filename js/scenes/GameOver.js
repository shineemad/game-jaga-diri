// GameOver.js — Layar game over dengan pesan edukatif
class GameOver extends Phaser.Scene {
  constructor() {
    super({ key: "GameOver" });
  }

  init(data) {
    this._fromDay = data ? data.fromDay || 1 : 1;
  }

  create() {
    this.cameras.main.fadeIn(600);
    const W = CFG.WIDTH,
      H = CFG.HEIGHT;

    // ── Background ────────────────────────────────────────────────────
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x330000, 0x330000, 0x0d0000, 0x0d0000, 1);
    bg.fillRect(0, 0, W, H);
    for (let r = 300; r > 0; r -= 30) {
      bg.fillStyle(0x000000, 0.04);
      bg.fillCircle(W / 2, H / 2, r);
    }
    DrawUtils.sulselBorder(this.add.graphics(), 8, 8, W - 16, H - 16, 0.6);

    // ── Ikon 💔 ───────────────────────────────────────────────────────
    const iconTxt = this.add
      .text(W / 2, 14, "💔", { fontSize: "40px" })
      .setOrigin(0.5, 0);
    this.tweens.add({
      targets: iconTxt,
      scaleX: 1.15,
      scaleY: 1.15,
      duration: 600,
      yoyo: true,
      repeat: -1,
    });

    // ── Judul ─────────────────────────────────────────────────────────
    this.add
      .text(W / 2, 60, "RARA BUTUH BANTUAN...", {
        ...CFG.F.TITLE,
        fontSize: "22px",
        color: "#FF4444",
      })
      .setOrigin(0.5, 0);

    // ── Karakter Rara (posisi kiri, tidak tumpang tindih teks) ────────
    const raraGfx = this.add.graphics().setDepth(5);
    DrawUtils.rara(raraGfx, W * 0.18, H * 0.3, "scared");

    // ── Deskripsi (kanan Rara) ────────────────────────────────────────
    this.add
      .text(
        W * 0.35,
        H * 0.22,
        `Rara tidak selamat di Hari ${this._fromDay}.\nJangan menyerah!\nSetiap kesalahan adalah\npelajaran berharga.`,
        {
          fontFamily: "Arial",
          fontSize: "13px",
          color: "#FFAAAA",
          lineSpacing: 4,
          wordWrap: { width: W * 0.6 },
        },
      )
      .setOrigin(0, 0);

    // ── Panel tips ────────────────────────────────────────────────────
    const panelY = H * 0.5;
    const panelH = 118;
    const panG = this.add.graphics().setDepth(4);
    panG.fillStyle(0x220000, 0.9);
    panG.fillRoundedRect(16, panelY, W - 32, panelH, 10);
    panG.lineStyle(2, 0xff4444, 0.6);
    panG.strokeRoundedRect(16, panelY, W - 32, panelH, 10);

    this.add
      .text(W / 2, panelY + 10, "💡  Yang Perlu Diingat:", {
        fontFamily: "Arial",
        fontSize: "13px",
        color: "#FFD700",
        fontStyle: "bold",
      })
      .setOrigin(0.5, 0)
      .setDepth(5);

    const tips = [
      "• Bersuara keras dan minta bantuan saat terancam",
      "• Jangan menerima ajakan dari orang yang tidak dikenal",
      "• Ceritakan pada orang tua jika ada yang membuatmu tidak nyaman",
    ];
    tips.forEach((t, i) => {
      this.add
        .text(26, panelY + 32 + i * 26, t, {
          fontFamily: "Arial",
          fontSize: "12px",
          color: "#FFCCCC",
          wordWrap: { width: W - 52 },
        })
        .setDepth(5);
    });

    // ── Nomor darurat (Fix #5: lebih menonjol) ────────────────────────
    const hotY = panelY + panelH + 10;
    const hotG = this.add.graphics().setDepth(5);
    hotG.fillStyle(0x001144, 0.92);
    hotG.fillRoundedRect(W / 2 - 175, hotY, 350, 44, 10);
    hotG.lineStyle(2, 0x44aaff, 0.85);
    hotG.strokeRoundedRect(W / 2 - 175, hotY, 350, 44, 10);
    this.add
      .text(W / 2, hotY + 7, "📞 BANTUAN & DARURAT", {
        fontFamily: "Arial",
        fontSize: "12px",
        color: "#88CCFF",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(6);
    this.add
      .text(W / 2, hotY + 24, "Hotline Anak: 129   |   Polisi: 110", {
        fontFamily: "Arial",
        fontSize: "14px",
        color: "#FFFFFF",
        fontStyle: "bold",
        stroke: "#0033AA",
        strokeThickness: 2,
      })
      .setOrigin(0.5)
      .setDepth(6);

    // ── Tombol ────────────────────────────────────────────────────────
    const btnY = H - 50;
    this._makeBtn(
      W / 2 - 145,
      btnY,
      130,
      38,
      "\u21ba  COBA LAGI",
      CFG.C.NEUTRAL,
      () => {
        GameState.lives = GameState.maxLives;
        // Fix #2: gunakan checkpoint untuk skip prolog jika sudah pernah melihatnya
        let scene;
        if (this._fromDay === 1) {
          scene = "Prolog1";
        } else if (this._fromDay === 2) {
          scene = GameState.checkpoints.d2 ? "Day2" : "Prolog2";
        } else {
          scene = GameState.checkpoints.d3 ? "Day3" : "Prolog3";
        }
        this.cameras.main.fadeOut(400);
        this.time.delayedCall(400, () => this.scene.start(scene));
      },
    );
    this._makeBtn(W / 2 + 15, btnY, 130, 38, "⌂  MENU", CFG.C.PRIMARY, () => {
      GameState.reset();
      this.cameras.main.fadeOut(400);
      this.time.delayedCall(400, () => this.scene.start("Menu"));
    });
  }

  _makeBtn(x, y, w, h, label, color, cb) {
    // Grafis tombol
    const g = this.add.graphics().setDepth(8);
    g.fillStyle(color, 0.9);
    g.fillRoundedRect(x, y, w, h, 10);
    g.lineStyle(2, 0xffffff, 0.4);
    g.strokeRoundedRect(x, y, w, h, 10);

    // Label teks
    this.add
      .text(x + w / 2, y + h / 2, label, {
        ...CFG.F.BUTTON,
        fontSize: "14px",
      })
      .setOrigin(0.5)
      .setDepth(9);

    // Zone interaktif (posisi absolut, scrollFactor(0) tidak diperlukan karena
    // scene GameOver tidak scrolling, tapi zone lebih andal daripada setInteractive)
    this.add
      .zone(x, y, w, h)
      .setOrigin(0)
      .setDepth(10)
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => {
        g.setAlpha(0.7);
      })
      .on("pointerout", () => {
        g.setAlpha(1);
      })
      .on("pointerdown", cb);
  }
}
