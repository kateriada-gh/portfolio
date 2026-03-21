import { initThreeScene } from "./three-scene.js";

document.addEventListener("DOMContentLoaded", () => {
  initBurgerMenu();
  initThree();
  loadCards("ceramics");
  loadCards("dolls");
  initScrollReveal();
});

function initBurgerMenu() {
  const burger = document.querySelector(".header__burger");
  const nav = document.querySelector(".header__nav");
  if (!burger || !nav) return;

  burger.addEventListener("click", () => {
    burger.classList.toggle("active");
    nav.classList.toggle("open");
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      burger.classList.remove("active");
      nav.classList.remove("open");
    });
  });
}

function initThree() {
  const container = document.getElementById("three-canvas");
  if (!container) return;
  initThreeScene(container);
}

async function loadCards(category) {
  const grid = document.getElementById(`${category}-grid`);
  if (!grid) return;

  try {
    const response = await fetch(`data/${category}.json`);
    const items = await response.json();

    grid.innerHTML = items.map((item) => createCard(item, category)).join("");
  } catch (err) {
    grid.innerHTML = `<p style="color: var(--color-text-secondary); grid-column: 1 / -1; text-align: center;">Could not load items.</p>`;
  }
}

function createCard(item, category) {
  const imageContent = item.thumbnail
    ? `<img src="${item.thumbnail}" alt="${item.title}" loading="lazy">`
    : `<div class="placeholder-img">${item.title}</div>`;

  return `
    <a id="${item.id}" href="item.html?category=${category}&id=${item.id}" class="card">
      <div class="card__image-wrapper">
        ${imageContent}
      </div>
    </a>
  `;
}

function initScrollReveal() {
  const sections = document.querySelectorAll(".section, .threejs-section");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  sections.forEach((section) => {
    section.classList.add("reveal");
    observer.observe(section);
  });
}
