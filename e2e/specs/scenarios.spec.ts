import { test, expect } from '@playwright/test'
import { setupClerkTestingToken } from '@clerk/testing/playwright'

test.describe('Home Scenarios', () => {
  test('User can view the home page', async ({ page }) => {
    await setupClerkTestingToken({ page })
    await page.goto('/')
    await expect(page.locator('body')).toBeVisible()
  })
})

test.describe('Profile Scenarios', () => {
  test('Profile page loads correctly', async ({ page }) => {
    await setupClerkTestingToken({ page })
    await page.goto('/anaclumos')
    await expect(page.locator('body')).toBeVisible()
  })
})

test.describe('Question Scenarios', () => {
  test('User can open question drawer on profile', async ({ page }) => {
    await setupClerkTestingToken({ page })
    await page.goto('/anaclumos')
    const askButton = page.getByRole('button', { name: /ask|question|궁금/i })
    if (await askButton.isVisible().catch(() => false)) {
      await askButton.click()
      await expect(page.locator('textarea')).toBeVisible()
    }
  })
})

test.describe('Mobile Scenarios', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('User can view home on mobile viewport', async ({ page }) => {
    await setupClerkTestingToken({ page })
    await page.goto('/')
    await expect(page.locator('body')).toBeVisible()
  })
})
