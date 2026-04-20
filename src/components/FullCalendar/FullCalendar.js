import "./FullCalendar.css";
import calendarData from "../../data/calendar-data.json";
import {
  fetchKathmanduTime,
  getTodayNepaliDateFull,
  toDevanagariNumeral,
  abbreviatedWeekdays,
  weekdays,
  isHoliday,
  getGregorianMonthYear,
} from "../../utils/calendarUtils.js";
import { renderNepaliWeekdayHeader } from "../Today/Today.js";

let abbreviationListenerAdded = false;
let isRendered = false;

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

function openDateModal(
  dialog,
  dateObj,
  monthNp,
  yearNp,
  monthYearEn,
  firstDateEn,
) {
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
  else if (diffDays > 0)
    relativeDayText = `${toDevanagariNumeral(diffDays)} दिन बाँकी`;
  else relativeDayText = `${toDevanagariNumeral(Math.abs(diffDays))} दिन अघि`;

  const d = dateObj.details;
  let bodyHtml = `<div class="date-modal__content">`;
  const titleColor = isHoliday(dateObj) ? 'style="color:#e53935;"' : "";

  if (d) {
    bodyHtml += `
      <header class="date-modal__header">
        <h3 class="date-modal__title" ${titleColor}>${monthNp} ${dateObj.dateNp}, ${yearNp}, ${d.panchanga.dayName}</h3>
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

    const eventsList =
      d.events && d.events.length > 0
        ? d.events
            .map(
              (e) =>
                `<li class="date-modal__list-item"><span class="date-modal__bullet"></span>${e.label} ${e.isHoliday ? '<span class="date-modal__tag-holiday">(बिदा)</span>' : ""}</li>`,
            )
            .join("")
        : `<li class="date-modal__list-item"><span class="date-modal__bullet"></span> ${dateObj.eventTitle || "छैन"}</li>`;

    bodyHtml += `
      <div class="date-modal__section">
        <h4 class="date-modal__section-title">कार्यक्रमहरू</h4>
        <ul class="date-modal__list">${eventsList}</ul>
      </div>
    `;

    const auspiciousList =
      d.auspiciousTimes && d.auspiciousTimes.length > 0
        ? d.auspiciousTimes
            .map(
              (a) =>
                `<li class="date-modal__list-item"><span class="date-modal__bullet"></span> ${a}</li>`,
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

    bodyHtml += `
      <header class="date-modal__header">
        <h3 class="date-modal__title" ${titleColor}>${monthNp} ${dateObj.dateNp}, ${yearNp}, ${fallbackDayName}</h3>
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
}

function renderMonthGrid(ul, monthObj, yearNp, todaysNpDateStr) {
  const fragment = document.createDocumentFragment();
  const monthDates = monthObj.days;
  const firstDateEn = parseInt(monthDates[0].dateEn, 10);
  const { monthIndex, year } = getGregorianMonthYear(
    monthObj.monthYearEn,
    firstDateEn,
    firstDateEn,
  );
  const firstDate = new Date(year, monthIndex, firstDateEn);
  const firstDayWeekIndex = firstDate.getDay();

  const totalCells = 42;
  let cellIndex = 0;
  let dateIndex = 0;

  for (; cellIndex < firstDayWeekIndex; cellIndex++) {
    const li = document.createElement("li");
    li.className = "month-view__date month-view__date--empty";
    fragment.appendChild(li);
  }

  for (
    ;
    dateIndex < monthDates.length && cellIndex < totalCells;
    dateIndex++, cellIndex++
  ) {
    const dateObj = monthDates[dateIndex];
    const li = document.createElement("li");
    li.className = "month-view__date";
    li.dataset.index = dateIndex;

    if (cellIndex % 7 === 6) li.classList.add("is-saturday");
    if (isHoliday(dateObj)) li.classList.add("is-holiday");

    const cellNpDateStr = `${monthObj.monthNp} ${dateObj.dateNp}, ${yearNp}`;
    if (todaysNpDateStr && cellNpDateStr === todaysNpDateStr) {
      li.classList.add("is-today");
    }

    const spanEn = document.createElement("span");
    spanEn.className = "month-view__date-en";
    spanEn.textContent = dateObj.dateEn;

    const spanNp = document.createElement("span");
    spanNp.className = "month-view__date-np";
    spanNp.textContent = dateObj.dateNp;

    const spanTithi = document.createElement("span");
    spanTithi.className = "month-view__date-tithi";
    spanTithi.textContent = dateObj.tithi || "";

    li.appendChild(spanEn);
    li.appendChild(spanNp);
    li.appendChild(spanTithi);
    fragment.appendChild(li);
  }

  for (; cellIndex < totalCells; cellIndex++) {
    const li = document.createElement("li");
    li.className = "month-view__date month-view__date--empty";
    fragment.appendChild(li);
  }

  ul.appendChild(fragment);
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
  window.addEventListener("resize", updateWeekdayAbbreviations, {
    passive: true,
  });
  abbreviationListenerAdded = true;
}

export async function initMonthView(container) {
  if (isRendered) return;

  container.innerHTML = "";
  isRendered = true;

  const ul = document.createElement("ul");
  ul.className = "month-view";

  const headerLi = document.createElement("li");
  headerLi.className = "month-view-header-wrapper";

  const spanNp = document.createElement("span");
  spanNp.className = "todays-date-np";

  const navWrapper = document.createElement("div");
  navWrapper.className = "month-navigation";

  const prevBtn = document.createElement("button");
  prevBtn.className = "month-nav-btn";
  prevBtn.innerHTML = '<i class="bi bi-arrow-left-circle-fill"></i>';

  const spanMonthYear = document.createElement("span");
  spanMonthYear.className = "month-year-indicator";
  spanMonthYear.setAttribute("data-month-year-indicator", "");

  const nextBtn = document.createElement("button");
  nextBtn.className = "month-nav-btn";
  nextBtn.innerHTML = '<i class="bi bi-arrow-right-circle-fill"></i>';

  navWrapper.appendChild(prevBtn);
  navWrapper.appendChild(spanMonthYear);
  navWrapper.appendChild(nextBtn);

  headerLi.appendChild(spanNp);
  headerLi.appendChild(navWrapper);

  const ktmDate = await fetchKathmanduTime();
  const todayNp = getTodayNepaliDateFull(ktmDate);
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
    if (foundIndex !== -1) currentMonthIndex = foundIndex;
  }

  const modalElements = createModal();

  function renderSelectedMonth() {
    if (!calendarData.months || calendarData.months.length === 0) return;

    const monthObj = calendarData.months[currentMonthIndex];
    prevBtn.disabled = currentMonthIndex === 0;
    nextBtn.disabled = currentMonthIndex === calendarData.months.length - 1;

    spanNp.textContent = todaysNpDateStr;
    spanMonthYear.textContent = `${calendarData.yearNp} ${monthObj.monthNp} | ${monthObj.monthYearEn}`;

    ul.innerHTML = "";
    ul.appendChild(headerLi);
    renderNepaliWeekdayHeader(ul);

    renderMonthGrid(ul, monthObj, calendarData.yearNp, todaysNpDateStr);
    updateWeekdayAbbreviations();
  }

  prevBtn.addEventListener("click", () => {
    if (currentMonthIndex > 0) {
      currentMonthIndex--;
      renderSelectedMonth();
    }
  });

  nextBtn.addEventListener("click", () => {
    if (currentMonthIndex < calendarData.months.length - 1) {
      currentMonthIndex++;
      renderSelectedMonth();
    }
  });

  ul.addEventListener("click", (e) => {
    const li = e.target.closest(
      ".month-view__date:not(.month-view__date--empty)",
    );
    if (!li) return;

    const index = li.dataset.index;
    const monthObj = calendarData.months[currentMonthIndex];
    const dateObj = monthObj.days[index];
    const firstDateEn = parseInt(monthObj.days[0].dateEn, 10);

    openDateModal(
      modalElements.dialog,
      dateObj,
      monthObj.monthNp,
      calendarData.yearNp,
      monthObj.monthYearEn,
      firstDateEn,
    );
  });

  const layoutFragment = document.createDocumentFragment();
  layoutFragment.appendChild(ul);
  layoutFragment.appendChild(modalElements.dialog);
  container.appendChild(layoutFragment);

  renderSelectedMonth();
  maybeAddResizeListener();
}
