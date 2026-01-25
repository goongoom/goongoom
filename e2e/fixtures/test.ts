import { test as base } from '@playwright/test';
import { HomePage } from '../pages/home.page';
import { ProfilePage } from '../pages/profile.page';
import { InboxPage } from '../pages/inbox.page';
import { SettingsPage } from '../pages/settings.page';

export const test = base.extend<{
  homePage: HomePage;
  profilePage: ProfilePage;
  inboxPage: InboxPage;
  settingsPage: SettingsPage;
}>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  profilePage: async ({ page }, use) => {
    await use(new ProfilePage(page));
  },
  inboxPage: async ({ page }, use) => {
    await use(new InboxPage(page));
  },
  settingsPage: async ({ page }, use) => {
    await use(new SettingsPage(page));
  },
});

export { expect } from '@playwright/test';
