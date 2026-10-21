import { APIResponse } from '@playwright/test';
import { test, expect } from '../fixtures/api-fixtures';
import { BookingClient } from '../clients/BookingClient';
import { adminCredentials } from '../test-data/booking';

/**
 * Response-time checks per endpoint. The limit is generous because Restful Booker runs on a
 * free host shared by many testers; the fixtures make a first request, so a cold start does
 * not count against these measurements. Each test records its timing in the report.
 */
const RESPONSE_TIME_LIMIT_MS = 3000;

interface TimedCase {
  name: string;
  call: (client: BookingClient, bookingId: number) => Promise<APIResponse>;
  expectedStatus: number;
}

const cases: TimedCase[] = [
  { name: 'GET /booking (list)', call: (c) => c.getBookingIds(), expectedStatus: 200 },
  { name: 'GET /booking/:id', call: (c, id) => c.getBooking(id), expectedStatus: 200 },
  {
    name: 'POST /auth',
    call: (c) => c.auth(adminCredentials().username, adminCredentials().password),
    expectedStatus: 200,
  },
];

test.describe('Response times', () => {
  for (const { name, call, expectedStatus } of cases) {
    test(`${name} responds within ${RESPONSE_TIME_LIMIT_MS} ms @regression`, async ({ bookingClient, createdBooking }, testInfo) => {
      const started = performance.now();
      const response = await call(bookingClient, createdBooking.id);
      const elapsed = Math.round(performance.now() - started);

      testInfo.annotations.push({ type: 'response time', description: `${elapsed} ms` });

      expect(response.status()).toBe(expectedStatus);
      expect(elapsed, `${name} took ${elapsed} ms`).toBeLessThan(RESPONSE_TIME_LIMIT_MS);
    });
  }
});
