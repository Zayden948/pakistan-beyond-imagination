/** Fixed header: solid on scroll + accessible mobile drawer.
 * Menu open/close aria-labels follow the active language via lang.js `t()`. */
import { t } from './lang.js';

export function initNav() {
  const header = document.getElementById('site-header');
  const toggle = document.getElementById('nav-toggle');
  const menu = document.getElementById('nav-menu');
  if (!header || !toggle || !menu) return;

  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const setState = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? t('aria.menuClose', 'Close menu') : t('aria.menuOpen', 'Open menu'));
    menu.classList.toggle('is-open', open);
    if (open) header.setAttribute('data-menu-open', '');
    else header.removeAttribute('data-menu-open');
  };

  toggle.addEventListener('click', () => {
    setState(toggle.getAttribute('aria-expanded') !== 'true');
  });

  // Close on any navigation or on Escape (restore focus to the toggle).
  menu.addEventListener('click', (e) => {
    if (e.target instanceof Element && e.target.closest('a')) setState(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setState(false);
      toggle.focus();
    }
  });

  // Reset drawer state when returning to desktop layout.
  window.matchMedia('(min-width: 961px)').addEventListener('change', () => setState(false));
}