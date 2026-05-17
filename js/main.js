// main.js — Entry point: inisialisasi Phaser Game
const game = new Phaser.Game({
  type: Phaser.AUTO,
  width: CFG.WIDTH,
  height: CFG.HEIGHT,
  parent: "game-container",
  backgroundColor: "#0d0505",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: [
    Boot,
    Splash,
    Menu,
    Credits,
    Prolog1,
    Day1,
    Result1,
    Prolog2,
    Day2,
    Result2,
    Prolog3,
    Day3,
    Result3,
    Ending,
    GameOver,
  ],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  render: {
    antialias: true,
    roundPixels: false,
  },
  audio: {
    disableWebAudio: false,
  },
});
