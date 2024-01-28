import { Page, expect } from "@playwright/test";
import { BasePage } from "./base.page";

export class CategoryPage extends BasePage {

  constructor(private page: Page) {
    super(page);
  }
  public async gotoCategory() {
    await this.clickMenu()
    await this.page.getByText('Category').click();
  }

  public async addCategory(categoryName: string) {
    await this.page.getByRole('button', { name: 'Add category' }).click();
    await this.getByLabelAndClick('Category name *');
    await this.fillData('Category name *', categoryName);
    await this.clickMenu();
  }

  public async gotoExpenseCategory() {
    await this.page.getByRole('tab', { name: 'Expense' }).click()
    await this.wait()
  }

  public async wait() {
    await this.page.waitForURL('http://localhost:4200/category')
  }

  public async testAssertions(categoryName: string) {
    await expect(this.page).toHaveTitle(/Category/);
    await expect(this.page.getByText(`${categoryName} (user)`)).toBeVisible()
  }
}
