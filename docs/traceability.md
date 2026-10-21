# Traceability: Sauce Demo checkout

22 test cases for the checkout flow: 11 automated, 3 partly automated, 8 manual gaps. Cases were designed with equivalence partitioning, boundary values, state transitions and error guessing. The full cases with steps are in [`test-cases/checkout-xray.csv`](test-cases/checkout-xray.csv), ready to import into Jira Xray.

## Requirements

Sauce Demo has no published spec, so these were inferred from the site's behavior.

| ID | Requirement | Test cases |
| --- | --- | --- |
| R1 | The cart lists every added product with name, quantity and price; products can be removed before checkout. | TC-016, TC-018, TC-019 |
| R2 | Checkout requires First Name, Last Name and Zip/Postal Code, and shows an error naming the first missing field. | TC-005, TC-006, TC-007, TC-008, TC-009, TC-010, TC-011, TC-016 |
| R3 | The overview shows the items, an item total equal to the sum of item prices, tax, and a total equal to item total + tax. | TC-001, TC-002, TC-003, TC-004 |
| R4 | Finish places the order, shows a confirmation, and empties the cart. | TC-001, TC-014, TC-015 |
| R5 | Cancel at any checkout step returns the user without losing the cart. | TC-012, TC-013 |
| R6 | Checkout pages are only reachable when logged in. | TC-017 |
| R7 | Checkout works on mobile viewports, meets WCAG 2.2 AA, and does not change visually without approval. | TC-020, TC-021, TC-022 |

## Test cases and coverage

| ID | Test case | Req | Priority | Type | Coverage | Automated by |
| --- | --- | --- | --- | --- | --- | --- |
| TC-001 | Purchase with two items completes and shows order confirmation | R3, R4 | Highest | Functional | Automated | checkout.spec.ts › Checkout › customer can complete a purchase with correct totals |
| TC-002 | Item total equals the sum of item prices | R3 | Highest | Functional | Automated | checkout.spec.ts › Checkout › customer can complete a purchase with correct totals (step: verify the order summary math) |
| TC-003 | Tax is 8% of the item total, rounded to cents | R3 | High | Functional | Gap | - |
| TC-004 | Total equals item total plus tax | R3 | Highest | Functional | Automated | checkout.spec.ts › Checkout › customer can complete a purchase with correct totals (step: verify the order summary math) |
| TC-005 | Continue without First Name shows "First Name is required" | R2 | High | Negative | Automated | checkout.spec.ts › Checkout › requires firstName before continuing |
| TC-006 | Continue without Last Name shows "Last Name is required" | R2 | High | Negative | Automated | checkout.spec.ts › Checkout › requires lastName before continuing |
| TC-007 | Continue without Postal Code shows "Postal Code is required" | R2 | High | Negative | Automated | checkout.spec.ts › Checkout › requires postalCode before continuing |
| TC-008 | Continue with all fields empty reports First Name first | R2 | Medium | Negative | Partial | accessibility.spec.ts › Accessibility › checkout › customer information page with an error message (reaches this state but asserts only that an error is visible) |
| TC-009 | Whitespace-only fields are rejected | R2 | Medium | Negative | Gap | - |
| TC-010 | Names with accents, ñ and apostrophes are accepted | R2 | Medium | Boundary | Gap | - |
| TC-011 | Very long postal code is handled | R2 | Low | Boundary | Gap | - |
| TC-012 | Cancel on Your Information returns to the cart with items kept | R5 | Medium | Functional | Gap | - |
| TC-013 | Cancel on Overview returns to the product list with the cart kept | R5 | Medium | Functional | Gap | - |
| TC-014 | Cart is empty after the order completes | R4 | High | Functional | Automated | checkout.spec.ts › Checkout › customer can complete a purchase with correct totals (step: finish the order) |
| TC-015 | Back Home after the order returns to the product list | R4 | Low | Functional | Gap | - |
| TC-016 | Checkout is blocked when the cart is empty | R1, R2 | Medium | Negative | Gap | - |
| TC-017 | Checkout pages redirect to login when logged out | R6 | High | Security | Partial | login.spec.ts › Login › protected pages redirect to login when logged out (covers /inventory.html only) |
| TC-018 | Cart lists added products with name, quantity and price | R1 | High | Functional | Partial | cart.spec.ts › Cart › shows the products that were added (checks names only, not quantity or price) |
| TC-019 | Removing a product from the cart updates the list and badge | R1 | Medium | Functional | Automated | cart.spec.ts › Cart › removing a product updates the cart and badge |
| TC-020 | Cart and checkout pages meet WCAG 2.2 AA (automated scan) | R7 | High | Accessibility | Automated | accessibility.spec.ts › Accessibility › cart page with items + checkout › (4 tests) |
| TC-021 | Cart, Overview and Complete pages match approved screenshots | R7 | Medium | UI | Automated | visual.spec.ts › Visual regression › cart with items / checkout overview / order complete (CI only) |
| TC-022 | Full purchase works on a mobile viewport | R7 | High | Functional | Automated | checkout.spec.ts › Checkout › customer can complete a purchase with correct totals [mobile-chrome project] |

## Gaps to automate next

In priority order. Each one is a good next test to write.

- [ ] **TC-003** Tax is 8% of the item total, rounded to cents (High)
- [ ] **TC-017** Checkout pages redirect to login when logged out (High)
- [ ] **TC-018** Cart lists added products with name, quantity and price (High)
- [ ] **TC-008** Continue with all fields empty reports First Name first (Medium)
- [ ] **TC-009** Whitespace-only fields are rejected (Medium)
- [ ] **TC-010** Names with accents, ñ and apostrophes are accepted (Medium)
- [ ] **TC-012** Cancel on Your Information returns to the cart with items kept (Medium)
- [ ] **TC-013** Cancel on Overview returns to the product list with the cart kept (Medium)
- [ ] **TC-016** Checkout is blocked when the cart is empty (Medium)
- [ ] **TC-011** Very long postal code is handled (Low)
- [ ] **TC-015** Back Home after the order returns to the product list (Low)

## Open questions

- **TC-003:** the 8% tax rate is inferred from observed totals, not from a spec.
- **TC-009, TC-016:** the site may accept whitespace-only details and an empty cart. If it does, those are defects to write up, not test errors.
- **TC-011:** no maximum length is documented for any field, so the expected result allows either behavior.
