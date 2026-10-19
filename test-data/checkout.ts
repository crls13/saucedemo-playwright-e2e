export interface CustomerInfo {
  firstName: string;
  lastName: string;
  postalCode: string;
}

export const validCustomer: CustomerInfo = {
  firstName: 'Ana',
  lastName: 'Pérez',
  postalCode: '0801',
};

export interface MissingFieldCase {
  field: keyof CustomerInfo;
  expectedError: string;
}

export const missingFieldCases: MissingFieldCase[] = [
  { field: 'firstName', expectedError: 'First Name is required' },
  { field: 'lastName', expectedError: 'Last Name is required' },
  { field: 'postalCode', expectedError: 'Postal Code is required' },
];

export const products = {
  backpack: 'Sauce Labs Backpack',
  bikeLight: 'Sauce Labs Bike Light',
  boltTShirt: 'Sauce Labs Bolt T-Shirt',
} as const;
