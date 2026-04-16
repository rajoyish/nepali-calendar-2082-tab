import "./Today.css";
import calendarData from "../../data/calendar-data.json";
import { adToBs } from "@sbmdkl/nepali-date-converter";

const modules = import.meta.glob(
  "../../assets/wallpapers/*.{png,jpg,jpeg,gif,webp}",
  { eager: true, import: "default" },
);
const bgImages = Object.values(modules);
let manualOffset = 0;

export function getTimePeriodBgImage(date) {
  if (bgImages.length === 0) return "";
  const totalMinutes = date.getHours() * 60 + date.getMinutes();
  const intervalIndex = Math.floor(totalMinutes / 30);
  const targetIndex = (intervalIndex + manualOffset) % bgImages.length;
  return bgImages[targetIndex];
}

export function changeBackgroundManually() {
  manualOffset++;
}

const devanagariDigits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];

function toDevanagariNumeral(str) {
  return String(str).replace(/\d/g, (d) => devanagariDigits[d]);
}

export const weekdays = [
  ["Sunday", "आइतबार"],
  ["Monday", "सोमबार"],
  ["Tuesday", "मङ्गलबार"],
  ["Wednesday", "बुधबार"],
  ["Thursday", "बिहीबार"],
  ["Friday", "शुक्रबार"],
  ["Saturday", "शनिबार"],
];

export const abbreviatedWeekdays = [
  ["Sun", "आइत"],
  ["Mon", "सोम"],
  ["Tue", "मङ्गल"],
  ["Wed", "बुध"],
  ["Thu", "बिही"],
  ["Fri", "शुक्र"],
  ["Sat", "शनि"],
];

function toNepaliWeekday(enDay) {
  for (const [en, np] of weekdays) {
    if (en === enDay) return np;
  }
  return "";
}

export function renderNepaliDayOfWeek() {
  const elEn = document.querySelector("[data-today-en]");
  const elNp = document.querySelector("[data-np-day-of-week]");
  if (!elEn || !elNp) return;
  const enDay = elEn.textContent.split(",")[0].trim();
  elNp.textContent = toNepaliWeekday(enDay);
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

function getNepalTime() {
  const now = new Date();
  const nepalOffsetMinutes = 5 * 60 + 45;
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + nepalOffsetMinutes * 60000);
}

