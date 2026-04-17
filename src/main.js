import "./style.css";
import "bootstrap-icons/font/bootstrap-icons.css";

import {
  createTodayComponent,
  getNepaliDateForAd,
} from "./components/Today/Today.js";
import { setupTabs } from "./tabs.js";
import { initMonthView } from "./components/FullCalendar/FullCalendar.js";
import { createDateConverter } from "./components/DateConverter/DateConverter.js";
import { createTaskReminder } from "./components/TaskReminder/TaskReminder.js";
import { setupDateInputIcon } from "./utils/dateInputIcon.js";
import { initSettingsDropdown } from "./components/SettingsDropdown/SettingsDropdown.js";
import { updateExtensionUI } from "./components/ExtensionUIUpdater/ExtensionUIUpdater.js";
import { initBookmarks } from "./components/Bookmarks/Bookmarks.js"; // <-- ADDED

window.getNepaliDateForAd = getNepaliDateForAd;

const todayComponent = createTodayComponent();
const taskReminder = createTaskReminder();
let converterInstance = null;

function initializeConverter() {
  const converterPanel = document.getElementById("panel-converter");
  if (converterPanel && !converterInstance) {
    try {
      converterInstance = createDateConverter();
      converterInstance.init("panel-converter");
    } catch (error) {
      console.error(error);
    }
  }
}

function setupTabActivation(tabSelector, panelSelector, onActivate) {
  const tabsList = document.querySelector(".tabs-list");
  if (!tabsList) return;

  const tabButtons = tabsList.querySelectorAll("a");
  const tabIndex = Array.from(tabButtons).findIndex(
    (tab) =>
      tab.textContent.trim() === tabSelector ||
      tab.getAttribute("href") === panelSelector,
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
    initializeConverter(),
  );
}

function setupPeriodicUpdates() {
  setInterval(() => {
    todayComponent.periodicUpdate();
  }, 60 * 1000);
}

function setupEventHandlers() {
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      todayComponent.periodicUpdate();
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

function initApp() {
  todayComponent.init(updateExtensionUI);
  taskReminder.init();
  initBookmarks();
  setupTabs();
  setupCalendarTab();
  setupConverterTab();
  setupPeriodicUpdates();
  setupEventHandlers();
  setupDateInputIcon();

  const settingsElement = document.querySelector(".settings");
  if (settingsElement) {
    initSettingsDropdown(settingsElement);
  }
}

document.addEventListener("DOMContentLoaded", initApp);
