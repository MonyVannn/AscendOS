import { format } from "date-fns";

export function formatActivityDate(dateString: string): string {
  const date = new Date(dateString);
  return format(date, "MMM d, yyyy · h:mmaaa").replace(/AM|PM/, (m) => m.toLowerCase());
}

export function formatActivityDateStacked(dateString: string) {
  const date = new Date(dateString);
  return {
    date: format(date, "MMM d, yyyy"),
    time: "· " + format(date, "h:mmaaa").replace(/AM|PM/, (m) => m.toLowerCase())
  };
}
