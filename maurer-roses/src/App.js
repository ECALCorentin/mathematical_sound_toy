import BaseApp from "./BaseApp";

export default class App extends BaseApp {
  constructor() {
    super();
    this.init();
    this.ctx = this.canvas.getContext("2d");
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
    this.n = 2;
    this.d = 29;
    this.progress = 0; // Progression du dessin
    this.animate();
  }

  init() {
    this.canvas.style.backgroundColor = "black";
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.save();
    ctx.translate(this.width / 2, this.height / 2);

    let alpha = this.progress / 361; // Opacité de 0 à 1
    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.lineWidth = 2;

    ctx.beginPath();

    for (let i = 0; i < this.progress; i++) {
      // Dessiner progressivement
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

  animate() {
    if (this.progress < 361) {
      this.progress += 2; // Augmenter la progression
    } else {
      this.progress - 2; // Réinitialiser
    }

    this.draw();
    requestAnimationFrame(this.animate.bind(this)); // Boucle d'animation
  }
}
