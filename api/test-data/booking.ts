import { Booking } from '../schemas/booking.schema';
import { requireEnv } from '../../utils/env';

/** Admin credentials for the public Restful Booker API, read from .env. */
export const adminCredentials = () => ({
  username: requireEnv('BOOKER_USERNAME'),
  password: requireEnv('BOOKER_PASSWORD'),
});

export const isoDateFromToday = (days: number): string =>
  new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

let counter = 0;

/**
 * Builds a valid booking with a unique last name, so tests never collide
 * with each other or with other people's data on the shared public API.
 */
export function buildBooking(overrides: Partial<Booking> = {}): Booking {
  const unique = `${Date.now().toString(36)}${(counter++).toString(36)}${Math.floor(Math.random() * 1e4)}`;
  return {
    firstname: 'Ana',
    lastname: `QA${unique}`,
    totalprice: 150,
    depositpaid: true,
    bookingdates: {
      checkin: isoDateFromToday(30),
      checkout: isoDateFromToday(34),
    },
    additionalneeds: 'Breakfast',
    ...overrides,
  };
}

export const NON_EXISTENT_BOOKING_ID = 999_999_999;
