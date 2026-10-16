/** City-card expanders: [aria-expanded] button reveals an adjacent detail panel. */
export function initExpanders() {
  const buttons = document.querySelectorAll('.link-more[aria-controls]');
  if (!buttons.length) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  buttons.forEach((btn) => {
    const panel = document.getElementById(btn.getAttribute('aria-controls'));
    if (!panel) return;

    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      panel.hidden = open;
      if (!open && !reduced) {
        panel.animate?.(
          [
            { opacity: 0, transform: 'translateY(-6px)' },
            { opacity: 1, transform: 'translateY(0)' },
          ],
          { duration: 240, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
        );
      }
    });
  });
}