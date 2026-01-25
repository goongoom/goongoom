import { type Page, type Locator } from '@playwright/test';

export class InboxPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/inbox');
  }

  getTitle(): Locator {
    return this.page.getByRole('heading', { name: 'Inbox' });
  }

  getPendingQuestions(): Locator {
    return this.page.locator('button').filter({ hasText: /Anonymous|Identified/ });
  }

  async clickQuestion(index: number = 0) {
    await this.getPendingQuestions().nth(index).click();
  }

  async fillAnswer(text: string) {
    await this.page.getByPlaceholder('Type your answer…').fill(text);
  }

  async submitAnswer() {
    await this.page.getByRole('button', { name: 'Answer' }).click();
  }

  async expectAnswerCreated() {
    await this.page.getByRole('button', { name: 'Answer' }).waitFor({ state: 'hidden' });
  }

  async openDeclineDialog() {
    await this.page.getByRole('button', { name: 'Decline question' }).click();
  }

  async confirmDecline() {
    await this.page.getByRole('button', { name: 'Decline' }).click();
  }
}
