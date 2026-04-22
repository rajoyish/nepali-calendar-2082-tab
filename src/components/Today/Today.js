import "./Today.css";
import { getCalendarData } from "../../utils/dataFetcher.js";
import { showDateModal } from "../DateModal/DateModal.js";
import {
  fetchKathmanduTime,
  getLocalKathmanduTime,
  getTodayNepaliDateFull,
  getNepalGregorianDate,
  toNepaliWeekday,
  weekdays,
  abbreviatedWeekdays,
  getFormattedNepalClock,
  isHoliday,
} from "../../utils/calendarUtils.js";

if (!window.__tabre_storage_patched) {
  const originalSetItem = localStorage.setItem;
  localStorage.setItem = function (key, value) {
    originalSetItem.apply(this, arguments);
    if (key === "tabre_glass_enabled") {
      const btn = document.getElementById("today-details-btn");
      if (btn) {
        if (String(value) !== "false") {
          btn.classList.add("glass");
        } else {
          btn.classList.remove("glass");
        }
      }
    }
  };
  window.__tabre_storage_patched = true;
}

const modules = import.meta.glob(
  "../../assets/wallpapers/*.{png,jpg,jpeg,gif,webp}",
  { eager: true, import: "default" },
);
const bgImages = Object.values(modules);
let manualOffset = 0;
let clockInterval = null;
let lastClockValue = "";
let lastHolidayKey = "";
let lastIsHoliday = false;
let isBgListenerAdded = false;
let detailsBtnHandler = null;

function getCachedNepaliDate(currentIsoDate) {
  try {
    const cached = localStorage.getItem("nepaliDateCache");
    if (cached) {
      const parsedCache = JSON.parse(cached);
      if (parsedCache.dateKey === currentIsoDate) {
        return parsedCache.data;
      }
    }
  } catch (e) {}
  return null;
}

function setCachedNepaliDate(currentIsoDate, npData) {
  localStorage.setItem(
    "nepaliDateCache",
    JSON.stringify({ dateKey: currentIsoDate, data: npData }),
  );
}

export function getTimePeriodBgImage(date) {
  if (bgImages.length === 0) return "";
  const totalMinutes = date.getHours() * 60 + date.getMinutes();
  const intervalIndex = Math.floor(totalMinutes / 30);
  const targetIndex = (intervalIndex + manualOffset) % bgImages.length;
  return bgImages[targetIndex];
}

export function changeBackgroundManually() {
  manualOffset++;
  updateBackgroundImage();
}

export function renderNepaliWeekdayHeader(ul) {
  weekdays.forEach(([en, np], idx) => {
    const abbrEn = abbreviatedWeekdays[idx][0];
    const abbrNp = abbreviatedWeekdays[idx][1];
    const li = document.createElement("li");
    li.className = "month-view__day-of-week";
    if (idx === 6) li.classList.add("is-saturday");

    const spanNp = document.createElement("span");
    spanNp.className = "month-view__day-label--np";
    spanNp.setAttribute("data-day-label-np", "");
    spanNp.setAttribute("data-full", np);
    spanNp.setAttribute("data-abbr", abbrNp);
    spanNp.textContent = np;

    const spanEn = document.createElement("span");
    spanEn.className = "month-view__day-label--en";
    spanEn.setAttribute("data-day-label-en", "");
    spanEn.setAttribute("data-full", en);
    spanEn.setAttribute("data-abbr", abbrEn);
    spanEn.textContent = en;

    li.appendChild(spanNp);
    li.appendChild(spanEn);
    ul.appendChild(li);
  });
}

export function renderNepalClock(ktmDate) {
  const el = document.querySelector("[data-clock]");
  if (!el) return;
  const clockStr = getFormattedNepalClock(ktmDate);
  if (el.textContent !== clockStr) {
    el.textContent = clockStr;
    lastClockValue = clockStr;
  }
}

export function renderNepalDate(ktmDate) {
  const el = document.querySelector("[data-today-en]");
  if (!el) return;
  el.textContent = getNepalGregorianDate(ktmDate);
}

export function renderNepaliDayOfWeek() {
  const elEn = document.querySelector("[data-today-en]");
  const elNp = document.querySelector("[data-np-day-of-week]");
  if (!elEn || !elNp) return;
  const enDay = elEn.textContent.split(",")[0].trim();
  elNp.textContent = toNepaliWeekday(enDay);
}

const setText = (selector, value) => {
  const el = document.querySelector(selector);
  if (el) el.textContent = value || "";
};

const setDisplay = (selector, show) => {
  const el = document.querySelector(selector);
  if (el) el.style.display = show ? "" : "none";
};

