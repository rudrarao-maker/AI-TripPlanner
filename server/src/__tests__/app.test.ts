import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app';

describe('App endpoints', () => {
  it('should return 404 for unknown routes', async () => {
    const res = await request(app).get('/api/v1/unknown-route');
    expect(res.status).toBe(404);
  });

  it('should have health check route', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  it('should return base API message', async () => {
    const res = await request(app).get('/api/v1');
    expect(res.status).toBe(200);
    expect(res.body.message).toContain("TripCraft API v1");
  });
});
