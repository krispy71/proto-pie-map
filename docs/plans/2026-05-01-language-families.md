# Language Families — Simultaneous Multi-Family Display Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Dravidian and Sino-Tibetan language family datasets and allow all three (PIE, Dravidian, Sino-Tibetan) to display simultaneously on the map, controlled by a new Language Families panel with per-family checkboxes.

**Architecture:** Replace the single-active-dataset model (`this.data`) with an `activeFamilies` map (`{ familyKey → dataObject }`). The render engine iterates all active families on every `renderYear()` call. A new "Language Families" panel with dynamically-built checkboxes calls `activateFamily(key)` / `deactivateFamily(key)`. The branch legend is rebuilt grouped by family.

**Tech Stack:** Plain ES2020, Leaflet.js, Node `node:test` for static file-content tests. No build step.

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `public/dravidian-data.js` | `DRAVIDIAN_DATA` — Dravidian language family dataset |
| Create | `public/sinotibetan-data.js` | `SINOTIBETAN_DATA` — Sino-Tibetan language family dataset |
| Create | `test/language-families.test.js` | Static content tests for new data files and engine changes |
| Modify | `public/data.js` | Add `familyKey`, `familyLabel`, `admixtureComponents` to `PIE_DATA` |
| Modify | `public/app.js` | Full engine refactor — activeFamilies, helpers, grouped legend, multi-family render |
| Modify | `public/index.html` | Add `<script>` tags, `#family-panel` div, remove `dataset-select` |
| Modify | `public/style.css` | Add styles for family panel checkboxes and grouped legend headers |

---

## Task 1: Write failing tests

**Files:**
- Create: `test/language-families.test.js`

- [ ] **Step 1: Write the test file**

```js
const assert = require('node:assert/strict');
const { readFileSync, existsSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
function read(rel) { return readFileSync(path.join(root, rel), 'utf8'); }

test('dravidian-data.js has required schema fields', () => {
  assert.ok(existsSync(path.join(root, 'public/dravidian-data.js')), 'dravidian-data.js must exist');
  const src = read('public/dravidian-data.js');
  assert.ok(src.includes('DRAVIDIAN_DATA'), 'must export DRAVIDIAN_DATA');
  assert.ok(src.includes("familyKey: 'dravidian'"), 'must have familyKey');
  assert.ok(src.includes("familyLabel: 'Dravidian'"), 'must have familyLabel');
  assert.ok(src.includes('admixtureComponents'), 'must have admixtureComponents');
  assert.ok(src.includes("DATASETS['dravidian']") || src.includes("DATASETS.dravidian"), 'must register in DATASETS');
  assert.match(src, /branches\s*:\s*\{/, 'must have branches');
  assert.match(src, /cultures\s*:\s*\[/, 'must have cultures array');
  assert.match(src, /migrations\s*:\s*\[/, 'must have migrations array');
  assert.match(src, /events\s*:\s*\[/, 'must have events array');
  assert.match(src, /genetics\s*:\s*\{/, 'must have genetics object');
  assert.ok(src.includes('dravidian_proto'), 'must include dravidian_proto branch key');
  assert.ok(src.includes('dravidian_south'), 'must include dravidian_south branch key');
});

test('sinotibetan-data.js has required schema fields', () => {
  assert.ok(existsSync(path.join(root, 'public/sinotibetan-data.js')), 'sinotibetan-data.js must exist');
  const src = read('public/sinotibetan-data.js');
  assert.ok(src.includes('SINOTIBETAN_DATA'), 'must export SINOTIBETAN_DATA');
  assert.ok(src.includes("familyKey: 'sinotibetan'"), 'must have familyKey');
  assert.ok(src.includes("familyLabel: 'Sino-Tibetan'"), 'must have familyLabel');
  assert.ok(src.includes('admixtureComponents'), 'must have admixtureComponents');
  assert.ok(src.includes("DATASETS['sinotibetan']") || src.includes("DATASETS.sinotibetan"), 'must register in DATASETS');
  assert.match(src, /branches\s*:\s*\{/, 'must have branches');
  assert.match(src, /cultures\s*:\s*\[/, 'must have cultures array');
  assert.match(src, /migrations\s*:\s*\[/, 'must have migrations array');
  assert.ok(src.includes('sinotibetan_proto'), 'must include sinotibetan_proto branch key');
  assert.ok(src.includes('sinotibetan_sinitic'), 'must include sinotibetan_sinitic branch key');
  assert.ok(src.includes('sinotibetan_tibeto'), 'must include sinotibetan_tibeto branch key');
});

test('PIE_DATA in data.js has familyKey, familyLabel, and admixtureComponents', () => {
  const src = read('public/data.js');
  assert.ok(src.includes("familyKey: 'pie'"), 'PIE_DATA must have familyKey');
  assert.ok(src.includes("familyLabel: 'Proto-Indo-European'"), 'PIE_DATA must have familyLabel');
  assert.ok(src.includes('admixtureComponents'), 'PIE_DATA must have admixtureComponents');
});

test('app.js implements activeFamilies engine', () => {
  const src = read('public/app.js');
  assert.ok(src.includes('this.activeFamilies'), 'must have activeFamilies state');
  assert.ok(src.includes('activateFamily('), 'must have activateFamily method');
  assert.ok(src.includes('deactivateFamily('), 'must have deactivateFamily method');
  assert.ok(src.includes('_calcTimelineUnion('), 'must have _calcTimelineUnion method');
  assert.ok(src.includes('_getBranch('), 'must have _getBranch helper');
  assert.ok(src.includes('_buildFamilyPanel('), 'must have _buildFamilyPanel method');
  assert.ok(src.includes("params.set('families'") || src.includes("params.get('families'"), 'must use families= URL param');
  assert.ok(!src.includes('this.currentDataset'), 'must not use this.currentDataset');
  assert.match(src, /Object\.entries\(this\.activeFamilies\)|Object\.values\(this\.activeFamilies\)/, 'renderYear must iterate activeFamilies');
});

test('index.html has family-panel and new script tags', () => {
  const src = read('public/index.html');
  assert.ok(src.includes('id="family-panel"'), 'must have #family-panel element');
  assert.ok(src.includes('dravidian-data.js'), 'must include dravidian-data.js script');
  assert.ok(src.includes('sinotibetan-data.js'), 'must include sinotibetan-data.js script');
  assert.ok(!src.includes('id="dataset-select"'), 'dataset-select must be removed');
});

test('all dravidian branch keys are prefixed with dravidian_', () => {
  const src = read('public/dravidian-data.js');
  const branchBlock = src.match(/branches\s*:\s*\{([^}]+)\}/s);
  assert.ok(branchBlock, 'must have branches block');
  const keys = [...branchBlock[1].matchAll(/^\s+(\w+)\s*:/gm)].map(m => m[1]);
  keys.forEach(k => {
    assert.ok(k.startsWith('dravidian_'), `branch key "${k}" must start with dravidian_`);
  });
});

test('all sinotibetan branch keys are prefixed with sinotibetan_', () => {
  const src = read('public/sinotibetan-data.js');
  const branchBlock = src.match(/branches\s*:\s*\{([^}]+)\}/s);
  assert.ok(branchBlock, 'must have branches block');
  const keys = [...branchBlock[1].matchAll(/^\s+(\w+)\s*:/gm)].map(m => m[1]);
  keys.forEach(k => {
    assert.ok(k.startsWith('sinotibetan_'), `branch key "${k}" must start with sinotibetan_`);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd /home/aarbuckle/claude-projects/proto-pie-map
node --test test/language-families.test.js 2>&1
```

