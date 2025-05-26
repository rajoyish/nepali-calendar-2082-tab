import "./style.css";

import { renderNepalTime, getNepalGregorianDate } from "./nepalTime.js";
import {
  renderTodayNepaliDate,
  getTodayNepaliDateFull,
} from "./nepaliCalendar.js";
import { renderNepaliTimePeriod } from "./nepaliTimePeriod.js";
import { renderNepaliDayOfWeek } from "./nepaliWeekday.js";
import { setupTabs } from "./tabs.js"; // <-- Import tabs

// Cache for last rendered Gregorian date and Nepali date
let lastRenderedGregorianDate = "";
let lastRenderedNepaliDate = "";

// Render all time-related info, but only update date-dependent parts if date changes
function renderAllNepalTime() {
  // Always update clock and time period (they change every second)
  renderNepalTime();
  renderNepaliTimePeriod();

  // Get the current Gregorian date string (e.g. "Sunday, May 25, 2025")
  const currentGregorianDate = getNepalGregorianDate();

  // Only update date-dependent parts if the date has changed
  if (currentGregorianDate !== lastRenderedGregorianDate) {
    lastRenderedGregorianDate = currentGregorianDate;
    renderNepaliDayOfWeek();

    // Get the current Nepali date (e.g. "वैशाख १३, २०८२")
    const todayNp = getTodayNepaliDateFull();
    const currentNepaliDate = todayNp
      ? `${todayNp.month_np} ${todayNp.date_np}, ${todayNp.year}`
      : "";

    // Only update Nepali date-dependent parts if the Nepali date has changed
    if (currentNepaliDate !== lastRenderedNepaliDate) {
      lastRenderedNepaliDate = currentNepaliDate;
      renderTodayNepaliDate();
    }
  }
}

// Initial render
renderAllNepalTime();
setupTabs(); // <-- Initialize tabs after DOM is ready

// Update everything every second, but only update date-dependent parts if needed
setInterval(renderAllNepalTime, 1000);
