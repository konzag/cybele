// Playwright smoke (GAME-STANDARD §9: the old games get the hub shell only and are not rewritten).
// The game opens at /cybele/ under the hub's CSP with 0 console errors and shows 🏠 + 🔊 of hub-shell.js;
// 3 monsters are caught by mouse, by tap on a tablet and by keyboard; night mode goes on and off.
// Reduced motion keeps the floating monsters still, so a click lands where the child would aim.
import { expect, test, type Page } from '@playwright/test';
import { URL, openGame, said, watch } from './helpers';

test.use({ reducedMotion: 'reduce' });

/** Centre of a live monster that is really on top at its centre (not under another monster or the hub shell). */
async function aim(page: Page) {
  const point = await page.evaluate(() => {
    for (const m of document.querySelectorAll<HTMLElement>('#arena .monster:not(.pop)')) {
      const r = m.getBoundingClientRect();
      const x = r.left + r.width / 2;
      const y = r.top + r.height / 2;
      if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) continue;
      if (document.elementFromPoint(x, y) === m) return { x, y };
    }
    return null;
  });
  expect(point, 'a monster the child can hit').not.toBeNull();
  return point!;
}

test('index opens under the hub CSP with 0 console errors and shows 🏠 + 🔊 of the hub shell', async ({ page }) => {
  const problems = await watch(page);
  const res = await openGame(page);
  expect(res?.status()).toBe(200);
  expect(res?.headers()['content-security-policy']).toContain("default-src 'none'");
  await expect(page.locator('#hub-shell')).toBeVisible();
  const home = page.getByRole('link', { name: 'Πίσω στα παιχνίδια' });
  await expect(home).toBeVisible();
  await expect(home).toHaveText('🏠');
  await expect(home).toHaveAttribute('href', '/');
  const sound = page.locator('#hub-shell button[aria-label="Ήχος"]');
  await expect(sound).toBeVisible();
  await expect(sound).toHaveText('🔊');
  await expect(page.getByRole('button', { name: /Πιάσε το δαιμονάκι/ }).first()).toBeVisible();
  await page.waitForLoadState('networkidle');
  expect(problems).toEqual([]);
});

test('catch 3 monsters by mouse', async ({ page }) => {
  const problems = await watch(page);
  await openGame(page);
  for (let n = 1; n <= 3; n++) {
    const { x, y } = await aim(page);
    await page.mouse.click(x, y);
    await expect(page.locator('#counter')).toHaveText(said(n));
    await expect(page.locator('#info-box')).toContainText('ΑΡΙΘΜΟΣ');
  }
  expect(problems).toEqual([]);
});

test.describe('tablet 1180x820', () => {
  test.use({ viewport: { width: 1180, height: 820 }, hasTouch: true, isMobile: true });

  test('catch 3 monsters by tap', async ({ page }) => {
    const problems = await watch(page);
    await openGame(page);
    for (let n = 1; n <= 3; n++) {
      const { x, y } = await aim(page);
      await page.touchscreen.tap(x, y);
      await expect(page.locator('#counter')).toHaveText(said(n));
    }
    expect(problems).toEqual([]);
  });
});

/** Presses Tab until a live monster has the focus (keyboard only, like a child without a mouse). */
async function tabToMonster(page: Page, max = 30) {
  for (let i = 0; i < max; i++) {
    if (await page.evaluate(() => !!document.activeElement?.matches('#arena .monster:not(.pop)'))) return;
    await page.keyboard.press('Tab');
  }
  throw new Error('Tab never reached a monster');
}

test('catch 3 monsters by keyboard (Tab + Enter on a focused monster)', async ({ page }) => {
  const problems = await watch(page);
  await openGame(page);
  await tabToMonster(page);
  for (let n = 1; n <= 3; n++) {
    await page.keyboard.press('Enter');
    await expect(page.locator('#counter')).toHaveText(said(n));
    // the game moves the focus to another live monster, so Enter again catches the next one
    await expect(page.locator('#arena .monster:not(.pop):focus')).toHaveCount(1);
  }
  expect(problems).toEqual([]);
});

test('a whole wave by keyboard celebrates, and «Παίξε Ξανά» starts a new wave at 0', async ({ page }) => {
  const problems = await watch(page);
  await openGame(page);
  const total = await page.locator('#arena .monster').count();
  await tabToMonster(page);
  for (let n = 1; n <= total; n++) {
    await page.keyboard.press('Enter');
    await expect(page.locator('#counter')).toHaveText(said(n));
  }
  await expect(page.locator('#celebration')).toBeVisible();
  await expect(page.locator('#play-again-btn')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#celebration')).toBeHidden();
  await expect(page.locator('#counter')).toHaveText(said(0));
  await expect(page.locator('#wave-btn')).toBeFocused();
  await expect.poll(() => page.locator('#arena .monster').count()).toBeGreaterThanOrEqual(6);
  expect(problems).toEqual([]);
});

test('night on/off: stars, flashlight follows the mouse, catching still counts', async ({ page }) => {
  const problems = await watch(page);
  await openGame(page);
  const night = page.locator('#night-btn');
  await expect(night).toHaveText('🌙 Νύχτα');
  await night.click();
  await expect(page.locator('body')).toHaveClass(/\bnight\b/);
  await expect(night).toHaveText('☀️ Μέρα');
  await expect(page.locator('#stars-layer .star-bg')).toHaveCount(40);

  await page.mouse.move(200, 300);
  await expect
    .poll(() => page.evaluate(() => document.body.style.getPropertyValue('--flashlight')))
    .toContain('200px 300px');

  const { x, y } = await aim(page);
  await page.mouse.click(x, y);
  await expect(page.locator('#counter')).toHaveText(said(1));

  await night.click();
  await expect(page.locator('body')).not.toHaveClass(/\bnight\b/);
  await expect(night).toHaveText('🌙 Νύχτα');
  await expect(page.locator('#stars-layer .star-bg')).toHaveCount(0);
  expect(problems).toEqual([]);
});

test('the page is served only under /cybele/ (like the hub)', async ({ request }) => {
  expect((await request.get(URL)).status()).toBe(200);
  expect((await request.get('/index.html')).status()).toBe(404);
  expect((await request.get('/cybele/tests/game-logic.test.mjs')).status()).toBe(404);
});
