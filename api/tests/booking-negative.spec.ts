import { test, expect } from '../fixtures/api-fixtures';
import { buildBooking, NON_EXISTENT_BOOKING_ID } from '../test-data/booking';

test.describe('Booking authorization and errors', () => {
  test('update without a token is forbidden @regression', async ({ bookingClient, createdBooking }) => {
    const response = await bookingClient.updateBooking(createdBooking.id, buildBooking());
    expect(response.status()).toBe(403);
  });

  test('update with an invalid token is forbidden @regression', async ({ bookingClient, createdBooking }) => {
    const response = await bookingClient.updateBooking(createdBooking.id, buildBooking(), 'not-a-real-token');
    expect(response.status()).toBe(403);
  });

  test('partial update without a token is forbidden @regression', async ({ bookingClient, createdBooking }) => {
    const response = await bookingClient.partialUpdateBooking(createdBooking.id, { firstname: 'Hacker' });
    expect(response.status()).toBe(403);
  });

  test('delete without a token is forbidden and the booking survives @regression', async ({ bookingClient, createdBooking }) => {
    const response = await bookingClient.deleteBooking(createdBooking.id);
    expect(response.status()).toBe(403);

    const stillThere = await bookingClient.getBooking(createdBooking.id);
    expect(stillThere.status()).toBe(200);
  });

  test('getting a booking that does not exist returns 404 @regression', async ({ bookingClient }) => {
    const response = await bookingClient.getBooking(NON_EXISTENT_BOOKING_ID);
    expect(response.status()).toBe(404);
  });
});
