// ═══════════════════════════════════════════════════════════════════
//  PIE Migration Map — app.js
//  Interactive visualization of Proto-Indo-European migrations
// ═══════════════════════════════════════════════════════════════════

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Dataset registry — populated after all data scripts load
const DATASETS = {};

class PIEMigrationMap {
  constructor(data) {
    // Multi-family state (replaces single-dataset pattern)
    this.activeFamilies = {};   // { familyKey → dataObject }

    // Timeline state — default year set when first family activates
    this.currentYear  = -3500;
    this.playing      = false;
    this.speedIndex   = 2;   // index into SPEEDS array
    this.SPEEDS       = [10, 25, 50, 100, 200, 400]; // years/second
    this.lastTs       = null;
    this.rafHandle    = null;

    // Leaflet layers
    this.map              = null;
    this.tileLayer        = null;   // reference kept for opacity / style switching
    this.territoryGroup   = null;
    this.migrationGroup   = null;
    this.labelGroup       = null;
    this.siteGroup        = null;

    // Site visibility toggle
    this.sitesVisible     = true;

    // Display state
    this.mapOpacity     = 0.90;  // tile layer opacity (0–1)
    this.overlayOpacity = 0.80;  // multiplier applied to territory fill/stroke

    // Available tile styles
    this.TILE_STYLES = {
      positron: {
        url:         'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains:  'abcd',
        maxZoom:     19,
      },
      dark: {
        url:         'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains:  'abcd',
        maxZoom:     19,
      },
      voyager: {
        url:         'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains:  'abcd',
        maxZoom:     19,
      },
      topo: {
        url:         'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="https://opentopomap.org">OpenTopoMap</a>',
        subdomains:  'abc',
        maxZoom:     17,
      },
      'esri-relief': {
        url:         'https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}',
        attribution: 'Tiles &copy; Esri — Source: Esri, USGS, NOAA',
        subdomains:  '',
        maxZoom:     13,
      },
    };

    // Territory shape mode: 'circle' or 'ellipse'
    this.shapeMode = 'circle';

    // Search filter (empty string = no filter)
    this.searchFilter = '';

    // Fast lookup: { id → { culture, familyKey } }
    this.culturesById = {};

    // Layer state: { id → { circle, label, mode } }
    this.territoryLayers  = {};
    // Migration state: { id → { polyline, arrow } }
    this.migrationLayers  = {};

    // Legend filter (branch → visible boolean)
    this.branchVisible = {};   // populated by activateFamily

    // Closest upcoming event (for ticker)
    this.lastTickerYear = null;

    // Reduced-motion: respect OS/browser preference
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Keep preference in sync if user changes it mid-session
    window.matchMedia('(prefers-reduced-motion: reduce)')
      .addEventListener('change', e => {
        this.prefersReducedMotion = e.matches;
        if (e.matches) this.pause();
      });

    // Debounced URL state push (500 ms)
    this._pushUrlStateDebounced = this._debounce(() => this._pushUrlState(), 500);

    this.init();
  }

  // ── Initialization ───────────────────────────────────────────────

  init() {
    this._parseUrlState();       // must be before initMap/buildLegend
    this.initMap();
    this.buildLegend();
    this.initControls();
    this.initSites();
    this.initSearch();
    this.initCitations();
    this.renderYear(this.currentYear);
    this.updateCitations(this.currentYear);
  }

  initMap() {
    this.map = L.map('map', {
      center: [42, 28],
      zoom: 4,
      minZoom: 2,
      maxZoom: 9,
      zoomControl: true,
    });

    this.tileLayer = this.makeTileLayer(
      Object.prototype.hasOwnProperty.call(this.TILE_STYLES, this._initStyle || '')
        ? this._initStyle : 'positron'
    );
    this.tileLayer.setOpacity(this.mapOpacity);
    this.tileLayer.addTo(this.map);

    // Layer groups (order matters for z-stacking)
    this.siteGroup      = L.layerGroup().addTo(this.map);
    this.migrationGroup = L.layerGroup().addTo(this.map);
    this.territoryGroup = L.layerGroup().addTo(this.map);
    this.labelGroup     = L.layerGroup().addTo(this.map);
  }

  makeTileLayer(styleKey) {
    const s = this.TILE_STYLES[styleKey];
    return L.tileLayer(s.url, {
      attribution: s.attribution,
      subdomains:  s.subdomains || 'abc',
      maxZoom:     s.maxZoom,
      opacity:     this.mapOpacity,
    });
  }

