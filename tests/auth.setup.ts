import { test as setup, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { users } from '../test-data/users';
import { STORAGE_STATE } from '../utils/paths';

setup('log in as standard user and save session', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const { username, password } = users.standard();

  await loginPage.goto();
  await loginPage.login(username, password);

  await expect(page).toHaveURL(/\/inventory\.html/);
  await page.context().storageState({ path: STORAGE_STATE });
});
