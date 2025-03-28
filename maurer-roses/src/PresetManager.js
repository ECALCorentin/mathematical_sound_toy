export default class PresetManager {
  constructor() {
    this.storageKey = "app_presets";
    this.presets = this.loadAllPresets();
  }

  loadAllPresets() {
    const storedPresets = localStorage.getItem(this.storageKey);
    return storedPresets ? JSON.parse(storedPresets) : {};
  }

  saveAllPresets() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.presets));
  }

  savePreset(name, data) {
    this.presets[name] = data;
    this.saveAllPresets();
  }

  loadPreset(name) {
    return this.presets[name] || null;
  }
}
