// ═══════════════════════════════════════════════════════════════════
//  Dravidian Language Family — Historical Data
//  Sources: Narasimhan et al. 2019 (Science 365), Reich 2018,
//  McAlpin 1981, Krishnamurti 2003, Southworth 2005.
//
//  Coordinate system: [latitude, longitude]
//  Radii in kilometres — converted to metres in app.js (* 1000)
//  Years: negative = BCE, positive = CE
// ═══════════════════════════════════════════════════════════════════

const DRAVIDIAN_DATA = {

  startYear: -4000,
  endYear:    1500,

  familyKey: 'dravidian',
  familyLabel: 'Dravidian',

  meta: {
    timelineMin: -4000,
    timelineMax:  1500,
    defaultYear: -2000,
    title:    'Dravidian Languages',
    subtitle: 'Dravidian language family dispersal, 4000 BCE – 1500 CE',
  },

  admixtureComponents: {
    AASI:   { label: 'AASI',        color: '#E91E63' },
    IVC:    { label: 'IVC-related', color: '#FF9800' },
    Steppe: { label: 'Steppe',      color: '#9C27B0' },
    Other:  { label: 'Other',       color: '#5D6D7E' },
  },

  // ── Language branches ────────────────────────────────────────────
  branches: {
    dravidian_proto:   { name: 'Proto-Dravidian',   color: '#E91E63', textColor: '#fff' },
    dravidian_south:   { name: 'South Dravidian',   color: '#FF5722', textColor: '#fff' },
    dravidian_central: { name: 'Central Dravidian', color: '#FF9800', textColor: '#fff' },
    dravidian_north:   { name: 'North Dravidian',   color: '#FFC107', textColor: '#000' },
  },

  // ── Genetic ancestry notes ───────────────────────────────────────
  genetics: {
    dravidian_proto:
      'Proto-Dravidian speakers are associated with the Indus Valley Civilisation and its agricultural heritage. Genomic studies (Narasimhan et al. 2019) show IVC-related populations carried a mix of Iranian Neolithic and Ancient Ancestral South Indian (AASI) ancestry, with no steppe component — consistent with a pre-Indo-Aryan origin for Dravidian languages in South Asia.',
    dravidian_south:
      'South Dravidian speakers (Tamil, Kannada, Malayalam, Telugu) descend largely from South Indian Neolithic populations. Ancient DNA from Rakhigarhi and other IVC sites shows high IVC-related ancestry with a significant AASI component. Modern South Indians show low steppe ancestry (~5–15%) compared to North Indians (~15–25%), consistent with lower Indo-Aryan influence.',
    dravidian_central:
      'Central Dravidian languages (Gondi, Kolami, Naiki) are spoken across the Deccan plateau. Their speakers represent an intermediate genetic profile between the north and south, with higher AASI proportions than North India but shaped by the southward Dravidian migration that preceded Indo-Aryan expansion.',
    dravidian_north:
      'North Dravidian includes Brahui (Balochistan), Kurukh, and Malto. The Brahui-speaking population of western Pakistan is a probable linguistic relic of the wider Dravidian zone before Indo-Aryan expansion. Brahui speakers show a genetic profile close to other Balochi populations, suggesting long-term in-place residence rather than a recent migration from South India.',
  },

  // ── Cultures / peoples ───────────────────────────────────────────
  cultures: [

    {
      id: 'dravidian_proto_homeland',
      name: 'Proto-Dravidian Homeland',
      branch: 'dravidian_proto',
      description: 'The reconstructed Proto-Dravidian homeland, associated with the agricultural and pastoral communities of the greater Indus Valley and adjacent regions. Proto-Dravidian is hypothesised to have been spoken broadly across the Indus Valley Civilisation zone before the Indo-Aryan expansion fragmented and pushed the family southward.',
      startYear: -4000,
      endYear:   -1500,
      phases: [
        { year: -4000, center: [27.5, 68.0], radius: 500 },
        { year: -2600, center: [27.5, 69.0], radius: 700 },
        { year: -1900, center: [26.5, 70.0], radius: 550 },
        { year: -1500, center: [25.0, 71.0], radius: 400 },
      ],
    },

    {
      id: 'dravidian_brahui_relic',
      name: 'Brahui Speakers (Balochistan)',
      branch: 'dravidian_north',
      description: 'The Brahui-speaking population of Balochistan, Pakistan, represents a probable relic of a once-wider Dravidian-speaking zone in the northwest. Their persistence in the region may reflect in-situ continuity from the pre-Indo-Aryan Dravidian distribution rather than a southward relict migration.',
      startYear: -2500,
      endYear:    1500,
      phases: [
        { year: -2500, center: [29.5, 66.5], radius: 250 },
        { year:     0, center: [29.5, 66.0], radius: 220 },
        { year:  1500, center: [29.0, 66.0], radius: 180 },
      ],
    },

    {
      id: 'dravidian_south_neolithic',
      name: 'South Indian Neolithic',
      branch: 'dravidian_south',
      description: 'The South Indian Neolithic (Brahmagiri tradition) represents the spread of Dravidian-speaking agropastoralists across the Deccan plateau and peninsular India. Characterised by ash mounds from cattle-burning rituals, this culture is the archaeological correlate of early South Dravidian expansion into the peninsula.',
      startYear: -3000,
      endYear:    -500,
      phases: [
        { year: -3000, center: [15.5, 76.5], radius: 350 },
        { year: -2000, center: [14.5, 77.0], radius: 500 },
        { year: -1000, center: [13.5, 77.5], radius: 600 },
        { year:  -500, center: [13.0, 78.0], radius: 580 },
      ],
    },

    {
      id: 'dravidian_sangam_tamil',
      name: 'Sangam Tamil Culture',
      branch: 'dravidian_south',
      description: 'The Sangam period (c. 300 BCE – 300 CE) represents the classical age of Tamil literature and culture. Centred on the Cauvery delta and the Coromandel coast, Sangam Tamil society was organised around five ecological zones (tinai) and produced an extraordinary corpus of secular poetry describing love, war, and nature in a sophisticated literary tradition.',
      startYear: -300,
      endYear:    300,
      admixture: { AASI: 0.70, IVC: 0.25, Other: 0.05 },
      phases: [
        { year: -300, center: [10.5, 78.5], radius: 380 },
        { year:    0, center: [10.8, 79.0], radius: 420 },
        { year:  300, center: [11.0, 79.5], radius: 400 },
      ],
    },

    {
      id: 'dravidian_deccan_central',
      name: 'Central Dravidian (Deccan)',
      branch: 'dravidian_central',
      description: 'The Central Dravidian languages (Gondi, Kolami, Naiki, Parji, Gadaba) are spoken across the central Deccan plateau in a broad belt from Maharashtra to Odisha. They represent an intermediate Dravidian group that was surrounded and partially separated from South Dravidian by the northward spread of Indo-Aryan.',
      startYear: -1000,
      endYear:    1500,
      phases: [
        { year: -1000, center: [20.0, 79.5], radius: 450 },
        { year:     0, center: [19.5, 80.0], radius: 500 },
        { year:  1500, center: [19.0, 80.5], radius: 480 },
      ],
    },

  ], // end cultures

  // ── Migration paths ──────────────────────────────────────────────
  migrations: [

    {
      id: 'dravidian_southward_expansion',
      name: 'Southward: Proto-Dravidian → South India',
      branch: 'dravidian_south',
      description: 'The southward movement of Dravidian-speaking agropastoralists from the northwest into peninsular India, beginning as IVC populations dispersed after ~1900 BCE and accelerating with pressure from Indo-Aryan expansion.',
      startYear:    -2000,
      endYear:       -300,
      animateStart: -1900,
      animateEnd:   -1000,
      path: [
        [26.0, 70.0],
        [23.0, 73.0],
        [20.0, 75.0],
        [17.0, 76.5],
        [14.0, 77.0],
        [11.0, 78.5],
      ],
    },

    {
      id: 'dravidian_deccan_spread',
      name: 'Deccan Spread: South Indian Neolithic',
      branch: 'dravidian_central',
      description: 'The spread of Neolithic agropastoral communities across the Deccan plateau, carrying early Dravidian languages into the interior of peninsular India.',
      startYear:    -3000,
      endYear:      -1000,
      animateStart: -2800,
      animateEnd:   -1500,
      path: [
        [23.0, 73.0],
        [21.5, 76.0],
        [19.5, 78.0],
        [17.5, 79.5],
        [15.0, 78.0],
      ],
    },

  ], // end migrations

  // ── Timeline events ──────────────────────────────────────────────
  events: [
    { year: -2600, name: 'Indus Valley Civilisation at its height — probable Dravidian-speaking population', branch: 'dravidian_proto' },
    { year: -1900, name: 'IVC urban phase ends; Dravidian dispersion southward begins', branch: 'dravidian_proto' },
    { year: -1500, name: 'Indo-Aryan expansion compresses Dravidian range southward', branch: 'dravidian_proto' },
    { year: -1000, name: 'South Indian Neolithic cultures peak across Deccan', branch: 'dravidian_south' },
    { year:  -300, name: 'Sangam period begins — classical Tamil literature', branch: 'dravidian_south' },
    { year:   300, name: 'Sangam period ends; Pallava and Chalukya kingdoms rise', branch: 'dravidian_south' },
  ],

  sites:   [],
  sources: [],

}; // end DRAVIDIAN_DATA

if (typeof DATASETS !== 'undefined') {
  DATASETS['dravidian'] = DRAVIDIAN_DATA;
}
