// Prolog3.js — Pembukaan cerita Hari 3
class Prolog3 extends Phaser.Scene {
  constructor() {
    super({ key: "Prolog3" });
  }

  create() {
    GameState.day = 3;
    GameState.checkpoints.d3 = true; // checkpoint: sudah lihat prolog3, bisa skip saat retry
    this.cameras.main.fadeIn(500);
    this._panels = [
      {
        bg: 0x4a5568,
        title: "Hari 3: Hujan di Parkiran Sekolah",
        text: 'Hujan deras mengguyur kota.\nRara berjalan menuju parkiran SMP Harapan.\nTiba-tiba, seseorang menghadang jalannya.\n"Hei, mau kubawa pulang pakai ojol,"',
        img: "rain",
      },
      {
        bg: 0x2d3748,
        title: "Ancaman Grooming",
        text: "Sebelumnya, ada orang asing yang terus\nmengirim pesan ke HP Rara — memintanya\nmerahasiakan obrolan mereka dan\nmeminta foto. Ini adalah GROOMING!",
        img: "chat",
      },
      {
        bg: 0x1a0a00,
        title: "Hadapi Si Bayangan Gelap",
        text: '"Si Bayangan Gelap" adalah orang berbahaya\nyang menyamar sebagai orang baik.\nSatu-satunya cara mengalahkannya:\nBERSUARA KERAS dan tekan PANIC BUTTON!\nMinta bantuan orang dewasa terdekat!',
        img: "boss_intro",
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
      color: "#FF8888",
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
        color: "#FF8888",
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
      case "rain": {
        DrawUtils.skyRain(g, W, H * 0.55);
        g.fillStyle(0x555555);
        g.fillRect(0, H * 0.55, W, H * 0.45);
        // Mobil parkir
        g.fillStyle(0x336688);
        g.fillRoundedRect(W * 0.55, H * 0.38, 160, 70, 6);
        g.fillStyle(0x87ceeb, 0.5);
        g.fillRect(W * 0.57, H * 0.4, 60, 30);
        // Rara
        DrawUtils.rara(g, W * 0.3, H * 0.44, "scared");
        // Bayangan orang asing
        DrawUtils.shadowNpc(g, W * 0.5, H * 0.42, true, true);
        break;
      }
      case "chat": {
        g.fillStyle(0x1a1a2e);
        g.fillRect(0, 0, W, H * 0.55);
        // Mockup HP
        g.fillStyle(0x333);
        g.fillRoundedRect(W * 0.25, H * 0.03, 200, 340, 14);
        g.fillStyle(0x25d366, 0.9);
        g.fillRect(W * 0.27, H * 0.08, 196, 40);
        // Gelembung pesan palsu
        const msgs = [
          { txt: "Hei, ada foto ga?", side: "left", y: H * 0.19 },
          { txt: "Rahasia aja ya dek", side: "left", y: H * 0.26 },
          { txt: "...", side: "right", y: H * 0.33 },
          { txt: "Jangan kasih tau ibu!", side: "left", y: H * 0.4 },
        ];
        msgs.forEach((m) => {
          const mx = m.side === "left" ? W * 0.28 : W * 0.35;
          g.fillStyle(m.side === "left" ? 0x333333 : 0x075e54, 0.95);
          g.fillRoundedRect(mx, m.y, 120, 22, 6);
        });
        break;
      }
      case "boss_intro": {
        g.fillStyle(0x0d0000);
        g.fillRect(0, 0, W, H * 0.55);
        DrawUtils.boss(g, W * 0.5, H * 0.33, 0.8);
        // Efek cahaya merah
        g.fillStyle(0xff0000, 0.05);
        for (let r = 80; r > 0; r -= 20) g.fillCircle(W * 0.5, H * 0.33, r);
        DrawUtils.rara(g, W * 0.2, H * 0.4, "scared");
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
      this.time.delayedCall(400, () => this.scene.start("Day3"));
    }
  }
}
