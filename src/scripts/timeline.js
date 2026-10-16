/**
 * Interactive history timeline: era tabs drive a single detail panel.
 * Era 0 (Indus Valley) is server-rendered in index.html; data lives here.
 * Text merges EN (base data) with FR/UR overrides from i18n/timeline.js and
 * the panel re-renders on `langchange`.
 */
import { getLang, timelineTexts } from './lang.js';

const ERAS = [
  {
    date: 'c. 7000 – 1300 BCE',
    title: 'The Indus Valley Civilisation',
    body: "Along the Indus, one of humanity's first urban civilisations rose: Harappa and Mohenjo-daro built grid-planned streets, covered drains and private wells two thousand years before Rome existed. Their still-undeciphered script is one of archaeology's great open questions.",
    facts: [
      'Mehrgarh shows settled farming from about 7000 BCE — the oldest known village in South Asia.',
      'Mohenjo-daro may have held some 40,000 people at its height.',
      'Standardised bricks and weights show remarkably unified city-planning.',
    ],
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Mohenjodaro_-_view_of_the_stupa_mound.JPG/1280px-Mohenjodaro_-_view_of_the_stupa_mound.JPG',
    alt: 'Mohenjo-daro excavated streets and stupa mound',
  },
  {
    date: 'c. 500 BCE – 500 CE',
    title: 'Gandhara — the Buddhist crossroads',
    body: 'In the north-west, where the Silk Road met the subcontinent, Gandhara blended Greek, Persian and Indian art into serene Buddhist sculpture. Taxila and Takht-i-Bahi drew monks and scholars from across Asia.',
    facts: [
      'Taxila was among the ancient world’s great centres of learning.',
      'The first large images of the Buddha were carved here in schist and stucco.',
      'Silk Road caravans crossed the Indus at Gandhara’s gates.',
    ],
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Lahore_Fort_view_from_Baradari.jpg/1280px-Lahore_Fort_view_from_Baradari.jpg',
    alt: 'Marble pavilion within a historic fort',
  },
  {
    date: '712 CE',
    title: 'Islam crosses the Indus',
    body: 'Muhammad bin Qasim’s expedition into Sindh brought Islam to the subcontinent. Over the following centuries Sufi saints — Data Ganj Bakhsh in Lahore, Bahauddin Zakariya in Multan — spread the faith through poetry, charity and music.',
    facts: [
      'Sufi shrines became centres of learning, art and social care.',
      'Qawwali grew out of Sufi devotional practice.',
      'Sindhi and Punjabi poetry absorbed verses in praise of the saints.',
    ],
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Shrine_Shah_Rukn-e-Alam.jpg/1280px-Shrine_Shah_Rukn-e-Alam.jpg',
    alt: 'Blue-tiled dome of the Shrine of Shah Rukn-e-Alam, Multan',
  },
  {
    date: '1206 – 1526',
    title: 'The Sultanates',
    body: 'Delhi Sultanate rule reshaped the Indus basin: cities walled in brick, Persian became a court language, and fortress engineering reached its peak in military architecture across northern Punjab.',
    facts: [
      'New building styles fused Persian decoration with Indian craft.',
      'Fortified caravanserais served trade between Central Asia and the coast.',
      'Persianate poetry and administration took early root in the cities.',
    ],
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Kabuli_Gate_-_Rohtas_Fort_by_Usman_Ghani.jpg/1280px-Kabuli_Gate_-_Rohtas_Fort_by_Usman_Ghani.jpg',
    alt: 'Stone gateway of Rohtas Fort',
  },
  {
    date: '1526 – 1857',
    title: 'The Mughal Empire',
    body: 'Under Babur’s dynasty, Lahore became an imperial capital of gardens, marble and calligraphy. Akbar, Jahangir, Shah Jahan and Aurangzeb left forts, mosques and gardens that still define the region’s architecture.',
    facts: [
      'The Badshahi Mosque (1673) was among the world’s largest places of worship.',
      'Shalimar Gardens carried the Persian charbagh form to its height.',
      'Miniature painting and book arts flourished in imperial workshops.',
    ],
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Badshahi_Mosque_front_picture.jpg/1280px-Badshahi_Mosque_front_picture.jpg',
    alt: 'Badshahi Mosque marble and sandstone facade',
  },
  {
    date: '1858 – 1947',
    title: 'British India',
    body: 'The British Raj brought railways, canals and colonial civic buildings — and accelerating political change. Karachi grew from a fishing town into a major port while Punjab became the Empire’s breadbasket.',
    facts: [
      'The railway network stitched Punjab and Sindh to the sea.',
      'Colonial-era colleges shaped a new generation of leaders.',
      'The 1857 uprising began its course in towns across the Indus plain.',
    ],
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Clifton_Karachi_View.jpg/1280px-Clifton_Karachi_View.jpg',
    alt: 'Karachi skyline by the Arabian Sea',
  },
  {
    date: '1940 – 1947',
    title: 'The Pakistan Movement',
    body: 'On 23 March 1940, the All-India Muslim League passed the Lahore Resolution at Minto Park, demanding independent states for Muslim-majority regions. Muhammad Ali Jinnah gave the movement its roadmap; Allama Iqbal gave it its poetry.',
    facts: [
      'Iqbal had first called for a consolidated north-western Muslim state in 1930.',
      'The Minar-e-Pakistan now stands where the Resolution was passed.',
      'The 1946 elections turned the Resolution into electoral strength.',
    ],
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Minar_e_Pakistan_2021.jpg/1280px-Minar_e_Pakistan_2021.jpg',
    alt: 'Minar-e-Pakistan tower in Lahore',
  },
  {
    date: 'August 1947',
    title: 'Independence',
    body: 'On 14 August 1947 Pakistan became independent, born of the largest mass migration in recorded history. Karachi became its first capital and Jinnah its first Governor-General.',
    facts: [
      'Some 10–15 million people crossed the new borders in both directions.',
      'The green flag with crescent and star became the national standard.',
      'Independence Day remains the country’s principal civic celebration.',
    ],
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Flag_of_Pakistan.svg/1280px-Flag_of_Pakistan.svg.png',
    alt: 'The green flag of Pakistan with crescent and star',
  },
  {
    date: '1947 – today',
    title: 'Modern Pakistan',
    body: 'From the planned capital of Islamabad to cricket stadia, truck art, Coke Studio, a growing tech industry and a thriving contemporary art scene — Pakistan keeps writing itself into the world’s story.',
    facts: [
      'Islamabad was purpose-built and inaugurated as the capital in the 1960s.',
      'The Karakoram Highway links the country to China through the mountains.',
      'Pakistani music, art and cinema now reach audiences worldwide.',
    ],
    img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Blue_Hour_at_Pakistan_Monument.jpg/1280px-Blue_Hour_at_Pakistan_Monument.jpg',
    alt: 'Pakistan Monument at blue hour',
  },
];

