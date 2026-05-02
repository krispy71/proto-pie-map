# Language Families — Simultaneous Multi-Family Display
**Date:** 2026-05-01
**Status:** Approved
**Feature branch:** `feature/language-families`

---

## Overview

Add Dravidian and Sino-Tibetan language family datasets alongside PIE, with the ability to display all active families simultaneously on the map. A new "Language Families" panel with checkboxes lets users activate or deactivate entire families. The existing branch legend groups branches under collapsible family headers.

---

## Architecture

`PIEMigrationMap` replaces the single-active-dataset model with an `activeFamilies` map (`{ familyKey → dataObject }`). On each `renderYear()` call the engine iterates all active families and renders their cultures, migrations, and events together.

PIE is default-active on startup — existing behavior is unchanged for users who never open the panel.

The `dataset-select` dropdown is removed. The `civilizations` dataset remains accessible as a standalone mode via URL hash `#dataset=civilizations` but is not mixed with language family simultaneous display.

**New files:**
```
public/dravidian-data.js       → DRAVIDIAN_DATA, registered as DATASETS.dravidian
public/sinotibetan-data.js     → SINOTIBETAN_DATA, registered as DATASETS.sinotibetan
```

**Removed:** `switchDataset()` method, `dataset-select` dropdown element.

---

## Data Schema

Both new files follow the existing `data.js` schema exactly, with two additions:

### 1. Family metadata (top-level)
```js
familyKey:   'dravidian',
familyLabel: 'Dravidian',
```

### 2. Per-dataset admixture components
```js
admixtureComponents: {
  AASI:   { label: 'Ancient Ancestral South Indian', color: '#E91E63' },
  IVC:    { label: 'Indus Valley Civilization',      color: '#FF9800' },
  Steppe: { label: 'Steppe',                         color: '#9C27B0' },
  Other:  { label: 'Other',                          color: '#9E9E9E' },
}
```
The engine reads `admixtureComponents` from the culture's owning dataset instead of the former static `PIEMigrationMap.ADMIXTURE_COMPONENTS`. Existing PIE data gets `admixtureComponents` added to `data.js`. Falls back gracefully when `admixture` field is absent on a culture.

### Branch key namespacing
Branch keys are prefixed to guarantee uniqueness across all simultaneously active families:

**Dravidian:**
```js
branches: {
  dravidian_proto:   { name: 'Proto-Dravidian',   color: '#E91E63', textColor: '#fff' },
  dravidian_south:   { name: 'South Dravidian',   color: '#FF5722', textColor: '#fff' },
  dravidian_central: { name: 'Central Dravidian', color: '#FF9800', textColor: '#fff' },
  dravidian_north:   { name: 'North Dravidian',   color: '#FFC107', textColor: '#000' },
}
```

**Sino-Tibetan:**
```js
branches: {
  sinotibetan_proto:   { name: 'Proto-Sino-Tibetan', color: '#00BCD4', textColor: '#000' },
  sinotibetan_sinitic: { name: 'Sinitic (Chinese)',   color: '#009688', textColor: '#fff' },
  sinotibetan_tibeto:  { name: 'Tibeto-Burman',       color: '#4CAF50', textColor: '#fff' },
}
```

**Time ranges:**
- Dravidian: −4000 to 1500 CE
- Sino-Tibetan: −7000 to 1500 CE
- PIE: −4000 to 500 CE (unchanged)

---

## Engine Changes (app.js)

### State

```js
// Replaces: this.data, this.currentDataset
this.activeFamilies = {};   // { familyKey → dataObject }
this.branchVisible  = {};   // branches from ALL active families merged
```

### New methods

**`activateFamily(key)`**
1. Add `DATASETS[key]` to `activeFamilies`
2. Merge dataset's branches into `branchVisible` (all `true`)
3. Rebuild culturesById for new family
4. Recalculate timeline union → update slider min/max
5. Rebuild legend (grouped)
6. Prerender migration layers for new family
7. Call `renderYear(this.currentYear)`

