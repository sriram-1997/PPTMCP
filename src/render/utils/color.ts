export function normalizeColor(value: string | undefined, fallback: string): string {
  if (!value || typeof value !== "string") {
    return fallback;
  }
  return value.replace("#", "").toUpperCase();
}
