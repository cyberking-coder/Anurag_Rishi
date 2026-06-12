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

/* ---------- sea of galaxy inside the figure's body ----------
   dense violet star-sea matched to the reference body texture:
   purple, blue-white and pink stars over a Hubble deep field,
   plus bright stars with diffraction spikes                     */
(function galaxy() {
  const g = document.getElementById("galaxyStars");
  if (!g) return;
  const NS = "http://www.w3.org/2000/svg";
  const star = (tag) => document.createElementNS(NS, tag);

  for (let i = 0; i < 460; i++) {
    const s = star("circle");
    // scatter across the silhouette's bounds; bodyClip crops the rest
    s.setAttribute("cx", (40 + Math.random() * 920).toFixed(1));
    s.setAttribute("cy", (40 + Math.random() * 1030).toFixed(1));
    s.setAttribute("r", (Math.random() * 1.9 + 0.5).toFixed(2));
    const roll = Math.random();
    s.setAttribute("fill",
      roll < 0.35 ? "#ffffff" :
      roll < 0.6  ? "#cf9fff" :
      roll < 0.8  ? "#8fb8ff" : "#ff9fdc");
    s.setAttribute("opacity", (Math.random() * 0.6 + 0.4).toFixed(2));
    s.setAttribute("class", "bodyStar");
    s.style.animationDelay = (Math.random() * -4).toFixed(2) + "s";
    g.appendChild(s);
  }

  /* bright stars with the classic 4-point cross spikes */
  for (let i = 0; i < 12; i++) {
    const cx = 90 + Math.random() * 820;
    const cy = 90 + Math.random() * 930;
    const len = 9 + Math.random() * 14;
    const grp = star("g");
    grp.setAttribute("class", "bodyStar");
    grp.style.animationDelay = (Math.random() * -4).toFixed(2) + "s";
    const core = star("circle");
    core.setAttribute("cx", cx); core.setAttribute("cy", cy);
    core.setAttribute("r", (2.2 + Math.random() * 1.6).toFixed(2));
    core.setAttribute("fill", Math.random() < 0.7 ? "#ffffff" : "#dcc3ff");
    const v = star("line");
    v.setAttribute("x1", cx); v.setAttribute("x2", cx);
    v.setAttribute("y1", cy - len); v.setAttribute("y2", cy + len);
    const h = star("line");
    h.setAttribute("y1", cy); h.setAttribute("y2", cy);
    h.setAttribute("x1", cx - len); h.setAttribute("x2", cx + len);
    for (const l of [v, h]) {
      l.setAttribute("stroke", "#ffffff");
      l.setAttribute("stroke-width", "1.2");
      l.setAttribute("opacity", ".9");
      l.setAttribute("stroke-linecap", "round");
    }
    grp.append(v, h, core);
    g.appendChild(grp);
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

  /* —— HERO: awaken the chakras, then enter the mind ——
     550vh scroll track, pinned. The sequence:
     1. headline drifts out, sky streaks dim
     2. the 7 chakras ignite one by one, root → crown, each with
        its halo, spinning petals and Sanskrit label
     3. the kundalini beam draws up the spine
     4. tunnel rings bloom, white light grows, camera dives into
        the third eye (~38x zoom)
     5. pure white light warms into the orange reality, then
        dissolves to reveal the site                              */
  const dive = gsap.timeline({
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom bottom",
      scrub: 1.1,
    },
  });

  dive
    .to(".hero__title span", { yPercent: -70, opacity: 0, stagger: 0.06, ease: "power2.in", duration: 1.0 }, 0)
    .to(".hero__kicker, #scrollHint", { opacity: 0, duration: 0.6 }, 0)
    .to(".streak", { opacity: 0.25, duration: 1.4 }, 0.4);

  /* chakra ignition, root → crown; the Sanskrit legend lights up in step */
  const chakras = gsap.utils.toArray(".chakra"); // markup order = ignition order
  const legs = gsap.utils.toArray(".chakra-legend .leg"); // crown first in DOM
  chakras.forEach((ch, i) => {
    const t = 0.7 + i * 0.55;
    dive
      .to(ch.querySelector(".ch-halo"), { opacity: 0.95, scale: 1, duration: 0.4, ease: "back.out(2)" }, t)
      .to(ch.querySelector(".ch-ring"), { opacity: 1, duration: 0.35 }, t)
      .to(ch.querySelector(".ch-core"), { opacity: 1, duration: 0.35 }, t)
      .to(ch.querySelector(".ch-petal"), { opacity: 0.9, duration: 0.4 }, t + 0.08);
    const leg = legs[legs.length - 1 - i];
    if (leg) dive.to(leg, { opacity: 1, x: -8, duration: 0.35 }, t + 0.1);
  });

  dive
    /* kundalini rises */
    .to(".spine", { strokeDashoffset: 0, ease: "none", duration: 1.1 }, 4.6)
    .fromTo('[data-step="0"]', { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 0.7 }, 4.7)
    .to('[data-step="0"]', { opacity: 0, scale: 1.4, duration: 0.6 }, 5.6)

    /* tunnel blooms around the awakened mind */
    .to(".mountains", { opacity: 0, yPercent: 20, duration: 1.2 }, 5.4)
    .to(".tunnel span", { opacity: 1, scale: 1, stagger: 0.16, ease: "power1.out", duration: 1.5 }, 5.6)
    .to("#headGlow", { opacity: 1, scale: 1.25, duration: 1.8 }, 5.8)
    .to(".chakra-legend", { opacity: 0, duration: 0.5 }, 6.2)

    /* the dive — origin locked on the third eye */
    .to(".meditator", {
      scale: 38,
      transformOrigin: "50% 18.6%",
      ease: "power2.in",
      duration: 4.4,
    }, 6.4)
    .to(".tunnel span", { scale: 3.2, opacity: 0, stagger: 0.1, ease: "power2.in", duration: 2.2 }, 7.0)
    .fromTo('[data-step="1"]', { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 0.7 }, 7.3)
    .to('[data-step="1"]', { opacity: 0, scale: 1.4, duration: 0.6 }, 8.2)

    /* whiteout */
    .to("#heroPortal", { opacity: 1, ease: "power1.in", duration: 1.7 }, 8.5)
    .to("#heroFigure", { opacity: 0, duration: 0.8 }, 9.8)

    /* the orange reality */
    .to("#heroReality", { opacity: 1, duration: 1.5 }, 10.0)
    .to("#heroPortal", { opacity: 0, duration: 1.1 }, 10.5)
    .fromTo('[data-step="2"]', { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.9 }, 10.4)
    .to('[data-step="2"]', { opacity: 0, scale: 1.25, duration: 0.7 }, 11.8)
    .to("#heroReality", { opacity: 0, ease: "power2.out", duration: 1.3 }, 12.0);

  /* intro: headline rises on load */
  gsap.from(".hero__title span", { y: 90, opacity: 0, stagger: 0.15, duration: 1.3, ease: "power3.out", delay: 0.3 });
  gsap.from(".hero__kicker", { opacity: 0, y: 24, duration: 1.1, delay: 1 });
  gsap.from(".meditator", { scale: 0.9, opacity: 0, duration: 1.6, ease: "power3.out", delay: 0.2 });

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
