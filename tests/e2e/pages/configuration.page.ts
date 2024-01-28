import { Page } from "@playwright/test";
import { BasePage } from ".";

export class ConfigurationPage extends BasePage {
  constructor(private page: Page) {
    super(page)
  }

  public async gotoConfiguration() {
    await this.page.getByRole('button', { name: 'menu-button' }).click()
    await this.page.getByText('buildConfiguration').click()
  }

  public async changeLanguageToEnglish() {
    await this.page.locator('#mat-select-value-3').click()
    await this.page.getByRole('option', { name: 'English' }).locator('span').click()
    await this.page.getByRole('button', { name: 'Save' }).click()
  }
}
