# Sauce Demo E2E Tests

[![Playwright Tests](https://github.com/crls13/saucedemo-playwright-e2e/actions/workflows/playwright.yml/badge.svg)](https://github.com/YOUR-USERNAME/saucedemo-playwright-e2e/actions/workflows/playwright.yml)

End-to-end tests for [saucedemo.com](https://www.saucedemo.com), a demo e-commerce site, built with **Playwright** and **TypeScript**.

## What's covered

| Area | Tests |
|---|---|
| Login | Successful login, 5 data-driven invalid logins (locked out, wrong password, unknown user, empty fields), protected-page redirect |
| Inventory | Product list, sorting by price and name, cart badge updates, logout ends the session |
| Cart | Added items shown, remove item, persistence after reload, continue shopping |
| Checkout | Full purchase with order-total math check, required-field validation for each field |

Tests are tagged `@smoke` (critical path, also run on a mobile viewport) or `@regression`.

## Design decisions

- **Page Object Model.** Locators and actions live in `pages/`; assertions stay in the specs.
- **Custom fixtures.** Page objects are injected into tests (`async ({ inventoryPage }) => ...`), so there is no setup boilerplate in specs.
- **Log in once.** `tests/auth.setup.ts` logs in through the UI and saves the session (`storageState`). Other tests reuse it, which keeps them fast and independent. Login tests opt out and start logged out.
- **Resilient locators.** Order of preference: `getByRole`, `getByPlaceholder`, then `getByTestId` (mapped to the site's `data-test` attributes). No XPath or CSS chains.
- **No hard waits.** Only web-first assertions (`await expect(locator)...`), which retry automatically.
- **Data-driven tests.** Invalid-login and missing-field cases are typed arrays in `test-data/`.
- **Secrets outside code.** Credentials come from `.env` locally and GitHub Secrets in CI.
- **Debuggable failures.** Screenshots, video, and traces are kept on failure or retry.

## Project structure

```
pages/          Page objects (BasePage holds the shared header and menu)
fixtures/       Custom test fixtures that inject page objects
tests/          Specs plus auth.setup.ts
test-data/      Users, customers, products, and data-driven cases
utils/          Env and price helpers, storage-state path
.github/        CI workflow
```

## Running locally

Requires Node.js 18 or newer.

```bash
npm install
npx playwright install chromium
cp .env.example .env        # Windows PowerShell: Copy-Item .env.example .env

npm test                    # full suite, desktop + mobile smoke
npm run test:smoke          # smoke tests only
npm run test:headed         # watch it run in a real browser
npm run test:ui             # Playwright UI mode
npm run report              # open the last HTML report
```

## CI

`.github/workflows/playwright.yml` runs a type check and the full suite on every push and pull request to `main`, then uploads the HTML report as an artifact. Add `SAUCE_USERNAME` and `SAUCE_PASSWORD` as repository secrets (Settings → Secrets and variables → Actions).
