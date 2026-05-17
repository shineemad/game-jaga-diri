// Dialog.js — Sistem dialog & pilihan bergaya visual novel
// Dipakai oleh semua scene gameplay

class DialogManager {
  constructor(scene) {
    this.scene = scene;
    this.open = false;
    this.queue = [];
    this.onDone = null;
    this._build();
  }

  _build() {
    const W = CFG.WIDTH,
      H = CFG.HEIGHT;
    const PH = 190; // panel height
    const PY = H - PH - 8;

    // Root container — scroll-fixed
    this.root = this.scene.add
      .container(0, 0)
      .setScrollFactor(0)
      .setDepth(200)
      .setVisible(false);

    // Panel background
    this.bg = this.scene.add.graphics();
    this.bg.fillStyle(CFG.C.PANEL, 0.93);
    this.bg.fillRoundedRect(8, PY, W - 16, PH, 14);
    DrawUtils.sulselBorder(this.bg, 8, PY, W - 16, PH, 0.9);

    // Portrait box
    this.portBox = this.scene.add.graphics();
    this.portBox.fillStyle(0x000000, 0.5);
    this.portBox.fillRoundedRect(18, PY + 10, 70, 70, 8);

    // Portrait label
    this.speakerTxt = this.scene.add.text(98, PY + 12, "", CFG.F.SPEAKER);

    // Dialog text
    this.bodyTxt = this.scene.add.text(98, PY + 34, "", CFG.F.DIALOG);

    // Continue hint
    this.hint = this.scene.add
      .text(W - 18, H - 18, "▼ ketuk lanjut", CFG.F.SMALL)
      .setOrigin(1, 1);

    // Choice buttons (max 4)
    // PENTING: zone dipisah dari container agar input scrollFactor(0) bekerja
    // saat kamera bergerak (container children tidak mewarisi scrollFactor).
    this.choiceBtns = [];
    for (let i = 0; i < 4; i++) {
      const bx = 8 + (i % 2) * (W / 2 - 12);
      const by = PY + PH + 6 + Math.floor(i / 2) * 38;
      const bg2 = this.scene.add.graphics();
      const lbl = this.scene.add
        .text(bx + (W / 2 - 16) / 2, by + 14, "", CFG.F.CHOICE)
        .setOrigin(0.5);
      // Zone di luar container: scrollFactor(0) agar hit-area sinkron dengan visual
      const zone = this.scene.add
        .zone(bx, by, W / 2 - 16, 36)
        .setOrigin(0)
        .setScrollFactor(0)
        .setDepth(201)
        .setVisible(false)
        .setInteractive({ useHandCursor: true });
      this.choiceBtns.push({ bg: bg2, lbl, zone, visible: false });
    }

    // Portrait graphics (drawn dynamically)
    this.portDraw = this.scene.add.graphics();

    const allObjs = [
      this.bg,
      this.portBox,
      this.portDraw,
      this.speakerTxt,
      this.bodyTxt,
      this.hint,
      // bg & lbl masuk container (visual), zone TIDAK (input)
      ...this.choiceBtns.flatMap((b) => [b.bg, b.lbl]),
    ];
    this.root.add(allObjs);

    // Click to advance (non-choice dialogs)
    this.scene.input.on("pointerdown", (ptr) => {
      if (!this.open || this._choicesShown) return;
      this._nextEntry();
    });
  }

  // Tampilkan rangkaian dialog
  // entries: [{ speaker, portrait, text, choices? }]
  // choices: [{ label, category, text }]  category: 'AMAN'|'RAGU'|'BAHAYA'
  show(entries, onDone) {
    this.queue = [...entries];
    this.onDone = onDone || null;
    this.open = true;
    this.root.setVisible(true);
    this._choicesShown = false;
    this._idx = 0;
    this._showEntry(this.queue[0]);
  }

  _showEntry(entry) {
    if (!entry) {
      this._close();
      return;
    }

    // Sembunyikan pilihan dulu
    this._hideChoices();
    this._choicesShown = false;
    this.hint.setVisible(true);

    // Speaker & teks
    this.speakerTxt.setText(entry.speaker || "");
    this.bodyTxt.setText(entry.text || "");

    // Portrait (warna sederhana berdasarkan tipe)
    this.portDraw.clear();
    this._drawPortrait(entry.portrait || "rara");

    // Jika ada pilihan, tampilkan tombol
    if (entry.choices && entry.choices.length > 0) {
      this._showChoices(entry.choices);
      this.hint.setVisible(false);
    }
  }

  _drawPortrait(type) {
    const g = this.portDraw;
    const W = CFG.WIDTH,
      H = CFG.HEIGHT;
    const PY = H - 190 - 8;
    const cx = 53,
      cy = PY + 45;

    g.fillStyle(0x222222, 0.8);
    g.fillRoundedRect(18, PY + 10, 70, 70, 8);

    switch (type) {
      case "rara":
        DrawUtils.rara(g, cx, cy - 10, "idle");
        break;
      case "shadow":
        DrawUtils.shadowNpc(g, cx, cy - 5, false);
        break;
      case "shadow_angry":
        DrawUtils.shadowNpc(g, cx, cy - 5, true);
        break;
      case "boss":
        g.fillStyle(CFG.C.BOSS);
        g.fillCircle(cx, cy, 28);
        g.fillStyle(0xff0000);
        g.fillCircle(cx - 7, cy - 5, 4);
        g.fillCircle(cx + 7, cy - 5, 4);
        break;
      case "sopir":
        g.fillStyle(CFG.C.RARA_SKIN);
        g.fillCircle(cx, cy - 5, 15);
        g.fillStyle(0x336699);
        g.fillRect(cx - 14, cy + 8, 28, 22);
        g.fillStyle(CFG.C.RARA_HAIR);
        g.fillCircle(cx, cy - 15, 10);
        break;
      case "polisi":
        g.fillStyle(CFG.C.RARA_SKIN);
        g.fillCircle(cx, cy - 5, 15);
        g.fillStyle(0x003399);
        g.fillRect(cx - 14, cy + 8, 28, 22);
        g.fillStyle(0x003399);
        g.fillCircle(cx, cy - 20, 12);
        g.fillStyle(CFG.C.GOLD);
        g.fillRect(cx - 5, cy - 24, 10, 5);
        break;
      default:
        g.fillStyle(0x555555);
        g.fillCircle(cx, cy, 28);
        g.fillStyle(0x999999);
        g.fillCircle(cx, cy - 5, 14);
    }
  }

