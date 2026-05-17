// Boot.js — Scene pertama: memuat & inisialisasi
class Boot extends Phaser.Scene {
  constructor() {
    super({ key: "Boot" });
  }

  preload() {
    // Tidak ada asset eksternal — semua digambar secara prosedural
    // Tampilkan layar loading sederhana
    const W = CFG.WIDTH,
      H = CFG.HEIGHT;
    const loadTxt = this.add
      .text(W / 2, H / 2 - 20, "MEMUAT...", {
        fontFamily: "Arial",
        fontSize: "22px",
        color: "#FFD700",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    const bar = this.add.graphics();
    bar.fillStyle(0x333333);
    bar.fillRect(W / 2 - 160, H / 2 + 20, 320, 18);

    this.load.on("progress", (v) => {
      bar.clear();
      bar.fillStyle(0x333333);
      bar.fillRect(W / 2 - 160, H / 2 + 20, 320, 18);
      bar.fillStyle(CFG.C.GOLD);
      bar.fillRect(W / 2 - 160, H / 2 + 20, 320 * v, 18);
    });

    // Buat satu texture placeholder (1x1 putih) agar Phaser tidak protes
    const canvas = this.textures.createCanvas("__px", 1, 1);
    canvas.context.fillStyle = "#fff";
    canvas.context.fillRect(0, 0, 1, 1);
    canvas.refresh();

    // Tips keselamatan acak selama loading
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
      .text(W / 2, H / 2 + 52, tip, {
        fontFamily: "Arial",
        fontSize: "13px",
        color: "#FFCC88",
        align: "center",
        wordWrap: { width: W - 60 },
      })
      .setOrigin(0.5);
  }

  create() {
    // Delay singkat agar loading screen terlihat, lalu mulai Splash
    this.time.delayedCall(600, () => this.scene.start("Splash"));
  }
}
