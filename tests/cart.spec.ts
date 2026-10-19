import { test, expect } from '../fixtures/test-fixtures';
import { products } from '../test-data/checkout';

test.describe('Cart', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
    await inventoryPage.addToCart(products.backpack, products.boltTShirt);
    await inventoryPage.openCart();
  });

  test('shows the products that were added @smoke', async ({ cartPage }) => {
    await expect(cartPage.itemNames).toHaveText([products.backpack, products.boltTShirt]);
  });

  test('removing a product updates the cart and badge @regression', async ({ cartPage }) => {
    await cartPage.remove(products.backpack);

    await expect(cartPage.itemNames).toHaveText([products.boltTShirt]);
    await expect(cartPage.cartBadge).toHaveText('1');
  });

  test('cart contents persist after a page reload @regression', async ({ cartPage, page }) => {
    await page.reload();
    await expect(cartPage.items).toHaveCount(2);
  });

  test('continue shopping returns to the inventory @regression', async ({ cartPage, inventoryPage }) => {
    await cartPage.continueShoppingButton.click();
    await expect(inventoryPage.title).toHaveText('Products');
    await expect(inventoryPage.cartBadge).toHaveText('2');
  });
});
