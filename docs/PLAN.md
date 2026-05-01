# Feature Plan: Visualization Picker — PIE Migrations + World Civilizations

## Context

See `docs/PRD.md` for product requirements. This plan covers implementation of the
multi-dataset picker that allows users to switch between the existing PIE Migrations view
and a new World Civilizations view (10,000 BCE – 1500 CE).

The visualization engine requires **zero changes** — the PIE_DATA schema is reused identically
for the new dataset. New work is limited to: a dataset registry, a picker UI element,
a `switchDataset()` method, URL state extension, and the new data file.

---

## Files Changed

| File | Action |
|---|---|
| `public/civilizations-data.js` | **Create** — CIVILIZATIONS_DATA global (Worker/Codex) |
| `public/app.js` | **Modify** — DATASETS registry, switchDataset(), URL state, title |
| `public/index.html` | **Modify** — dataset-select picker + script tag |
| `docs/PRD.md` | **Created** — product requirements |
| `docs/PLAN.md` | **This file** |

---

## Implementation

### 1. `public/civilizations-data.js` (Worker)

Global constant `CIVILIZATIONS_DATA` following the exact `PIE_DATA` schema.

**Branches (region-based):**
```js
{
  early_europe:    { name: 'Early Europe',           color: '#5DADE2', textColor: '#000' },
  near_east:       { name: 'Near East / Levant',     color: '#F39C12', textColor: '#000' },
  egypt:           { name: 'Ancient Egypt & Nubia',  color: '#D4AC0D', textColor: '#000' },
  africa:          { name: 'Sub-Saharan Africa',     color: '#C0392B', textColor: '#fff' },
  south_asia:      { name: 'South Asia',             color: '#8E44AD', textColor: '#fff' },
  east_asia:       { name: 'East Asia',              color: '#E74C3C', textColor: '#fff' },
  oceania:         { name: 'Oceania / Pacific',      color: '#1ABC9C', textColor: '#000' },
  americas_meso:   { name: 'Mesoamerica',            color: '#27AE60', textColor: '#fff' },
  americas_andes:  { name: 'Andes',                  color: '#2ECC71', textColor: '#000' },
  americas_north:  { name: 'North America',          color: '#82E0AA', textColor: '#000' },
}
```

**Dataset metadata** (new `meta` field on both datasets):
```js
meta: {
  timelineMin: -10000,
  timelineMax:  1500,
  defaultYear: -3000,
  title:    'World Civilizations',
  subtitle: 'Global human civilization development, 10,000 BCE – 1500 CE'
}
```

**Cultures (30+):** Natufian, Çatalhöyük, Sumer/Uruk, Akkad, Babylon, Assyria, Phoenicia,
Pre-Dynastic Egypt, Old Kingdom Egypt, New Kingdom Egypt, Nubia/Kush, Nok Culture,
Mali Empire, Great Zimbabwe, Indus Valley/Harappan, Vedic Culture, Maurya Empire,
Gupta Empire, Yangshao, Erlitou, Shang Dynasty, Zhou Dynasty, Qin/Han Empire,
Jomon Culture, Yayoi Culture, Lapita Culture, Polynesian settlement, Paleoindian Dispersal,
Norte Chico/Caral, Olmec, Teotihuacan, Classic Maya, Tiwanaku, Inca Empire,
Cahokia/Mississippian.

**Migrations (5):**
- Bantu Expansion (-3000 to 1000): W. Africa → E/S Africa
- Austronesian Expansion (-3000 to 1300): Taiwan → Polynesia
- Paleoindian Dispersal (-15000 to -8000): Beringia → Americas
- Neolithic Spread into Europe (-7000 to -4000): Anatolia → Balkans → W. Europe
- Silk Road Corridor (-500 to 500): China → Central Asia → Mediterranean

**Events (~30):** First cities (Uruk -3500), Pyramid construction (-2560), IVC peak (-2500),
Shang oracle bones (-1300), Iron Age onset (-1200), Olmec emergence (-1500),
Silk Road opening (-130), Fall of Rome (476 CE), etc.

---

### 2. `public/app.js` modifications

**a. Dataset registry** (before class definition):
```js
const DATASETS = {
  pie:           PIE_DATA,
  civilizations: CIVILIZATIONS_DATA,
};
```

**b. Constructor** — replace `PIE_DATA` direct references with `this.data`:
```js
constructor() {
  const parsed = this._parseUrlState();
  this.currentDataset = parsed.dataset || 'pie';
  this.data = DATASETS[this.currentDataset];
  // ... rest of constructor unchanged
}
```

**c. `switchDataset(key)` method:**
```js
switchDataset(key) {
  if (!DATASETS[key] || key === this.currentDataset) return;
  this.currentDataset = key;
  this.data = DATASETS[key];
  const { timelineMin, timelineMax, defaultYear } = this.data.meta;
  this.timeSlider.min = timelineMin;
  this.timeSlider.max = timelineMax;
  this.currentYear = defaultYear;
  this.territoriesLayer.clearLayers();
  this.migrationsLayer.clearLayers();
  this.sitesLayer.clearLayers();
  this.buildLegend();
  this.initSites();
  this.prerenderMigrationLayers();
  this.renderYear(this.currentYear);
  this._pushUrlState();
}
```

**d. URL state** — extend `_parseUrlState()` and `_pushUrlState()`:
- Parse `dataset` param from hash: `params.get('dataset') || 'pie'`
- Push `dataset=${this.currentDataset}` into the hash string

**e. `initControls()`** — wire picker:
```js
document.getElementById('dataset-select')
  .addEventListener('change', e => this.switchDataset(e.target.value));
```

**f. Add `meta` to PIE_DATA** in `data.js`:
```js
meta: {
  timelineMin: -4000,
  timelineMax:  500,
  defaultYear: -3500,
  title:    'PIE Migrations',
  subtitle: 'Proto-Indo-European language dispersal & genetic migrations, 4000 BCE – 500 CE'
}
```

---

### 3. `public/index.html` modifications

Add after `<script src="data.js">`:
```html
<script src="civilizations-data.js"></script>
```

Add to `#map-controls`, before the map-style select:
```html
<label for="dataset-select">Visualization</label>
<select id="dataset-select" aria-label="Choose visualization dataset">
  <option value="pie">PIE Migrations (4000 BCE – 500 CE)</option>
  <option value="civilizations">World Civilizations (10,000 BCE – 1500 CE)</option>
</select>
```

---

## Verification

1. Default load → PIE dataset at -3500 BCE
2. Switch picker → World Civilizations; timeline updates to -10000/+1500 range; legend rebuilds
3. Navigate to -2600 BCE → Harappan and Old Kingdom Egypt visible simultaneously on map
4. Navigate to 500 CE → Gupta, Maya Classic, Han visible
5. Paste `#dataset=civilizations&year=-2500` URL → loads correct dataset and year
6. Switch back to PIE → PIE circles return, civilization circles gone
7. `npm start` → both JS files serve correctly
