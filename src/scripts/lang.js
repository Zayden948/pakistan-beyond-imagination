/**
 * i18n core: three languages (en / fr / ur).
 * - English lives in the markup itself; i18n/ui-*.js stores FR + UR overrides.
 * - Elements opt in with data-i18n="key" (innerHTML) or data-i18n-aria="key".
 * - Switching re-renders strings, re-splits processed titles and flips
 *   <html lang / dir> (Urdu = RTL + Noto Nastaliq Urdu). Choice is persisted.
 */
import { UI_STRINGS } from './i18n/strings.js';
import { TIMELINE_I18N } from './i18n/timeline.js';
import { REGIONS_I18N } from './i18n/regions.js';

export const LANGS = ['en', 'fr', 'ur'];
const STORE_KEY = 'pk-lang';

let current = 'en';
/* Original innerHTML snapshot per element (en restore). */
const originals = new WeakMap();
let strings = UI_STRINGS;

/** Current language. */
export const getLang = () => current;

/** Translation lookup for runtime strings (nav labels, aria…). */
export const t = (key, fallback = '') => strings[key]?.[current] ?? fallback;

/** Timeline eras: trilingual {en, fr, ur} data merged by index. */
export const timelineTexts = () => TIMELINE_I18N;
/** Regions: trilingual {en, fr, ur} data merged by index. */
export const regionsTexts = () => REGIONS_I18N;

const isUI = (lang) => current === lang;

/** Apply every data-i18n / data-i18n-aria element. Call on init + change. */
function applyStrings() {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    const entry = strings[key];
    if (!entry) return;
    current === 'en'
      ? (el.innerHTML = originals.get(el))
      : (el.innerHTML = entry[current] ?? entry.fr ?? '');
  });
  document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
    const key = el.getAttribute('data-i18n-aria');
    const entry = strings[key];
    if (!entry) return;
    const value = current === 'en' ? el.dataset.i18nEnAria ?? entry.en ?? null : entry[current];
    if (value) el.setAttribute('aria-label', value);
  });
}

function snapAriaDefaults() {
  // Capture English aria-labels so they can be restored.
  document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
    const key = el.getAttribute('data-i18n-aria');
    el.dataset.i18nEnAria = el.getAttribute('aria-label') ?? strings[key]?.en ?? '';
  });
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    originals.set(el, el.innerHTML);
  });
}

/* Authored-English meta, captured once at init for restoring on switch-back. */
const EN_META = {
  title: document.title,
  desc: document.querySelector('meta[name="description"]')?.getAttribute('content') ?? '',
};

function syncMeta() {
  const lang = current;
  document.title = lang === 'en' ? EN_META.title
    : (strings['meta.title']?.[lang] ?? document.title);
  const desc = document.querySelector('meta[name="description"]');
  const next = lang === 'en' ? EN_META.desc : strings['meta.desc']?.[lang];
  if (desc && next) desc.setAttribute('content', next);
}

function syncToggleButtons() {
  document.querySelectorAll('[data-lang-btn]').forEach((btn) => {
    const active = btn.dataset.langBtn === current;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-pressed', String(active));
  });
}

/** Switch language (persisted). Emits `langchange` on document. */
export function setLang(lang) {
  if (!LANGS.includes(lang) || lang === current) return;
  current = lang;
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ur' ? 'rtl' : 'ltr';
  applyStrings();
  resplitTitles();
  syncMeta();
  syncToggleButtons();
  try { localStorage.setItem(STORE_KEY, lang); } catch { /* private mode */ }
  document.dispatchEvent(new CustomEvent('langchange', { detail: lang }));
}

/** Re-skip the word/char splits done by text-reveal so titles re-animate. */
function resplitTitles() {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;
  document.querySelectorAll('.section__title.tr-ready').forEach((title) => {
    title.setAttribute('data-reveal', '');
    title.classList.remove('tr-ready', 'is-visible');
    title.removeAttribute('aria-label');
    title.querySelectorAll('.tr').forEach((n) => n.remove());
    // Recreate split via the shared helper (see text-reveal.js).
    splitTitle(title, 'word');
    title.classList.add('is-visible'); // already on screen once user switches
  });
}

/* Local mini-split (keeps markup identical to text-reveal.js). */
function splitTitle(el, unit) {
  const text = el.textContent;
  const parts = text.split(/(\s+)/);
  el.setAttribute('aria-label', text.replace(/\s+/g, ' ').trim());
  el.textContent = '';
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
  el.appendChild(wrapper);
}

export function initLang() {
  strings = UI_STRINGS; // (refresh reference — keeps reimports safe)

  let saved = 'en';
  try { saved = localStorage.getItem(STORE_KEY) || 'en'; } catch { /* ignore */ }
  if (!LANGS.includes(saved)) saved = 'en';

  snapAriaDefaults();

  if (saved !== 'en') {
    current = saved; // bypass setLang (no event yet); apply immediately
    document.documentElement.lang = saved;
    document.documentElement.dir = saved === 'ur' ? 'rtl' : 'ltr';
    applyStrings();
    syncMeta();
  } else {
    syncAriaLang();
  }
  syncToggleButtons();

  document.querySelectorAll('[data-lang-btn]').forEach((btn) => {
    btn.addEventListener('click', () => setLang(btn.dataset.langBtn));
  });
}

/* Keep the language-switch group aria-label translated. */
function syncAriaLang() {
  document.querySelectorAll('[data-i18n-aria]')
    .forEach((el) => el.setAttribute('aria-label', el.dataset.i18nEnAria));
}