import { npTimePeriods } from "./nepaliTimePeriod.js";
import { bgImages } from "./bgImages.js";

/**
 * Returns the index of the current Nepali time period for a given Date.
 * @param {Date} date
 * @returns {number} Index in npTimePeriods (0-5)
 */
export function getNepaliTimePeriodIndex(date) {
  const hour = date.getHours();
  const minute = date.getMinutes();
  const totalMinutes = hour * 60 + minute;

  for (let i = 0; i < npTimePeriods.length; i++) {
    const [, range] = npTimePeriods[i];
    const [start, end] = range.split("–");
    const [startH, startM] = start.split(":").map(Number);
    const [endH, endM] = end.split(":").map(Number);
    const startMin = startH * 60 + startM;
    const endMin = endH * 60 + endM;

    if (startMin < endMin) {
      if (totalMinutes >= startMin && totalMinutes < endMin) {
        return i;
      }
    } else {
      // Overnight range (e.g., राति)
      if (totalMinutes >= startMin || totalMinutes < endMin) {
        return i;
      }
    }
  }
  // Fallback (should not happen)
  return 0;
}

/**
 * Returns the background image URL for the current Nepali time period.
 * @param {Date} date
 * @returns {string} Image URL (imported by Vite)
 */
export function getTimePeriodBgImage(date) {
  const idx = getNepaliTimePeriodIndex(date);
  return bgImages[idx];
}
