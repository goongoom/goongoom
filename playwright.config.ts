import path from 'node:path'
import { defineConfig, devices } from '@playwright/test'

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000
const baseURL = `http://localhost:${PORT}`

export default defineConfig({
  testDir: path.join(__dirname, 'e2e'),
  timeout: 30 * 1000,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  forbidOnly: Boolean(process.env.CI),
  outputDir: 'test-results/',

  reporter: process.env.CI
    ? [['html'], ['github'], ['junit', { outputFile: 'test-results/junit.xml' }]]
    : [['html'], ['list']],

  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  webServer: {
    command: process.env.CI ? 'bun run build && bun run start' : 'bun run dev',
    url: baseURL,
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
    stdout: 'ignore',
    stderr: 'pipe',
  },

  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
      dependencies: ['setup'],
    },
    {
      name: 'mobile',
      use: {
        ...devices['iPhone 14'],
      },
      dependencies: ['setup'],
    },
  ],
})
