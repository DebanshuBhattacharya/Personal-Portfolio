/* ============================================================
   PORTFOLIO ANIMATIONS — GSAP
   Organized into logical, commented sections. All animations
   respect prefers-reduced-motion and stay on transform/opacity
   for GPU-accelerated performance.
   ============================================================ */

gsap.registerPlugin(ScrollTrigger);

/* Global easing + duration defaults so every tween shares the
   same "premium" feel unless intentionally overridden. */
gsap.defaults({
  ease: "power3.out",
  duration: 0.9,
});

/* Respect the user's motion preference. When true, we skip
   scroll/mouse-driven motion and any decorative animation,
   but keep functional JS (nav toggle, form validation, etc). */
const REDUCED_MOTION = window.matchMedia(
  "(prefers-reduced-motion: reduce)",
).matches;

/* ============================================================
   SCROLL PROGRESS BAR
   ============================================================ */
const scrollProgress = document.getElementById("scroll-progress");

function updateScrollProgress() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  if (scrollProgress) scrollProgress.style.width = `${progress}%`;
}

window.addEventListener("scroll", updateScrollProgress, { passive: true });
updateScrollProgress(); // initialise on load

/* ============================================================
   CANVAS PARTICLES  (unchanged logic, kept as-is — it's cheap
   and already GPU/canvas driven)
   ============================================================ */
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

/* ============================================================
   CURSOR GLOW — lightweight, GPU-cheap follower.
   Uses gsap.quickTo for buttery interpolation instead of
   setting style on every mousemove (avoids layout thrash).
   ============================================================ */

const cursor = document.querySelector("#cursor");

const xTo = gsap.quickTo(cursor, "x", {
  duration: 0.3,
  ease: "power3.out",
});

const yTo = gsap.quickTo(cursor, "y", {
  duration: 0.3,
  ease: "power3.out",
});

window.addEventListener("mousemove", (e) => {
  xTo(e.clientX);
  yTo(e.clientY);
});

/* ============================================================
   NAV — SCROLLED STATE
   ============================================================ */
const nav = document.querySelector("#nav");
window.addEventListener(
  "scroll",
  () => {
    nav.classList.toggle("scrolled", window.scrollY > 60);
  },
  { passive: true },
);

/* ============================================================
   NAV — ACTIVE SECTION HIGHLIGHTING (ScrollTrigger)
   Each section gets a trigger that toggles the matching
   nav link's `.active` class as it crosses the viewport centre.
   ============================================================ */
const navLinkMap = {};
document.querySelectorAll(".nav-links a[data-nav]").forEach((link) => {
  navLinkMap[link.dataset.nav] = link;
});

document.querySelectorAll("section[id]").forEach((section) => {
  const link = navLinkMap[section.id];
  if (!link) return;
  ScrollTrigger.create({
    trigger: section,
    start: "top center",
    end: "bottom center",
    onEnter: () => setActiveLink(link),
    onEnterBack: () => setActiveLink(link),
  });
});

function setActiveLink(activeLink) {
  Object.values(navLinkMap).forEach((l) => l.classList.remove("active"));
  activeLink.classList.add("active");
}

/* ============================================================
   MOBILE HAMBURGER MENU
   ============================================================ */
const hamburger = document.getElementById("hamburger");
const mobileMenu = document.getElementById("mobile-menu");

function closeMenu() {
  hamburger.classList.remove("open");
  hamburger.setAttribute("aria-expanded", "false");
  mobileMenu.classList.remove("open");
  mobileMenu.setAttribute("aria-hidden", "true");
}

hamburger.addEventListener("click", () => {
  const isOpen = hamburger.classList.toggle("open");
  hamburger.setAttribute("aria-expanded", String(isOpen));
  mobileMenu.classList.toggle("open", isOpen);
  mobileMenu.setAttribute("aria-hidden", String(!isOpen));
});

mobileMenu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

/* ============================================================
   SMOOTH SCROLL — INTERNAL LINKS
   ============================================================ */
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (e) => {
    const href = link.getAttribute("href");
    if (href === "#") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: "smooth" });
  });
});

