(() => {
  const root = document.documentElement;
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ua = navigator.userAgent;

  /* Pointer-lit sheen on glass surfaces (also covers cards rendered later by the page scripts) */
  const GLASS = ".glass,.navbar,.auth-card,.feature-card,.about-card,.dashboard-stat-card,.staff-stat-card,.admin-stat-card,.admin-status-card,.dashboard-form-card,.request-card,.staff-request-card,.admin-request-card,.admin-user-card";
  addEventListener("pointermove", e => {
    const el = e.target.closest && e.target.closest(GLASS);
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", e.clientX - r.left + "px");
    el.style.setProperty("--my", e.clientY - r.top + "px");
  }, { passive: true });

  /* Hero scene tilt */
  const scene = document.querySelector(".scene");
  if (scene && !still) {
    scene.addEventListener("pointermove", e => {
      const r = scene.getBoundingClientRect();
      scene.style.setProperty("--rx", ((e.clientX - r.left) / r.width - .5) * 10 + "deg");
      scene.style.setProperty("--ry", ((e.clientY - r.top) / r.height - .5) * -8 + "deg");
    });
    scene.addEventListener("pointerleave", () => { scene.style.setProperty("--rx", "0deg"); scene.style.setProperty("--ry", "0deg"); });
  }

  /* Count-up when the dashboard scripts write new stat values */
  const STATS = "#totalRequests,#pendingRequests,#inProgressRequests,#resolvedRequests,#staffTotalRequests,#staffPendingRequests,#staffInProgressRequests,#staffResolvedRequests,#adminTotalUsers,#adminTotalStaff,#adminTotalRequests,#adminResolvedRequests,#adminPendingRequests,#adminInProgressRequests,#adminResolvedStatus";
  const obs = new MutationObserver(list => list.forEach(({ target }) => {
    const el = target.nodeType === 3 ? target.parentElement : target;
    const text = el.textContent.trim(), to = parseInt(text, 10);
    if (text === el._w || isNaN(to) || still) return;
    const from = parseInt(el._w, 10) || 0, t0 = performance.now();
    cancelAnimationFrame(el._raf);
    (function step(t) {
      const p = Math.min((t - t0) / 800, 1);
      el._w = String(Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3))));
      el.textContent = el._w;
      if (p < 1) el._raf = requestAnimationFrame(step);
    })(t0);
  }));
  document.querySelectorAll(STATS).forEach(el => obs.observe(el, { childList: true, characterData: true, subtree: true }));

  /* Sidebar scroll-spy */
  const links = [...document.querySelectorAll(".dashboard-nav-item,.staff-nav-item,.admin-nav-item")];
  if (links.length) {
    const targets = links.map(a => a.hash.length > 1 ? document.querySelector(a.hash) : null);
    let busy = false;
    const spy = () => {
      busy = false;
      let best = 0, bestTop = -Infinity;
      if (scrollY > 80) targets.forEach((t, i) => {
        if (!t || t.id === "dashboard") return;
        const top = t.getBoundingClientRect().top;
        if (top <= innerHeight * .3 && top > bestTop) { best = i; bestTop = top; }
      });
      links.forEach((a, i) => a.classList.toggle("active", i === best));
    };
    addEventListener("scroll", () => { if (!busy) { busy = true; requestAnimationFrame(spy); } }, { passive: true });
  }

  /* ?role=staff on the login page */
  if (new URLSearchParams(location.search).get("role") === "staff") {
    const h = document.querySelector(".auth-card-header h2");
    if (h) h.textContent = "Staff sign in";
  }
})();
