import BaseApp from "./BaseApp";
import { createSlidersContainer, createSlider } from "./Sliders.js"; // Import des fonctions

export default class App extends BaseApp {
  constructor() {
    super();
    this.init();
    this.setCanvasResolution();
    this.ctx = this.canvas.getContext("2d");
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
    this.n = 2;
    this.d = 29;
    this.progress = 360; // Initialisation de la progression à 360 degrés

    this.slidersContainer = createSlidersContainer(); // Créer le container des sliders
    this.createSliders(); // Créer les sliders
    this.draw();
  }

  init() {
    this.canvas.style.backgroundColor = "black";
  }

  setCanvasResolution() {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.scale(dpr, dpr);
  }

  createSliders() {
    this.nSlider = createSlider(
      "n",
      1,
      10,
      this.n,
      1,
      this.slidersContainer,
      (label, value) => {
        this[label] = value;
        this.draw();
      }
    );
    this.dSlider = createSlider(
      "d",
      1,
      50,
      this.d,
      1,
      this.slidersContainer,
      (label, value) => {
        this[label] = value;
        this.draw();
      }
    );
    // this.progressSlider = createSlider(
    //   "Progression",
    //   0,
    //   360,
    //   this.progress,
    //   1,
    //   this.slidersContainer,
    //   (label, value) => {
    //     this[label] = value;
    //     this.draw();
    //   }
    // );
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.save();
    ctx.translate(this.width / 2, this.height / 2);

    ctx.strokeStyle = `rgba(255, 255, 255, 1)`;
    ctx.lineWidth = 2;

    ctx.beginPath();

    const maxProgress = Math.min(360, this.progress); // Limiter la progression à 360 degrés
    for (let i = 0; i <= maxProgress; i += 2) {
      // Dessiner jusqu'à la valeur de progression
      let k = i * (Math.PI / 180) * this.d;
      let r = 500 * Math.sin(this.n * k);
      let x = r * Math.cos(k);
      let y = r * Math.sin(k);

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.stroke();
    ctx.restore();
  }
}
