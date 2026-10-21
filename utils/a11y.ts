import AxeBuilder from '@axe-core/playwright';
import { expect, Page, TestInfo } from '@playwright/test';

/** WCAG 2.0, 2.1 and 2.2 at levels A and AA. */
export const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

type AxeViolation = Awaited<ReturnType<AxeBuilder['analyze']>>['violations'][number];

export interface A11yOptions {
  /** axe rule ids already documented as known defects (see docs/known-defects.md). */
  knownViolations?: string[];
}

/** Turns axe violations into a readable failure message. */
export function formatViolations(violations: AxeViolation[]): string {
  if (violations.length === 0) return 'No accessibility violations';
  return [
    `${violations.length} accessibility violation(s):`,
    ...violations.map(
      (v) =>
        `- ${v.id} [${v.impact}] ${v.help}: ${v.nodes.length} element(s)\n` +
        `  e.g. ${v.nodes[0]?.target.join(' ')}\n` +
        `  ${v.helpUrl}`,
    ),
  ].join('\n');
}

/** Runs axe-core on the current page and returns the violations. */
export async function scanA11y(page: Page, options: A11yOptions = {}): Promise<AxeViolation[]> {
  let builder = new AxeBuilder({ page }).withTags(WCAG_TAGS);
  if (options.knownViolations?.length) {
    builder = builder.disableRules(options.knownViolations);
  }
  const { violations } = await builder.analyze();
  return violations;
}

/**
 * Scans the current page with axe-core, attaches the full results to the HTML report,
 * and fails with a readable list if there are violations beyond the known ones.
 */
export async function expectNoA11yViolations(page: Page, testInfo: TestInfo, options: A11yOptions = {}): Promise<void> {
  const violations = await scanA11y(page, options);

  await testInfo.attach('axe-violations.json', {
    body: JSON.stringify(violations, null, 2),
    contentType: 'application/json',
  });

  expect(violations.map((v) => v.id), formatViolations(violations)).toEqual([]);
}
