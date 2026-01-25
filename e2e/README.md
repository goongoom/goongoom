# Goongoom E2E Tests

End-to-end tests using Playwright + Clerk Testing.

## Structure

```
e2e/
├── .auth/           # Auth state storage (gitignored)
├── fixtures/        # Custom Playwright fixtures
├── pages/           # Page Object Models
├── specs/           # Test scenarios
└── auth.setup.ts    # Clerk auth setup
```

## Prerequisites

1. **Create test user in Clerk Dashboard:**
   - Go to Clerk Dashboard → Users → Add User
   - Phone: `+15555550100` (test phone number)
   - The `@clerk/testing` library only supports sign-in, not sign-up

2. **Environment variables** (in `.env`):
   ```
   CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   ```

## Running Tests

```bash
# Run all e2e tests
bun run test:e2e

# Run specific project
bunx playwright test --project=chromium

# Run in UI mode
bunx playwright test --ui

# Run specific spec
bunx playwright test e2e/specs/scenarios.spec.ts
```

## Test Phone Numbers

Clerk test mode accepts fictional phone numbers:
- Format: `+1 (XXX) 555-0100` to `+1 (XXX) 555-0199`
- Example: `+15555550100`
- OTP code is always `424242` (not needed with `clerk.signIn()`)
