export type DataLabelMode = 'absolute' | 'percent';

/** Narrow no-break space before the sign, as the type scale expects. */
const PERCENT_SIGN = '\u202F%';

/** Every visualization labels its values through here, so they read alike. */
export function dataLabel(
  value: number,
  total: number,
  mode: DataLabelMode
): string {
  if (mode === 'percent') {
    const share = total ? (value / total) * 100 : 0;
    return share.toFixed(0) + PERCENT_SIGN;
  }
  return value.toString();
}
