import BaseApp from "./BaseApp";
import { createSlidersContainer, createSlider } from "./Sliders.js";

export default class App extends BaseApp {
  constructor() {
    super();
    this.init();
    this.setCanvasResolution();
    this.ctx = this.canvas.getContext("2d");
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;

    // Charger les presets sauvegardés à partir du localStorage
    const savedPreset = this.loadSavedValues();
    this.n = savedPreset ? savedPreset.n : 2;
    this.d = savedPreset ? savedPreset.d : 29;
    this.progress = savedPreset ? savedPreset.progress : 360;

    this.slidersContainer = createSlidersContainer();
    this.createSliders();
    this.createSaveButton();
    this.displaySavedValues(); // Afficher les valeurs si elles existent déjà
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

    // Créer des éléments d'affichage des valeurs sous les sliders
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

  createSaveButton() {
    const saveButton = document.createElement("button");
    saveButton.textContent = "Sauvegarder";
    saveButton.style.margin = "5px";
    saveButton.addEventListener("click", () => this.saveValues());
    document.body.appendChild(saveButton);
  }

  saveValues() {
    // Sauvegarder les valeurs dans localStorage
    const preset = {
      n: this.n,
      d: this.d,
      progress: this.progress,
    };

    // Sauvegarder sous un nom 'savedPreset' dans localStorage
    localStorage.setItem("savedPreset", JSON.stringify(preset));

    // Afficher les valeurs sous les sliders
    this.displaySavedValues();
  }

  loadSavedValues() {
    // Charger les valeurs depuis localStorage
    const savedPreset = localStorage.getItem("savedPreset");
    return savedPreset ? JSON.parse(savedPreset) : null;
  }

  displaySavedValues() {
    const savedPreset = this.loadSavedValues();

    if (savedPreset) {
      const savedValuesContainer = document.createElement("div");
      savedValuesContainer.classList.add("saved-values-container");
      savedValuesContainer.style.marginTop = "10px";

      const nValue = document.createElement("p");
      nValue.textContent = `${savedPreset.n}`;
      savedValuesContainer.appendChild(nValue);

      const dValue = document.createElement("p");
      dValue.textContent = `${savedPreset.d}`;
      savedValuesContainer.appendChild(dValue);

      const progressValue = document.createElement("p");
      progressValue.textContent = `${savedPreset.progress}`;
      savedValuesContainer.appendChild(progressValue);

      document.body.appendChild(savedValuesContainer);
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
