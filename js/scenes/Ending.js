// Ending.js — Layar ending bahagia
class Ending extends Phaser.Scene {
  constructor() {
    super({ key: "Ending" });
  }

  create() {
    this.cameras.main.fadeIn(800);
    const W = CFG.WIDTH,
      H = CFG.HEIGHT;

    // Latar: sore hari — langit cerah sunset
    const bg = this.add.graphics();
    bg.fillGradientStyle(0xff9b5e, 0xff9060, 0x1a1050, 0x2a1060, 1);
    bg.fillRect(0, 0, W, H);

    // Siluet bangunan sekolah
    bg.fillStyle(0x1a0a30);
    bg.fillRect(0, H * 0.72, W, H * 0.28);
    // Gedung sekolah utama
    bg.fillRect(300, H * 0.42, 200, H * 0.3);
    bg.fillTriangle(295, H * 0.42, 505, H * 0.42, 400, H * 0.26);
    // Jendela-jendela
    [
      [320, 0.5],
      [380, 0.5],
      [440, 0.5],
      [350, 0.6],
      [430, 0.6],
    ].forEach(([wx, wy]) => {
      bg.fillStyle(0xffd700, 0.4);
      bg.fillRect(wx, H * wy, 22, 18);
    });
    // Pohon
    [80, 180, 560, 680].forEach((tx) => {
      bg.fillStyle(0x1a0a30);
      bg.fillRect(tx, H * 0.55, 7, H * 0.17);
      bg.fillStyle(0x0d2010);
      bg.fillCircle(tx + 3, H * 0.52, 20);
    });
    // Refleksi sinar matahari di tanah
    bg.fillStyle(0xff9b5e, 0.18);
    bg.fillEllipse(W / 2, H * 0.73, W * 0.5, 20);

    // Bintang
    bg.fillStyle(0xffd700, 0.6);
    [
      [80, 30],
      [200, 20],
      [450, 35],
      [620, 22],
      [700, 40],
      [750, 15],
    ].forEach(([sx, sy]) => {
      bg.fillCircle(sx, sy, 2);
    });

    // Bulan penuh
    bg.fillStyle(0xffd700, 0.85);
    bg.fillCircle(W * 0.82, 45, 22);

    // Border motif
    const border = this.add.graphics();
    DrawUtils.sulselBorder(border, 8, 8, W - 16, H - 16, 0.9);

    // Rara di tengah — bahagia
    const raraGfx = this.add.graphics().setDepth(5);
    DrawUtils.rara(raraGfx, W * 0.5, H * 0.56, "idle");

    // Bintang-bintang melayang
    for (let i = 0; i < 12; i++) {
      const sg = this.add.graphics().setDepth(4);
      const sx = Phaser.Math.Between(30, W - 30);
      const sy = Phaser.Math.Between(30, H * 0.7);
      sg.fillStyle(CFG.C.GOLD, 0.8);
      sg.fillCircle(sx, sy, Phaser.Math.Between(2, 5));
      this.tweens.add({
        targets: sg,
        y: sy - Phaser.Math.Between(20, 50),
        alpha: 0,
        duration: Phaser.Math.Between(1500, 3000),
        delay: Phaser.Math.Between(0, 1500),
        yoyo: true,
        repeat: -1,
      });
    }

    // Teks utama
    const title = this.add
      .text(W / 2, H * 0.06, "🎉 SELAMAT! RARA SELAMAT! 🎉", {
        ...CFG.F.TITLE,
        fontSize: "22px",
        color: "#FFD700",
      })
      .setOrigin(0.5)
      .setAlpha(0);
    this.tweens.add({ targets: title, alpha: 1, duration: 1000 });

    const sub = this.add
      .text(W / 2, H * 0.14, '"Berani Bersuara, Berani Selamat"', {
        fontFamily: "Georgia, serif",
        fontSize: "16px",
        color: "#FFCCAA",
        fontStyle: "italic",
      })
      .setOrigin(0.5)
      .setAlpha(0);
    this.tweens.add({ targets: sub, alpha: 1, delay: 600, duration: 900 });

    // Panel cerita akhir
    const panG = this.add.graphics().setDepth(6);
    panG.fillStyle(CFG.C.PANEL, 0.9);
    panG.fillRoundedRect(W * 0.05, H * 0.64, W * 0.9, 115, 12);
    DrawUtils.sulselBorder(panG, W * 0.05, H * 0.64, W * 0.9, 115, 0.8);

    // Fix #7: Cerita branching berdasarkan pilihan pemain
    const grade = GameState.grade();
    const story = ["Rara berhasil sampai di sekolah dengan selamat."];
    if (GameState.pathChoice === "safe") {
      story.push(
        "Memilih jalan ramai adalah keputusan cerdas Rara \u2014 jalan aman selalu lebih baik.",
      );
    } else if (GameState.pathChoice === "dangerous") {
      story.push(
        "Meski sempat tergoda jalan sepi, Rara berhasil waspada dan selamat.",
      );
    } else {
      story.push(
        "Dia ceritain semua kejadian ke ortu dan guru. Berani banget!",
      );
    }
    if (GameState.platChecked) {
      story.push(
        "\u2713 Kebiasaan mengecek plat kendaraan ojol menyelamatkan Rara dari bahaya!",
      );
    }
    if (GameState.screenshotTaken) {
      story.push(
        "\u2713 Screenshot bukti yang diambil Rara membantu polisi menangkap pelaku.",
      );
    }
    if (!GameState.platChecked && !GameState.screenshotTaken) {
      story.push("Berkat keberanian Rara, pelaku dilaporkan ke polisi.");
    }
    // Penutup berdasarkan nilai
    if (grade.label.includes("PAHLAWAN")) {
      story.push(
        '🦦 "Pilihan terbaik Rara menginspirasi teman-temannya untuk berani bersuara!"',
      );
    } else if (grade.label === "Sang Jagoan") {
      story.push('"Berani bersuara adalah tanda kekuatan!" — Rara 🦦');
    } else {
      story.push(
        '"Setiap hari adalah kesempatan untuk belajar menjadi lebih aman." \u2014 Rara',
      );
    }

    story.forEach((line, i) => {
      const txt = this.add
        .text(W * 0.5, H * 0.66 + i * 24, line, {
          fontFamily: "Arial",
          fontSize: "12px",
          color:
            i === 0
              ? "#FFFFFF"
              : i === story.length - 1
                ? "#FFD700"
                : "#FFFFCC",
          align: "center",
          wordWrap: { width: W * 0.8 },
        })
        .setOrigin(0.5)
        .setDepth(7)
        .setAlpha(0);
      this.tweens.add({
        targets: txt,
        alpha: 1,
        delay: 1000 + i * 300,
        duration: 600,
      });
    });

    // Pesan edukatif + hotline (Fix #5: hotline dalam kotak terpisah lebih menonjol)
    const compG = this.add.graphics().setDepth(7);
    compG.fillStyle(0x001a44, 0.9);
    compG.fillRoundedRect(W * 0.06, H * 0.87, W * 0.88, 48, 10);
    compG.lineStyle(2, 0x55aaff, 0.9);
    compG.strokeRoundedRect(W * 0.06, H * 0.87, W * 0.88, 48, 10);
    const compLbl = this.add
      .text(
        W / 2,
        H * 0.87 + 7,
        "\ud83c\udfc6 Kamu sudah menyelesaikan RARA: Jaga Dirimu!",
        {
          fontFamily: "Arial",
          fontSize: "11px",
          color: "#88CCFF",
        },
      )
      .setOrigin(0.5)
      .setDepth(8)
      .setAlpha(0);
    const hotlineLbl = this.add
      .text(
        W / 2,
        H * 0.87 + 22,
        "\ud83d\udcde BANTUAN: Hotline Anak 129  \u2502  Polisi 110",
        {
          fontFamily: "Arial",
          fontSize: "14px",
          color: "#FFFFFF",
          fontStyle: "bold",
          stroke: "#001144",
          strokeThickness: 2,
        },
      )
      .setOrigin(0.5)
      .setDepth(8)
      .setAlpha(0);
    this.tweens.add({
      targets: [compG, compLbl, hotlineLbl],
      alpha: 1,
      delay: 2500,
      duration: 800,
    });

    // Tombol menu/replay
    this.time.delayedCall(2800, () => {
      const btnG = this.add.graphics().setScrollFactor(0).setDepth(10);
      btnG.fillStyle(CFG.C.AMAN, 0.85);
      btnG.fillRoundedRect(W / 2 - 100, H * 0.92, 200, 36, 10);

      this.add
        .text(W / 2, H * 0.92 + 18, "▶ KEMBALI KE MENU", {
          ...CFG.F.BUTTON,
          color: "#FFF",
        })
        .setOrigin(0.5)
        .setDepth(11)
        .setInteractive({ useHandCursor: true })
        .on("pointerdown", () => {
          this.cameras.main.fadeOut(500);
          this.time.delayedCall(500, () => this.scene.start("Menu"));
        });
    });
  }
}
