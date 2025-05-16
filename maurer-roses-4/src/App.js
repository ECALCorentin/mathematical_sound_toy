import BaseApp from "./BaseApp.js";
import { createSlidersContainer, createSlider } from "./_DrawRoses.js";

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
    this.displaySavedValues();

    this.playerProgress = 0;
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
}