  _showChoices(choices) {
    this._choicesShown = true;
    const W = CFG.WIDTH,
      H = CFG.HEIGHT;
    const PY = H - 190 - 8;

    choices.slice(0, 4).forEach((ch, i) => {
      const btn = this.choiceBtns[i];
      const col = i < 2 ? W / 2 - 12 : 0;
      const bx = 8 + (i % 2) * (W / 2 - 6);
      const by = PY - 45 - Math.floor(i / 2) * 42;
      const bw = W / 2 - 16;
      const bh = 38;

      let bgColor;
      switch (ch.category) {
        case "AMAN":
          bgColor = CFG.C.AMAN;
          break;
        case "BAHAYA":
          bgColor = CFG.C.BAHAYA;
          break;
        default:
          bgColor = CFG.C.RAGU;
      }

      btn.bg.clear();
      btn.bg.fillStyle(bgColor, 0.85);
      btn.bg.fillRoundedRect(bx, by, bw, bh, 8);
      btn.bg.lineStyle(2, 0xffffff, 0.5);
      btn.bg.strokeRoundedRect(bx, by, bw, bh, 8);

      btn.lbl.setText(ch.label);
      btn.lbl.setPosition(bx + bw / 2, by + bh / 2);
      btn.lbl.setWordWrapWidth(bw - 12);

      btn.zone.setPosition(bx, by);
      btn.zone.setSize(bw, bh);
      btn.zone.setOrigin(0);
      btn.zone.removeAllListeners();
      btn.zone.on("pointerdown", () => this._pickChoice(ch));
      btn.zone.on("pointerover", () => {
        btn.bg.clear();
        btn.bg.fillStyle(0xffffff, 0.15);
        btn.bg.fillRoundedRect(bx, by, bw, bh, 8);
        btn.bg.lineStyle(2, CFG.C.GOLD);
        btn.bg.strokeRoundedRect(bx, by, bw, bh, 8);
        btn.lbl.setColor("#FFD700");
      });
      btn.zone.on("pointerout", () => {
        btn.bg.clear();
        btn.bg.fillStyle(bgColor, 0.85);
        btn.bg.fillRoundedRect(bx, by, bw, bh, 8);
        btn.bg.lineStyle(2, 0xffffff, 0.5);
        btn.bg.strokeRoundedRect(bx, by, bw, bh, 8);
        btn.lbl.setColor("#FFFFFF");
      });

      btn.bg.setVisible(true);
      btn.lbl.setVisible(true);
      btn.zone.setVisible(true);
      btn.visible = true;
    });
  }

  _pickChoice(ch) {
    this._hideChoices();
    GameState.addChoice(GameState.day, ch.label, ch.category);
    if (ch.onPick) ch.onPick(ch);

    // SFX berdasarkan kategori pilihan
    if (ch.category === "AMAN") AudioManager.sfxCorrect();
    else if (ch.category === "BAHAYA") AudioManager.sfxWrong();
    else AudioManager.sfxNeutral();

    // Teks feedback informatif (2 baris)
    const msgs = {
      AMAN: "✓ Pilihan AMAN! +100\nKeputusan yang tepat dan aman!",
      RAGU: "⚠ Ragu-ragu... +50\nLebih tegas & percaya diri, ya!",
      BAHAYA: "✗ Pilihan BERBAHAYA!\nHati-hati di kehidupan nyata!",
    };
    const cols = { AMAN: "#00FF88", RAGU: "#FFD700", BAHAYA: "#FF4444" };
    const fb = this.scene.add
      .text(CFG.WIDTH / 2, CFG.HEIGHT / 2 - 40, msgs[ch.category] || "", {
        fontFamily: "Arial",
        fontSize: "17px",
        color: cols[ch.category] || "#FFF",
        fontStyle: "bold",
        stroke: "#000",
        strokeThickness: 3,
        align: "center",
      })
      .setScrollFactor(0)
      .setDepth(300)
      .setOrigin(0.5);

    if (ch.category === "BAHAYA") GameState.loseLife();

    this.scene.tweens.add({
      targets: fb,
      y: fb.y - 40,
      alpha: 0,
      duration: 1800,
      onComplete: () => {
        fb.destroy();
        this._nextEntry();
      },
    });
  }

  _hideChoices() {
    this.choiceBtns.forEach((b) => {
      b.bg.setVisible(false);
      b.lbl.setVisible(false);
      b.zone.setVisible(false);
      b.visible = false;
    });
  }

  _nextEntry() {
    this._idx++;
    if (this._idx < this.queue.length) {
      this._showEntry(this.queue[this._idx]);
    } else {
      this._close();
    }
  }

  _close() {
    this.open = false;
    this.root.setVisible(false);
    this._hideChoices();
    if (this.onDone) {
      const cb = this.onDone;
      this.onDone = null;
      cb();
    }
  }

  destroy() {
    this.root.destroy(true);
  }
}
