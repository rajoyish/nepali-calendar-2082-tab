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
  return dateObj && dateObj.isHoliday === true;
}

function createModal() {
  const dialog = document.createElement("dialog");
  dialog.className = "date-modal";

  dialog.addEventListener("click", (e) => {
    if (e.target === dialog || e.target.closest(".date-modal__close")) {
      dialog.close();
    }
  });

  return { dialog };
}

function renderMonthGrid(
  ul,
  monthDates,
  firstDayWeekIndex,
  todaysNpDateStr,
  monthNp,
  year,
  modalElements,
  monthYearEn,
) {
  const totalCells = 42;
  let cellIndex = 0;
  let dateIndex = 0;
  const firstDateEn = parseInt(monthDates[0].dateEn, 10);

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

    const cellNpDateStr = `${monthNp} ${dateObj.dateNp}, ${year}`;
    if (todaysNpDateStr && cellNpDateStr === todaysNpDateStr) {
      li.classList.add("is-today");
    }

    const spanEn = document.createElement("span");
    spanEn.className = "month-view__date-en";
    spanEn.setAttribute("data-month-view-date-en", "");
    spanEn.textContent = dateObj.dateEn;

    const spanNp = document.createElement("span");
    spanNp.className = "month-view__date-np";
    spanNp.setAttribute("data-month-view-date-np", "");
    spanNp.textContent = dateObj.dateNp;

    const spanTithi = document.createElement("span");
    spanTithi.className = "month-view__date-tithi";
    spanTithi.setAttribute("data-month-view-tithi", "");
    spanTithi.textContent = dateObj.tithi || "";

    li.appendChild(spanEn);
    li.appendChild(spanNp);
    li.appendChild(spanTithi);

    li.addEventListener("click", () => {
      const { dialog } = modalElements;
      const d = dateObj.details;

      const dateEnNum = parseInt(dateObj.dateEn, 10);
      const { monthIndex, year: enYear } = getGregorianMonthYear(
        monthYearEn,
        dateEnNum,
        firstDateEn,
      );

      const targetDate = new Date(enYear, monthIndex, dateEnNum);
      targetDate.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const diffDays = Math.round((targetDate - today) / 86400000);
      let relativeDayText = "";
      if (diffDays === 0) relativeDayText = "आज";
      else if (diffDays > 0) relativeDayText = `${diffDays} दिन बाँकी`;
      else relativeDayText = `${Math.abs(diffDays)} दिन अघि`;

      let bodyHtml = `<div class="date-modal__content">`;

      if (d) {
        const titleColor = isHoliday(dateObj) ? 'style="color:#e53935;"' : "";
        bodyHtml += `
          <header class="date-modal__header">
            <h3 class="date-modal__title" ${titleColor}>${monthNp} ${dateObj.dateNp}, ${year}, ${d.panchanga.dayName}</h3>
            <div class="date-modal__header-right">
              <span class="date-modal__badge">${relativeDayText}</span>
              <button class="date-modal__close">&times;</button>
            </div>
          </header>

          <div class="date-modal__meta">
            <div class="date-modal__meta-col">
              <div>${d.fullDateEn}</div>
              <p class="date-modal__text-muted">${d.nepalSamvat || ""}</p>
            </div>
            <div class="date-modal__meta-col date-modal__meta-col--right">
              <div>${d.panchanga.yoga ? d.panchanga.yoga + " " : ""}${dateObj.tithi}</div>
              <p class="date-modal__text-muted">☀️ सूर्योदय ०५:${d.sunrise} &nbsp; 🌅 सूर्यास्त १८:${d.sunset}</p>
            </div>
          </div>

          <div class="date-modal__section">
            <h4 class="date-modal__section-title">पञ्चाङ्ग</h4>
            <div class="date-modal__grid">
              <div class="date-modal__grid-label">दिन</div>
              <div class="date-modal__grid-value">${d.panchanga.dayName}</div>
              <div class="date-modal__grid-label">तिथि</div>
              <div class="date-modal__grid-value">${d.panchanga.tithiDetails}</div>
              <div class="date-modal__grid-label">नक्षत्र</div>
              <div class="date-modal__grid-value">${d.panchanga.nakshatra}</div>
              <div class="date-modal__grid-label">योग</div>
              <div class="date-modal__grid-value">${d.panchanga.yoga}</div>
              <div class="date-modal__grid-label">करण</div>
              <div class="date-modal__grid-value">${d.panchanga.firstKarana}</div>
            </div>
          </div>
        `;

        let eventsList =
          d.events && d.events.length > 0
            ? d.events
                .map(
                  (e) => `
              <li class="date-modal__list-item">
                <span class="date-modal__bullet"></span>
                ${e.label} ${e.isHoliday ? '<span class="date-modal__tag-holiday">(बिदा)</span>' : ""}
              </li>`,
                )
                .join("")
            : `<li class="date-modal__list-item"><span class="date-modal__bullet"></span> ${dateObj.eventTitle || "छैन"}</li>`;

        bodyHtml += `
          <div class="date-modal__section">
            <h4 class="date-modal__section-title">कार्यक्रमहरू</h4>
            <ul class="date-modal__list">${eventsList}</ul>
          </div>
        `;

        let auspiciousList =
          d.auspiciousTimes && d.auspiciousTimes.length > 0
            ? d.auspiciousTimes
                .map(
                  (a) => `
              <li class="date-modal__list-item"><span class="date-modal__bullet"></span> ${a}</li>`,
                )
                .join("")
            : `<p class="date-modal__text-muted">कुनै शुभ साइत तथा मुहूर्त फेला परेन |</p>`;

        bodyHtml += `
          <div class="date-modal__section">
            <h4 class="date-modal__section-title">शुभ साइत</h4>
            <ul class="date-modal__list">${auspiciousList}</ul>
          </div>
        `;

        if (d.muhurtas && d.muhurtas.length > 0) {
          bodyHtml += `
            <div class="date-modal__section">
              <h4 class="date-modal__section-title">मुहूर्त</h4>
              <div class="date-modal__grid">
                ${d.muhurtas.map((m) => `<div class="date-modal__grid-label">${m.label}</div><div class="date-modal__grid-value">${m.time}</div>`).join("")}
              </div>
            </div>
           `;
        }
      } else {
        const fallbackDayName = targetDate.toLocaleDateString("ne-NP", {
          weekday: "long",
        });
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
        const fallbackDateEnStr = `${dateEnNum} ${fullMonths[monthIndex]} ${enYear}, ${targetDate.toLocaleDateString("en-US", { weekday: "long" })}`;
        const titleColor = isHoliday(dateObj) ? 'style="color:#e53935;"' : "";

        bodyHtml += `
          <header class="date-modal__header">
            <h3 class="date-modal__title" ${titleColor}>${monthNp} ${dateObj.dateNp}, ${year}, ${fallbackDayName}</h3>
            <div class="date-modal__header-right">
              <span class="date-modal__badge">${relativeDayText}</span>
              <button class="date-modal__close">&times;</button>
            </div>
          </header>
          <div class="date-modal__meta">
            <div class="date-modal__meta-col">
              <div>${fallbackDateEnStr}</div>
            </div>
            <div class="date-modal__meta-col date-modal__meta-col--right">
              <div>${dateObj.tithi || ""}</div>
            </div>
          </div>
          <div class="date-modal__section">
            <h4 class="date-modal__section-title">कार्यक्रमहरू</h4>
            <ul class="date-modal__list">
              <li class="date-modal__list-item">
                <span class="date-modal__bullet"></span>
                ${dateObj.eventTitle || "छैन"}
                ${isHoliday(dateObj) ? '<span class="date-modal__tag-holiday">(बिदा)</span>' : ""}
              </li>
            </ul>
          </div>
        `;
      }

      bodyHtml += `</div>`;
      dialog.innerHTML = bodyHtml;
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
      option.textContent = `${m.monthNp} (${m.monthYearEn})`;
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
    const tMonth = todayNp.monthNp || todayNp.month_np;
    const tDate = todayNp.dateNp || todayNp.date_np;
    const tYear = todayNp.yearNp || todayNp.year;

    todaysNpDateStr = `${tMonth} ${tDate}, ${tYear}`;

    const foundIndex = calendarData.months.findIndex(
      (m) => m.monthNp === tMonth,
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
    spanMonthYear.textContent = `${calendarData.yearNp} ${monthObj.monthNp} | ${monthObj.monthYearEn}`;

    ul.innerHTML = "";
    ul.appendChild(headerLi);
    renderNepaliWeekdayHeader(ul);

    const firstDateObj = monthObj.days[0];
    const firstDateEn = parseInt(firstDateObj.dateEn, 10);
    const monthYearEn = monthObj.monthYearEn;

    const { monthIndex, year } = getGregorianMonthYear(
      monthYearEn,
      firstDateEn,
      firstDateEn,
    );
    const firstDate = new Date(year, monthIndex, firstDateEn);
    const firstDayWeekIndex = firstDate.getDay();

    renderMonthGrid(
      ul,
      monthObj.days,
      firstDayWeekIndex,
      todaysNpDateStr,
      monthObj.monthNp,
      calendarData.yearNp,
      modalElements,
      monthYearEn,
    );

    updateWeekdayAbbreviations();
  }

  monthSelect.addEventListener("change", renderSelectedMonth);

  renderSelectedMonth();
  maybeAddResizeListener();
}
