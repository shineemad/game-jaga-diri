// Splash.js — Layar pembuka game
class Splash extends Phaser.Scene {
  constructor() {
    super({ key: "Splash" });
  }

  create() {
    const W = CFG.WIDTH,
      H = CFG.HEIGHT;

    this._gone = false;

    // ── Background gradient ungu gelap ──────────────────────────────────
    const bg = this.add.graphics();
    bg.fillStyle(0x080010);
    bg.fillRect(0, 0, W, H);
    bg.fillGradientStyle(0x2d1b69, 0x2d1b69, 0x080010, 0x080010, 1);
    bg.fillRect(0, 0, W, H);

    // ── Cahaya glow di tengah ────────────────────────────────────────────
    const glow = this.add.graphics();
    glow.fillStyle(0x7c3aed, 0.12);
    glow.fillCircle(W / 2, H * 0.42, 210);
    glow.fillStyle(0xa855f7, 0.06);
    glow.fillCircle(W / 2, H * 0.42, 270);

    // ── Border bersih ───────────────────────────────────────────────────
    const border = this.add.graphics();
    DrawUtils.drawBorder(border, 8, 8, W - 16, H - 16, 0.8);

    // ── Bintang latar ───────────────────────────────────────────────────
    for (let i = 0; i < 40; i++) {
      const sg = this.add.graphics();
      const sx = Phaser.Math.Between(10, W - 10);
      const sy = Phaser.Math.Between(10, H - 10);
      sg.fillStyle(0xffffff, Phaser.Math.FloatBetween(0.15, 0.6));
      sg.fillCircle(sx, sy, Phaser.Math.Between(1, 2));
      this.tweens.add({
        targets: sg,
        alpha: 0.05,
        duration: Phaser.Math.Between(1000, 3000),
        yoyo: true,
        repeat: -1,
        delay: Phaser.Math.Between(0, 2000),
      });
    }

    // ── Karakter Rara ────────────────────────────────────────────────────
    const raraGfx = this.add.graphics().setDepth(5).setAlpha(0);
    DrawUtils.rara(raraGfx, W / 2, H * 0.44, "idle");
    this.tweens.add({ targets: raraGfx, alpha: 1, delay: 300, duration: 800 });
    this.tweens.add({
      targets: raraGfx,
      scaleX: 1.04,
      scaleY: 1.04,
      delay: 1200,
      duration: 1400,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // ── Judul RARA ───────────────────────────────────────────────────────
    const titleTxt = this.add
      .text(W / 2, H * 0.13, "RARA", {
        fontFamily: "Georgia, serif",
        fontSize: "72px",
        color: "#FFD700",
        fontStyle: "bold",
        stroke: "#2D1B69",
        strokeThickness: 6,
      })
      .setOrigin(0.5)
      .setAlpha(0);
    this.tweens.add({
      targets: titleTxt,
      alpha: 1,
      y: H * 0.11,
      duration: 900,
      ease: "Power2",
    });

    // ── Subtitle ─────────────────────────────────────────────────────────
    const subtitleTxt = this.add
      .text(W / 2, H * 0.24, "Jaga Dirimu!", {
        fontFamily: "Georgia, serif",
        fontSize: "28px",
        color: "#E9D5FF",
        fontStyle: "bold italic",
        stroke: "#080010",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setAlpha(0);
    this.tweens.add({
      targets: subtitleTxt,
      alpha: 1,
      delay: 500,
      duration: 700,
    });

    // ── Tag line ─────────────────────────────────────────────────────────
    const tagTxt = this.add
      .text(W / 2, H * 0.66, "Game Edukasi Keselamatan Anak Indonesia", {
        fontFamily: "Arial",
        fontSize: "14px",
        color: "#C4B5FD",
      })
      .setOrigin(0.5)
      .setAlpha(0);
    this.tweens.add({ targets: tagTxt, alpha: 1, delay: 900, duration: 600 });

    // ── Ikon informasi singkat ────────────────────────────────────────────
    [
      { icon: "🛡", text: "Kenali Bahaya", x: W * 0.22 },
      { icon: "💬", text: "Berani Bicara", x: W * 0.5 },
      { icon: "🆘", text: "Minta Bantuan", x: W * 0.78 },
    ].forEach((ic, i) => {
      const ig = this.add
        .text(ic.x, H * 0.74, ic.icon, { fontSize: "24px" })
        .setOrigin(0.5)
        .setAlpha(0);
      const il = this.add
        .text(ic.x, H * 0.8, ic.text, {
          fontFamily: "Arial",
          fontSize: "12px",
          color: "#DDD6FE",
        })
        .setOrigin(0.5)
        .setAlpha(0);
      this.tweens.add({
        targets: [ig, il],
        alpha: 1,
        delay: 1100 + i * 150,
        duration: 500,
      });
    });

    // ── Tombol mulai ──────────────────────────────────────────────────────
    const btnBg = this.add.graphics().setDepth(10).setAlpha(0);
    btnBg.fillStyle(0x7c3aed, 0.85);
    btnBg.fillRoundedRect(W / 2 - 130, H * 0.875, 260, 40, 20);
    btnBg.lineStyle(2, 0xffd700);
    btnBg.strokeRoundedRect(W / 2 - 130, H * 0.875, 260, 40, 20);

    const pressStart = this.add
      .text(W / 2, H * 0.875 + 20, "▶  KLIK / ENTER UNTUK MULAI", {
        fontFamily: "Arial",
        fontSize: "15px",
        color: "#FFD700",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(11)
      .setAlpha(0)
      .setInteractive({ useHandCursor: true });

    this.tweens.add({
      targets: [btnBg, pressStart],
      alpha: 1,
      delay: 1400,
      duration: 600,
      onComplete: () => {
        this.tweens.add({
          targets: [btnBg, pressStart],
          alpha: 0.5,
          duration: 700,
          yoyo: true,
          repeat: -1,
        });
      },
    });

    pressStart.on("pointerover", () => pressStart.setColor("#FFFFFF"));
    pressStart.on("pointerout", () => pressStart.setColor("#FFD700"));
    pressStart.on("pointerdown", () => this._goMenu());

    // Input: klik mana saja ATAU tekan tombol
    this.time.delayedCall(1500, () => {
      this.input.once("pointerdown", () => this._goMenu());
      this.input.keyboard.once("keydown", () => this._goMenu());
    });

    // Auto-proceed setelah 5 detik
    this.time.delayedCall(5000, () => this._goMenu());
  }

  _goMenu() {
    if (this._gone) return;
    this._gone = true;
    this.cameras.main.fadeOut(500);
    this.time.delayedCall(500, () => this.scene.start("Menu"));
  }
}
