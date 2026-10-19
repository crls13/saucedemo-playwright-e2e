import { test, expect } from '../fixtures/test-fixtures';
import { invalidLogins, users } from '../test-data/users';

// These tests start logged out, so they ignore the saved session.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('standard user can log in and sees the product list @smoke', async ({ loginPage, inventoryPage, page }) => {
    const { username, password } = users.standard();
    await loginPage.login(username, password);

    await expect(page).toHaveURL(/\/inventory\.html/);
    await expect(inventoryPage.title).toHaveText('Products');
    await expect(inventoryPage.items).toHaveCount(6);
  });

  for (const testCase of invalidLogins()) {
    test(`shows an error for ${testCase.title} @regression`, async ({ loginPage, page }) => {
      await loginPage.login(testCase.username, testCase.password);

      await expect(loginPage.errorMessage).toBeVisible();
      await expect(loginPage.errorMessage).toContainText(testCase.expectedError);
      await expect(page).not.toHaveURL(/\/inventory\.html/);
    });
  }

  test('protected pages redirect to login when logged out @regression', async ({ page, loginPage }) => {
    await page.goto('/inventory.html');

    await expect(loginPage.loginButton).toBeVisible();
    await expect(loginPage.errorMessage).toContainText("You can only access '/inventory.html' when you are logged in");
  });
});
