/**
 * Renders 35 date grid items as <li> elements.
 * @param {HTMLElement} ul
 * @param {Array} monthDates - Array of date objects for the current Nepali month
 * @param {number} firstDayWeekIndex - 0=Sunday, 1=Monday, ..., 6=Saturday
 * @param {string} todaysNpDateStr - e.g. "जेठ १४, २०८२"
 * @param {string} month_np - e.g. "जेठ"
 * @param {string|number} year - e.g. "२०८२"
 */
export function renderMonthGrid(
  ul,
  monthDates,
  firstDayWeekIndex,
  todaysNpDateStr,
  month_np,
  year
) {
  const totalCells = 35;
  let cellIndex = 0;
  let dateIndex = 0;

  // 1. Pad empty cells before the first day
  for (; cellIndex < firstDayWeekIndex; cellIndex++) {
    const li = document.createElement("li");
    li.className = "month-view__date month-view__date--empty";
    // Mark empty Saturday cells
    if (cellIndex % 7 === 6) {
      li.classList.add("is-saturday");
    }
    ul.appendChild(li);
  }

  // 2. Fill in the days of the month
  for (
    ;
    dateIndex < monthDates.length && cellIndex < totalCells;
    dateIndex++, cellIndex++
  ) {
    const dateObj = monthDates[dateIndex];
    const li = document.createElement("li");
    li.className = "month-view__date";

    // Mark Saturday cells
    if (cellIndex % 7 === 6) {
      li.classList.add("is-saturday");
    }

    // Build the full Nepali date string for this cell
    // e.g. "जेठ १४, २०८२"
    const cellNpDateStr = `${month_np} ${dateObj.date_np}, ${year}`;

    // Highlight today if matches
    if (todaysNpDateStr && cellNpDateStr === todaysNpDateStr) {
      li.classList.add("is-today");
    }

    const spanEn = document.createElement("span");
    spanEn.className = "month-view__date-en";
    spanEn.setAttribute("data-month-view-date-en", "");
    spanEn.textContent = dateObj.date_en;

    const spanNp = document.createElement("span");
    spanNp.className = "month-view__date-np";
    spanNp.setAttribute("data-month-view-date-np", "");
    spanNp.textContent = dateObj.date_np;

    const spanTithi = document.createElement("span");
    spanTithi.className = "month-view__date-tithi";
    spanTithi.setAttribute("data-month-view-tithi", "");
    spanTithi.textContent = dateObj.tithi || "";

    li.appendChild(spanEn);
    li.appendChild(spanNp);
    li.appendChild(spanTithi);

    ul.appendChild(li);
  }

  // 3. Pad empty cells after the last day
  for (; cellIndex < totalCells; cellIndex++) {
    const li = document.createElement("li");
    li.className = "month-view__date month-view__date--empty";
    // Mark empty Saturday cells
    if (cellIndex % 7 === 6) {
      li.classList.add("is-saturday");
    }
    ul.appendChild(li);
  }
}
