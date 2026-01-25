import { type Page, type Locator } from '@playwright/test';

export class ProfilePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(username: string) {
    await this.page.goto(`/${username}`);
  }

  getDisplayName(): Locator {
    return this.page.getByRole('heading').first();
  }

  async openQuestionDrawer() {
    await this.page.getByRole('button', { name: 'What do you want to ask?' }).click();
  }

  async fillQuestion(text: string) {
    await this.page.locator('textarea[name="question"]').fill(text);
  }

  async selectAnonymous() {
    await this.page.locator('button').filter({ hasText: 'Anonymous' }).click();
  }

  async selectIdentified() {
    await this.page.locator('button').filter({ hasText: 'Identified' }).click();
  }

  async submitQuestion() {
    await this.page.getByRole('button', { name: 'Send a question' }).click();
  }

  async expectQuestionSent() {
    await this.page.getByText('Question sent!').waitFor();
  }

  getAnsweredQuestions(): Locator {
    return this.page.locator('[class*="answered"]');
  }

  async shareProfile() {
    await this.page.getByRole('button', { name: 'Share link' }).click();
  }
}
