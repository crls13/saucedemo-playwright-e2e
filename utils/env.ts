/** Reads a required environment variable and fails with a clear message if it is missing. */
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing environment variable ${name}. Copy .env.example to .env (or set it in CI secrets).`,
    );
  }
  return value;
}

/** Parses a price label like "$29.99" or "Total: $32.39" into a number. */
export function parsePrice(text: string | null): number {
  const match = text?.match(/\$(\d+(?:\.\d{2})?)/);
  if (!match) throw new Error(`Could not parse a price from "${text}"`);
  return Number(match[1]);
}
