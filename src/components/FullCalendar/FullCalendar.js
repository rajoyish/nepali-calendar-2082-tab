import "./FullCalendar.css";
import calendarData from "../../data/calendar-data.json";
import {
  renderNepaliWeekdayHeader,
  abbreviatedWeekdays,
  weekdays,
  getTodayNepaliDateFull,
} from "../Today/Today.js";

let abbreviationListenerAdded = false;

function isHoliday(dateObj) {
  return (
    dateObj &&
    Array.isArray(dateObj.classes) &&
    dateObj.classes.includes("is-holiday")
  );
}

function renderMonthGrid(
  ul,
  monthDates,
  firstDayWeekIndex,
  todaysNpDateStr,
  month_np,
  year,
) {
  const totalCells = 35;
  let cellIndex = 0;
  let dateIndex = 0;

  for (; cellIndex < firstDayWeekIndex; cellIndex++) {
    const li = document.createElement("li");
    li.className = "month-view__date month-view__date--empty";
    if (cellIndex % 7 === 6) li.classList.add("is-saturday");
    ul.appendChild(li);
  }

  for (
    ;
    dateIndex < monthDates.length && cellIndex < totalCells;
    dateIndex++, cellIndex++
  ) {
    const dateObj = monthDates[dateIndex];
    const li = document.createElement("li");
    li.className = "month-view__date";

    if (cellIndex % 7 === 6) li.classList.add("is-saturday");
    if (isHoliday(dateObj)) li.classList.add("is-holiday");

    const cellNpDateStr = `${month_np} ${dateObj.date_np}, ${year}`;
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

  for (; cellIndex < totalCells; cellIndex++) {
    const li = document.createElement("li");
    li.className = "month-view__date month-view__date--empty";
    if (cellIndex % 7 === 6) li.classList.add("is-saturday");
    ul.appendChild(li);
  }
}

function updateWeekdayAbbreviations() {
  const isAbbreviated = window.matchMedia("(max-width: 499px)").matches;
  const npSpans = document.querySelectorAll(
    ".month-view__day-label--np[data-day-label-np]",
  );
  const enSpans = document.querySelectorAll(
    ".month-view__day-label--en[data-day-label-en]",
  );
  if (npSpans.length !== 7 || enSpans.length !== 7) return;

  for (let i = 0; i < 7; i++) {
    npSpans[i].textContent = isAbbreviated
      ? abbreviatedWeekdays[i][1]
      : weekdays[i][1];
    enSpans[i].textContent = isAbbreviated
      ? abbreviatedWeekdays[i][0]
      : weekdays[i][0];
  }
}

function maybeAddResizeListener() {
  if (abbreviationListenerAdded) return;
  window.addEventListener("resize", updateWeekdayAbbreviations);
  abbreviationListenerAdded = true;
}

export function initMonthView(container) {
  container.innerHTML = "";

  const ul = document.createElement("ul");
  ul.className = "month-view";

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

  renderNepaliWeekdayHeader(ul);

  const todayNp = getTodayNepaliDateFull();
  if (!todayNp) {
    renderMonthGrid(ul, [], 0, "", "", "");
    container.appendChild(ul);
    updateWeekdayAbbreviations();
    maybeAddResizeListener();
    return;
  }

  const monthObj = calendarData.months.find(
    (m) => m.month_np === todayNp.month_np,
  );
  if (!monthObj) {
    renderMonthGrid(ul, [], 0, "", "", "");
    container.appendChild(ul);
    updateWeekdayAbbreviations();
    maybeAddResizeListener();
    return;
  }

  const todaysNpDateStr = `${todayNp.month_np} ${todayNp.date_np}, ${todayNp.year}`;
  spanNp.textContent = todaysNpDateStr;
  spanMonthYear.textContent = `${todayNp.year} ${todayNp.month_np} | ${monthObj.month_year_en}`;

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

  renderMonthGrid(
    ul,
    monthObj.dates,
    firstDayWeekIndex,
    todaysNpDateStr,
    monthObj.month_np,
    calendarData.year,
  );

  container.appendChild(ul);
  updateWeekdayAbbreviations();
  maybeAddResizeListener();
}
