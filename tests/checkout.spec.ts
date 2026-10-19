import { test, expect } from '../fixtures/test-fixtures';
import { missingFieldCases, products, validCustomer } from '../test-data/checkout';

test.describe('Checkout', () => {
  test.beforeEach(async ({ inventoryPage, cartPage }) => {
    await inventoryPage.goto();
    await inventoryPage.addToCart(products.backpack, products.bikeLight);
    await inventoryPage.openCart();
    await cartPage.checkout();
  });

  test('customer can complete a purchase with correct totals @smoke', async ({ checkoutPage, page }) => {
    await test.step('enter customer information', async () => {
      await checkoutPage.fillInformation(validCustomer);
      await expect(page).toHaveURL(/checkout-step-two\.html/);
    });

    await test.step('verify the order summary math', async () => {
      await expect(checkoutPage.itemNames).toHaveText([products.backpack, products.bikeLight]);

      const { itemPrices, subtotal, tax, total } = await checkoutPage.summary();
      const expectedSubtotal = itemPrices.reduce((sum, price) => sum + price, 0);

      expect(subtotal).toBeCloseTo(expectedSubtotal, 2);
      expect(tax).toBeGreaterThan(0);
      expect(total).toBeCloseTo(subtotal + tax, 2);
    });

    await test.step('finish the order', async () => {
      await checkoutPage.finish();
      await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!');
      await expect(checkoutPage.cartBadge).toBeHidden();
    });
  });

  for (const { field, expectedError } of missingFieldCases) {
    test(`requires ${field} before continuing @regression`, async ({ checkoutPage, page }) => {
      await checkoutPage.fillInformation({ ...validCustomer, [field]: '' });

      await expect(checkoutPage.errorMessage).toContainText(expectedError);
      await expect(page).toHaveURL(/checkout-step-one\.html/);
    });
  }
});
