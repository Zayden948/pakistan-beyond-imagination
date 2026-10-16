/**
 * "Travel by region" explorer: region tabs drive a media + text panel.
 * Punjab (index 0) is server-rendered in index.html; the rest lives here.
 * Text merges EN (base data) with FR/UR overrides from i18n/regions.js and
 * the panel re-renders on `langchange`.
 */
import { getLang, regionsTexts } from './lang.js';

const REGIONS = [
  null, // Punjab is server-rendered
  {
    name: 'Sindh',
    tagline: 'Gates of the sea',
    heading: 'From Mohenjo-daro to the Arabian Sea',
    desc: 'Sindh holds both ends of a deep story — the 5,000-year-old cities of the Indus Valley and the 20-million-strong port of Karachi. Between them: deserts, shrines, Ajrak block-printing and the largest funerary landscape on Earth.',
    highlights: [
      'Karachi — Clifton, Empress Market, food streets',
      'Mohenjo-daro — UNESCO Indus Valley city',
      'Makli Necropolis — half a million tombs',
      'Thatta — Shah Jahan Mosque’s tiled domes',
    ],
    meta: 'Capital · Karachi   |   Language · Sindhi',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Clifton_Karachi_View.jpg/1280px-Clifton_Karachi_View.jpg',
    alt: 'Clifton shoreline and towers of Karachi',
  },
  {
    name: 'Khyber Pakhtunkhwa',
    tagline: 'Mountain passes',
    heading: 'Along the Hindu Kush',
    desc: 'The frontier of empires — where Buddhist Gandhara, Silk Road caravans and Pashtun traditions meet. Swat’s green valleys, the ruins of Takht-i-Bahi and the legendary Khyber Pass all sit within this province.',
    highlights: [
      'Peshawar — Qissa Khwani Bazaar, Mahabat Khan Mosque',
      'Swat Valley — rivers, Malam Jabba, Mahodand Lake',
      'Takht-i-Bahi — UNESCO Gandharan monastery',
      'Kumrat & Kalam — pine forests and lakes',
    ],
    meta: 'Capital · Peshawar   |   Language · Pashto',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Islamia_College_Peshawar_%28Public_Sector_University%29%2C_Khyber_Pakhtunkhwa%2C_Pakistan_cropped.jpg/1280px-Islamia_College_Peshawar_%28Public_Sector_University%29%2C_Khyber_Pakhtunkhwa%2C_Pakistan_cropped.jpg',
    alt: 'Red-brick towers of Islamia College, Peshawar',
  },
  {
    name: 'Balochistan',
    tagline: 'The wild south-west',
    heading: 'Pakistan’s largest, emptiest, wildest',
    desc: 'Nearly half the country’s land, a fraction of its population — Balochistan is a landscape of coastal cliffs, Hingol’s rock formations and the mud-volcano country of the Makran. Its Sajji roasting and nomadic weaving traditions run deep.',
    highlights: [
      'Hingol National Park — Princess of Hope, mud volcanoes',
      'Makran Coastal Highway — Gwadar to Karachi',
      'Princess of Hope — natural sea-arch stone formation',
      'Ziarat — ancient juniper forest of Juniperus macropolia',
    ],
    meta: 'Capital · Quetta   |   Language · Balochi',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Hingool_Nationa_Park_and_Makran_Coastal_Highway.jpg/1280px-Hingool_Nationa_Park_and_Makran_Coastal_Highway.jpg',
    alt: 'The Makran Coastal Highway winding through Hingol National Park',
  },
  {
    name: 'Gilgit-Baltistan',
    tagline: 'Roof of the world',
    heading: 'Five ranges, three glaciers, one highway',
    desc: 'Where the Himalaya, Karakoram and Hindu Kush converge — K2, Nanga Parbat, the Baltoro and Biafo glaciers, and the valleys of Hunza, Skardu and Deosai. A high-altitude world of forts, orchards and turquoise lakes.',
    highlights: [
      'Hunza — Baltit Fort, Attabad Lake, Passu Cones',
      'Skardu — Shigar Fort, cold desert, treks to Concordia',
      'Deosai — the second-highest plateau on Earth',
      'K2 & Nanga Parbat — giants of the Karakoram and Himalaya',
    ],
    meta: 'Centre · Gilgit / Skardu   |   Languages · Shina, Balti, Burushaski',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Hunza_Valley_HDR.jpg/1280px-Hunza_Valley_HDR.jpg',
    alt: 'Hunza Valley terraced villages beneath peaks',
  },
  {
    name: 'Azad Jammu & Kashmir',
    tagline: 'Green valleys',
    heading: 'Rivers, forests and hillside villages',
    desc: 'South of Gilgit, the Neelum and Jhelum rivers carve deep, forested valleys through the Pir Panjal range. Muzaffarabad’s confluence view, the meadows of Toli Peer and the lakes of Ratti Gali make it a summer classic.',
    highlights: [
      'Neelum Valley — the river road north',
      'Ratti Gali — alpine lake at 3,700 m',
      'Toli Peer & Rawalakot — hill meadows',
      'Banjosa Lake — pine-ringed waters',
    ],
    meta: 'Capital · Muzaffarabad   |   Languages · Pahari-Pothwari, Gojri',
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Neelum_Valley%2C_Azad_Jammu_%26_Kashmir%2C_Pakistan.jpg/1280px-Neelum_Valley%2C_Azad_Jammu_%26_Kashmir%2C_Pakistan.jpg',
    alt: 'The Neelum river winding through a forested valley',
  },
];

