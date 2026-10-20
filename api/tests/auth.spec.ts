import { test, expect } from '../fixtures/api-fixtures';
import { AuthTokenSchema } from '../schemas/booking.schema';
import { adminCredentials } from '../test-data/booking';

test.describe('Auth', () => {
  test('valid credentials return a token @smoke', async ({ bookingClient }) => {
    const { username, password } = adminCredentials();
    const response = await bookingClient.auth(username, password);

    expect(response.status()).toBe(200);
    AuthTokenSchema.parse(await response.json());
  });

  test('invalid credentials do not return a token @regression', async ({ bookingClient }) => {
    const response = await bookingClient.auth('admin', 'wrong-password');
    const body = await response.json();

    // The API answers 200 here; known-defects.spec.ts tracks that it should be 401.
    expect(body).toEqual({ reason: 'Bad credentials' });
    expect(body).not.toHaveProperty('token');
  });
});