/* ============================================================
   BACK TO TOP
   ============================================================ */
const backToTop = document.getElementById("back-to-top");
if (backToTop) {
  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* ============================================================
   MAGNETIC BUTTONS — smoothed with gsap.quickTo instead of
   raw style writes, so the pull feels springy rather than
   1-to-1 with the cursor.
   ============================================================ */
document.querySelectorAll(".magnetic").forEach((btn) => {
  if (REDUCED_MOTION) return;
  const moveX = gsap.quickTo(btn, "x", { duration: 0.5, ease: "power3.out" });
  const moveY = gsap.quickTo(btn, "y", { duration: 0.5, ease: "power3.out" });

  btn.addEventListener(
    "mousemove",
    (e) => {
      const rect = btn.getBoundingClientRect();
      const xDrift = (e.clientX - rect.left - rect.width / 2) * 0.25;
      const yDrift = (e.clientY - rect.top - rect.height / 2) * 0.25;
      moveX(xDrift);
      moveY(yDrift);
    },
    { passive: true },
  );
  btn.addEventListener("mouseleave", () => {
    moveX(0);
    moveY(0);
  });
});

/* ============================================================
   RIPPLE EFFECT — subtle click feedback on .btn elements
   ============================================================ */
document.querySelectorAll(".btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const rect = btn.getBoundingClientRect();
    const ripple = document.createElement("span");
    ripple.className = "btn-ripple";
    const size = Math.max(rect.width, rect.height) * 1.4;
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size / 2}px`;
    ripple.style.top = `${e.clientY - rect.top - size / 2}px`;
    btn.appendChild(ripple);

    gsap.fromTo(
      ripple,
      { scale: 0, opacity: 0.55 },
      {
        scale: 1,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
        onComplete: () => ripple.remove(),
      },
    );
  });
});

/* ============================================================
   HERO — CINEMATIC ENTRANCE TIMELINE
   Nav drops in → headline lines wipe up → sub fades → actions
   fade → scroll indicator fades in and starts its float loop.
   ============================================================ */
const heroTl = gsap.timeline({ defaults: { ease: "power4.out" } });

heroTl
  .from("#nav", { opacity: 0, y: -60, duration: 0.7, ease: "back.out(1.6)" })
  .from(".eyebrow", { opacity: 0, y: 16, duration: 0.6 }, "-=0.25")
  .to(".eyebrow", { opacity: 1, y: 0, duration: 0.6 }, "<")
  .to(
    ".hero-line-inner",
    { y: "0%", duration: 1.1, stagger: 0.14, ease: "power4.out" },
    "-=0.2",
  )
  .to(
    ".hero-sub",
    { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
    "-=0.55",
  )
  .to(
    ".hero-actions",
    { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" },
    "-=0.55",
  )
  .to(
    ".scroll-indicator",
    { opacity: 1, duration: 0.6, ease: "power2.out" },
    "-=0.3",
  );

/* Scroll indicator — gentle bobbing loop + fade out once the
   user actually starts scrolling. */
if (!REDUCED_MOTION) {
  gsap.to(".scroll-indicator__dot", {
    y: 10,
    opacity: 0.3,
    duration: 1.1,
    repeat: -1,
    yoyo: true,
    ease: "power1.inOut",
    delay: 2,
  });
}
ScrollTrigger.create({
  trigger: ".hero",
  start: "top top",
  end: "bottom top",
  onUpdate: (self) => {
    gsap.to(".scroll-indicator", {
      opacity: 1 - self.progress * 2,
      duration: 0.2,
      overwrite: "auto",
    });
  },
});

/* Hero mouse parallax — headline + eyebrow drift very slightly
   opposite the cursor for a subtle depth effect. Skipped on
   touch devices and reduced-motion. */
if (!REDUCED_MOTION && window.matchMedia("(hover: hover)").matches) {
  const heroSection = document.querySelector(".hero");
  const parallaxX = gsap.quickTo(".hero-headline", "x", {
    duration: 0.8,
    ease: "power3.out",
  });
  const parallaxY = gsap.quickTo(".hero-headline", "y", {
    duration: 0.8,
    ease: "power3.out",
  });
  heroSection.addEventListener(
    "mousemove",
    (e) => {
      const rect = heroSection.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width - 0.5;
      const relY = (e.clientY - rect.top) / rect.height - 0.5;
      parallaxX(relX * -18);
      parallaxY(relY * -10);
    },
    { passive: true },
  );
  heroSection.addEventListener("mouseleave", () => {
    parallaxX(0);
    parallaxY(0);
  });
}

/* Per-character hover glow on the name "Debanshu" (kept from
   original, now driven off the same GSAP instance for
   consistency and reduced-motion safety). */
function hoverGlow(className) {
  document.querySelectorAll(`.${className} span`).forEach((elem) => {
    elem.addEventListener("mouseenter", () => {
      gsap.to(elem, { color: "#7f5af0", duration: 0.3 });
    });
    elem.addEventListener("mouseleave", () => {
      gsap.to(elem, { color: "#888892", duration: 0.3 });
    });
  });
}
hoverGlow("debanshu");

const debanshuEl = document.querySelector("#debanshu");
let debanshuClicks = 0;
if (debanshuEl) {
  debanshuEl.addEventListener("click", () => {
    debanshuClicks++;
    gsap.fromTo(
      debanshuEl,
      { scale: 1 },
      {
        scale: 1.08,
        duration: 0.15,
        yoyo: true,
        repeat: 1,
        ease: "power2.out",
      },
    );
  });
}

/* ============================================================
   SECTION FADE-IN — generic reveal used by every top-level
   <section>. Replaces the old per-section gsap.fromTo loop with
   a single matchMedia-aware batch so it responds correctly on
   resize/orientation change and is easy to extend.
   ============================================================ */
gsap.matchMedia().add(
  {
    reduced: "(prefers-reduced-motion: reduce)",
    full: "(prefers-reduced-motion: no-preference)",
  },
  (context) => {
    const { reduced } = context.conditions;

    document.querySelectorAll("section").forEach((section) => {
      gsap.fromTo(section, reduced ? {} : { opacity: 0, y: 40 }, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: {
          trigger: section,
          start: "top 55%",
          end: "top 30%",
          toggleActions: "play none none reverse",
        },
      });
    });
  },
);

/* ============================================================
   ABOUT — clip-path image reveal, staggered content, parallax
   ============================================================ */
const aboutImageFrame = document.querySelector(".about-sec .image-frame");
if (aboutImageFrame) {
  gsap.fromTo(
    aboutImageFrame,
    { clipPath: "inset(100% 0% 0% 0%)" },
    {
      clipPath: "inset(0% 0% 0% 0%)",
      duration: 1.2,
      ease: "power4.inOut",
      scrollTrigger: {
        trigger: aboutImageFrame,
        start: "top 80%",
        toggleActions: "play none none reverse",
      },
    },
  );

  // Subtle parallax drift on the photo itself while scrolling past
  if (!REDUCED_MOTION) {
    gsap.fromTo(
      aboutImageFrame.querySelector("img"),
      { y: -30 },
      {
        y: 30,
        ease: "none",
        scrollTrigger: {
          trigger: ".about-sec",
          start: "top bottom",
          end: "bottom top",
          scrub: 0.6,
        },
      },
    );
  }
}

// Staggered reveal of the About copy lines + floating card
const aboutTl = gsap.timeline({
  scrollTrigger: {
    trigger: ".about-sec",
    start: "top 65%",
    toggleActions: "play none none reverse",
  },
});
aboutTl
  .from(".about-sec .section-label", { opacity: 0, y: 16, duration: 0.6 })
  .from(
    ".about-content .section-body > *",
    { opacity: 0, y: 22, duration: 0.7, stagger: 0.12 },
    "-=0.3",
  )
  .from(
    ".floating-card",
    { opacity: 0, y: 20, scale: 0.95, duration: 0.7, ease: "back.out(1.5)" },
    "-=0.3",
  );

/* ============================================================
   PROJECTS — CARD REVEAL, LIFT + TILT, IMAGE ZOOM
   ============================================================ */
const projectCards = document.querySelectorAll(".project-card");

// Staggered entrance driven by ScrollTrigger (replaces manual
// IntersectionObserver + setTimeout combo for smoother, scroll
// position–aware timing).
if (projectCards.length) {
  gsap.to(projectCards, {
    opacity: 1,
    y: 0,
    duration: 0.8,
    ease: "power3.out",
    stagger: 0.12,
    scrollTrigger: {
      trigger: ".project-grid",
      start: "top 80%",
      toggleActions: "play none none reverse",
    },
  });
}

projectCards.forEach((card) => {
  const img = card.querySelector(".project-img");
  const tiltX = gsap.quickTo(card, "rotationX", {
    duration: 0.4,
    ease: "power3.out",
  });
  const tiltY = gsap.quickTo(card, "rotationY", {
    duration: 0.4,
    ease: "power3.out",
  });
  const liftY = gsap.quickTo(card, "y", { duration: 0.4, ease: "power3.out" });

  gsap.set(card, { transformPerspective: 1000, transformOrigin: "center" });

  card.addEventListener(
    "mousemove",
    (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      card.style.setProperty("--x", `${x}px`);
      card.style.setProperty("--y", `${y}px`);

      if (REDUCED_MOTION) return;
      tiltY((x / rect.width - 0.5) * 8);
      tiltX(-(y / rect.height - 0.5) * 8);
      liftY(-4);
      if (img) gsap.to(img, { scale: 1.08, duration: 0.5, ease: "power2.out" });
    },
    { passive: true },
  );

  card.addEventListener("mouseleave", () => {
    card.style.setProperty("--x", "-9999px");
    card.style.setProperty("--y", "-9999px");
    tiltX(0);
    tiltY(0);
    liftY(0);
    if (img) gsap.to(img, { scale: 1, duration: 0.5, ease: "power2.out" });
  });

  card.addEventListener("click", () => {
    window.location.href = "projects.html";
  });
});

/* ============================================================
   SKILLS — staggered card entrance + magnetic-style tilt
   (kept lightweight: no separate progress bars in the markup,
   so we animate opacity/translate + existing 3D tilt instead).
   ============================================================ */
const skillBoxes = document.querySelectorAll(".skill-box");
if (skillBoxes.length) {
  gsap.to(skillBoxes, {
    opacity: 1,
    y: 0,
    duration: 0.7,
    ease: "power3.out",
    stagger: 0.1,
    scrollTrigger: {
      trigger: ".skill-showcase",
      start: "top 82%",
      toggleActions: "play none none reverse",
    },
  });
}

skillBoxes.forEach((card) => {
  const tiltX = gsap.quickTo(card, "rotationX", {
    duration: 0.4,
    ease: "power3.out",
  });
  const tiltY = gsap.quickTo(card, "rotationY", {
    duration: 0.4,
    ease: "power3.out",
  });
  gsap.set(card, { transformPerspective: 1000 });

  card.addEventListener(
    "mousemove",
    (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty("--x", `${x}px`);
      card.style.setProperty("--y", `${y}px`);
      if (REDUCED_MOTION) return;
      tiltY((x / rect.width - 0.5) * 7);
      tiltX(-(y / rect.height - 0.5) * 7);
    },
    { passive: true },
  );

  card.addEventListener("mouseleave", () => {
    card.style.removeProperty("--x");
    card.style.removeProperty("--y");
    tiltX(0);
    tiltY(0);
  });

  // Icon micro-interaction: gentle rotate + scale pop on hover
  const icon = card.querySelector(".skill-icon");
  if (icon) {
    card.addEventListener("mouseenter", () => {
      gsap.to(icon, {
        rotate: -12,
        scale: 1.15,
        duration: 0.35,
        ease: "back.out(2)",
      });
    });
    card.addEventListener("mouseleave", () => {
      gsap.to(icon, {
        rotate: 0,
        scale: 1,
        duration: 0.35,
        ease: "power2.out",
      });
    });
  }
});

/* ============================================================
   TIMELINE — animated vertical "draw" line (scrubbed to scroll)
   + staggered card entrance + active-dot highlighting
   ============================================================ */
const timelineProgress = document.querySelector(".timeline-progress");
if (timelineProgress) {
  gsap.to(timelineProgress, {
    scaleY: 1,
    ease: "none",
    scrollTrigger: {
      trigger: ".timeline",
      start: "top 70%",
      end: "bottom 60%",
      scrub: 0.4,
    },
  });
}

const timelineItems = document.querySelectorAll(".timeline-item");
timelineItems.forEach((item, i) => {
  const dot = item.querySelector(".timeline-dot");
  ScrollTrigger.create({
    trigger: item,
    start: "top 75%",
    onEnter: () => {
      item.classList.add("show");
      gsap.to(item, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        delay: i * 0.05,
        ease: "power3.out",
      });
      if (dot) dot.classList.add("active");
    },
    onLeaveBack: () => {
      item.classList.remove("show");
      gsap.to(item, { opacity: 0, y: 30, duration: 0.4 });
      if (dot) dot.classList.remove("active");
    },
  });
});

/* ============================================================
   EDUCATION — counters + detail-card spotlight (spotlight
   logic kept, counters are new)
   ============================================================ */
document.querySelectorAll("[data-counter]").forEach((el) => {
  const target = parseFloat(el.dataset.counter);
  const suffix = el.dataset.suffix || "";
  const counterObj = { val: 0 };

  ScrollTrigger.create({
    trigger: el,
    start: "top 85%",
    once: true,
    onEnter: () => {
      gsap.to(counterObj, {
        val: target,
        duration: 1.4,
        ease: "power2.out",
        onUpdate: () => {
          el.textContent = `${Math.round(counterObj.val)}${suffix}`;
        },
      });
    },
  });
});

document.querySelectorAll(".edu-detail-card").forEach((card) => {
  card.addEventListener(
    "mousemove",
    (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - rect.left}px`);
      card.style.setProperty("--my", `${e.clientY - rect.top}px`);
    },
    { passive: true },
  );
  card.addEventListener("mouseleave", () => {
    card.style.removeProperty("--mx");
    card.style.removeProperty("--my");
  });
});

