/** Calendar parts for a given instant in `America/Los_Angeles`. */
export function calendarPartsInLosAngeles(ms: number): {
  year: number;
  month: number;
  day: number;
} {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const s = formatter.format(new Date(ms));
  const [y, m, d] = s.split('-').map((x) => parseInt(x, 10));
  return { year: y, month: m, day: d };
}

/** Previous calendar day (for archive key) relative to `ms` interpreted in LA. */
export function yesterdayDateKeyInLosAngeles(ms: number = Date.now()): string {
  const { year, month, day } = calendarPartsInLosAngeles(ms);
  const prev = new Date(Date.UTC(year, month - 1, day - 1));
  const y = prev.getUTCFullYear();
  const m = prev.getUTCMonth() + 1;
  const d = prev.getUTCDate();
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}
