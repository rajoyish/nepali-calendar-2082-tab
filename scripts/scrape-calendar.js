function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function convertDevnagariToEnglish(str) {
  const charMap = {
    "०": "0",
    "१": "1",
    "२": "2",
    "३": "3",
    "४": "4",
    "५": "5",
    "६": "6",
    "७": "7",
    "८": "8",
    "९": "9",
  };
  return str.replace(/[०-९]/g, (match) => charMap[match]);
}

const nepaliMonths = {
  वैशाख: { idx: 1, name: "baishakh" },
  बैशाख: { idx: 1, name: "baishakh" },
  जेठ: { idx: 2, name: "jeth" },
  असार: { idx: 3, name: "asar" },
  आषाढ: { idx: 3, name: "asar" },
  साउन: { idx: 4, name: "shrawan" },
  श्रावण: { idx: 4, name: "shrawan" },
  भदौ: { idx: 5, name: "bhadau" },
  भाद्र: { idx: 5, name: "bhadau" },
  असोज: { idx: 6, name: "ashoj" },
  आश्विन: { idx: 6, name: "ashoj" },
  कात्तिक: { idx: 7, name: "kattik" },
  कार्तिक: { idx: 7, name: "kattik" },
  मंसिर: { idx: 8, name: "mangsir" },
  मार्गशीर्ष: { idx: 8, name: "mangsir" },
  पुष: { idx: 9, name: "push" },
  पौष: { idx: 9, name: "push" },
  माघ: { idx: 10, name: "magh" },
  फागुन: { idx: 11, name: "fagun" },
  फाल्गुन: { idx: 11, name: "fagun" },
  चैत: { idx: 12, name: "chait" },
  चैत्र: { idx: 12, name: "chait" },
};

function extractModalData() {
  const modal = document.querySelector(".event-modal-body");
  if (!modal) return null;

  const data = {};

  const h2 = modal.querySelector("h2");
  if (h2) data.fullDateNp = h2.innerText.trim();

  const neSamvat = modal.querySelector("p");
  if (neSamvat) data.nepalSamvat = neSamvat.innerText.trim();

  const engDate = modal.querySelector(".eng-date");
  if (engDate) data.fullDateEn = engDate.innerText.trim();

  const sunInfo = modal.querySelector(".sun-rising-info");
  if (sunInfo) {
    const divs = sunInfo.querySelectorAll("div");
    if (divs[0]) data.sunrise = divs[0].innerText.replace(/.*:/, "").trim();
    if (divs[1]) data.sunset = divs[1].innerText.replace(/.*:/, "").trim();
  }

  const panchangaMap = {
    दिन: "dayName",
    तिथि: "tithiDetails",
    नक्षत्र: "nakshatra",
    योग: "yoga",
    "चन्द्र राशि": "moonSign",
    "सूर्य राशि": "sunSign",
    "प्रथम करण": "firstKarana",
    अयान: "ayana",
  };

  const panchanga = {};
  const panchaList = modal.querySelectorAll(
    ".panchanga-data.is-two-column:not(.data-table) li",
  );
  panchaList.forEach((li) => {
    const raw = li.innerText.trim();
    const colonIdx = raw.indexOf(":");
    if (colonIdx !== -1) {
      const keyNp = raw.slice(0, colonIdx).trim();
      const val = raw.slice(colonIdx + 1).trim();
      const keyEn = panchangaMap[keyNp] || keyNp;
      panchanga[keyEn] = val;
    } else {
      const spans = li.querySelectorAll("span");
      if (spans.length >= 2) {
        const keyNp = spans[0].innerText.trim().replace(":", "");
        const val = spans[1].innerText.trim();
        const keyEn = panchangaMap[keyNp] || keyNp;
        panchanga[keyEn] = val;
      }
    }
  });
  if (Object.keys(panchanga).length) data.panchanga = panchanga;

  const events = [];
  const auspiciousTimes = [];

  const eventSections = modal.querySelectorAll("div");
  eventSections.forEach((div) => {
    const h3 = div.querySelector("h3.event-heading");
    if (!h3) return;
    const heading = h3.innerText.trim();

    if (heading === "कार्यक्रमहरू") {
      const items = div.querySelectorAll("li");
      items.forEach((item) => {
        const span = item.querySelector("span");
        const text = span ? span.innerText.trim() : item.innerText.trim();
        if (text)
          events.push({
            label: text,
            isHoliday: item.classList.contains("is-holiday"),
          });
      });
    } else if (heading === "शुभ साइतहरू") {
      const items = div.querySelectorAll("li");
      items.forEach((item) => {
        const span = item.querySelector("span");
        const text = span ? span.innerText.trim() : item.innerText.trim();
        if (text) auspiciousTimes.push(text);
      });
    }
  });

  if (events.length) data.events = events;
  if (auspiciousTimes.length) data.auspiciousTimes = auspiciousTimes;

  const muhurtas = [];
  const muhurtaItems = modal.querySelectorAll(".panchanga-data.data-table li");
  muhurtaItems.forEach((item) => {
    const labelEl = item.querySelector("span");
    const timeEl = item.querySelector("time");
    const label = labelEl ? labelEl.innerText.trim() : "";
    const time = timeEl
      ? timeEl.innerText.replace(/[^\u0900-\u097F\d:०-९\-]/g, "").trim()
      : "";
    if (label && time) muhurtas.push({ label, time });
  });
  if (muhurtas.length) data.muhurtas = muhurtas;

  return Object.keys(data).length > 0 ? data : null;
}

