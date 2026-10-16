/**
 * Text reveal effects (21st.dev "Texts" family):
 *  - .section__title → words rise out of an overflow mask as the section enters
 *  - hero title → character stagger on load
 * Elements are split into aria-hidden spans; the parent keeps an aria-label.
 * Any element processed here loses its generic [data-reveal] fade to avoid
 * double-animation.
 */
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function splitElement(el, unit) {
  const text = el.textContent;
  const parts = text.split(unit === 'word' ? /(\s+)/ : '');
  el.setAttribute('aria-label', text.replace(/\s+/g, ' ').trim());
  el.textContent = '';
  const frag = document.createDocumentFragment();
  const wrapper = document.createElement('span');
  wrapper.setAttribute('aria-hidden', 'true');
  wrapper.className = 'tr';
  let index = 0;

  for (const part of parts) {
    if (unit === 'word' && /^\s+$/.test(part)) {
      wrapper.appendChild(document.createTextNode(' '));
      continue;
    }
    const word = document.createElement('span');
    word.className = 'tr-word';
    const inner = document.createElement('span');
    inner.className = 'tr-inner';
    inner.style.setProperty('--wi', String(index));
    inner.textContent = part;
    word.appendChild(inner);
    wrapper.appendChild(word);
    index += 1;
  }
  frag.appendChild(wrapper);
  el.appendChild(frag);
  return index;
}

export function initTextReveal() {
  if (reduced()) return;

  // Section titles: word mask reveal, driven by the shared scroll observer.
  document.querySelectorAll('.section__title[data-reveal]').forEach((title) => {
    splitElement(title, 'word');
    title.removeAttribute('data-reveal');
    title.classList.add('tr-ready');

    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        title.classList.add('is-visible');
        io.disconnect();
      }
    }, { rootMargin: '0px 0px -8% 0px' });
    io.observe(title);
  });

  // Hero title: one-off character stagger on load.
  const hero = document.querySelector('.hero__title');
  if (hero && hero.hasAttribute('data-reveal')) {
    hero.removeAttribute('data-reveal');
    splitElement(hero, 'char');
    hero.classList.add('tr-hero');
    // Trigger after first paint so the mask is in place.
    requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add('is-visible')));
  }
}