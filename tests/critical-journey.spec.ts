import { test, expect } from './fixtures/auth.fixture';

test.describe('Critical User Journey: Sign Up, Login, Creation, Payment, Logout', () => {

  test('User can sign up, fail validation, and succeed', async ({ page }) => {
    await page.goto('/sign-up');
    
    // Failure State: Submit empty form
    await page.getByTestId('submit-signup-button').click();
    await expect(page.getByTestId('error-message')).toBeVisible();

    // Happy Path: Sign up
    await page.getByTestId('email-input').fill(`test-${Date.now()}@example.com`);
    await page.getByTestId('password-input').fill('SecurePass123!');
    await page.getByTestId('submit-signup-button').click();
    
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('User can login, create a trip, modify it, pay, and logout', async ({ page, loginUser }) => {
    // 1. Login using fixture
    await loginUser('test-user@example.com');
    
    // 2. Trip Creation (Happy Path)
    await page.goto('/trip-planner');
    await page.getByTestId('destination-input').fill('Paris, France');
    await page.getByTestId('dates-input').fill('10/10/2026 - 10/15/2026');
    await page.getByTestId('generate-trip-btn').click();
    
    // Wait for AI generation (could take time)
    await expect(page.getByTestId('itinerary-view')).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('activity-card')).toHaveCountGreaterThan(0);

    // 3. Trip Correction / Modification
    const firstActivity = page.getByTestId('activity-card').first();
    await firstActivity.getByTestId('edit-activity-btn').click();
    await page.getByTestId('activity-title-input').fill('Eiffel Tower Tour');
    await page.getByTestId('save-activity-btn').click();
    
    await expect(firstActivity).toContainText('Eiffel Tower Tour');

    // 4. Payment
    await page.getByTestId('book-trip-btn').click();
    
    // Payment Failure State
    await page.getByTestId('card-input').fill('4000 0000 0000 0002'); // Stripe declined card
    await page.getByTestId('submit-payment-btn').click();
    await expect(page.getByTestId('payment-error')).toBeVisible();

    // Payment Happy Path
    await page.getByTestId('card-input').fill('4242 4242 4242 4242'); // Stripe success card
    await page.getByTestId('submit-payment-btn').click();
    await expect(page.getByTestId('payment-success-msg')).toBeVisible({ timeout: 10000 });

    // 5. Logout
    await page.getByTestId('user-profile-btn').click();
    await page.getByTestId('logout-btn').click();
    
    await expect(page).toHaveURL('/');
  });
});
