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

function createModal() {
  const dialog = document.createElement("dialog");
  dialog.className = "date-modal";

  const content = document.createElement("div");
  content.className = "date-modal__content";

  const header = document.createElement("header");
  header.className = "date-modal__header";

  const title = document.createElement("h3");
  title.className = "date-modal__title";

  const closeBtn = document.createElement("button");
  closeBtn.className = "date-modal__close";
  closeBtn.innerHTML = "&times;";
  closeBtn.onclick = () => dialog.close();

  header.appendChild(title);
  header.appendChild(closeBtn);

  const body = document.createElement("div");
  body.className = "date-modal__body";

  content.appendChild(header);
  content.appendChild(body);
  dialog.appendChild(content);

  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) dialog.close();
  });

  return { dialog, title, body };
}

function renderMonthGrid(
  ul,
  monthDates,
  firstDayWeekIndex,
  todaysNpDateStr,
  month_np,
  year,
  modalElements,
  monthYearEn,
) {
  const totalCells = 42;
  let cellIndex = 0;
  let dateIndex = 0;
  const firstDateEn = parseInt(monthDates[0].date_en, 10);

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

    li.addEventListener("click", () => {
      const { dialog, title, body } = modalElements;
      title.textContent = `${month_np} ${dateObj.date_np}, ${year}`;

      if (isHoliday(dateObj)) {
        title.style.color = "red";
      } else {
        title.style.color = "";
      }

      const dateEnNum = parseInt(dateObj.date_en, 10);
      const { monthIndex, year: enYear } = getGregorianMonthYear(
        monthYearEn,
        dateEnNum,
        firstDateEn,
      );
      const fullMonths = [
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
      ];
      const fullEnglishDate = `${dateEnNum} ${fullMonths[monthIndex]} ${enYear}`;

      const eventText = dateObj.event_title ? dateObj.event_title : "छैन";
      const tithiText = dateObj.tithi ? dateObj.tithi : "छैन";
      const holidayStatus = isHoliday(dateObj) ? "हो" : "छैन";

      body.innerHTML = `
        <p>अङ्ग्रेजी तारिख: <strong>${fullEnglishDate}</strong></p>
        <p>तिथि: <strong>${tithiText}</strong></p>
        <p>घटनाक्रम: <strong>${eventText}</strong></p>
        <p>सार्वजनिक विदा: <strong>${holidayStatus}</strong></p>
      `;
      dialog.showModal();
    });

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

function getGregorianMonthYear(monthYearEn, dateEn, firstDateEn) {
  const parts = monthYearEn.split(" ");
  const monthsPart = parts[0];
  const yearPart = parts[1];
  const mParts = monthsPart.split("/");
  const firstMonth = mParts[0];
  const secondMonth = mParts[1];

  let isSecondMonth = false;
  if (firstDateEn !== undefined) {
    isSecondMonth = dateEn < firstDateEn;
  } else {
    isSecondMonth = dateEn === 1;
  }

  const monthName = isSecondMonth ? secondMonth : firstMonth;
  const monthIndex = [
    "jan",
    "feb",
    "mar",
    "apr",
    "may",
    "jun",
    "jul",
    "aug",
    "sep",
    "oct",
    "nov",
    "dec",
  ].findIndex((m) => monthName.toLowerCase().startsWith(m));

  let year = parseInt(yearPart, 10);
  if (
    isSecondMonth &&
    monthIndex === 0 &&
    firstMonth.toLowerCase().startsWith("dec")
  ) {
    year += 1;
  }

  return { monthIndex, year };
}

export function initMonthView(container) {
  container.innerHTML = "";

  const controlsDiv = document.createElement("div");
  controlsDiv.className = "calendar-controls";

  const monthSelect = document.createElement("select");
  monthSelect.className = "calendar-controls__month-select";

  if (calendarData.months && calendarData.months.length > 0) {
    calendarData.months.forEach((m, index) => {
      const option = document.createElement("option");
      option.value = index;
      option.textContent = `${m.month_np} (${m.month_year_en})`;
      monthSelect.appendChild(option);
    });
  }

  controlsDiv.appendChild(monthSelect);
  container.appendChild(controlsDiv);

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

  container.appendChild(ul);

  const modalElements = createModal();
  container.appendChild(modalElements.dialog);

  const todayNp = getTodayNepaliDateFull();
  let currentMonthIndex = 0;
  let todaysNpDateStr = "";

  if (todayNp && calendarData.months) {
    todaysNpDateStr = `${todayNp.month_np} ${todayNp.date_np}, ${todayNp.year}`;
    const foundIndex = calendarData.months.findIndex(
      (m) => m.month_np === todayNp.month_np,
    );
    if (foundIndex !== -1) {
      currentMonthIndex = foundIndex;
    }
  }

  monthSelect.value = currentMonthIndex;

  function renderSelectedMonth() {
    if (!calendarData.months || calendarData.months.length === 0) return;

    const selectedIndex = parseInt(monthSelect.value, 10);
    const monthObj = calendarData.months[selectedIndex];

    spanNp.textContent = todaysNpDateStr;
    spanMonthYear.textContent = `${calendarData.year} ${monthObj.month_np} | ${monthObj.month_year_en}`;

    ul.innerHTML = "";
    ul.appendChild(headerLi);
    renderNepaliWeekdayHeader(ul);

    const firstDateObj = monthObj.dates[0];
    const firstDateEn = parseInt(firstDateObj.date_en, 10);
    const monthYearEn = monthObj.month_year_en;

    const { monthIndex, year } = getGregorianMonthYear(
      monthYearEn,
      firstDateEn,
      firstDateEn,
    );
    const firstDate = new Date(year, monthIndex, firstDateEn);
    const firstDayWeekIndex = firstDate.getDay();

    renderMonthGrid(
      ul,
      monthObj.dates,
      firstDayWeekIndex,
      todaysNpDateStr,
      monthObj.month_np,
      calendarData.year,
      modalElements,
      monthYearEn,
    );

    updateWeekdayAbbreviations();
  }

  monthSelect.addEventListener("change", renderSelectedMonth);

  renderSelectedMonth();
  maybeAddResizeListener();
}
