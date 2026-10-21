/**
 * k6 performance test for the Restful Booker API.
 *
 * Each virtual user runs a realistic booking journey: list bookings, create one, read it,
 * search for it, update it, and delete it, so the test leaves no data behind.
 *
 * Load is deliberately gentle (at most 5 virtual users with think time, about 5 requests/s)
 * because Restful Booker is a free public API shared by many testers.
 *
 * Run locally:  npm run perf
 * Run in CI:    Actions -> Performance tests -> Run workflow (also runs weekly)
 */
import http from 'k6/http';
import { check, fail, group, sleep } from 'k6';
import type { Options } from 'k6/options';

const BASE_URL = __ENV.BOOKER_BASE_URL || 'https://restful-booker.herokuapp.com';
// Restful Booker's public demo admin account, published in its API docs.
const USERNAME = __ENV.BOOKER_USERNAME || 'admin';
const PASSWORD = __ENV.BOOKER_PASSWORD || 'password123';

const JSON_HEADERS = { 'Content-Type': 'application/json', Accept: 'application/json' };

export const options: Options = {
  scenarios: {
    // 1 user first: proves the journey works before adding load.
    smoke: {
      executor: 'constant-vus',
      vus: 1,
      duration: '15s',
    },
    // Then ramp to 5 users, hold, and ramp down.
    load: {
      executor: 'ramping-vus',
      startTime: '15s',
      startVUs: 0,
      stages: [
        { duration: '15s', target: 5 },
        { duration: '30s', target: 5 },
        { duration: '10s', target: 0 },
      ],
      gracefulRampDown: '5s',
    },
  },
  thresholds: {
    // The run fails if any of these are broken.
    http_req_failed: ['rate<0.01'],
    checks: ['rate>0.99'],
    'http_req_duration{endpoint:list}': ['p(95)<1500'],
    'http_req_duration{endpoint:create}': ['p(95)<1500'],
    'http_req_duration{endpoint:get}': ['p(95)<1000'],
    'http_req_duration{endpoint:search}': ['p(95)<1500'],
    'http_req_duration{endpoint:update}': ['p(95)<1500'],
    'http_req_duration{endpoint:delete}': ['p(95)<1500'],
  },
};

interface SetupData {
  token: string;
}

/** Runs once before the load: gets an auth token shared by all virtual users. */
export function setup(): SetupData {
  const res = http.post(`${BASE_URL}/auth`, JSON.stringify({ username: USERNAME, password: PASSWORD }), {
    headers: JSON_HEADERS,
    tags: { endpoint: 'auth' },
  });
  const token = res.status === 200 ? (res.json('token') as string | undefined) : undefined;
  if (!token) fail(`Authentication failed (${res.status}): ${res.body}`);
  return { token };
}

function isoDateFromToday(days: number): string {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export default function (data: SetupData): void {
  const authHeaders = { ...JSON_HEADERS, Cookie: `token=${data.token}` };
  const lastname = `K6vu${__VU}i${__ITER}t${Date.now()}`;
  const booking = {
    firstname: 'Load',
    lastname,
    totalprice: 150,
    depositpaid: true,
    bookingdates: { checkin: isoDateFromToday(30), checkout: isoDateFromToday(34) },
    additionalneeds: 'Breakfast',
  };
  let id: number | undefined;

  group('browse bookings', () => {
    const res = http.get(`${BASE_URL}/booking`, { headers: JSON_HEADERS, tags: { endpoint: 'list' } });
    check(res, { 'list: status 200': (r) => r.status === 200 });
  });
  sleep(1);

  group('create a booking', () => {
    const res = http.post(`${BASE_URL}/booking`, JSON.stringify(booking), {
      headers: JSON_HEADERS,
      tags: { endpoint: 'create' },
    });
    check(res, {
      'create: status 200': (r) => r.status === 200,
      'create: returns an id': (r) => typeof r.json('bookingid') === 'number',
    });
    id = res.status === 200 ? (res.json('bookingid') as number) : undefined;
  });
  if (id === undefined) return;

  group('view and find the booking', () => {
    const get = http.get(`${BASE_URL}/booking/${id}`, { headers: JSON_HEADERS, tags: { endpoint: 'get' } });
    check(get, {
      'get: status 200': (r) => r.status === 200,
      'get: lastname matches': (r) => r.json('lastname') === lastname,
    });

    const search = http.get(`${BASE_URL}/booking?lastname=${lastname}`, {
      headers: JSON_HEADERS,
      tags: { endpoint: 'search' },
    });
    check(search, {
      'search: status 200': (r) => r.status === 200,
      'search: finds the booking': (r) => JSON.stringify(r.json()).includes(`"bookingid":${id}`),
    });
  });
  sleep(1);

  group('update the booking', () => {
    const res = http.patch(`${BASE_URL}/booking/${id}`, JSON.stringify({ totalprice: 175 }), {
      headers: authHeaders,
      tags: { endpoint: 'update' },
    });
    check(res, {
      'update: status 200': (r) => r.status === 200,
      'update: new price saved': (r) => r.json('totalprice') === 175,
    });
  });

  group('cancel the booking', () => {
    const res = http.del(`${BASE_URL}/booking/${id}`, null, { headers: authHeaders, tags: { endpoint: 'delete' } });
    // Restful Booker answers 201 on delete.
    check(res, { 'delete: status 201': (r) => r.status === 201 });
  });
  sleep(1);
}
