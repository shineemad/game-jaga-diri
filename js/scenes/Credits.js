// Credits.js — Kredit & pesan edukasi KAN
class Credits extends Phaser.Scene {
  constructor() {
    super({ key: "Credits" });
  }

  create() {
    const W = CFG.WIDTH,
      H = CFG.HEIGHT;
    this.cameras.main.fadeIn(400);

    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a0a00, 0x1a0a00, 0x0d0505, 0x0d0505, 1);
    bg.fillRect(0, 0, W, H);

    DrawUtils.sulselBorder(this.add.graphics(), 8, 8, W - 16, H - 16, 0.8);

    this.add
      .text(W / 2, 30, "★ KREDIT & PESAN EDUKASI ★", CFG.F.TITLE)
      .setOrigin(0.5)
      .setFontSize("24px");

    const lines = [
      { t: "❤ Tentang Game", s: "bold", c: "#FFD700" },
      {
        t: '"RARA: Jaga Dirimu!" adalah game edukasi untuk membantu',
        s: "normal",
        c: "#EEE",
      },
      {
        t: "anak-anak Indonesia mengenali dan menghindari",
        s: "normal",
        c: "#EEE",
      },
      {
        t: "kekerasan seksual, grooming, dan bahaya orang asing.",
        s: "normal",
        c: "#EEE",
      },
      { t: "" },
      { t: "❤ Tim Pengembang", s: "bold", c: "#FFD700" },
      {
        t: "Desain & Cerita  : Tim Pengembang Game Edukasi",
        s: "normal",
        c: "#DDD",
      },
      { t: "Pemrograman      : Phaser 3 (JavaScript)", s: "normal", c: "#DDD" },
      { t: "Ilustrasi        : Prosedural / Canvas", s: "normal", c: "#DDD" },
      { t: "" },
      { t: "❤ Nomor Darurat", s: "bold", c: "#FF8888" },
      { t: "Hotline Anak (KEMENPPPA) : 129", s: "normal", c: "#FFAAAA" },
      { t: "KPAI                     : 021-31901556", s: "normal", c: "#FFAAAA" },
      { t: "Polisi                   : 110", s: "normal", c: "#FFAAAA" },
      { t: "" },
      { t: "❤ Teknologi", s: "bold", c: "#FFD700" },
      { t: "Game ini menggunakan grafis prosedural", s: "normal", c: "#DDD" },
      { t: "murni tanpa aset gambar eksternal.", s: "normal", c: "#DDD" },
    ];

    let yy = 70;
    lines.forEach((line) => {
      if (!line.t) {
        yy += 8;
        return;
      }
      this.add
        .text(W / 2, yy, line.t, {
          fontFamily: "Arial",
          fontSize: line.s === "bold" ? "16px" : "13px",
          color: line.c || "#FFFFFF",
          fontStyle: line.s === "bold" ? "bold" : "normal",
          align: "center",
        })
        .setOrigin(0.5);
      yy += line.s === "bold" ? 22 : 17;
    });

    // Tombol kembali
    const backBtn = this.add
      .text(W / 2, H - 25, "◀ KEMBALI KE MENU", {
        ...CFG.F.BUTTON,
        color: "#FFD700",
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    backBtn.on("pointerover", () => backBtn.setAlpha(0.7));
    backBtn.on("pointerout", () => backBtn.setAlpha(1));
    backBtn.on("pointerdown", () => {
      this.cameras.main.fadeOut(300);
      this.time.delayedCall(300, () => this.scene.start("Menu"));
    });

    this.input.keyboard.once("keydown-ESC", () => {
      this.cameras.main.fadeOut(300);
      this.time.delayedCall(300, () => this.scene.start("Menu"));
    });
  }
}
