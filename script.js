/* Small script: music, gate, scroll reveals, parallax, countdown */

const gate = document.getElementById("gate");
const enterBtn = document.getElementById("enterBtn");
const music = document.getElementById("bgMusic");
const toggle = document.getElementById("musicToggle");

/* ─── Music with gentle fade in/out ─── */
function fadeVolume(target, duration = 1500) {
  const start = music.volume;
  const t0 = performance.now();
  return new Promise((resolve) => {
    function step(now) {
      const p = Math.min((now - t0) / duration, 1);
      music.volume = start + (target - start) * p;
      p < 1 ? requestAnimationFrame(step) : resolve();
    }
    requestAnimationFrame(step);
  });
}

async function playMusic() {
  try {
    music.volume = 0;
    await music.play();
    toggle.classList.add("is-playing");
    fadeVolume(0.6, 2500);
  } catch (e) {
    /* No file yet, or the browser blocked it — the site still works */
  }
}

async function pauseMusic() {
  await fadeVolume(0, 800);
  music.pause();
  toggle.classList.remove("is-playing");
}

/* Keep looping even where the loop attribute is ignored (some mobile browsers) */
music.loop = true;
music.addEventListener("ended", () => {
  music.currentTime = 0;
  music.play().catch(() => {});
});

toggle.addEventListener("click", () => {
  music.paused ? playMusic() : pauseMusic();
});

/* ─── Entry gate (browsers only allow audio after a tap) ─── */
enterBtn.addEventListener("click", () => {
  playMusic();
  gate.classList.add("is-open");
  document.body.classList.remove("is-locked");
  // Let the hero text develop as the gate dissolves
  setTimeout(() => {
    document.querySelectorAll(".hero .reveal").forEach((el) => el.classList.add("is-visible"));
  }, 500);
});

/* ─── Scroll reveal ─── */
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
);
document.querySelectorAll(".reveal:not(.hero .reveal)").forEach((el) => observer.observe(el));

/* ─── Soft parallax on background layers ─── */
const layers = document.querySelectorAll("[data-parallax]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let ticking = false;

function parallax() {
  layers.forEach((layer) => {
    const rect = layer.parentElement.getBoundingClientRect();
    const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * -0.15;
    layer.style.transform = `translate3d(0, ${offset}px, 0)`;
  });
  ticking = false;
}
if (!reduceMotion) {
  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(parallax);
      ticking = true;
    }
  }, { passive: true });
  parallax();
}

/* ─── Countdown ─── */
const countdown = document.getElementById("countdown");
const target = new Date(countdown.dataset.date).getTime();
const units = {
  days: countdown.querySelector('[data-unit="days"]'),
  hours: countdown.querySelector('[data-unit="hours"]'),
  minutes: countdown.querySelector('[data-unit="minutes"]'),
  seconds: countdown.querySelector('[data-unit="seconds"]'),
};

function tick() {
  const diff = Math.max(target - Date.now(), 0);
  const pad = (n) => String(n).padStart(2, "0");
  units.days.textContent = pad(Math.floor(diff / 86400000));
  units.hours.textContent = pad(Math.floor(diff / 3600000) % 24);
  units.minutes.textContent = pad(Math.floor(diff / 60000) % 60);
  units.seconds.textContent = pad(Math.floor(diff / 1000) % 60);
}
tick();
setInterval(tick, 1000);
