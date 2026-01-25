# Goongoom E2E Tests

End-to-end tests using Playwright + Clerk Testing.

## Structure

```
e2e/
├── .auth/           # Auth state storage (gitignored)
├── specs/           # Test scenarios
└── auth.setup.ts    # Clerk auth setup
```

## Prerequisites

1. **Environment variables** (in `.env`):
   ```
   CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   ```

2. **Test user in Convex**: Ensure a user with username `anaclumos` exists in the Convex users table.

## Running Tests

```bash
# Run all e2e tests
bun run test:e2e

# Run specific project
bunx playwright test --project=chromium

# Run in UI mode
bunx playwright test --ui
```

## How It Works

1. `clerkSetup()` obtains a Testing Token to bypass bot detection
2. `setupClerkTestingToken({ page })` injects the token per-test
3. Tests navigate to pages and verify UI elements