**`deactivateFamily(key)`**
1. Remove family's branches from `branchVisible`
2. Remove family's Leaflet layers from map groups
3. Remove from `activeFamilies`
4. Recalculate timeline union → update slider min/max
5. Rebuild legend
6. Call `renderYear(this.currentYear)`

**`_calcTimelineUnion()`**
```js
_calcTimelineUnion() {
  let min = Infinity, max = -Infinity;
  for (const data of Object.values(this.activeFamilies)) {
    min = Math.min(min, data.meta.timelineMin);
    max = Math.max(max, data.meta.timelineMax);
  }
  return { min, max };
}
```

### Modified methods

**`renderYear(year)`** — `updateTerritories` and `updateMigrations` loop over `Object.values(this.activeFamilies)` instead of reading `this.data`.

**`buildLegend()`** — groups branches under a `<div class="legend-family-group">` labeled header per active family. Deactivating a family via its legend `[×]` button syncs the Language Families panel checkbox.

**`showInfo(culture)`** — looks up the culture's owning dataset from `activeFamilies` to resolve `genetics` and `admixtureComponents`. `culturesById` is extended to `{ id → { culture, familyKey } }` so ownership is always unambiguous. Culture `id` values must be globally unique across all data files (enforced by convention: prefix with family key, e.g. `dravidian_tamil_sangam`).

**`updateEventTicker(year)`** — iterates events across all active families.

**`updateCitations(year)`** — iterates sources across all active families.

### URL state

`dataset=` param replaced by `families=pie,dravidian` (comma-separated active family keys). Standalone civilizations mode preserved: `#dataset=civilizations` bypasses family panel and loads single-dataset mode.

### Startup

```js
DATASETS.pie = PIE_DATA;
DATASETS.dravidian = (typeof DRAVIDIAN_DATA !== 'undefined') ? DRAVIDIAN_DATA : null;
DATASETS.sinotibetan = (typeof SINOTIBETAN_DATA !== 'undefined') ? SINOTIBETAN_DATA : null;

const app = new PIEMigrationMap();   // no argument; reads from DATASETS + URL state
app.activateFamily('pie');           // default active
```

---

## UI

### Language Families panel (index.html)

New `<div id="family-panel">` added to the map controls bar. Checkboxes rendered dynamically from `DATASETS` keys at runtime — no hardcoded family names in `app.js`.

```html
<div id="family-panel" class="map-ctrl-group">
  <span class="map-ctrl-label">Language Families</span>
  <!-- populated dynamically by app.js -->
</div>
```

Each checkbox fires `activateFamily(key)` on check, `deactivateFamily(key)` on uncheck. PIE checkbox is pre-checked. Checkbox state stays in sync with legend `[×]` buttons.

### Legend grouping

```
▾ Proto-Indo-European   [×]
  ● PIE Homeland  ● Germanic  ● Celtic ...
▾ Dravidian             [×]
  ● Proto-Dravidian  ● South Dravidian ...
▾ Sino-Tibetan          [×]
  ● Proto-Sino-Tibetan  ● Sinitic ...
```

### Header subtitle

When multiple families are active: `"Active: PIE · Dravidian"`. Single family active: dataset's own subtitle string.

### dataset-select dropdown

Removed from the controls bar. The `civilizations` standalone mode is preserved via URL hash only.

---

## Out of Scope

- Admixture data for Dravidian and Sino-Tibetan cultures (can be added incrementally to data files; engine handles absence gracefully)
- Full archaeological source citations for new families (empty `sources: []` initially)
- Site markers for new families (empty `sites: []` initially)
- Additional language families beyond PIE, Dravidian, Sino-Tibetan

---

## Testing

The existing `test/splash-page.test.js` is unaffected. New test coverage needed:
- `activateFamily` / `deactivateFamily` correctly merge/prune `branchVisible`
- `_calcTimelineUnion` returns correct min/max across mixed active families
- `renderYear` with 2+ active families renders cultures from both without errors
- Deactivating all families leaves map empty without throwing
- URL state round-trips: `families=pie,dravidian` → correct active state on load
