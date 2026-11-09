/**
 * Event dates are saved as midnight UTC of their calendar day ("15/11/2026" -> 2026-11-15T00:00Z),
 * which is 05:30 IST on that day. Comparing them with `new Date()` made an event turn "past"
 * at 05:30 AM on its own day. Compare with today's IST date in the same form instead,
 * so an event stays upcoming for its whole day.
 */
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

export function startOfTodayIST(now: Date = new Date()): Date {
  const ist = new Date(now.getTime() + IST_OFFSET_MS); // shift so the UTC fields read the IST date
  return new Date(Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate()));
}
