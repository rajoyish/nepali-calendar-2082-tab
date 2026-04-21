import "./style.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { initTodayCalendar } from "./components/Today/Today.js";
import { setupTabs } from "./tabs.js";
import "./components/DateConverter/DateConverter.js";
import { createTaskReminder } from "./components/TaskReminder/TaskReminder.js";
import { setupDateInputIcon } from "./utils/dateInputIcon.js";
import { initSettingsDropdown } from "./components/SettingsDropdown/SettingsDropdown.js";
import { updateDateBadge } from "./components/DateBadgeRenderer/DateBadgeRenderer.js";
import { initBookmarks } from "./components/Bookmarks/Bookmarks.js";
import { getNepaliDateForAd } from "./utils/calendarUtils.js";

window.getNepaliDateForAd = getNepaliDateForAd;

const taskReminder = createTaskReminder();
let updateInterval;

function startPeriodicUpdates() {
  if (!updateInterval) {
    updateInterval = setInterval(() => {
      initTodayCalendar(updateDateBadge);
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
  setupTabActivation("Full Calendar", "#panel-calendar", async (panel) => {
    const calendarRoot = panel.querySelector("#month-view-calendar-root");
    if (calendarRoot) {
      const { initMonthView } = await import("./components/FullCalendar/FullCalendar.js");
      initMonthView(calendarRoot);
    }
  });
}

function setupUpcomingEventsTab() {
  setupTabActivation("Upcoming Events", "#panel-upcoming", async (panel) => {
    const root = panel.querySelector("#upcoming-events-root");
    if (root) {
      const { initUpcomingEvents } = await import("./components/UpcomingEvents/UpcomingEvents.js");
      initUpcomingEvents(root);
    }
  });
}

function setupEventHandlers() {
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopPeriodicUpdates();
    } else {
      initTodayCalendar(updateDateBadge);
      startPeriodicUpdates();
    }
  });
}

async function initApp() {
  await initTodayCalendar(updateDateBadge);

  taskReminder.init();
  initBookmarks();
  setupTabs();
  setupCalendarTab();
  setupUpcomingEventsTab();
  startPeriodicUpdates();
  setupEventHandlers();
  setupDateInputIcon();

  const settingsElement = document.querySelector(".settings");
  if (settingsElement) {
    initSettingsDropdown(settingsElement);
  }
}

document.addEventListener("DOMContentLoaded", initApp);