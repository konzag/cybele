// axe-core on the game: serious/critical violations = 0, day + night, 360 px (phone) and 1280 px (desktop),
// with the whole first wave of monsters out. Report only: a violation in the kids' code is not fixed here
// (GAME-STANDARD §9) but marked test.fail('APP BUG CYBELE-T<n>: ...') and listed in
// D:\Git\.claude\FIX-CYBELE-TESTBUGS-2026-10-22.md.
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { openGame } from './helpers';

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
test('axe WCAG 2 A/AA, any impact = 0: day 1280', async ({ page }) => {
  test.fail(
    true,
    'APP BUG CYBELE-T1: <meta name="viewport" ... user-scalable=no> blocks pinch zoom ' +
      '(axe meta-viewport, WCAG 1.4.4 Resize Text AA, impact moderate)',
  );
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openGame(page);
  const { violations } = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(violations.map((v) => `${v.impact} ${v.id}`)).toEqual([]);
});
