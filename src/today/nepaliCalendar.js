import calendarData from '../calendar-data.json';
import { adToBs } from '@sbmdkl/nepali-date-converter';

// --- Helpers ---

/**
 * Converts a Nepali numeral string to a number.
 * Handles both Nepali and Western digits.
 */
function nepaliToNumber(str) {
  const np = '०१२३४५६७८९';
  return Number(
    String(str)
      .split('')
      .map((c) => (np.indexOf(c) >= 0 ? np.indexOf(c) : c))
      .join('')
  );
}

/**
 * Returns the current Nepal time as a Date object.
 */
function getNepalTime() {
  const now = new Date();
  const offset = 5 * 60 + 45;
  return new Date(now.getTime() + (now.getTimezoneOffset() + offset) * 60000);
  // return new Date('2025-10-20T12:00:00+05:45');
}

/**
 * Returns today's BS date as { year, month, day } using the converter.
 */
function getTodayBsDate() {
  const nepalTime = getNepalTime();
  const iso = nepalTime.toISOString().split('T')[0]; // "YYYY-MM-DD"
  const bsStr = adToBs(iso); // e.g. "2082-03-01"
  if (!bsStr) return null;
  const [year, month, day] = bsStr.split('-').map(Number);
  return { year, month, day };
}

/**
 * Finds the month object in calendarData for the given BS month (1-based).
 */
function findBsMonthObj(bsMonth) {
  // calendarData.months is ordered: 1=बैशाख, 2=जेठ, ...
  return calendarData.months[bsMonth - 1];
}

/**
 * Finds the date object in the month for the given BS day.
 */
function findBsDateObj(monthObj, bsDay) {
  if (!monthObj) return null;
  return monthObj.dates.find((d) => nepaliToNumber(d.date_np) === bsDay);
}

/**
 * Main: Get today's Nepali date info from calendar-data.json
 */
export function getTodayNepaliDateFull() {
  const bs = getTodayBsDate();
  if (!bs) return null;
  const monthObj = findBsMonthObj(bs.month);
  const dateObj = findBsDateObj(monthObj, bs.day);
  if (!dateObj) return null;
  return {
    ...dateObj,
    month_np: monthObj.month_np,
    year: calendarData.year,
  };
}

/**
 * Sets text content for a selector.
 */
const setText = (selector, value) => {
  const el = document.querySelector(selector);
  if (el) el.textContent = value || '';
};

/**
 * Sets display for a selector.
 */
const setDisplay = (selector, show) => {
  const el = document.querySelector(selector);
  if (el) el.style.display = show ? '' : 'none';
};

/**
 * Renders today's Nepali date to the DOM.
 */
export function renderTodayNepaliDate() {
  const today = getTodayNepaliDateFull();
  setText('[data-np-date]', today?.date_np);
  setText(
    '[data-np-month-year]',
    today ? `${today.month_np}, ${today.year}` : ''
  );
  setText('[data-np-day-tithi]', today?.tithi);

  const hasEvent = today && today.event_title;
  setText('[data-np-day-event]', hasEvent ? today.event_title : '');
  setDisplay('[data-np-day-event]', !!hasEvent);

  updateHolidayNotice(today);
}

// --- Holiday Notice ---

let lastHolidayKey = '';
let lastIsHoliday = false;

export function updateHolidayNotice(today = getTodayNepaliDateFull()) {
  const key = today ? `${today.year}-${today.month_np}-${today.date_np}` : '';
  if (key === lastHolidayKey) {
    setDisplay('.holiday-notice', lastIsHoliday);
    return;
  }
  const isHoliday = !!(
    today &&
    today.classes &&
    today.classes.includes('is-holiday')
  );
  lastHolidayKey = key;
  lastIsHoliday = isHoliday;
  setDisplay('.holiday-notice', isHoliday);
}

/**
 * Returns true if the date object is a holiday.
 * @param {object} dateObj
 * @returns {boolean}
 */
export function isHoliday(dateObj) {
  return (
    dateObj &&
    Array.isArray(dateObj.classes) &&
    dateObj.classes.includes('is-holiday')
  );
}

export function getNepaliDateForAd(adDateString) {
  // adDateString: "YYYY-MM-DD"
  // getNepaliDateForAd('2025-10-20') // run this in browser console to debug date converter
  const bsStr = adToBs(adDateString);
  if (!bsStr) return null;
  const [year, month, day] = bsStr.split('-').map(Number);
  const monthObj = calendarData.months[month - 1];
  if (!monthObj) return null;
  const npDay = monthObj.dates.find(
    (d) =>
      Number(
        String(d.date_np).replace(/[०१२३४५६७८९]/g, (c) =>
          '०१२३४५६७८९'.indexOf(c)
        )
      ) === day
  );
  if (!npDay) return null;
  return {
    ...npDay,
    month_np: monthObj.month_np,
    year: calendarData.year,
    bs: bsStr,
    ad: adDateString,
  };
}

// --- Debug: Show all matches for a given AD date (for dev) ---
export function debugDateMatching(testDate = null) {
  const t = testDate || getNepalTime();
  const iso = t.toISOString().split('T')[0];
  const bsStr = adToBs(iso);
  if (!bsStr) return [];
  const [year, month, day] = bsStr.split('-').map(Number);
  const monthObj = findBsMonthObj(month);
  if (!monthObj) return [];
  return monthObj.dates
    .filter((d) => nepaliToNumber(d.date_np) === day)
    .map((d) => ({
      nepali_date: d.date_np,
      nepali_month: monthObj.month_np,
      english_date: iso,
      tithi: d.tithi,
      event: d.event_title,
    }));
}
