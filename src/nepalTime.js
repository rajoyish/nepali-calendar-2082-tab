// src/nepalTime.js

export function getNepalGregorianDateTime() {
  const now = new Date();
  const nepalOffsetMinutes = 5 * 60 + 45;
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const nepalTime = new Date(utc + nepalOffsetMinutes * 60000);

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
  const pad = (n) => n.toString().padStart(2, "0");

  return `${days[nepalTime.getDay()]}, ${
    months[nepalTime.getMonth()]
  } ${nepalTime.getDate()}, ${nepalTime.getFullYear()} ${pad(
    nepalTime.getHours()
  )}:${pad(nepalTime.getMinutes())}:${pad(nepalTime.getSeconds())}`;
}

export function startNepalTimeClock() {
  const el = document.querySelector("[data-today-en]");
  if (!el) return;

  let lastValue = "";

  function update() {
    const current = getNepalGregorianDateTime();
    if (current !== lastValue) {
      el.textContent = current;
      lastValue = current;
    }
  }

  update(); // Initial call
  return setInterval(update, 1000);
}
