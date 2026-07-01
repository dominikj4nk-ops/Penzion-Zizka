const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const tripCards = document.querySelectorAll(".trip-detail-card");
const tripCount = document.querySelector("#trip-count");
const tripHeroRotator = document.querySelector("[data-trip-hero-rotator]");

const storeHomeTarget = (target) => {
  if (!target) {
    return;
  }

  try {
    window.sessionStorage.setItem("scrollTarget", target);
  } catch (error) {
  }
};

const updateTripResults = () => {
  if (!tripCount) {
    return;
  }

  const visibleCount = tripCards.length;

  tripCount.textContent = `${visibleCount} ${visibleCount === 1 ? "tip" : visibleCount > 1 && visibleCount < 5 ? "tipy" : "tipů"}`;
};

navToggle?.addEventListener("click", () => {
  const expanded = navToggle.getAttribute("aria-expanded") === "true";
  navToggle.setAttribute("aria-expanded", String(!expanded));
  siteNav.classList.toggle("is-open");
});

siteNav?.addEventListener("click", (event) => {
  const link = event.target.closest("a");

  if (!link) {
    return;
  }

  navToggle.setAttribute("aria-expanded", "false");
  siteNav.classList.remove("is-open");
});

document.querySelectorAll("[data-home-target]").forEach((link) => {
  link.addEventListener("click", () => {
    storeHomeTarget(link.dataset.homeTarget);
  });
});

if (tripHeroRotator && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const heroPhotos = Array.from(tripHeroRotator.querySelectorAll("img"));

  if (heroPhotos.length > 1) {
    let activeHeroPhoto = Math.max(0, heroPhotos.findIndex((photo) => photo.classList.contains("is-active")));

    window.setInterval(() => {
      heroPhotos[activeHeroPhoto].classList.remove("is-active");
      activeHeroPhoto = (activeHeroPhoto + 1) % heroPhotos.length;
      heroPhotos[activeHeroPhoto].classList.add("is-active");
    }, 3800);
  }
}

updateTripResults();
