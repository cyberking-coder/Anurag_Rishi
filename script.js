/* ═════════════════════════════════════════════
   InnerLight — interactions & scroll animations
   ═════════════════════════════════════════════ */

/* ---------- ambient starfield / floating dust ---------- */
(function stars() {
  const c = document.getElementById("stars");
  const ctx = c.getContext("2d");
  let w, h, pts;

  function resize() {
    w = c.width = innerWidth;
    h = c.height = innerHeight;
    pts = Array.from({ length: Math.min(110, (w * h) / 14000) }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.6 + 0.3,
      vy: -(Math.random() * 0.18 + 0.04),
      vx: (Math.random() - 0.5) * 0.08,
      a: Math.random() * Math.PI * 2,
      hue: Math.random() < 0.25 ? "255,201,125" : "179,136,255",
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

/* ---------- nav + progress bar ---------- */
const nav = document.getElementById("nav");
const progressBar = document.getElementById("progressBar");
addEventListener("scroll", () => {
  nav.classList.toggle("scrolled", scrollY > 40);
  const max = document.documentElement.scrollHeight - innerHeight;
  progressBar.style.width = (scrollY / max) * 100 + "%";
}, { passive: true });

/* ---------- breathing circle loop ---------- */
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

  /* —— HERO: dive into the mind ——
     The whole hero is a 400vh scroll track. As you scroll:
     1. headline drifts apart and fades
     2. ripples bloom from the third eye
     3. the figure scales ~40x, origin locked on the third eye
     4. the light portal swallows the screen, inner words float past
     5. portal fades out, revealing the sanctuary section            */
  const dive = gsap.timeline({
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom bottom",
      scrub: 1.1,
    },
  });

  dive
    .to(".hero__title span", { yPercent: -60, opacity: 0, stagger: 0.06, ease: "power2.in", duration: 1.2 }, 0)
    .to(".hero__kicker, .hero__sub, #scrollHint", { opacity: 0, duration: 0.7 }, 0)
    .to(".ripple", { opacity: 0.5, scale: 2.2, stagger: 0.12, ease: "none", duration: 2 }, 0.2)
    .to(".ripple", { opacity: 0, duration: 1 }, 2.2)
    .to("#heroFigure", {
      scale: 42,
      transformOrigin: "50% 24.5%",
      ease: "power2.in",
      duration: 5,
    }, 0.4)
    .to("#heroPortal", { opacity: 1, ease: "power1.in", duration: 2.4 }, 2.6)
    .fromTo('[data-step="0"]', { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 0.8 }, 2.0)
    .to('[data-step="0"]', { opacity: 0, scale: 1.5, duration: 0.7 }, 3.0)
    .fromTo('[data-step="1"]', { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 0.8 }, 3.4)
    .to('[data-step="1"]', { opacity: 0, scale: 1.5, duration: 0.7 }, 4.4)
    .fromTo('[data-step="2"]', { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 0.9 }, 4.8)
    .to('[data-step="2"]', { opacity: 0, scale: 1.4, duration: 0.7 }, 6.0)
    .to("#heroPortal", { opacity: 0, ease: "power2.out", duration: 1.6 }, 6.2)
    .to("#heroFigure", { opacity: 0, duration: 1 }, 6.2);

  /* intro: headline floats in on load */
  gsap.from(".hero__title span", { y: 80, opacity: 0, stagger: 0.15, duration: 1.4, ease: "power3.out", delay: 0.3 });
  gsap.from(".hero__kicker, .hero__sub", { opacity: 0, y: 24, duration: 1.2, stagger: 0.2, delay: 1 });

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
    xPercent: -28, ease: "none",
    scrollTrigger: { trigger: ".quote-band", start: "top bottom", end: "bottom top", scrub: 0.6 },
  });

  /* timeline line fills as you read the journey */
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

  /* cta aura parallax */
  gsap.fromTo(".cta__aura", { scale: 0.6, opacity: 0.4 }, {
    scale: 1.1, opacity: 1, ease: "none",
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
