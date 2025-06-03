import "./style.css";
import "bootstrap-icons/font/bootstrap-icons.css";
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

// Import converter functionality directly
import { DateConverter } from "./converter/dateConverter.js";

// Cache for last rendered Gregorian date and Nepali date
let lastRenderedGregorianDate = "";
let lastRenderedNepaliDate = "";

// Cache for last applied background image
let lastBgImage = "";

// Converter instance
let converterInstance = null;

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

/**
 * Initialize the date converter
 */
function initializeConverter() {
  const converterPanel = document.getElementById("panel-converter");
  if (converterPanel && !converterInstance) {
    try {
      converterInstance = new DateConverter();
      converterInstance.init("panel-converter");
      console.log("Date converter initialized successfully!");
    } catch (error) {
      console.error("Failed to initialize date converter:", error);
    }
  }
}

/**
 * Setup calendar tab functionality
 */
function setupCalendarTab() {
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

  /**
   * Render calendar if panel is visible and not already rendered
   */
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

  // Handle keyboard navigation
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

/**
 * Setup converter tab functionality
 */
function setupConverterTab() {
  const tabsList = document.querySelector(".tabs-list");
  if (!tabsList) return;

  const tabButtons = tabsList.querySelectorAll("a");
  let converterTabIndex = -1;

  tabButtons.forEach((tab, idx) => {
    if (
      tab.textContent.trim() === "Date Converter" ||
      tab.getAttribute("href") === "#panel-converter"
    ) {
      converterTabIndex = idx;
    }
  });

  if (converterTabIndex === -1) return;

  const converterTab = tabButtons[converterTabIndex];
  const converterPanel = document.querySelector("#panel-converter");

  /**
   * Initialize converter when tab is first activated
   */
  function maybeInitializeConverter() {
    if (!converterPanel) return;
    if (!converterInstance) {
      initializeConverter();
    }
  }

  // Listen for tab activation
  tabsList.addEventListener("click", (e) => {
    const clickedTab = e.target.closest("a");
    if (!clickedTab) return;
    if (clickedTab === converterTab) {
      // Wait for panel to be shown, then initialize
      setTimeout(maybeInitializeConverter, 0);
    }
  });

  // Handle keyboard navigation
  tabsList.addEventListener("keydown", (e) => {
    if (
      e.key === "ArrowLeft" ||
      e.key === "ArrowRight" ||
      e.key === "Home" ||
      e.key === "End"
    ) {
      setTimeout(() => {
        if (!converterPanel.hasAttribute("hidden")) {
          maybeInitializeConverter();
        }
      }, 0);
    }
  });

  // If the converter tab is active on load, initialize immediately
  if (!converterPanel.hasAttribute("hidden")) {
    maybeInitializeConverter();
  }
}

/**
 * Setup periodic updates
 */
function setupPeriodicUpdates() {
  // Update date-dependent info every minute (date changes at midnight)
  setInterval(() => {
    renderDateDependentNepalInfo();
    updateBackgroundImage();
  }, 60 * 1000);
}

/**
 * Setup page visibility and connection event handlers
 */
function setupEventHandlers() {
  // Handle page visibility changes to refresh data when tab becomes active
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      // Page became visible, refresh date-dependent info
      renderDateDependentNepalInfo();
      updateBackgroundImage();
    }
  });

  // Handle online/offline status
  window.addEventListener("online", () => {
    console.log("Connection restored");
    // Optionally refresh converter if it failed to load
    if (!converterInstance) {
      const converterPanel = document.querySelector("#panel-converter");
      if (converterPanel && !converterPanel.hasAttribute("hidden")) {
        initializeConverter();
      }
    }
  });

  window.addEventListener("offline", () => {
    console.log("Connection lost - some features may be limited");
  });
}

/**
 * Initialize the application
 */
function initApp() {
  console.log("Initializing Nepali Calendar App...");

  try {
    // Initial render of date-dependent info
    renderDateDependentNepalInfo();

    // Setup tabs functionality
    setupTabs();

    // Start the Nepal clock
    startNepalClock();

    // Set initial background image
    updateBackgroundImage();

    // Setup tab functionalities
    setupCalendarTab();
    setupConverterTab();

    // Setup periodic updates
    setupPeriodicUpdates();

    // Setup event handlers
    setupEventHandlers();

    console.log("Nepali Calendar App initialized successfully!");
  } catch (error) {
    console.error("Failed to initialize Nepali Calendar App:", error);
  }
}

// Wait for DOM to be fully loaded before initializing
document.addEventListener("DOMContentLoaded", initApp);
