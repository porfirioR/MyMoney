import { test as setup } from '@playwright/test'
const authFile = '../playwright/.auth/user.json';
require('dotenv').config()

setup('authenticate', async ({ page }) => {
  const url = process.env['EMAIL']!
  await page.goto(`${url}/logout`);
  await page.getByRole('button', { name: 'Login' }).click();
  await page.locator('div').filter({ hasText: 'Email *' }).nth(3).click();
  await page.getByLabel('Email  *').fill(process.env['EMAIL']!);
  await page.getByLabel('Email  *').press('Tab');
  await page.getByLabel('Password  *').fill(process.env['PASSWORD']!);
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForURL(url);

  await page.context().storageState({ path: authFile })
})