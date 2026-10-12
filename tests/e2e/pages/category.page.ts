import { Page, expect } from "@playwright/test"
import { BasePage } from "./base.page"
import { convertHexToRgbColor, getRandomHexColor } from "../../helpers"

export class CategoryPage extends BasePage {

  constructor(private page: Page) {
    super(page)
  }

  public async gotoCategory() {
    await this.clickMenu()
    await this.page.getByText('Category').click()
  }

  public async addCategory(categoryName: string) {
    await this.page.getByRole('button', { name: 'Add category' }).click()
    await this.clickByLabel('Category name *')
    await this.fillData('Category name *', categoryName)
    await this.page.getByTitle('Fast Food').click()
    await this.clickByRoleName('button', 'Save')
  }

  public async gotoExpenseCategory() {
    await this.page.getByRole('tab', { name: 'Expense' }).click()
    await this.waitToLoadPage()
  }

  // The list keeps the selected tab in the query string (/category?tab=expense)
  public async waitToLoadPage() {
    await this.page.waitForURL(/\/category(\?.*)?$/)
    await this.page.waitForLoadState('load')
  }

  public async editCategory(categoryName: string) {
    const [color, backgroundColor] = [getRandomHexColor(), getRandomHexColor()]
    await this.getRow(categoryName).getByRole('button').nth(2).click()
    await this.fillData('Icon color', color)
    await this.fillData('Background color', backgroundColor)
    await this.fillData('List position', '-1')
    await this.clickByRoleName('button', 'Save')
    return [color, backgroundColor]
  }

  public async deleteCategory(categoryName: string) {
    await this.getRow(categoryName).getByRole('button').first().click()
    await this.page.getByRole('button', { name: 'Delete' }).click()
  }

  public async createTestAssertions(categoryName: string) {
    await expect(this.page).toHaveTitle(/Category/)
    const row = this.getRow(categoryName)
    await expect(row).toBeVisible()
    await expect(row.getByText('Mine', { exact: true })).toBeVisible()
  }

  public async updateTestAssertions(categoryName: string, color: string, backgroundColor: string) {
    await this.createTestAssertions(categoryName)
    const button = this.getRow(categoryName).getByRole('button').nth(1)

    const buttonStyles = await button.evaluate((element) => {
      const style = window.getComputedStyle(element)
      return {
        backgroundColor: style.backgroundColor,
        color: style.color
      }
    })
    const colorInRgb = convertHexToRgbColor(color)
    const backgroundColorInRgb = convertHexToRgbColor(backgroundColor)

    expect(buttonStyles.color).toBe(colorInRgb)
    expect(buttonStyles.backgroundColor).toBe(backgroundColorInRgb)
  }

  public async deleteTestAssertions(categoryName: string) {
    await expect(this.page).toHaveTitle(/Category/)
    await expect(this.getRow(categoryName)).toHaveCount(0)
  }

  // Category names are random strings, so the name alone identifies the row
  private getRow = (categoryName: string) => this.page.locator('article').filter({ hasText: categoryName })

}
