# Sauce Demo E2E + Restful Booker API Tests

[![Playwright Tests](https://github.com/crls13/saucedemo-playwright-e2e/actions/workflows/playwright.yml/badge.svg)](https://github.com/crls13/saucedemo-playwright-e2e/actions/workflows/playwright.yml)

UI and API test automation built with **Playwright** and **TypeScript**:

- **UI:** end-to-end tests for [saucedemo.com](https://www.saucedemo.com), a demo e-commerce site
- **API:** tests for [Restful Booker](https://restful-booker.herokuapp.com), a hotel booking REST API
- **Accessibility:** automated WCAG 2.2 AA scans with [axe-core](https://github.com/dequelabs/axe-core) on every page of the purchase flow
- **Visual regression:** full-page screenshot comparisons against approved baselines
- **Test design:** 22 checkout test cases in Jira Xray format, traced to the automated tests that cover them ([traceability matrix](docs/traceability.md))
- **Exploratory testing:** a charter-based session that found 18 bugs the automated suite does not cover, written up for Jira ([session report](docs/exploratory/2026-10-21-session-report.md))

**[View the latest test report](https://crls13.github.io/saucedemo-playwright-e2e/)**, published from `main` on every run.

## UI suite: what's covered

| Area | Tests |
|---|---|
| Login | Successful login, 5 data-driven invalid logins (locked out, wrong password, unknown user, empty fields), protected-page redirect |
| Inventory | Product list, sorting by price and name, cart badge updates, logout ends the session |
| Cart | Added items shown, remove item, persistence after reload, continue shopping |
| Checkout | Full purchase with order-total math check, required-field validation for each field |
| Accessibility | WCAG 2.2 AA scans of login, inventory, product details, cart, and all checkout steps, including error states, plus a control test proving the scanner detects planted violations |
| Visual | Screenshot comparisons of login, inventory, cart, checkout overview and order complete (CI only) |

Tests are tagged `@smoke` (critical path, also run on a mobile viewport) or `@regression`.

## API suite: what's covered

| Area | Tests |
|---|---|
| Health | `GET /ping` |
| Auth | Token issued for valid credentials; no token for invalid ones |
| CRUD | Create, read, full update (PUT), partial update (PATCH), delete then 404 |
| Search | List shape, filter by name finds the created booking, unknown name returns `[]` |
| Authorization | PUT/PATCH/DELETE without a token or with a bad token return 403; data survives |
| Edge cases | 7 data-driven boundary cases: zero and very large prices, accented names, 100-character names, same-day stays, optional fields |
| Response times | List, get and auth endpoints respond within 3 s, with each timing recorded in the report |
| Known defects | 3 real API bugs, asserted as `test.fail()` and written up as Jira tickets in [`docs/known-defects.md`](docs/known-defects.md) |

API design decisions:

- **API object model.** `api/clients/BookingClient.ts` wraps every endpoint, like a page object for the API. Tests never build URLs or headers themselves.
- **Contract checks.** Responses are validated against [zod](https://zod.dev) schemas in `api/schemas/`, so a renamed field or wrong type fails the test even when the status code is right.
- **Self-cleaning test data.** The `createdBooking` fixture creates a uniquely named booking before each test and deletes it afterwards, so tests are independent and leave nothing behind on the shared API.
- **Known defects as tests.** Tests assert the *correct* behavior and are marked `test.fail()`. If the API is fixed, Playwright flags them so the marker can be removed.

## UI design decisions

- **Page Object Model.** Locators and actions live in `pages/`; assertions stay in the specs.
- **Custom fixtures.** Page objects are injected into tests (`async ({ inventoryPage }) => ...`), so there is no setup boilerplate in specs.
- **Log in once.** `tests/auth.setup.ts` logs in through the UI and saves the session (`storageState`). Other tests reuse it, which keeps them fast and independent. Login tests opt out and start logged out.
- **Resilient locators.** Order of preference: `getByRole`, `getByPlaceholder`, then `getByTestId` (mapped to the site's `data-test` attributes). No XPath or CSS chains.
- **No hard waits.** Only web-first assertions (`await expect(locator)...`), which retry automatically.
- **Data-driven tests.** Invalid-login and missing-field cases are typed arrays in `test-data/`.
- **Secrets outside code.** Credentials come from `.env` locally and GitHub Secrets in CI.
- **Accessibility scans.** `utils/a11y.ts` runs axe-core against WCAG 2.0–2.2 A/AA rules, attaches the full results to the report, and fails with a readable list of violations and links to the fix guidance. Automated scans catch only part of accessibility issues, so they complement keyboard and screen-reader testing rather than replace it.
- **Visual baselines made in CI.** Screenshots render differently on Windows and Linux, so the approved baselines are generated on Linux by the `Update visual baselines` workflow and committed automatically. Visual tests run only in CI, and only once baselines exist.
- **Debuggable failures.** Screenshots, video, and traces are kept on failure or retry.

## Project structure

```
api/clients/    API client wrapping the Restful Booker endpoints
api/schemas/    zod response contracts
api/fixtures/   API fixtures (client, auth token, self-cleaning booking)
api/tests/      API specs
docs/           Known-defect write-ups, test cases (Xray CSV), traceability matrix and exploratory session reports
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

npm test                    # everything: UI (desktop + mobile smoke) and API
npm run test:ui-suite       # UI tests only
npm run test:api            # API tests only
npm run test:a11y           # accessibility scans only
npm run test:smoke          # smoke tests only, UI and API
npm run test:headed         # watch it run in a real browser
npm run test:ui             # Playwright UI mode
npm run report              # open the last HTML report
```

## CI

`.github/workflows/playwright.yml` runs a type check and the full suite on every push and pull request to `main`, uploads the HTML report as an artifact, and on `main` publishes it to [GitHub Pages](https://crls13.github.io/saucedemo-playwright-e2e/). `.github/workflows/visual-baselines.yml` is run by hand to approve new visual baselines. Add `SAUCE_USERNAME`, `SAUCE_PASSWORD`, `BOOKER_USERNAME` and `BOOKER_PASSWORD` as repository secrets (Settings → Secrets and variables → Actions).
