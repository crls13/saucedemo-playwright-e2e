import { defineConfig, devices, Project } from '@playwright/test';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { STORAGE_STATE } from './utils/paths';

dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * Visual tests compare against Linux baselines made in CI, so they only run in CI,
 * and only once baselines exist (or while the baseline workflow is creating them).
 */
const VISUAL_BASELINES = path.join(__dirname, 'tests', 'visual.spec.ts-snapshots');
const runVisual =
  !!process.env.CI && (fs.existsSync(VISUAL_BASELINES) || process.env.UPDATE_VISUAL_BASELINES === '1');

const visualProject: Project = {
  name: 'visual',
  use: { ...devices['Desktop Chrome'], storageState: STORAGE_STATE },
  dependencies: ['setup'],
  grep: /@visual/,
};

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],

  expect: {
    // Allow tiny anti-aliasing differences; anything bigger is a real visual change.
    toHaveScreenshot: { maxDiffPixelRatio: 0.01, animations: 'disabled' },
  },

  use: {
    baseURL: process.env.BASE_URL ?? 'https://www.saucedemo.com',
    // Sauce Demo exposes data-test="..." attributes, so getByTestId() reads those.
    testIdAttribute: 'data-test',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // Logs in once through the UI and saves the session for the other projects.
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], storageState: STORAGE_STATE },
      dependencies: ['setup'],
      grepInvert: /@visual/,
    },
    {
      // Mobile viewport runs only the smoke tests to keep the suite fast.
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7'], storageState: STORAGE_STATE },
      dependencies: ['setup'],
      grep: /@smoke/,
    },
    ...(runVisual ? [visualProject] : []),
    {
      // API tests against Restful Booker. No browser is launched.
      name: 'api',
      testDir: './api/tests',
      use: {
        baseURL: process.env.BOOKER_BASE_URL ?? 'https://restful-booker.herokuapp.com',
        extraHTTPHeaders: { Accept: 'application/json' },
      },
    },
  ],
});
