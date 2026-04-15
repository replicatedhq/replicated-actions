/**
 * Splits a string of helm flags into an array of arguments,
 * preserving quoted substrings as single tokens and stripping
 * the surrounding quotes.
 */
export function parseExtraFlags(input: string): string[] {
  const tokens = input.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [];
  return tokens.map((t) => t.replace(/^["']|["']$/g, ""));
}
