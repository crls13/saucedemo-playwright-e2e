# Known Defects: Restful Booker API

Defects found by the API suite, written up as Jira tickets (wiki markup). Each one has a matching `test.fail()` test in `api/tests/known-defects.spec.ts`.

---

## DEFECT-001

```
Summary: [Booking API] POST /booking with missing required fields returns 500 instead of 400
Issue Type: Bug
Priority: Medium
Labels: api, validation, automated-test
Environment: https://restful-booker.herokuapp.com | Playwright API tests

h3. Steps to Reproduce
# Send POST /booking with header Accept: application/json
# Use body: {code}{"firstname": "OnlyAFirstName"}{code}

h3. Expected Result
400 Bad Request with a message naming the missing fields (lastname, totalprice, depositpaid, bookingdates).

h3. Actual Result
500 Internal Server Error with no useful message.

h3. Reproducibility
Always

h3. Impact
Clients cannot tell a validation problem from a server outage, and monitoring counts user input errors as server failures.

h3. Evidence
* Test: api/tests/known-defects.spec.ts › "creating a booking with missing fields should return 400"
```

---

## DEFECT-002

```
Summary: [Auth API] POST /auth with wrong password returns 200 instead of 401
Issue Type: Bug
Priority: Low
Labels: api, auth, automated-test
Environment: https://restful-booker.herokuapp.com | Playwright API tests

h3. Steps to Reproduce
# Send POST /auth
# Use body: {code}{"username": "admin", "password": "wrong-password"}{code}

h3. Expected Result
401 Unauthorized.

h3. Actual Result
200 OK with body {code}{"reason": "Bad credentials"}{code}

h3. Reproducibility
Always

h3. Impact
Clients that check only the status code treat a failed login as a success, and the next request fails in a confusing way.

h3. Evidence
* Test: api/tests/known-defects.spec.ts › "failed authentication should return 401"
```

---

## DEFECT-003

```
Summary: [Booking API] POST /booking accepts a check-out date before the check-in date
Issue Type: Bug
Priority: High
Labels: api, validation, business-rule, automated-test
Environment: https://restful-booker.herokuapp.com | Playwright API tests

h3. Steps to Reproduce
# Send POST /booking with header Accept: application/json
# Use a valid body where bookingdates.checkout is 5 days before bookingdates.checkin, e.g.
{code}"bookingdates": {"checkin": "2026-11-10", "checkout": "2026-11-05"}{code}

h3. Expected Result
400 Bad Request with a message that check-out must be on or after check-in. No booking is created.

h3. Actual Result
200 OK. The booking is created and stored with the impossible date range.

h3. Reproducibility
Always

h3. Impact
Invalid bookings reach the system, which can break availability, invoicing and reporting that assume a positive stay length.

h3. Evidence
* Test: api/tests/known-defects.spec.ts › "a booking with check-out before check-in should be rejected with 400"
```
