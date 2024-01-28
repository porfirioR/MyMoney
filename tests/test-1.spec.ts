import { test } from '@playwright/test';

test.skip('test', async ({ page }) => {
await page.locator('article').filter({ hasText: 'highlight_off fastfood2yN9zpP3M4 (user)edit' }).getByRole('button').first().click();
await page.getByRole('button', { name: 'Delete' }).click();
});