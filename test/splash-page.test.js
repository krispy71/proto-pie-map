const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');

function read(relativePath) {
  return readFileSync(path.join(root, relativePath), 'utf8');
}

const files = {
  app: read('public/app.js'),
  architecture: read('docs/ARCHITECTURE.md'),
  checklist: read('docs/PRE-LAUNCH-CHECKLIST.md'),
  claude: read('CLAUDE.md'),
  html: read('public/index.html'),
  roadmap: read('docs/ROADMAP.md'),
  styles: read('public/style.css'),
};

function assertIncludes(source, expected, message) {
  assert.ok(source.includes(expected), message || `Expected source to include "${expected}"`);
}

test('splash page test is anchored to project docs and CLAUDE.md constraints', () => {
  assertIncludes(files.claude, 'No build step');
  assertIncludes(files.claude, 'all visualisation logic runs client-side');
  assertIncludes(files.architecture, 'No Frontend Framework');
  assertIncludes(files.architecture, 'public/index.html');
  assert.match(files.roadmap, /Disclaimer overlay[\s\S]*sessionStorage/);
  assert.match(files.checklist, /Territorial extents[\s\S]*schematic approximations/);
});

test('splash dialog markup is accessible and matches the documented product surface', () => {
  assert.match(
    files.html,
    /<div id="splash-overlay" role="dialog" aria-modal="true" aria-labelledby="splash-title">/
  );
  assert.match(files.html, /<h1 id="splash-title">YAMNAYA<\/h1>/);
  assert.match(files.html, /<button id="splash-enter" autofocus>Explore the Map/);
  assert.match(files.html, /<span class="splash-dataset-label">PIE Migrations<\/span>/);
  assert.match(files.html, /<span class="splash-dataset-label">World Civilizations<\/span>/);
  assert.match(files.html, /Territorial extents are schematic approximations/);
  assert.match(files.html, /Dates subject to scholarly revision/);
});

test('splash dismissal persists once ever and then reveals the session disclaimer', () => {
  assertIncludes(files.app, "localStorage.getItem('splash-dismissed')");
  assertIncludes(files.app, "localStorage.setItem('splash-dismissed', '1')");
  assert.match(files.app, /localStorage\.getItem\('splash-dismissed'\)[\s\S]*splash\.classList\.add\('hidden'\)/);
  assert.match(files.app, /if \(disclaimerOverlay\) disclaimerOverlay\.classList\.add\('hidden'\)/);
  assert.match(files.app, /splash\.addEventListener\('animationend'[\s\S]*disclaimerOverlay\.classList\.remove\('hidden'\)/);
  assert.match(files.app, /sessionStorage\.getItem\('disclaimer-dismissed'\)/);
});

test('disclaimer remains a session-only notice and does not introduce cookies', () => {
  assertIncludes(files.app, "sessionStorage.setItem('disclaimer-dismissed', '1')");
  assert.doesNotMatch(files.app, /document\.cookie/);
  assert.match(files.styles, /#splash-overlay\.hidden\s*{\s*display:\s*none;\s*}/);
  assert.match(files.styles, /#disclaimer-overlay\.hidden\s*{\s*display:\s*none;\s*}/);
});
