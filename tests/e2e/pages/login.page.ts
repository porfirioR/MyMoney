import { Page, expect } from "@playwright/test";
import { BasePage } from '.';
require('dotenv').config()

export class LoginPage extends BasePage {
  constructor(private page: Page) {
    super(page)
  }

  public async gotoLoginPage() {
    await this.goto('http://localhost:4200')
    await this.goto('http://localhost:4200/logout')
    await this.page.getByRole('button', { name: 'Login' }).click()
  }

  public async fillContent() {
    await this.page.locator('div').filter({ hasText: 'Email *' }).nth(3).click()
    await this.fillData('Email  *', process.env['EMAIL']!)
    await this.getByLabelAndPress('Email  *', 'Tab')
    await this.fillData('Password  *', process.env['PASSWORD']!)
    await this.page.getByRole('button', { name: 'Login' }).click()
  }

  public async logout() {
    await this.clickMenu()
    await this.getByText('exit_to_app')
  }

  public async testAssertions() {
    await expect(this.page).toHaveTitle(/Logout/)
  }
}
