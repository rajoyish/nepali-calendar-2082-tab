import "./style.css";
import "bootstrap-icons/font/bootstrap-icons.css";

import {
  startNepalClock,
  renderNepalDate,
  getNepalGregorianDate,
} from "./today/nepalTime.js";
import {
  renderTodayNepaliDate,
  getTodayNepaliDateFull,
} from "./today/nepaliCalendar.js";
import { renderNepaliDayOfWeek } from "./today/nepaliWeekday.js";
import { setupTabs } from "./tabs.js";
import { getTimePeriodBgImage } from "./today/getTimePeriodBg.js";
import { initMonthView } from "./full-calendar/initMonthView.js";
import { DateConverter } from "./date-converter/dateConverter.js";

// --- State ---

let lastRenderedGregorianDate = "";
let lastRenderedNepaliDate = "";
let lastBgImage = "";
let converterInstance = null;

// --- Date-dependent Rendering ---

function renderDateDependentNepalInfo() {
  const currentGregorianDate = getNepalGregorianDate();
  if (currentGregorianDate !== lastRenderedGregorianDate) {
    lastRenderedGregorianDate = currentGregorianDate;
    renderNepalDate();
    renderNepaliDayOfWeek();

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

// --- Background Image ---

function updateBackgroundImage() {
  const now = new Date();
  const bgImage = getTimePeriodBgImage(now);
  if (bgImage !== lastBgImage) {
    document.body.style.backgroundImage = `url(${bgImage})`;
    lastBgImage = bgImage;
  }
}

// --- Converter ---

function initializeConverter() {
  const converterPanel = document.getElementById("panel-converter");
  if (converterPanel && !converterInstance) {
    try {
      converterInstance = new DateConverter();
      converterInstance.init("panel-converter");
    } catch (error) {
      console.error("Failed to initialize date converter:", error);
    }
  }
}

// --- Tabs ---

function setupTabActivation(tabSelector, panelSelector, onActivate) {
  const tabsList = document.querySelector(".tabs-list");
  if (!tabsList) return;

  const tabButtons = tabsList.querySelectorAll("a");
  const tabIndex = Array.from(tabButtons).findIndex(
    (tab) =>
      tab.textContent.trim() === tabSelector ||
      tab.getAttribute("href") === panelSelector
  );
  if (tabIndex === -1) return;

  const tab = tabButtons[tabIndex];
  const panel = document.querySelector(panelSelector);

  function maybeActivate() {
    if (panel && !panel.hasAttribute("hidden")) onActivate(panel);
  }

  tabsList.addEventListener("click", (e) => {
    const clickedTab = e.target.closest("a");
    if (clickedTab === tab) setTimeout(maybeActivate, 0);
  });

  tabsList.addEventListener("keydown", (e) => {
    if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) {
      setTimeout(maybeActivate, 0);
    }
  });

  maybeActivate();
}

function setupCalendarTab() {
  setupTabActivation("Full Calendar", "#panel-calendar", (panel) => {
    const calendarRoot = panel.querySelector("#month-view-calendar-root");
    if (calendarRoot && !calendarRoot.hasChildNodes()) {
      initMonthView(calendarRoot);
    }
  });
}

function setupConverterTab() {
  setupTabActivation("Date Converter", "#panel-converter", () =>
    initializeConverter()
  );
}

// --- Periodic Updates ---

function setupPeriodicUpdates() {
  setInterval(() => {
    renderDateDependentNepalInfo();
    updateBackgroundImage();
  }, 60 * 1000);
}

// --- Event Handlers ---

function setupEventHandlers() {
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      renderDateDependentNepalInfo();
      updateBackgroundImage();
    }
  });

  window.addEventListener("online", () => {
    if (!converterInstance) {
      const converterPanel = document.querySelector("#panel-converter");
      if (converterPanel && !converterPanel.hasAttribute("hidden")) {
        initializeConverter();
      }
    }
  });
}

// --- App Initialization ---

function initApp() {
  renderDateDependentNepalInfo();
  setupTabs();
  startNepalClock();
  updateBackgroundImage();
  setupCalendarTab();
  setupConverterTab();
  setupPeriodicUpdates();
  setupEventHandlers();
}

document.addEventListener("DOMContentLoaded", initApp);