Expected: All 7 tests FAIL (files don't exist yet, app.js still has old patterns).

- [ ] **Step 3: Commit test file**

```bash
git add test/language-families.test.js
git commit -m "test: add failing tests for language-families feature"
```

---

## Task 2: Add familyKey, familyLabel, admixtureComponents to PIE_DATA

**Files:**
- Modify: `public/data.js` — add three top-level fields after `endYear`

- [ ] **Step 1: Add the three fields to PIE_DATA**

Open `public/data.js`. After the line `endYear: 500,` (line ~17) and before `meta: {`, insert:

```js
  familyKey:   'pie',
  familyLabel: 'Proto-Indo-European',

  admixtureComponents: {
    EHG:   { label: 'EHG',    color: '#D4843D' },
    CHG:   { label: 'CHG',    color: '#9B59B6' },
    WHG:   { label: 'WHG',    color: '#2E86C1' },
    ANF:   { label: 'ANF',    color: '#1E8449' },
    IranN: { label: 'Iran N', color: '#C0392B' },
    Other: { label: 'Other',  color: '#5D6D7E' },
  },
```

- [ ] **Step 2: Run tests — PIE_DATA test should now pass**

```bash
node --test test/language-families.test.js 2>&1 | grep -E 'pass|fail|PIE'
```

Expected: "PIE_DATA in data.js has familyKey, familyLabel, and admixtureComponents" — PASS. Others still fail.

- [ ] **Step 3: Commit**

```bash
git add public/data.js
git commit -m "feat: add familyKey, familyLabel, admixtureComponents to PIE_DATA"
```

---

## Task 3: Create dravidian-data.js

**Files:**
- Create: `public/dravidian-data.js`

- [ ] **Step 1: Create the file**

Create `public/dravidian-data.js` with the following content:

```js
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

  familyKey:   'dravidian',
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
```

- [ ] **Step 2: Run tests — dravidian test should now pass**

```bash
node --test test/language-families.test.js 2>&1 | grep -E 'pass|fail|dravidian'
```

Expected: "dravidian-data.js has required schema fields" and "all dravidian branch keys are prefixed" — both PASS.

- [ ] **Step 3: Commit**

```bash
git add public/dravidian-data.js
git commit -m "feat: add DRAVIDIAN_DATA with cultures, migrations, events"
```

---

## Task 4: Create sinotibetan-data.js

**Files:**
- Create: `public/sinotibetan-data.js`

- [ ] **Step 1: Create the file**

Create `public/sinotibetan-data.js` with the following content:

```js
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

  familyKey:   'sinotibetan',
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
```

- [ ] **Step 2: Run tests — sinotibetan tests should pass**

```bash
node --test test/language-families.test.js 2>&1 | grep -E 'pass|fail|sino|Sino'
```

Expected: "sinotibetan-data.js has required schema fields" and "all sinotibetan branch keys are prefixed" — both PASS.

- [ ] **Step 3: Commit**

```bash
git add public/sinotibetan-data.js
git commit -m "feat: add SINOTIBETAN_DATA with cultures, migrations, events"
```

---

## Task 5: Update index.html

**Files:**
- Modify: `public/index.html`

- [ ] **Step 1: Add script tags for new data files**

In `public/index.html`, find these lines near the bottom:

```html
  <script src="lib/leaflet.js"></script>
  <script src="data.js"></script>
  <script src="civilizations-data.js"></script>
  <script src="app.js"></script>
```

Replace with:

```html
  <script src="lib/leaflet.js"></script>
  <script src="data.js"></script>
  <script src="civilizations-data.js"></script>
  <script src="dravidian-data.js"></script>
  <script src="sinotibetan-data.js"></script>
  <script src="app.js"></script>
```

- [ ] **Step 2: Replace dataset-select with family-panel**

Find this block in `public/index.html`:

```html
    <div class="map-ctrl-row">
      <label class="map-ctrl-label" for="dataset-select">Visualization</label>
      <select id="dataset-select" aria-label="Choose visualization dataset">
        <option value="pie">PIE Migrations (4000 BCE – 500 CE)</option>
        <option value="civilizations">World Civilizations (10,000 BCE – 1500 CE)</option>
      </select>
    </div>
```

Replace with:

```html
    <div id="family-panel" class="map-ctrl-group" role="group" aria-label="Language families">
      <span class="map-ctrl-label">Language Families</span>
      <!-- checkboxes populated dynamically by app.js _buildFamilyPanel() -->
    </div>
```

- [ ] **Step 3: Run test — index.html test should pass**

```bash
node --test test/language-families.test.js 2>&1 | grep -E 'pass|fail|index'
```

Expected: "index.html has family-panel and new script tags" — PASS.

- [ ] **Step 4: Commit**

```bash
git add public/index.html
git commit -m "feat: add family-panel, new data script tags, remove dataset-select from index.html"
```

---

## Task 6: Add CSS for family panel and grouped legend

**Files:**
- Modify: `public/style.css`

- [ ] **Step 1: Add styles**

Open `public/style.css`. Find the end of the `#map-controls` section (look for `.map-ctrl-value` or `#map-controls` related rules). Append the following after those rules:

```css
/* ── Language Families panel ─────────────────────────────────────── */
#family-panel {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 0 4px;
  border-top: 1px solid rgba(255,255,255,0.08);
  margin-top: 4px;
}

.family-toggle {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  color: #b0b8d0;
  cursor: pointer;
  padding: 2px 0;
  user-select: none;
}

.family-toggle input[type="checkbox"] {
  accent-color: #7ecfff;
  width: 13px;
  height: 13px;
  cursor: pointer;
}

.family-toggle:hover {
  color: #e0e8ff;
}

/* ── Legend family groups ─────────────────────────────────────────── */
.legend-family-group {
  margin-bottom: 6px;
}

.legend-family-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #7ecfff;
  padding: 4px 0 3px;
  border-bottom: 1px solid rgba(126,207,255,0.2);
  margin-bottom: 4px;
}

.legend-family-close {
  background: none;
  border: none;
  color: #667799;
  font-size: 14px;
  cursor: pointer;
  padding: 0 2px;
  line-height: 1;
}

.legend-family-close:hover {
  color: #e05050;
}

.legend-branch-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
```

- [ ] **Step 2: Commit**

```bash
git add public/style.css
git commit -m "feat: add CSS for family panel checkboxes and grouped legend headers"
```

---

## Task 7: Refactor app.js — constructor, state, and helper methods

**Files:**
- Modify: `public/app.js`

This task replaces the single-dataset state (`this.data`, `this.currentDataset`) with `this.activeFamilies` and adds helper methods. Make **all** changes described in Steps 1–4 before running any tests.

- [ ] **Step 1: Replace constructor state**

In `app.js`, find the constructor. Replace these lines:

```js
    // Resolve initial dataset from URL state before anything else
    const _initDataset = new URLSearchParams(location.hash.slice(1)).get('dataset') || 'pie';
    this.currentDataset = Object.prototype.hasOwnProperty.call(DATASETS, _initDataset)
      ? _initDataset : 'pie';
    this.data = DATASETS[this.currentDataset] || data;

    // Timeline state
    const _meta = this.data.meta;
    this.currentYear  = _meta ? _meta.defaultYear : this.data.startYear;
```

With:

```js
    // Multi-family state (replaces this.data / this.currentDataset)
    this.activeFamilies = {};   // { familyKey → dataObject }

    // Timeline state — default year set when first family activates
    this.currentYear  = -3500;
```

Then find and remove these two lines in the constructor (they reference `data.branches` and `data.cultures`):

```js
    this.branchVisible = {};
    Object.keys(data.branches).forEach(k => (this.branchVisible[k] = true));
```

Replace with:

```js
    this.branchVisible = {};   // populated by activateFamily
```

Then find and remove:

```js
    // Fast lookup for cultures by id
    this.culturesById = {};
    data.cultures.forEach(c => (this.culturesById[c.id] = c));
```

Replace with:

```js
    // Fast lookup: { id → { culture, familyKey } }
    this.culturesById = {};
```

- [ ] **Step 2: Add helper methods**

Find the `switchDataset(key)` method and **replace the entire method** with the following five new methods:

```js
  // ── Multi-family API ─────────────────────────────────────────────

  activateFamily(key, { silent = false } = {}) {
    if (!Object.prototype.hasOwnProperty.call(DATASETS, key)) return;
    if (this.activeFamilies[key]) return;

    const data = DATASETS[key];
    this.activeFamilies[key] = data;

    // Merge branches
    Object.keys(data.branches).forEach(k => {
      if (!Object.prototype.hasOwnProperty.call(this.branchVisible, k)) {
        this.branchVisible[k] = true;
      }
    });

    // Merge cultures
    data.cultures.forEach(c => {
      this.culturesById[c.id] = { culture: c, familyKey: key };
    });

    // First family sets the default year
    if (Object.keys(this.activeFamilies).length === 1) {
      const meta = data.meta;
      this.currentYear = meta ? meta.defaultYear : data.startYear;
    }

    if (!silent) {
      this._updateTimelineRange();
      this._addSitesForFamily(data);
      this.buildLegend();
      this._buildFamilyPanel();
      this.prerenderMigrationLayersForFamily(data);
      this.renderYear(this.currentYear);
      this.updateCitations(this.currentYear);
      this._updateHeaderSubtitle();
      this._pushUrlState();
    }
  }

  deactivateFamily(key) {
    if (!this.activeFamilies[key]) return;

    const data = this.activeFamilies[key];

    // Remove territory layers
    data.cultures.forEach(c => {
      if (this.territoryLayers[c.id]) {
        this.territoryGroup.removeLayer(this.territoryLayers[c.id].circle);
        this.labelGroup.removeLayer(this.territoryLayers[c.id].label);
        delete this.territoryLayers[c.id];
      }
      delete this.culturesById[c.id];
    });

    // Remove migration layers
    data.migrations.forEach(mig => {
      if (this.migrationLayers[mig.id]) {
        this.migrationGroup.removeLayer(this.migrationLayers[mig.id].polyline);
        this.migrationGroup.removeLayer(this.migrationLayers[mig.id].arrow);
        delete this.migrationLayers[mig.id];
      }
    });

    // Remove branches
    Object.keys(data.branches).forEach(k => delete this.branchVisible[k]);

    delete this.activeFamilies[key];

    this._updateTimelineRange();
    this.buildLegend();
    this._buildFamilyPanel();
    this._updateHeaderSubtitle();
    this._pushUrlState();
  }

  _calcTimelineUnion() {
    let min = Infinity, max = -Infinity;
    for (const data of Object.values(this.activeFamilies)) {
      const tMin = data.meta ? data.meta.timelineMin : data.startYear;
      const tMax = data.meta ? data.meta.timelineMax : data.endYear;
      if (tMin < min) min = tMin;
      if (tMax > max) max = tMax;
    }
    if (!isFinite(min)) { min = -4000; max = 500; } // fallback
    return { min, max };
  }

  _getBranch(branchKey) {
    for (const data of Object.values(this.activeFamilies)) {
      if (Object.prototype.hasOwnProperty.call(data.branches, branchKey)) {
        return data.branches[branchKey];
      }
    }
    return null;
  }

  _getDatasetForBranch(branchKey) {
    for (const data of Object.values(this.activeFamilies)) {
      if (Object.prototype.hasOwnProperty.call(data.branches, branchKey)) {
        return data;
      }
    }
    return null;
  }
```

- [ ] **Step 3: Replace `_timelineMin` and `_timelineMax`**

Find:

```js
  _timelineMax() {
    return this.data.meta ? this.data.meta.timelineMax : this.data.endYear;
  }

  _timelineMin() {
    return this.data.meta ? this.data.meta.timelineMin : this.data.startYear;
  }
```

Replace with:

```js
  _timelineMax() {
    return this._calcTimelineUnion().max;
  }

  _timelineMin() {
    return this._calcTimelineUnion().min;
  }
```

- [ ] **Step 4: Fix `updateSlider`**

Find in `updateSlider`:

```js
    const tMin = this.data.meta ? this.data.meta.timelineMin : this.data.startYear;
    const tMax = this.data.meta ? this.data.meta.timelineMax : this.data.endYear;
```

Replace with:

```js
    const { min: tMin, max: tMax } = this._calcTimelineUnion();
```

- [ ] **Step 5: Commit**

```bash
git add public/app.js
git commit -m "refactor(app): replace single-dataset state with activeFamilies, add helper methods"
```

---

## Task 8: Refactor app.js — renderYear, updateTerritories, updateMigrations, prerenderMigrationLayers

**Files:**
- Modify: `public/app.js`

- [ ] **Step 1: Replace `prerenderMigrationLayers` with per-family version**

Find the entire `prerenderMigrationLayers()` method:

```js
  prerenderMigrationLayers() {
    this.data.migrations.forEach(mig => {
      const branch = this.data.branches[mig.branch];
      // ...
      this.migrationLayers[mig.id] = { polyline, arrow, mig };
    });
  }
```

Replace with a per-family version (keep the same internal logic, just accept `data` as parameter):

```js
  prerenderMigrationLayersForFamily(data) {
    data.migrations.forEach(mig => {
      const branch = data.branches[mig.branch];
      if (!branch) return;

      const polyline = L.polyline([[0, 0]], {
        color:     branch.color,
        weight:    3.0,
        opacity:   0,
        dashArray: '8 6',
        lineJoin:  'round',
        lineCap:   'round',
      });

      const arrowIcon = L.divIcon({
        className: '',
        html:      `<div class="mig-arrow" style="color:${branch.color};border-color:${branch.color}"></div>`,
        iconSize:  [12, 12],
        iconAnchor:[6, 6],
      });
      const arrow = L.marker([0, 0], { icon: arrowIcon, interactive: false });

      polyline.bindTooltip(
        `<strong>${escapeHTML(mig.name)}</strong><br/>${escapeHTML(mig.description)}`,
        { className: 'migration-tooltip', sticky: true, maxWidth: 280 }
      );

      this.migrationGroup.addLayer(polyline);
      this.migrationGroup.addLayer(arrow);

      this.migrationLayers[mig.id] = { polyline, arrow, mig };
    });
  }
```

- [ ] **Step 2: Replace `updateTerritories` to iterate activeFamilies**

Find the opening of `updateTerritories`:

```js
  updateTerritories(year) {
    const cultures = this.data.cultures;

    cultures.forEach(culture => {
```

The entire method iterates `this.data.cultures` and reads `this.data.branches[culture.branch]`. Wrap the existing `forEach` body inside a family loop. Replace **only** the opening two lines:

```js
  updateTerritories(year) {
    const cultures = this.data.cultures;

    cultures.forEach(culture => {
```

With:

```js
  updateTerritories(year) {
    for (const familyData of Object.values(this.activeFamilies)) {
    familyData.cultures.forEach(culture => {
```

Then find the closing `});` of `updateTerritories` — it currently ends with:

```js
    });
  }
```

Replace it with:

```js
    }); // end forEach culture
    } // end for activeFamilies
  }
```

Then inside the body, find **every** occurrence of `this.data.branches[culture.branch]` and replace with `familyData.branches[culture.branch]`.

There are two occurrences:
1. `const branch = this.data.branches[culture.branch];` — line ~629
2. The label HTML update inside the `else` block — line ~708

Change both to `familyData.branches[culture.branch]`.

- [ ] **Step 3: Replace `updateMigrations` to iterate activeFamilies**

Find:

```js
  updateMigrations(year) {
    this.data.migrations.forEach(mig => {
```

Replace the opening:

```js
  updateMigrations(year) {
    for (const _familyData of Object.values(this.activeFamilies)) {
    _familyData.migrations.forEach(mig => {
```

Find the closing of `updateMigrations`:

```js
    });
  }
```

Replace with:

```js
    }); // end forEach mig
    } // end for activeFamilies
  }
```

- [ ] **Step 4: Fix `arrowHtml` to use `_getBranch`**

Find:

```js
  arrowHtml(branch, bearing) {
    const color = this.data.branches[branch].color;
```

Replace with:

```js
  arrowHtml(branch, bearing) {
    const b = this._getBranch(branch);
    const color = b ? b.color : '#888888';
```

- [ ] **Step 5: Commit**

```bash
git add public/app.js
git commit -m "refactor(app): updateTerritories, updateMigrations, prerenderMigrationLayers iterate activeFamilies"
```

---

## Task 9: Refactor app.js — buildLegend, toggleBranch, _cultureMatchesSearch, updateEventTicker, updateCitations, initSearch

**Files:**
- Modify: `public/app.js`

- [ ] **Step 1: Replace `buildLegend`**

Find the entire `buildLegend()` method (from `buildLegend() {` through its closing `}`). Replace it entirely with:

```js
  buildLegend() {
    const container = document.getElementById('legend-items');
    if (!container) return;
    container.innerHTML = '';

    for (const [familyKey, data] of Object.entries(this.activeFamilies)) {
      const groupEl = document.createElement('div');
      groupEl.className = 'legend-family-group';

      // Family header row
      const headerRow = document.createElement('div');
      headerRow.className = 'legend-family-header';

      const headerLabel = document.createElement('span');
      headerLabel.textContent = data.familyLabel || familyKey;

      const closeBtn = document.createElement('button');
      closeBtn.className = 'legend-family-close';
      closeBtn.setAttribute('aria-label', `Deactivate ${data.familyLabel || familyKey} family`);
      closeBtn.textContent = '×';
      closeBtn.addEventListener('click', () => {
        this.deactivateFamily(familyKey);
        const cb = document.getElementById(`family-cb-${familyKey}`);
        if (cb) cb.checked = false;
      });

      headerRow.appendChild(headerLabel);
      headerRow.appendChild(closeBtn);
      groupEl.appendChild(headerRow);

      // Branch list
      const branchList = document.createElement('div');
      branchList.className = 'legend-branch-list';

      Object.entries(data.branches).forEach(([key, branch]) => {
        const item = document.createElement('button');
        item.className       = 'legend-item';
        item.dataset.branch  = key;
        item.setAttribute('role', 'listitem');
        const isVisible = this.branchVisible[key] !== false;
        item.setAttribute('aria-pressed', String(isVisible));
        item.setAttribute('aria-label', `${branch.name} — click to ${isVisible ? 'hide' : 'show'}`);
        if (!isVisible) item.classList.add('muted');

        const swatch = document.createElement('span');
        swatch.className          = 'legend-swatch';
        swatch.style.background   = branch.color;
        swatch.setAttribute('aria-hidden', 'true');

        const label = document.createElement('span');
        label.textContent = branch.name;

        item.appendChild(swatch);
        item.appendChild(label);
        branchList.appendChild(item);

        item.addEventListener('click', () => this.toggleBranch(key, item));
      });

      groupEl.appendChild(branchList);
      container.appendChild(groupEl);
    }
  }
```

- [ ] **Step 2: Fix `toggleBranch` to use `_getBranch`**

Find:

```js
    const branchName = this.data.branches[key].name;
```

Replace with:

```js
    const b = this._getBranch(key);
    const branchName = b ? b.name : key;
```

- [ ] **Step 3: Fix `_cultureMatchesSearch` to use `_getBranch`**

Find:

```js
    const branch = this.data.branches[culture.branch];
```

Replace with:

```js
    const branch = this._getBranch(culture.branch);
```

- [ ] **Step 4: Fix `_applySearchHighlight` for new culturesById shape**

Find in `_applySearchHighlight`:

```js
      const culture = this.culturesById[id];
      if (!culture) return;
      if (!this.searchFilter || this._cultureMatchesSearch(culture)) {
```

Replace with:

```js
      const entry = this.culturesById[id];
      if (!entry) return;
      const culture = entry.culture;
      if (!this.searchFilter || this._cultureMatchesSearch(culture)) {
```

- [ ] **Step 5: Fix `initSearch` to iterate all active families**

Find in `initSearch`:

```js
    this.data.cultures.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.name;
      datalist.appendChild(opt);
    });
```

Replace with:

```js
    for (const data of Object.values(this.activeFamilies)) {
      data.cultures.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.name;
        datalist.appendChild(opt);
      });
    }
```

- [ ] **Step 6: Fix `updateEventTicker` to iterate all active families**

Find:

```js
  updateEventTicker(year) {
    // Show the most recent event at or before current year
    const events = this.data.events;
    let best = null;
    for (const ev of events) {
```

Replace with:

```js
  updateEventTicker(year) {
    // Show the most recent event at or before current year, across all active families
    let best = null;
    for (const data of Object.values(this.activeFamilies)) {
      if (!data.events) continue;
    for (const ev of data.events) {
```

Then find the closing of the inner loop. The original was:

```js
    }

    const ticker = document.getElementById('event-ticker');
```

Replace with:

```js
    } // end for ev
    } // end for activeFamilies

    const ticker = document.getElementById('event-ticker');
```

- [ ] **Step 7: Fix `updateCitations` to iterate all active families**

Find:

```js
  updateCitations(year) {
    const panel = document.getElementById('citation-panel');
    if (!panel || panel.classList.contains('hidden')) return;
    if (!this.data.sources) return;

    const relevant = this.data.sources.filter(
      s => year >= s.startYear && year <= s.endYear
    );
```

Replace with:

```js
  updateCitations(year) {
    const panel = document.getElementById('citation-panel');
    if (!panel || panel.classList.contains('hidden')) return;

    const relevant = [];
    for (const data of Object.values(this.activeFamilies)) {
      if (!data.sources) continue;
      data.sources.filter(s => year >= s.startYear && year <= s.endYear)
        .forEach(s => relevant.push(s));
    }
```

- [ ] **Step 8: Commit**

```bash
git add public/app.js
git commit -m "refactor(app): buildLegend grouped, toggleBranch, search, ticker, citations iterate activeFamilies"
```

---

## Task 10: Refactor app.js — showInfo + renderAdmixture (per-dataset admixture)

**Files:**
- Modify: `public/app.js`

- [ ] **Step 1: Fix `showInfo` to resolve owning dataset**

Find the opening of `showInfo`:

```js
  showInfo(culture) {
    const branch   = this.data.branches[culture.branch];
    const genetics = this.data.genetics[culture.branch] || '';
```

Replace with:

```js
  showInfo(culture) {
    const ownerData = this._getDatasetForBranch(culture.branch);
    const branch    = ownerData ? ownerData.branches[culture.branch] : null;
    const genetics  = ownerData && ownerData.genetics ? (ownerData.genetics[culture.branch] || '') : '';
    if (!branch) return;
```

- [ ] **Step 2: Replace static `ADMIXTURE_COMPONENTS` with per-dataset lookup in `renderAdmixture`**

Find the entire static getter:

```js
  static get ADMIXTURE_COMPONENTS() {
    return [
      { key: 'EHG',   label: 'EHG',    color: '#D4843D' },
      { key: 'CHG',   label: 'CHG',    color: '#9B59B6' },
      { key: 'WHG',   label: 'WHG',    color: '#2E86C1' },
      { key: 'ANF',   label: 'ANF',    color: '#1E8449' },
      { key: 'IranN', label: 'Iran N', color: '#C0392B' },
      { key: 'Other', label: 'Other',  color: '#5D6D7E' },
    ];
  }
```

**Delete it** entirely (it is replaced by per-dataset lookup below).

Find the `renderAdmixture(culture)` method. Find this line:

```js
    PIEMigrationMap.ADMIXTURE_COMPONENTS.forEach(({ key, label: lbl, color }) => {
```

Replace with:

```js
    const ownerData = this._getDatasetForBranch(culture.branch);
    const components = ownerData && ownerData.admixtureComponents
      ? Object.entries(ownerData.admixtureComponents).map(([key, { label: lbl, color }]) => ({ key, lbl, color }))
      : [];
    components.forEach(({ key, lbl, color }) => {
```

- [ ] **Step 3: Commit**

```bash
git add public/app.js
git commit -m "refactor(app): showInfo and renderAdmixture use per-dataset ownership and admixtureComponents"
```

---

## Task 11: Refactor app.js — initControls (family panel), initSites, _buildFamilyPanel, _updateHeaderSubtitle, _updateTimelineRange

**Files:**
- Modify: `public/app.js`

- [ ] **Step 1: Remove dataset picker from `initControls`**

Find in `initControls`:

```js
    // Dataset picker
    const datasetSelect = document.getElementById('dataset-select');
    if (datasetSelect) {
      datasetSelect.value = this.currentDataset;
      datasetSelect.addEventListener('change', e => this.switchDataset(e.target.value));
    }
```

**Delete** these 5 lines entirely.

- [ ] **Step 2: Add `_buildFamilyPanel` method**

Add this method after `buildLegend`:

```js
  _buildFamilyPanel() {
    const panel = document.getElementById('family-panel');
    if (!panel) return;

    // Remove existing checkboxes (preserve the label span)
    panel.querySelectorAll('.family-toggle').forEach(el => el.remove());

    const familyOrder = ['pie', 'dravidian', 'sinotibetan'];
    const familyFallbackLabels = {
      pie:        'Proto-Indo-European',
      dravidian:  'Dravidian',
      sinotibetan:'Sino-Tibetan',
    };

    familyOrder.forEach(key => {
      if (!Object.prototype.hasOwnProperty.call(DATASETS, key)) return;

      const data = DATASETS[key];
      const label = document.createElement('label');
      label.className = 'family-toggle';

      const cb = document.createElement('input');
      cb.type    = 'checkbox';
      cb.id      = `family-cb-${key}`;
      cb.checked = !!this.activeFamilies[key];
      cb.addEventListener('change', () => {
        if (cb.checked) this.activateFamily(key);
        else            this.deactivateFamily(key);
      });

      const name = (data && data.familyLabel) || familyFallbackLabels[key] || key;
      label.appendChild(cb);
      label.appendChild(document.createTextNode(' ' + name));
      panel.appendChild(label);
    });
  }
```

- [ ] **Step 3: Add `_updateHeaderSubtitle` method**

Add after `_buildFamilyPanel`:

```js
  _updateHeaderSubtitle() {
    const sub = document.querySelector('#header p.subtitle');
    if (!sub) return;
    const families = Object.values(this.activeFamilies);
    if (families.length === 1) {
      sub.textContent = families[0].meta ? families[0].meta.subtitle : '';
    } else if (families.length > 1) {
      const names = families
        .map(d => d.familyLabel || (d.meta && d.meta.title) || '?')
        .join(' · ');
      sub.textContent = 'Active: ' + names;
    } else {
      sub.textContent = '';
    }
  }
```

- [ ] **Step 4: Add `_updateTimelineRange` method**

Add after `_updateHeaderSubtitle`:

```js
  _updateTimelineRange() {
    const { min, max } = this._calcTimelineUnion();
    const slider = document.getElementById('time-slider');
    if (slider) {
      slider.min = min;
      slider.max = max;
    }
    const edges = document.querySelectorAll('.tl-edge');
    if (edges[0]) {
      edges[0].textContent = min < 0 ? `${Math.abs(min).toLocaleString()} BCE` : `${min} CE`;
    }
    if (edges[1]) {
      edges[1].textContent = max <= 0 ? `${Math.abs(max).toLocaleString()} BCE` : `${max} CE`;
    }
    if (this.currentYear < min) this.currentYear = min;
    if (this.currentYear > max) this.currentYear = max;
  }
```

- [ ] **Step 5: Refactor `initSites` to support per-family addition**

Find the current `initSites()` method. Replace the first few lines that iterate `this.data.sites`:

```js
  initSites() {
    if (!this.data.sites) return;

    this.data.sites.forEach(site => {
```

Replace with a wrapper that calls a private helper, plus the helper:

Find the entire `initSites()` method and replace it with:

```js
  initSites() {
    // Add sites for all currently active families
    for (const data of Object.values(this.activeFamilies)) {
      this._addSitesForFamily(data);
    }

    if (!this.sitesVisible) this.siteGroup.remove();

    const btn = document.getElementById('sites-toggle');
    if (!btn) return;

    if (!this.sitesVisible) {
      btn.textContent = 'Hidden';
      btn.setAttribute('aria-pressed', 'false');
      btn.setAttribute('aria-label', 'Archaeological sites — click to show');
      btn.classList.add('muted');
    }

    btn.addEventListener('click', () => {
      this.sitesVisible = !this.sitesVisible;
      if (this.sitesVisible) {
        this.siteGroup.addTo(this.map);
        btn.textContent = 'Visible';
        btn.setAttribute('aria-pressed', 'true');
        btn.setAttribute('aria-label', 'Archaeological sites — click to hide');
        btn.classList.remove('muted');
      } else {
        this.siteGroup.remove();
        btn.textContent = 'Hidden';
        btn.setAttribute('aria-pressed', 'false');
        btn.setAttribute('aria-label', 'Archaeological sites — click to show');
        btn.classList.add('muted');
      }
      this._pushUrlState();
    });
  }

  _addSitesForFamily(data) {
    if (!data.sites) return;
    data.sites.forEach(site => {
      const icon = L.divIcon({
        className: '',
        html: '<div class="site-marker-icon"></div>',
        iconSize:   [10, 10],
        iconAnchor: [5, 5],
      });
      const marker = L.marker([site.lat, site.lon], { icon, zIndexOffset: 200 });
      marker.bindTooltip(
        `<strong>${escapeHTML(site.name)}</strong><br/><em>${escapeHTML(site.date)}</em><br/>${escapeHTML(site.desc)}`,
        { className: 'migration-tooltip', sticky: true, maxWidth: 260 }
      );
      this.siteGroup.addLayer(marker);
    });
  }
```

- [ ] **Step 6: Commit**

```bash
git add public/app.js
git commit -m "refactor(app): initControls remove dataset-select, add _buildFamilyPanel, _updateHeaderSubtitle, _updateTimelineRange, _addSitesForFamily"
```

---

## Task 12: Refactor app.js — URL state (families= param) and init()

**Files:**
- Modify: `public/app.js`

- [ ] **Step 1: Replace `_parseUrlState`**

Find the entire `_parseUrlState()` method and replace it with:

```js
  _parseUrlState() {
    const hash = location.hash.slice(1);
    if (!hash) return;
    const params = new URLSearchParams(hash);

    // Legacy civilizations standalone mode
    const legacyDataset = params.get('dataset');
    if (legacyDataset === 'civilizations') {
      this._initFamilyKeys = ['civilizations'];
      return;
    }

    // Families param: "families=pie,dravidian"
    const familiesParam = params.get('families');
    if (familiesParam) {
      this._initFamilyKeys = familiesParam.split(',').filter(k =>
        Object.prototype.hasOwnProperty.call(DATASETS, k)
      );
    }

    // Year (clamped after families are activated)
    const rawYear = parseInt(params.get('year'), 10);
    if (!isNaN(rawYear)) this._initYear = rawYear;

    // Tile style
    const style = params.get('style');
    if (style && Object.prototype.hasOwnProperty.call(this.TILE_STYLES, style)) {
      this._initStyle = style;
    }

    // Hidden branches
    const hidden = params.get('hidden');
    if (hidden) this._initHidden = hidden.split(',').filter(Boolean);

    // Sites visibility
    if (params.get('sites') === '0') this.sitesVisible = false;
  }
```

- [ ] **Step 2: Replace `_pushUrlState`**

Find the entire `_pushUrlState()` method and replace it with:

```js
  _pushUrlState() {
    const params = new URLSearchParams();
    params.set('year', Math.round(this.currentYear));

    const activeKeys = Object.keys(this.activeFamilies);
    if (activeKeys.length === 1 && activeKeys[0] === 'pie') {
      // default — omit families param
    } else if (activeKeys.length > 0) {
      params.set('families', activeKeys.join(','));
    }

    const hidden = Object.entries(this.branchVisible)
      .filter(([, v]) => !v)
      .map(([k]) => k)
      .join(',');
    if (hidden) params.set('hidden', hidden);
    if (!this.sitesVisible) params.set('sites', '0');

    history.replaceState(null, '', '#' + params.toString());
  }
```

- [ ] **Step 3: Replace `init()`**

Find the entire `init()` method:

```js
  init() {
    this._parseUrlState();       // must be before initMap/buildLegend
    this.initMap();
    this.buildLegend();
    this.initControls();
    this.initSites();
    this.initSearch();
    this.initCitations();
    this.prerenderMigrationLayers();
    this.renderYear(this.currentYear);
    this.updateCitations(this.currentYear);
  }
```

Replace with:

```js
  init() {
    this._parseUrlState();
    this.initMap();
    this.initControls();
    this.initCitations();

    // Activate families from URL state (or default to PIE)
    const familyKeys = (this._initFamilyKeys && this._initFamilyKeys.length > 0)
      ? this._initFamilyKeys : ['pie'];
    familyKeys.forEach(key => this.activateFamily(key, { silent: true }));

    // Apply hidden branches
    (this._initHidden || []).forEach(key => {
      if (Object.prototype.hasOwnProperty.call(this.branchVisible, key)) {
        this.branchVisible[key] = false;
      }
    });

    // Apply year from URL (clamp to union range)
    if (this._initYear !== undefined) {
      const { min, max } = this._calcTimelineUnion();
      if (this._initYear >= min && this._initYear <= max) {
        this.currentYear = this._initYear;
      }
    }

    this._updateTimelineRange();
    this.initSites();
    this.initSearch();
    this.buildLegend();
    this._buildFamilyPanel();
    this._updateHeaderSubtitle();
    for (const [key, data] of Object.entries(this.activeFamilies)) {
      this.prerenderMigrationLayersForFamily(data);
    }
    this.renderYear(this.currentYear);
    this.updateCitations(this.currentYear);
  }
```

- [ ] **Step 4: Commit**

```bash
git add public/app.js
git commit -m "refactor(app): replace _parseUrlState/_pushUrlState for families= param, rewrite init()"
```

---

## Task 13: Update app.js bootstrap/startup code

**Files:**
- Modify: `public/app.js` — the `DOMContentLoaded` bootstrap block at the bottom

- [ ] **Step 1: Update DATASETS registration and constructor call**

Find this block near the bottom of the file (after the class definition):

```js
  // ── Dataset registry ────────────────────────────────────────────���
  DATASETS.pie = PIE_DATA;
  if (typeof CIVILIZATIONS_DATA !== 'undefined') {
    DATASETS.civilizations = CIVILIZATIONS_DATA;
  }

  // ── Map ──────────────────────────────────────────────────────────
  const app = new PIEMigrationMap(PIE_DATA);
```

Replace with:

```js
  // ── Dataset registry ─────────────────────────────────────────────
  DATASETS.pie = PIE_DATA;
  if (typeof CIVILIZATIONS_DATA !== 'undefined') DATASETS.civilizations = CIVILIZATIONS_DATA;
  if (typeof DRAVIDIAN_DATA    !== 'undefined') DATASETS.dravidian    = DRAVIDIAN_DATA;
  if (typeof SINOTIBETAN_DATA  !== 'undefined') DATASETS.sinotibetan  = SINOTIBETAN_DATA;

  // ── Map ──────────────────────────────────────────────────────────
  const app = new PIEMigrationMap();
```

Note: The constructor no longer takes a `data` argument. Update the constructor signature from `constructor(data)` to `constructor()` and remove any remaining references to the `data` parameter.

- [ ] **Step 2: Remove constructor `data` parameter**

Find:

```js
  constructor(data) {
```

Replace with:

```js
  constructor() {
```

- [ ] **Step 3: Run all tests**

```bash
node --test test/language-families.test.js 2>&1
node --test test/splash-page.test.js 2>&1
```

Expected: All language-families tests PASS. Splash tests: the test for `ADMIXTURE_COMPONENTS` static getter will need to be verified — the splash-page test does not test that, so it should be unaffected.

Expected output for language-families: 7 tests, 7 pass.
Expected output for splash-page: existing tests all pass.

- [ ] **Step 4: Commit**

```bash
git add public/app.js
git commit -m "refactor(app): update DATASETS bootstrap, remove constructor data arg, complete activeFamilies migration"
```

---

## Task 14: Final verification and integration commit

- [ ] **Step 1: Run full test suite**

```bash
node --test test/language-families.test.js 2>&1
node --test test/splash-page.test.js 2>&1
```

Expected: All tests pass with 0 failures.

- [ ] **Step 2: Start the server and do a manual smoke check**

```bash
npm start &
```

Open `http://localhost:3000` in a browser. Verify:
- [ ] Map loads with PIE data as default
- [ ] Language Families panel shows 3 checkboxes: PIE (checked), Dravidian (unchecked), Sino-Tibetan (unchecked)
- [ ] Checking Dravidian adds Dravidian cultures to the map
- [ ] Checking Sino-Tibetan adds Sino-Tibetan cultures to the map
- [ ] Timeline range expands when Sino-Tibetan is activated (−7000 BCE edge appears)
- [ ] Legend shows grouped headers with × buttons per family
- [ ] Clicking a territory circle opens the info panel with correct data
- [ ] URL updates with `families=pie,dravidian` when multiple families are active
- [ ] Unchecking PIE removes PIE cultures

- [ ] **Step 3: Stop the server and final commit**

```bash
kill %1
git add -A
git status  # verify only expected files changed
git commit -m "feat: complete language-families simultaneous multi-family display

- Add DRAVIDIAN_DATA (dravidian-data.js) with 5 cultures, 2 migrations, 6 events
- Add SINOTIBETAN_DATA (sinotibetan-data.js) with 7 cultures, 3 migrations, 8 events
- Refactor app.js: activeFamilies engine replaces single-dataset model
- New: activateFamily, deactivateFamily, _calcTimelineUnion, _getBranch, _buildFamilyPanel
- Grouped legend with per-family collapse/remove controls
- URL state uses families= param; legacy dataset=civilizations preserved
- Per-dataset admixtureComponents replaces hardcoded PIE ADMIXTURE_COMPONENTS
- All 7 language-families tests pass; splash-page tests unaffected

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```
