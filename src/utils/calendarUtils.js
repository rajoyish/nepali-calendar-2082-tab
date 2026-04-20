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

export const npTimePeriods = [
  { label: "बिहान", start: 5, end: 12 },
  { label: "मध्यान्ह", start: 12, end: 13 },
  { label: "अपरान्ह", start: 13, end: 17 },
  { label: "साँझ", start: 17, end: 19 },
  { label: "बेलुका", start: 19, end: 21 },
  { label: "राति", start: 21, end: 24 },
  { label: "राति", start: 0, end: 5 },
];

export function toDevanagariNumeral(str) {
  return String(str).replace(/\d/g, (d) => devanagariDigits[d]);
}

export function nepaliToNumber(str) {
  const np = devanagariDigits.join("");
  return Number(
    String(str)
      .split("")
      .map((c) => (np.indexOf(c) >= 0 ? np.indexOf(c) : c))
      .join(""),
  );
}

export function getLocalKathmanduTime() {
  const now = new Date();
  const ktmString = now.toLocaleString("en-US", { timeZone: "Asia/Kathmandu" });
  return new Date(ktmString);
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
  const npDay = monthObj.days.find((d) => nepaliToNumber(d.dateNp) === day);
  if (!npDay) return null;
  return {
    ...npDay,
    monthNp: monthObj.monthNp,
    yearNp: calendarData.yearNp,
    bs: bsStr,
    ad: adDateString,
  };
}

export function getNepaliTimePeriod(date) {
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

export function getFormattedNepalClock(ktmDate) {
  let hour = ktmDate.getHours();
  const minute = ktmDate.getMinutes();
  const second = ktmDate.getSeconds();
  let hour12 = hour % 12;
  if (hour12 === 0) hour12 = 12;
  const pad = (n) => n.toString().padStart(2, "0");
  const period = getNepaliTimePeriod(ktmDate);
  const clockStr = `${period} ${pad(hour12)}:${pad(minute)}:${pad(second)}`;
  return toDevanagariNumeral(clockStr);
}

export function isHoliday(dateObj) {
  return dateObj && dateObj.isHoliday === true;
}

export function getGregorianMonthYear(monthYearEn, isSecondMonth) {
  const parts = monthYearEn.split(" ");
  const mParts = parts[0].split("/");
  const monthName = isSecondMonth && mParts.length > 1 ? mParts[1] : mParts[0];
  const monthIndex = [
    "jan",
    "feb",
    "mar",
    "apr",
    "may",
    "jun",
    "jul",
    "aug",
    "sep",
    "oct",
    "nov",
    "dec",
  ].findIndex((m) => monthName.toLowerCase().startsWith(m));

  let year = parseInt(parts[1], 10);
  if (
    isSecondMonth &&
    monthIndex === 0 &&
    mParts[0].toLowerCase().startsWith("dec")
  ) {
    year += 1;
  }
  return { monthIndex, year };
}

export function getRelativeDateText(targetDate) {
  const todayKtm = getLocalKathmanduTime();
  todayKtm.setHours(0, 0, 0, 0);

  const target = new Date(targetDate);
  target.setHours(0, 0, 0, 0);

  const utc1 = Date.UTC(
    target.getFullYear(),
    target.getMonth(),
    target.getDate(),
  );
  const utc2 = Date.UTC(
    todayKtm.getFullYear(),
    todayKtm.getMonth(),
    todayKtm.getDate(),
  );

  const diffDays = Math.floor((utc1 - utc2) / 86400000);

  if (diffDays === 0) return "आज";
  if (diffDays > 0) return `${toDevanagariNumeral(diffDays)} दिन बाँकी`;
  return `${toDevanagariNumeral(Math.abs(diffDays))} दिन अघि`;
}
