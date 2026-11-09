import { startOfTodayIST } from "./eventDates";

// Dates are stored as midnight UTC of their day, like the rest of the events API
export interface SortableEvent {
  date: Date;     // first day
  endDate?: Date; // last day, for multi-day events (optional)
}

export function sortEvents<T extends SortableEvent>(events: T[], now = new Date()) {
  const today = startOfTodayIST(now).getTime();
  const lastDay = (e: T) => (e.endDate ?? e.date).getTime();

  const past: T[] = [];
  const current: T[] = [];
  const upcoming: T[] = [];

  for (const e of events) {
    if (lastDay(e) < today) past.push(e);
    else if (e.date.getTime() <= today) current.push(e); // today is between first and last day
    else upcoming.push(e);
  }

  const byStart = (a: T, b: T) => a.date.getTime() - b.date.getTime();
  return {
    past: past.sort((a, b) => lastDay(b) - lastDay(a)), // most recently finished first
    current: current.sort(byStart),
    upcoming: upcoming.sort(byStart), // soonest first
  };
}
