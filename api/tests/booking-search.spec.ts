import { test, expect } from '../fixtures/api-fixtures';
import { BookingIdListSchema } from '../schemas/booking.schema';

test.describe('Booking search', () => {
  test('listing bookings returns ids in the expected shape @smoke', async ({ bookingClient }) => {
    const response = await bookingClient.getBookingIds();

    expect(response.status()).toBe(200);
    const ids = BookingIdListSchema.parse(await response.json());
    expect(ids.length).toBeGreaterThan(0);
  });

  test('filtering by name finds the created booking @regression', async ({ bookingClient, createdBooking }) => {
    const response = await bookingClient.getBookingIds({
      firstname: createdBooking.data.firstname,
      lastname: createdBooking.data.lastname,
    });

    expect(response.status()).toBe(200);
    const ids = BookingIdListSchema.parse(await response.json()).map((b) => b.bookingid);
    expect(ids).toEqual([createdBooking.id]);
  });

  test('filtering by a name that does not exist returns an empty list @regression', async ({ bookingClient }) => {
    const response = await bookingClient.getBookingIds({ lastname: `NoSuchGuest${Date.now()}` });

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual([]);
  });
});
