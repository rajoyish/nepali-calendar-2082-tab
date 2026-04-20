import "./UpcomingEvents.css";
import calendarData from "../../data/calendar-data.json";
import {
  getGregorianMonthYear,
  getRelativeDateText,
  toDevanagariNumeral,
  weekdays,
} from "../../utils/calendarUtils.js";
import { adToBs } from "@sbmdkl/nepali-date-converter";

const npMonths = [
  "वैशाख",
  "जेठ",
  "असार",
  "साउन",
  "भदौ",
  "असोज",
  "कात्तिक",
  "मंसिर",
  "पुष",
  "माघ",
  "फागुन",
  "चैत",
];
const enMonths = [
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
const npDays = weekdays.map((w) => w[1]);
const enDays = weekdays.map((w) => w[0]);

let systemEventsCache = null;

const getSystemEvents = () => {
  if (systemEventsCache) return systemEventsCache;
  const events = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  calendarData.months.forEach((month) => {
    let isSecondMonth = false;
    month.days.forEach((day, idx) => {
      if (
        idx > 0 &&
        parseInt(day.dateEn, 10) < parseInt(month.days[idx - 1].dateEn, 10)
      ) {
        isSecondMonth = true;
      }
      const { monthIndex, year } = getGregorianMonthYear(
        month.monthYearEn,
        isSecondMonth,
      );
      const adDate = new Date(year, monthIndex, parseInt(day.dateEn, 10));
      adDate.setHours(0, 0, 0, 0);

      if (adDate >= today && day.details && day.details.events) {
        day.details.events.forEach((evt) => {
          events.push({
            id: `sys-${adDate.getTime()}-${evt.label}`,
            title: evt.label,
            adDate: adDate.toISOString(),
            bsDate: day.details.fullDateNp,
            monthNp: month.monthNp,
            dateNp: day.dateNp,
            dayOfWeekNp:
              day.details.panchanga?.dayName || npDays[adDate.getDay()],
            fullDateNp: day.details.fullDateNp,
            fullDateEn:
              day.details.fullDateEn ||
              `${enMonths[adDate.getMonth()]} ${adDate.getDate()}, ${adDate.getFullYear()}, ${enDays[adDate.getDay()]}`,
            isHoliday: evt.isHoliday,
            isCustom: false,
            timestamp: adDate.getTime(),
          });
        });
      }
    });
  });

  systemEventsCache = events;
  return events;
};

const getCustomEvents = () => {
  const data = localStorage.getItem("customEvents");
  return data ? JSON.parse(data) : [];
};

const saveCustomEvent = (event) => {
  const events = getCustomEvents();
  events.push(event);
  localStorage.setItem("customEvents", JSON.stringify(events));
};

const deleteCustomEvent = (id) => {
  const events = getCustomEvents().filter((e) => e.id !== id);
  localStorage.setItem("customEvents", JSON.stringify(events));
};

export const initUpcomingEvents = (container) => {
  if (container.dataset.init === "true") {
    if (typeof container.render === "function") container.render();
    return;
  }

  container.dataset.init = "true";

  container.innerHTML = `
    <div class="upcoming">
        <div class="upcoming__header">
            <h2 class="upcoming__title">Upcoming Events</h2>
            <button class="upcoming__btn-add" id="btn-add-event">
                <i class="bi bi-plus-lg"></i> Add Event
            </button>
        </div>
        <div class="upcoming__list" id="events-list"></div>
    </div>
    <dialog class="upcoming-modal glass" id="event-modal">
        <form class="upcoming-form" id="event-form">
            <h3 class="upcoming-form__title">New Custom Event</h3>
            <div class="upcoming-form__group">
                <label class="upcoming-form__label">Event Name</label>
                <input class="upcoming-form__input" type="text" id="event-name" required />
            </div>
            <div class="upcoming-form__group">
                <label class="upcoming-form__label">AD Date</label>
                <input class="upcoming-form__input" type="date" id="event-ad-date" required />
            </div>
            <div class="upcoming-form__group">
                <label class="upcoming-form__label">BS Date</label>
                <input class="upcoming-form__input" type="text" id="event-bs-date" placeholder="Auto-fills from AD" readonly required />
            </div>
            <div class="upcoming-form__actions">
                <button type="button" class="upcoming-form__btn upcoming-form__btn--cancel" id="btn-cancel">Cancel</button>
                <button type="submit" class="upcoming-form__btn upcoming-form__btn--save">Save</button>
            </div>
        </form>
    </dialog>
  `;

  const listEl = container.querySelector("#events-list");
  const modalEl = container.querySelector("#event-modal");
  const formEl = container.querySelector("#event-form");
  const btnAdd = container.querySelector("#btn-add-event");
  const btnCancel = container.querySelector("#btn-cancel");
  const inputAd = container.querySelector("#event-ad-date");
  const inputBs = container.querySelector("#event-bs-date");
  const inputName = container.querySelector("#event-name");

  const generateCardHtml = (e) => {
    let monthNp, dateNp, dayOfWeekNp, fullDateNp, fullDateEn;
    const adDateObj = new Date(e.adDate);

    if (e.isCustom) {
      const match = e.bsDate.match(/(\d{4})[^\d]+(\d{1,2})[^\d]+(\d{1,2})/);
      if (match) {
        const [, yyyy, mm, dd] = match;
        monthNp = npMonths[parseInt(mm, 10) - 1];
        dateNp = toDevanagariNumeral(parseInt(dd, 10));
        dayOfWeekNp = npDays[adDateObj.getDay()];
        fullDateNp = `${dateNp} ${monthNp}, ${toDevanagariNumeral(yyyy)} ${dayOfWeekNp}`;
      } else {
        monthNp = "??";
        dateNp = "??";
        dayOfWeekNp = npDays[adDateObj.getDay()];
        fullDateNp = e.bsDate;
      }
      fullDateEn = `${enMonths[adDateObj.getMonth()]} ${adDateObj.getDate()}, ${adDateObj.getFullYear()}, ${enDays[adDateObj.getDay()]}`;
    } else {
      monthNp = e.monthNp;
      dateNp = e.dateNp;
      dayOfWeekNp = e.dayOfWeekNp;
      fullDateNp = e.fullDateNp;
      fullDateEn = e.fullDateEn;
    }

    const cardClass = e.isHoliday
      ? "event-card--holiday"
      : e.isCustom
        ? "event-card--custom"
        : "";

    return `
      <div class="event-card glass-pill ${cardClass}">
          <div class="event-card__calendar">
              <span class="event-card__month">${monthNp}</span>
              <span class="event-card__date">${dateNp}</span>
              <span class="event-card__day">${dayOfWeekNp}</span>
          </div>
          <div class="event-card__details">
              <div class="event-card__header">
                  <h3 class="event-card__title">${e.title}</h3>
                  ${e.isHoliday ? '<span class="event-card__badge event-card__badge--holiday">बिदा</span>' : ""}
                  ${e.isCustom ? '<span class="event-card__badge event-card__badge--custom">My Event</span>' : ""}
              </div>
              <span class="event-card__full-np">${fullDateNp}</span>
              <span class="event-card__full-en">${fullDateEn}</span>
          </div>
          <div class="event-card__actions">
              <span class="event-card__relative">${getRelativeDateText(adDateObj.toISOString())}</span>
              ${e.isCustom ? `<button class="event-card__btn-delete" data-id="${e.id}"><i class="bi bi-trash3-fill"></i></button>` : ""}
          </div>
      </div>
    `;
  };

  const render = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sysEvents = getSystemEvents();
    const customEvents = getCustomEvents().filter(
      (e) => new Date(e.adDate) >= today,
    );

    let finalHtml = "";

    if (customEvents.length > 0) {
      customEvents.sort((a, b) => a.timestamp - b.timestamp);
      finalHtml += customEvents.map(generateCardHtml).join("");
    }

    const groupedSysEvents = new Map();
    sysEvents
      .sort((a, b) => a.timestamp - b.timestamp)
      .forEach((e) => {
        if (!groupedSysEvents.has(e.monthNp)) {
          groupedSysEvents.set(e.monthNp, []);
        }
        groupedSysEvents.get(e.monthNp).push(e);
      });

    groupedSysEvents.forEach((events, month) => {
      finalHtml += `<div class="upcoming__month-divider">${month}</div>`;
      finalHtml += events.map(generateCardHtml).join("");
    });

    if (finalHtml === "") {
      listEl.innerHTML = `<div style="text-align:center; opacity:0.6; padding: 2rem;">No upcoming events</div>`;
      return;
    }

    listEl.innerHTML = finalHtml;

    container.querySelectorAll(".event-card__btn-delete").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        deleteCustomEvent(e.currentTarget.dataset.id);
        render();
      });
    });
  };

  container.render = render;

  inputAd.addEventListener("change", (e) => {
    if (e.target.value) {
      try {
        inputBs.value = adToBs(e.target.value);
      } catch {
        inputBs.value = "Invalid Date";
      }
    } else {
      inputBs.value = "";
    }
  });

  btnAdd.addEventListener("click", () => modalEl.showModal());

  btnCancel.addEventListener("click", () => {
    modalEl.close();
    formEl.reset();
    inputBs.value = "";
  });

  formEl.addEventListener("submit", (e) => {
    e.preventDefault();

    const adDateObj = new Date(inputAd.value);
    adDateObj.setHours(0, 0, 0, 0);

    saveCustomEvent({
      id: `cust-${Date.now()}`,
      title: inputName.value,
      adDate: adDateObj.toISOString(),
      bsDate: inputBs.value,
      isHoliday: false,
      isCustom: true,
      timestamp: adDateObj.getTime(),
    });

    modalEl.close();
    formEl.reset();
    inputBs.value = "";
    render();
  });

  render();
};