// Education detail cards + journey steps stagger in on scroll
gsap.from(".edu-detail-card", {
  opacity: 0,
  y: 30,
  duration: 0.7,
  stagger: 0.1,
  ease: "power3.out",
  scrollTrigger: {
    trigger: ".edu-grid",
    start: "top 80%",
    toggleActions: "play none none reverse",
  },
});

/* ============================================================
   RESUME — card reveal
   ============================================================ */
gsap.from(".resume-card", {
  opacity: 0,
  y: 40,
  duration: 0.9,
  ease: "power3.out",
  scrollTrigger: {
    trigger: ".resume-card",
    start: "top 80%",
    toggleActions: "play none none reverse",
  },
});

/* ============================================================
   CONTACT — fields reveal one by one, socials stagger in,
   success animation after submit
   ============================================================ */
gsap.to(".social-link", {
  opacity: 1,
  x: 0,
  duration: 0.6,
  stagger: 0.1,
  ease: "power3.out",
  scrollTrigger: {
    trigger: ".socials-container",
    start: "top 80%",
    toggleActions: "play none none reverse",
  },
});

gsap.to(".field-group", {
  opacity: 1,
  y: 0,
  duration: 0.6,
  stagger: 0.12,
  ease: "power3.out",
  scrollTrigger: {
    trigger: ".contact-form",
    start: "top 80%",
    toggleActions: "play none none reverse",
  },
});

