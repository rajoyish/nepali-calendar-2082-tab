// src/renderMonthGrid.js

/**
 * Renders 35 date grid items as <li> elements.
 * @param {HTMLElement} ul
 */
export function renderMonthGrid(ul) {
  for (let i = 0; i < 35; i++) {
    const li = document.createElement("li");
    li.className = "month-view__date";

    const spanEn = document.createElement("span");
    spanEn.className = "month-view__date-en";
    spanEn.setAttribute("data-month-view-date-en", "");
    spanEn.textContent = "28"; // Placeholder

    const spanNp = document.createElement("span");
    spanNp.className = "month-view__date-np";
    spanNp.setAttribute("data-month-view-date-np", "");
    spanNp.textContent = "१४"; // Placeholder

    const spanTithi = document.createElement("span");
    spanTithi.className = "month-view__date-tithi";
    spanTithi.setAttribute("data-month-view-tithi", "");
    spanTithi.textContent = "प्रतिपदा"; // Placeholder

    li.appendChild(spanEn);
    li.appendChild(spanNp);
    li.appendChild(spanTithi);

    ul.appendChild(li);
  }
}
