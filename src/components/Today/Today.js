import "./Today.css";
import {
  fetchKathmanduTime,
  getLocalKathmanduTime,
  getTodayNepaliDateFull,
  getNepalGregorianDate,
  toDevanagariNumeral,
  toNepaliWeekday,
  weekdays,
  abbreviatedWeekdays,
} from "../../utils/calendarUtils.js";

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

// Cache Helpers
function getCachedNepaliDate(currentIsoDate) {
  try {
    const cached = localStorage.getItem("nepaliDateCache");
    if (cached) {
      const parsedCache = JSON.parse(cached);
      if (parsedCache.dateKey === currentIsoDate) {
        return parsedCache.data;
      }
    }
  } catch (e) {
    console.error("Failed to parse cache", e);
  }
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

const npTimePeriods = [
  { label: "बिहान", start: 5, end: 12 },
  { label: "मध्यान्ह", start: 12, end: 13 },
  { label: "अपरान्ह", start: 13, end: 17 },
  { label: "साँझ", start: 17, end: 19 },
  { label: "बेलुका", start: 19, end: 21 },
  { label: "राति", start: 21, end: 24 },
  { label: "राति", start: 0, end: 5 },
];

function getNepaliTimePeriod(date) {
  const hour = date.getHours();
  return (
    npTimePeriods.find(
      (period) =>
        (period.start <= hour && hour < period.end) ||
        (period.start > period.end &&
          (hour >= period.start || hour < period.end)),
    )?.label || ""
  );
}

function getNepalClockString(ktmDate) {
  let hour = ktmDate.getHours();
  const minute = ktmDate.getMinutes();
  const second = ktmDate.getSeconds();
  let hour12 = hour % 12;
  if (hour12 === 0) hour12 = 12;
  const pad = (n) => n.toString().padStart(2, "0");
  const period = getNepaliTimePeriod(ktmDate);
  return `${period} ${pad(hour12)}:${pad(minute)}:${pad(second)}`;
}

export function renderNepalClock(ktmDate) {
  const el = document.querySelector("[data-clock]");
  if (!el) return;
  const clockStr = toDevanagariNumeral(getNepalClockString(ktmDate));
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
  const isHoliday = !!(today && today.isHoliday);
  lastHolidayKey = key;
  lastIsHoliday = isHoliday;
  setDisplay(".holiday-notice", isHoliday);
}

export function renderTodayNepaliDate(todayNp) {
  setText("[data-np-date]", todayNp?.dateNp);
  setText(
    "[data-np-month-year]",
    todayNp ? `${todayNp.monthNp}, ${todayNp.yearNp}` : "",
  );
  setText("[data-np-day-tithi]", todayNp?.tithi);

  const hasEvent = todayNp && todayNp.eventTitle;
  setText("[data-np-day-event]", hasEvent ? todayNp.eventTitle : "");
  setDisplay("[data-np-day-event]", !!hasEvent);
  updateHolidayNotice(todayNp);
}

function updateBackgroundImage() {
  const bgImage = getTimePeriodBgImage(new Date());
  document.body.style.backgroundImage = `url(${bgImage})`;
}

export async function initTodayCalendar(updateExtensionUICallback) {
  // 1. Instant optimistic render using local system time
  let ktmDate = getLocalKathmanduTime();
  const currentIsoDate = ktmDate.toISOString().split("T")[0];

  // Try to load heavy data from cache first
  let todayNp = getCachedNepaliDate(currentIsoDate);

  if (!todayNp) {
    todayNp = getTodayNepaliDateFull(ktmDate);
    if (todayNp) setCachedNepaliDate(currentIsoDate, todayNp);
  }

  // Paint the DOM immediately without waiting for network
  renderNepalDate(ktmDate);
  renderNepaliDayOfWeek();
  renderTodayNepaliDate(todayNp);
  updateBackgroundImage();
  renderNepalClock(ktmDate);

  if (todayNp && updateExtensionUICallback) {
    const currentNepaliDate = `${todayNp.monthNp} ${todayNp.dateNp}, ${todayNp.yearNp}`;
    updateExtensionUICallback(currentNepaliDate, todayNp.dateNp);
  }

  const btn = document.getElementById("btn-change-bg");
  if (btn) {
    btn.removeEventListener("click", changeBackgroundManually);
    btn.addEventListener("click", changeBackgroundManually);
  }

  // 2. Efficient clock interval using local calculation instead of API calls
  if (clockInterval) clearInterval(clockInterval);
  clockInterval = setInterval(() => {
    const currentKtmDate = getLocalKathmanduTime();
    renderNepalClock(currentKtmDate);
  }, 1000);

  // 3. Background sync to correct any system time inaccuracies silently
  fetchKathmanduTime()
    .then((accurateKtmDate) => {
      const accurateIsoDate = accurateKtmDate.toISOString().split("T")[0];

      if (accurateIsoDate !== currentIsoDate) {
        const accurateTodayNp = getTodayNepaliDateFull(accurateKtmDate);
        if (accurateTodayNp) {
          setCachedNepaliDate(accurateIsoDate, accurateTodayNp);
          renderNepalDate(accurateKtmDate);
          renderNepaliDayOfWeek();
          renderTodayNepaliDate(accurateTodayNp);
        }
      }
    })
    .catch(console.error);
}