const ARROW_KEYS = ['Home', 'End', 'ArrowRight', 'ArrowLeft'];

/* Merge the English base with the FR/UR overrides for the active language. */
const localized = (index) => {
  const ov = timelineTexts()[index]?.[getLang()];
  if (!ov) return ERAS[index];
  return { ...ERAS[index], ...ov };
};

export function initTimeline() {
  const tabs = [...document.querySelectorAll('.era-tab')];
  const panel = document.getElementById('era-panel');
  if (!tabs.length || !panel) return;

  const setEra = (index, { focusTab = false } = {}) => {
    const era = localized(index);
    const tab = tabs[index];
    if (!era || !tab) return;

    tabs.forEach((t, i) => {
      t.classList.toggle('is-active', i === index);
      t.setAttribute('aria-selected', String(i === index));
      t.tabIndex = i === index ? 0 : -1;
    });

    panel.setAttribute('aria-labelledby', tab.id);
    panel.classList.remove('is-switching'); // restart CSS entrance animation
    void panel.offsetWidth; // force reflow so the animation can run again
    panel.classList.add('is-switching');

    panel.querySelector('.timeline__media').innerHTML =
      `<img src="${era.img}" alt="${era.alt}" width="1280" height="960" loading="lazy" decoding="async" />`;
    panel.querySelector('.timeline__era-date').textContent = era.date;
    panel.querySelector('.timeline__title').textContent = era.title;
    panel.querySelector('.timeline__body').textContent = era.body;
    panel.querySelector('.timeline__facts').innerHTML =
      era.facts.map((fact) => `<li>${fact}</li>`).join('');

    tab.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
    if (focusTab) tab.focus();
  };

  const current = () => tabs.findIndex((t) => t.classList.contains('is-active'));

 tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => setEra(i));
    tab.addEventListener('keydown', (e) => {
      if (!ARROW_KEYS.includes(e.key)) return;
      e.preventDefault();
      if (e.key === 'ArrowRight') setEra((i + 1) % tabs.length, { focusTab: true });
      if (e.key === 'ArrowLeft') setEra((i - 1 + tabs.length) % tabs.length, { focusTab: true });
      if (e.key === 'Home') setEra(0, { focusTab: true });
      if (e.key === 'End') setEra(tabs.length - 1, { focusTab: true });
    });
  });

  document.getElementById('era-prev')?.addEventListener('click', () =>
    setEra((current() - 1 + tabs.length) % tabs.length));
  document.getElementById('era-next')?.addEventListener('click', () =>
    setEra((current() + 1) % tabs.length));

  document.addEventListener('langchange', () => {
    const active = current() === -1 ? 0 : current();
    setEra(active);
  });

  setEra(0); // sync the markup with data
}