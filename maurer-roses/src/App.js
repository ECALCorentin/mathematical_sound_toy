import BaseApp from "./BaseApp";
import { createSlidersContainer, createSlider } from "./Sliders.js";
import PresetManager from "./PresetManager.js"; // Import du gestionnaire de presets

export default class App extends BaseApp {
  constructor() {
    super();
    this.init();
    this.setCanvasResolution();
    this.ctx = this.canvas.getContext("2d");
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
    this.presetManager = new PresetManager();

    const savedPreset = this.presetManager.loadPreset("default") || {};
    this.n = savedPreset.n ?? 2;
    this.d = savedPreset.d ?? 29;
    this.progress = savedPreset.progress ?? 360;

    this.slidersContainer = createSlidersContainer();
    this.createSliders();
    this.createPresetControls();
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
        this.nValueDisplay.textContent = ` ${value}`;
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
        this.dValueDisplay.textContent = ` ${value}`;
        this.draw();
      }
    );

    this.nValueDisplay = document.createElement("span");
    this.nValueDisplay.textContent = ` ${this.n}`;
    this.nSlider.parentNode.insertBefore(
      this.nValueDisplay,
      this.nSlider.nextSibling
    );

    this.dValueDisplay = document.createElement("span");
    this.dValueDisplay.textContent = ` ${this.d}`;
    this.dSlider.parentNode.insertBefore(
      this.dValueDisplay,
      this.dSlider.nextSibling
    );
  }

  createPresetControls() {
    const presetContainer = document.createElement("div");
    presetContainer.style.marginTop = "10px";

    [1, 2, 3, 4].forEach((presetNum) => {
      const button = document.createElement("button");
      button.textContent = `Preset ${presetNum}`;
      button.style.margin = "5px";
      button.addEventListener("click", () => this.loadPreset(presetNum));
      presetContainer.appendChild(button);
    });

    const saveButton = document.createElement("button");
    saveButton.textContent = "Sauvegarder";
    saveButton.style.margin = "5px";
    saveButton.addEventListener("click", () => this.savePreset("default"));
    presetContainer.appendChild(saveButton);

    document.body.appendChild(presetContainer);
  }

  savePreset(name) {
    this.presetManager.savePreset(name, {
      n: this.n,
      d: this.d,
      progress: this.progress,
    });
  }

  loadPreset(name) {
    if (!preset.n || !preset.d || !preset.progress) {
      console.warn(
        "Preset corrompu ou incomplet, utilisation des valeurs par défaut."
      );
      preset = { n: 2, d: 29, progress: 360 };
    }

    const preset = this.presetManager.loadPreset(name);
    if (preset) {
      this.n = preset.n;
      this.d = preset.d;
      this.progress = preset.progress;

      this.nSlider.value = this.n;
      this.dSlider.value = this.d;
      this.nValueDisplay.textContent = ` ${this.n}`;
      this.dValueDisplay.textContent = ` ${this.d}`;

      this.draw();
    }
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

    const maxProgress = Math.min(360, this.progress);
    for (let i = 0; i <= maxProgress; i += 2) {
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
