// Result3.js — Layar hasil akhir Hari 3 + skor final + evaluasi performa
class Result3 extends Phaser.Scene {
  constructor() {
    super({ key: "Result3" });
  }

  create() {
    this.cameras.main.fadeIn(600);
    const W = CFG.WIDTH,
      H = CFG.HEIGHT;

    const bg = this.add.graphics();
    bg.fillGradientStyle(0x2a1a00, 0x2a1a00, 0x0d0505, 0x0d0505, 1);
    bg.fillRect(0, 0, W, H);
    DrawUtils.sulselBorder(this.add.graphics(), 8, 8, W - 16, H - 16, 1.0);

    this.add
      .text(W / 2, 20, "🎉 SELAMAT! SEMUA HARI SELESAI! 🎉", {
        ...CFG.F.TITLE,
        fontSize: "20px",
        color: "#FFD700",
      })
      .setOrigin(0.5);

    // Nilai akhir
    const grade = GameState.grade();
    this.add
      .text(W / 2, 52, grade.label, {
        fontFamily: "Arial",
        fontSize: "24px",
        color: grade.color,
        fontStyle: "bold",
        stroke: "#000",
        strokeThickness: 3,
      })
      .setOrigin(0.5);

    // Progress bar skor
    const total = 1000;
    const ratio = Math.min(1, GameState.score / total);
    const pbg = this.add.graphics();
    pbg.fillStyle(0x333333);
    pbg.fillRoundedRect(W / 2 - 180, 82, 360, 20, 8);
    pbg.fillStyle(CFG.C.GOLD);
    pbg.fillRoundedRect(W / 2 - 180, 82, 360 * ratio, 20, 8);
    this.add
      .text(W / 2, 92, `Skor Akhir: ${GameState.score} / ${total}`, {
        ...CFG.F.SMALL,
      })
      .setOrigin(0.5);

    // Rekap pilihan (Fix #4: expanded per-choice list)
    const bahayaChoices = GameState.choices.filter(
      (c) => c.category === "BAHAYA",
    );
    const panelH = Math.max(130, 90 + bahayaChoices.length * 22);
    const recapG = this.add.graphics();
    recapG.fillStyle(0x000000, 0.35);
    recapG.fillRoundedRect(20, 110, W - 40, panelH, 10);
    recapG.lineStyle(1, CFG.C.GOLD, 0.5);
    recapG.strokeRoundedRect(20, 110, W - 40, panelH, 10);

    this.add.text(30, 118, "Rekap Pilihan Kamu:", {
      fontFamily: "Arial",
      fontSize: "13px",
      color: "#FFD700",
      fontStyle: "bold",
    });

    const amanCnt = GameState.choices.filter(
      (c) => c.category === "AMAN",
    ).length;
    const raguCnt = GameState.choices.filter(
      (c) => c.category === "RAGU",
    ).length;
    const bahayaCnt = bahayaChoices.length;
    const totalC = GameState.choices.length || 1;

    [
      { label: `✓ Pilihan AMAN    : ${amanCnt}x`, color: "#44FF88" },
      { label: `⚠ Pilihan RAGU-RAGU: ${raguCnt}x`, color: "#FFD700" },
      { label: `✗ Pilihan BAHAYA  : ${bahayaCnt}x`, color: "#FF4444" },
    ].forEach((r, i) => {
      this.add.text(35, 138 + i * 24, r.label, {
        fontFamily: "Arial",
        fontSize: "13px",
        color: r.color,
      });
    });

    // Tampilkan pilihan BAHAYA jika ada (pengingat edukatif)
    if (bahayaChoices.length > 0) {
      this.add.text(35, 138 + 3 * 24 + 2, "Perlu diwaspadai:", {
        fontFamily: "Arial",
        fontSize: "11px",
        color: "#FF9999",
        fontStyle: "italic",
      });
      bahayaChoices.slice(0, 3).forEach((c, i) => {
        this.add.text(
          42,
          138 + 3 * 24 + 18 + i * 20,
          `✗ [Hari ${c.day}] ${c.label.length > 50 ? c.label.slice(0, 47) + "..." : c.label}`,
          {
            fontFamily: "Arial",
            fontSize: "11px",
            color: "#FFAAAA",
            wordWrap: { width: W - 80 },
          },
        );
      });
    }

    // Achievement
    if (GameState.achievements.length > 0) {
      this.add.text(
        30,
        228,
        "🏆 Achievement: " + GameState.achievements.join(" | "),
        {
          fontFamily: "Arial",
          fontSize: "12px",
          color: "#FFD700",
          wordWrap: { width: W - 60 },
        },
      );
    }

    // Pesan motivasi
    const msg =
      bahayaCnt === 0
        ? "Luar biasa! Rara selamat tanpa satu pun pilihan bahaya.\nKamu adalah Pahlawan Sejati! 🦦"
        : amanCnt >= bahayaCnt
          ? "Kerja bagus! Rara berhasil selamat. Terus belajar\nuntuk lebih waspada dalam kehidupan nyata."
          : "Rara masih butuh banyak latihan. Tapi jangan nyerah!\nCeritain ke orang dewasa yang kamu percaya ya!";

    this.add
      .text(W / 2, 262, msg, {
        fontFamily: "Arial",
        fontSize: "13px",
        color: "#FFFFCC",
        wordWrap: { width: W - 60 },
        align: "center",
      })
      .setOrigin(0.5);

    // Nomor darurat reminder
    this.add
      .text(
        W / 2,
        310,
        "☎ Darurat: Polisi 110 | KPAI 021-31901556 | Hotline Anak 129",
        {
          fontFamily: "Arial",
          fontSize: "12px",
          color: "#FF8888",
          align: "center",
          wordWrap: { width: W - 40 },
        },
      )
      .setOrigin(0.5);

    DrawUtils.hearts(
      this.add.graphics(),
      W / 2 - 42,
      340,
      GameState.lives,
      GameState.maxLives,
    );

    // Tombol SERTIFIKAT (kiri) + LANJUT CERITA (kanan)
    this._makeBtn(W / 2 - 175, H - 95, 150, 34, "📋 SERTIFIKAT", 0x55448a, () =>
      this._showCertificate(),
    );
    this._makeBtn(
      W / 2 + 25,
      H - 95,
      150,
      34,
      "▶ LANJUT CERITA",
      0x1a6b3c,
      () => {
        AudioManager.sfxAchievement();
        this.cameras.main.fadeOut(600);
        this.time.delayedCall(600, () => this.scene.start("Ending"));
      },
    );

    // Tombol bawah
    this._makeBtn(W / 2 - 130, H - 50, 120, 36, "MAIN LAGI", CFG.C.AMAN, () => {
      GameState.reset();
      this.cameras.main.fadeOut(400);
      this.time.delayedCall(400, () => this.scene.start("Prolog1"));
    });
    this._makeBtn(W / 2 + 10, H - 50, 120, 36, "MENU", CFG.C.PRIMARY, () => {
      this.cameras.main.fadeOut(400);
      this.time.delayedCall(400, () => this.scene.start("Menu"));
    });
  }

