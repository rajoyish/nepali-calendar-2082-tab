import calendarData from "../calendar-data.json";

// --- Helpers ---

const EN_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const getNepalTime = () => {
  const now = new Date();
  const offset = 5 * 60 + 45;
  return new Date(now.getTime() + (now.getTimezoneOffset() + offset) * 60000);
};

const getExactEnglishMonth = (monthYearEn, dateEn) => {
  const [months] = monthYearEn.split(" ");
  const [first, second] = months.split("/");
  return parseInt(dateEn, 10) >= 14 ? first : second;
};

const isYearMatch = (monthYearEn, year) => {
  const y = monthYearEn.split(" ")[1];
  if (y.includes("-")) {
    const [start, end] = y.split("-");
    const startNum = parseInt(start, 10);
    const endNum = parseInt(start.slice(0, 2) + end, 10);
    return year === startNum || year === endNum;
  }
  return parseInt(y, 10) === year;
};

const findTodayNepaliDate = (nepalTime) => {
  const year = nepalTime.getFullYear();
  const monthName = EN_MONTHS[nepalTime.getMonth()];
  const day = nepalTime.getDate();

  for (const m of calendarData.months) {
    for (const d of m.dates) {
      if (
        getExactEnglishMonth(m.month_year_en, d.date_en) === monthName &&
        parseInt(d.date_en, 10) === day &&
        isYearMatch(m.month_year_en, year)
      ) {
        return {
          date_np: d.date_np,
          month_np: m.month_np,
          year: calendarData.year,
          tithi: d.tithi,
          event_title: d.event_title,
          classes: d.classes,
        };
      }
    }
  }
  return null;
};

const setText = (selector, value) => {
  const el = document.querySelector(selector);
  if (el) el.textContent = value || "";
};

const setDisplay = (selector, show) => {
  const el = document.querySelector(selector);
  if (el) el.style.display = show ? "" : "none";
};

// --- Main Exports ---

export function getTodayNepaliDateFull() {
  return findTodayNepaliDate(getNepalTime());
}

export function renderTodayNepaliDate() {
  const today = getTodayNepaliDateFull();
  setText("[data-np-date]", today?.date_np);
  setText(
    "[data-np-month-year]",
    today ? `${today.month_np}, ${today.year}` : ""
  );
  setText("[data-np-day-tithi]", today?.tithi);

  const hasEvent = today && today.event_title;
  setText("[data-np-day-event]", hasEvent ? today.event_title : "");
  setDisplay("[data-np-day-event]", !!hasEvent);

  updateHolidayNotice(today);
}

// --- Holiday Notice ---

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

// --- Debug ---

export function debugDateMatching(testDate = null) {
  const t = testDate || getNepalTime();
  const year = t.getFullYear();
  const monthName = EN_MONTHS[t.getMonth()];
  const day = t.getDate();

  return calendarData.months.flatMap((m) =>
    m.dates
      .filter(
        (d) =>
          getExactEnglishMonth(m.month_year_en, d.date_en) === monthName &&
          parseInt(d.date_en, 10) === day &&
          isYearMatch(m.month_year_en, year)
      )
      .map((d) => ({
        nepali_date: d.date_np,
        nepali_month: m.month_np,
        english_month_year: m.month_year_en,
        english_date: d.date_en,
      }))
  );
}
