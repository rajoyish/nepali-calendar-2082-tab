// src/nepalTime.js

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
 * Returns the Nepal time string, e.g. "12:22:00"
 */
export function getNepalClock() {
  const nepalTime = getNepalTime();
  const pad = (n) => n.toString().padStart(2, "0");
  return `${pad(nepalTime.getHours())}:${pad(nepalTime.getMinutes())}:${pad(
    nepalTime.getSeconds()
  )}`;
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
 * Renders the Nepal clock into [data-clock]
 */
export function renderNepalClock() {
  const el = document.querySelector("[data-clock]");
  if (!el) return;
  el.textContent = getNepalClock();
}

/**
 * Renders both date and clock (for convenience)
 */
export function renderNepalTime() {
  renderNepalDate();
  renderNepalClock();
}
