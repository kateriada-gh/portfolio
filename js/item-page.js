document.addEventListener("DOMContentLoaded", () => {
  setHeaderBackFromCategory();
  initBurgerMenu();
  loadItem();
});

function setHeaderBackFromCategory() {
  const back = document.querySelector(".header__back");
  if (!back) return;
  const category = new URLSearchParams(window.location.search).get("category");
  if (category && /^[a-z0-9-]+$/i.test(category)) {
    back.setAttribute("href", `${category}.html`);
  } else {
    back.setAttribute("href", "index.html");
  }
}

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

  const headerBack = document.querySelector(".header__back");
  if (headerBack) {
    headerBack.addEventListener("click", () => {
      burger.classList.remove("active");
      nav.classList.remove("open");
    });
  }
}

async function loadItem() {
  const params = new URLSearchParams(window.location.search);
  const category = params.get("category");
  const id = params.get("id");

  if (!category || !id) {
    showError("Item not found.");
    return;
  }

  try {
    const response = await fetch(`data/${category}.json`);
    if (!response.ok) throw new Error("Not found");
    const items = await response.json();
    const item = items.find((i) => i.id === id);

    if (!item) {
      showError("Item not found.");
      return;
    }

    renderItem(item, category);
  } catch {
    showError("Could not load item data.");
  }
}

function renderItem(item, category) {
  document.title = `${item.title} — Portfolio`;

  const mainImg = document.getElementById("item-main-image");
  const thumbsContainer = document.getElementById("item-thumbs");

  const allImages = item.images && item.images.length > 0 ? item.images : [];

  if (allImages.length > 0) {
    mainImg.innerHTML = `<img src="${allImages[0]}" alt="${item.title}">`;
    thumbsContainer.innerHTML = allImages
      .map(
        (src, i) =>
          `<button class="item-gallery__thumb ${i === 0 ? "active" : ""}" data-src="${src}">
            <img src="${src}" alt="${item.title} — photo ${i + 1}">
          </button>`
      )
      .join("");

    thumbsContainer.addEventListener("click", (e) => {
      const thumb = e.target.closest(".item-gallery__thumb");
      if (!thumb) return;
      mainImg.innerHTML = `<img src="${thumb.dataset.src}" alt="${item.title}">`;
      thumbsContainer
        .querySelectorAll(".item-gallery__thumb")
        .forEach((t) => t.classList.remove("active"));
      thumb.classList.add("active");
    });
  } else {
    mainImg.innerHTML = `<div class="placeholder-img">${item.title}</div>`;
    thumbsContainer.style.display = "none";
  }

  document.getElementById("item-title").textContent = item.title;
  document.getElementById("item-description").textContent = item.description || "";

  const detailsEl = document.getElementById("item-details");
  if (item.details) {
    detailsEl.innerHTML = Object.entries(item.details)
      .map(([key, value]) => `<dt>${capitalize(key)}</dt><dd>${value}</dd>`)
      .join("");
  }
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function showError(message) {
  const content = document.querySelector(".item-page .container");
  if (content) {
    content.innerHTML = `<p style="text-align:center; color: var(--color-text-secondary); padding: 60px 0;">${message}</p>`;
  }
}
