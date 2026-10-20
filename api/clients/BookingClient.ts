import { APIRequestContext, APIResponse } from '@playwright/test';
import { AuthTokenSchema, Booking } from '../schemas/booking.schema';

export interface BookingFilters {
  firstname?: string;
  lastname?: string;
  checkin?: string;
  checkout?: string;
}

/**
 * API object for Restful Booker: the API equivalent of a page object.
 * Methods return the raw APIResponse so tests can assert on status codes.
 */
export class BookingClient {
  constructor(private readonly request: APIRequestContext) {}

  ping(): Promise<APIResponse> {
    return this.request.get('/ping');
  }

  auth(username: string, password: string): Promise<APIResponse> {
    return this.request.post('/auth', { data: { username, password } });
  }

  /** Logs in and returns a token, failing loudly if the API refuses. */
  async getToken(credentials: { username: string; password: string }): Promise<string> {
    const response = await this.auth(credentials.username, credentials.password);
    const body = await response.json();
    const parsed = AuthTokenSchema.safeParse(body);
    if (!response.ok() || !parsed.success) {
      throw new Error(`Authentication failed (${response.status()}): ${JSON.stringify(body)}`);
    }
    return parsed.data.token;
  }

  getBookingIds(filters: BookingFilters = {}): Promise<APIResponse> {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value !== undefined),
    ) as Record<string, string>;
    return this.request.get('/booking', { params });
  }

  getBooking(id: number): Promise<APIResponse> {
    return this.request.get(`/booking/${id}`);
  }

  /** Accepts any object so negative tests can send invalid payloads. */
  createBooking(booking: Booking | Record<string, unknown>): Promise<APIResponse> {
    return this.request.post('/booking', { data: booking });
  }

  updateBooking(id: number, booking: Booking, token?: string): Promise<APIResponse> {
    return this.request.put(`/booking/${id}`, { data: booking, headers: this.authHeader(token) });
  }

  partialUpdateBooking(id: number, changes: Partial<Booking>, token?: string): Promise<APIResponse> {
    return this.request.patch(`/booking/${id}`, { data: changes, headers: this.authHeader(token) });
  }

  deleteBooking(id: number, token?: string): Promise<APIResponse> {
    return this.request.delete(`/booking/${id}`, { headers: this.authHeader(token) });
  }

  private authHeader(token?: string): Record<string, string> {
    return token ? { Cookie: `token=${token}` } : {};
  }
}
