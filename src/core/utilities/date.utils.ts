import { format, parseISO } from "date-fns";

/**
 * Formats an ISO date string to the "yyyy-MM-dd" format.
 *
 * @param dateString - The ISO date string to format.
 * @returns The formatted date string in "yyyy-MM-dd" format.
 */
export const formatISODate = (dateString: string) => {
  return format(parseISO(dateString), "yyyy-MM-dd");
};
