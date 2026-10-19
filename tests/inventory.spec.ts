import { test, expect } from '../fixtures/test-fixtures';
import { products } from '../test-data/checkout';

test.describe('Inventory', () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
  });

  test('lists all six products with names and prices @smoke', async ({ inventoryPage }) => {
    await expect(inventoryPage.items).toHaveCount(6);
    for (const price of await inventoryPage.prices()) {
      expect(price).toBeGreaterThan(0);
    }
  });

  test('sorts products by price, low to high @regression', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('lohi');
    const prices = await inventoryPage.prices();
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  test('sorts products by price, high to low @regression', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('hilo');
    const prices = await inventoryPage.prices();
    expect(prices).toEqual([...prices].sort((a, b) => b - a));
  });

  test('sorts products by name, Z to A @regression', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('za');
    const names = await inventoryPage.names();
    expect(names).toEqual([...names].sort((a, b) => b.localeCompare(a)));
  });

  test('cart badge updates as products are added and removed @smoke', async ({ inventoryPage }) => {
    await expect(inventoryPage.cartBadge).toBeHidden();

    await test.step('add two products', async () => {
      await inventoryPage.addToCart(products.backpack, products.bikeLight);
      await expect(inventoryPage.cartBadge).toHaveText('2');
    });

    await test.step('remove one product', async () => {
      await inventoryPage.removeFromCart(products.backpack);
      await expect(inventoryPage.cartBadge).toHaveText('1');
      await expect(
        inventoryPage.item(products.backpack).getByRole('button', { name: 'Add to cart' }),
      ).toBeVisible();
    });
  });

  test('logout returns to the login page and ends the session @regression', async ({ inventoryPage, page }) => {
    await inventoryPage.logout();
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();

    await page.goto('/inventory.html');
    await expect(page.getByTestId('error')).toContainText('when you are logged in');
  });
});
