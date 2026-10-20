import { test, expect } from '../fixtures/api-fixtures';

test('health check: API is up @smoke', async ({ bookingClient }) => {
  const response = await bookingClient.ping();
  expect(response.status()).toBe(201);
});
