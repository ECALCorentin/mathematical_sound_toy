import BaseApp from "./BaseApp.js";
import { createSlidersContainer, createSlider } from "./Sliders.js";

export default class App extends BaseApp {
  constructor() {
    super();
    this.init();
    this.setCanvasResolution();
    this.ctx = this.canvas.getContext("2d");
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    const savedPreset = this.loadSavedValues();
    this.n = savedPreset ? savedPreset.n : 2;
    this.d = savedPreset ? savedPreset.d : 29;
    this.progress = savedPreset ? savedPreset.progress : 360;

    this.slidersContainer = createSlidersContainer();
    this.createSliders();
    this.createSaveButton();
    this.createSoundToggleButton();
    this.displaySavedValues();

    this.playerProgress = 0;
    this.soundEnabled = false;
    this.lastTrigger = null;
    this.initAudio();

    this.draw();
    this.animatePlayer();
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

  createSaveButton() {
    const saveButton = document.createElement("button");
    saveButton.textContent = "Sauvegarder";
    saveButton.style.margin = "5px";
    saveButton.addEventListener("click", () => this.saveValues());
    document.body.appendChild(saveButton);
  }

  createSoundToggleButton() {
    const button = document.createElement("button");
    button.textContent = "Activer le son";
    button.style.margin = "5px";
    button.addEventListener("click", () => {
      this.soundEnabled = !this.soundEnabled;
      button.textContent = this.soundEnabled
        ? "Désactiver le son"
        : "Activer le son";
      // Nécessaire pour activer l'audio sur certains navigateurs
      this.audioCtx.resume();
    });
    document.body.appendChild(button);
  }

  saveValues() {
    const preset = {
      n: this.n,
      d: this.d,
      progress: this.progress,
    };
    localStorage.setItem("savedPreset", JSON.stringify(preset));
    this.displaySavedValues();
  }

  loadSavedValues() {
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

  initAudio() {
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  playSound(distance) {
    if (!this.soundEnabled) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    // Mapping de la distance vers la fréquence (100Hz - 1000Hz)
    const maxDist = 100; // distance à partir de laquelle on atteint la fréquence minimale
    const minFreq = 200;
    const maxFreq = 1200;
    const freq = Math.max(
      minFreq,
      maxFreq - (distance / maxDist) * (maxFreq - minFreq)
    );

    // Mapping du volume selon la distance
    const minVolume = 0.01;
    const maxVolume = 0.2;
    const volume = Math.max(
      minVolume,
      maxVolume - (distance / maxDist) * (maxVolume - minVolume)
    );

    osc.type = "sine";
    osc.frequency.value = freq;

    gain.gain.setValueAtTime(volume, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      this.audioCtx.currentTime + 0.2
    );

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);
    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.2);
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.save();
    ctx.translate(this.width / 2, this.height / 2);

    const maxProgress = Math.min(360, this.progress);
    const step = 2;

    const blackPoints = [];
    const bluePoints = [];
    this.intersections = [];

    // Courbe noire
    for (let i = 0; i <= maxProgress; i += step) {
      let k = i * (Math.PI / 180) * this.d;
      let r = 500 * Math.sin(this.n * k);
      let x = r * Math.cos(k);
      let y = r * Math.sin(k);
      blackPoints.push({ x, y });

      ctx.strokeStyle = `black`;
      if (i > 0) {
        ctx.beginPath();
        ctx.moveTo(
          blackPoints[blackPoints.length - 2].x,
          blackPoints[blackPoints.length - 2].y
        );
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    }

    // Courbe bleue
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 1.5;
    for (let i = 0; i <= maxProgress; i += step) {
      let k = i * (Math.PI / 180);
      let r = 500 * Math.sin(this.n * k);
      let x = r * Math.cos(k);
      let y = r * Math.sin(k);
      bluePoints.push({ x, y });
    }

    ctx.beginPath();
    for (let i = 0; i < bluePoints.length; i++) {
      const { x, y } = bluePoints[i];
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Intersections
    ctx.fillStyle = "blue";
    for (let i = 0; i < blackPoints.length - 1; i++) {
      const p1 = blackPoints[i];
      const p2 = blackPoints[i + 1];
      for (let j = 0; j < bluePoints.length - 1; j++) {
        const q1 = bluePoints[j];
        const q2 = bluePoints[j + 1];
        const intersection = this.getLineIntersection(p1, p2, q1, q2);
        if (intersection) {
          this.intersections.push(intersection);
          const dx = intersection.x;
          const dy = intersection.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const maxRadius = 4;
          const minRadius = 4;
          const radius = maxRadius - (distance / 500) * (maxRadius - minRadius);
          const clampedRadius = Math.max(
            minRadius,
            Math.min(maxRadius, radius)
          );

          ctx.beginPath();
          ctx.arc(
            intersection.x,
            intersection.y,
            clampedRadius,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
      }
    }

    // Player
    const playerIndex = this.playerProgress;
    const playerPoint = bluePoints[playerIndex];

    if (playerPoint) {
      const before = bluePoints[Math.max(0, playerIndex - 5)];
      const after =
        bluePoints[Math.min(bluePoints.length - 1, playerIndex + 5)];

      ctx.fillStyle = "blue";
      ctx.beginPath();
      ctx.arc(playerPoint.x, playerPoint.y, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "transparent";
      ctx.lineWidth = 1.5;

      if (before) {
        ctx.beginPath();
        ctx.moveTo(playerPoint.x, playerPoint.y);
        ctx.lineTo(before.x, before.y);
        ctx.stroke();
      }

      if (after) {
        ctx.beginPath();
        ctx.moveTo(playerPoint.x, playerPoint.y);
        ctx.lineTo(after.x, after.y);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  animatePlayer() {
    const maxProgress = Math.min(360, this.progress);
    const step = 2;
    const totalSteps = maxProgress / step;

    if (!this.frameCounter) this.frameCounter = 0;
    this.frameCounter++;

    const speed = 0.2;
    if (this.frameCounter >= 1 / speed) {
      this.playerProgress += 1;
      this.frameCounter = 0;
    }

    if (this.playerProgress >= totalSteps) {
      this.playerProgress = 0;
    }

    const playerIndex = this.playerProgress;
    const maxStep = Math.floor(this.progress / step);
    if (playerIndex < maxStep) {
      const k = playerIndex * step * (Math.PI / 180);
      const r = 500 * Math.sin(this.n * k);
      const x = r * Math.cos(k);
      const y = r * Math.sin(k);
      this.checkIntersectionProximity({ x, y });
    }

    this.draw();
    requestAnimationFrame(() => this.animatePlayer());
  }

  checkIntersectionProximity(playerPoint) {
    const threshold = 10;
    for (const point of this.intersections) {
      const dx = point.x - playerPoint.x;
      const dy = point.y - playerPoint.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < threshold) {
        if (!this.lastTrigger || Date.now() - this.lastTrigger > 100) {
          this.lastTrigger = Date.now();
          this.playSound(dist);
        }
        break;
      }
    }
  }

  getLineIntersection(p1, p2, q1, q2) {
    const det = (p2.x - p1.x) * (q2.y - q1.y) - (p2.y - p1.y) * (q2.x - q1.x);
    if (det === 0) return null;

    const t =
      ((q1.x - p1.x) * (q2.y - q1.y) - (q1.y - p1.y) * (q2.x - q1.x)) / det;
    const u =
      ((q1.x - p1.x) * (p2.y - p1.y) - (q1.y - p1.y) * (p2.x - p1.x)) / det;

    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      return {
        x: p1.x + t * (p2.x - p1.x),
        y: p1.y + t * (p2.y - p1.y),
      };
    }

    return null;
  }
}
