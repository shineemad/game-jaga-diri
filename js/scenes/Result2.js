// Result2.js — Layar hasil Hari 2 + Edu-card Grooming Digital
class Result2 extends Phaser.Scene {
  constructor() {
    super({ key: "Result2" });
  }

  create() {
    this.cameras.main.fadeIn(500);
    const W = CFG.WIDTH,
      H = CFG.HEIGHT;

    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a2a3a, 0x1a2a3a, 0x0d0505, 0x0d0505, 1);
    bg.fillRect(0, 0, W, H);
    DrawUtils.sulselBorder(this.add.graphics(), 8, 8, W - 16, H - 16, 0.7);

    this.add
      .text(W / 2, 28, "✓ Hari 2 Selesai!", {
        ...CFG.F.TITLE,
        fontSize: "26px",
        color: "#4488FF",
      })
      .setOrigin(0.5);

    this.add
      .text(W / 2, 58, `Total Skor | Nyawa tersisa: ${GameState.lives}/3`, {
        ...CFG.F.SUBTITLE,
        color: "#FFD700",
      })
      .setOrigin(0.5);

    const barG = this.add.graphics();
    barG.fillStyle(0x333333);
    barG.fillRoundedRect(W / 2 - 160, 80, 320, 18, 6);
    barG.fillStyle(CFG.C.NEUTRAL);
    const ratio = Math.min(1, GameState.score / 600);
    barG.fillRoundedRect(W / 2 - 160, 80, 320 * ratio, 18, 6);
    this.add
      .text(W / 2, 90, `${GameState.score} / 600 poin`, { ...CFG.F.SMALL })
      .setOrigin(0.5);

    // EDU-CARD: Grooming & Batas Tubuh
    const eduG = this.add.graphics();
    eduG.fillStyle(0x003366, 0.25);
    eduG.fillRoundedRect(20, 115, W - 40, 235, 12);
    eduG.lineStyle(2, CFG.C.NEUTRAL, 0.8);
    eduG.strokeRoundedRect(20, 115, W - 40, 235, 12);

    this.add
      .text(W / 2, 128, "📱 WASPADA GROOMING ONLINE", {
        fontFamily: "Arial",
        fontSize: "15px",
        color: "#88CCFF",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // Fix #4: tombol kecil Rekap Pilihan di pojok kanan edu-card
    const recapBtnG = this.add.graphics().setDepth(6);
    recapBtnG.fillStyle(0x004499, 0.85);
    recapBtnG.fillRoundedRect(W - 115, 118, 92, 22, 6);
    this.add
      .text(W - 69, 129, "📋 Pilihanku", {
        fontFamily: "Arial",
        fontSize: "11px",
        color: "#CCF",
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
        this._showChoiceRecap(2);
      })
      .on("pointerover", () => recapBtnG.setAlpha(0.6))
      .on("pointerout", () => recapBtnG.setAlpha(1));

    const tips = [
      "• Bagian privat = bagian tubuh yang tertutup pakaian renang",
      "• Nggak ada yang boleh motret/sentuh area privat kamu",
      "• Groomer sering minta rahasiain obrolan — itu BAHAYA!",
      "• Ada pesan aneh di HP? → screenshot → ceritain ke ortu",
      "• Pakai fitur BLOKIR & LAPORKAN di aplikasi pesan",
      "• Kamu NGGAK bersalah kalau diganggu secara digital",
    ];
    tips.forEach((t, i) => {
      this.add.text(35, 153 + i * 32, t, {
        fontFamily: "Arial",
        fontSize: "13px",
        color: "#CCE8FF",
        wordWrap: { width: W - 70 },
      });
    });

    this.add
      .text(
        W / 2,
        350,
        `Nyawa: ${GameState.lives} | Skor: ${GameState.score}`,
        { ...CFG.F.SMALL },
      )
      .setOrigin(0.5);
    const hudG = this.add.graphics();
    DrawUtils.hearts(
      hudG,
      W / 2 - 42,
      370,
      GameState.lives,
      GameState.maxLives,
    );

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
        const icon = catIcon[c.category] || "\u2022";
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
      this.time.delayedCall(800, () => {
        this.cameras.main.fadeOut(400);
        this.time.delayedCall(400, () =>
          this.scene.start("GameOver", { fromDay: 2 }),
        );
      });
      return;
    }

    // Tombol ULANGI HARI 2 (kiri)
    const replayG = this.add.graphics();
    replayG.fillStyle(0x664400, 0.85);
    replayG.fillRoundedRect(W / 2 - 265, H - 46, 155, 38, 10);
    this.add
      .text(W / 2 - 187, H - 27, "↺ ULANGI HARI 2", {
        ...CFG.F.BUTTON,
        fontSize: "13px",
        color: "#FFD700",
      })
      .setOrigin(0.5);
    this.add
      .zone(W / 2 - 265, H - 46, 155, 38)
      .setOrigin(0)
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => replayG.setAlpha(0.65))
      .on("pointerout", () => replayG.setAlpha(1))
      .on("pointerdown", () => {
        AudioManager.sfxClick();
        GameState.lives = GameState.maxLives;
        GameState.score = Math.max(0, GameState.score - 100);
        this.cameras.main.fadeOut(400);
        this.time.delayedCall(400, () => this.scene.start("Day2"));
      });

    // Tombol LANJUT HARI 3 (kanan)
    const btnG = this.add.graphics();
    btnG.fillStyle(CFG.C.NEUTRAL, 0.8);
    btnG.fillRoundedRect(W / 2 - 90, H - 46, 230, 38, 10);
    this.add
      .text(W / 2 + 25, H - 27, "▶ LANJUT HARI 3 — FINAL", {
        ...CFG.F.BUTTON,
      })
      .setOrigin(0.5);
    this.add
      .zone(W / 2 - 90, H - 46, 230, 38)
      .setOrigin(0)
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => btnG.setAlpha(0.65))
      .on("pointerout", () => btnG.setAlpha(1))
      .on("pointerdown", () => {
        AudioManager.sfxClick();
        GameState.day = 3;
        GameState.save();
        this.cameras.main.fadeOut(400);
        this.time.delayedCall(400, () => this.scene.start("Prolog3"));
      });
  }
}
