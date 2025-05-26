// src/nepaliWeekday.js

const weekdays = [
  ["Sunday", "आइतबार"],
  ["Monday", "सोमबार"],
  ["Tuesday", "मङ्गलबार"],
  ["Wednesday", "बुधबार"],
  ["Thursday", "बिहीबार"],
  ["Friday", "शुक्रबार"],
  ["Saturday", "शनिबार"],
];

/**
 * Given an English weekday, returns the Nepali equivalent.
 * @param {string} enDay
 * @returns {string}
 */
export function toNepaliWeekday(enDay) {
  for (const [en, np] of weekdays) {
    if (en === enDay) return np;
  }
  return "";
}

/**
 * Reads the English day from [data-today-en], converts to Nepali,
 * and renders to [data-np-day-of-week].
 */
export function renderNepaliDayOfWeek() {
  const elEn = document.querySelector("[data-today-en]");
  const elNp = document.querySelector("[data-np-day-of-week]");
  if (!elEn || !elNp) return;

  // The English day is the first word before a comma
  // e.g. "Sunday, May 25, 2025"
  const enDay = elEn.textContent.split(",")[0].trim();
  elNp.textContent = toNepaliWeekday(enDay);
}
