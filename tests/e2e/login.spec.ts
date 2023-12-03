import { test, expect } from '@playwright/test';

test('login', async ({ page }) => {
  await page.goto('http://localhost:4200/');
  await page.goto('http://localhost:4200/logout');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.locator('div').filter({ hasText: 'Email *' }).nth(3).click();
  await page.getByLabel('Email  *').fill('');
  await page.getByLabel('Email  *').press('Tab');
  await page.getByLabel('Password  *').fill('');
  await page.getByRole('button', { name: 'Login User' }).click();
  await page.locator('button').filter({ hasText: 'menu' }).click();
  await page.getByText('exit_to_app').click();
  await expect(page).toHaveTitle(/Logout/);
  await page.close()
});