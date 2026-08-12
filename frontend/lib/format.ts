import { differenceInCalendarDays, format, isValid, parseISO } from "date-fns"

export function formatDueDate(value: string): string {
  const date = parseISO(value)
  return isValid(date) ? format(date, "dd MMM yyyy") : value
}

export function formatDateTime(value: string): string {
  const date = parseISO(value)
  return isValid(date) ? format(date, "dd MMM yyyy, HH:mm") : value
}

/** Negative when the due date has passed, 0 when it is today. */
export function daysUntilDue(value: string): number | null {
  const date = parseISO(value)
  return isValid(date) ? differenceInCalendarDays(date, new Date()) : null
}

export function toDateInputValue(value: string): string {
  const date = parseISO(value)
  return isValid(date) ? format(date, "yyyy-MM-dd") : ""
}

export function todayAsDateInputValue(): string {
  return format(new Date(), "yyyy-MM-dd")
}
