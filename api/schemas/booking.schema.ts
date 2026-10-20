import { z } from 'zod';

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected a YYYY-MM-DD date');

/** Contract for a booking as the API stores and returns it. */
export const BookingSchema = z.object({
  firstname: z.string(),
  lastname: z.string(),
  totalprice: z.number(),
  depositpaid: z.boolean(),
  bookingdates: z.object({
    checkin: isoDate,
    checkout: isoDate,
  }),
  additionalneeds: z.string().optional(),
});

export const CreateBookingResponseSchema = z.object({
  bookingid: z.number().int().positive(),
  booking: BookingSchema,
});

export const BookingIdListSchema = z.array(z.object({ bookingid: z.number().int().positive() }));

export const AuthTokenSchema = z.object({ token: z.string().min(1) });

export type Booking = z.infer<typeof BookingSchema>;
