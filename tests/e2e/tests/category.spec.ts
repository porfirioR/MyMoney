import { getRandomString } from '../../helpers/random-string';
import { test } from '../fixtures/base.fixture'
require('dotenv').config()

test.beforeAll(async ({ loginPage, categoryPage }) => {
  loginPage.gotoLoginPage()
  loginPage.fillContent()
});

test.beforeEach(async ({ loginPage }) => {
  loginPage.gotoLoginPage()
  loginPage.fillContent()
})

test('Create Income Category', async ({ categoryPage }) => {
  const categoryName = getRandomString()
  await categoryPage.gotoCategory()
  await categoryPage.addCategory(categoryName)
  await categoryPage.clickMenu()
  await categoryPage.wait()

  await categoryPage.testAssertions(`${categoryName} (user)`)
  await categoryPage.close()
});

test('Create Expense Category', async ({ categoryPage }) => {
  const categoryName = getRandomString()
  await categoryPage.gotoCategory()
  await categoryPage.addCategory(categoryName)
  await categoryPage.gotoExpenseCategory()

  await categoryPage.testAssertions(`${categoryName} (user)`)
  await categoryPage.close()
});

