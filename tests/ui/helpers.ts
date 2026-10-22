// Shared by smoke.spec.ts and axe.spec.ts.
import { expect, type Page } from '@playwright/test';

export const URL = '/cybele/index.html';

/** Collects everything that must stay empty: console errors, page errors, CSP violations. */
export async function watch(page: Page) {
  const problems: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') problems.push(`console: ${m.text()} ${m.location().url || ''}`.trim());
  });
  page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
  await page.addInitScript(() => {
    document.addEventListener('securitypolicyviolation', (e) => {
      console.error(`CSP violation: ${e.violatedDirective} ${e.blockedURI}`);
    });
  });
  return problems;
}

/** Opens the game and waits until the whole first wave is out (6-10 monsters, one every 120 ms). */
export async function openGame(page: Page) {
  const res = await page.goto(URL);
  await expect(page.locator('#counter')).toHaveText('Έπιασες 0 δαιμονάκια! 🎉');
  await expect.poll(() => page.locator('#arena .monster').count()).toBeGreaterThanOrEqual(6);
  await page.waitForTimeout(1300);
  return res;
}

export const said = (n: number) => `Έπιασες ${n} δαιμονάκια! 🎉`;
