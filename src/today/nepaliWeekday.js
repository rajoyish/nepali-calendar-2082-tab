// src/today/nepaliWeekday.js
export const weekdays = [
  ['Sunday', 'आइतबार'],
  ['Monday', 'सोमबार'],
  ['Tuesday', 'मङ्गलबार'],
  ['Wednesday', 'बुधबार'],
  ['Thursday', 'बिहीबार'],
  ['Friday', 'शुक्रबार'],
  ['Saturday', 'शनिबार'],
];

export const abbreviatedWeekdays = [
  ['Sun', 'आइत'],
  ['Mon', 'सोम'],
  ['Tue', 'मङ्गल'],
  ['Wed', 'बुध'],
  ['Thu', 'बिही'],
  ['Fri', 'शुक्र'],
  ['Sat', 'शनि'],
];

/**
 * Given an English weekday, returns the Nepali equivalent.
 * @param {string} enDay
 * @returns {string}
 */
export function toNepaliWeekday(enDay) {
  for (const [en, np] of weekdays) {
    if (en === enDay) return np;
  }
  return '';
}

/**
 * Reads the English day from [data-today-en], converts to Nepali,
 * and renders to [data-np-day-of-week].
 */
export function renderNepaliDayOfWeek() {
  const elEn = document.querySelector('[data-today-en]');
  const elNp = document.querySelector('[data-np-day-of-week]');
  if (!elEn || !elNp) return;

  // The English day is the first word before a comma
  // e.g. "Sunday, May 25, 2025"
  const enDay = elEn.textContent.split(',')[0].trim();
  elNp.textContent = toNepaliWeekday(enDay);
}

/**
 * Renders the weekday header row into the given <ul>.
 * @param {HTMLElement} ul
 */
export function renderNepaliWeekdayHeader(ul) {
  weekdays.forEach(([en, np], idx) => {
    const abbrEn = abbreviatedWeekdays[idx][0];
    const abbrNp = abbreviatedWeekdays[idx][1];

    const li = document.createElement('li');
    li.className = 'month-view__day-of-week';
    // Add is-saturday class to Saturday header
    if (idx === 6) {
      li.classList.add('is-saturday');
    }

    const spanNp = document.createElement('span');
    spanNp.className = 'month-view__day-label--np';
    spanNp.setAttribute('data-day-label-np', '');
    spanNp.setAttribute('data-full', np);
    spanNp.setAttribute('data-abbr', abbrNp);
    spanNp.textContent = np;

    const spanEn = document.createElement('span');
    spanEn.className = 'month-view__day-label--en';
    spanEn.setAttribute('data-day-label-en', '');
    spanEn.setAttribute('data-full', en);
    spanEn.setAttribute('data-abbr', abbrEn);
    spanEn.textContent = en;

    li.appendChild(spanNp);
    li.appendChild(spanEn);

    ul.appendChild(li);
  });
}
