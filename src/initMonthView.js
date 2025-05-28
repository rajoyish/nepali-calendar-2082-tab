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

  // --- Inject the month view header as the first li ---
  const headerLi = document.createElement("li");
  headerLi.className = "month-view-header-wrapper";

  const spanNp = document.createElement("span");
  spanNp.className = "todays-date-np";
  spanNp.setAttribute("data-todays-date-np", "");
  spanNp.textContent = "जेठ १४, २०८२"; // Placeholder, update dynamically as needed

  const spanMonthYear = document.createElement("span");
  spanMonthYear.className = "month-year-indicator";
  spanMonthYear.setAttribute("data-month-year-indicator", "");
  spanMonthYear.textContent = "२०८२ जेठ | May/Jun 2025"; // Placeholder, update dynamically as needed

  headerLi.appendChild(spanNp);
  headerLi.appendChild(spanMonthYear);

  ul.appendChild(headerLi);

  // --- Render weekday headers and date grid ---
  renderNepaliWeekdayHeader(ul);
  renderMonthGrid(ul);

  container.appendChild(ul);
}
