# Roadmap — Research Expansion, Rebranding & Feature Development

## 1. Research Expansion

### 1.1 Current scholarly gaps

The app's data layer was built primarily from Spinney (2024) and Anthony (2007). The following landmark papers have since reshuffled or refined the consensus and justify additions or corrections to `data.js`:

| Paper | Year | Key findings relevant to the app |
|---|---|---|
| Haak et al., *Nature* 522 | 2015 | Quantified Yamnaya steppe ancestry in European Bronze Age; established ~75% replacement in some northern European populations |
| Mathieson et al., *Nature* 528 | 2015 | Selection scans on 230 ancient Eurasians; lactase persistence, pigmentation alleles tied to Yamnaya expansion |
| Olalde et al., *Science* 360 | 2018 | Bell Beaker phenomenon: massive migration from steppe into western Europe ~2500 BCE — near-complete replacement of Iberian Chalcolithic population |
| Narasimhan et al., *Science* 365 | 2019 | Steppe ancestry arrives in South Asia via BMAC corridor ~2000–1500 BCE; refines Indo-Aryan migration timing |
| Damgaard et al., *Science* 360 | 2018 | Horse and horsemanship in Eurasian steppe; Scythian and Inner Asian branch expansions |
| Librado et al., *Nature* 598 | 2021 | Domesticated horse origin pinned to Pontic-Caspian steppe ~2200 BCE (Don-Volga region); spreads globally within 500 years — directly supports the horse-chariot vector of PIE dispersal |
| Lazaridis et al., *Science* 375 | 2022 | Iran Neolithic / CHG ancestry as the third founding stream of European populations; refines the AHG (Anatolian Hunter-Gatherer) / CHG split |
| Patterson et al., *Genetics* 222 | 2022 | ADMIXTOOLS 2 — methodological update that revised some admixture proportions from older papers |
| Kristiansen et al., *Antiquity* | 2017 | Single Grave / Corded Ware as direct Yamnaya daughter culture |

### 1.2 Cultures to add or refine

#### Pre-PIE ancestral populations (currently missing)
These are genetically important and should be shown as a pre-4000 BCE layer or as a separate toggle:

| Culture | Approx dates | Genome label | Significance |
|---|---|---|---|
| Western Hunter-Gatherers (WHG) | 14000–5000 BCE | WHG | Indigenous European HG ancestry; replaced by farmers |
| Eastern Hunter-Gatherers (EHG) | 14000–5000 BCE | EHG | Dominant in Pontic steppe before PIE expansion; ~50% of Yamnaya ancestry |
| Caucasus Hunter-Gatherers (CHG) | 13000–6000 BCE | CHG | Other ~50% of Yamnaya ancestry; arrived via Caucasus corridor |
| Anatolian Neolithic Farmers (ANF) | 9000–4000 BCE | ANF | Spread farming into Europe; blended with WHG |
| Iran Chalcolithic | 6000–3800 BCE | Iran_N | Contributor to BMAC and South Asian ancestry stream |

#### Missing or underrepresented cultures within PIE branches

| Branch | Gap | Source |
|---|---|---|
| Indo-Iranian | BMAC (Bactria-Margiana) as intermediary — currently absent | Narasimhan 2019 |
| Indo-Iranian | Sintashta deserves its own entry distinct from generic Andronovo; add chariot innovation note | Librado 2021 |
| Anatolian | Post-Hittite Anatolian (Phrygian, Lydian, Luwian) — branch disappears after 1200 BCE collapse | Bryce 2012 |
| Celtic | Hallstatt as precursor to La Tène; Urnfield Culture as transition | Mallory & Adams |
| Germanic | Only one culture entry; add Jastorf Culture (600–1 BCE), Proto-Norse expansion | — |
| Baltic | Entirely absent; add Corded Ware Baltic sub-branch, early Baltic cultures | — |
| Albanian | No culture entries at all; add Illyrian / Paleo-Balkan as precursor | Hamp 2007 |
| Greek | Mycenaean has genetic confirmation but migration path (from steppe via Balkans) not shown | — |
| Slavic | Prague-Penkov culture missing (~500–700 CE); only Kurgan/Corded Ware entry | — |

#### Key migration paths to add or correct

- WHG → ANF admixture (European Neolithic transition, ~6000–4500 BCE)
- CHG + EHG → Yamnaya formation (Pontic steppe, ~3500 BCE) — the genetic origin event
- Yamnaya → Bell Beaker westward expansion (Olalde 2018) — separate from Corded Ware
- Steppe MLBA → BMAC → South Asia (Narasimhan 2019)
- Scythian steppe expansion eastward (Damgaard 2018)
- Mycenaean intrusion into Aegean from north (~2000 BCE)

### 1.3 Data accuracy corrections

- **Sredny Stog dates**: extend start back to 4500 BCE (Anthony 2007 revision; current data starts at 4000 BCE)
- **Yamnaya radius**: should be larger and oval (east–west elongated along steppe corridor)
- **Tocharian endpoint**: app shows 900 CE; Tocharian texts date to 600–1000 CE; start of eastward migration should be ~1500 BCE per Narasimhan 2019
- **Celtic La Tène expansion**: arrow paths should fan west/south from central Europe, not just westward

