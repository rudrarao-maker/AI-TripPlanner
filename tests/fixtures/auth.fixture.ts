import { test as base } from '@playwright/test';

// Extend basic test by providing an authenticated state helper
export const test = base.extend<{
  loginUser: (email: string) => Promise<void>;
}>({
  loginUser: async ({ page }, use) => {
    await use(async (email: string) => {
      // For Clerk in a real CI environment, it's often recommended to use 
      // Clerk's Testing API to bypass passwords/captcha, or set the __session cookie.
      // Here, we provide a generic UI login flow for demonstration.
      await page.goto('/sign-in');
      await page.getByTestId('email-input').fill(email);
      await page.getByTestId('continue-button').click();
      
      // Assume a test password is used for the standard flow
      await page.getByTestId('password-input').fill('TestPass123!');
      await page.getByTestId('submit-login-button').click();
      
      // Wait for navigation back to the app
      await page.waitForURL('/dashboard');
    });
  },
});

export { expect } from '@playwright/test';
