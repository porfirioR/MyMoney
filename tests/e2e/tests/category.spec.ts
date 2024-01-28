import { addUserToCategoryName, getRandomString } from '../../helpers';
import { test } from '../fixtures/base.fixture'

test.beforeAll(async ({ loginPage, configurationPage }) => {
  await loginPage.gotoLoginPage()
  await loginPage.fillContent()
  await configurationPage.gotoConfiguration()
  await configurationPage.changeLanguageToEnglish()
  await loginPage.logout()
  await loginPage.close()
})

test.beforeEach(async ({ loginPage }) => {
  await loginPage.gotoLoginPage()
  await loginPage.fillContent()
})

test('Create Income Category', async ({ loginPage, categoryPage }) => {
  const categoryName = getRandomString()
  await categoryPage.gotoCategory()
  await categoryPage.addCategory(categoryName)
  await categoryPage.waitToLoadPage()

  await categoryPage.createTestAssertions(addUserToCategoryName(categoryName))
  await loginPage.logout()
  await categoryPage.close()
})

test('Create Expense Category', async ({ loginPage, categoryPage }) => {
  const categoryName = getRandomString()
  await categoryPage.gotoCategory()
  await categoryPage.addCategory(categoryName)
  await categoryPage.gotoExpenseCategory()

  await categoryPage.createTestAssertions(addUserToCategoryName(categoryName))
  await loginPage.logout()
  await categoryPage.close()
})

test('Update Category', async ({ loginPage, categoryPage }) => {
  let categoryName = getRandomString()
  await categoryPage.gotoCategory()
  await categoryPage.addCategory(categoryName)
  await categoryPage.waitToLoadPage()
  categoryName = addUserToCategoryName(categoryName)
  const [color, backgroundColor] = await categoryPage.editCategory(categoryName)
  await categoryPage.waitToLoadPage()

  await categoryPage.updateTestAssertions(categoryName, color, backgroundColor)
  await loginPage.logout()
  await categoryPage.close()
})

test('Delete Category', async ({ loginPage, categoryPage }) => {
  const categoryName = getRandomString()
  await categoryPage.gotoCategory()
  await categoryPage.addCategory(categoryName)
  await categoryPage.waitToLoadPage()
  await categoryPage.deleteCategory(categoryName)

  await categoryPage.deleteTestAssertions(addUserToCategoryName(categoryName))
  await loginPage.logout()
  await categoryPage.close()
})