---

## 2. Rebranding

### 2.1 Name candidates

| Name | Rationale | Risk |
|---|---|---|
| **Urheimat** | Academic term for PIE homeland; immediately meaningful to the target audience | Obscure to general audience; German loanword may alienate |
| **Steppe & Tongue** | Evokes both genetic origin (Pontic steppe) and language; poetic | Less searchable; vague |
| **Kurgan** | Archaeological culture central to PIE dispersal (Gimbutas hypothesis); immediately recognised in linguistics circles | Associated with contested Gimbutas theory; could mislead |
| **The Indo-European Migration Map** | Descriptive, SEO-optimal, no implied affiliation | Dry; forgettable |
| **Yamnaya** | The culture most associated with the expansion; distinctive, searchable | Too narrow — excludes Anatolian branch which predates Yamnaya |

### 2.2 Recommendation

**Primary title:** `Yamnaya`
**Subtitle:** `An Interactive Map of Indo-European Language Origins`
**Tagline:** `From the Pontic steppe to the ends of the earth — how one people's language became half the world's mother tongue.`

**Rationale:** "Yamnaya" is the single most-cited archaeological culture in modern PIE research, instantly recognisable after Haak 2015 and Reich's popular science coverage. It sidesteps the Spinney title entirely, has no trademark or copyright risk, and is distinctive/searchable. The subtitle clarifies scope for general audiences.

**Fallback if broader scope is wanted:** `Indo-European Origins` as the primary title — maximally descriptive, zero affiliation risk, strong SEO.

### 2.3 Changes required for rebranding

- `public/index.html`: update `<title>`, `<h1>`, `<meta name="description">`, `og:title`, `og:description`
- `public/privacy.html`, `public/terms.html`: update product name in all paragraphs and `<title>` tags
- `terms.html` §1: update the "based on" framing; replace "Based on Laura Spinney's research" with a description of the broader academic literature
- `README.md`: update title and description
- `CLAUDE.md`: update project description
- All `docs/*.md` headers: update product name

### 2.4 "Based on Spinney" language

Remove all "Based on Laura Spinney's research" language from the UI. It creates implied endorsement risk and is no longer accurate once the research scope expands. Spinney can remain credited in `terms.html` §3c as one of several academic sources.

---

## 3. Feature Additions (prioritised)

### Priority 1 — High value, low complexity

**3.1 URL state / bookmarking**
Encode timeline year, active branches, and info panel state in the URL hash (`#year=-2000&branches=celtic,germanic`). Allows sharing specific views. Implement with `history.replaceState` on every slider move (debounced to 500 ms). Zero dependencies.

**3.2 Disclaimer overlay**
Checklist item 7.3: add a dismissible banner on first load: *"Territorial extents are schematic approximations. Dates are approximate. Modern borders shown for orientation only."* Store dismissal in `sessionStorage` (no cookie needed). One-time task, ~20 lines of JS/CSS.

**3.3 Date-of-knowledge notice**
Add a footer note: *"Genetic data reflects scholarly consensus as of 2024–2025."* With link to the terms page accuracy disclaimer.

### Priority 2 — High value, moderate complexity

**3.4 Archaeological site markers**
Add a toggle-able `L.marker` layer for key excavation sites (Dereivka, Khvalynsk, Sintashta, Arkaim, Mohenjo-daro, Troy, Mycenae). Data can be a small static array in `data.js`. Each marker opens a popup with site name, date, and one-sentence significance. Approximately 1–2 hours of work plus content research.

**3.5 Search / filter**
A text input that filters visible cultures and events. Filter `PIE_DATA.cultures` by name/branch match, temporarily hide non-matching polygons. Use `<datalist>` for autocomplete of culture names. No dependencies; ~50 lines of JS.

**3.6 Citation panel**
A slide-out drawer listing the sources cited for the currently visible time range. As the timeline plays, swap in the relevant papers. Requires mapping `cultures` and `events` entries to a `sources` array in `data.js`. Moderate data work; UI is straightforward.

**3.7 Genetic admixture display**
When a culture info panel opens, show a small stacked bar chart of the culture's estimated ancestry components (EHG%, WHG%, ANF%, CHG%, Steppe%). Data exists in Haak/Mathieson/Narasimhan papers. Pure SVG — no charting library needed. ~80 lines of JS/SVG.

### Priority 3 — Large investment, high impact

**3.8 Phylogenetic language tree panel**
A collapsible side panel showing the PIE family tree as an SVG tree diagram. Branches highlight as the timeline plays to show which daughter languages had emerged by the current year. Significant content research required to establish the correct branching dates.

**3.9 Ancient DNA sample overlay**
Plot `L.circleMarker` for actual ancient DNA samples from the Allen Ancient DNA Resource (AADR) dataset (publicly available at reich.hms.harvard.edu). Each point represents a real sequenced individual. Toggle-able layer; too dense at global zoom so only show at zoom ≥ 5. Data parsing script needed.

