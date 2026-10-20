import { test, expect } from '../fixtures/api-fixtures';
import { BookingSchema, CreateBookingResponseSchema } from '../schemas/booking.schema';
import { buildBooking } from '../test-data/booking';

test.describe('Booking CRUD', () => {
  test('create returns a new id and echoes the booking @smoke', async ({ bookingClient, authToken }) => {
    const booking = buildBooking();

    const response = await bookingClient.createBooking(booking);

    expect(response.status()).toBe(200);
    const body = CreateBookingResponseSchema.parse(await response.json());
    expect(body.booking).toEqual(booking);

    await bookingClient.deleteBooking(body.bookingid, authToken);
  });

  test('get by id returns the stored booking and matches the contract @smoke', async ({ bookingClient, createdBooking }) => {
    const response = await bookingClient.getBooking(createdBooking.id);

    expect(response.status()).toBe(200);
    const body = BookingSchema.parse(await response.json());
    expect(body).toEqual(createdBooking.data);
  });

  test('full update (PUT) replaces every field @regression', async ({ bookingClient, createdBooking, authToken }) => {
    const updated = buildBooking({ firstname: 'Luis', totalprice: 420, depositpaid: false, additionalneeds: 'Late checkout' });

    await test.step('send the update', async () => {
      const response = await bookingClient.updateBooking(createdBooking.id, updated, authToken);
      expect(response.status()).toBe(200);
      expect(await response.json()).toEqual(updated);
    });

    await test.step('confirm the change was saved', async () => {
      const response = await bookingClient.getBooking(createdBooking.id);
      expect(await response.json()).toEqual(updated);
    });
  });

  test('partial update (PATCH) changes only the given fields @regression', async ({ bookingClient, createdBooking, authToken }) => {
    const changes = { firstname: 'Maria', totalprice: 999 };

    const response = await bookingClient.partialUpdateBooking(createdBooking.id, changes, authToken);

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ ...createdBooking.data, ...changes });
  });

  test('delete removes the booking @regression', async ({ bookingClient, createdBooking, authToken }) => {
    await test.step('delete it', async () => {
      const response = await bookingClient.deleteBooking(createdBooking.id, authToken);
      // Restful Booker answers 201 Created on delete (204 would be conventional).
      expect(response.status()).toBe(201);
    });

    await test.step('it can no longer be fetched', async () => {
      const response = await bookingClient.getBooking(createdBooking.id);
      expect(response.status()).toBe(404);
    });
  });
});
