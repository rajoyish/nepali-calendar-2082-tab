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
import { initMonthView } from "./initMonthView.js";

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

// --- CALENDAR TAB LOGIC ---

/**
 * Render the calendar when the "Full Calendar" tab is shown.
 */
function setupCalendarTab() {
  // Find the tab button and panel for "Full Calendar"
  const tabsList = document.querySelector(".tabs-list");
  if (!tabsList) return;

  const tabButtons = tabsList.querySelectorAll("a");
  let calendarTabIndex = -1;
  tabButtons.forEach((tab, idx) => {
    if (
      tab.textContent.trim() === "Full Calendar" ||
      tab.getAttribute("href") === "#panel-calendar"
    ) {
      calendarTabIndex = idx;
    }
  });

  if (calendarTabIndex === -1) return;

  const calendarTab = tabButtons[calendarTabIndex];
  const calendarPanel = document.querySelector("#panel-calendar");

  // Render calendar if panel is visible and not already rendered
  function maybeRenderCalendar() {
    if (!calendarPanel) return;
    const calendarRoot = calendarPanel.querySelector(
      "#month-view-calendar-root"
    );
    if (!calendarRoot) return;
    // Only render if not already rendered
    if (!calendarRoot.hasChildNodes()) {
      initMonthView(calendarRoot);
    }
  }

  // Listen for tab activation
  tabsList.addEventListener("click", (e) => {
    const clickedTab = e.target.closest("a");
    if (!clickedTab) return;
    if (clickedTab === calendarTab) {
      // Wait for panel to be shown, then render
      setTimeout(maybeRenderCalendar, 0);
    }
  });

  // Also handle keyboard navigation
  tabsList.addEventListener("keydown", (e) => {
    if (
      e.key === "ArrowLeft" ||
      e.key === "ArrowRight" ||
      e.key === "Home" ||
      e.key === "End"
    ) {
      setTimeout(() => {
        if (!calendarPanel.hasAttribute("hidden")) {
          maybeRenderCalendar();
        }
      }, 0);
    }
  });

  // If the calendar tab is active on load, render immediately
  if (!calendarPanel.hasAttribute("hidden")) {
    maybeRenderCalendar();
  }
}

document.addEventListener("DOMContentLoaded", setupCalendarTab);