**3.10 Mobile-responsive layout**
Full responsive redesign: stacked layout on mobile, collapsible legend, bottom-sheet info panel, touch-friendly controls. Significant CSS work. Checklist item 3.6.

---

## 4. App Optimisations (prioritised)

### 4.1 Vendor Leaflet locally (low effort, significant reliability gain)

```bash
mkdir -p public/lib
curl -o public/lib/leaflet.js  https://unpkg.com/leaflet@1.9.4/dist/leaflet.js
curl -o public/lib/leaflet.css https://unpkg.com/leaflet@1.9.4/dist/leaflet.css
```

Update `index.html` to reference `lib/leaflet.js` and `lib/leaflet.css`. Remove `crossorigin`/`integrity` attributes (no longer needed for same-origin assets, though you could keep local SRI if desired). Eliminates unpkg.com as a dependency and single point of failure. Enables offline use. Checklist item 4.4.

### 4.2 Compression middleware (low effort, 60–70% payload reduction)

```bash
npm install compression
```

Add to `server.js` before `express.static`:
```javascript
const compression = require('compression');
app.use(compression());
```

`data.js` (~70 KB uncompressed) compresses to ~18 KB with gzip. Checklist item 4.2.

### 4.3 Open Graph / social preview tags (low effort, meaningful discoverability)

Add to `index.html` `<head>`:
```html
<meta property="og:title"       content="Yamnaya — An Interactive Map of Indo-European Language Origins" />
<meta property="og:description" content="Animate 5,500 years of language migration from the Pontic steppe." />
<meta property="og:image"       content="https://yourdomain.com/social-preview.png" />
<meta property="og:url"         content="https://yourdomain.com/" />
<meta name="twitter:card"       content="summary_large_image" />
```

Create `public/social-preview.png` — 1200×630 px screenshot of the map at a visually interesting year (e.g., -2500 BCE, peak Yamnaya expansion). Checklist item 5.1/5.2.

### 4.4 robots.txt and sitemap (minimal effort)

```
# public/robots.txt
User-agent: *
Allow: /
Sitemap: https://yourdomain.com/sitemap.xml
```

```xml
<!-- public/sitemap.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.2">
  <url><loc>https://yourdomain.com/</loc><changefreq>monthly</changefreq></url>
  <url><loc>https://yourdomain.com/privacy.html</loc></url>
  <url><loc>https://yourdomain.com/terms.html</loc></url>
</urlset>
```

Checklist items 5.3/5.4.

### 4.5 Service worker / offline mode (moderate effort)

A minimal service worker caching the app shell (HTML, CSS, JS, vendored Leaflet) enables offline use and dramatically improves repeat-visit load time. Tile images cannot practically be cached (too many URLs), but the app shell + `data.js` is ~500 KB — entirely cacheable.

```javascript
// public/sw.js — cache-first for app shell
const CACHE = 'pie-map-v1';
const SHELL = ['/', '/style.css', '/app.js', '/data.js',
               '/lib/leaflet.css', '/lib/leaflet.js'];
self.addEventListener('install', e => e.waitUntil(
  caches.open(CACHE).then(c => c.addAll(SHELL))
));
self.addEventListener('fetch', e => e.respondWith(
  caches.match(e.request).then(r => r || fetch(e.request))
));
```

Register in `index.html`:
```javascript
if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js');
```

Depends on 4.1 (vendor Leaflet) being done first.

### 4.6 Viewport culling for large datasets (future, if data grows significantly)

If cultures and migrations grow to 50+ entries, skip rendering objects whose `bounds` lie outside `map.getBounds()` on each frame. Currently not needed — 22 cultures + 14 migrations is handled easily by Leaflet. Revisit when data expands per section 1.2.

### 4.7 Web worker for interpolation (future, if animation stutters)

The `interpolateCulture()` function runs per-culture per-frame. At 22 cultures it is negligible. If cultures grow to 100+, offload the interpolation loop to a `Worker` via `postMessage`, receive computed positions each frame. Not needed now.

---

## 5. Implementation order recommendation

| Phase | Items | Effort | Rationale |
|---|---|---|---|
| **Phase 1** (pre-launch blockers) | Rebranding (2.3), disclaimer overlay (3.2), robots.txt + sitemap (4.4), OG tags (4.3) | 1–2 days | Checklist items; needed before any promotion |
| **Phase 2** (quick wins) | Vendor Leaflet (4.1), compression (4.2), URL state (3.1), archaeological sites (3.4) | 1–2 days | High value, low risk |
| **Phase 3** (content) | New culture entries: WHG/EHG/CHG, BMAC, Bell Beaker corrections (1.2), rewrite terms to remove Spinney framing (2.4) | 2–3 days | Research-heavy; correctness critical |
| **Phase 4** (features) | Admixture bars (3.7), search (3.5), citation panel (3.6) | 2–3 days | Differentiate from similar maps |
| **Phase 5** (large projects) | Mobile layout (3.10), language tree (3.8), aDNA overlay (3.9), service worker (4.5) | 1–2 weeks each | Long-tail improvements |
