import { test, expect } from '@playwright/test';
import { getRandomString } from '../helpers/random-string';
require('dotenv').config()

// test.use({ storageState: '../../playwright/.auth/user.json' });

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:4200/logout');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.locator('div').filter({ hasText: 'Email *' }).nth(3).click();
  await page.getByLabel('Email  *').fill(process.env['EMAIL']!);
  await page.getByLabel('Email  *').press('Tab');
  await page.getByLabel('Password  *').fill(process.env['PASSWORD']!);
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForURL('http://localhost:4200/');
});

test.describe('Add Category', () => {
  test('Create Income Category', async ({ page }) => {
    const codeCategory = getRandomString();
    await page.locator('button').filter({ hasText: 'menu' }).click();
    await page.getByText('Category').click();
    await page.getByRole('button', { name: 'Add category' }).click();
    await page.getByLabel('Category name *').click();
    await page.getByLabel('Category name *').fill(codeCategory);
    await page.locator('button').filter({ hasText: 'done' }).click();
    await page.waitForURL('http://localhost:4200/category');

    await expect(page).toHaveTitle(/Category/);
    await expect(page.getByText(`${codeCategory} (user)`)).toBeVisible();
    await page.close()
  });

  test('Create Expense Category', async ({ page }) => {
    const codeCategory = getRandomString();
    await page.locator('button').filter({ hasText: 'menu' }).click();
    await page.getByText('Category').click();
    await page.getByRole('tab', { name: 'Expense' }).click();
    await page.getByRole('button', { name: 'Add category' }).click();
    await page.getByLabel('Category name *').click();
    await page.getByLabel('Category name *').fill(codeCategory);
    await page.locator('button').filter({ hasText: 'done' }).click();
    await page.waitForURL('http://localhost:4200/category');
    await page.getByRole('tab', { name: 'Expense' }).click();

    await expect(page).toHaveTitle(/Category/);
    await expect(page.getByText(`${codeCategory} (user)`)).toBeVisible();
    await page.close()
  });
});
