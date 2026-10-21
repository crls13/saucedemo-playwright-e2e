import { test, expect } from '../fixtures/test-fixtures';
import { products, validCustomer } from '../test-data/checkout';
import { users } from '../test-data/users';

/**
 * UI defects found in the exploratory session (docs/exploratory/2026-10-21-session-report.md).
 * Each test asserts the CORRECT behavior and is marked test.fail() because the site gets it wrong.
 * If a bug is ever fixed, Playwright reports "expected to fail, but passed" so the marker can go.
 */
test.describe('Known UI defects', () => {
  test('checkout is blocked when the cart is empty @defect', async ({ cartPage, page }) => {
    test.fail(true, 'BUG-01: an empty cart can be checked out and is confirmed as a $0.00 order');

    await cartPage.goto();
    await expect(cartPage.items).toHaveCount(0);
    await cartPage.checkout();

    await expect(page).toHaveURL(/cart\.html/);
  });

  test('pressing Enter on the customer information form continues to the overview @defect', async ({ inventoryPage, cartPage, checkoutPage, page }) => {
    test.fail(true, 'BUG-03: Enter activates the Cancel button (no type attribute) and returns to the cart');

    await inventoryPage.goto();
    await inventoryPage.addToCart(products.backpack);
    await inventoryPage.openCart();
    await cartPage.checkout();

    await checkoutPage.firstNameInput.fill(validCustomer.firstName);
    await checkoutPage.lastNameInput.fill(validCustomer.lastName);
    await checkoutPage.postalCodeInput.fill(validCustomer.postalCode);
    await checkoutPage.postalCodeInput.press('Enter');

    await expect(page).toHaveURL(/checkout-step-two\.html/);
  });

  test('whitespace-only customer details are rejected @defect', async ({ inventoryPage, cartPage, checkoutPage, page }) => {
    test.fail(true, 'BUG-04: names and postal code made only of spaces are accepted');

    await inventoryPage.goto();
    await inventoryPage.addToCart(products.backpack);
    await inventoryPage.openCart();
    await cartPage.checkout();
    await checkoutPage.fillInformation({ firstName: '   ', lastName: '   ', postalCode: '   ' });

    await expect(checkoutPage.errorMessage).toBeVisible();
    await expect(page).toHaveURL(/checkout-step-one\.html/);
  });

  test('Reset App State also resets the Add to cart buttons @defect', async ({ inventoryPage, page }) => {
    test.fail(true, 'BUG-05: after Reset App State the buttons keep saying "Remove" until a reload');

    await inventoryPage.goto();
    await inventoryPage.addToCart(products.backpack);
    await inventoryPage.menuButton.click();
    await page.getByRole('button', { name: 'Reset App State' }).click();

    await expect(inventoryPage.cartBadge).toBeHidden();
    await expect(inventoryPage.item(products.backpack).getByRole('button', { name: 'Add to cart' })).toBeVisible();
  });

  test.describe('across users', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test("the next user does not inherit the previous user's cart after logout @defect", async ({ loginPage, inventoryPage }) => {
      test.fail(true, "BUG-02: the cart stays in browser storage after logout and the next user gets it");

      const first = users.standard();
      await loginPage.goto();
      await loginPage.login(first.username, first.password);
      await inventoryPage.addToCart(products.backpack, products.bikeLight);
      await expect(inventoryPage.cartBadge).toHaveText('2');
      await inventoryPage.logout();

      // A different person logs in on the same browser.
      await loginPage.login('problem_user', first.password);
      await expect(inventoryPage.title).toHaveText('Products');

      await expect(inventoryPage.cartBadge).toBeHidden();
    });
  });
});
