/* ═════════════════════════════════════════════
   INNERLIGHT — cosmic interactions & scroll FX
   ═════════════════════════════════════════════ */

/* ---------- ambient starfield / cosmic dust ---------- */
(function stars() {
  const c = document.getElementById("stars");
  const ctx = c.getContext("2d");
  let w, h, pts;

  function resize() {
    w = c.width = innerWidth;
    h = c.height = innerHeight;
    pts = Array.from({ length: Math.min(120, (w * h) / 14000) }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.6 + 0.3,
      vy: -(Math.random() * 0.18 + 0.04),
      vx: (Math.random() - 0.5) * 0.08,
      a: Math.random() * Math.PI * 2,
      hue: Math.random() < 0.3 ? "255,126,227" : Math.random() < 0.5 ? "255,255,255" : "207,92,255",
    }));
  }
  resize();
  addEventListener("resize", resize);

  (function tick(t) {
    ctx.clearRect(0, 0, w, h);
    for (const p of pts) {
      p.y += p.vy;
      p.x += p.vx + Math.sin(t / 2400 + p.a) * 0.06;
      if (p.y < -4) { p.y = h + 4; p.x = Math.random() * w; }
      if (p.x < -4) p.x = w + 4;
      if (p.x > w + 4) p.x = -4;
      const tw = 0.35 + 0.3 * Math.sin(t / 900 + p.a * 3);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.hue},${tw})`;
      ctx.fill();
    }
    requestAnimationFrame(tick);
  })(0);
})();

/* ---------- galaxy woven through the figure's body ---------- */
(function bodyStars() {
  const g = document.getElementById("bodyStars");
  if (!g) return;
  const NS = "http://www.w3.org/2000/svg";
  for (let i = 0; i < 90; i++) {
    const s = document.createElementNS(NS, "circle");
    // scatter across the silhouette's bounding region; bodyClip crops the rest
    s.setAttribute("cx", 180 + Math.random() * 640);
    s.setAttribute("cy", 180 + Math.random() * 700);
    s.setAttribute("r", (Math.random() * 2.4 + 0.6).toFixed(2));
    s.setAttribute("fill", Math.random() < 0.25 ? "#ff7ee3" : "#ffffff");
    s.setAttribute("opacity", (Math.random() * 0.7 + 0.3).toFixed(2));
    s.setAttribute("class", "bodyStar");
    s.style.animationDelay = (Math.random() * -4).toFixed(2) + "s";
    g.appendChild(s);
  }
})();

/* ---------- nav + progress bar ---------- */
const nav = document.getElementById("nav");
const progressBar = document.getElementById("progressBar");
addEventListener("scroll", () => {
  nav.classList.toggle("scrolled", scrollY > 40);
  const max = document.documentElement.scrollHeight - innerHeight;
  progressBar.style.width = (scrollY / max) * 100 + "%";
}, { passive: true });

/* ---------- left rail scrollspy ---------- */
(function rail() {
  const links = [...document.querySelectorAll(".rail__link")];
  if (!links.length) return;
  const targets = links
    .map((l) => document.getElementById(l.dataset.spy))
    .filter(Boolean);
  function update() {
    let current = targets[0];
    for (const t of targets) {
      if (t.getBoundingClientRect().top <= innerHeight * 0.45) current = t;
    }
    links.forEach((l) => l.classList.toggle("active", l.dataset.spy === current.id));
  }
  addEventListener("scroll", update, { passive: true });
  update();
})();

/* ---------- breathing orb loop ---------- */
(function breathe() {
  const circle = document.getElementById("breatheCircle");
  const label = document.getElementById("breatheLabel");
  const phases = [
    { name: "breathe in", cls: "in", ms: 4000 },
    { name: "hold", cls: "in hold", ms: 1600 },
    { name: "breathe out", cls: "", ms: 4000 },
    { name: "rest", cls: "hold", ms: 1600 },
  ];
  let i = 0;
  (function next() {
    const p = phases[i % phases.length];
    circle.className = "breathe__circle " + p.cls;
    label.textContent = p.name;
    i++;
    setTimeout(next, p.ms);
  })();
})();

/* ---------- counters ---------- */
function animateCounters() {
  document.querySelectorAll("[data-count]").forEach((el) => {
    const target = +el.dataset.count;
    const t0 = performance.now();
    const dur = 1800;
    (function step(t) {
      const k = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(target * eased).toLocaleString();
      if (k < 1) requestAnimationFrame(step);
    })(t0);
  });
}

/* ═════════ GSAP scroll choreography ═════════ */
if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);

  /* —— HERO: enter the mind ——
     450vh scroll track, pinned. The sequence mirrors the reference:
     1. headline drifts out, sky streaks dim
     2. tunnel rings bloom around the head, white light grows behind it
     3. camera dives into the rings on the head (~36x zoom)
     4. pure white light — then it warms into the orange reality
     5. reality dissolves, revealing the site                       */
  const dive = gsap.timeline({
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom bottom",
      scrub: 1.1,
    },
  });

  dive
    .to(".hero__title span", { yPercent: -70, opacity: 0, stagger: 0.06, ease: "power2.in", duration: 1.1 }, 0)
    .to(".hero__kicker, #scrollHint", { opacity: 0, duration: 0.6 }, 0)
    .to(".streak", { opacity: 0, duration: 1.4 }, 0.4)
    .to(".mountains", { opacity: 0, yPercent: 20, duration: 1.4 }, 0.6)

    /* tunnel blooms */
    .to(".tunnel span", { opacity: 1, scale: 1, stagger: 0.18, ease: "power1.out", duration: 1.6 }, 0.7)
    .to("#headGlow", { opacity: 1, scale: 1.25, duration: 2 }, 0.9)
    .fromTo('[data-step="0"]', { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 0.7 }, 1.2)
    .to('[data-step="0"]', { opacity: 0, scale: 1.4, duration: 0.6 }, 2.0)

    /* the dive — origin locked on the head's ring centre */
    .to(".meditator", {
      scale: 36,
      transformOrigin: "50% 39.8%",
      ease: "power2.in",
      duration: 4.6,
    }, 1.6)
    .to(".tunnel span", { scale: 3.2, opacity: 0, stagger: 0.1, ease: "power2.in", duration: 2.4 }, 2.2)
    .fromTo('[data-step="1"]', { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 0.7 }, 2.6)
    .to('[data-step="1"]', { opacity: 0, scale: 1.4, duration: 0.6 }, 3.5)

    /* whiteout */
    .to("#heroPortal", { opacity: 1, ease: "power1.in", duration: 1.8 }, 3.8)
    .to("#heroFigure", { opacity: 0, duration: 0.8 }, 5.2)

    /* the orange reality */
    .to("#heroReality", { opacity: 1, duration: 1.6 }, 5.4)
    .to("#heroPortal", { opacity: 0, duration: 1.2 }, 5.9)
    .fromTo('[data-step="2"]', { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.9 }, 5.8)
    .to('[data-step="2"]', { opacity: 0, scale: 1.25, duration: 0.7 }, 7.2)
    .to("#heroReality", { opacity: 0, ease: "power2.out", duration: 1.4 }, 7.4);

  /* intro: headline rises on load */
  gsap.from(".hero__title span", { y: 90, opacity: 0, stagger: 0.15, duration: 1.3, ease: "power3.out", delay: 0.3 });
  gsap.from(".hero__kicker", { opacity: 0, y: 24, duration: 1.1, delay: 1 });
  gsap.from(".meditator", { y: 120, opacity: 0, duration: 1.6, ease: "power3.out", delay: 0.2 });

  /* —— generic reveals —— */
  gsap.utils.toArray(".reveal").forEach((el) => {
    gsap.to(el, {
      opacity: 1, y: 0, duration: 1.1, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 86%" },
    });
  });

  /* counters fire once when stats enter */
  ScrollTrigger.create({
    trigger: ".stats",
    start: "top 85%",
    once: true,
    onEnter: animateCounters,
  });

  /* quote band drifts sideways with scroll */
  gsap.to(".quote-band__text", {
    xPercent: -30, ease: "none",
    scrollTrigger: { trigger: ".quote-band", start: "top bottom", end: "bottom top", scrub: 0.6 },
  });

  /* timeline line fills as you read the ascension */
  gsap.to("#timelineFill", {
    height: "100%", ease: "none",
    scrollTrigger: { trigger: ".timeline", start: "top 70%", end: "bottom 60%", scrub: 0.8 },
  });

  /* cards get a soft stagger */
  gsap.utils.toArray(".cards, .testimonials").forEach((grid) => {
    gsap.from(grid.children, {
      y: 60, opacity: 0, stagger: 0.12, duration: 1, ease: "power3.out",
      scrollTrigger: { trigger: grid, start: "top 82%" },
      clearProps: "transform,opacity",
    });
  });

  /* cta sun swells as the reality section arrives */
  gsap.fromTo(".cta__sun", { scale: 0.5, opacity: 0.3 }, {
    scale: 1.15, opacity: 1, ease: "none",
    scrollTrigger: { trigger: ".cta", start: "top bottom", end: "center center", scrub: 1 },
  });
} else {
  /* graceful fallback: show everything if GSAP failed to load */
  document.querySelectorAll(".reveal").forEach((el) => {
    el.style.opacity = 1;
    el.style.transform = "none";
  });
  document.querySelector(".hero").style.height = "100vh";
  animateCounters();
}
