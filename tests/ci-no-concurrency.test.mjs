// ci-no-concurrency.test.mjs — CI-NO-CONCURRENCY (owner 2026-11-15): CI/scan workflows have no `concurrency`.
// Run: node --test tests/*.test.mjs
// A `concurrency` group once left a run «pending» for 2 h (GitHub cancelled the run before it and never released
// the group). Without one, a run is never held back. Every job here runs on GitHub-hosted ubuntu-latest (own VM),
// so the fixed Playwright port (tests/ui/playwright.config.ts) cannot clash between two runs.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const workflows = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '.github', 'workflows');
const CI_AND_SCAN = ['ci.yml'];

test('CI/scan workflows have no concurrency key (workflow- or job-level)', () => {
  for (const name of CI_AND_SCAN) {
    const text = fs.readFileSync(path.join(workflows, name), 'utf8');
    assert.doesNotMatch(text, /^\s*concurrency\s*:/m, `${name}: concurrency block`);
  }
});

test('every job still runs on GitHub-hosted ubuntu-latest', () => {
  const text = fs.readFileSync(path.join(workflows, 'ci.yml'), 'utf8');
  const runsOn = [...text.matchAll(/^\s*runs-on:\s*(\S+)/gm)].map((m) => m[1]);
  assert.ok(runsOn.length > 0);
  assert.deepEqual([...new Set(runsOn)], ['ubuntu-latest']);
});