async function triggerAndReadModal(li) {
  li.click();
  await sleep(600);

  let modal = document.querySelector(".event-modal-body");

  if (!modal) {
    const trigger = li.querySelector(".patro-event");
    if (trigger) {
      trigger.click();
      await sleep(600);
      modal = document.querySelector(".event-modal-body");
    }
  }

  if (!modal) return null;

  const modalData = extractModalData();

  const closeBtn = document.querySelector(
    '.modal-close, .close-modal, [class*="close"]',
  );
  if (closeBtn) closeBtn.click();
  else {
    const overlay = document.querySelector(
      '.modal-overlay, .modal-backdrop, [class*="overlay"]',
    );
    if (overlay) overlay.click();
  }

  await sleep(300);
  return modalData;
}

async function extractAndDownloadCalendarData() {
  const result = {
    monthNp: "",
    monthYearEn: "",
    days: [],
  };

  let yearNpRaw = "";

  const monthFilter = document.querySelector(".month-filter .current-month");
  if (monthFilter) {
    const textParts = monthFilter.innerText.split("|");
    if (textParts.length >= 2) {
      const npParts = textParts[0].trim().split(" ");
      result.monthNp = npParts[0];
      yearNpRaw = npParts[1] || "";
      result.monthYearEn = textParts[1].trim();
    }
  }

  const dateElements = document.querySelectorAll(
    "ul.patro-dates li:not(.is-disabled)",
  );

  for (const li of dateElements) {
    const isHoliday = li.classList.contains("is-holiday");
    const isToday = li.classList.contains("is-current");

    const eventTitleNode = li.querySelector(".patro-event-title");
    const eventTitle =
      eventTitleNode && eventTitleNode.innerText.trim() !== ""
        ? eventTitleNode.innerText.trim()
        : null;

    const tithiNode = li.querySelector(".patro-tithi");
    const tithi =
      tithiNode && tithiNode.innerText.trim() !== ""
        ? tithiNode.innerText.trim()
        : null;

    const engDateNode = li.querySelector(".patro-eng");
    const dateEn = engDateNode
      ? parseInt(engDateNode.innerText.trim(), 10)
      : null;

    let dateNp = "";
    const allSpans = li.querySelectorAll("span");
    for (let span of allSpans) {
      const classList = Array.from(span.classList);
      if (
        !classList.includes("patro-event-title") &&
        !classList.includes("patro-tithi") &&
        !classList.includes("patro-eng") &&
        !classList.includes("patro-event")
      ) {
        dateNp = span.innerText.trim();
        break;
      }
    }

    const eventCountNode = li.querySelector(".patro-event");
    let extraEventCount = 0;
    if (eventCountNode) {
      const rawCount = eventCountNode.innerText.replace(/[^\d]/g, "").trim();
      extraEventCount = rawCount ? parseInt(rawCount, 10) : 0;
    }

    const entry = {
      dateNp,
      dateEn,
      tithi,
      isHoliday,
      isToday,
      eventTitle,
      extraEventCount,
      details: null,
    };

    entry.details = await triggerAndReadModal(li);

    result.days.push(entry);
  }

  const monthData = nepaliMonths[result.monthNp] || { idx: 0, name: "unknown" };
  const parsedYearEnParts = result.monthYearEn.split(" ");
  const engMonthsStr =
    parsedYearEnParts.length > 0
      ? parsedYearEnParts[0].toLowerCase().replace("/", "&")
      : "";
  const engYearStr =
    parsedYearEnParts.length > 1 ? parsedYearEnParts[1].slice(-2) : "";
  const nepaliYearEngNums = convertDevnagariToEnglish(yearNpRaw);

  const filename = `${monthData.idx}-${monthData.name}-${nepaliYearEngNums}-${engMonthsStr}-${engYearStr}.json`;

  const jsonOutput = JSON.stringify(result, null, 2);
  const blob = new Blob([jsonOutput], { type: "application/json" });
  const link = document.createElement("a");
  link.download = filename;
  link.href = window.URL.createObjectURL(blob);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  console.log(`Done: ${filename}`);
  return result;
}

extractAndDownloadCalendarData();
