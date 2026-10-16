/** Animated number counters (data-count, optional data-suffix). */
export function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DURATION = 1400;

  const run = (el) => {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix ?? '';
    if (reduced || !Number.isFinite(target)) {
      el.textContent = `${target}${suffix}`;
      return;
    }
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / DURATION, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      el.textContent = `${Math.round(target * eased).toLocaleString('en-US')}${suffix}`;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        run(entry.target);
        io.unobserve(entry.target);
      }
    }
  }, { threshold: 0.4 });

  counters.forEach((el) => io.observe(el));
}