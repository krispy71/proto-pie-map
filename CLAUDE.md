# CLAUDE.md — Yamnaya Migration Map

Developer and AI-assistant reference for this codebase.

## What this project is

An interactive browser map visualising the spread of Proto-Indo-European (PIE) languages
and associated genetic migrations from ~4000 BCE to 500 CE, based on the archaeogenetic
and comparative linguistic literature (Haak 2015, Narasimhan 2019, Librado 2021,
Lazaridis 2022, Reich, Anthony, et al.).

Served by a minimal Express static-file server; all visualisation logic runs client-side
using Leaflet.js.

## Repository layout

```
proto-pie-map/
├── server.js            Express static server — only meaningful file in Node
├── package.json
├── Dockerfile           Multi-stage build (deps → runtime, non-root user)
├── docker-compose.yml   Single-service compose for local container testing
├── .dockerignore
├── CLAUDE.md            This file
├── README.md            User-facing setup & usage guide
└── public/              Served as static files
    ├── index.html       App shell, all UI panels declared here
    ├── style.css        All styles — dark theme, timeline, map controls
    ├── data.js          Historical data (PIE_DATA global object)
    └── app.js           PIEMigrationMap class — all visualisation logic
```

## Architecture

```
Browser
  └─ index.html
       ├─ Leaflet.js (CDN)        — map engine, tile layers, circles, polylines
       ├─ data.js                 — PIE_DATA constant (no framework, plain JS)
       └─ app.js (PIEMigrationMap)
            ├─ initMap()          — Leaflet map, tile layer, layer groups
            ├─ initControls()     — timeline slider, play/pause, speed, map controls
            ├─ buildLegend()      — branch swatches; click-to-toggle visibility
            ├─ renderYear(year)   — called every animation frame or on slider drag
            │    ├─ updateTerritories(year)   — L.circle per active culture
            │    └─ updateMigrations(year)    — animated L.polyline per migration
            ├─ animationLoop()    — requestAnimationFrame loop
            └─ showInfo(culture)  — populates right-side info panel
```

No build step. No bundler. All plain ES2020 class syntax, runs directly in modern browsers.

## Data schema (`public/data.js`)

`PIE_DATA` is a single global object with four keys:

### `branches`
```js
{
  homeland: { name: 'PIE Homeland', color: '#E8A020', textColor: '#000' },
  // one entry per language branch — color used for circles, lines, legend swatches
}
```

### `cultures`
Array of culture/people objects:
```js
{
  id:          'yamnaya',           // unique string key
  name:        'Yamnaya Culture',
  branch:      'homeland',          // must match a key in branches
  description: '...',              // shown in right-side info panel
  startYear:   -3500,              // negative = BCE
  endYear:     -2100,
  phases: [
    { year: -3500, center: [lat, lon], radius: 600 },  // radius in km
    // ... additional keyframes; app.js linearly interpolates between them
  ],
}
```

### `migrations`
Array of migration path objects:
```js
{
  id:           'mig_corded_ware',
  name:         'Westward: Yamnaya → Corded Ware',
  branch:       'homeland',
  description:  '...',
  startYear:    -3200,    // when path becomes visible
  endYear:       500,     // when path disappears
  animateStart: -3100,    // year at which the line begins drawing itself
  animateEnd:   -2600,    // year at which the line is fully drawn
  path: [
    [lat, lon],           // waypoints in geographic order
    // ...
  ],
}
```

### `events`
Array of timeline ticker entries:
```js
{ year: -3500, name: 'Yamnaya culture fully formed', branch: 'homeland' }
```

## How to add a new culture

1. Open `public/data.js`.
2. Add an entry to `cultures` with `id`, `name`, `branch` (existing key or new), `startYear`,
   `endYear`, `description`, and at least two `phases`.
3. If adding a new branch, add a matching entry to `branches` with a distinct `color`.
4. Optionally add a `migrations` entry to draw the movement path.
5. Optionally add `events` entries for the ticker.
6. No build step — refresh the browser.

## Map opacity & tile style

Tile layer opacity is controlled via `PIEMigrationMap.setMapOpacity(0–1)`, which calls
`this.tileLayer.setOpacity()`. The CSS no longer applies any brightness/sepia filter to
`#map`; that approach made tile text and border labels dim (the filter applied to raster
images, not just the page background).

Overlay opacity (territory circles, migration lines) is controlled via
`PIEMigrationMap.setOverlayOpacity(0–1)`, which updates Leaflet circle styles directly.

Available tile styles are defined in `this.TILE_STYLES` inside the constructor:
`positron`, `dark`, `voyager`, `topo`, `esri-relief`.

## Running locally

```bash
npm install
npm start
# → http://localhost:3000
```

Specify a different port:
```bash
PORT=8080 npm start
```

## Running in Docker

```bash
# Build and run
docker build -t proto-pie-map .
docker run -p 3000:3000 proto-pie-map

# Or with compose
docker compose up --build
```

## Key design decisions

| Decision | Reason |
|---|---|
| No frontend framework | Zero build complexity; the visualisation is self-contained and doesn't benefit from component trees |
| Leaflet over D3 | Leaflet handles tile management, zoom, and coordinate projection out of the box; D3 would require more projection math |
| `L.circle` (not GeoJSON polygons) | Interpolating a centre + radius is trivial; accurate historical polygons would require complex GeoJSON |
| Linear phase interpolation | Sufficient accuracy for migration timescales of centuries; spline interpolation would add complexity with little visual benefit |
| CSS-free tile dimming | Early versions used `filter: brightness()` on `#map` — this dimmed raster tile labels too, making borders hard to read. Switched to `tileLayer.setOpacity()` which blends tiles with the page background colour without touching the tile images |
| Multi-stage Dockerfile | Keeps the final image small (no devDependencies, no build tools); non-root user for security |
