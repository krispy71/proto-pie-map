# Product Requirements Document — Yamnaya / proto-pie-map

## Vision

A single interactive browser application that hosts multiple historically grounded visualizations
of human migration and civilization. Users can switch between views to explore different epochs
and geographic scales of human history — from the Proto-Indo-European language dispersal to the
parallel development of civilizations across all continents.

---

## Current State (v1)

The application ships one visualization:

- **PIE Migrations** — steppe dispersal and language branch spread, 4000 BCE to 500 CE

---

## Feature: Multi-Dataset Visualization Picker

### User Stories

| # | As a… | I want to… | So that… |
|---|---|---|---|
| 1 | visitor | switch between the PIE migration view and a world civilizations view | I can explore both perspectives in one app |
| 2 | visitor | share a link that opens a specific dataset at a specific year | others land in exactly the context I intend |
| 3 | visitor | see a timeline appropriate to the selected dataset | I'm not confused by years outside the dataset's scope |
| 4 | visitor | see a legend that reflects the current dataset's categories | I can understand what each color means |
| 5 | educator | embed or link to the world civilizations view | I can use it to discuss global history alongside PIE |

### Datasets

#### Dataset 1: PIE Migrations (existing)
- **Timeline:** 4000 BCE – 500 CE
- **Focus:** Yamnaya steppe culture, language branch dispersal, archaeogenetics
- **Branches:** Language families (Anatolian, Hellenic, Italic, Celtic, Germanic, etc.)

#### Dataset 2: World Civilizations (new)
- **Timeline:** 10,000 BCE – 1500 CE
- **Focus:** Parallel development of major human civilizations globally
- **Branches:** Geographic/cultural regions (Near East, Egypt, Africa, South Asia, East Asia,
  Oceania, Mesoamerica, Andes, North America)
- **Cultures:** 30+ civilizations including Sumer, Egypt, Indus Valley, Shang, Maya, Inca, etc.
- **Migrations:** Bantu expansion, Austronesian seafaring, Paleoindian dispersal, Neolithic
  spread into Europe, Silk Road corridor

### Non-Goals

- User-uploaded or user-defined datasets
- Real-time or live data integration
- Server-side rendering or database-backed content
- Mobile-native app (progressive web app enhancement is acceptable but not required)

### Technical Constraints

- No framework, no build step — plain ES2020, runs directly in modern browsers
- New dataset must follow the exact same `PIE_DATA` schema (branches, cultures, migrations,
  events, genetics, sites, sources)
- URL state must remain bookmarkable: `#dataset=pie&year=-3500` or `#dataset=civilizations&year=-2500`
- No CDN dependencies added — all assets must be served locally

---

## Success Metrics

1. Both datasets fully navigable; timeline slider shows correct min/max per dataset
2. Legend dynamically rebuilds for each dataset on switch
3. URL state round-trips correctly (paste a URL → loads the same dataset and year)
4. Switching datasets does not require a page reload
5. No visual artifacts from previous dataset remain after switching

---

## Data Quality Standard

All cultures and migration paths must be grounded in peer-reviewed archaeogenetic or
archaeological literature. Coordinates, year ranges, and branch attributions must match
current academic consensus as synthesized in `RESEARCH.md`.

Key sources: Haak et al. 2015, Narasimhan et al. 2019, Lazaridis et al. 2022/2024,
Librado et al. 2021, Nakagome et al. 2025.
