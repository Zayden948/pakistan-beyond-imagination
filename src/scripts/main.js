/**
 * PAKISTAN — Beyond Imagination · entry point
 * Small, dependency-free modules wired on init.
 */
import '../styles/main.css';

import { initLang } from './lang.js';
import { initNav } from './nav.js';
import { initExpanders } from './expanders.js';
import { initTextReveal } from './text-reveal.js';
import { initEffects } from './effects.js';
import { initProgress } from './progress.js';
import { initReveal } from './reveal.js';
import { initCounters } from './counters.js';
import { initParallax } from './parallax.js';
import { initTimeline } from './timeline.js';
import { initRegions } from './regions.js';

document.documentElement.classList.add('js');

initLang();
initNav();
initExpanders();
initTextReveal();
initEffects();
initProgress();
initReveal();
initCounters();
initParallax();
initTimeline();
initRegions();