  switchTileStyle(styleKey) {
    if (this.tileLayer) {
      this.map.removeLayer(this.tileLayer);
    }
    this.tileLayer = this.makeTileLayer(styleKey);
    this.tileLayer.setOpacity(this.mapOpacity);
    // Insert below data layers (addTo puts it on top; insertBefore keeps order)
    this.tileLayer.addTo(this.map);
    this.tileLayer.bringToBack();
  }

  setMapOpacity(value) {
    this.mapOpacity = value;
    if (this.tileLayer) this.tileLayer.setOpacity(value);
  }

  setOverlayOpacity(value) {
    this.overlayOpacity = value;
    // Re-render all visible territory circles with updated opacity
    Object.values(this.territoryLayers).forEach(({ circle }) => {
      circle.setStyle({
        fillOpacity: 0.22 * value,
        opacity:     0.7  * value,
      });
    });
    // Re-render visible migration lines
    Object.values(this.migrationLayers).forEach(({ polyline }) => {
      const current = parseFloat(polyline.options.opacity);
      if (current > 0) {
        polyline.setStyle({ opacity: Math.min(current, value) });
      }
    });
  }

  // ── URL State ────────────────────────────────────────────────────

  _debounce(fn, delay) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  _parseUrlState() {
    const hash = location.hash.slice(1);
    if (!hash) return;
    const params = new URLSearchParams(hash);

    const tMin = this.data.meta ? this.data.meta.timelineMin : this.data.startYear;
    const tMax = this.data.meta ? this.data.meta.timelineMax : this.data.endYear;
    const year = parseInt(params.get('year'), 10);
    if (!isNaN(year) && year >= tMin && year <= tMax) {
      this.currentYear = year;
    }

    const style = params.get('style');
    if (style && Object.prototype.hasOwnProperty.call(this.TILE_STYLES, style)) {
      this._initStyle = style;
    }

    const hidden = params.get('hidden');
    if (hidden) {
      hidden.split(',').forEach(key => {
        if (key && Object.prototype.hasOwnProperty.call(this.branchVisible, key)) {
          this.branchVisible[key] = false;
        }
      });
    }

    if (params.get('sites') === '0') {
      this.sitesVisible = false;
    }
  }

  _pushUrlState() {
    const hidden = Object.entries(this.branchVisible)
      .filter(([, v]) => !v)
      .map(([k]) => k)
      .join(',');
    const params = new URLSearchParams();
    params.set('year', Math.round(this.currentYear));
    const familyKeys = Object.keys(this.activeFamilies);
    if (familyKeys.length > 0) params.set('families', familyKeys.join(','));
    if (hidden) params.set('hidden', hidden);
    if (!this.sitesVisible) params.set('sites', '0');
    history.replaceState(null, '', '#' + params.toString());
  }

  // ── Archaeological Sites ─────────────────────────────────────────

