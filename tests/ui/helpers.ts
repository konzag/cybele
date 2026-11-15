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

/** Replaces the page's Math.random with a seeded generator (mulberry32) before the game's script runs, so the wave
 *  (how many monsters, which ones, where) is the same on every run. The game's code is not changed (GAME-STANDARD
 *  §9): it places monsters at random and two of them can land on top of each other; axe then reports the hidden one
 *  as `target-size` (serious). That made axe.spec.ts fail at random on CI (main 2026-11-11, run 43086347778). */
export async function seedRandom(page: Page, seed: number) {
  await page.addInitScript((s) => {
    let a = s >>> 0;
    Math.random = () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }, seed);
}

/** Boxes of the live monsters, and the pairs (by index) whose boxes overlap. */
export async function monsterLayout(page: Page) {
  return page.evaluate(() => {
    const boxes = [...document.querySelectorAll<HTMLElement>('#arena .monster:not(.pop)')].map((m) => {
      const r = m.getBoundingClientRect();
      return { emoji: m.textContent, x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) };
    });
    const overlaps: [number, number][] = [];
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i], b = boxes[j];
        if (a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h) overlaps.push([i, j]);
      }
    }
    return { boxes, overlaps };
  });
}
