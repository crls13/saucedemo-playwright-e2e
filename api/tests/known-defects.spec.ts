import { test, expect } from '../fixtures/api-fixtures';

/**
 * These tests assert the CORRECT behavior and are marked test.fail() because the
 * API currently gets it wrong. They show up as "expected to fail" in the report.
 * If the API is ever fixed, Playwright flags them so the marker can be removed.
 * Bug write-ups: docs/known-defects.md
 */
test.describe('Known defects', () => {
  test('creating a booking with missing fields should return 400 @defect', async ({ bookingClient }) => {
    test.fail(true, 'DEFECT-001: API returns 500 Internal Server Error instead of 400 Bad Request');

    const response = await bookingClient.createBooking({ firstname: 'OnlyAFirstName' });

    expect(response.status()).toBe(400);
  });

  test('failed authentication should return 401 @defect', async ({ bookingClient }) => {
    test.fail(true, 'DEFECT-002: API returns 200 OK with "Bad credentials" instead of 401 Unauthorized');

    const response = await bookingClient.auth('admin', 'wrong-password');

    expect(response.status()).toBe(401);
  });
});
