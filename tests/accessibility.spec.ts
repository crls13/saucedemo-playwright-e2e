import { test, expect } from '../fixtures/test-fixtures';
import { expectNoA11yViolations, scanA11y } from '../utils/a11y';
import { products, validCustomer } from '../test-data/checkout';
import { users } from '../test-data/users';

/**
 * Automated WCAG 2.2 AA checks with axe-core on every page in the purchase flow.
 * Automated scans catch roughly a third of accessibility issues; keyboard and
 * screen-reader testing are still needed for full coverage.
 */
test.describe('Accessibility', () => {
  // Control test: proves the scanner really detects problems, so a clean scan means something.
  test('scanner detects planted violations (control) @a11y', async ({ inventoryPage, page }) => {
    await inventoryPage.goto();
    await expect(inventoryPage.items.first()).toBeVisible();

    await page.evaluate(() => {
      const img = document.createElement('img'); // no alt text: WCAG 1.1.1
      img.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACw=';
      const button = document.createElement('button'); // no accessible name: WCAG 4.1.2
      document.body.append(img, button);
    });

    const ruleIds = (await scanA11y(page)).map((v) => v.id);
    expect(ruleIds).toEqual(expect.arrayContaining(['image-alt', 'button-name']));
  });

  test.describe('logged out', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('login page @a11y', async ({ loginPage, page }, testInfo) => {
      await loginPage.goto();
      await expect(loginPage.loginButton).toBeVisible();
      await expectNoA11yViolations(page, testInfo);
    });

    test('login page with an error message @a11y', async ({ loginPage, page }, testInfo) => {
      await loginPage.goto();
      await loginPage.login(users.lockedOut().username, users.lockedOut().password);
      await expect(loginPage.errorMessage).toBeVisible();
      await expectNoA11yViolations(page, testInfo);
    });
  });

  test('inventory page @a11y', async ({ inventoryPage, page }, testInfo) => {
    await inventoryPage.goto();
    await expect(inventoryPage.items.first()).toBeVisible();
    await expectNoA11yViolations(page, testInfo);
  });

  test('product details page @a11y', async ({ inventoryPage, page }, testInfo) => {
    await inventoryPage.goto();
    await inventoryPage.itemNames.filter({ hasText: products.backpack }).click();
    await expect(page).toHaveURL(/inventory-item\.html/);
    await expectNoA11yViolations(page, testInfo);
  });

  test('cart page with items @a11y', async ({ inventoryPage, cartPage, page }, testInfo) => {
    await inventoryPage.goto();
    await inventoryPage.addToCart(products.backpack, products.bikeLight);
    await inventoryPage.openCart();
    await expect(cartPage.items).toHaveCount(2);
    await expectNoA11yViolations(page, testInfo);
  });

  test.describe('checkout', () => {
    test.beforeEach(async ({ inventoryPage, cartPage }) => {
      await inventoryPage.goto();
      await inventoryPage.addToCart(products.backpack);
      await inventoryPage.openCart();
      await cartPage.checkout();
    });

    test('customer information page @a11y', async ({ checkoutPage, page }, testInfo) => {
      await expect(checkoutPage.firstNameInput).toBeVisible();
      await expectNoA11yViolations(page, testInfo);
    });

    test('customer information page with an error message @a11y', async ({ checkoutPage, page }, testInfo) => {
      await checkoutPage.fillInformation({});
      await expect(checkoutPage.errorMessage).toBeVisible();
      await expectNoA11yViolations(page, testInfo);
    });

    test('order overview page @a11y', async ({ checkoutPage, page }, testInfo) => {
      await checkoutPage.fillInformation(validCustomer);
      await expect(checkoutPage.totalLabel).toBeVisible();
      await expectNoA11yViolations(page, testInfo);
    });

    test('order complete page @a11y', async ({ checkoutPage, page }, testInfo) => {
      await checkoutPage.fillInformation(validCustomer);
      await checkoutPage.finish();
      await expect(checkoutPage.completeHeader).toBeVisible();
      await expectNoA11yViolations(page, testInfo);
    });
  });
});
