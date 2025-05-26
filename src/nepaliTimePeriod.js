// src/npTimePeriods.js

export const npTimePeriods = [
  ["बिहान", "05:00–12:00"],
  ["मध्यान्ह", "12:00–13:00"],
  ["अपरान्ह", "13:00–17:00"],
  ["साँझ", "17:00–19:00"],
  ["बेलुका", "19:00–21:00"],
  ["राति", "21:00–05:00"],
];

/**
 * Returns the Nepali time period label for a given Date object.
 * @param {Date} date
 * @returns {string}
 */
export function getNepaliTimePeriod(date) {
  const hour = date.getHours();
  const minute = date.getMinutes();
  const totalMinutes = hour * 60 + minute;

  for (const [label, range] of npTimePeriods) {
    const [start, end] = range.split("–");
    const [startH, startM] = start.split(":").map(Number);
    const [endH, endM] = end.split(":").map(Number);
    const startMin = startH * 60 + startM;
    const endMin = endH * 60 + endM;

    if (startMin < endMin) {
      // Normal range (e.g., बिहान, मध्यान्ह, ...)
      if (totalMinutes >= startMin && totalMinutes < endMin) {
        return label;
      }
    } else {
      // Overnight range (e.g., राति)
      if (totalMinutes >= startMin || totalMinutes < endMin) {
        return label;
      }
    }
  }
  // Fallback (should not happen)
  return "";
}
