# Sauce Demo E2E + Restful Booker API Tests

[![Playwright Tests](https://github.com/crls13/saucedemo-playwright-e2e/actions/workflows/playwright.yml/badge.svg)](https://github.com/crls13/saucedemo-playwright-e2e/actions/workflows/playwright.yml)

UI and API test automation built with **Playwright** and **TypeScript**:

- **UI:** end-to-end tests for [saucedemo.com](https://www.saucedemo.com), a demo e-commerce site
- **API:** tests for [Restful Booker](https://restful-booker.herokuapp.com), a hotel booking REST API

## UI suite: what's covered

| Area | Tests |
|---|---|
| Login | Successful login, 5 data-driven invalid logins (locked out, wrong password, unknown user, empty fields), protected-page redirect |
| Inventory | Product list, sorting by price and name, cart badge updates, logout ends the session |
| Cart | Added items shown, remove item, persistence after reload, continue shopping |
| Checkout | Full purchase with order-total math check, required-field validation for each field |

Tests are tagged `@smoke` (critical path, also run on a mobile viewport) or `@regression`.

## API suite: what's covered

| Area | Tests |
|---|---|
| Health | `GET /ping` |
| Auth | Token issued for valid credentials; no token for invalid ones |
| CRUD | Create, read, full update (PUT), partial update (PATCH), delete then 404 |
| Search | List shape, filter by name finds the created booking, unknown name returns `[]` |
| Authorization | PUT/PATCH/DELETE without a token or with a bad token return 403; data survives |
| Known defects | 2 real API bugs, asserted as `test.fail()` and written up as Jira tickets in [`docs/known-defects.md`](docs/known-defects.md) |

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
- **Debuggable failures.** Screenshots, video, and traces are kept on failure or retry.

## Project structure

```
api/clients/    API client wrapping the Restful Booker endpoints
api/schemas/    zod response contracts
api/fixtures/   API fixtures (client, auth token, self-cleaning booking)
api/tests/      API specs
docs/           Known-defect write-ups in Jira format
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
npm run test:smoke          # smoke tests only, UI and API
npm run test:headed         # watch it run in a real browser
npm run test:ui             # Playwright UI mode
npm run report              # open the last HTML report
```

## CI

`.github/workflows/playwright.yml` runs a type check and the full suite on every push and pull request to `main`, then uploads the HTML report as an artifact. Add `SAUCE_USERNAME`, `SAUCE_PASSWORD`, `BOOKER_USERNAME` and `BOOKER_PASSWORD` as repository secrets (Settings → Secrets and variables → Actions).
