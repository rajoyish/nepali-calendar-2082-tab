import "./style.css";

import {
  startNepalClock,
  renderNepalDate,
  getNepalGregorianDate,
} from "./nepalTime.js";
import {
  renderTodayNepaliDate,
  getTodayNepaliDateFull,
} from "./nepaliCalendar.js";
import { renderNepaliDayOfWeek } from "./nepaliWeekday.js";
import { setupTabs } from "./tabs.js";
import { getTimePeriodBgImage } from "./getTimePeriodBg.js";

// Cache for last rendered Gregorian date and Nepali date
let lastRenderedGregorianDate = "";
let lastRenderedNepaliDate = "";

// Cache for last applied background image
let lastBgImage = "";

/**
 * Render date-dependent info if the date has changed.
 */
function renderDateDependentNepalInfo() {
  // Get the current Gregorian date string (e.g. "Sunday, May 25, 2025")
  const currentGregorianDate = getNepalGregorianDate();

  if (currentGregorianDate !== lastRenderedGregorianDate) {
    lastRenderedGregorianDate = currentGregorianDate;
    renderNepalDate();
    renderNepaliDayOfWeek();

    // Get the current Nepali date (e.g. "वैशाख १३, २०८२")
    const todayNp = getTodayNepaliDateFull();
    const currentNepaliDate = todayNp
      ? `${todayNp.month_np} ${todayNp.date_np}, ${todayNp.year}`
      : "";

    if (currentNepaliDate !== lastRenderedNepaliDate) {
      lastRenderedNepaliDate = currentNepaliDate;
      renderTodayNepaliDate();
    }
  }
}

/**
 * Set the background image based on the current Nepali time period.
 * Only updates if the image needs to change.
 */
function updateBackgroundImage() {
  const now = new Date();
  const bgImage = getTimePeriodBgImage(now);
  if (bgImage !== lastBgImage) {
    document.body.style.backgroundImage = `url(${bgImage})`;
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundRepeat = "no-repeat";
    lastBgImage = bgImage;
  }
}

// Initial render
renderDateDependentNepalInfo();
setupTabs();
startNepalClock(); // Starts the clock and time period updates
updateBackgroundImage();

// Update date-dependent info every minute (date changes at midnight)
setInterval(() => {
  renderDateDependentNepalInfo();
  updateBackgroundImage();
}, 60 * 1000);
