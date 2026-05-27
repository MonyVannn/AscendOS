import { format } from "date-fns";

export function formatActivityDate(dateInput: string | number): string {
  const date = new Date(dateInput);
  return format(date, "MMM d, yyyy · h:mmaaa").replace(/AM|PM/, (m) => m.toLowerCase());
}

export function formatActivityDateStacked(dateInput: string | number) {
  const date = new Date(dateInput);
  return {
    date: format(date, "MMM d, yyyy"),
    time: "· " + format(date, "h:mmaaa").replace(/AM|PM/, (m) => m.toLowerCase())
  };
}
