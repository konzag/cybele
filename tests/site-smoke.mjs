// site-smoke.mjs — γρήγοροι έλεγχοι για το site της Κυβελίτσας (χωρίς εξαρτήσεις):
//   1. Κάθε τοπικός σύνδεσμος (href/src) δείχνει σε αρχείο που υπάρχει.
//   2. Καμία γραμματοσειρά δεν φορτώνεται από τη Google (όλες είναι στο assets/fonts/).
//   3. Το localStorage αγγίζεται ΜΟΝΟ από το assets/storage.js.
//   4. Το storage.js δεν «σπάει» όταν ο browser απαγορεύει ή γεμίζει την αποθήκευση,
//      και το «βιβλίο με αυτοκόλλητα» κρατάει σωστά τα δαιμονάκια.
//   5. Υπάρχει κανόνας prefers-reduced-motion (για παιδιά που ζαλίζονται με κινήσεις).
//   6. Δεν γράφουμε HTML με template strings μέσα σε innerHTML.
//   7. Το og:url δείχνει στη σωστή διεύθυνση.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

const pages = ['index.html'];
const SITE = 'https://konzag.github.io/cybele/';

for (const page of pages) {
  const html = read(page);
  const dir = path.dirname(path.join(root, page));

  // 1. τοπικοί σύνδεσμοι
  const refs = [...html.matchAll(/\b(?:href|src)="([^"]+)"/g)].map((m) => m[1]);
  for (const ref of refs) {
    if (/^(https?:|data:|mailto:|#)/.test(ref)) continue;
    const target = path.resolve(dir, ref.split('#')[0].split('?')[0]);
    assert.ok(fs.existsSync(target), `${page}: local link "${ref}" exists`);
  }

  // 2. όχι Google Fonts
  assert.doesNotMatch(html, /fonts\.(googleapis|gstatic)\.com/, `${page}: no Google Fonts`);
  assert.match(html, /assets\/fonts\/fonts\.css/, `${page}: loads the self-hosted fonts`);

  // 3. localStorage μόνο μέσω storage.js
  const code = html.replace(/\/\/.*$/gm, '');
  assert.doesNotMatch(code, /localStorage/, `${page} uses CybeleStorage, not raw localStorage`);
  if (/CybeleStorage\./.test(html)) {
    assert.match(html, /<script src="(\.\.\/)?assets\/storage\.js"><\/script>/, `${page} loads assets/storage.js`);
  }

  // 5. reduced motion (CSS και JS)
  assert.match(html, /@media \(prefers-reduced-motion: reduce\)/, `${page}: has a reduced-motion CSS rule`);
  assert.match(html, /matchMedia\('\(prefers-reduced-motion: reduce\)'\)/, `${page}: JS checks reduced motion`);

  // 6. όχι innerHTML με template strings / συνένωση
  assert.doesNotMatch(html, /innerHTML\s*=\s*(`|[^;'"\n]*\+)/, `${page}: no innerHTML built from strings`);
  assert.doesNotMatch(html, /showInfo\(`/, `${page}: showInfo gets data, not an HTML string`);

  // 7. og:url
  const og = html.match(/<meta property="og:url" content="([^"]+)"/);
  if (og) assert.equal(og[1], SITE + (page === 'index.html' ? '' : page), `${page}: og:url`);
}

// Οι γραμματοσειρές: κάθε αρχείο που αναφέρει το fonts.css υπάρχει, και υπάρχει η άδεια OFL.
const fontsCss = read('assets/fonts/fonts.css');
for (const [, file] of fontsCss.matchAll(/url\(['"]?([^'")]+)['"]?\)/g)) {
  assert.ok(fs.existsSync(path.join(root, 'assets/fonts', file)), `fonts.css: ${file} exists`);
}
assert.match(fontsCss, /U\+0370/, 'fonts.css declares the Greek subset');
for (const lic of ['OFL-comfortaa.txt', 'OFL-didact-gothic.txt']) {
  assert.match(read('assets/fonts/' + lic), /SIL Open Font License/, `${lic} present`);
}

// 4. storage.js με «χαλασμένο» localStorage
const storageSrc = read('assets/storage.js');
function loadStorage(localStorage) {
  const window = { localStorage };
  vm.runInNewContext(storageSrc, { window, console: { warn() {} }, JSON, Math, Array, Number });
  return window.CybeleStorage;
}
const throwing = loadStorage({
  getItem() { throw new Error('SecurityError'); },
  setItem() { throw new Error('QuotaExceededError'); },
  removeItem() { throw new Error('SecurityError'); },
});
assert.deepEqual([...throwing.readJson('k', [])], [], 'readJson falls back when storage throws');
assert.equal(throwing.writeJson('k', [1]), false, 'writeJson reports failure instead of throwing');
assert.deepEqual([...throwing.getStickers()], [], 'getStickers falls back to an empty book');
assert.doesNotThrow(() => throwing.addSticker('👾'), 'addSticker never throws');
assert.doesNotThrow(() => throwing.clearStickers(), 'clearStickers never throws');

const mem = new Map();
const working = loadStorage({
  getItem: (k) => (mem.has(k) ? mem.get(k) : null),
  setItem: (k, v) => mem.set(k, String(v)),
  removeItem: (k) => mem.delete(k),
});
assert.equal(working.writeJson('k', { a: 1 }), true);
assert.deepEqual(working.readJson('k', null), { a: 1 });
mem.set('bad', '{not json');
assert.deepEqual(working.readJson('bad', {}), {}, 'corrupt JSON falls back');

working.addSticker('👾');
working.addSticker('🐸');
assert.deepEqual([...working.getStickers()], ['👾', '🐸'], 'stickers are kept in order');
for (let i = 0; i < working.MAX_STICKERS + 10; i++) working.addSticker('⭐');
assert.equal(working.getStickers().length, working.MAX_STICKERS, 'the sticker book is capped');
mem.set(working.STICKER_KEY, '{"not":"a list"}');
assert.deepEqual([...working.getStickers()], [], 'a corrupt sticker book reads as empty');
working.addSticker('🦊');
working.clearStickers();
assert.deepEqual([...working.getStickers()], [], 'clearStickers empties the book');

console.log('site-smoke: ok');