  initSites() {
    if (!this.data.sites) return;

    this.data.sites.forEach(site => {
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

    if (!this.sitesVisible) this.siteGroup.remove();

    const btn = document.getElementById('sites-toggle');
    if (!btn) return;

    // Sync button state to URL-parsed visibility
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

  // ── Legend ───────────────────────────────────────────────────────

  buildLegend() {
    const container = document.getElementById('legend-items');
    const branches  = this.data.branches;

    Object.entries(branches).forEach(([key, branch]) => {
      // <button> gives free keyboard focus, Enter/Space activation, and role=button
      const item = document.createElement('button');
      item.className       = 'legend-item';
      item.dataset.branch  = key;
      item.setAttribute('role', 'listitem');
      item.setAttribute('aria-pressed', 'true');
      item.setAttribute('aria-label', `${branch.name} — click to hide`);

      const swatch = document.createElement('span');
      swatch.className    = 'legend-swatch';
      swatch.style.background = branch.color;
      swatch.setAttribute('aria-hidden', 'true');

      const label = document.createElement('span');
      label.textContent = branch.name;

      item.appendChild(swatch);
      item.appendChild(label);
      container.appendChild(item);

      item.addEventListener('click', () => this.toggleBranch(key, item));
    });
  }

  toggleBranch(key, item) {
    this.branchVisible[key] = !this.branchVisible[key];
    const visible = this.branchVisible[key];
    item.classList.toggle('muted', !visible);
    item.setAttribute('aria-pressed', String(visible));
    const branchName = this.data.branches[key].name;
    item.setAttribute('aria-label',
      `${branchName} — click to ${visible ? 'hide' : 'show'}`);
    this.renderYear(this.currentYear);
    this._pushUrlState();
  }

  // ── Timeline Controls ────────────────────────────────────────────

  initControls() {
    // ── Timeline ──────────────────────────────────────────────────
    const slider    = document.getElementById('time-slider');
    const btnPlay   = document.getElementById('btn-play');
    const btnRewind = document.getElementById('btn-rewind');
    const btnFaster = document.getElementById('btn-faster');
    const btnSlower = document.getElementById('btn-slower');

    slider.addEventListener('input', () => {
      this.setYear(parseInt(slider.value, 10));
    });

    btnPlay.addEventListener('click', () => this.togglePlay());
    btnRewind.addEventListener('click', () => {
      this.pause();
      this.setYear(this._timelineMin());
    });
    btnFaster.addEventListener('click', () => {
      this.speedIndex = Math.min(this.speedIndex + 1, this.SPEEDS.length - 1);
      this.updateSpeedLabel();
    });
    btnSlower.addEventListener('click', () => {
      this.speedIndex = Math.max(this.speedIndex - 1, 0);
      this.updateSpeedLabel();
    });

    this.updateSpeedLabel();
    this.updateYearDisplay(this.currentYear);
    this.updateSlider(this.currentYear);

    // ── Map controls ──────────────────────────────────────────────
    const styleSelect      = document.getElementById('map-style-select');
    const mapOpacSlider    = document.getElementById('map-opacity-slider');
    const mapOpacVal       = document.getElementById('map-opacity-val');
    const overlayOpacSlider = document.getElementById('overlay-opacity-slider');
    const overlayOpacVal   = document.getElementById('overlay-opacity-val');

    styleSelect.addEventListener('change', () => {
      this.switchTileStyle(styleSelect.value);
    });

    mapOpacSlider.addEventListener('input', () => {
      const pct = parseInt(mapOpacSlider.value, 10);
      mapOpacVal.textContent = pct + '%';
      this.setMapOpacity(pct / 100);
    });

    overlayOpacSlider.addEventListener('input', () => {
      const pct = parseInt(overlayOpacSlider.value, 10);
      overlayOpacVal.textContent = pct + '%';
      this.setOverlayOpacity(pct / 100);
    });

    const shapeModeSelect = document.getElementById('shape-mode-select');
    shapeModeSelect.addEventListener('change', () => {
      this.setShapeMode(shapeModeSelect.value);
    });

    // Dataset picker (legacy — removed in multi-family refactor)
    const datasetSelect = document.getElementById('dataset-select');
    if (datasetSelect) {
      datasetSelect.addEventListener('change', e => this.activateFamily(e.target.value));
    }
  }

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

  updateSpeedLabel() {
    const speed = this.SPEEDS[this.speedIndex];
    const mult  = speed / this.SPEEDS[2]; // SPEEDS[2] = 50 = "1×"
    document.getElementById('speed-label').textContent =
      mult < 1 ? `${mult}×` : `${mult}×`;
  }

  _timelineMax() {
    return this._calcTimelineUnion().max;
  }

  _timelineMin() {
    return this._calcTimelineUnion().min;
  }

  togglePlay() {
    if (this.playing) {
      this.pause();
    } else {
      if (this.prefersReducedMotion) return; // honour OS motion preference
      if (this.currentYear >= this._timelineMax()) {
        this.setYear(this._timelineMin());
      }
      this.play();
    }
  }

  play() {
    this.playing = true;
    this.lastTs  = null;
    const btn = document.getElementById('btn-play');
    btn.textContent = '⏸';
    btn.setAttribute('aria-label', 'Pause animation');
    btn.setAttribute('aria-pressed', 'true');
    this.rafHandle = requestAnimationFrame(ts => this.animationLoop(ts));
  }

  pause() {
    this.playing = false;
    const btn = document.getElementById('btn-play');
    btn.textContent = '▶';
    btn.setAttribute('aria-label', 'Play animation');
    btn.setAttribute('aria-pressed', 'false');
    if (this.rafHandle) {
      cancelAnimationFrame(this.rafHandle);
      this.rafHandle = null;
    }
  }

  animationLoop(timestamp) {
    if (!this.playing) return;

    if (this.lastTs !== null) {
      const deltaSec  = (timestamp - this.lastTs) / 1000;
      const deltaYears = deltaSec * this.SPEEDS[this.speedIndex];
      const newYear    = this.currentYear + deltaYears;

      if (newYear >= this._timelineMax()) {
        this.setYear(this._timelineMax());
        this.pause();
        return;
      }
      this.setYear(newYear);
    }

    this.lastTs   = timestamp;
    this.rafHandle = requestAnimationFrame(ts => this.animationLoop(ts));
  }

  setYear(year) {
    this.currentYear = year;
    this.updateYearDisplay(year);
    this.updateSlider(year);
    this.renderYear(year);
    this.updateEventTicker(year);
    this.updateCitations(year);
    this._pushUrlStateDebounced();
  }

  updateYearDisplay(year) {
    const rounded  = Math.round(year);
    const abs      = Math.abs(rounded);
    const suffix   = rounded < 0 ? ' BCE' : rounded === 0 ? ' BCE' : ' CE';
    const yearText = abs.toLocaleString() + suffix;
    document.getElementById('year-label').textContent = yearText;
  }

  updateSlider(year) {
    const rounded  = Math.round(year);
    const abs      = Math.abs(rounded);
    const suffix   = rounded < 0 ? ' BCE' : rounded === 0 ? ' BCE' : ' CE';
    const yearText = abs.toLocaleString() + suffix;

    const slider = document.getElementById('time-slider');
    slider.value = rounded;
    slider.setAttribute('aria-valuenow',  String(rounded));
    slider.setAttribute('aria-valuetext', yearText);

    // Gradient fill
    const { min: tMin, max: tMax } = this._calcTimelineUnion();
    const pct = ((year - tMin) / (tMax - tMin)) * 100;
    slider.style.setProperty('--pct', pct.toFixed(2) + '%');
  }

  updateEventTicker(year) {
    // Show the most recent event at or before current year
    const events = this.data.events;
    let best = null;
    for (const ev of events) {
      if (ev.year <= year && (best === null || ev.year > best.year)) {
        best = ev;
      }
    }

    const ticker = document.getElementById('event-ticker');
    if (best && best.year !== this.lastTickerYear) {
      this.lastTickerYear = best.year;
      const abs    = Math.abs(Math.round(best.year));
      const suffix = best.year < 0 ? ' BCE' : ' CE';
      ticker.textContent = `${abs.toLocaleString()}${suffix} — ${best.name}`;
      // Flash animation
      ticker.style.opacity = '0';
      requestAnimationFrame(() => {
        ticker.style.transition = 'opacity 0.5s';
        ticker.style.opacity    = '1';
      });
    }
  }

  // ── Rendering ────────────────────────────────────────────────────

  renderYear(year) {
    this.updateTerritories(year);
    this.updateMigrations(year);
    this._applySearchHighlight();
  }

  // ── Territory Circles ─────────────────────────────────────────────

  updateTerritories(year) {
    for (const familyData of Object.values(this.activeFamilies)) {
    familyData.cultures.forEach(culture => {
      const id      = culture.id;
      const visible = this.branchVisible[culture.branch]
                   && year >= culture.startYear
                   && year <= culture.endYear;

      const state = this.interpolateCulture(culture, year);

      if (!visible || !state) {
        // Remove if exists
        if (this.territoryLayers[id]) {
          this.territoryGroup.removeLayer(this.territoryLayers[id].circle);
          this.labelGroup.removeLayer(this.territoryLayers[id].label);
          delete this.territoryLayers[id];
        }
        return;
      }

      const branch = familyData.branches[culture.branch];
      const radiusM = state.radius * 1000; // km → metres

      const existingLayer = this.territoryLayers[id];
      // Recreate layer if it was built in a different shape mode
      if (existingLayer && existingLayer.mode !== this.shapeMode) {
        this.territoryGroup.removeLayer(existingLayer.circle);
        this.labelGroup.removeLayer(existingLayer.label);
        delete this.territoryLayers[id];
      }

      if (!this.territoryLayers[id]) {
        // Create new territory shape
        const shapeOpts = {
          color:       branch.color,
          fillColor:   branch.color,
          fillOpacity: 0.22 * this.overlayOpacity,
          weight:      1.8,
          opacity:     0.7  * this.overlayOpacity,
          className:   'territory-circle',
        };

        let shape;
        if (this.shapeMode === 'ellipse') {
          // Use rx/ry if available; fall back to radius as a circle
          const rx = state.rx != null ? state.rx : state.radius;
          const ry = state.ry != null ? state.ry : state.radius;
          const pts = this._generateEllipse(state.center, rx, ry);
          shape = L.polygon(pts, shapeOpts);
        } else {
          shape = L.circle(state.center, { ...shapeOpts, radius: radiusM });
        }

        // Create label marker
        const label = L.marker(state.center, {
          icon: L.divIcon({
            className:   '',
            html:        `<div class="culture-label" style="color:${escapeHTML(branch.color)}">${escapeHTML(culture.name)}</div>`,
            iconSize:    [0, 0],
            iconAnchor:  [0, 0],
          }),
          interactive: false,
          zIndexOffset: 100,
        });

        // Click handler for info panel
        shape.on('click', () => this.showInfo(culture));
        shape.on('mouseover', function () {
          this.setStyle({ fillOpacity: 0.38, weight: 2.5 });
        });
        shape.on('mouseout', function () {
          this.setStyle({ fillOpacity: 0.22, weight: 1.8 });
        });

        shape.bindTooltip(`<strong>${escapeHTML(culture.name)}</strong>`, {
          className: 'migration-tooltip',
          sticky: true,
        });

        this.territoryGroup.addLayer(shape);
        this.labelGroup.addLayer(label);
        this.territoryLayers[id] = { circle: shape, label, mode: this.shapeMode };

      } else {
        // Update existing shape
        const { circle: shape, label } = this.territoryLayers[id];
        if (this.shapeMode === 'ellipse') {
          const rx = state.rx != null ? state.rx : state.radius;
          const ry = state.ry != null ? state.ry : state.radius;
          const pts = this._generateEllipse(state.center, rx, ry);
          shape.setLatLngs(pts);
        } else {
          shape.setLatLng(state.center);
          shape.setRadius(radiusM);
        }
        label.setLatLng(state.center);
        // Update label HTML in case it changed
        label.setIcon(L.divIcon({
          className:  '',
          html:       `<div class="culture-label" style="color:${escapeHTML(branch.color)}">${escapeHTML(culture.name)}</div>`,
          iconSize:   [0, 0],
          iconAnchor: [0, 0],
        }));
      }
    }); // end forEach culture
    } // end for activeFamilies
  }

  interpolateCulture(culture, year) {
    const phases = culture.phases;
    if (!phases || phases.length === 0) return null;

    if (year <= phases[0].year) return { ...phases[0] };
    if (year >= phases[phases.length - 1].year) return { ...phases[phases.length - 1] };

    for (let i = 0; i < phases.length - 1; i++) {
      const a = phases[i];
      const b = phases[i + 1];
      if (year >= a.year && year <= b.year) {
        const t = (year - a.year) / (b.year - a.year);
        const result = {
          center: [
            a.center[0] + (b.center[0] - a.center[0]) * t,
            a.center[1] + (b.center[1] - a.center[1]) * t,
          ],
          radius: a.radius + (b.radius - a.radius) * t,
        };
        // Interpolate ellipse axes if present on both keyframes
        if (a.rx != null && b.rx != null) result.rx = a.rx + (b.rx - a.rx) * t;
        if (a.ry != null && b.ry != null) result.ry = a.ry + (b.ry - a.ry) * t;
        return result;
      }
    }
    return null;
  }

  // ── Ellipse generation ────────────────────────────────────────────

  // Generate a Leaflet-compatible polygon approximating an ellipse.
  // center: [lat, lon], rx: east-west semi-axis (km), ry: north-south semi-axis (km)
  // Returns an array of [lat, lon] points.
  _generateEllipse(center, rx, ry, numPoints = 48) {
    const lat0 = center[0];
    const lon0 = center[1];
    // Convert km axes to degrees
    const ryDeg = ry / 111.32;
    const rxDeg = rx / (111.32 * Math.cos(lat0 * Math.PI / 180));
    const pts = [];
    for (let i = 0; i < numPoints; i++) {
      const theta = (2 * Math.PI * i) / numPoints;
      pts.push([
        lat0 + ryDeg * Math.sin(theta),
        lon0 + rxDeg * Math.cos(theta),
      ]);
    }
    return pts;
  }

  // ── Shape mode ────────────────────────────────────────────────────

  setShapeMode(mode) {
    if (mode === this.shapeMode) return;
    this.shapeMode = mode;
    // Clear all territory layers so they are recreated with the new shape type
    Object.values(this.territoryLayers).forEach(({ circle, label }) => {
      this.territoryGroup.removeLayer(circle);
      this.labelGroup.removeLayer(label);
    });
    this.territoryLayers = {};
    this.renderYear(this.currentYear);
  }

  // ── Search / filter ───────────────────────────────────────────────

  initSearch() {
    const input = document.getElementById('culture-search');
    const datalist = document.getElementById('culture-datalist');
    if (!input || !datalist) return;

    // Populate datalist with all culture names
    this.data.cultures.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.name;
      datalist.appendChild(opt);
    });

    input.addEventListener('input', () => {
      this.searchFilter = input.value.trim().toLowerCase();
      this._applySearchHighlight();
    });

    // On clear / escape, reset
    input.addEventListener('search', () => {
      if (!input.value) {
        this.searchFilter = '';
        this._applySearchHighlight();
      }
    });
  }

  _cultureMatchesSearch(culture) {
    if (!this.searchFilter) return true;
    const term = this.searchFilter;
    if (culture.name.toLowerCase().includes(term)) return true;
    const branch = this.data.branches[culture.branch];
    if (branch && branch.name.toLowerCase().includes(term)) return true;
    return false;
  }

  _applySearchHighlight() {
    Object.entries(this.territoryLayers).forEach(([id, { circle }]) => {
      const culture = this.culturesById[id];
      if (!culture) return;
      if (!this.searchFilter || this._cultureMatchesSearch(culture)) {
        circle.setStyle({
          fillOpacity: 0.22 * this.overlayOpacity,
          opacity:     0.7  * this.overlayOpacity,
        });
      } else {
        circle.setStyle({ fillOpacity: 0.04, opacity: 0.12 });
      }
    });
  }

  // ── Citation panel ────────────────────────────────────────────────

  initCitations() {
    const toggle = document.getElementById('citation-toggle');
    const panel  = document.getElementById('citation-panel');
    const close  = document.getElementById('citation-close');
    if (!toggle || !panel) return;

    toggle.addEventListener('click', () => {
      const isHidden = panel.classList.contains('hidden');
      panel.classList.toggle('hidden', !isHidden);
      toggle.setAttribute('aria-expanded', String(isHidden));
      if (isHidden) this.updateCitations(this.currentYear);
    });

    close.addEventListener('click', () => {
      panel.classList.add('hidden');
      toggle.setAttribute('aria-expanded', 'false');
    });
  }

  updateCitations(year) {
    const panel = document.getElementById('citation-panel');
    if (!panel || panel.classList.contains('hidden')) return;
    if (!this.data.sources) return;

    const relevant = this.data.sources.filter(
      s => year >= s.startYear && year <= s.endYear
    );

    const note = document.getElementById('citation-year-note');
    if (note) {
      const abs    = Math.abs(Math.round(year));
      const suffix = year < 0 ? ' BCE' : ' CE';
      note.textContent = `Showing sources relevant to ${abs.toLocaleString()}${suffix}`;
    }

    const list = document.getElementById('citation-list');
    if (!list) return;
    list.innerHTML = '';

    if (relevant.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'citation-item';
      empty.textContent = 'No specific sources for this time period.';
      list.appendChild(empty);
      return;
    }

    relevant.forEach(src => {
      const item = document.createElement('div');
      item.className = 'citation-item';
      item.setAttribute('role', 'listitem');

      const short = document.createElement('span');
      short.className = 'cit-short';
      short.textContent = src.short;

      const full = document.createTextNode(src.full);

      item.appendChild(short);
      item.appendChild(full);

      if (src.doi) {
        const link = document.createElement('a');
        link.href = src.doi;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = 'DOI ↗';
        item.appendChild(link);
      }

      list.appendChild(item);
    });
  }

  // ── Admixture bar chart ───────────────────────────────────────────

  // Ancestry component display config: label, hex color
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

  renderAdmixture(culture) {
    const container = document.getElementById('info-admixture');
    if (!container) return;

    const adm = culture.admixture;
    if (!adm) {
      container.classList.add('hidden');
      return;
    }

    container.classList.remove('hidden');
    container.innerHTML = '';

    const label = document.createElement('div');
    label.className = 'admixture-label';
    label.textContent = 'Ancestry estimate';
    container.appendChild(label);

    const bar = document.createElement('div');
    bar.className = 'admixture-bar';

    const legend = document.createElement('div');
    legend.className = 'admixture-legend';

    PIEMigrationMap.ADMIXTURE_COMPONENTS.forEach(({ key, label: lbl, color }) => {
      const pct = adm[key] || 0;
      if (pct <= 0) return;

      const seg = document.createElement('div');
      seg.className = 'admixture-seg';
      seg.style.width = (pct * 100).toFixed(1) + '%';
      seg.style.background = color;
      seg.title = `${lbl} ${Math.round(pct * 100)}%`;
      bar.appendChild(seg);

      const item = document.createElement('span');
      item.className = 'adm-item';
      const swatch = document.createElement('span');
      swatch.className = 'adm-swatch';
      swatch.style.background = color;
      item.appendChild(swatch);
      item.appendChild(document.createTextNode(`${lbl} ${Math.round(pct * 100)}%`));
      legend.appendChild(item);
    });

    container.appendChild(bar);
    container.appendChild(legend);
  }

  // ── Migration Paths ───────────────────────────────────────────────

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

  updateMigrations(year) {
    for (const _familyData of Object.values(this.activeFamilies)) {
    _familyData.migrations.forEach(mig => {
      const { polyline, arrow } = this.migrationLayers[mig.id];
      const branchVis = this.branchVisible[mig.branch];

      const visible = branchVis && year >= mig.startYear && year <= mig.endYear;

      if (!visible) {
        polyline.setStyle({ opacity: 0, fillOpacity: 0 });
        arrow.setOpacity(0);
        return;
      }

      const progress = this.getMigrationProgress(mig, year);
      const partial  = this.getPartialPath(mig.path, progress);

      if (partial.length < 2) {
        polyline.setStyle({ opacity: 0 });
        arrow.setOpacity(0);
        return;
      }

      polyline.setLatLngs(partial);

      // Opacity: fade in at start, solid during animation, slightly dim after completion
      let opacity;
      if (year < mig.animateStart) {
        opacity = 0;
      } else if (year < mig.animateEnd) {
        opacity = 0.85;
      } else {
        opacity = 0.45; // dimmer after completed — shows historical path
      }

      polyline.setStyle({ opacity, dashArray: progress < 1 ? '8 6' : '6 4' });

      // Arrow at the tip of the partial path
      const tip     = partial[partial.length - 1];
      const prev    = partial[partial.length - 2];
      const bearing = this.bearing(prev, tip);
      arrow.setLatLng(tip);
      arrow.setOpacity(opacity);
      arrow.setIcon(L.divIcon({
        className: '',
        html:      this.arrowHtml(mig.branch, bearing),
        iconSize:  [14, 14],
        iconAnchor:[7, 7],
      }));
    }); // end forEach mig
    } // end for activeFamilies
  }

  getMigrationProgress(mig, year) {
    if (year <= mig.animateStart) return 0;
    if (year >= mig.animateEnd)   return 1;
    return (year - mig.animateStart) / (mig.animateEnd - mig.animateStart);
  }

  getPartialPath(fullPath, progress) {
    if (progress <= 0) return [fullPath[0], fullPath[0]];
    if (progress >= 1) return fullPath;

    const totalSegments  = fullPath.length - 1;
    const floatIdx       = progress * totalSegments;
    const completed      = Math.floor(floatIdx);
    const segProgress    = floatIdx - completed;

    const result = fullPath.slice(0, completed + 1);

    if (completed < fullPath.length - 1) {
      const from = fullPath[completed];
      const to   = fullPath[completed + 1];
      result.push([
        from[0] + (to[0] - from[0]) * segProgress,
        from[1] + (to[1] - from[1]) * segProgress,
      ]);
    }
    return result;
  }

  bearing(from, to) {
    const lat1 = from[0] * Math.PI / 180;
    const lat2 = to[0]   * Math.PI / 180;
    const dLon = (to[1] - from[1]) * Math.PI / 180;
    const y    = Math.sin(dLon) * Math.cos(lat2);
    const x    = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
  }

  arrowHtml(branch, bearing) {
    const b = this._getBranch(branch);
    const color = b ? b.color : '#888888';
    return `<div style="
      width:0; height:0;
      border-left:6px solid transparent;
      border-right:6px solid transparent;
      border-bottom:13px solid ${color};
      transform:rotate(${bearing}deg);
      transform-origin:center;
      filter:drop-shadow(0 0 3px ${color}88);
    "></div>`;
  }

  // ── Info Panel ────────────────────────────────────────────────────

  showInfo(culture) {
    const branch   = this.data.branches[culture.branch];
    const genetics = this.data.genetics[culture.branch] || '';

    document.getElementById('info-branch-tag').textContent   = branch.name;
    document.getElementById('info-branch-tag').style.background = branch.color + '33';
    document.getElementById('info-branch-tag').style.color      = branch.color;
    document.getElementById('info-branch-tag').style.border     = `1px solid ${branch.color}66`;

    document.getElementById('info-name').textContent  = culture.name;
    document.getElementById('info-name').style.color  = branch.color;

    const startStr = `${Math.abs(culture.startYear).toLocaleString()} ${culture.startYear < 0 ? 'BCE' : 'CE'}`;
    const endStr   = `${Math.abs(culture.endYear).toLocaleString()} ${culture.endYear < 0 ? 'BCE' : 'CE'}`;
    document.getElementById('info-dates').textContent = `${startStr} – ${endStr}`;

    document.getElementById('info-desc').textContent    = culture.description;
    document.getElementById('info-genetics').textContent = genetics ? '🧬 ' + genetics : '';
    this.renderAdmixture(culture);

    const panel = document.getElementById('info-panel');
    panel.classList.remove('hidden');
    panel.setAttribute('aria-hidden', 'false');
    // Move focus to close button so keyboard users can immediately dismiss
    document.getElementById('info-close').focus();
  }

  hideInfo() {
    const panel = document.getElementById('info-panel');
    panel.classList.add('hidden');
    panel.setAttribute('aria-hidden', 'true');
  }
}

// ── Inject label CSS ──────────────────────────────────────────────

const labelStyle = document.createElement('style');
labelStyle.textContent = `
  .culture-label {
    font-family: Georgia, serif;
    font-size: 10px;
    font-weight: bold;
    letter-spacing: 0.04em;
    white-space: nowrap;
    text-shadow:
      0 0 4px #0d0d1a,
      0 0 8px #0d0d1a,
      1px 1px 0 #0d0d1a,
     -1px -1px 0 #0d0d1a,
      1px -1px 0 #0d0d1a,
     -1px  1px 0 #0d0d1a;
    pointer-events: none;
    transform: translate(-50%, -50%);
    position: relative;
    left: 0; top: 0;
  }
`;
document.head.appendChild(labelStyle);

// ── Bootstrap ─────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  // ── Splash page (first visit only, localStorage) ─────────────────
  const splash = document.getElementById('splash-overlay');
  const disclaimerOverlay = document.getElementById('disclaimer-overlay');
  if (splash) {
    if (localStorage.getItem('splash-dismissed')) {
      // Returning visitor — skip splash entirely
      splash.classList.add('hidden');
    } else {
      // First visit — hide disclaimer until splash is dismissed
      if (disclaimerOverlay) disclaimerOverlay.classList.add('hidden');
      document.getElementById('splash-enter').addEventListener('click', () => {
        localStorage.setItem('splash-dismissed', '1');
        splash.classList.add('leaving');
        splash.addEventListener('animationend', () => {
          splash.classList.add('hidden');
          splash.classList.remove('leaving');
          // Show disclaimer after splash (also first visit, so not yet dismissed)
          if (disclaimerOverlay && !sessionStorage.getItem('disclaimer-dismissed')) {
            disclaimerOverlay.classList.remove('hidden');
          }
        }, { once: true });
      });
    }
  }

  // ── Disclaimer overlay ───────────────────────────────────────────
  const overlay = document.getElementById('disclaimer-overlay');
  if (overlay) {
    if (sessionStorage.getItem('disclaimer-dismissed')) {
      overlay.classList.add('hidden');
    }
    document.getElementById('disclaimer-dismiss').addEventListener('click', () => {
      overlay.classList.add('hidden');
      sessionStorage.setItem('disclaimer-dismissed', '1');
    });
  }

  // ── Dataset registry ─────────────────────────────────────────────
  DATASETS.pie = PIE_DATA;
  if (typeof CIVILIZATIONS_DATA !== 'undefined') {
    DATASETS.civilizations = CIVILIZATIONS_DATA;
  }

  // ── Map ──────────────────────────────────────────────────────────
  const app = new PIEMigrationMap(PIE_DATA);

  // Close info panel
  document.getElementById('info-close').addEventListener('click', () => {
    app.hideInfo();
  });

  // Click on empty map area closes info
  app.map.on('click', (e) => {
    if (!e.originalEvent.target.closest('.territory-circle')) {
      app.hideInfo();
    }
  });
});