export function updateHolidayNotice(today) {
  const key = today ? `${today.yearNp}-${today.monthNp}-${today.dateNp}` : "";
  if (key === lastHolidayKey) {
    setDisplay(".holiday-notice", lastIsHoliday);
    return;
  }
  const isHolidayStatus = isHoliday(today);
  lastHolidayKey = key;
  lastIsHoliday = isHolidayStatus;
  setDisplay(".holiday-notice", isHolidayStatus);
}

export function renderTodayNepaliDate(todayNp, calendarData) {
  setText("[data-np-date]", todayNp?.dateNp);
  setText(
    "[data-np-month-year]",
    todayNp ? `${todayNp.monthNp}, ${todayNp.yearNp}` : "",
  );
  setText("[data-np-day-tithi]", todayNp?.tithi);

  const nepalSamvat = todayNp?.details?.nepalSamvat;
  setText("[data-np-samvat]", nepalSamvat);
  setDisplay("[data-np-samvat]", !!nepalSamvat);

  const hasEvent = todayNp && todayNp.eventTitle;
  setText("[data-np-day-event]", hasEvent ? todayNp.eventTitle : "");
  setDisplay("[data-np-day-event]", !!hasEvent);
  updateHolidayNotice(todayNp);

  const tithiEventContainer = document.querySelector(
    ".calendar__day-tithi-event",
  );
  if (tithiEventContainer) {
    let btn = document.getElementById("today-details-btn");
    if (!btn) {
      btn = document.createElement("button");
      btn.id = "today-details-btn";

      const isGlassEnabled =
        localStorage.getItem("tabre_glass_enabled") !== "false";
      btn.className = `btn-today-details ${isGlassEnabled ? "glass" : ""}`;

      btn.textContent = "Daily Insights";
      tithiEventContainer.insertAdjacentElement("afterend", btn);
    }

    if (detailsBtnHandler) {
      btn.removeEventListener("click", detailsBtnHandler);
    }

    detailsBtnHandler = () => {
      if (todayNp && calendarData) {
        showDateModal(todayNp, calendarData);
      }
    };
    btn.addEventListener("click", detailsBtnHandler);
  }
}

function updateBackgroundImage() {
  const bgImage = getTimePeriodBgImage(new Date());
  document.body.style.backgroundImage = `url(${bgImage})`;
}

export async function initTodayCalendar(updateExtensionUICallback) {
  const calendarData = await getCalendarData();
  if (!calendarData) return;

  let ktmDate = getLocalKathmanduTime();
  const currentIsoDate = ktmDate.toISOString().split("T")[0];

  let todayNp = getCachedNepaliDate(currentIsoDate);

  if (!todayNp) {
    todayNp = await getTodayNepaliDateFull(ktmDate);
    if (todayNp) setCachedNepaliDate(currentIsoDate, todayNp);
  }

  renderNepalDate(ktmDate);
  renderNepaliDayOfWeek();
  renderTodayNepaliDate(todayNp, calendarData);
  updateBackgroundImage();
  renderNepalClock(ktmDate);

  if (todayNp && updateExtensionUICallback) {
    const currentNepaliDate = `${todayNp.monthNp} ${todayNp.dateNp}, ${todayNp.yearNp}`;
    updateExtensionUICallback(currentNepaliDate, todayNp.dateNp);
  }

  if (!isBgListenerAdded) {
    const btn = document.getElementById("btn-change-bg");
    if (btn) {
      btn.addEventListener("click", changeBackgroundManually);
      isBgListenerAdded = true;
    }
  }

  if (clockInterval) clearInterval(clockInterval);

  let currentKtmTimeMs = getLocalKathmanduTime().getTime();

  clockInterval = setInterval(() => {
    currentKtmTimeMs += 1000;
    const updatedKtmDate = new Date(currentKtmTimeMs);
    renderNepalClock(updatedKtmDate);
  }, 1000);

  fetchKathmanduTime()
    .then(async (accurateKtmDate) => {
      const accurateIsoDate = accurateKtmDate.toISOString().split("T")[0];
      currentKtmTimeMs = accurateKtmDate.getTime();

      if (accurateIsoDate !== currentIsoDate) {
        const accurateTodayNp = await getTodayNepaliDateFull(accurateKtmDate);
        if (accurateTodayNp) {
          setCachedNepaliDate(accurateIsoDate, accurateTodayNp);
          renderNepalDate(accurateKtmDate);
          renderNepaliDayOfWeek();
          renderTodayNepaliDate(accurateTodayNp, calendarData);
        }
      }
    })
    .catch(() => {});
}
