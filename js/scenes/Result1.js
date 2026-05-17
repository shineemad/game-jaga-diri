// Result1.js — Layar hasil Hari 1 + Edu-card Red Flag
class Result1 extends Phaser.Scene {
  constructor() {
    super({ key: "Result1" });
  }

  create() {
    this.cameras.main.fadeIn(500);
    const W = CFG.WIDTH,
      H = CFG.HEIGHT;

    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a3a1a, 0x1a3a1a, 0x0d0505, 0x0d0505, 1);
    bg.fillRect(0, 0, W, H);
    DrawUtils.sulselBorder(this.add.graphics(), 8, 8, W - 16, H - 16, 0.7);

    this.add
      .text(W / 2, 28, "✓ Hari 1 Selesai!", {
        ...CFG.F.TITLE,
        fontSize: "26px",
        color: "#44FF88",
      })
      .setOrigin(0.5);

    this.add
      .text(W / 2, 58, `Skor Hari 1 | Nyawa tersisa: ${GameState.lives}/3`, {
        ...CFG.F.SUBTITLE,
        color: "#FFD700",
      })
      .setOrigin(0.5);

    // Skor bar
    const barG = this.add.graphics();
    barG.fillStyle(0x333333);
    barG.fillRoundedRect(W / 2 - 160, 80, 320, 18, 6);
    barG.fillStyle(CFG.C.AMAN);
    const ratio = Math.min(1, GameState.score / 300);
    barG.fillRoundedRect(W / 2 - 160, 80, 320 * ratio, 18, 6);
    this.add
      .text(W / 2, 90, `${GameState.score} / 300 poin`, {
        ...CFG.F.SMALL,
        color: "#FFF",
      })
      .setOrigin(0.5);

    // ── EDU-CARD: Red Flag ────────────────────────────────────────────
    const eduG = this.add.graphics();
    eduG.fillStyle(0x8b0000, 0.2);
    eduG.fillRoundedRect(20, 115, W - 40, 230, 12);
    eduG.lineStyle(2, CFG.C.PRIMARY, 0.8);
    eduG.strokeRoundedRect(20, 115, W - 40, 230, 12);

