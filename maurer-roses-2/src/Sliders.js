// sliders.js
export function createSlidersContainer() {
  const slidersContainer = document.createElement("div");
  slidersContainer.classList.add("sliders-container");
  document.body.appendChild(slidersContainer);
  return slidersContainer;
}

export function createSlider(
  label,
  min,
  max,
  value,
  step,
  container,
  callback
) {
  const sliderContainer = document.createElement("div");
  sliderContainer.classList.add("slider-container");
  sliderContainer.style.left =
    label === "n" ? "10px" : label === "Progression" ? "230px" : "120px"; // Position ajustée pour le slider de progression
  sliderContainer.style.color = "white";

  const text = document.createElement("span");
  text.innerText = `${label}: `;
  sliderContainer.appendChild(text);

  const slider = document.createElement("input");
  slider.type = "range";
  slider.min = min;
  slider.max = max;
  slider.value = value;
  slider.step = step;
  sliderContainer.appendChild(slider);

  container.appendChild(sliderContainer);

  slider.addEventListener("input", (e) => {
    callback(label, parseFloat(e.target.value));
  });

  return slider;
}
