const LETTER_SIZES = ["XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"];

/** Sort sizes naturally: letter sizes (S, M, L…) first, then numeric sizes ascending. */
export function sortSizes(sizes: string[]): string[] {
  const rank = (size: string) => {
    const letter = LETTER_SIZES.indexOf(size.toUpperCase());
    if (letter !== -1) return letter;
    const number = parseFloat(size);
    return Number.isNaN(number) ? Number.MAX_SAFE_INTEGER : 1000 + number;
  };

  return [...sizes].sort((a, b) => rank(a) - rank(b));
}