    this.add
      .text(W / 2, 128, "🚩 KENALI TANDA BAHAYA (RED FLAG)", {
        fontFamily: "Arial",
        fontSize: "15px",
        color: "#FF8888",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // Fix #4: tombol kecil Rekap Pilihan di pojok kanan edu-card
    const recapBtnG = this.add.graphics().setDepth(6);
    recapBtnG.fillStyle(0xcc6600, 0.85);
    recapBtnG.fillRoundedRect(W - 115, 118, 92, 22, 6);
    this.add
      .text(W - 69, 129, "📋 Pilihanku", {
        fontFamily: "Arial",
        fontSize: "11px",
        color: "#FFE",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(7);
    this.add
      .zone(W - 115, 118, 92, 22)
      .setOrigin(0)
      .setDepth(8)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        AudioManager.sfxClick();
        this._showChoiceRecap(1);
      });
    this.add
      .zone(W - 115, 118, 92, 22)
      .setOrigin(0)
      .setDepth(8)
      .on("pointerover", () => recapBtnG.setAlpha(0.6))
      .on("pointerout", () => recapBtnG.setAlpha(1));

    const flags = [
      "• Orang asing mengajakmu ikut tanpa izin orang tua",
      "• Seseorang menawarkan hadiah/makanan secara berlebihan",
      "• Orang dewasa yang minta rahasiakan pertemuan kalian",
      "• Ada yang menyentuh tubuhmu tanpa izin — TERIAK & LARI!",
      "• Jangan lewati gang sepi sendirian — pilih jalan ramai",
    ];
    flags.forEach((f, i) => {
      this.add.text(35, 155 + i * 34, f, {
        fontFamily: "Arial",
        fontSize: "13px",
        color: "#FFCCCC",
        wordWrap: { width: W - 70 },
      });
    });

    this.add
      .text(
        W / 2,
        332,
        `📍 Jika ada yang mengancammu:\nHotline Polisi 110 | SAPA Anak 129`,
        {
          fontFamily: "Arial",
          fontSize: "12px",
          color: "#FFD700",
          align: "center",
        },
      )
      .setOrigin(0.5);

    // Nyawa info
    const hudG = this.add.graphics();
    DrawUtils.hearts(
      hudG,
      W / 2 - 42,
      360,
      GameState.lives,
      GameState.maxLives,
    );
    this.add
      .text(W / 2, 380, `Nyawa Rara: ${GameState.lives}`, {
        ...CFG.F.SMALL,
        color: "#EEE",
      })
      .setOrigin(0.5);

    // Tombol lanjut
    this._makeNextBtn();
  }

  // Fix #4: Modal rekap keputusan Hari tertentu
  _showChoiceRecap(day) {
    const W = CFG.WIDTH,
      H = CFG.HEIGHT;
    const choices = GameState.choices.filter((c) => c.day === day);
    const objs = [];
    const ov = this.add.graphics().setDepth(200);
    ov.fillStyle(0x000000, 0.82);
    ov.fillRect(0, 0, W, H);
    objs.push(ov);
    const panel = this.add.graphics().setDepth(201);
    panel.fillStyle(0x111133, 0.97);
    panel.fillRoundedRect(18, 25, W - 36, H - 60, 14);
    panel.lineStyle(2, 0xffdd44, 0.8);
    panel.strokeRoundedRect(18, 25, W - 36, H - 60, 14);
    objs.push(panel);
    objs.push(
      this.add
        .text(W / 2, 38, `📋 Pilihan Kamu — Hari ${day}`, {
          fontFamily: "Arial",
          fontSize: "15px",
          color: "#FFD700",
          fontStyle: "bold",
        })
        .setOrigin(0.5)
        .setDepth(202),
    );
    const catColor = { AMAN: "#44FF88", RAGU: "#FFD700", BAHAYA: "#FF4444" };
    const catIcon = { AMAN: "\u2713", RAGU: "\u26a0", BAHAYA: "\u2717" };
    if (choices.length === 0) {
      objs.push(
        this.add
          .text(W / 2, H / 2, "(Belum ada pilihan tercatat)", {
            fontFamily: "Arial",
            fontSize: "13px",
            color: "#aaa",
          })
          .setOrigin(0.5)
          .setDepth(202),
      );
    } else {
      choices.forEach((c, i) => {
        const col = catColor[c.category] || "#ccc";
        const icon = catIcon[c.category] || "•";
        const rowY = 65 + i * 32;
        const rowG = this.add.graphics().setDepth(201);
        rowG.fillStyle(
          c.category === "AMAN"
            ? 0x004422
            : c.category === "RAGU"
              ? 0x443300
              : 0x440011,
          0.55,
        );
        rowG.fillRoundedRect(28, rowY, W - 56, 27, 6);
        objs.push(rowG);
        objs.push(
          this.add
            .text(40, rowY + 7, `${icon} [${c.category}] ${c.label}`, {
              fontFamily: "Arial",
              fontSize: "12px",
              color: col,
              wordWrap: { width: W - 90 },
            })
            .setDepth(202),
        );
      });
    }
    // Tutup
    const closeG = this.add.graphics().setDepth(202);
    closeG.fillStyle(0x550000, 0.9);
    closeG.fillRoundedRect(W / 2 - 60, H - 42, 120, 26, 8);
    objs.push(closeG);
    objs.push(
      this.add
        .text(W / 2, H - 29, "\u2715 TUTUP", {
          fontFamily: "Arial",
          fontSize: "13px",
          color: "#FFF",
          fontStyle: "bold",
        })
        .setOrigin(0.5)
        .setDepth(203),
    );
    this.add
      .zone(W / 2 - 60, H - 42, 120, 26)
      .setOrigin(0)
      .setDepth(204)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        objs.forEach((o) => o.destroy());
        AudioManager.sfxClick();
      });
  }

  _makeNextBtn() {
    const W = CFG.WIDTH,
      H = CFG.HEIGHT;
    if (!GameState.isAlive()) {
      this.time.delayedCall(1000, () => {
        this.cameras.main.fadeOut(400);
        this.time.delayedCall(400, () =>
          this.scene.start("GameOver", { fromDay: 1 }),
        );
      });
      return;
    }

    // Tombol ULANGI HARI 1 (kiri)
    const replayG = this.add.graphics();
    replayG.fillStyle(0x664400, 0.85);
    replayG.fillRoundedRect(W / 2 - 260, H - 46, 155, 38, 10);
    this.add
      .text(W / 2 - 182, H - 27, "↺ ULANGI HARI 1", {
        ...CFG.F.BUTTON,
        fontSize: "13px",
        color: "#FFD700",
      })
      .setOrigin(0.5);
    this.add
      .zone(W / 2 - 260, H - 46, 155, 38)
      .setOrigin(0)
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => replayG.setAlpha(0.65))
      .on("pointerout", () => replayG.setAlpha(1))
      .on("pointerdown", () => {
        AudioManager.sfxClick();
        GameState.lives = GameState.maxLives;
        GameState.score = Math.max(0, GameState.score - 100);
        this.cameras.main.fadeOut(400);
        this.time.delayedCall(400, () => this.scene.start("Day1"));
      });

    // Tombol LANJUT HARI 2 (kanan)
    const btnG = this.add.graphics();
    btnG.fillStyle(CFG.C.AMAN, 0.8);
    btnG.fillRoundedRect(W / 2 - 85, H - 46, 210, 38, 10);
    this.add
      .text(W / 2 + 20, H - 27, "▶ LANJUT HARI 2", {
        ...CFG.F.BUTTON,
        color: "#FFF",
      })
      .setOrigin(0.5);
    this.add
      .zone(W / 2 - 85, H - 46, 210, 38)
      .setOrigin(0)
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => btnG.setAlpha(0.65))
      .on("pointerout", () => btnG.setAlpha(1))
      .on("pointerdown", () => {
        AudioManager.sfxClick();
        this.cameras.main.fadeOut(400);
        this.time.delayedCall(400, () => this.scene.start("Prolog2"));
      });
  }
}
