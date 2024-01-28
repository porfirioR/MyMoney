import {test as base }from "@playwright/test";
import { CategoryPage, ConfigurationPage, LoginPage } from "../pages/index";

export const test = base.extend<{
  loginPage: LoginPage
  categoryPage: CategoryPage,
  configurationPage: ConfigurationPage
}>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page))
  },
  categoryPage: async ({ page }, use) => {
    await use(new CategoryPage(page))
  },
  configurationPage: async ({ page }, use) => {
    await use(new ConfigurationPage(page))
  }
})