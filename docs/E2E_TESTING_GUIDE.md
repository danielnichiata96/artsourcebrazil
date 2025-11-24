# E2E Testing Guide

## Overview

This guide explains how to run and maintain E2E tests for RemoteJobsBR, with a focus on the Admin Dashboard authentication flow.

---

## Prerequisites

1. **Development server running:**
   ```bash
   npm run dev
   ```

2. **Environment variables configured:**
   ```bash
   # .env file must contain:
   ADMIN_TOKEN=your_admin_token_here
   ```

3. **Playwright installed:**
   ```bash
   npx playwright install chromium
   ```

---

## Running E2E Tests

### Run All E2E Tests
```bash
npm run test:e2e
```

### Run Specific Test File
```bash
npx playwright test admin-dashboard
```

### Run with UI Mode (Debug)
```bash
npx playwright test --ui
```

### Run in Debug Mode
```bash
npx playwright test --debug
```

---

## Authentication Strategy

### Problem
Admin dashboard tests require authentication, but:
- Cookie-based auth in tests was unreliable
- Login flow in every test is slow
- SSR cookie handling in Astro needed special configuration

### Solution: Playwright Storage State

We use Playwright's `storageState` feature to authenticate once and reuse the session:

1. **Setup Project** (`tests/e2e/auth.setup.ts`):
   - Runs **before** all tests
   - Logs in as admin
   - Saves authentication state to `playwright/.auth/admin.json`

2. **Authenticated Tests**:
   - Load saved storage state
   - Skip login flow
   - Run with full authentication

### File Structure
```
tests/e2e/
├── auth.setup.ts           # Authentication setup (runs first)
├── admin-dashboard.spec.ts # Admin dashboard tests
└── ...other tests...

playwright/
└── .auth/
    └── admin.json          # Saved authentication state (gitignored)
```

---

## Test Structure

### Unauthenticated Tests
```typescript
test.describe('Admin Dashboard - Unauthenticated', () => {
  test('should show login form', async ({ page }) => {
    // Tests that don't require authentication
  });
});
```

### Authenticated Tests
```typescript
test.describe('Admin Dashboard - Authenticated', () => {
  // Use saved authentication state
  test.use({ 
    storageState: path.join(__dirname, '../../playwright/.auth/admin.json') 
  });

  test('should display dashboard', async ({ page }) => {
    // These tests run with authentication
  });
});
```

---

## Playwright Configuration

### Key Settings (`playwright.config.ts`)

```typescript
{
  fullyParallel: false,      // Sequential execution
  workers: 1,                // Single worker
  timeout: 30000,            // 30s test timeout
  actionTimeout: 10000,      // 10s action timeout
  navigationTimeout: 15000,  // 15s navigation timeout
  
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,  // Runs first
    },
    {
      name: 'chromium',
      dependencies: ['setup'],     // Waits for setup
    },
  ],
}
```

---

## Test Workflow

### Step-by-Step Execution

1. **Setup Project Runs:**
   ```
   ✓ tests/e2e/auth.setup.ts - Authenticate as admin
     - Navigates to /admin/drafts
     - Fills in password
     - Clicks login
     - Verifies dashboard loads
     - Saves authentication state
   ```

2. **Chromium Tests Run:**
   ```
   ✓ Unauthenticated tests
     - Login form display
     - Login rejection
   
   ✓ Authenticated tests (using saved state)
     - Dashboard display
     - Empty state / draft cards
     - Logout button
     - Pending count
   ```

---

## Debugging

### View Saved Authentication State
```bash
cat playwright/.auth/admin.json
```

### Clear Authentication State
```bash
rm -rf playwright/.auth/
```

### Run Setup Only
```bash
npx playwright test auth.setup
```

### View Test Report
```bash
npx playwright show-report
```

### Run with Headed Browser
```bash
npx playwright test --headed
```

---

## Common Issues

### Issue: Setup fails with "Login button not found"

**Cause:** Development server not running or slow to start

**Solution:**
```bash
# Start server manually first
npm run dev

# Wait for server to be ready (check http://localhost:4321)
# Then run tests
npm run test:e2e
```

### Issue: Tests fail with "storageState file not found"

**Cause:** Setup project didn't run or failed

