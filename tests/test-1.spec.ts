import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
await page.locator('#color').click();
await page.locator('#color').fill('#dabebe');
await page.getByText('fastfoodIcon colorBackground colorOrder Cancel Save').click();
await page.locator('#background-color').fill('#4c90a4');
await page.locator('#background-color').click();
await page.locator('#background-color').press('Escape');
await page.locator('#background-color').click();
await page.locator('#background-color').fill('#75959f');
await page.getByText('fastfoodIcon colorBackground').click();
});