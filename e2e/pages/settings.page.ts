import { type Page } from '@playwright/test';

export class SettingsPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/settings/profile');
  }

  async fillBio(text: string) {
    await this.page.locator('textarea#bio').fill(text);
  }

  async blurBio() {
    await this.page.locator('textarea#bio').blur();
  }

  async expectProfileUpdated() {
    await this.page.getByText('Profile updated!').waitFor();
  }

  async selectSignatureColor(index: number) {
    await this.page.locator('input[type="radio"][name="signatureColor"]').nth(index).click();
  }

  async fillInstagram(handle: string) {
    await this.page.locator('input[name="instagram"]').fill(handle);
  }

  async fillTwitter(handle: string) {
    await this.page.locator('input[name="twitter"]').fill(handle);
  }
}
