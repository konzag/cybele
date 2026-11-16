// Monsters must not land on top of each other (owner 2026-11-16: «να μη πέφτουν τα τέρατα το ένα πάνω στο άλλο»):
// a small child has to be able to tap every one of them. Before the fix index.html placed them with Math.random and
// no spacing: 142 of 300 waves overlapped at 360 px, 38 of 300 at 1280 px (RUN-REPORT-2026-11-15-coverage §1).
// Playwright's clock runs the 120 ms spawn timers instantly, so 300 seeded waves per width take seconds.
import { expect, test, type Page } from '@playwright/test';
import { URL } from './helpers';

test.use({ reducedMotion: 'reduce' }); // no floating: the boxes are where the child would tap

const WAVES = 300;
// Room left for the float animation (14 px up/down) between two monsters, so they do not touch while floating.
const FLOAT = 14;

/** Seeds Math.random (mulberry32) in the page, starts a new wave, runs its spawn timers and returns what is out. */
async function seededWave(page: Page, seed: number, float = FLOAT) {
  await page.evaluate((s) => {
    let a = s >>> 0;
    Math.random = () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    (window as unknown as { spawnWave: () => void }).spawnWave();
  }, seed);
  await page.clock.runFor(1300);
  return layout(page, float);
}

/** Layout boxes of the live monsters (arena coordinates), overlapping pairs (also within FLOAT), out-of-arena ones. */
async function layout(page: Page, float = FLOAT) {
  return page.evaluate((float) => {
    const arena = document.getElementById('arena')!;
    const boxes = [...arena.querySelectorAll<HTMLElement>('.monster:not(.pop)')].map((m) => ({
      x: m.offsetLeft, y: m.offsetTop, w: m.offsetWidth, h: m.offsetHeight,
    }));
    const overlaps: string[] = [];
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i], b = boxes[j];
        if (a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h + float && b.y < a.y + a.h + float) {
          overlaps.push(`${i}/${j}`);
        }
      }
    }
    const outside = boxes.filter((b) => b.x < 0 || b.y < 0 || b.x + b.w > arena.clientWidth || b.y + b.h > arena.clientHeight).length;
    return { boxes, overlaps, outside };
  }, float);
}

/** The wave size the game draws first for this seed (6-10): the fix must not change it. */
function expectedCount(seed: number) {
  let a = seed >>> 0;
  a = (a + 0x6d2b79f5) >>> 0;
  let t = a;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return 6 + Math.floor((((t ^ (t >>> 14)) >>> 0) / 4294967296) * 5);
}

// 360×640 (a small phone, arena 360 px high) is too full for the float room on every wave: there the game lets two
// monsters touch but never overlap.
for (const [width, height, float] of [[360, 800, FLOAT], [1280, 800, FLOAT], [360, 640, 0]] as const) {
  test(`${WAVES} seeded waves at ${width}×${height}: no monster on top of another (+${float} px), same wave size, all in the arena`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.clock.install();
    await page.goto(URL);
    await page.clock.runFor(1300);
    const bad: string[] = [];
    for (let seed = 1; seed <= WAVES; seed++) {
      const w = await seededWave(page, seed, float);
      if (w.overlaps.length) bad.push(`seed ${seed}: overlap ${w.overlaps.join(' ')}`);
      if (w.outside) bad.push(`seed ${seed}: ${w.outside} outside the arena`);
      if (w.boxes.length !== expectedCount(seed)) bad.push(`seed ${seed}: ${w.boxes.length} out, expected ${expectedCount(seed)}`);
    }
    expect(bad, `${new Set(bad.map((b) => b.split(':')[0])).size} of ${WAVES} waves wrong`).toEqual([]);
  });
}

/** Resizes the page and waits until it has seen the resize event, then runs the game's 150 ms settle timer. */
async function resizeTo(page: Page, width: number) {
  if (page.viewportSize()?.width === width) return;
  const seen = page.evaluate(() => new Promise<void>((done) => addEventListener('resize', () => done(), { once: true })));
  await page.setViewportSize({ width, height: 800 });
  await seen;
  await page.clock.runFor(500);
}

for (const [from, to] of [[1280, 360], [360, 1280]] as const) {
  test(`resize ${from} -> ${to}: the monsters move apart again and stay in the arena`, async ({ page }) => {
    await page.setViewportSize({ width: from, height: 800 });
    await page.clock.install();
    await page.goto(URL);
    await page.clock.runFor(1300);
    const bad: string[] = [];
    for (let seed = 1; seed <= 30; seed++) {
      await resizeTo(page, from);
      const before = await seededWave(page, seed);
      await resizeTo(page, to);
      const after = await layout(page);
      if (after.overlaps.length) bad.push(`seed ${seed}: overlap ${after.overlaps.join(' ')}`);
      if (after.outside) bad.push(`seed ${seed}: ${after.outside} outside the arena`);
      if (after.boxes.length !== before.boxes.length) bad.push(`seed ${seed}: ${before.boxes.length} -> ${after.boxes.length} monsters`);
    }
    expect(bad).toEqual([]);
  });
}
