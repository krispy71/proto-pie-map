// ═══════════════════════════════════════════════════════════════════
//  Sino-Tibetan Language Family — Historical Data
//  Sources: Sagart et al. 2019 (PNAS), Zhang et al. 2019,
//  Bellwood 2005, Scott 2009, Chang et al. 2022.
//
//  Coordinate system: [latitude, longitude]
//  Radii in kilometres — converted to metres in app.js (* 1000)
//  Years: negative = BCE, positive = CE
// ═══════════════════════════════════════════════════════════════════

const SINOTIBETAN_DATA = {

  startYear: -7000,
  endYear:    1500,

  familyKey: 'sinotibetan',
  familyLabel: 'Sino-Tibetan',

  meta: {
    timelineMin: -7000,
    timelineMax:  1500,
    defaultYear: -3000,
    title:    'Sino-Tibetan Languages',
    subtitle: 'Sino-Tibetan language family dispersal, 7000 BCE – 1500 CE',
  },

  admixtureComponents: {
    YellowRiver: { label: 'Yellow River Farmer', color: '#00BCD4' },
    YangtzeRiver:{ label: 'Yangzi Farmer',       color: '#009688' },
    Steppe:      { label: 'Steppe',              color: '#9C27B0' },
    Other:       { label: 'Other',               color: '#5D6D7E' },
  },

  // ── Language branches ────────────────────────────────────────────
  branches: {
    sinotibetan_proto:   { name: 'Proto-Sino-Tibetan', color: '#00ACC1', textColor: '#000' },
    sinotibetan_sinitic: { name: 'Sinitic (Chinese)',  color: '#006064', textColor: '#fff' },
    sinotibetan_tibeto:  { name: 'Tibeto-Burman',      color: '#4CAF50', textColor: '#fff' },
  },

  // ── Genetic ancestry notes ───────────────────────────────────────
  genetics: {
    sinotibetan_proto:
      'Proto-Sino-Tibetan speakers are associated with the Yangshao and related Yellow River Neolithic cultures of northern China. Genetic studies place the split between Sinitic and Tibeto-Burman branches at approximately 5900–4400 BCE (Sagart et al. 2019). The founding population carried East Asian farmer ancestry derived from early Yellow River millet cultivators.',
    sinotibetan_sinitic:
      'Sinitic populations (Chinese-speaking peoples) descend primarily from Yellow River millet farmers. Ancient DNA from Yangshao and Longshan sites shows a relatively homogeneous East Asian genetic profile. Later expansions introduced Yangzi rice-farmer and steppe-related ancestry in southern and northern populations respectively. The Han Chinese genome today is largely a mixture of Yellow River farmer ancestry with regional admixture from pre-Sinitic populations.',
    sinotibetan_tibeto:
      'Tibeto-Burman languages are spoken from Tibet to Myanmar and northeastern India. Tibetans carry a genetic adaptation for high-altitude hypoxia (EPAS1 gene) derived in part from Denisovan introgression — one of the most striking known examples of ancient admixture contributing an adaptive variant. Tibeto-Burman genetic profiles broadly reflect Yellow River farmer ancestry mixed with varying degrees of local hunter-gatherer and East Asian steppe ancestry.',
  },

  // ── Cultures / peoples ───────────────────────────────────────────
  cultures: [

    {
      id: 'sinotibetan_proto_homeland',
      name: 'Proto-Sino-Tibetan Homeland',
      branch: 'sinotibetan_proto',
      description: 'The reconstructed Proto-Sino-Tibetan homeland, associated with early millet-farming communities along the Yellow River and adjacent Wei River valley. Phylogenetic dating (Sagart et al. 2019, Zhang et al. 2019) places the initial diversification between 5900–7000 BCE. The Cishan and early Yangshao cultures are the likely archaeological correlates.',
      startYear: -7000,
      endYear:   -5000,
      phases: [
        { year: -7000, center: [36.0, 105.0], radius: 400 },
        { year: -6000, center: [35.5, 107.0], radius: 500 },
        { year: -5000, center: [35.0, 109.0], radius: 550 },
      ],
    },

    {
      id: 'sinotibetan_yangshao',
      name: 'Yangshao Culture',
      branch: 'sinotibetan_sinitic',
      description: 'The Yangshao Culture (5000–3000 BCE) was a major Yellow River Neolithic culture characterised by painted red pottery, millet and pig agriculture, and semi-subterranean longhouses. It spread across a broad zone of northern China and is strongly associated with Proto-Sinitic or early Chinese language dispersal.',
      startYear: -5000,
      endYear:   -3000,
      phases: [
        { year: -5000, center: [35.0, 110.0], radius: 450 },
        { year: -4000, center: [35.5, 112.0], radius: 600 },
        { year: -3000, center: [35.5, 114.0], radius: 700 },
      ],
    },

    {
      id: 'sinotibetan_longshan',
      name: 'Longshan Culture',
      branch: 'sinotibetan_sinitic',
      description: 'The Longshan Culture (3000–1900 BCE) succeeded Yangshao and is characterised by eggshell-thin black pottery, walled towns, and intensive agriculture. It represents increasing social complexity and is the immediate precursor to the earliest Chinese states (Erlitou/Shang). Longshan expanded the Sinitic cultural zone significantly eastward toward the coast.',
      startYear: -3000,
      endYear:   -1900,
      phases: [
        { year: -3000, center: [36.0, 114.0], radius: 600 },
        { year: -2500, center: [36.0, 116.0], radius: 750 },
        { year: -1900, center: [35.5, 116.5], radius: 800 },
      ],
    },

    {
      id: 'sinotibetan_shang',
      name: 'Shang Dynasty',
      branch: 'sinotibetan_sinitic',
      description: 'The Shang Dynasty (c. 1600–1046 BCE) is the earliest Chinese state confirmed by both archaeology and written records. Oracle bone inscriptions provide the first evidence of written Chinese, directly ancestral to modern Chinese script. The Shang state controlled the middle Yellow River plain and conducted elaborate bronze-casting rituals and ancestor worship.',
      startYear: -1600,
      endYear:   -1046,
      admixture: { YellowRiver: 0.80, YangtzeRiver: 0.10, Other: 0.10 },
      phases: [
        { year: -1600, center: [35.5, 113.5], radius: 500 },
        { year: -1200, center: [35.5, 114.0], radius: 600 },
        { year: -1046, center: [35.5, 114.5], radius: 580 },
      ],
    },

    {
      id: 'sinotibetan_zhou',
      name: 'Zhou Dynasty',
      branch: 'sinotibetan_sinitic',
      description: 'The Zhou Dynasty (1046–256 BCE) saw Chinese civilisation expand dramatically across the North China Plain and into the Yangzi valley. The Western Zhou was a feudal state; the Eastern Zhou (Spring and Autumn and Warring States periods) saw the fragmentation of Zhou authority and the flourishing of the Hundred Schools of Thought, including Confucianism and Daoism.',
      startYear: -1046,
      endYear:    -256,
      phases: [
        { year: -1046, center: [34.5, 112.0], radius: 700 },
        { year:  -700, center: [34.0, 113.0], radius: 900 },
        { year:  -500, center: [33.5, 114.5], radius: 1000 },
        { year:  -256, center: [33.0, 115.0], radius: 1100 },
      ],
    },

    {
      id: 'sinotibetan_qin_han',
      name: 'Qin–Han Empire',
      branch: 'sinotibetan_sinitic',
      description: 'The Qin (221–206 BCE) and Han (206 BCE–220 CE) dynasties unified China for the first time and established the administrative, cultural, and demographic template for all subsequent Chinese civilisation. Han expansion incorporated the Yangzi basin, South China, and Central Asia into a unified Sinitic sphere, spreading the Chinese language and culture across East Asia.',
      startYear: -221,
      endYear:    220,
      admixture: { YellowRiver: 0.65, YangtzeRiver: 0.25, Other: 0.10 },
      phases: [
        { year: -221, center: [34.0, 114.0], radius: 1100 },
        { year:    0, center: [33.0, 114.0], radius: 1400 },
        { year:  220, center: [33.0, 113.5], radius: 1350 },
      ],
    },

    {
      id: 'sinotibetan_tibetan_plateau',
      name: 'Tibeto-Burman Homeland (Tibetan Plateau)',
      branch: 'sinotibetan_tibeto',
      description: 'The Tibetan Plateau was occupied by Tibeto-Burman-speaking populations from at least the Neolithic. The earliest farmers here cultivated barley and herded yak at altitudes above 3500 m. A key EPAS1 genetic variant enabling efficient oxygen use at altitude, partly derived from Denisovan introgression, was strongly selected in this population.',
      startYear: -7000,
      endYear:    1500,
      phases: [
        { year: -7000, center: [32.0, 88.0], radius: 600 },
        { year: -3000, center: [31.5, 89.0], radius: 800 },
        { year:     0, center: [31.0, 89.5], radius: 900 },
        { year:  1500, center: [30.5, 90.0], radius: 850 },
      ],
    },

    {
      id: 'sinotibetan_burman_expansion',
      name: 'Tibeto-Burman Expansion (SE Asia)',
      branch: 'sinotibetan_tibeto',
      description: 'Tibeto-Burman-speaking groups expanded southward from the Tibetan Plateau and Yunnan into mainland Southeast Asia during the first millennium BCE and CE. This expansion carried ancestors of modern Burmese, Tibetan, and hundreds of smaller Tibeto-Burman language communities into Myanmar, northeastern India, and Yunnan.',
      startYear: -2000,
      endYear:    1000,
      phases: [
        { year: -2000, center: [28.0, 96.0], radius: 400 },
        { year: -1000, center: [26.0, 97.0], radius: 500 },
        { year:     0, center: [23.0, 96.5], radius: 550 },
        { year:  1000, center: [21.0, 96.0], radius: 600 },
      ],
    },

  ], // end cultures

  // ── Migration paths ──────────────────────────────────────────────
  migrations: [

    {
      id: 'sinotibetan_eastward_expansion',
      name: 'Eastward: Proto-Sino-Tibetan → North China Plain',
      branch: 'sinotibetan_sinitic',
      description: 'The eastward expansion of Sinitic millet farmers from the Yellow River headwaters across the North China Plain, culminating in the Longshan and Shang cultural horizons.',
      startYear:    -5000,
      endYear:      -1000,
      animateStart: -4800,
      animateEnd:   -2500,
      path: [
        [35.5, 107.0],
        [35.5, 110.0],
        [35.8, 113.0],
        [36.0, 115.5],
        [36.0, 118.5],
      ],
    },

    {
      id: 'sinotibetan_southward_tibeto',
      name: 'Southward: Tibeto-Burman into SE Asia',
      branch: 'sinotibetan_tibeto',
      description: 'The southward spread of Tibeto-Burman-speaking groups from the Tibetan Plateau and Yunnan highlands into Myanmar and the upper reaches of mainland Southeast Asian river systems.',
      startYear:    -2000,
      endYear:       1000,
      animateStart: -1800,
      animateEnd:    -500,
      path: [
        [32.0, 90.0],
        [29.5, 93.0],
        [27.0, 95.0],
        [24.5, 96.0],
        [22.0, 96.5],
        [19.5, 96.0],
      ],
    },

    {
      id: 'sinotibetan_han_expansion',
      name: 'Han Expansion: Qin–Han into South China',
      branch: 'sinotibetan_sinitic',
      description: 'The southward expansion of Sinitic Chinese culture and language during the Qin and Han dynasties, incorporating the Yangzi delta, South China, and the northern regions of modern Southeast Asia into the Chinese civilisational sphere.',
      startYear:    -300,
      endYear:       220,
      animateStart: -221,
      animateEnd:      0,
      path: [
        [33.0, 114.0],
        [31.0, 114.5],
        [28.0, 113.5],
        [25.0, 112.0],
        [23.0, 113.5],
      ],
    },

  ], // end migrations

  // ── Timeline events ──────────────────────────────────────────────
  events: [
    { year: -7000, name: 'Proto-Sino-Tibetan spoken in upper Yellow River valley', branch: 'sinotibetan_proto' },
    { year: -5000, name: 'Yangshao Culture begins — painted pottery, millet farming', branch: 'sinotibetan_sinitic' },
    { year: -3000, name: 'Longshan Culture — black pottery, walled towns emerge', branch: 'sinotibetan_sinitic' },
    { year: -1600, name: 'Shang Dynasty founded — first Chinese written records', branch: 'sinotibetan_sinitic' },
    { year: -1046, name: 'Zhou Dynasty replaces Shang — feudal expansion begins', branch: 'sinotibetan_sinitic' },
    { year:  -551, name: 'Confucius born — Hundred Schools of Thought flourish', branch: 'sinotibetan_sinitic' },
    { year:  -221, name: 'Qin Dynasty unifies China for the first time', branch: 'sinotibetan_sinitic' },
    { year:   206, name: 'Han Dynasty begins — Chinese cultural sphere consolidated', branch: 'sinotibetan_sinitic' },
  ],

  sites:   [],
  sources: [],

}; // end SINOTIBETAN_DATA

if (typeof DATASETS !== 'undefined') {
  DATASETS['sinotibetan'] = SINOTIBETAN_DATA;
}
