import "./style.css";

import { renderNepalTime } from "./nepalTime.js";
import { renderTodayNepaliDate } from "./nepaliCalendar.js";
import { renderNepaliTimePeriod } from "./nepaliTimePeriod.js";

// Render both date/clock and Nepali time period indicator
function renderAllNepalTime() {
  renderNepalTime();
  renderNepaliTimePeriod();
}

// Initial render
renderAllNepalTime();
renderTodayNepaliDate();

// Update time and period every second
setInterval(renderAllNepalTime, 1000);

// Update Nepali date every minute
setInterval(renderTodayNepaliDate, 60 * 1000);