export function getNepalGregorianDate() {
  const nepalTime = getNepalTime();
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const months = [
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
  return `${days[nepalTime.getDay()]}, ${months[nepalTime.getMonth()]} ${nepalTime.getDate()}, ${nepalTime.getFullYear()}`;
}

function getNepalClockString() {
  const nepalTime = getNepalTime();
  let hour = nepalTime.getHours();
  const minute = nepalTime.getMinutes();
  const second = nepalTime.getSeconds();
  let hour12 = hour % 12;
  if (hour12 === 0) hour12 = 12;
  const pad = (n) => n.toString().padStart(2, "0");
  const period = getNepaliTimePeriod(nepalTime);
  return `${period} ${pad(hour12)}:${pad(minute)}:${pad(second)}`;
}

let lastClockValue = "";
export function renderNepalClock() {
  const el = document.querySelector("[data-clock]");
  if (!el) return;
  const clockStr = toDevanagariNumeral(getNepalClockString());
  if (el.textContent !== clockStr) {
    el.textContent = clockStr;
    lastClockValue = clockStr;
  }
}

export function renderNepalDate() {
  const el = document.querySelector("[data-today-en]");
  if (!el) return;
  el.textContent = getNepalGregorianDate();
}

function nepaliToNumber(str) {
  const np = "०१२३४५६७८९";
  return Number(
    String(str)
      .split("")
      .map((c) => (np.indexOf(c) >= 0 ? np.indexOf(c) : c))
      .join(""),
  );
}

function getTodayBsDate() {
  const nepalTime = getNepalTime();
  const iso = nepalTime.toISOString().split("T")[0];
  const bsStr = adToBs(iso);
  if (!bsStr) return null;
  const [year, month, day] = bsStr.split("-").map(Number);
  return { year, month, day };
}

export function getTodayNepaliDateFull() {
  const bs = getTodayBsDate();
  if (!bs) return null;
  const monthObj = calendarData.months[bs.month - 1];
  const dateObj = monthObj?.dates.find(
    (d) => nepaliToNumber(d.date_np) === bs.day,
  );
  if (!dateObj) return null;
  return { ...dateObj, month_np: monthObj.month_np, year: calendarData.year };
}

const setText = (selector, value) => {
  const el = document.querySelector(selector);
  if (el) el.textContent = value || "";
};

const setDisplay = (selector, show) => {
  const el = document.querySelector(selector);
  if (el) el.style.display = show ? "" : "none";
};

let lastHolidayKey = "";
let lastIsHoliday = false;

export function updateHolidayNotice(today = getTodayNepaliDateFull()) {
  const key = today ? `${today.year}-${today.month_np}-${today.date_np}` : "";
  if (key === lastHolidayKey) {
    setDisplay(".holiday-notice", lastIsHoliday);
    return;
  }
  const isHoliday = !!(
    today &&
    today.classes &&
    today.classes.includes("is-holiday")
  );
  lastHolidayKey = key;
  lastIsHoliday = isHoliday;
  setDisplay(".holiday-notice", isHoliday);
}

export function renderTodayNepaliDate() {
  const today = getTodayNepaliDateFull();
  setText("[data-np-date]", today?.date_np);
  setText(
    "[data-np-month-year]",
    today ? `${today.month_np}, ${today.year}` : "",
  );
  setText("[data-np-day-tithi]", today?.tithi);

  const hasEvent = today && today.event_title;
  setText("[data-np-day-event]", hasEvent ? today.event_title : "");
  setDisplay("[data-np-day-event]", !!hasEvent);
  updateHolidayNotice(today);
}

export function getNepaliDateForAd(adDateString) {
  const bsStr = adToBs(adDateString);
  if (!bsStr) return null;
  const [year, month, day] = bsStr.split("-").map(Number);
  const monthObj = calendarData.months[month - 1];
  if (!monthObj) return null;
  const npDay = monthObj.dates.find(
    (d) =>
      Number(
        String(d.date_np).replace(/[०१२३४५६७८९]/g, (c) =>
          "०१२३४५६७८९".indexOf(c),
        ),
      ) === day,
  );
  if (!npDay) return null;
  return {
    ...npDay,
    month_np: monthObj.month_np,
    year: calendarData.year,
    bs: bsStr,
    ad: adDateString,
  };
}

// Functional Component Factory
export function createTodayComponent() {
  // Private State
  let lastRenderedGregorianDate = "";
  let lastRenderedNepaliDate = "";
  let lastBgImage = "";
  let clockInterval = null;
  let updateExtensionUICallback = null;

  function renderDateDependentNepalInfo() {
    const currentGregorianDate = getNepalGregorianDate();
    if (currentGregorianDate !== lastRenderedGregorianDate) {
      lastRenderedGregorianDate = currentGregorianDate;
      renderNepalDate();
      renderNepaliDayOfWeek();

      const todayNp = getTodayNepaliDateFull();
      const currentNepaliDate = todayNp
        ? `${todayNp.month_np} ${todayNp.date_np}, ${todayNp.year}`
        : "";

      if (todayNp && updateExtensionUICallback) {
        updateExtensionUICallback(currentNepaliDate, todayNp.date_np);
      }

      if (currentNepaliDate !== lastRenderedNepaliDate) {
        lastRenderedNepaliDate = currentNepaliDate;
        renderTodayNepaliDate();
      }
    }
  }

  function updateBackgroundImage() {
    const bgImage = getTimePeriodBgImage(new Date());
    if (bgImage && bgImage !== lastBgImage) {
      document.body.style.backgroundImage = `url(${bgImage})`;
      lastBgImage = bgImage;
    }
  }

  function setupManualBackgroundUpdate() {
    const btn = document.getElementById("btn-change-bg");
    if (btn) {
      btn.addEventListener("click", () => {
        changeBackgroundManually();
        lastBgImage = "";
        updateBackgroundImage();
      });
    }
  }

  function startClock() {
    if (clockInterval) return;
    renderNepalClock();
    clockInterval = setInterval(() => renderNepalClock(), 1000);
  }

  function periodicUpdate() {
    renderDateDependentNepalInfo();
    updateBackgroundImage();
  }

  function init(callback) {
    updateExtensionUICallback = callback;
    renderDateDependentNepalInfo();
    startClock();
    updateBackgroundImage();
    setupManualBackgroundUpdate();
  }

  // Expose public API
  return {
    init,
    periodicUpdate,
  };
}
