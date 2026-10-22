// game-logic.test.mjs — the wave / catch / counter rules of index.html, in the fake browser with fake timers.
// Run: node --test tests/*.test.mjs
//   The page code is not changed (GAME-STANDARD §9): the tests only call its own functions and read what the
//   child sees (the counter text, the celebration screen, the monsters in the arena).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { loadPage } from './helpers/fake-dom.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// One page per test. spawnWave() already ran on load; its monsters appear every 120 ms (at most 10 -> 1080 ms).
function game() {
  const page = loadPage(root, 'index.html');
  const { window: win, document: d, clock, all } = page;
  const state = (name) => vm.runInContext(name, win); // the page's own `let` variables
  const arena = d.getElementById('arena');
  const isMonster = (el) => el.classList.contains('monster');
  return {
    win, d, clock, state,
    counter: () => d.getElementById('counter').textContent,
    // monsters of the current wave that are still in the arena
    live: () => arena.children.filter((el) => isMonster(el) && el.dataset.wave === String(state('waveId'))),
    created: () => all.filter(isMonster).length, // every monster element ever made
    celebrating: () => d.getElementById('celebration').classList.contains('show'),
  };
}
const said = (n) => `Έπιασες ${n} δαιμονάκια! 🎉`;
// celebrate() stays real; we only count how often it ran.
function countCelebrations(win) {
  const real = win.celebrate;
  const calls = [];
  win.celebrate = (...args) => { calls.push(args); return real(...args); };
  return calls;
}

test('catching every monster of a wave updates the counter and celebrates once', () => {
  const g = game();
  const celebrations = countCelebrations(g.win);
  assert.equal(g.counter(), said(0));
  g.clock.advance(2000); // every monster of the wave is out
  const total = g.state('totalSpawned');
  const monsters = g.live();
  assert.ok(total >= 6 && total <= 10, `wave size ${total}`);
  assert.equal(monsters.length, total, 'all monsters of the wave appeared');

  monsters.forEach((m, i) => {
    g.win.catchMonster(m);
    g.clock.advance(500); // the pop animation, then the point
    assert.equal(g.counter(), said(i + 1));
    assert.equal(celebrations.length, i + 1 === total ? 1 : 0, `celebrations after ${i + 1} of ${total}`);
  });
  assert.equal(g.celebrating(), true, 'the celebration screen is shown');
  assert.equal(g.live().length, 0, 'the arena is empty');

  const before = g.created();
  g.clock.advance(10_000);
  assert.equal(g.created(), before, 'no extra wave before playAgain');
  assert.equal(celebrations.length, 1);
  assert.equal(g.counter(), said(total));
});

test('the same monster caught twice counts once', () => {
  const g = game();
  g.clock.advance(2000);
  const [m, other] = g.live();
  g.win.catchMonster(m);
  g.win.catchMonster(m); // second tap while it pops
  m.click(); // and a click
  m.dispatch('keydown', { key: 'Enter' }); // and the keyboard
  g.clock.advance(500);
  assert.equal(g.counter(), said(1));
  g.win.catchMonster(m); // after it is gone
  g.clock.advance(500);
  assert.equal(g.counter(), said(1));
  other.dispatch('keydown', { key: ' ' }); // Space catches a different one
  g.clock.advance(500);
  assert.equal(g.counter(), said(2));
});

test('playAgain resets the counter and clears old timers', () => {
  const g = game();
  g.clock.advance(130); // only the first 2 monsters are out, the rest are still pending
  const [first, second] = g.live();
  assert.ok(first && second);
  g.win.catchMonster(first);
  g.clock.advance(500);
  assert.equal(g.counter(), said(1));

  g.win.catchMonster(second); // its point is still pending (480 ms) when the new wave starts
  const before = g.created();
  g.win.playAgain();
  assert.equal(g.counter(), said(0), 'counter back to 0');
  g.clock.advance(3000);
  const total = g.state('totalSpawned');
  assert.equal(g.created() - before, total, 'only the new wave appears (no pending spawn from the old wave)');
  assert.equal(g.live().length, total);
  assert.equal(g.counter(), said(0), 'the old catch did not count in the new wave');
  g.win.catchMonster(first); // an old monster element can no longer score
  g.clock.advance(500);
  assert.equal(g.counter(), said(0));
  g.win.catchMonster(g.live()[0]);
  g.clock.advance(500);
  assert.equal(g.counter(), said(1));
});

test('night mode keeps the game playable', () => {
  const g = game();
  g.win.requestAnimationFrame = (fn) => { fn(0); return 1; }; // run the throttled light update at once
  const light = () => g.d.body.style['--flashlight'] || '';
  g.win.updateFlashlight(100, 200);
  assert.equal(light(), '', 'no flashlight by day');

  g.win.toggleNight();
  assert.equal(g.d.body.classList.contains('night'), true);
  assert.equal(g.d.getElementById('night-btn').textContent, '☀️ Μέρα');
  g.win.updateFlashlight(100, 200);
  assert.match(light(), /at 100px 200px/);
  g.win.updateFlashlight(300, 50);
  assert.match(light(), /at 300px 50px/, 'the light follows the finger');

  g.clock.advance(2000);
  const [m] = g.live();
  m.click();
  g.clock.advance(500);
  assert.equal(g.counter(), said(1), 'catching still counts at night');

  g.win.toggleNight();
  assert.equal(g.d.body.classList.contains('night'), false);
  assert.equal(g.d.getElementById('night-btn').textContent, '🌙 Νύχτα');
});
