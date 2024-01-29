import { test } from '../fixtures/base.fixture'

test('Page Login Tests', async ({ loginPage }) => {
  await loginPage.gotoLoginPage()
  await loginPage.fillContent()
  await loginPage.logout()
  await loginPage.testAssertions()
  await loginPage.close()
})