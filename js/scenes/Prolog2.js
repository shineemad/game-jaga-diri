// Prolog2.js — Pembukaan cerita Hari 2
class Prolog2 extends Phaser.Scene {
  constructor() {
    super({ key: "Prolog2" });
  }

  create() {
    GameState.day = 2;
    GameState.checkpoints.d2 = true; // checkpoint: sudah lihat prolog2, bisa skip saat retry
    this.cameras.main.fadeIn(500);
    this._panels = [
      {
        bg: 0xe8b86d,
        title: "Hari 2: Naik Angkot ke Sekolah",
        text: 'Siang hari. Rara menunggu di halte angkot.\nIa akan naik angkot menuju sekolah.\n"Pilih angkot yang ramai penumpang, ya!"',
        img: "halte",
      },
      {
        bg: 0xc87941,
        title: "Batas Tubuh & Dunia Digital",
        text: "Di dalam angkot, ada penumpang\nyang berperilaku mencurigakan.\nSelain itu, HP Rara tiba-tiba\nmenerima pesan dari nomor tak dikenal.",
        img: "pete",
      },
      {
        bg: 0x8b5e3c,
        title: "Yang Perlu Rara Tahu",
        text: "🔴 Tubuhmu adalah milikmu sendiri.\n🔴 Bagian privat tidak boleh disentuh orang lain.\n🔴 Jika ada pesan mencurigakan di HP:\n     Jangan balas — Lapor orang dewasa!",
        img: "info",
      },
    ];
    this._idx = 0;
    this._buildPanel();
    this.input.on("pointerdown", () => this._next());
    this.input.keyboard.on("keydown-SPACE", () => this._next());
  }

  _buildPanel() {
    this.children.removeAll(true);
    this.cameras.main.fadeIn(300);
    const W = CFG.WIDTH,
      H = CFG.HEIGHT;
    const p = this._panels[this._idx];

    const bg = this.add.graphics();
    bg.fillStyle(p.bg);
    bg.fillRect(0, 0, W, H);
    this._drawIllustration(p.img);

    const panelG = this.add.graphics();
    panelG.fillStyle(CFG.C.PANEL, 0.93);
    panelG.fillRoundedRect(20, H - 190, W - 40, 180, 14);
    DrawUtils.sulselBorder(panelG, 20, H - 190, W - 40, 180, 0.8);

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
      case "halte": {
        DrawUtils.skyDay(g, W, H);
        g.fillStyle(CFG.C.ROAD);
        g.fillRect(0, H * 0.6, W, H * 0.4);
        g.fillStyle(CFG.C.SIDEWALK);
        g.fillRect(0, H * 0.54, W, H * 0.07);
        // Halte
        g.fillStyle(0x4169e1);
        g.fillRect(W * 0.3, H * 0.26, 160, 50);
        g.fillStyle(0x3355cc);
        g.fillRect(W * 0.28, H * 0.21, 164, 6);
        g.fillStyle(0xccc);
        g.fillRect(W * 0.3, H * 0.26, 5, H * 0.28);
        g.fillRect(W * 0.3 + 155, H * 0.26, 5, H * 0.28);
        this.add.text(W * 0.3 + 10, H * 0.27, "HALTE ANGKOT", {
          fontFamily: "Arial",
          fontSize: "12px",
          color: "#FFFFFF",
          fontStyle: "bold",
        });
        DrawUtils.rara(g, W * 0.5, H * 0.48, "idle");
        break;
      }
      case "pete": {
        // Interior angkot sederhana
        g.fillStyle(0xffd700);
        g.fillRect(W * 0.05, H * 0.08, W * 0.9, H * 0.46);
        g.fillStyle(0xcc9900);
        g.fillRect(W * 0.05, H * 0.08, W * 0.9, 14);
        g.fillStyle(0x8b4513);
        g.fillRect(W * 0.05, H * 0.52, W * 0.9, 8);
        // Jendela
        for (let j = 0; j < 3; j++) {
          g.fillStyle(0x87ceeb, 0.7);
          g.fillRect(W * 0.12 + j * W * 0.28, H * 0.14, W * 0.2, H * 0.14);
        }
        // Penumpang (siluet mencurigakan)
        DrawUtils.shadowNpc(g, W * 0.65, H * 0.36, false);
        // Rara
        DrawUtils.rara(g, W * 0.35, H * 0.36, "scared");
        // HP notifikasi
        g.fillStyle(0x1a1a2e);
        g.fillRoundedRect(W * 0.6, H * 0.08, 140, 80, 8);
        g.fillStyle(0xff4444);
        g.fillCircle(W * 0.6 + 130, H * 0.08 + 8, 12);
        break;
      }
      case "info": {
        g.fillStyle(0x1a0a00);
        g.fillRect(0, 0, W, H);
        DrawUtils.sulselBorder(g, 30, 30, W - 60, H * 0.52, 0.7);
        g.fillStyle(CFG.C.GOLD, 0.1);
        g.fillRect(30, 30, W - 60, H * 0.52);
        DrawUtils.rara(g, W * 0.15, H * 0.3, "idle");
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
      this.time.delayedCall(400, () => this.scene.start("Day2"));
    }
  }
}
