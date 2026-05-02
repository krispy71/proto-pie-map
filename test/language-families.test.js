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
