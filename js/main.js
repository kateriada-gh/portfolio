import { initThreeScene } from "./three-scene.js";
import { initSiteCommon } from "./site-common.js";

document.addEventListener("DOMContentLoaded", () => {
  initSiteCommon();
  initThree();
});

function initThree() {
  const container = document.getElementById("three-canvas");
  if (!container) return;
  initThreeScene(container);
}
