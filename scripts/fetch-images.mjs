/**
 * Fetch authentic lead images for every entity on the site from the
 * Wikipedia REST summary API (images hosted on Wikimedia Commons).
 * Output: src/data/images.json  —  { key: { src, alt, width, height, pageTitle } }
 *
 * Resumable: existing keys in images.json are kept and not re-fetched.
 * Run with: npm run images [-- --force]
 */
import { writeFile, mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const PAGES = {
  // Hero / landscapes
  hero: 'Hunza_Valley',
  heroFallback: 'Attabad_Lake',

  badshahi: 'Badshahi_Mosque',

  // Cities
  cityIslamabad: 'Islamabad',
  cityLahore: 'Lahore',
  cityKarachi: 'Karachi',
  cityPeshawar: 'Peshawar',
  cityMultan: 'Multan',
  cityHunza: 'Hunza_Valley',
  citySkardu: 'Skardu',

  // Landmarks
  lmBadshahi: 'Badshahi_Mosque',
  lmFaisal: 'Faisal_Mosque',
  lmLahoreFort: 'Lahore_Fort',
  lmMinar: 'Minar-e-Pakistan',
  lmPakistanMonument: 'Pakistan_Monument',
  lmMohenjoDaro: 'Mohenjo-daro',
  lmRohtas: 'Rohtas_Fort',
  lmMakli: 'Makli_Necropolis',

  // Natural wonders
  nwFairyMeadows: 'Fairy_Meadows',
  nwDeosai: 'Deosai_National_Park',
  nwAttabad: 'Attabad_Lake',
  nwNangaParbat: 'Nanga_Parbat',
  nwK2: 'K2',
  nwNeelum: 'Neelum_Valley',
  nwSwat: 'Mahodand_Lake',

  // Cuisine
  foodBiryani: 'Sindhi_biryani',
  foodNihari: 'Nihari',
  foodKarahi: 'Karahi',
  foodSeekhKebab: 'Seekh_kabab',
  foodChapliKebab: 'Chapli_Kebab',
  foodHaleem: 'Haleem',
  foodSajji: 'Sajji',
  foodParatha: 'Paratha',

  // Culture
  cultureTruck: 'Truck_art_in_Pakistan',
  cultureQawwali: 'Qawwali',
  cultureShalwar: 'Shalwar_kameez',
  cultureCricket: 'Pakistan_cricket_team',
  cultureIndus: 'Indus_Valley_Civilisation',
  cultureAltit: 'Altit_Fort',
  cultureShandur: 'Shandur_Polo_Festival',
  cultureBaltit: 'Baltit_Fort',
};

const FORCE = process.argv.includes('--force');
const OUT_DIR = path.resolve('src/data');
const OUT_FILE = path.join(OUT_DIR, 'images.json');
const THUMB_WIDTH = 1600;

let existing = {};
try {
  existing = JSON.parse(await readFile(OUT_FILE, 'utf8'));
} catch { /* first run */ }

/** Build a Commons thumb URL from an original image URL (no wider than the original). */
function toThumb(source, originalWidth) {
  const src = source.split('?')[0]; // strip ?utm_source tracking the REST API appends
  if (src.includes('/thumb/')) return src;
  const after = src.replace(/^https?:\/\/upload\.wikimedia\.org\/wikipedia\/commons\//, '');
  if (after === src) return src; // not a Commons original (unlikely)
  const width = Math.min(THUMB_WIDTH, originalWidth ?? THUMB_WIDTH);
  const filename = after.split('/').pop();
  // SVG/GIF originals are only served as PNG thumbs.
  const suffix = /\.(svg|gif)$/i.test(filename) ? `${width}px-${filename}.png` : `${width}px-${filename}`;
  return `https://upload.wikimedia.org/wikipedia/commons/thumb/${after}/${suffix}`;
}

async function fetchSummary(title, attempt = 0) {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, '_'))}?redirect=true`;
  const res = await fetch(url, {
    headers: { 'Api-User-Agent': 'pakistan-editorial-site/1.0 (contact: local dev)' },
  });
  if (res.status === 429 || res.status >= 500) {
    if (attempt < 5) {
      const wait = 6000 * (attempt + 1);
      console.log(`    rate-limited on ${title}, waiting ${wait / 1000}s…`);
      await new Promise((r) => setTimeout(r, wait));
      return fetchSummary(title, attempt + 1);
    }
    throw new Error(`still ${res.status} after retries for ${title}`);
  }
  if (!res.ok) throw new Error(`${res.status} for ${title}`);
  return res.json();
}

/** @type {Record<string, unknown>} */
const out = existing;
const failures = [];

for (const [key, title] of Object.entries(PAGES)) {
  if (!FORCE && out[key] && out[key].pageTitle === title) {
    console.log(`keep ${key}`);
    continue;
  }
  try {
    const data = await fetchSummary(title);
    if (data.type === 'disambiguation') throw new Error(`disambiguation page: ${title}`);
    const img = data.originalimage ?? data.thumbnail;
    if (!img) throw new Error(`no lead image for ${title}`);
    out[key] = {
      src: toThumb(img.source, img.width),
      alt: (data.description ?? '').trim() || title,
      width: img.width,
      height: img.height,
      pageTitle: title,
    };
    console.log(`ok   ${key.padEnd(22)} ${title}`);
  } catch (err) {
    failures.push({ key, title, reason: err.message });
    console.error(`ERR  ${key.padEnd(22)} ${title} — ${err.message}`);
  }
  await new Promise((r) => setTimeout(r, 1500)); // stay well under the rate limit
}

await mkdir(OUT_DIR, { recursive: true });
await writeFile(OUT_FILE, JSON.stringify(out, null, 2) + '\n');

console.log(`\nWrote ${Object.keys(out).length} images to ${OUT_FILE}`);
if (failures.length) {
  console.log(`\n${failures.length} failures (fix titles above and re-run):`);
  for (const f of failures) console.log(`  - ${f.key}: ${f.title}`);
}