import calendarData from "../calendar-data.json";

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

  // 3. Use abbreviated English month names to match JSON
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const monthName = months[month];

  // 4. Search all months and all dates for a match
  for (const monthObj of calendarData.months) {
    for (const dateObj of monthObj.dates) {
      const enMonth = getExactEnglishMonth(
        monthObj.month_year_en,
        dateObj.date_en
      );

      // Check if this date matches today's Gregorian date
      if (
        enMonth === monthName &&
        parseInt(dateObj.date_en, 10) === day &&
        isYearMatch(monthObj.month_year_en, year)
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

  // For debugging
  console.log("No match found for:", { year, monthName, day });
  return null;
}

/**
 * Given a month_year_en string like "Apr/May 2025" and a date_en,
 * returns the correct English month abbreviation for that date.
 *
 * Logic: Higher date_en values (typically 14+) are in the first month,
 * Lower date_en values (typically 1-14) are in the second month.
 */
function getExactEnglishMonth(month_year_en, date_en) {
  const [monthsPart] = month_year_en.split(" ");
  const [firstMonth, secondMonth] = monthsPart.split("/");
  const dateNum = parseInt(date_en, 10);

  // Based on the data pattern: higher dates are in first month, lower in second
  // Using 14 as the typical threshold, but this could be adjusted per month if needed
  return dateNum >= 14 ? firstMonth : secondMonth;
}

/**
 * Checks if the given year matches the year(s) in month_year_en string.
 * Handles cases like "Dec/Jan 2025-26" and "Apr/May 2025"
 */
function isYearMatch(month_year_en, targetYear) {
  const yearPart = month_year_en.split(" ")[1];

  if (yearPart.includes("-")) {
    // Handle cases like "2025-26"
    const [startYear, endYearSuffix] = yearPart.split("-");
    const startYearNum = parseInt(startYear, 10);
    const endYearNum = parseInt(startYear.substring(0, 2) + endYearSuffix, 10);
    return targetYear === startYearNum || targetYear === endYearNum;
  } else {
    // Handle simple cases like "2025"
    return parseInt(yearPart, 10) === targetYear;
  }
}

/**
 * Enhanced version that can handle dynamic thresholds per month if needed
 */
function getExactEnglishMonthAdvanced(month_year_en, date_en) {
  const [monthsPart] = month_year_en.split(" ");
  const [firstMonth, secondMonth] = monthsPart.split("/");
  const dateNum = parseInt(date_en, 10);

  // Month-specific thresholds (can be customized based on actual data)
  const thresholds = {
    "Apr/May": 13,
    "May/Jun": 14,
    "Jun/Jul": 14,
    "Jul/Aug": 16,
    "Aug/Sep": 16,
    "Sep/Oct": 16,
    "Oct/Nov": 17,
    "Nov/Dec": 16,
    "Dec/Jan": 15,
    "Jan/Feb": 14,
    "Feb/Mar": 12,
    "Mar/Apr": 14,
  };

  const threshold = thresholds[monthsPart] || 14;
  return dateNum >= threshold ? firstMonth : secondMonth;
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

  // Enhanced debugging
  if (!todayNp) {
    console.warn("Could not find Nepali date for today");
    const now = new Date();
    const nepalOffsetMinutes = 5 * 60 + 45;
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const nepalTime = new Date(utc + nepalOffsetMinutes * 60000);
    console.log("Nepal time:", nepalTime.toISOString());
    console.log("Looking for:", {
      year: nepalTime.getFullYear(),
      month: nepalTime.getMonth() + 1,
      day: nepalTime.getDate(),
    });
  }

  const elDate = document.querySelector("[data-np-date]");
  const elMonthYear = document.querySelector("[data-np-month-year]");
  const elTithi = document.querySelector("[data-np-day-tithi]");
  const elEvent = document.querySelector("[data-np-day-event]");

  if (elDate) elDate.textContent = todayNp ? todayNp.date_np : "";
  if (elMonthYear)
    elMonthYear.textContent = todayNp
      ? `${todayNp.month_np}, ${todayNp.year}`
      : "";
  if (elTithi) elTithi.textContent = todayNp ? todayNp.tithi : "";

  if (elEvent) {
    if (todayNp && todayNp.event_title) {
      elEvent.textContent = todayNp.event_title;
      elEvent.style.display = ""; // Reset to default
    } else {
      elEvent.textContent = "";
      elEvent.style.display = "none"; // Hide if no event
    }
  }

  updateHolidayNotice();
}

/**
 * Utility function to get Nepal time
 */
export function getNepalTime() {
  const now = new Date();
  const nepalOffsetMinutes = 5 * 60 + 45;
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + nepalOffsetMinutes * 60000);
}

/**
 * Debug function to test the date matching logic
 */
export function debugDateMatching(testDate = null) {
  const targetDate = testDate || getNepalTime();
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth();
  const day = targetDate.getDate();

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const monthName = months[month];

  console.log("Debug info:", {
    targetDate: targetDate.toISOString(),
    year,
    monthName,
    day,
  });

  // Find all potential matches
  const matches = [];
  for (const monthObj of calendarData.months) {
    for (const dateObj of monthObj.dates) {
      const enMonth = getExactEnglishMonth(
        monthObj.month_year_en,
        dateObj.date_en
      );

      if (
        enMonth === monthName &&
        parseInt(dateObj.date_en, 10) === day &&
        isYearMatch(monthObj.month_year_en, year)
      ) {
        matches.push({
          nepali_date: dateObj.date_np,
          nepali_month: monthObj.month_np,
          english_month_year: monthObj.month_year_en,
          english_date: dateObj.date_en,
          calculated_month: enMonth,
        });
      }
    }
  }

  console.log("Found matches:", matches);
  return matches;
}

/**
 * Show or hide the holiday notice element based on whether today is a public holiday.
 * Caches the result for the current day for performance.
 */
let lastHolidayCheckDate = "";
let lastIsHoliday = false;

export function updateHolidayNotice() {
  // 1. Get today's Nepali date object (already cached in renderTodayNepaliDate)
  const todayNp = getTodayNepaliDateFull();

  // 2. Compose a unique key for today (e.g., "2082-जेठ-११")
  const todayKey = todayNp
    ? `${todayNp.year}-${todayNp.month_np}-${todayNp.date_np}`
    : "";

  // 3. If already checked for today, use cached result
  if (todayKey === lastHolidayCheckDate) {
    setHolidayNoticeVisibility(lastIsHoliday);
    return;
  }

  // 4. Find the matching date object in calendarData
  let isHoliday = false;
  if (todayNp) {
    for (const monthObj of calendarData.months) {
      if (monthObj.month_np === todayNp.month_np) {
        for (const dateObj of monthObj.dates) {
          if (dateObj.date_np === todayNp.date_np) {
            if (
              Array.isArray(dateObj.classes) &&
              dateObj.classes.includes("is-holiday")
            ) {
              isHoliday = true;
            }
            break;
          }
        }
        break;
      }
    }
  }

  // 5. Cache the result
  lastHolidayCheckDate = todayKey;
  lastIsHoliday = isHoliday;

  // 6. Show/hide the notice
  setHolidayNoticeVisibility(isHoliday);
}

/**
 * Show or hide the holiday notice element in the DOM.
 * The element should exist in your HTML (or you can create it dynamically).
 */
function setHolidayNoticeVisibility(show) {
  let el = document.querySelector(".holiday-notice");
  if (!el) {
    // Optionally, create the element if not present
    // (Uncomment if you want to auto-inject)
    /*
    el = document.createElement("h3");
    el.className = "calendar__event holiday-notice";
    el.innerHTML = `<span class="holiday-notice__icon"></span>आज सार्वजनिक बिदा`;
    document.body.appendChild(el); // Or append to a specific container
    */
    return;
  }
  el.style.display = show ? "" : "none";
}
