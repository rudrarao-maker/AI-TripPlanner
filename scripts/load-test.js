import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // simulate ramp-up of traffic from 1 to 20 users over 30 seconds.
    { duration: '1m', target: 20 }, // stay at 20 users for 1 minute
    { duration: '10s', target: 0 }, // ramp-down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.01'],   // http errors should be less than 1%
  },
};

const BASE_URL = 'http://localhost:3000';

export default function () {
  // Test the home page
  const res1 = http.get(`${BASE_URL}/`);
  check(res1, {
    'homepage status is 200': (r) => r.status === 200,
  });

  // Test the explore page
  const res2 = http.get(`${BASE_URL}/explore`);
  check(res2, {
    'explore status is 200': (r) => r.status === 200,
  });

  sleep(1); // Wait for 1 second between iterations
}