  _showCertificate() {
    const W = CFG.WIDTH,
      H = CFG.HEIGHT;
    const grade = GameState.grade();
    const objs = [];
    const today = new Date();
    const dateStr = today.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const ov = this.add.graphics().setDepth(200);
    ov.fillStyle(0x000000, 0.82);
    ov.fillRect(0, 0, W, H);
    objs.push(ov);

    const cert = this.add.graphics().setDepth(201);
    cert.fillStyle(0x1a0f00, 1);
    cert.fillRoundedRect(30, 22, W - 60, H - 50, 16);
    cert.lineStyle(3, CFG.C.GOLD, 1);
    cert.strokeRoundedRect(30, 22, W - 60, H - 50, 16);
    cert.lineStyle(1, CFG.C.GOLD, 0.4);
    cert.strokeRoundedRect(38, 30, W - 76, H - 66, 12);
    objs.push(cert);

    const texts = [
      {
        t: "✦ SERTIFIKAT KESELAMATAN ✦",
        y: 46,
        size: "15px",
        color: "#FFD700",
        bold: true,
      },
      {
        t: "GAME EDUKASI KESELAMATAN — MAKASSAR",
        y: 70,
        size: "11px",
        color: "#FFCC88",
        bold: false,
      },
      {
        t: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        y: 87,
        size: "11px",
        color: "#AA8800",
        bold: false,
      },
      {
        t: "Diberikan kepada:",
        y: 108,
        size: "12px",
        color: "#CCCCCC",
        bold: false,
      },
      {
        t: GameState.playerName || "Jagoan Rara",
        y: 130,
        size: "22px",
        color: "#FFD700",
        bold: true,
      },
      {
        t: "Telah menyelesaikan semua tantangan keselamatan",
        y: 164,
        size: "12px",
        color: "#FFFFCC",
        bold: false,
      },
      {
        t: "dan membuktikan kemampuan berpikir aman.",
        y: 180,
        size: "12px",
        color: "#FFFFCC",
        bold: false,
      },
      { t: grade.label, y: 210, size: "20px", color: grade.color, bold: true },
      {
        t: `Skor: ${GameState.score} poin`,
        y: 240,
        size: "14px",
        color: "#FFD700",
        bold: false,
      },
      {
        t: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
        y: 264,
        size: "11px",
        color: "#AA8800",
        bold: false,
      },
      {
        t: `Makassar, ${dateStr}`,
        y: 282,
        size: "11px",
        color: "#CCC",
        bold: false,
      },
      {
        t: "🏆 Jagoan Anti-Kejahatan ✦ Tetap Waspada!",
        y: 308,
        size: "12px",
        color: "#FFCC44",
        bold: false,
      },
      {
        t: "[ Screenshot untuk menyimpan sertifikat ini! ]",
        y: 338,
        size: "11px",
        color: "#AAAAAA",
        bold: false,
      },
    ];
    texts.forEach((tx) => {
      objs.push(
        this.add
          .text(W / 2, tx.y, tx.t, {
            fontFamily: "Arial",
            fontSize: tx.size,
            color: tx.color,
            fontStyle: tx.bold ? "bold" : "normal",
            align: "center",
            wordWrap: { width: W - 100 },
          })
          .setOrigin(0.5)
          .setDepth(202),
      );
    });

    // Fix #3 — Tombol UNDUH SERTIFIKAT
    const dlBg = this.add.graphics().setDepth(201);
    dlBg.fillStyle(0x004422, 0.9);
    dlBg.fillRoundedRect(W / 2 - 120, H - 78, 240, 30, 8);
    dlBg.lineStyle(2, 0x44dd88, 0.7);
    dlBg.strokeRoundedRect(W / 2 - 120, H - 78, 240, 30, 8);
    objs.push(dlBg);
    const dlLabel = this.add
      .text(W / 2, H - 63, "\u2b07 UNDUH SERTIFIKAT (PNG)", {
        fontFamily: "Arial",
        fontSize: "13px",
        color: "#44FF99",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(202);
    objs.push(dlLabel);
    const dlZone = this.add
      .zone(W / 2 - 120, H - 78, 240, 30)
      .setOrigin(0)
      .setDepth(203)
      .setInteractive({ useHandCursor: true });
    objs.push(dlZone);
    dlZone.on("pointerover", () => {
      dlBg.setAlpha(0.65);
      dlLabel.setColor("#FFFFFF");
    });
    dlZone.on("pointerout", () => {
      dlBg.setAlpha(1);
      dlLabel.setColor("#44FF99");
    });
    dlZone.on("pointerdown", () => {
      AudioManager.sfxClick();
      try {
        const canvas = this.sys.game.canvas;
        const dataURL = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.download =
          "sertifikat-" +
          (GameState.playerName || "rara").toLowerCase().replace(/\s+/g, "-") +
          ".png";
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (e) {
        // fallback: tampilkan instruksi screenshot
        dlLabel.setText("Tekan Ctrl+Shift+S untuk screenshot!");
        this.time.delayedCall(3000, () =>
          dlLabel.setText("\u2b07 UNDUH SERTIFIKAT (PNG)"),
        );
      }
    });

    // Tombol tutup
    const closeBg = this.add.graphics().setDepth(201);
    closeBg.fillStyle(0x550000, 0.9);
    closeBg.fillRoundedRect(W / 2 - 80, H - 40, 160, 30, 8);
    objs.push(closeBg);
    objs.push(
      this.add
        .text(W / 2, H - 25, "✕ TUTUP", {
          fontFamily: "Arial",
          fontSize: "13px",
          color: "#FFF",
          fontStyle: "bold",
        })
        .setOrigin(0.5)
        .setDepth(202),
    );
    this.add
      .zone(W / 2 - 80, H - 40, 160, 30)
      .setOrigin(0)
      .setDepth(203)
      .setInteractive({ useHandCursor: true })
      .on("pointerdown", () => {
        objs.forEach((o) => o.destroy());
        AudioManager.sfxClick();
      });
  }

  _makeBtn(x, y, w, h, label, color, cb) {
    const g = this.add.graphics().setDepth(8);
    g.fillStyle(color, 0.85);
    g.fillRoundedRect(x, y, w, h, 8);
    g.lineStyle(2, 0xffffff, 0.4);
    g.strokeRoundedRect(x, y, w, h, 8);
    this.add
      .text(x + w / 2, y + h / 2, label, CFG.F.BUTTON)
      .setOrigin(0.5)
      .setDepth(9);
    this.add
      .zone(x, y, w, h)
      .setOrigin(0)
      .setDepth(10)
      .setInteractive({ useHandCursor: true })
      .on("pointerover", () => g.setAlpha(0.7))
      .on("pointerout", () => g.setAlpha(1))
      .on("pointerdown", cb);
  }
}
