import "./DateConverter.css";
import { adToBs, bsToAd } from "@sbmdkl/nepali-date-converter";

export function createDateConverter() {
  // Private State
  let currentMode = "ad-to-bs";
  let container = null;
  let elements = {};

  function cacheElements() {
    elements = {
      modeToggle: container.querySelector("[data-converter-toggle]"),
      modeLabelAd: container.querySelector("[data-mode-label-ad]"),
      modeLabelBs: container.querySelector("[data-mode-label-bs]"),
      adSection: container.querySelector("[data-converter-section='ad-to-bs']"),
      bsSection: container.querySelector("[data-converter-section='bs-to-ad']"),
      adInput: container.querySelector("[data-converter-ad-input]"),
      bsResult: container.querySelector("[data-converter-bs-result]"),
      bsYear: container.querySelector("[data-converter-bs-year]"),
      bsMonth: container.querySelector("[data-converter-bs-month]"),
      bsDay: container.querySelector("[data-converter-bs-day]"),
      adResult: container.querySelector("[data-converter-ad-result]"),
    };
  }

  function attachEventListeners() {
    if (elements.modeToggle) {
      elements.modeToggle.addEventListener("change", (e) => {
        const mode = e.target.checked ? "bs-to-ad" : "ad-to-bs";
        switchMode(mode);
      });
    }

    if (elements.adInput) {
      elements.adInput.addEventListener("change", (e) => {
        convertAndDisplayAdToBs(e.target.value);
      });
    }

    const bsInputs = [elements.bsYear, elements.bsMonth, elements.bsDay];
    bsInputs.forEach((input) => {
      if (input) {
        input.addEventListener("input", () => {
          convertAndDisplayBsToAd();
        });
      }
    });

    if (elements.bsResult) {
      addCopyListeners(elements.bsResult);
    }
    if (elements.adResult) {
      addCopyListeners(elements.adResult);
    }
  }

  function addCopyListeners(outputEl) {
    outputEl.addEventListener("click", (e) => {
      const target = e.target;
      if (
        (target.tagName === "STRONG" || target.tagName === "SMALL") &&
        outputEl.contains(target)
      ) {
        const text = target.textContent.trim();
        if (text) {
          copyTextWithPopover(target, text);
        }
      }
    });
  }

  function copyTextWithPopover(el, text) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
      } catch (err) {}
      document.body.removeChild(textarea);
    }

    removePopover(el);
    const popover = document.createElement("span");
    popover.className = "copy-popover show";
    popover.textContent = "Copied!";
    el.appendChild(popover);

    setTimeout(() => removePopover(el), 2000);
  }

  function removePopover(el) {
    const pop = el.querySelector(".copy-popover");
    if (pop) pop.remove();
  }

  function setDefaultDate() {
    if (elements.adInput) {
      const today = new Date().toISOString().split("T")[0];
      elements.adInput.value = today;
      convertAndDisplayAdToBs(today);
    }
    updateModeLabels();
  }

  function switchMode(mode) {
    currentMode = mode;
    if (elements.modeToggle) {
      elements.modeToggle.checked = mode === "bs-to-ad";
      elements.modeToggle.setAttribute(
        "aria-checked",
        mode === "bs-to-ad" ? "true" : "false",
      );
    }
    updateModeLabels();
    if (mode === "ad-to-bs") {
      elements.adSection?.removeAttribute("hidden");
      elements.bsSection?.setAttribute("hidden", "");
    } else {
      elements.bsSection?.removeAttribute("hidden");
      elements.adSection?.setAttribute("hidden", "");
    }
  }

  function updateModeLabels() {
    if (elements.modeLabelAd && elements.modeLabelBs) {
      if (currentMode === "ad-to-bs") {
        elements.modeLabelAd.style.opacity = "1";
        elements.modeLabelBs.style.opacity = "0.7";
      } else {
        elements.modeLabelAd.style.opacity = "0.7";
        elements.modeLabelBs.style.opacity = "1";
      }
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

  function formatBsDate(bsDate) {
    try {
      const { year, month, day } = bsDate;
      if (!year || !month || !day) return "Invalid date format";
      const monthName = getNepaliMonthName(month);
      return `${year} ${monthName} ${day}`;
    } catch (error) {
      return "Error formatting date";
    }
  }

  function formatBsDateNepali(bsDate) {
    try {
      const { year, month, day } = bsDate;
      const monthName = getNepaliMonthName(month);
      return `${toNepaliNumber(year)} ${monthName} ${toNepaliNumber(day)}`;
    } catch (error) {
      return "Error formatting date";
    }
  }

  function formatAdDate(adDate) {
    try {
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
      const { year, month, day } = adDate;
      if (!year || !month || !day) return "Invalid date format";
      const monthName = months[month - 1] || `Month ${month}`;
      return `${monthName} ${day}, ${year}`;
    } catch (error) {
      return "Error formatting date";
    }
  }

  function convertAdToBs(adDate) {
    try {
      if (!adDate || typeof adDate !== "string") {
        throw new Error(
          "Invalid date format. Please provide date in YYYY-MM-DD format.",
        );
      }
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(adDate)) {
        throw new Error("Date must be in YYYY-MM-DD format.");
      }
      const dateObj = new Date(adDate);
      if (isNaN(dateObj.getTime())) {
        throw new Error("Invalid date provided.");
      }
      const result = adToBs(adDate);
      if (!result) {
        throw new Error(
          "Unable to convert the date. Please try a different date.",
        );
      }
      const [year, month, day] = result.split("-").map(Number);
      const bsDateObj = { year, month, day };
      return {
        success: true,
        data: bsDateObj,
        formatted: formatBsDate(bsDateObj),
        formattedNepali: formatBsDateNepali(bsDateObj),
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  function convertBsToAd(year, month, day) {
    try {
      if (!year || !month || !day) {
        throw new Error("Year, month, and day are required.");
      }
      if (year < 1970 || year > 2100) {
        throw new Error("Year must be between 1970 and 2100.");
      }
      if (month < 1 || month > 12) {
        throw new Error("Month must be between 1 and 12.");
      }
      if (day < 1 || day > 32) {
        throw new Error("Day must be between 1 and 32.");
      }
      const bsDateString = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const result = bsToAd(bsDateString);
      if (!result) {
        throw new Error(
          "Unable to convert the BS date. Please check the date values.",
        );
      }
      const [adYear, adMonth, adDay] = result.split("-").map(Number);
      const adDateObj = { year: adYear, month: adMonth, day: adDay };
      return {
        success: true,
        data: adDateObj,
        formatted: formatAdDate(adDateObj),
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  function convertAndDisplayAdToBs(adDate) {
    if (!adDate || !elements.bsResult) return;
    const result = convertAdToBs(adDate);
    if (result.success) {
      const { year, month, day } = result.data;
      const nepaliYear = toNepaliNumber(year);
      const nepaliDay = toNepaliNumber(day);
      const nepaliMonth = getNepaliMonthName(month);
      const nepaliSmall = toNepaliNumberWithSlash(`${year}/${month}/${day}`);
      elements.bsResult.innerHTML = `
        <strong>${nepaliYear} ${nepaliMonth} ${nepaliDay}</strong>
        <small>${nepaliSmall}</small>
      `;
    } else {
      elements.bsResult.textContent = `Error: ${result.error}`;
    }
  }

  function convertAndDisplayBsToAd() {
    if (
      !elements.bsYear ||
      !elements.bsMonth ||
      !elements.bsDay ||
      !elements.adResult
    ) {
      return;
    }
    const year = parseInt(elements.bsYear.value);
    const month = parseInt(elements.bsMonth.value);
    const day = parseInt(elements.bsDay.value);

    if (!year || !month || !day) {
      elements.adResult.textContent = "Enter complete BS date to convert";
      return;
    }

    const result = convertBsToAd(year, month, day);
    if (result.success) {
      const { year, month, day } = result.data;
      const dd = String(day).padStart(2, "0");
      const mm = String(month).padStart(2, "0");
      const yyyy = year;
      elements.adResult.innerHTML = `
      <strong>${result.formatted}</strong>
      <small>${dd}/${mm}/${yyyy}</small>
    `;
    } else {
      elements.adResult.textContent = `Error: ${result.error}`;
    }
  }

  function init(containerId) {
    container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container with ID "${containerId}" not found`);
      return;
    }
    cacheElements();
    attachEventListeners();
    setDefaultDate();
  }

  // Expose public API
  return {
    init,
  };
}
