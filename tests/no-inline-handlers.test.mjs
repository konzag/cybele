// no-inline-handlers.test.mjs — CSP guard + the main buttons still work.
// Run: node --test tests/*.test.mjs
//   1. No served file has an inline event handler (onclick="…" etc.): the games hub can drop 'unsafe-hashes'.
//   2. The page runs in a fake browser and each main button calls its game function.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadPage, spyOn, servedFiles, findInlineHandlers } from './helpers/fake-dom.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('no inline event-handler attributes in served files', () => {
  assert.ok(servedFiles(root).includes('index.html'));
  assert.deepEqual(findInlineHandlers(root), []);
});

test('main buttons call the game functions', () => {
  for (const [id, fn] of [
    ['play-again-btn', 'playAgain'],
    ['night-btn', 'toggleNight'],
    ['wave-btn', 'spawnWave'],
  ]) {
    const page = loadPage(root, 'index.html');
    const calls = spyOn(page.window, fn);
    page.document.getElementById(id).click();
    assert.deepEqual(calls, [[]], `${id} -> ${fn}()`);
  }
});

test('night button really switches night mode on and off', () => {
  const { document: d } = loadPage(root, 'index.html');
  const night = () => d.body.classList.contains('night');
  assert.equal(night(), false);
  d.getElementById('night-btn').click();
  assert.equal(night(), true);
  d.getElementById('night-btn').click();
  assert.equal(night(), false);
});
