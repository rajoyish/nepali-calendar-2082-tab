// src/nepaliTimePeriod.js

export const npTimePeriods = [
  ["बिहान", "05:00–12:00"],
  ["मध्यान्ह", "12:00–13:00"],
  ["अपरान्ह", "13:00–17:00"],
  ["साँझ", "17:00–19:00"],
  ["बेलुका", "19:00–21:00"],
  ["राति", "21:00–05:00"],
];

/**
 * Given a Date object (Nepal time), returns the Nepali time period string.
 * @param {Date} nepalTime
 * @returns {string} Nepali time period indicator
 */
export function getNepaliTimePeriod(nepalTime) {
  const hour = nepalTime.getHours();
  const minute = nepalTime.getMinutes();

  // Convert to minutes since midnight
  const totalMinutes = hour * 60 + minute;

  // Helper to check if time is in a range
  function inRange(start, end) {
    // start and end in "HH:MM"
    const [startH, startM] = start.split(":").map(Number);
    const [endH, endM] = end.split(":").map(Number);
    const startMin = startH * 60 + startM;
    const endMin = endH * 60 + endM;
    if (startMin < endMin) {
      return totalMinutes >= startMin && totalMinutes < endMin;
    } else {
      // Overnight range (e.g., राति)
      return totalMinutes >= startMin || totalMinutes < endMin;
    }
  }

  for (const [label, range] of npTimePeriods) {
    const [start, end] = range.split("–");
    if (inRange(start, end)) {
      return label;
    }
  }
  // Fallback (should not happen)
  return "";
}

/**
 * Appends the Nepali time period indicator in front of [data-clock]
 * Example: "बिहान Sunday, May 25, 2025"
 */
export function renderNepaliTimePeriod() {
  // Get Nepal time
  const now = new Date();
  const nepalOffsetMinutes = 5 * 60 + 45;
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const nepalTime = new Date(utc + nepalOffsetMinutes * 60000);

  const period = getNepaliTimePeriod(nepalTime);

  const el = document.querySelector("[data-clock]");
  if (!el) return;
  // Remove any previous period (if re-rendering)
  const dateText = el.textContent.replace(
    /^(बिहान|मध्यान्ह|अपरान्ह|साँझ|बेलुका|राति)\s+/,
    ""
  );
  el.textContent = `${period} ${dateText}`;
}