/** Punjab (index 0) data, used when returning from another region. */
const PUNJAB = {
  kicker: 'Punjab',
  heading: 'The land of five rivers',
  desc: 'Pakistan’s heartland and its most populous province — Mughal Lahore, the shrine city of Multan, Harappa’s ancient mounds, and the Sufi music that binds the region together.',
  highlights: [
    'Lahore — Badshahi Mosque, Lahore Fort, Walled City',
    'Multan — shrines & blue pottery',
    'Harappa — Indus Valley ruins',
    'Khewra — the world’s second-largest salt mine',
  ],
  meta: 'Capital · Lahore   |   Language · Punjabi',
  img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Lahore_Fort_view_from_Baradari.jpg/1280px-Lahore_Fort_view_from_Baradari.jpg',
  alt: 'Lahore Fort’s marble pavilion and reflecting pool',
};

const BASE = [PUNJAB, ...REGIONS.slice(1)];

/* Merge the English base with the FR/UR overrides for the active language. */
const localized = (index) => {
  const ov = regionsTexts()[index]?.[getLang()];
  if (!ov) return BASE[index];
  const base = BASE[index] ?? {};
  const { name, heading, desc, highlights, meta, alt } = ov;
  return { ...base, name, heading, desc, highlights, meta, alt };
};

export function initRegions() {
  const tabs = [...document.querySelectorAll('.region-tab')];
  const panel = document.getElementById('region-panel');
  if (!tabs.length || !panel) return;

  const render = (index) => {
    const region = localized(index);
    if (!region) return;

    tabs.forEach((t, i) => {
      t.classList.toggle('is-active', i === index);
      t.setAttribute('aria-selected', String(i === index));
      t.tabIndex = i === index ? 0 : -1;
    });

    panel.setAttribute('aria-labelledby', tabs[index].id);
    panel.classList.remove('is-switching');
    void panel.offsetWidth;
    panel.classList.add('is-switching');

    panel.querySelector('.regions__media').innerHTML =
      `<img src="${region.img}" alt="${region.alt}" width="1280" height="960" loading="lazy" decoding="async" />`;
    panel.querySelector('.regions__kicker').textContent = region.name;
    panel.querySelector('.regions__text h3').textContent = region.heading;
    panel.querySelector('.regions__lead').textContent = region.desc;
    panel.querySelector('.regions__text ul').innerHTML =
      region.highlights.map((item) => `<li>${item}</li>`).join('');
    panel.querySelector('.regions__meta').textContent = region.meta;
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => render(i));
    tab.addEventListener('keydown', (e) => {
      if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return;
      e.preventDefault();
      if (e.key === 'ArrowDown') render((i + 1) % tabs.length);
      if (e.key === 'ArrowUp') render((i - 1 + tabs.length) % tabs.length);
      if (e.key === 'Home') render(0);
      if (e.key === 'End') render(tabs.length - 1);
    });
  });

  document.addEventListener('langchange', () => {
    const active = tabs.findIndex((t) => t.classList.contains('is-active'));
    render(active === -1 ? 0 : active);
  });

  render(0);
}