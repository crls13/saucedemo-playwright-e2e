import { test, expect } from '../fixtures/api-fixtures';
import { buildBooking, isoDateFromToday } from '../test-data/booking';

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

  test('a booking with check-out before check-in should be rejected with 400 @defect', async ({ bookingClient, authToken }) => {
    test.fail(true, 'DEFECT-003: API accepts and stores a booking whose check-out date is before its check-in date');

    const response = await bookingClient.createBooking(
      buildBooking({ bookingdates: { checkin: isoDateFromToday(10), checkout: isoDateFromToday(5) } }),
    );

    // Clean up if the API created it anyway.
    if (response.ok()) {
      const { bookingid } = await response.json();
      await bookingClient.deleteBooking(bookingid, authToken);
    }

    expect(response.status()).toBe(400);
  });
});
