import { test, expect } from '@playwright/test';
import { getRandomString } from 'tests/helpers/random-string';

test.use({ storageState: '../../playwright/.auth/user.json' });

test.describe('Add Category', () => {
  test('Create Income Category', async ({ page }) => {
    const codeCategory = getRandomString();
    await page.goto('http://localhost:4200/');

    await page.locator('button').filter({ hasText: 'menu' }).click();
    await page.getByText('Category').click();
    await page.getByRole('button', { name: 'Add category' }).click();
    await page.getByLabel('Category name *').click();
    await page.getByLabel('Category name *').fill(codeCategory);
    await page.locator('button').filter({ hasText: 'done' }).click();
    await page.waitForURL('http://localhost:4200/category');

    await expect(page).toHaveTitle(/Category/);
    await expect(page.getByText(`${codeCategory} (user)`)).toBeVisible();
  });

  test('Create Expense Category', async ({ page }) => {
    const codeCategory = getRandomString();

    await page.goto('http://localhost:4200/');
    await page.locator('button').filter({ hasText: 'menu' }).click();
    await page.getByText('Category').click();
    await page.getByRole('button', { name: 'Add category' }).click();
    await page.getByText('Expense').click();
    await page.getByRole('button', { name: 'Add category' }).click();
    await page.getByRole('button', { name: 'currency_exchange' }).click();
    await page.getByLabel('Category name *').fill(codeCategory);
    await page.locator('button').filter({ hasText: 'done' }).click();
    await page.waitForURL('http://localhost:4200/category');

    await expect(page).toHaveTitle(/Category/);
    await expect(page.getByText(`${codeCategory} (user)`)).toBeVisible();
  });

})