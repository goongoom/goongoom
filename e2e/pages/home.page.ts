import { type Page, type Locator } from '@playwright/test';

export class HomePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/');
  }

  getTitle(): Locator {
    return this.page.getByRole('heading', { name: 'Stories on Goongoom' });
  }

  getRecentAnswers(): Locator {
    return this.page.locator('.embla__slide');
  }

  async isRedirectedToProfile(username: string): Promise<boolean> {
    try {
      await this.page.waitForURL(`/${username}`, { timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }
}
