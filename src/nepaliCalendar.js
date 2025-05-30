import calendarData from './calendar-data.json';

/**
 * Returns the full Nepali date object for today's Nepal time,
 * including tithi and event_title.
 */
export function getTodayNepaliDateFull() {
  // 1. Get Nepal time
  const now = new Date();
  const nepalOffsetMinutes = 5 * 60 + 45;
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const nepalTime = new Date(utc + nepalOffsetMinutes * 60000);

  // 2. Get Gregorian year, month, day
  const year = nepalTime.getFullYear();
  const month = nepalTime.getMonth(); // 0-based
  const day = nepalTime.getDate();

  // 3. Get English month name
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const monthName = months[month];

  // 4. Search all months and all dates for a match using your logic
  for (const monthObj of calendarData.months) {
    for (const dateObj of monthObj.dates) {
      const enMonth = getExactEnglishMonth(
        monthObj.month_year_en,
        dateObj.date_en
      );
      if (
        enMonth === monthName &&
        parseInt(dateObj.date_en, 10) === day &&
        monthObj.month_year_en.includes(year.toString())
      ) {
        return {
          date_np: dateObj.date_np,
          month_np: monthObj.month_np,
          year: calendarData.year,
          tithi: dateObj.tithi,
          event_title: dateObj.event_title,
        };
      }
    }
  }
  return null;
}

/**
 * Given a month_year_en string like "Apr/May 2025" and a date_en,
 * returns the correct English month name for that date.
 */
function getExactEnglishMonth(month_year_en, date_en) {
  const [monthsPart] = month_year_en.split(' ');
  const [firstMonth, secondMonth] = monthsPart.split('/');
  return parseInt(date_en, 10) === 1 ? secondMonth : firstMonth;
}

/**
 * Renders Nepali date info into separate elements/attributes:
 * - [data-np-date]: date_np
 * - [data-np-month-year]: month_np, year (comma separated)
 * - [data-np-day-tithi]: tithi
 * - [data-np-day-event]: event_title
 */
export function renderTodayNepaliDate() {
  const todayNp = getTodayNepaliDateFull();

  const elDate = document.querySelector('[data-np-date]');
  const elMonthYear = document.querySelector('[data-np-month-year]');
  const elTithi = document.querySelector('[data-np-day-tithi]');
  const elEvent = document.querySelector('[data-np-day-event]');

  if (elDate) elDate.textContent = todayNp ? todayNp.date_np : '';
  if (elMonthYear)
    elMonthYear.textContent = todayNp
      ? `${todayNp.month_np}, ${todayNp.year}`
      : '';
  if (elTithi) elTithi.textContent = todayNp ? todayNp.tithi : '';

  if (elEvent) {
    if (todayNp && todayNp.event_title) {
      elEvent.textContent = todayNp.event_title;
      elEvent.style.display = ''; // Reset to default
    } else {
      elEvent.textContent = '';
      elEvent.style.display = 'none'; // Hide if no event
    }
  }
}
