import { Page } from "@playwright/test";

export class BasePage {
  constructor(public basePage: Page) {
  }

  protected async goto(url: string ) {
    await this.basePage.goto(url)
  }

  protected async fillData(text: string, value: string) {
    await this.basePage.getByLabel(text).fill(value)
  }

  protected async getByLabelAndPress(text: string, value: string) {
    await this.basePage.getByLabel(text).press(value)
  }

  protected async getByLabelAndClick(text: string) {
    await this.basePage.getByLabel(text).click()
  }

  protected async getByText(text: string) {
    await this.basePage.getByText(text).click()
  }

  public async close() {
    await this.basePage.close()
  }

  public async clickMenu() {
    await this.basePage.locator('button').filter({ hasText: 'menu' }).click()
  }
}
