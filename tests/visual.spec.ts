import { Page } from '@playwright/test';
import { test, expect } from '../fixtures/test-fixtures';
import { products, validCustomer } from '../test-data/checkout';

/** Full-page screenshot options that hide content which changes on its own (the footer's year). */
const stableShot = (page: Page) => ({
  fullPage: true,
  mask: [page.getByText(/© \d{4} Sauce Labs/)],
});

/**
 * Visual regression: full-page screenshots compared against approved baselines.
 * Baselines are generated on Linux in CI (see .github/workflows/visual-baselines.yml),
 * so these tests run only in CI, where fonts and rendering match the baselines.
 */
test.describe('Visual regression', () => {
  test.describe('logged out', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('login page @visual', async ({ loginPage, page }) => {
      await loginPage.goto();
      await expect(loginPage.loginButton).toBeVisible();
      await expect(page).toHaveScreenshot('login.png', stableShot(page));
    });
  });

  test('inventory page @visual', async ({ inventoryPage, page }) => {
    await inventoryPage.goto();
    await expect(inventoryPage.items).toHaveCount(6);
    await expect(page).toHaveScreenshot('inventory.png', stableShot(page));
  });

  test('cart with items @visual', async ({ inventoryPage, cartPage, page }) => {
    await inventoryPage.goto();
    await inventoryPage.addToCart(products.backpack, products.bikeLight);
    await inventoryPage.openCart();
    await expect(cartPage.items).toHaveCount(2);
    await expect(page).toHaveScreenshot('cart.png', stableShot(page));
  });

  test('checkout overview @visual', async ({ inventoryPage, cartPage, checkoutPage, page }) => {
    await inventoryPage.goto();
    await inventoryPage.addToCart(products.backpack);
    await inventoryPage.openCart();
    await cartPage.checkout();
    await checkoutPage.fillInformation(validCustomer);
    await expect(checkoutPage.totalLabel).toBeVisible();
    await expect(page).toHaveScreenshot('checkout-overview.png', stableShot(page));
  });

  test('order complete @visual', async ({ inventoryPage, cartPage, checkoutPage, page }) => {
    await inventoryPage.goto();
    await inventoryPage.addToCart(products.backpack);
    await inventoryPage.openCart();
    await cartPage.checkout();
    await checkoutPage.fillInformation(validCustomer);
    await checkoutPage.finish();
    await expect(checkoutPage.completeHeader).toBeVisible();
    await expect(page).toHaveScreenshot('order-complete.png', stableShot(page));
  });
});
