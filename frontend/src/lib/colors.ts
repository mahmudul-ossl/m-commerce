/** Swatch colors for variant color names. Unknown names fall back to a neutral gray. */
const SWATCHES: Record<string, string> = {
  black: "#18181b",
  white: "#ffffff",
  navy: "#1f2a44",
  beige: "#d8c6a5",
  olive: "#6b6b3a",
  maroon: "#6d1f2a",
  red: "#c0392b",
  blue: "#2f5d9e",
  green: "#3f7d4f",
  grey: "#9ca3af",
  gray: "#9ca3af",
  brown: "#7b5235",
  pink: "#e8a5b5",
  gold: "#c8a24a",
  silver: "#c0c4cc",
};

export function swatchColor(name: string): string {
  return SWATCHES[name.toLowerCase()] ?? "#a1a1aa";
}
