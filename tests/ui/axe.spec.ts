// axe-core on the game: serious/critical violations = 0, day + night, 360 px (phone) and 1280 px (desktop),
// with the whole first wave of monsters out. Report only: a violation in the kids' code is not fixed here
// (GAME-STANDARD §9) but marked test.fail('APP BUG CYBELE-T<n>: ...') and listed in
// D:\Git\.claude\FIX-CYBELE-TESTBUGS-2026-10-22.md.
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { monsterLayout, openGame } from './helpers';

// No seed (2026-11-16): index.html keeps monsters apart now (spacing.spec.ts: 300 seeded waves per width), so every
// test here runs on a real random wave. Until then the game placed them at random, they often landed on top of each
// other (axe target-size on 142/300 waves at 360 px, 38/300 at 1280 px) and the axe tests had to use a fixed seed.
const LOADS = 10;

test(`${LOADS} unseeded loads at 360 and 1280: no monster on top of another, axe target-size clean`, async ({ page }) => {
  const bad: string[] = [];
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [360, 1280]) {
    await page.setViewportSize({ width, height: 800 });
    for (let i = 0; i < LOADS; i++) {
      await openGame(page); // a fresh page load, so a fresh random wave
      const { overlaps } = await monsterLayout(page);
      if (overlaps.length) bad.push(`${width} load ${i}: overlap ${JSON.stringify(overlaps)}`);
      const { violations } = await new AxeBuilder({ page }).withRules(['target-size']).analyze();
      for (const v of violations) bad.push(`${width} load ${i}: ${v.id} ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`);
    }
  }
  expect(bad).toEqual([]);
});

// [mode, width] -> known app bug (the test must fail until the fix run removes the entry).
const KNOWN: Record<string, string> = {};

for (const mode of ['day', 'night'] as const) {
  for (const width of [360, 1280]) {
    const id = `${mode} ${width}`;
    test(`axe serious/critical = 0: ${id}`, async ({ page }) => {
      if (KNOWN[id]) test.fail(true, KNOWN[id]);
      await page.setViewportSize({ width, height: 800 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await openGame(page);
      if (mode === 'night') {
        await page.locator('#night-btn').click();
        await expect(page.locator('body')).toHaveClass(/\bnight\b/);
      }
      const { violations } = await new AxeBuilder({ page }).analyze();
      const bad = violations
        .filter((v) => v.impact === 'serious' || v.impact === 'critical')
        .map((v) => `${v.impact} ${v.id}: ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`);
      expect(bad).toEqual([]);
    });
  }
}

// WCAG 2.x A/AA rules at every impact (axe rates some AA failures only «moderate», so the gate above misses them).
// Accepted exception, exactly one: axe `meta-viewport` on the viewport <meta> (`user-scalable=no`, WCAG 1.4.4).
// OWNER DECISION 10 (2026-10-22, D:\Git\.claude\HANDOFF.md «OWNER DECISIONS»): it stays on purpose, so a
// small child's hands do not zoom the page by accident while tapping fast. README «Γνωστοί περιορισμοί».
// Every other rule, and meta-viewport on any other node, still fails this test.
const ACCEPTED_RULE = 'meta-viewport';
const ACCEPTED_TARGET = 'meta[name="viewport"]';

test('axe WCAG 2 A/AA, any impact = 0 (except owner-accepted meta-viewport): day 1280', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openGame(page);
  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  const bad = violations.flatMap((v) => {
    const nodes = v.id === ACCEPTED_RULE ? v.nodes.filter((n) => n.target.join(' ') !== ACCEPTED_TARGET) : v.nodes;
    return nodes.length ? [`${v.impact} ${v.id}: ${nodes.map((n) => n.target.join(' ')).join(' | ')}`] : [];
  });
  expect(bad).toEqual([]);
});
