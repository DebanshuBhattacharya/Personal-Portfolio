// particle canvas, same as the main page
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let W,
  H,
  particles = [];
const COUNT = 80;

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

class Particle {
  constructor() {
    this.reset();
  }
  reset() {
    this.x = Math.random() * W;
    this.y = Math.random() * H;
    this.r = Math.random() * 1.5 + 0.3;
    this.alpha = Math.random() * 0.35 + 0.5;
    this.vx = (Math.random() - 0.5) * 1.25;
    this.vy = (Math.random() - 0.5) * 1.25;
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(127,90,240,${this.alpha})`;
    ctx.fill();
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
  }
}

for (let i = 0; i < COUNT; i++) particles.push(new Particle());

function loop() {
  ctx.clearRect(0, 0, W, H);
  particles.forEach((p) => {
    p.update();
    p.draw();
  });
  requestAnimationFrame(loop);
}
loop();

// nav background on scroll
const nav = document.getElementById("nav");
window.addEventListener("scroll", () => {
  nav.classList.toggle("scrolled", window.scrollY > 40);
});

// mobile menu
const hamburger = document.querySelector(".hamburger");
const mobileMenu = document.querySelector(".mobile-menu");

hamburger.addEventListener("click", () => {
  const isOpen = hamburger.classList.toggle("open");
  mobileMenu.classList.toggle("open", isOpen);
  hamburger.setAttribute("aria-expanded", isOpen);
});

document.querySelectorAll(".mobile-menu a").forEach((a) => {
  a.addEventListener("click", () => {
    hamburger.classList.remove("open");
    mobileMenu.classList.remove("open");
    hamburger.setAttribute("aria-expanded", "false");
  });
});

// reveal cards as they scroll into view
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const card = entry.target;
        const delay = parseInt(card.dataset.delay || 0);
        setTimeout(() => card.classList.add("show"), delay);
        observer.unobserve(card);
      }
    });
  },
  { threshold: 0.08 },
);

document.querySelectorAll(".project-card").forEach((card, i) => {
  card.dataset.delay = (i % 3) * 80;
  observer.observe(card);
});

// spotlight that follows the cursor
document.querySelectorAll(".project-card").forEach((card) => {
  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--x", `${e.clientX - rect.left}px`);
    card.style.setProperty("--y", `${e.clientY - rect.top}px`);
  });
  card.addEventListener("mouseleave", () => {
    card.style.setProperty("--x", "-9999px");
    card.style.setProperty("--y", "-9999px");
  });
});

// filter buttons
const filterBtns = document.querySelectorAll(".filter-btn");
const cards = document.querySelectorAll(".project-card");

filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    const filter = btn.dataset.filter;
    cards.forEach((card) => {
      const tags = card.dataset.tags || "";
      const match = filter === "all" || tags.includes(filter);
      if (match) {
        card.style.opacity = "1";
        card.style.transform = "translateY(0)";
        card.style.pointerEvents = "";
      } else {
        card.style.opacity = "0.15";
        card.style.transform = "scale(0.97)";
        card.style.pointerEvents = "none";
      }
    });
  });
});

// magnetic hover pull on nav buttons
document.querySelectorAll(".magnetic").forEach((btn) => {
  btn.addEventListener(
    "mousemove",
    (e) => {
      const rect = btn.getBoundingClientRect();
      const xDrift = (e.clientX - rect.left - rect.width / 2) * 0.18;
      const yDrift = (e.clientY - rect.top - rect.height / 2) * 0.18;
      btn.style.transform = `translate(${xDrift}px, ${yDrift}px)`;
    },
    { passive: true },
  );
  btn.addEventListener("mouseleave", () => {
    btn.style.transform = "";
  });
});