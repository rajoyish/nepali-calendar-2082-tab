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

  /**
   * Initialize the converter with DOM elements
   * @param {string} containerId - The container element ID
   */
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

  /**
   * Cache DOM elements for better performance
   */
  cacheElements() {
    this.elements = {
      // Toggle switch
      modeToggle: this.container.querySelector("[data-converter-toggle]"),
      modeLabelAd: this.container.querySelector("[data-mode-label-ad]"),
      modeLabelBs: this.container.querySelector("[data-mode-label-bs]"),

      // Sections
      adSection: this.container.querySelector(
        "[data-converter-section='ad-to-bs']"
      ),
      bsSection: this.container.querySelector(
        "[data-converter-section='bs-to-ad']"
      ),

      // AD to BS elements
      adInput: this.container.querySelector("[data-converter-ad-input]"),
      bsResult: this.container.querySelector("[data-converter-bs-result]"),

      // BS to AD elements
      bsYear: this.container.querySelector("[data-converter-bs-year]"),
      bsMonth: this.container.querySelector("[data-converter-bs-month]"),
      bsDay: this.container.querySelector("[data-converter-bs-day]"),
      adResult: this.container.querySelector("[data-converter-ad-result]"),
    };
  }

  /**
   * Attach event listeners to UI elements
   */
  attachEventListeners() {
    // Toggle switch for mode
    if (this.elements.modeToggle) {
      this.elements.modeToggle.addEventListener("change", (e) => {
        const mode = e.target.checked ? "bs-to-ad" : "ad-to-bs";
        this.switchMode(mode);
      });
    }

    // AD date input
    if (this.elements.adInput) {
      this.elements.adInput.addEventListener("change", (e) => {
        this.convertAndDisplayAdToBs(e.target.value);
      });
    }

    // BS date inputs
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

  /**
   * Set today's date as default
   */
  setDefaultDate() {
    if (this.elements.adInput) {
      const today = new Date().toISOString().split("T")[0];
      this.elements.adInput.value = today;
      this.convertAndDisplayAdToBs(today);
    }
    // Set initial mode label
    this.updateModeLabels();
  }

  /**
   * Switch between conversion modes
   * @param {string} mode - The conversion mode ('ad-to-bs' or 'bs-to-ad')
   */
  switchMode(mode) {
    this.currentMode = mode;

    // Update toggle checked state
    if (this.elements.modeToggle) {
      this.elements.modeToggle.checked = mode === "bs-to-ad";
      this.elements.modeToggle.setAttribute(
        "aria-checked",
        mode === "bs-to-ad" ? "true" : "false"
      );
    }
    this.updateModeLabels();

    // Update section visibility
    if (mode === "ad-to-bs") {
      this.elements.adSection?.removeAttribute("hidden");
      this.elements.bsSection?.setAttribute("hidden", "");
    } else {
      this.elements.bsSection?.removeAttribute("hidden");
      this.elements.adSection?.setAttribute("hidden", "");
    }
  }

  /**
   * Update the mode label highlighting based on current mode
   */
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

  /**
   * Convert AD date to BS date
   * @param {string} adDate - Date in YYYY-MM-DD format
   * @returns {Object} - Converted BS date object
   */
  convertAdToBs(adDate) {
    try {
      if (!adDate || typeof adDate !== "string") {
        throw new Error(
          "Invalid date format. Please provide date in YYYY-MM-DD format."
        );
      }

      // Validate date format (YYYY-MM-DD)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(adDate)) {
        throw new Error("Date must be in YYYY-MM-DD format.");
      }

      // Check if it's a valid date
      const dateObj = new Date(adDate);
      if (isNaN(dateObj.getTime())) {
        throw new Error("Invalid date provided.");
      }

      // The package returns a string in format "YYYY-MM-DD"
      const result = adToBs(adDate);

      if (!result) {
        throw new Error(
          "Unable to convert the date. Please try a different date."
        );
      }

      // Parse the result string "YYYY-MM-DD" to get individual components
      const [year, month, day] = result.split("-").map(Number);

      const bsDateObj = {
        year: year,
        month: month,
        day: day,
      };

      return {
        success: true,
        data: bsDateObj,
        formatted: this.formatBsDate(bsDateObj),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Convert BS date to AD date
   * @param {number} year - BS year
   * @param {number} month - BS month (1-12)
   * @param {number} day - BS day
   * @returns {Object} - Converted AD date object
   */
  convertBsToAd(year, month, day) {
    try {
      // Validate inputs
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

      // Format BS date as string for the package
      const bsDateString = `${year}-${String(month).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}`;
      const result = bsToAd(bsDateString);

      if (!result) {
        throw new Error(
          "Unable to convert the BS date. Please check the date values."
        );
      }

      // Parse the result string "YYYY-MM-DD" to get individual components
      const [adYear, adMonth, adDay] = result.split("-").map(Number);

      const adDateObj = {
        year: adYear,
        month: adMonth,
        day: adDay,
      };

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

  /**
   * Convert AD date and display result
   * @param {string} adDate - AD date in YYYY-MM-DD format
   */
  convertAndDisplayAdToBs(adDate) {
    if (!adDate || !this.elements.bsResult) return;

    const result = this.convertAdToBs(adDate);

    if (result.success) {
      this.elements.bsResult.innerHTML = `
        <strong>${result.formatted}</strong>
        <small>(${result.data.year}/${result.data.month}/${result.data.day})</small>
      `;
    } else {
      this.elements.bsResult.textContent = `Error: ${result.error}`;
    }
  }

  /**
   * Convert BS date and display result
   */
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

  /**
   * Format BS date for display
   * @param {Object} bsDate - BS date object
   * @returns {string} - Formatted BS date string
   */
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

  /**
   * Format AD date for display
   * @param {Object} adDate - AD date object
   * @returns {string} - Formatted AD date string
   */
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
