import { renderNepaliWeekdayHeader } from "./nepaliWeekday.js";
import { renderMonthGrid } from "./renderMonthGrid.js";
import { getTodayNepaliDateFull } from "./nepaliCalendar.js";
import calendarData from "./calendar-data.json";

export function initMonthView(container) {
  container.innerHTML = "";

  const ul = document.createElement("ul");
  ul.className = "month-view";

  // --- Inject the month view header as the first li ---
  const headerLi = document.createElement("li");
  headerLi.className = "month-view-header-wrapper";

  const spanNp = document.createElement("span");
  spanNp.className = "todays-date-np";
  spanNp.setAttribute("data-todays-date-np", "");

  const spanMonthYear = document.createElement("span");
  spanMonthYear.className = "month-year-indicator";
  spanMonthYear.setAttribute("data-month-year-indicator", "");

  headerLi.appendChild(spanNp);
  headerLi.appendChild(spanMonthYear);

  ul.appendChild(headerLi);

  // --- Render weekday headers ---
  renderNepaliWeekdayHeader(ul);

  // --- Get current Nepali month and year ---
  const todayNp = getTodayNepaliDateFull();
  if (!todayNp) {
    renderMonthGrid(ul, [], 0, "", "", "");
    container.appendChild(ul);
    return;
  }

  // --- Find the month object in calendar-data.json ---
  const monthObj = calendarData.months.find(
    (m) => m.month_np === todayNp.month_np
  );
  if (!monthObj) {
    renderMonthGrid(ul, [], 0, "", "", "");
    container.appendChild(ul);
    return;
  }

  // --- Set the header values dynamically ---
  const todaysNpDateStr = `${todayNp.month_np} ${todayNp.date_np}, ${todayNp.year}`;
  spanNp.textContent = todaysNpDateStr;
  spanMonthYear.textContent = `${todayNp.year} ${todayNp.month_np} | ${monthObj.month_year_en}`;

  // --- Find the weekday index of the first day of the month ---
  const firstDateObj = monthObj.dates[0];
  const firstDateEn = parseInt(firstDateObj.date_en, 10);
  const monthYearEn = monthObj.month_year_en;

  function getGregorianMonthYear(monthYearEn, dateEn) {
    const [monthsPart, yearPart] = monthYearEn.split(" ");
    const [firstMonth, secondMonth] = monthsPart.split("/");
    const monthName = dateEn === 1 ? secondMonth : firstMonth;
    const monthIndex = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ].indexOf(monthName);
    const year = parseInt(yearPart, 10);
    return { monthIndex, year };
  }

  const { monthIndex, year } = getGregorianMonthYear(monthYearEn, firstDateEn);
  const firstDate = new Date(year, monthIndex, firstDateEn);
  const firstDayWeekIndex = firstDate.getDay();

  // --- Render the month grid, pass month_np and year ---
  renderMonthGrid(
    ul,
    monthObj.dates,
    firstDayWeekIndex,
    todaysNpDateStr,
    monthObj.month_np,
    calendarData.year
  );

  container.appendChild(ul);
}
