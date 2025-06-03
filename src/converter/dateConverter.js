// Import the nepali date converter functions
import { adToBs, bsToAd } from "@sbmdkl/nepali-date-converter";

/**
 * DateConverter class handles conversion between AD and BS dates
 */
export class DateConverter {
  constructor() {
    this.currentMode = "ad-to-bs";
    this.container = null;
    this.elements = {};
  }

  init(containerId) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error(`Container with ID "${containerId}" not found`);
      return;
    }
    this.cacheElements();
    this.attachEventListeners();
    this.setDefaultDate();
  }

  cacheElements() {
    this.elements = {
      modeToggle: this.container.querySelector("[data-converter-toggle]"),
      modeLabelAd: this.container.querySelector("[data-mode-label-ad]"),
      modeLabelBs: this.container.querySelector("[data-mode-label-bs]"),
      adSection: this.container.querySelector(
        "[data-converter-section='ad-to-bs']"
      ),
      bsSection: this.container.querySelector(
        "[data-converter-section='bs-to-ad']"
      ),
      adInput: this.container.querySelector("[data-converter-ad-input]"),
      bsResult: this.container.querySelector("[data-converter-bs-result]"),
      bsYear: this.container.querySelector("[data-converter-bs-year]"),
      bsMonth: this.container.querySelector("[data-converter-bs-month]"),
      bsDay: this.container.querySelector("[data-converter-bs-day]"),
      adResult: this.container.querySelector("[data-converter-ad-result]"),
    };
  }

  attachEventListeners() {
    if (this.elements.modeToggle) {
      this.elements.modeToggle.addEventListener("change", (e) => {
        const mode = e.target.checked ? "bs-to-ad" : "ad-to-bs";
        this.switchMode(mode);
      });
    }
    if (this.elements.adInput) {
      this.elements.adInput.addEventListener("change", (e) => {
        this.convertAndDisplayAdToBs(e.target.value);
      });
    }
    const bsInputs = [
      this.elements.bsYear,
      this.elements.bsMonth,
      this.elements.bsDay,
    ];
    bsInputs.forEach((input) => {
      if (input) {
        input.addEventListener("input", () => {
          this.convertAndDisplayBsToAd();
        });
      }
    });
  }

  setDefaultDate() {
    if (this.elements.adInput) {
      const today = new Date().toISOString().split("T")[0];
      this.elements.adInput.value = today;
      this.convertAndDisplayAdToBs(today);
    }
    this.updateModeLabels();
  }

  switchMode(mode) {
    this.currentMode = mode;
    if (this.elements.modeToggle) {
      this.elements.modeToggle.checked = mode === "bs-to-ad";
      this.elements.modeToggle.setAttribute(
        "aria-checked",
        mode === "bs-to-ad" ? "true" : "false"
      );
    }
    this.updateModeLabels();
    if (mode === "ad-to-bs") {
      this.elements.adSection?.removeAttribute("hidden");
      this.elements.bsSection?.setAttribute("hidden", "");
    } else {
      this.elements.bsSection?.removeAttribute("hidden");
      this.elements.adSection?.setAttribute("hidden", "");
    }
  }

  updateModeLabels() {
    if (this.elements.modeLabelAd && this.elements.modeLabelBs) {
      if (this.currentMode === "ad-to-bs") {
        this.elements.modeLabelAd.style.opacity = "1";
        this.elements.modeLabelBs.style.opacity = "0.7";
      } else {
        this.elements.modeLabelAd.style.opacity = "0.7";
        this.elements.modeLabelBs.style.opacity = "1";
      }
    }
  }

  toNepaliNumber(num) {
    const npDigits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
    return String(num).replace(/\d/g, (d) => npDigits[d]);
  }

  toNepaliNumberWithSlash(str) {
    const npDigits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
    return String(str).replace(/\d/g, (d) => npDigits[d]);
  }

  convertAdToBs(adDate) {
    try {
      if (!adDate || typeof adDate !== "string") {
        throw new Error(
          "Invalid date format. Please provide date in YYYY-MM-DD format."
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
          "Unable to convert the date. Please try a different date."
        );
      }
      const [year, month, day] = result.split("-").map(Number);
      const bsDateObj = { year, month, day };
      return {
        success: true,
        data: bsDateObj,
        formatted: this.formatBsDate(bsDateObj),
        formattedNepali: this.formatBsDateNepali(bsDateObj),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  convertBsToAd(year, month, day) {
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
      const bsDateString = `${year}-${String(month).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}`;
      const result = bsToAd(bsDateString);
      if (!result) {
        throw new Error(
          "Unable to convert the BS date. Please check the date values."
        );
      }
      const [adYear, adMonth, adDay] = result.split("-").map(Number);
      const adDateObj = { year: adYear, month: adMonth, day: adDay };
      return {
        success: true,
        data: adDateObj,
        formatted: this.formatAdDate(adDateObj),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  convertAndDisplayAdToBs(adDate) {
    if (!adDate || !this.elements.bsResult) return;
    const result = this.convertAdToBs(adDate);
    if (result.success) {
      const { year, month, day } = result.data;
      const nepaliYear = this.toNepaliNumber(year);
      const nepaliDay = this.toNepaliNumber(day);
      const nepaliMonth = this.getNepaliMonthName(month);
      const nepaliSmall = this.toNepaliNumberWithSlash(
        `${year}/${month}/${day}`
      );
      this.elements.bsResult.innerHTML = `
        <strong>${nepaliYear} ${nepaliMonth} ${nepaliDay}</strong>
        <small>${nepaliSmall}</small>
      `;
    } else {
      this.elements.bsResult.textContent = `Error: ${result.error}`;
    }
  }

  convertAndDisplayBsToAd() {
    if (
      !this.elements.bsYear ||
      !this.elements.bsMonth ||
      !this.elements.bsDay ||
      !this.elements.adResult
    ) {
      return;
    }
    const year = parseInt(this.elements.bsYear.value);
    const month = parseInt(this.elements.bsMonth.value);
    const day = parseInt(this.elements.bsDay.value);
    if (!year || !month || !day) {
      this.elements.adResult.textContent = "Enter complete BS date to convert";
      return;
    }
    const result = this.convertBsToAd(year, month, day);
    if (result.success) {
      this.elements.adResult.innerHTML = `
        <strong>${result.formatted}</strong>
        <small>(${result.data.year}-${String(result.data.month).padStart(
        2,
        "0"
      )}-${String(result.data.day).padStart(2, "0")})</small>
      `;
    } else {
      this.elements.adResult.textContent = `Error: ${result.error}`;
    }
  }

  formatBsDate(bsDate) {
    try {
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
      const { year, month, day } = bsDate;
      if (!year || !month || !day) {
        return "Invalid date format";
      }
      const monthName = nepaliMonths[month - 1] || `Month ${month}`;
      return `${year} ${monthName} ${day}`;
    } catch (error) {
      return "Error formatting date";
    }
  }

  formatBsDateNepali(bsDate) {
    try {
      const { year, month, day } = bsDate;
      const monthName = this.getNepaliMonthName(month);
      return `${this.toNepaliNumber(year)} ${monthName} ${this.toNepaliNumber(
        day
      )}`;
    } catch (error) {
      return "Error formatting date";
    }
  }

  getNepaliMonthName(month) {
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

  formatAdDate(adDate) {
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
      if (!year || !month || !day) {
        return "Invalid date format";
      }
      const monthName = months[month - 1] || `Month ${month}`;
      return `${monthName} ${day}, ${year}`;
    } catch (error) {
      return "Error formatting date";
    }
  }
}