**Solution:**
```bash
# Delete cached state
rm -rf playwright/.auth/

# Run tests again (setup will run automatically)
npm run test:e2e
```

### Issue: "Authentication failed" in setup

**Cause:** Wrong `ADMIN_TOKEN` in `.env`

**Solution:**
```bash
# Verify token in .env matches your actual admin token
cat .env | grep ADMIN_TOKEN

# Test login manually:
# 1. Go to http://localhost:4321/admin/drafts
# 2. Use the token from .env
# 3. Verify you can log in
```

### Issue: Tests timeout

**Cause:** Server is slow or tests are waiting for elements that don't exist

**Solution:**
```bash
# Increase timeout
npx playwright test --timeout=60000

# Or run with --debug to step through
npx playwright test --debug
```

---

## Test Coverage

### Current Status

#### Unit Tests
- ✅ **57/57 passing (100%)**
- Coverage: Core logic, email, Stripe, categories, validation

#### E2E Tests (Admin Dashboard)
- ✅ **2/2 unauthenticated tests passing**
  - Login form display
  - Login rejection with wrong password

- ✅ **5/5 authenticated tests passing** (with storage state)
  - Dashboard display after authentication
  - Empty state or draft cards rendering
  - Logout button visibility
  - Pending drafts count display
  - Authenticated user navigation

- ⏭️ **3/3 tests skipped** (require database data)
  - Draft card details display
  - Approval confirmation dialog
  - Rejection prompt dialog

**Total: 7/7 active tests passing (100%)**

---

## Best Practices

### 1. Use Storage State for Authentication
✅ **Good:**
```typescript
test.use({ storageState: 'path/to/auth.json' });
```

❌ **Avoid:**
```typescript
// Don't login in every test
test('...', async ({ page }) => {
  await page.goto('/admin/drafts');
  await page.fill('password', '...');
  await page.click('login');
  // ... rest of test
});
```

### 2. Use Semantic Selectors
✅ **Good:**
```typescript
page.locator('h1:has-text("Admin Login")')
page.getByRole('button', { name: 'Logout' })
```

❌ **Avoid:**
```typescript
page.locator('h1')  // Too generic
page.locator('.some-random-class')  // Fragile
```

### 3. Set Explicit Timeouts
✅ **Good:**
```typescript
await expect(element).toBeVisible({ timeout: 5000 });
```

❌ **Avoid:**
```typescript
await expect(element).toBeVisible();  // Uses default, may be too long
```

### 4. Handle Dynamic Content
✅ **Good:**
```typescript
const hasData = await page.locator('data').isVisible({ timeout: 3000 })
  .catch(() => false);
const hasEmpty = await page.locator('empty').isVisible({ timeout: 3000 })
  .catch(() => false);
expect(hasData || hasEmpty).toBe(true);
```

---

## Continuous Integration

### GitHub Actions Example
```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps chromium
      
      - name: Run E2E tests
        run: npm run test:e2e
        env:
          ADMIN_TOKEN: ${{ secrets.ADMIN_TOKEN }}
      
      - name: Upload test report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Further Reading

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Storage State](https://playwright.dev/docs/auth#reuse-signed-in-state)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Astro Testing Guide](https://docs.astro.build/en/guides/testing/)

---

## Troubleshooting Checklist

Before reporting E2E test issues, verify:

- [ ] Development server is running (`npm run dev`)
- [ ] Server responds at http://localhost:4321
- [ ] Admin login works manually in browser
- [ ] `ADMIN_TOKEN` is set correctly in `.env`
- [ ] Playwright is installed (`npx playwright install chromium`)
- [ ] Auth directory exists (`mkdir -p playwright/.auth`)
- [ ] No stale authentication state (`rm -rf playwright/.auth/` if needed)
- [ ] Latest dependencies installed (`npm install`)
- [ ] Tests run with correct Node version (18+)

---

## Next Steps

1. **Add more E2E tests:**
   - Job posting flow
   - Category filtering
   - Company pages
   - Blog pages

2. **Improve test stability:**
   - Add retry logic for flaky tests
   - Implement custom wait conditions
   - Add visual regression tests

3. **Enhance CI/CD:**
   - Run tests on multiple browsers
   - Generate coverage reports
   - Deploy test reports to GitHub Pages

