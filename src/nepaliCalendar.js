import calendarData from "./calendar-data.json";

/**
 * Returns { date_np, month_np, year } for today's Nepal time.
 */
export function getTodayNepaliDate() {
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
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const monthName = months[month];

  // 4. Search all months and all dates for a match using your logic
  for (const monthObj of calendarData.months) {
    for (const dateObj of monthObj.dates) {
      const enMonth = getExactEnglishMonth(
        monthObj.month_year_en,
        dateObj.date_en
      );
      // Now match both the English month and day and year
      if (
        enMonth === monthName &&
        parseInt(dateObj.date_en, 10) === day &&
        monthObj.month_year_en.includes(year.toString())
      ) {
        return {
          date_np: dateObj.date_np,
          month_np: monthObj.month_np,
          year: calendarData.year,
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
  const [monthsPart] = month_year_en.split(" ");
  const [firstMonth, secondMonth] = monthsPart.split("/");
  return parseInt(date_en, 10) === 1 ? secondMonth : firstMonth;
}

/**
 * Renders the Nepali date in the DOM element with [data-today-np]
 */
export function renderTodayNepaliDate() {
  const el = document.querySelector("[data-today-np]");
  if (!el) return;

  const todayNp = getTodayNepaliDate();
  if (todayNp) {
    el.textContent = `${todayNp.month_np} ${todayNp.date_np}, ${todayNp.year}`;
  } else {
    el.textContent = "Nepali date not found";
  }
}
