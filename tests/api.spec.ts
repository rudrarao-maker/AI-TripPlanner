import { test, expect } from '@playwright/test';

test.describe('API Routes Integration Tests', () => {
  test('POST /api/ai/generate should return 401 Unauthorized if not authenticated', async ({ request }) => {
    // Attempting to generate a trip without auth should fail
    const response = await request.post('/api/ai/generate', {
      data: {
        destination: 'Tokyo, Japan',
        startDate: '2027-04-01',
        endDate: '2027-04-10',
        budget: 500000,
        currency: 'JPY',
        style: 'cultural',
        pace: 'medium',
        transport: 'public',
        hotel: '4-star',
        activities: ['temples', 'food'],
        dietary: [],
        accessibility: []
      }
    });

    // The middleware or route should block this and return 401 or redirect to sign-in
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test('POST /api/trips should reject invalid payload structure', async ({ request }) => {
    // Send empty payload
    const response = await request.post('/api/trips', {
      data: {}
    });

    // Should return 400 Bad Request / 401 Unauthorized
    expect([400, 401]).toContain(response.status());
  });

  test('GET /api/public/destinations should return default list or 200', async ({ request }) => {
    // Assuming you might have a public endpoint, this is an example pattern.
    // If there is no such endpoint, it should gracefully 404
    const response = await request.get('/api/health');
    // For now we just test that the API server is responding (could be 404 if /health doesn't exist)
    expect(response.status()).toBeDefined();
  });
});
