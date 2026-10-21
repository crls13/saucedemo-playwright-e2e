import { test, expect } from '../fixtures/api-fixtures';
import { Booking, CreateBookingResponseSchema } from '../schemas/booking.schema';
import { buildBooking, isoDateFromToday } from '../test-data/booking';

interface DataCase {
  title: string;
  overrides: Partial<Booking>;
}

/** Boundary and edge-case values that a real booking could legitimately contain. */
const validEdgeCases: DataCase[] = [
  { title: 'a total price of zero', overrides: { totalprice: 0 } },
  { title: 'a very large total price', overrides: { totalprice: 1_000_000 } },
  { title: 'no deposit paid', overrides: { depositpaid: false } },
  { title: 'accented and ñ characters in the first name', overrides: { firstname: 'José Ñandú' } },
  { title: 'a 100-character first name', overrides: { firstname: 'A'.repeat(100) } },
  {
    title: 'check-in and check-out on the same day',
    overrides: { bookingdates: { checkin: isoDateFromToday(20), checkout: isoDateFromToday(20) } },
  },
  { title: 'no additional needs', overrides: { additionalneeds: undefined } },
];

test.describe('Booking data edge cases', () => {
  for (const { title, overrides } of validEdgeCases) {
    test(`stores a booking with ${title} unchanged @regression`, async ({ bookingClient, authToken }) => {
      const booking = buildBooking(overrides);

      const created = await bookingClient.createBooking(booking);
      expect(created.status()).toBe(200);
      const { bookingid, booking: echoed } = CreateBookingResponseSchema.parse(await created.json());

      try {
        expect(echoed).toEqual(booking);

        const fetched = await bookingClient.getBooking(bookingid);
        expect(await fetched.json()).toEqual(booking);
      } finally {
        await bookingClient.deleteBooking(bookingid, authToken);
      }
    });
  }
});
