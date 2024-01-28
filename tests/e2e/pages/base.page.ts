import { Page } from "@playwright/test";

export class BasePage {
  protected readonly baseUrl: string
  constructor(public basePage: Page) {
    this.baseUrl = process.env['URL']!
  }

  protected async goto(url: string ) {
    await this.basePage.goto(url)
  }

  protected async fillData(text: string, value: string) {
    await this.basePage.getByLabel(text).fill(value)
  }

  protected async pressByLabel(text: string, value: string) {
    await this.basePage.getByLabel(text).press(value)
  }

  protected async clickByLabel(text: string) {
    await this.basePage.getByLabel(text).click()
  }

  protected async clickByText(text: string) {
    await this.basePage.getByText(text).click()
  }

  public async clickMenu() {
    await this.basePage.locator('button').filter({ hasText: 'menu' }).click()
  }

  public async clickByRoleName(role: roleTye, value: string) {
    await this.basePage.getByRole(role, { name: value }).click()
    await this.wait()
  }

  public async close() {
    await this.basePage.close()
  }

  public async clickById(id: string) {
    const buildItemList = await this.basePage.$(`#${id}`)
    if (buildItemList) {
      await buildItemList.click()
    } else {
      throw new Error('The item with the provided ID was not found.')
    }
  }

  public async getInputById(text: string) {
    const buildItemList = await this.basePage.$(`#${text}`)
    if (buildItemList) {
      return buildItemList
    } else {
      throw new Error('The item with the provided ID was not found.')
    }
  }
  
  public async wait(url: string = this.baseUrl) {
    await this.basePage.waitForURL(url)
  }
}
