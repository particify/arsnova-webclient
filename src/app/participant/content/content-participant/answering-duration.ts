export function formatAnsweringDuration(
  durationMs: number | null | undefined
): string | undefined {
  return durationMs != null ? (durationMs / 1000).toFixed(2) : undefined;
}
