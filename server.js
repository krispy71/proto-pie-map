const express      = require('express');
const path         = require('path');
const helmet       = require('helmet');
const morgan       = require('morgan');
const rateLimit    = require('express-rate-limit');
const compression  = require('compression');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Logging ──────────────────────────────────────────────────────────
// IP addresses are personal data under GDPR. Anonymise by zeroing the last
// IPv4 octet (1.2.3.4 → 1.2.3.0) and masking the last 64 bits of IPv6.
function anonymizeIp(ip) {
  if (!ip) return '-';
  const v4 = ip.replace(/(\d+\.\d+\.\d+\.)\d+$/, '$10');
  if (v4 !== ip) return v4;
  // IPv6 — zero the last four groups (interface identifier)
  return ip.replace(/([\da-f]*:){4}[\da-f:]*/i, '0:0:0:0');
}
morgan.token('anon-addr', req => anonymizeIp(req.ip || req.socket.remoteAddress));

const MORGAN_FORMAT = process.env.NODE_ENV === 'production'
  // Combined-style but with anonymised IP
  ? ':anon-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"'
  : 'dev';

app.use(morgan(MORGAN_FORMAT));

// ── Compression ───────────────────────────────────────────────────────
// Gzip/Brotli for all text responses — reduces data.js from ~70KB to ~18KB
app.use(compression());

// ── Security headers (helmet) ────────────────────────────────────────
// Leaflet is now served locally from /lib/ — no unpkg.com required in CSP
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc:  ["'self'"],
        scriptSrc:   ["'self'"],
        styleSrc:    ["'self'", "'unsafe-inline'"],  // unsafe-inline required for Leaflet's injected pane styles
        imgSrc:      ["'self'", "data:", "https://*.basemaps.cartocdn.com",
                      "https://*.tile.opentopomap.org",
                      "https://server.arcgisonline.com"],
        connectSrc:  ["'self'"],
        fontSrc:     ["'self'"],
        objectSrc:   ["'none'"],
        frameAncestors: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false, // Required for Leaflet tile cross-origin images
  })
);

// ── Rate limiting ────────────────────────────────────────────────────
// 300 requests / 15 min per IP — generous for a map that loads once
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max:      300,
    standardHeaders: true,
    legacyHeaders:   false,
    message: { error: 'Too many requests — please try again in a few minutes.' },
  })
);

// ── Static files ─────────────────────────────────────────────────────
app.use(
  express.static(path.join(__dirname, 'public'), {
    maxAge:  process.env.NODE_ENV === 'production' ? '1d' : 0,
    etag:    true,
    index:   'index.html',
  })
);

// ── Explicit index route ─────────────────────────────────────────────
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ── 404 handler ──────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).type('text').send('Not found');
});

// ── 500 handler ──────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).type('text').send('Internal server error');
});

// ── Start ────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`PIE Migration Map running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});
