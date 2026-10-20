import { test as base, expect } from '@playwright/test';
import { BookingClient } from '../clients/BookingClient';
import { Booking, CreateBookingResponseSchema } from '../schemas/booking.schema';
import { adminCredentials, buildBooking } from '../test-data/booking';

type ApiFixtures = {
  bookingClient: BookingClient;
  authToken: string;
  /** A fresh booking created before the test and deleted after it. */
  createdBooking: { id: number; data: Booking };
};

export const test = base.extend<ApiFixtures>({
  bookingClient: async ({ request }, use) => {
    await use(new BookingClient(request));
  },

  authToken: async ({ bookingClient }, use) => {
    await use(await bookingClient.getToken(adminCredentials()));
  },

  createdBooking: async ({ bookingClient, authToken }, use) => {
    const data = buildBooking();
    const response = await bookingClient.createBooking(data);
    expect(response.status(), 'setup: create booking').toBe(200);
    const { bookingid } = CreateBookingResponseSchema.parse(await response.json());

    await use({ id: bookingid, data });

    // Teardown: remove test data. Ignore the result in case the test already deleted it.
    await bookingClient.deleteBooking(bookingid, authToken);
  },
});

export { expect };
