// src/utils/dateInputIcon.js

export function setupDateInputIcon() {
  const input = document.querySelector("#converter-ad-date");
  const icon = document.querySelector(".custom-calendar-icon");

  if (input && icon) {
    icon.addEventListener("click", function () {
      if (typeof input.showPicker === "function") {
        input.showPicker();
      } else {
        input.focus();
      }
    });
  }
}
