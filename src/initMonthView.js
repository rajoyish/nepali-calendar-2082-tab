// src/initMonthView.js
import { renderNepaliWeekdayHeader } from "./nepaliWeekday.js";
import { renderMonthGrid } from "./renderMonthGrid.js";

/**
 * Initializes the month view calendar inside the given container.
 * @param {HTMLElement} container
 */
export function initMonthView(container) {
  // Remove any previous calendar
  container.innerHTML = "";

  const ul = document.createElement("ul");
  ul.className = "month-view";

  renderNepaliWeekdayHeader(ul);
  renderMonthGrid(ul);

  container.appendChild(ul);
}