/* ============================================================
   CONTACT FORM — VALIDATION + SUBMISSION FEEDBACK
   ============================================================ */
const form = document.getElementById("contact-form");
const sendButton = document.getElementById("send-button");

function validateField(input) {
  const group = input.closest(".field-group");
  if (!group) return true;
  const errorEl = group.querySelector(".field-error");
  let message = "";

  if (!input.value.trim()) {
    message = "This field is required.";
  } else if (
    input.type === "email" &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim())
  ) {
    message = "Please enter a valid email address.";
  }

  if (message) {
    input.classList.add("invalid");
    if (errorEl) errorEl.textContent = message;
    // Soft shake to draw the eye to the error without being harsh
    gsap.fromTo(
      group,
      { x: -6 },
      { x: 0, duration: 0.4, ease: "elastic.out(1, 0.4)" },
    );
    return false;
  } else {
    input.classList.remove("invalid");
    if (errorEl) errorEl.textContent = "";
    return true;
  }
}

if (form) {
  form.querySelectorAll(".input").forEach((input) => {
    input.addEventListener("blur", () => validateField(input));
    input.addEventListener("input", () => {
      if (input.classList.contains("invalid")) validateField(input);
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const inputs = [...form.querySelectorAll(".input")];
    const allValid = inputs.map(validateField).every(Boolean);
    if (!allValid) return;

    const original = sendButton.innerHTML;
    sendButton.disabled = true;

    // Success sequence: button morphs to a checkmark state with a
    // soft scale bounce, holds, then the form resets and fades
    // back in.
    const successTl = gsap.timeline();
    successTl
      .to(sendButton, { scale: 0.94, duration: 0.12, ease: "power2.in" })
      .call(() => {
        sendButton.innerHTML = "Sent ✓";
        sendButton.style.background = "#2cb67d";
      })
      .to(sendButton, { scale: 1, duration: 0.45, ease: "back.out(2.2)" })
      .to({}, { duration: 1.6 }) // hold
      .to(form.querySelectorAll(".input"), {
        opacity: 0.4,
        duration: 0.25,
        stagger: 0.05,
      })
      .call(() => {
        sendButton.innerHTML = original;
        sendButton.disabled = false;
        sendButton.style.background = "";
        form.reset();
        form
          .querySelectorAll(".input")
          .forEach((i) => i.classList.remove("invalid"));
        form
          .querySelectorAll(".field-error")
          .forEach((el) => (el.textContent = ""));
      })
      .to(form.querySelectorAll(".input"), {
        opacity: 1,
        duration: 0.3,
        stagger: 0.05,
      });
  });
}

/* ============================================================
   FOOTER — easter egg + gentle floating orb (uses existing
   aurora orbs already in the DOM, no extra elements needed)
   ============================================================ */

const footerJoke = document.getElementById("footer-joke");

const jokes = [
  "Please don't inspect element too hard.",
  "Looking for bugs? Me too.",
  "Works on my machine 👍",
  "There's definitely a console.log somewhere.",
  "Yes, I centered it with flexbox.",
  "Hope you liked what you saw.",

  "Don't judge my class names.",
  "Somewhere there's a div with too much margin.",
];

let clicks = 0;

footerJoke.addEventListener("click", () => {
  clicks++;
  let randomidx = Math.floor(Math.random() * jokes.length);

  if (clicks === 5) {
    footerJoke.textContent = "You weren't supposed to find this 😶";
    return;
  }

  if (clicks === 7) {
    footerJoke.textContent = "You clicked it again 😂 Didn't you ";
    return;
  }
  if (clicks === 10) {
    footerJoke.textContent = "Okay, that's enough clicking... probably.";
    return;
  }

  if (footerJoke.textContent === jokes[randomidx]) {
    randomidx = Math.floor(Math.random() * jokes.length);
  }
  footerJoke.textContent = jokes[randomidx];
});

/* Footer social icons entrance (footer itself has no separate
   social row currently — this targets the back-to-top + copy
   for a small soft entrance instead). */
gsap.from(".footer-inner > *", {
  opacity: 0,
  y: 16,
  duration: 0.7,
  stagger: 0.1,
  ease: "power3.out",
  scrollTrigger: {
    trigger: "footer",
    start: "top 90%",
    toggleActions: "play none none reverse",
  },
});




