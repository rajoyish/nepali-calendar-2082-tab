import { adToBs } from "@sbmdkl/nepali-date-converter";
import calendarData from "../data/calendar-data.json";

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

export const devanagariDigits = [
  "०",
  "१",
  "२",
  "३",
  "४",
  "५",
  "६",
  "७",
  "८",
  "९",
];

export function toDevanagariNumeral(str) {
  return String(str).replace(/\d/g, (d) => devanagariDigits[d]);
}

export function nepaliToNumber(str) {
  const np = "०१२३४५६७८९";
  return Number(
    String(str)
      .split("")
      .map((c) => (np.indexOf(c) >= 0 ? np.indexOf(c) : c))
      .join(""),
  );
}

// Synchronous local time calculation for instant rendering
export function getLocalKathmanduTime() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const nepalOffsetMinutes = 5 * 60 + 45;
  return new Date(utc + nepalOffsetMinutes * 60000);
}

export async function fetchKathmanduTime() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 800);

    const response = await fetch(
      "https://timeapi.io/api/Time/current/zone?timeZone=Asia/Kathmandu",
      {
        signal: controller.signal,
      },
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error();
    }

    const data = await response.json();
    return new Date(data.dateTime);
  } catch (error) {
    // Fallback to local calculation if API fails or times out
    return getLocalKathmanduTime();
  }
}

export function getTodayBsDate(ktmDate) {
  const iso = ktmDate.toISOString().split("T")[0];
  const bsStr = adToBs(iso);
  if (!bsStr) return null;
  const [year, month, day] = bsStr.split("-").map(Number);
  return { year, month, day };
}

export function getTodayNepaliDateFull(ktmDate) {
  const bs = getTodayBsDate(ktmDate);
  if (!bs) return null;
  const monthObj = calendarData.months[bs.month - 1];
  const dateObj = monthObj?.days.find(
    (d) => nepaliToNumber(d.dateNp) === bs.day,
  );
  if (!dateObj) return null;
  return { ...dateObj, monthNp: monthObj.monthNp, yearNp: calendarData.yearNp };
}

export function getNepalGregorianDate(ktmDate) {
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
  return `${days[ktmDate.getDay()]}, ${months[ktmDate.getMonth()]} ${ktmDate.getDate()}, ${ktmDate.getFullYear()}`;
}

export function toNepaliWeekday(enDay) {
  for (const [en, np] of weekdays) {
    if (en === enDay) return np;
  }
  return "";
}

export function getNepaliDateForAd(adDateString) {
  const bsStr = adToBs(adDateString);
  if (!bsStr) return null;
  const [year, month, day] = bsStr.split("-").map(Number);
  const monthObj = calendarData.months[month - 1];
  if (!monthObj) return null;
  const npDay = monthObj.days.find(
    (d) =>
      Number(
        String(d.dateNp).replace(/[०१२३४५६७८९]/g, (c) =>
          "०१२३४५६७८९".indexOf(c),
        ),
      ) === day,
  );
  if (!npDay) return null;
  return {
    ...npDay,
    monthNp: monthObj.monthNp,
    yearNp: calendarData.yearNp,
    bs: bsStr,
    ad: adDateString,
  };
}
