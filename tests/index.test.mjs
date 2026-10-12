// Dependency-free guards for index.html (bugs + accessibility).
// Run: node --test tests/index.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

function lum(hex) {
  const c = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map(v => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
function contrast(a, b) {
  const [x, y] = [lum(a), lum(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
function rule(selector) {
  const i = html.indexOf(selector + ' {');
  assert.ok(i >= 0, `CSS rule ${selector} not found`);
  return html.slice(i, html.indexOf('}', i));
}
function gradientStops(selector) {
  const m = rule(selector).match(/linear-gradient\(135deg,\s*(#[0-9a-f]{6}),\s*(#[0-9a-f]{6})\)/i);
  assert.ok(m, `no gradient in ${selector}`);
  return [m[1], m[2]];
}

test('page language is Greek', () => {
  assert.match(html, /<html lang="el">/);
});

test('white button text meets WCAG AA (4.5:1) on every gradient stop, day and night', () => {
  for (const sel of ['.pill', '#night-btn', 'body.night #night-btn']) {
    for (const stop of gradientStops(sel)) {
      assert.ok(contrast('#ffffff', stop) >= 4.5, `${sel} ${stop}: ${contrast('#ffffff', stop).toFixed(2)}`);
    }
  }
});

test('celebration subtitle meets AA on all background stops', () => {
  const fg = rule('#cele-sub').match(/color:\s*(#[0-9a-f]{6})/i)[1];
  for (const bg of ['#ffd6ec', '#d8b4fe', '#fef08a']) {
    assert.ok(contrast(fg, bg) >= 4.5, `${fg} on ${bg}`);
  }
});

test('colour name in the info box is not drawn in the (low-contrast) monster colour', () => {
  assert.doesNotMatch(html, /<b style="color:\$\{hex\}">/);
});

test('monsters are keyboard reachable and named', () => {
  assert.match(html, /setAttribute\('role', 'button'\)/);
  assert.match(html, /setAttribute\('tabindex', '0'\)/);
  assert.match(html, /setAttribute\('aria-label', /);
  assert.match(html, /addEventListener\('keydown'/);
});

test('visible focus and reduced-motion support exist', () => {
  assert.match(html, /\.monster:focus-visible/);
  assert.match(html, /@media \(prefers-reduced-motion: reduce\)/);
});

test('a new wave cancels pending spawns and ignores catches from the old wave', () => {
  assert.match(html, /spawnTimers\.forEach\(clearTimeout\)/);
  assert.match(html, /if \(wave !== String\(waveId\)\) return;/);
});
