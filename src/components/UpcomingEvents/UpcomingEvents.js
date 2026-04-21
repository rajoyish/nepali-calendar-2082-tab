import "./UpcomingEvents.css";
import { getCalendarData } from "../../utils/dataFetcher.js";
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

const getEmojiIcon = () => {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  ctx.font = "48px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("📅", 32, 36);
  return canvas.toDataURL("image/png");
};

const getLocalYYYYMMDD = (d) => {
  const date = new Date(d);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const getSystemEvents = async () => {
  if (systemEventsCache) return systemEventsCache;
  const events = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const calendarData = await getCalendarData();
  if (!calendarData || !calendarData.months) return events;

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

      if (adDate >= today && day.details?.events) {
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
  try {
    return JSON.parse(localStorage.getItem("customEvents")) || [];
  } catch {
    return [];
  }
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

const checkAndNotifyTodayEvents = () => {
  const todayStr = getLocalYYYYMMDD(new Date());
  const notifiedKey = `notified_events_${todayStr}`;

  let notifiedIds = [];
  try {
    const parsed = JSON.parse(localStorage.getItem(notifiedKey));
    notifiedIds = Array.isArray(parsed) ? parsed : [];
  } catch {
    notifiedIds = [];
  }

  const events = getCustomEvents();
  const todayEvents = events.filter(
    (e) =>
      getLocalYYYYMMDD(e.timestamp) === todayStr && !notifiedIds.includes(e.id),
  );

  if (todayEvents.length > 0) {
    const iconUrl = getEmojiIcon();

    todayEvents.forEach((e) => {
      const adDateObj = new Date(e.timestamp);
      let fullDateNp = e.bsDate;
      const match = e.bsDate.match(/(\d{4})[^\d]+(\d{1,2})[^\d]+(\d{1,2})/);

      if (match) {
        const [, yyyy, mm, dd] = match;
        fullDateNp = `${toDevanagariNumeral(parseInt(dd, 10))} ${npMonths[parseInt(mm, 10) - 1]}, ${toDevanagariNumeral(yyyy)} ${npDays[adDateObj.getDay()]}`;
      }

      const fullDateEn = `${enMonths[adDateObj.getMonth()]} ${adDateObj.getDate()}, ${adDateObj.getFullYear()}, ${enDays[adDateObj.getDay()]}`;

      const title = e.title;
      const body = `${fullDateNp}\n${fullDateEn}`;

      if (typeof chrome !== "undefined" && chrome.notifications) {
        chrome.notifications.create(`evt-${e.id}`, {
          type: "basic",
          iconUrl: iconUrl,
          title: title,
          message: body,
          requireInteraction: true,
        });
        notifiedIds.push(e.id);
      } else if (
        "Notification" in window &&
        Notification.permission === "granted"
      ) {
        new Notification(title, {
          body: body,
          icon: iconUrl,
          requireInteraction: true,
        });
        notifiedIds.push(e.id);
      }
    });

    localStorage.setItem(notifiedKey, JSON.stringify(notifiedIds));
  }
};

export const initUpcomingEvents = (container) => {
  if (container.dataset.init === "true") {
    if (typeof container.render === "function") container.render();
    return;
  }

  container.dataset.init = "true";
  let activeFilter = "all";

  container.innerHTML = `
    <div class="upcoming">
        <div class="upcoming__header">
            <h2 class="upcoming__title">Upcoming Events</h2>
            <button class="upcoming__btn-add" id="btn-add-event">
                <i class="bi bi-plus-lg"></i> Add Event
            </button>
        </div>
        <div class="upcoming__filters" id="upcoming-filters">
            <button class="upcoming__filter-btn upcoming__filter-btn--active" data-filter="all">All</button>
            <button class="upcoming__filter-btn" data-filter="holiday">Holidays</button>
            <button class="upcoming__filter-btn" data-filter="custom">My Events</button>
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
  const inputAd = container.querySelector("#event-ad-date");
  const inputBs = container.querySelector("#event-bs-date");
  const inputName = container.querySelector("#event-name");
  const filtersEl = container.querySelector("#upcoming-filters");

  const generateCardHtml = (e) => {
    let monthNp, dateNp, dayOfWeekNp, fullDateNp, fullDateEn;
    const adDateObj = new Date(e.timestamp);

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

  const render = async () => {
    checkAndNotifyTodayEvents();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let sysEvents = await getSystemEvents();
    let customEvents = getCustomEvents().filter(
      (e) => e.timestamp >= today.getTime(),
    );

    if (activeFilter === "holiday") {
      sysEvents = sysEvents.filter((e) => e.isHoliday);
      customEvents = [];
    } else if (activeFilter === "custom") {
      sysEvents = [];
    }

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
      listEl.innerHTML = `<div style="text-align:center; opacity:0.6; padding: 2rem;">No ${activeFilter === "all" ? "upcoming" : activeFilter} events found</div>`;
      return;
    }

    listEl.innerHTML = finalHtml;
  };

  container.render = render;

  container.addEventListener("click", async (e) => {
    if (e.target.closest("#btn-add-event")) {
      if (typeof chrome === "undefined" || !chrome.notifications) {
        if (
          "Notification" in window &&
          Notification.permission !== "granted" &&
          Notification.permission !== "denied"
        ) {
          Notification.requestPermission();
        }
      }
      modalEl.showModal();
      return;
    }

    if (e.target.closest("#btn-cancel")) {
      modalEl.close();
      formEl.reset();
      inputBs.value = "";
      return;
    }

    const filterBtn = e.target.closest(".upcoming__filter-btn");
    if (filterBtn) {
      filtersEl
        .querySelectorAll(".upcoming__filter-btn")
        .forEach((btn) => btn.classList.remove("upcoming__filter-btn--active"));
      filterBtn.classList.add("upcoming__filter-btn--active");
      activeFilter = filterBtn.dataset.filter;
      await render();
      return;
    }

    const deleteBtn = e.target.closest(".event-card__btn-delete");
    if (deleteBtn) {
      deleteCustomEvent(deleteBtn.dataset.id);
      await render();
      return;
    }
  });

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

  formEl.addEventListener("submit", async (e) => {
    e.preventDefault();

    const [yyyy, mm, dd] = inputAd.value.split("-");
    const adDateObj = new Date(yyyy, mm - 1, dd);
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

    activeFilter = "all";
    filtersEl
      .querySelectorAll(".upcoming__filter-btn")
      .forEach((btn) => btn.classList.remove("upcoming__filter-btn--active"));
    filtersEl
      .querySelector('[data-filter="all"]')
      .classList.add("upcoming__filter-btn--active");

    await render();
  });

  render();
};