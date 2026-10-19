import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { CustomerInfo } from '../test-data/checkout';
import { parsePrice } from '../utils/env';

/** Covers the three checkout steps: your information, overview, and complete. */
export class CheckoutPage extends BasePage {
  // Step one: your information
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly continueButton: Locator;
  readonly errorMessage: Locator;

  // Step two: overview
  readonly itemNames: Locator;
  readonly itemPrices: Locator;
  readonly subtotalLabel: Locator;
  readonly taxLabel: Locator;
  readonly totalLabel: Locator;
  readonly finishButton: Locator;

  // Complete
  readonly completeHeader: Locator;
  readonly backHomeButton: Locator;

  constructor(page: Page) {
    super(page);
    this.firstNameInput = page.getByPlaceholder('First Name');
    this.lastNameInput = page.getByPlaceholder('Last Name');
    this.postalCodeInput = page.getByPlaceholder('Zip/Postal Code');
    this.continueButton = page.getByRole('button', { name: 'Continue' });
    this.errorMessage = page.getByTestId('error');

    this.itemNames = page.getByTestId('inventory-item-name');
    this.itemPrices = page.getByTestId('inventory-item-price');
    this.subtotalLabel = page.getByTestId('subtotal-label');
    this.taxLabel = page.getByTestId('tax-label');
    this.totalLabel = page.getByTestId('total-label');
    this.finishButton = page.getByRole('button', { name: 'Finish' });

    this.completeHeader = page.getByTestId('complete-header');
    this.backHomeButton = page.getByRole('button', { name: 'Back Home' });
  }

  async fillInformation(info: Partial<CustomerInfo>): Promise<void> {
    if (info.firstName !== undefined) await this.firstNameInput.fill(info.firstName);
    if (info.lastName !== undefined) await this.lastNameInput.fill(info.lastName);
    if (info.postalCode !== undefined) await this.postalCodeInput.fill(info.postalCode);
    await this.continueButton.click();
  }

  async summary(): Promise<{ itemPrices: number[]; subtotal: number; tax: number; total: number }> {
    return {
      itemPrices: (await this.itemPrices.allTextContents()).map(parsePrice),
      subtotal: parsePrice(await this.subtotalLabel.textContent()),
      tax: parsePrice(await this.taxLabel.textContent()),
      total: parsePrice(await this.totalLabel.textContent()),
    };
  }

  async finish(): Promise<void> {
    await this.finishButton.click();
  }
}
