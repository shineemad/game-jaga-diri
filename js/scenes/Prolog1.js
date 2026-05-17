// Prolog1.js — Pembukaan cerita Hari 1
class Prolog1 extends Phaser.Scene {
  constructor() {
    super({ key: "Prolog1" });
  }

  create() {
    GameState.day = 1;
    this.cameras.main.fadeIn(500);
    this._panels = [
      {
        bg: 0x87ceeb,
        img: "morning",
        title: "Hari 1: Jalan Kaki ke Sekolah",
        text: 'Pagi hari di sebuah jalan menuju sekolah.\nRara, gadis 12 tahun berbaju ungu,\nbersiap berangkat ke SMP Harapan.\n"Hati-hati di jalan, Rara!" kata Ibu.',
      },
      {
        bg: 0x5ba0c8,
        img: "street",
        title: "Kenali Batas",
        text: "Di luar rumah, banyak orang lalu-lalang.\nTidak semua orang asing bisa dipercaya.\nRara harus waspada dan berani bersuara\njika ada yang membuatnya tidak nyaman.",
      },
      {
        bg: 0x4a7a9b,
        img: "rara_stand",
        title: "Panduan Bermain",
        text: "⬅⬆⬇⬆ Arah: gerakkan Rara\n[SPASI] atau klik tombol: berinteraksi\n[TERIAK!]: usir orang asing yang mendekat\n\nNyawa Rara ada 3. Hati-hati!",
      },
    ];
    this._idx = 0;
    this._buildPanel();
    this.input.on("pointerdown", () => this._next());
    this.input.keyboard.on("keydown-SPACE", () => this._next());
    this.input.keyboard.on("keydown-ENTER", () => this._next());
  }

  _buildPanel() {
    this.children.removeAll(true);
    this.cameras.main.fadeIn(300);

    const W = CFG.WIDTH,
      H = CFG.HEIGHT;
    const p = this._panels[this._idx];

    // Background warna
    const bg = this.add.graphics();
    bg.fillStyle(p.bg);
    bg.fillRect(0, 0, W, H);

    // Ilustrasi sederhana berdasarkan konten
    this._drawIllustration(p.img);

    // Panel teks bawah
    const panelG = this.add.graphics();
    panelG.fillStyle(CFG.C.PANEL, 0.92);
    panelG.fillRoundedRect(20, H - 190, W - 40, 180, 14);
    DrawUtils.sulselBorder(panelG, 20, H - 190, W - 40, 180, 0.8);

    // Indikator halaman
    this.add
      .text(W - 30, H - 185, `${this._idx + 1}/${this._panels.length}`, {
        ...CFG.F.SMALL,
        color: "#FFD700",
      })
      .setOrigin(1, 0);

    this.add.text(40, H - 178, p.title, {
      fontFamily: "Arial",
      fontSize: "17px",
      color: "#FFD700",
      fontStyle: "bold",
    });

    this.add.text(40, H - 153, p.text, {
      fontFamily: "Arial",
      fontSize: "14px",
      color: "#FFFFFF",
      wordWrap: { width: W - 90 },
      lineSpacing: 4,
    });

    // Hint lanjut
    const hint = this.add
      .text(W - 30, H - 22, "▶ KETUK UNTUK LANJUT", {
        ...CFG.F.SMALL,
        color: "#FFD700",
      })
      .setOrigin(1, 1);
    this.tweens.add({
      targets: hint,
      alpha: 0.3,
      duration: 700,
      yoyo: true,
      repeat: -1,
    });
  }

  _drawIllustration(type) {
    const W = CFG.WIDTH,
      H = CFG.HEIGHT;
    const g = this.add.graphics();

    switch (type) {
      case "morning": {
        // Langit pagi
        g.fillStyle(0xff6b35, 0.4);
        g.fillRect(0, 0, W, H * 0.5);
        g.fillStyle(0x8b4513);
        g.fillRect(0, H * 0.55, W, H * 0.4);
        // Matahari terbit
        g.fillStyle(0xffd700, 0.8);
        g.fillCircle(W * 0.8, H * 0.2, 35);
        // Siluet rumah
        g.fillStyle(0x1a0a00);
        g.fillRect(60, H * 0.35, 100, H * 0.2);
        g.fillTriangle(55, H * 0.35, 165, H * 0.35, 110, H * 0.18);
        g.fillRect(230, H * 0.38, 80, H * 0.17);
        g.fillTriangle(225, H * 0.38, 315, H * 0.38, 270, H * 0.24);
        // Rara
        DrawUtils.rara(g, W * 0.5, H * 0.47, "idle");
        break;
      }
      case "street": {
        DrawUtils.skyDay(g, W, H * 0.55);
        g.fillStyle(CFG.C.ROAD);
        g.fillRect(0, H * 0.55, W, H * 0.45);
        g.fillStyle(CFG.C.SIDEWALK);
        g.fillRect(0, H * 0.52, W, H * 0.06);
        // Bangunan
        [80, 250, 430, 600].forEach((bx, i) => {
          g.fillStyle([0xe8d5a3, 0xffe4b5, 0xd5c4a0, 0xe8c99a][i]);
          g.fillRect(bx, H * 0.28, 90, H * 0.25);
          g.fillStyle(0x8b4513);
          g.fillTriangle(
            bx - 5,
            H * 0.28,
            bx + 95,
            H * 0.28,
            bx + 45,
            H * 0.18,
          );
        });
        DrawUtils.rara(g, W * 0.45, H * 0.47, "walk");
        DrawUtils.shadowNpc(g, W * 0.72, H * 0.44, false);
        break;
      }
      case "rara_stand": {
        g.fillStyle(0x87ceeb);
        g.fillRect(0, 0, W, H * 0.55);
        g.fillStyle(CFG.C.GROUND);
        g.fillRect(0, H * 0.55, W, H * 0.45);
        // Rara besar di tengah
        DrawUtils.rara(g, W * 0.5, H * 0.42, "idle");
        // Tombol kontrol hint
        g.fillStyle(0xffffff, 0.15);
        g.fillRoundedRect(W * 0.1, H * 0.1, 140, 60, 8);
        break;
      }
    }
  }

  _next() {
    this._idx++;
    if (this._idx < this._panels.length) {
      this._buildPanel();
    } else {
      this.cameras.main.fadeOut(400);
      this.time.delayedCall(400, () => this.scene.start("Day1"));
    }
  }
}
