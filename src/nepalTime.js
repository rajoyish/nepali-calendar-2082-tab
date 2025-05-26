// src/nepalTime.js

import { toDevanagariNumeral } from "./devanagariNumeral.js";

// Nepali time periods (defined once, used below)
const npTimePeriods = [
  { label: "बिहान", start: 5, end: 12 }, // 5am - 12pm
  { label: "मध्यान्ह", start: 12, end: 13 }, // 12pm - 1pm
  { label: "अपरान्ह", start: 13, end: 17 }, // 1pm - 5pm
  { label: "साँझ", start: 17, end: 19 }, // 5pm - 7pm
  { label: "बेलुका", start: 19, end: 21 }, // 7pm - 9pm
  { label: "राति", start: 21, end: 24 }, // 9pm - 12am
  { label: "राति", start: 0, end: 5 }, // 12am - 5am
];

/**
 * Returns the Nepali time period label for a given Date object.
 */
function getNepaliTimePeriod(date) {
  const hour = date.getHours();
  return (
    npTimePeriods.find(
      (period) =>
        (period.start <= hour && hour < period.end) ||
        (period.start > period.end &&
          (hour >= period.start || hour < period.end))
    )?.label || ""
  );
}

/**
 * Returns the current Nepal time as a Date object.
 */
function getNepalTime() {
  const now = new Date();
  const nepalOffsetMinutes = 5 * 60 + 45;
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  return new Date(utc + nepalOffsetMinutes * 60000);
}

/**
 * Returns the Nepal date string, e.g. "Sunday, May 25, 2025"
 */
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
  return `${days[nepalTime.getDay()]}, ${
    months[nepalTime.getMonth()]
  } ${nepalTime.getDate()}, ${nepalTime.getFullYear()}`;
}

/**
 * Returns the Nepal time string in 12-hour format with Nepali time period,
 * e.g. "बिहान १२:२२:००"
 */
export function getNepalClockString() {
  const nepalTime = getNepalTime();
  let hour = nepalTime.getHours();
  const minute = nepalTime.getMinutes();
  const second = nepalTime.getSeconds();

  // 12-hour conversion
  let hour12 = hour % 12;
  if (hour12 === 0) hour12 = 12;

  const pad = (n) => n.toString().padStart(2, "0");
  const period = getNepaliTimePeriod(nepalTime);

  return `${period} ${pad(hour12)}:${pad(minute)}:${pad(second)}`;
}

/**
 * Efficiently renders the Nepal clock into [data-clock], only if changed.
 */
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

/**
 * Renders the Nepal date into [data-today-en]
 */
export function renderNepalDate() {
  const el = document.querySelector("[data-today-en]");
  if (!el) return;
  el.textContent = getNepalGregorianDate();
}

/**
 * Renders both date and clock (for convenience)
 */
export function renderNepalTime() {
  renderNepalDate();
  renderNepalClock();
}

/**
 * Starts the clock interval, only one instance.
 */
let clockInterval = null;
export function startNepalClock() {
  if (clockInterval) return;
  renderNepalClock();
  clockInterval = setInterval(renderNepalClock, 1000);
}
