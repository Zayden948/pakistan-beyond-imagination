/**
 * Gentle scroll parallax on section media (hero + finale).
 * Drifts the image translateY within its oversized wrapper.
 */
export function initParallax() {
  const sections = document.querySelectorAll('[data-parallax]');
  if (!sections.length) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const layers = [...sections].map((section) => ({
    section,
    img: section.querySelector('img'),
  }));

  let ticking = false;
  const update = () => {
    for (const { section, img } of layers) {
      if (!img) continue;
      const rect = section.getBoundingClientRect();
      // -1 (below viewport) … 0 (in view) … 1 (above viewport)
      const progress = (rect.top + rect.height / 2 - window.innerHeight / 2)
        / (window.innerHeight / 2 + rect.height / 2);
      img.style.transform = `translateY(${(progress * 3).toFixed(2)}%)`;
    }
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });

  update();
}