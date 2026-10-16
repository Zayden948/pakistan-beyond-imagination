/**
 * Pointer effects (21st.dev "Spotlight Card" + "Display Cards" families):
 *  - .spotlight  → cursor-following radial light via --mx/--my custom props
 *  - .tilt       → gentle 3D tilt toward the cursor
 * Both only run for fine pointers with hover, and never under reduced motion.
 */
const CAPABLE = window.matchMedia('(hover: hover) and (pointer: fine)');
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)');
const MAX_TILT = 2.6; // degrees

export function initEffects() {
  if (REDUCED.matches || !CAPABLE.matches) return;

  let queued = false;
  let lastEvent = null;

  const frame = () => {
    queued = false;
    if (!lastEvent) return;
    const { clientX, clientY } = lastEvent;

    for (const card of document.querySelectorAll('.spotlight')) {
      const rect = card.getBoundingClientRect();
      const inside =
        clientX >= rect.left && clientX <= rect.right &&
        clientY >= rect.top && clientY <= rect.bottom;
      if (inside || card.classList.contains('is-lit')) {
        card.classList.toggle('is-lit', inside);
        card.style.setProperty('--mx', `${clientX - rect.left}px`);
        card.style.setProperty('--my', `${clientY - rect.top}px`);
      }
    }

    for (const card of document.querySelectorAll('.tilt')) {
      const rect = card.getBoundingClientRect();
      const inside =
        clientX >= rect.left && clientX <= rect.right &&
        clientY >= rect.top && clientY <= rect.bottom;
      if (inside) {
        const px = (clientX - rect.left) / rect.width - 0.5;
        const py = (clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(900px) rotateX(${(-py * MAX_TILT).toFixed(2)}deg) rotateY(${(px * MAX_TILT).toFixed(2)}deg) translateY(-6px)`;
      } else if (card.style.transform) {
        card.style.transform = '';
      }
    }
  };

  document.addEventListener('pointermove', (e) => {
    lastEvent = e;
    if (!queued) {
      queued = true;
      requestAnimationFrame(frame);
    }
  }, { passive: true });
}