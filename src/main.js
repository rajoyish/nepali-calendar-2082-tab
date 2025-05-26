import "./style.css";

import { renderNepalTime } from "./nepalTime.js";
import { renderTodayNepaliDate } from "./nepaliCalendar.js";
import { renderNepaliTimePeriod } from "./nepaliTimePeriod.js";
import { renderNepaliDayOfWeek } from "./nepaliWeekday.js";

// Render both date/clock, Nepali time period indicator, and Nepali weekday
function renderAllNepalTime() {
  renderNepalTime();
  renderNepaliTimePeriod();
  renderNepaliDayOfWeek();
}

// Initial render
renderAllNepalTime();
renderTodayNepaliDate();

// Update time, period, and weekday every second
setInterval(renderAllNepalTime, 1000);

// Update Nepali date every minute
setInterval(renderTodayNepaliDate, 60 * 1000);
