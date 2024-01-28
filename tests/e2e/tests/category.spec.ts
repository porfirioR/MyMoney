import { getRandomString } from '../../helpers/random-string';
import { test } from '../fixtures/base.fixture'

test.beforeAll(async ({ loginPage, configurationPage }) => {
  await loginPage.gotoLoginPage()
  await loginPage.fillContent()
  await configurationPage.gotoConfiguration()
  await configurationPage.changeLanguageToEnglish()
  await loginPage.logout()
  await loginPage.close()
});

test.beforeEach(async ({ loginPage }) => {
  await loginPage.gotoLoginPage()
  await loginPage.fillContent()
})

test('Create Income Category', async ({ categoryPage }) => {
  const categoryName = getRandomString()
  await categoryPage.gotoCategory()
  await categoryPage.addCategory(categoryName)
  await categoryPage.waitToLoadPage()

  await categoryPage.createTestAssertions(`${categoryName} (user)`)
  await categoryPage.close()
})

test('Create Expense Category', async ({ categoryPage }) => {
  const categoryName = getRandomString()
  await categoryPage.gotoCategory()
  await categoryPage.addCategory(categoryName)
  await categoryPage.gotoExpenseCategory()

  await categoryPage.createTestAssertions(`${categoryName} (user)`)
  await categoryPage.close()
})

test.skip('Update Income Category', async ({ categoryPage }) => {
  let categoryName = getRandomString()
  await categoryPage.gotoCategory()
  await categoryPage.addCategory(categoryName)
  await categoryPage.waitToLoadPage()
  categoryName = `${categoryName} (user)`
  const [color, backgroundColor] = await categoryPage.editCategory(categoryName)
  await categoryPage.waitToLoadPage()

  await categoryPage.updateTestAssertions(categoryName, color, backgroundColor)
  await categoryPage.close()
})

