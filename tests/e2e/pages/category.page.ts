import { Page, expect } from "@playwright/test"
import { BasePage } from "./base.page"
import { addUserToCategoryName, convertHexToRgbColor, getRandomHexColor } from "../../helpers"

export class CategoryPage extends BasePage {

  constructor(private page: Page) {
    super(page)
  }

  public async gotoCategory() {
    await this.clickMenu()
    await this.page.getByText('Category').click()
  }

  public async addCategory(categoryName: string) {
    await this.saveNewCategory()
    await this.clickByLabel('Category name *')
    await this.fillData('Category name *', categoryName)
    await this.saveNewCategory()
  }

  public async gotoExpenseCategory() {
    await this.page.getByRole('tab', { name: 'Expense' }).click()
    await this.waitToLoadPage()
  }

  public async waitToLoadPage() {
    await this.wait(`${this.baseUrl}/category`)
  }

  public async saveNewCategory() {
    await this.page.getByRole('button', { name: 'Add category' }).click()
  }

  public async editCategory(categoryName: string) {
    const [color, backgroundColor] = [getRandomHexColor(), getRandomHexColor()]
    const rowName = this.getRowName(categoryName)
    await this.page.locator('article').filter({ hasText: rowName }).getByRole('button').nth(2).click()
    await this.page.locator('div').filter({ hasText: 'Icon color *' }).nth(3).click()
    await this.clickByLabel('Icon color *')
    await this.fillData('Icon color *', color)
    await this.clickByLabel('Background color *')
    await this.fillData('Background color *', backgroundColor)

    await this.page.locator('div').filter({ hasText: 'Order' }).nth(3).click()
    await this.fillData('Order', '-1')
    await this.waitByTime(501)
    await this.clickByRoleName('button', 'Save')
    return [color, backgroundColor]
  }

  public async deleteCategory(categoryName: string) {
    const rowName = this.getRowName(addUserToCategoryName(categoryName))
    await this.page.locator('article').filter({ hasText: rowName }).getByRole('button').first().click()
    await this.page.getByRole('button', { name: 'Delete' }).click()
  }

  public async createTestAssertions(categoryName: string) {
    await expect(this.page).toHaveTitle(/Category/)
    expect(this.page.getByText(addUserToCategoryName(categoryName))).toBeDefined()
  }

  public async updateTestAssertions(categoryName: string, color: string, backgroundColor: string) {
    const text = this.getRowName(categoryName)
    await this.createTestAssertions(categoryName)
    const button = this.page.locator('article').filter({ hasText: text }).getByRole('button').nth(1)

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
    const isVisible = await this.page.isVisible(`text="${this.getRowName(categoryName)}"`)
    expect(isVisible).not.toBeTruthy()
  }

  private getRowName = (categoryName: string) => `highlight_off fastfood${categoryName}edit`

}
