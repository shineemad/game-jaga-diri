class Boot extends Phaser.Scene {
  constructor() {
    super({ key: "Boot" });
  }

  preload() {
    const W = CFG.WIDTH,
      H = CFG.HEIGHT;

    // Background gelap
    const bg = this.add.graphics();
    bg.fillStyle(0x080010);
    bg.fillRect(0, 0, W, H);

    this.add
      .text(W / 2, H / 2 - 40, "RARA: Jaga Dirimu!", {
        fontFamily: "Georgia, serif",
        fontSize: "24px",
        color: "#FFD700",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.add
      .text(W / 2, H / 2 - 12, "MEMUAT...", {
        fontFamily: "Arial",
        fontSize: "14px",
        color: "#AAAAAA",
      })
      .setOrigin(0.5);

    // Track bar — simpan referensi untuk animasi di create()
    const barBg = this.add.graphics();
    barBg.fillStyle(0x222222);
    barBg.fillRoundedRect(W / 2 - 160, H / 2 + 12, 320, 14, 5);

    this._barFill = this.add.graphics();
    this._barW = 320;
    this._barX = W / 2 - 160;
    this._barY = H / 2 + 12;

    // Tips keselamatan acak
    const tips = [
      "💡 Jangan pernah ikut orang yang tidak kamu kenal!",
      "📢 Berteriaklah KERAS jika merasa tidak aman!",
      "📱 Nomor darurat: Polisi 110 | Kemensos 129",
      "🛡 Ceritakan ke orang tua jika ada yang mencurigakan!",
      "🚫 Jangan terima hadiah atau makanan dari orang asing!",
      "🏃 Lari ke tempat ramai jika dikejar atau diancam!",
      "📸 Screenshot bukti jika ada pesan mencurigakan di HP!",
    ];
    const tip = tips[Math.floor(Math.random() * tips.length)];
    this.add
      .text(W / 2, H / 2 + 44, tip, {
        fontFamily: "Arial",
        fontSize: "13px",
        color: "#FFCC88",
        align: "center",
        wordWrap: { width: W - 80 },
      })
      .setOrigin(0.5);

    // Buat texture placeholder
    const canvas = this.textures.createCanvas("__px", 1, 1);
    canvas.context.fillStyle = "#fff";
    canvas.context.fillRect(0, 0, 1, 1);
    canvas.refresh();
  }

  create() {
    // Animasi bar mengisi perlahan ~800ms, lalu pindah ke Splash
    let pct = 0;
    const bx = this._barX,
      by = this._barY,
      bw = this._barW;
    const fill = this._barFill;

    const tick = this.time.addEvent({
      delay: 32,
      repeat: 27,
      callback: () => {
        pct = Math.min(1, pct + 0.032 + Math.random() * 0.02);
        fill.clear();
        fill.fillStyle(CFG.C.GOLD);
        fill.fillRoundedRect(bx, by, bw * pct, 14, 5);
      },
    });

    this.time.delayedCall(1000, () => this.scene.start("Splash"));
  }
}
