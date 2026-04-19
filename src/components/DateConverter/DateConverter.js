import "./DateConverter.css";
import { adToBs, bsToAd } from "@sbmdkl/nepali-date-converter";

function initDateConverter() {
  const container = document.querySelector("#date-converter");
  if (!container) return;

  const elements = {
    modeToggle: container.querySelector(".date-converter__toggle-input"),
    modeLabelAd: container.querySelector(".date-converter__mode-label--ad"),
    modeLabelBs: container.querySelector(".date-converter__mode-label--bs"),
    adSection: container.querySelector(".date-converter__section--ad-to-bs"),
    bsSection: container.querySelector(".date-converter__section--bs-to-ad"),
    adInput: container.querySelector(".date-converter__input--date"),
    bsResult: container.querySelector(".date-converter__output--bs"),
    bsYear: container.querySelector(".date-converter__input--year"),
    bsMonth: container.querySelector(".date-converter__select--month"),
    bsDay: container.querySelector(".date-converter__input--day"),
    adResult: container.querySelector(".date-converter__output--ad"),
  };

  let currentMode = "ad-to-bs";
  let copyTimeoutId = null;

  function switchMode(mode) {
    currentMode = mode;
    if (elements.modeToggle) {
      elements.modeToggle.checked = mode === "bs-to-ad";
      elements.modeToggle.setAttribute(
        "aria-checked",
        String(mode === "bs-to-ad"),
      );
    }

    if (elements.modeLabelAd && elements.modeLabelBs) {
      if (currentMode === "ad-to-bs") {
        elements.modeLabelAd.classList.add(
          "date-converter__mode-label--active",
        );
        elements.modeLabelBs.classList.remove(
          "date-converter__mode-label--active",
        );
      } else {
        elements.modeLabelAd.classList.remove(
          "date-converter__mode-label--active",
        );
        elements.modeLabelBs.classList.add(
          "date-converter__mode-label--active",
        );
      }
    }

    if (mode === "ad-to-bs") {
      elements.adSection?.classList.remove("date-converter__section--hidden");
      elements.bsSection?.classList.add("date-converter__section--hidden");
    } else {
      elements.bsSection?.classList.remove("date-converter__section--hidden");
      elements.adSection?.classList.add("date-converter__section--hidden");
    }
  }

  function fallbackCopyTextToClipboard(text) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      document.execCommand("copy");
    } catch (err) {}
    document.body.removeChild(textarea);
  }

  function showPopover(el) {
    let popover = el.querySelector(".date-converter__popover");
    if (!popover) {
      popover = document.createElement("span");
      popover.className = "date-converter__popover";
      popover.textContent = "Copied!";
      el.appendChild(popover);
    }

    requestAnimationFrame(() => {
      popover.classList.add("date-converter__popover--show");
    });

    if (copyTimeoutId) clearTimeout(copyTimeoutId);

    copyTimeoutId = setTimeout(() => {
      popover.classList.remove("date-converter__popover--show");
      setTimeout(() => {
        if (popover.parentNode === el) {
          popover.remove();
        }
      }, 200);
    }, 2000);
  }

  function copyTextWithPopover(el, text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(text)
        .catch(() => fallbackCopyTextToClipboard(text));
    } else {
      fallbackCopyTextToClipboard(text);
    }
    showPopover(el);
  }

  function handleCopy(e, outputEl) {
    const target = e.target;
    const textTarget =
      target.closest(".date-converter__output-main") ||
      target.closest(".date-converter__output-sub");
    if (textTarget && outputEl.contains(textTarget)) {
      const text = textTarget.textContent.trim();
      if (text) copyTextWithPopover(outputEl, text);
    }
  }

  function toNepaliNumber(num) {
    const npDigits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
    return String(num).replace(/\d/g, (d) => npDigits[d]);
  }

  function toNepaliNumberWithSlash(str) {
    const npDigits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
    return String(str).replace(/\d/g, (d) => npDigits[d]);
  }

  function getNepaliMonthName(month) {
    const nepaliMonths = [
      "बैशाख",
      "जेठ",
      "आषाढ",
      "श्रावण",
      "भाद्र",
      "आश्विन",
      "कार्तिक",
      "मंसिर",
      "पौष",
      "माघ",
      "फाल्गुन",
      "चैत्र",
    ];
    return nepaliMonths[month - 1] || `Month ${month}`;
  }

  function convertAdToBs(adDate) {
    try {
      if (
        !adDate ||
        typeof adDate !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(adDate)
      ) {
        throw new Error("Invalid format");
      }
      if (isNaN(new Date(adDate).getTime())) {
        throw new Error("Invalid date");
      }
      const result = adToBs(adDate);
      if (!result) throw new Error("Conversion failed");

      const [year, month, day] = result.split("-").map(Number);
      return { success: true, year, month, day };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  function convertBsToAd(year, month, day) {
    try {
      if (!year || !month || !day) throw new Error("Incomplete date");
      if (year < 1970 || year > 2100) throw new Error("Year out of range");
      if (month < 1 || month > 12) throw new Error("Month out of range");
      if (day < 1 || day > 32) throw new Error("Day out of range");

      const bsDateString = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const result = bsToAd(bsDateString);
      if (!result) throw new Error("Conversion failed");

      const [adYear, adMonth, adDay] = result.split("-").map(Number);
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

      return {
        success: true,
        year: adYear,
        month: adMonth,
        day: adDay,
        formatted: `${months[adMonth - 1]} ${adDay}, ${adYear}`,
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  function convertAndDisplayAdToBs(adDate) {
    if (!adDate || !elements.bsResult) return;
    const result = convertAdToBs(adDate);
    if (result.success) {
      elements.bsResult.innerHTML = `
                <span class="date-converter__output-main">${toNepaliNumber(result.year)} ${getNepaliMonthName(result.month)} ${toNepaliNumber(result.day)}</span>
                <span class="date-converter__output-sub">${toNepaliNumberWithSlash(`${result.year}/${result.month}/${result.day}`)}</span>
            `;
    } else {
      elements.bsResult.textContent = "--";
    }
  }

  function convertAndDisplayBsToAd() {
    if (
      !elements.bsYear ||
      !elements.bsMonth ||
      !elements.bsDay ||
      !elements.adResult
    )
      return;

    const year = parseInt(elements.bsYear.value);
    const month = parseInt(elements.bsMonth.value);
    const day = parseInt(elements.bsDay.value);

    if (!year || !month || !day) {
      elements.adResult.textContent = "Enter complete date";
      return;
    }

    const result = convertBsToAd(year, month, day);
    if (result.success) {
      elements.adResult.innerHTML = `
                <span class="date-converter__output-main">${result.formatted}</span>
                <span class="date-converter__output-sub">${String(result.day).padStart(2, "0")}/${String(result.month).padStart(2, "0")}/${result.year}</span>
            `;
    } else {
      elements.adResult.textContent = "--";
    }
  }

  if (elements.modeToggle) {
    elements.modeToggle.addEventListener("change", (e) => {
      switchMode(e.target.checked ? "bs-to-ad" : "ad-to-bs");
    });
  }

  if (elements.adInput) {
    elements.adInput.addEventListener("change", (e) => {
      convertAndDisplayAdToBs(e.target.value);
    });
  }

  [elements.bsYear, elements.bsMonth, elements.bsDay].forEach((input) => {
    if (input) {
      input.addEventListener("input", convertAndDisplayBsToAd);
    }
  });

  if (elements.bsResult) {
    elements.bsResult.addEventListener("click", (e) =>
      handleCopy(e, elements.bsResult),
    );
  }

  if (elements.adResult) {
    elements.adResult.addEventListener("click", (e) =>
      handleCopy(e, elements.adResult),
    );
  }

  if (elements.adInput) {
    const today = new Date().toISOString().split("T")[0];
    elements.adInput.value = today;
    convertAndDisplayAdToBs(today);
  }
  switchMode("ad-to-bs");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initDateConverter);
} else {
  initDateConverter();
}
