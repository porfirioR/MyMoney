import { Page, expect } from "@playwright/test";
import { BasePage } from "./base.page";
import { getRandomHexColor } from "tests/helpers/random-color";

export class CategoryPage extends BasePage {

  constructor(private page: Page) {
    super(page);
  }

  public async gotoCategory() {
    await this.clickMenu()
    await this.page.getByText('Category').click();
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

  public async createTestAssertions(categoryName: string) {
    await expect(this.page).toHaveTitle(/Category/);
    expect(this.page.getByText(`${categoryName} (user)`)).toBeDefined()
  }

  public async updateTestAssertions(categoryName: string, color: string, backgroundColor: string) {
    const text = this.getRowName(categoryName)
    await this.createTestAssertions(categoryName)
    const button = this.page.locator('span').filter({ hasText: text }).getByRole('button').nth(1)
    const buttonStyles = await button.evaluate((element) => {
      const style = window.getComputedStyle(element);
      return {
        backgroundColor: style.backgroundColor,
        color: style.color
      }
    })
    expect(buttonStyles.backgroundColor).toBe(backgroundColor);
    expect(buttonStyles.color).toBe(color);
  }

  public async saveNewCategory() {
    await this.page.getByRole('button', { name: 'Add category' }).click()
  }

  public async editCategory(categoryName: string) {
    const [color, backgroundColor] = [getRandomHexColor(), getRandomHexColor()]
    const rowName = this.getRowName(categoryName)
    await this.page.locator('span').filter({ hasText: rowName }).getByRole('button').nth(2).click()

    //Not Work
    // await this.page.locator('#color').click();
    // await this.page.locator('#color').fill('#C79ABB');
    // await this.page.locator('#background-color').click();
    // await this.page.locator('#background-color').fill(backgroundColor);

    await this.page.locator('div').filter({ hasText: 'Order' }).nth(3).click()
    await this.fillData('Order', '1')
    await this.clickByRoleName('button', 'Save')
    return [color, backgroundColor]
  }

  private getRowName = (categoryName: string) => `highlight_off fastfood${categoryName}edit`
}
