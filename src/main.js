import "./style.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { initTodayCalendar } from "./components/Today/Today.js";
import { setupTabs } from "./tabs.js";
import { initMonthView } from "./components/FullCalendar/FullCalendar.js";
import "./components/DateConverter/DateConverter.js";
import { createTaskReminder } from "./components/TaskReminder/TaskReminder.js";
import { setupDateInputIcon } from "./utils/dateInputIcon.js";
import { initSettingsDropdown } from "./components/SettingsDropdown/SettingsDropdown.js";
import { updateExtensionUI } from "./components/ExtensionUIUpdater/ExtensionUIUpdater.js";
import { initBookmarks } from "./components/Bookmarks/Bookmarks.js";
import { getNepaliDateForAd } from "./utils/calendarUtils.js";

window.getNepaliDateForAd = getNepaliDateForAd;

const taskReminder = createTaskReminder();
let updateInterval;

function startPeriodicUpdates() {
  if (!updateInterval) {
    updateInterval = setInterval(() => {
      initTodayCalendar(updateExtensionUI);
    }, 60 * 1000);
  }
}

function stopPeriodicUpdates() {
  if (updateInterval) {
    clearInterval(updateInterval);
    updateInterval = null;
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
    if (calendarRoot) {
      initMonthView(calendarRoot);
    }
  });
}

function setupEventHandlers() {
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopPeriodicUpdates();
    } else {
      initTodayCalendar(updateExtensionUI);
      startPeriodicUpdates();
    }
  });
}

async function initApp() {
  await initTodayCalendar(updateExtensionUI);

  taskReminder.init();
  initBookmarks();
  setupTabs();
  setupCalendarTab();
  startPeriodicUpdates();
  setupEventHandlers();
  setupDateInputIcon();

  const settingsElement = document.querySelector(".settings");
  if (settingsElement) {
    initSettingsDropdown(settingsElement);
  }
}

document.addEventListener("DOMContentLoaded", initApp);
