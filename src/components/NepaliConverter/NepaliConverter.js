import "./NepaliConverter.css";
import {
  convertToUnicode,
  convertToPreeti,
  transliterateNepali,
} from "./converter.js";
import { NepaliPhoneticMap } from "../NepaliPhoneticMap/NepaliPhoneticMap.js";

export const initNepaliConverter = (containerId) => {
  const container = document.getElementById(containerId);
  if (!container) return;

  let cursorPosition = 0;
  let alertTimeout = null;
  let debounceTimer = null;
  let currentSuggestions = [];
  let activeIndex = -1;
  let currentMode = "preeti2unicode";
  let dom = {};
  let phoneticFallback = null;

  const render = () => {
    container.innerHTML = `
      <div class="nepali-converter__alert" id="copyAlert" role="alert">
        <span>👍 Copied to clipboard!</span>
      </div>
      <section class="container-xl nepali-converter glass">
        <div class="nepali-converter__modes" id="converterModes">
          <div class="toggle-switch">
            <span class="toggle-switch__label" id="labelU2P">Preeti</span>
            <label>
              <input type="checkbox" id="toggleP2U" class="toggle-switch__input" role="switch" aria-checked="true" checked />
              <span class="toggle-switch__slider"></span>
            </label>
            <span class="toggle-switch__label toggle-switch__label--active" id="labelP2U">Unicode</span>
          </div>
          <div class="toggle-switch">
            <span class="toggle-switch__label" id="labelRoman">Roman to Unicode?</span>
            <label>
              <input type="checkbox" id="toggleRoman" class="toggle-switch__input" role="switch" aria-checked="false" />
              <span class="toggle-switch__slider"></span>
            </label>
          </div>
        </div>

        <div class="nepali-converter__input-group" id="inputGroupSource">
          <textarea id="converterInput" class="nepali-converter__textarea nepali-converter__textarea--preeti" placeholder="oxfF k|Llt jf gful/s kmG6df n]Vg&quot;xf];\\ ." spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="off"></textarea>
          <div class="nepali-converter__copy-bar" id="copyBarSource" style="display: none;">
            <button type="button" class="nepali-converter__copy-btn">
              <i class="bi bi-clipboard copy-icon-default"></i>
              <i class="bi bi-clipboard-check copy-icon-active"></i>
            </button>
          </div>
          <ul id="suggestionBox" class="nepali-converter__suggestions"></ul>
        </div>

        <div class="nepali-converter__toolbar" id="charToolbar">
          <button type="button" class="nepali-converter__char-btn" data-char="ङ">ङ</button>
          <button type="button" class="nepali-converter__char-btn" data-char="क्ष">क्ष</button>
          <button type="button" class="nepali-converter__char-btn" data-char="फ्">फ्</button>
          <button type="button" class="nepali-converter__char-btn" data-char="झ्">झ्</button>
          <button type="button" class="nepali-converter__char-btn" data-char="घ्">घ्</button>
          <button type="button" class="nepali-converter__char-btn" data-char="ऱ्">ऱ्</button>
          <button type="button" class="nepali-converter__char-btn" data-char="–">–</button>
          <button type="button" class="nepali-converter__char-btn" data-char="—">—</button>
          <button type="button" class="nepali-converter__char-btn" data-char="‘ ’">‘ ’</button>
          <button type="button" class="nepali-converter__char-btn" data-char="“ ”">“ ”</button>
          <button type="button" class="nepali-converter__char-btn" data-char="ईं">ईं</button>
          <button type="button" class="nepali-converter__char-btn" data-char="ौँ">ौँ</button>
          <button type="button" class="nepali-converter__char-btn" data-char="त्त्">त्त्</button>
          <button type="button" class="nepali-converter__char-btn" data-char="ऽ">ऽ</button>
          <button type="button" class="nepali-converter__char-btn" data-char="ॐ">ॐ</button>
          <button type="button" class="nepali-converter__char-btn" data-char="॥">॥</button>
        </div>

        <div class="nepali-converter__input-group" id="inputGroupTarget">
          <textarea id="converterOutput" class="nepali-converter__textarea nepali-converter__textarea--target nepali-converter__textarea--unicode" placeholder="यहाँ यूनिकोड नेपालीमा रुपान्तरण हुनेछ ।" readonly></textarea>
          <div class="nepali-converter__copy-bar" id="copyBarTarget">
            <button type="button" class="nepali-converter__copy-btn">
              <i class="bi bi-clipboard copy-icon-default"></i>
              <i class="bi bi-clipboard-check copy-icon-active"></i>
            </button>
          </div>
        </div>
      </section>
    `;
  };

  const cacheDOM = () => {
    dom = {
      modes: document.getElementById("converterModes"),
      toggleP2U: document.getElementById("toggleP2U"),
      toggleRoman: document.getElementById("toggleRoman"),
      labelU2P: document.getElementById("labelU2P"),
      labelP2U: document.getElementById("labelP2U"),
      labelRoman: document.getElementById("labelRoman"),
      input: document.getElementById("converterInput"),
      output: document.getElementById("converterOutput"),
      toolbar: document.getElementById("charToolbar"),
      copyBtns: document.querySelectorAll(".nepali-converter__copy-btn"),
      copyBarSource: document.getElementById("copyBarSource"),
      inputGroupTarget: document.getElementById("inputGroupTarget"),
      inputGroupSource: document.getElementById("inputGroupSource"),
      alert: document.getElementById("copyAlert"),
      suggestionBox: document.getElementById("suggestionBox"),
    };
    phoneticFallback = NepaliPhoneticMap(dom.input, dom.inputGroupSource);
  };

  const updateClassesAndPlaceholders = () => {
    if (currentMode === "preeti2unicode") {
      dom.input.className =
        "nepali-converter__textarea nepali-converter__textarea--preeti";
      dom.output.className =
        "nepali-converter__textarea nepali-converter__textarea--target nepali-converter__textarea--unicode";
      dom.input.placeholder = 'oxfF k|Llt jf gful/s kmG6df n]Vg"xf];\\ .';
      dom.output.placeholder = "यहाँ यूनिकोड नेपालीमा रुपान्तरण हुनेछ ।";
      dom.inputGroupTarget.classList.remove(
        "nepali-converter__input-group--hidden",
      );
      dom.copyBarSource.style.display = "none";
      dom.toolbar.style.display = "flex";
      dom.output.readOnly = true;
      phoneticFallback.hide();
    } else if (currentMode === "unicode2preeti") {
      dom.input.className =
        "nepali-converter__textarea nepali-converter__textarea--unicode";
      dom.output.className =
        "nepali-converter__textarea nepali-converter__textarea--target nepali-converter__textarea--preeti";
      dom.input.placeholder = "यहाँ यूनिकोड नेपालीमा लेख्नुहोस् ।";
      dom.output.placeholder = "oxfF k|Llt jf gful/s kmG6df ?kfGt/0f x'g]5 .";
      dom.inputGroupTarget.classList.remove(
        "nepali-converter__input-group--hidden",
      );
      dom.copyBarSource.style.display = "none";
      dom.toolbar.style.display = "flex";
      dom.output.readOnly = true;
      phoneticFallback.hide();
    } else if (currentMode === "roman2unicode") {
      dom.input.className =
        "nepali-converter__textarea nepali-converter__textarea--unicode";
      dom.input.placeholder = "Type Roman English here (e.g. namaste)...";
      dom.inputGroupTarget.classList.add(
        "nepali-converter__input-group--hidden",
      );
      dom.copyBarSource.style.display = "block";
      dom.toolbar.style.display = "none";
      dom.output.readOnly = false;
    }
  };

  const syncOutput = () => {
    const val = dom.input.value;
    if (currentMode === "preeti2unicode") {
      dom.output.value = convertToUnicode(val);
    } else if (currentMode === "unicode2preeti") {
      dom.output.value = convertToPreeti(val);
    }
  };

  const handleCursorUpdate = () => {
    cursorPosition = dom.input.selectionStart;
  };

  const getCaretCoordinates = (element, position) => {
    const div = document.createElement("div");
    const style = window.getComputedStyle(element);
    const properties = [
      "direction",
      "boxSizing",
      "width",
      "height",
      "overflowX",
      "overflowY",
      "borderTopWidth",
      "borderRightWidth",
      "borderBottomWidth",
      "borderLeftWidth",
      "borderStyle",
      "paddingTop",
      "paddingRight",
      "paddingBottom",
      "paddingLeft",
      "fontStyle",
      "fontVariant",
      "fontWeight",
      "fontStretch",
      "fontSize",
      "lineHeight",
      "fontFamily",
      "textAlign",
      "textTransform",
      "textIndent",
      "textDecoration",
      "letterSpacing",
      "wordSpacing",
    ];
    properties.forEach((prop) => (div.style[prop] = style[prop]));
    div.style.position = "absolute";
    div.style.visibility = "hidden";
    div.style.whiteSpace = "pre-wrap";
    div.style.wordWrap = "break-word";
    div.textContent = element.value.substring(0, position);
    const span = document.createElement("span");
    span.textContent = element.value.substring(position) || ".";
    div.appendChild(span);
    document.body.appendChild(div);
    const coords = {
      top:
        span.offsetTop +
        parseInt(style.borderTopWidth || "0") -
        element.scrollTop,
      left: span.offsetLeft + parseInt(style.borderLeftWidth || "0"),
    };
    document.body.removeChild(div);
    return coords;
  };

  const setSuggestionActive = (index) => {
    const items = dom.suggestionBox.querySelectorAll("li");
    items.forEach((li) =>
      li.classList.remove("nepali-converter__suggestion-item--active"),
    );
    if (index >= 0 && index < items.length) {
      items[index].classList.add("nepali-converter__suggestion-item--active");
      activeIndex = index;
    }
  };

  const selectSuggestion = (index) => {
    const word = currentSuggestions[index];
    if (!word) return;
    const words = dom.input.value.split(/\s+/);
    words[words.length - 1] = word;
    dom.input.value = words.join(" ") + " ";
    dom.suggestionBox.style.display = "none";
    localStorage.setItem(`nepaliInput_${currentMode}`, dom.input.value);
    dom.input.focus();
  };

  const renderSuggestions = (suggestions) => {
    dom.suggestionBox.innerHTML = "";
    currentSuggestions = suggestions;
    activeIndex = -1;

    if (!suggestions.length) {
      dom.suggestionBox.style.display = "none";
      return;
    }

    suggestions.forEach((word, index) => {
      const li = document.createElement("li");
      li.textContent = word;
      li.className = "nepali-converter__suggestion-item";
      li.dataset.index = index;
      li.addEventListener("mouseenter", () => setSuggestionActive(index));
      li.addEventListener("mousedown", (e) => {
        e.preventDefault();
        selectSuggestion(index);
      });
      dom.suggestionBox.appendChild(li);
    });

    const hint = document.createElement("div");
    hint.className = "nepali-converter__suggestion-hint";
    hint.innerHTML = `Select with <span>TAB</span> <span>ENTER</span> <span>SPACE</span>`;
    dom.suggestionBox.appendChild(hint);

    const coords = getCaretCoordinates(dom.input, cursorPosition);
    dom.suggestionBox.style.top = `${coords.top + 24}px`;
    dom.suggestionBox.style.left = `${coords.left + 16}px`;
    dom.suggestionBox.style.display = "block";

    setSuggestionActive(0);
  };

  const handleInput = () => {
    handleCursorUpdate();
    localStorage.setItem(`nepaliInput_${currentMode}`, dom.input.value);

    if (currentMode === "roman2unicode") {
      clearTimeout(debounceTimer);
      const words = dom.input.value.split(/\s+/);
      const currentWord = words[words.length - 1];

      if (!currentWord.trim()) {
        dom.suggestionBox.style.display = "none";
        phoneticFallback.hide();
        return;
      }

      debounceTimer = setTimeout(async () => {
        const isOffline = !navigator.onLine;
        let suggestions = [];
        let apiFailed = false;

        if (!isOffline) {
          try {
            suggestions = await transliterateNepali(currentWord);
            if (suggestions.length === 1 && suggestions[0] === currentWord) {
              apiFailed = true;
            }
          } catch (error) {
            apiFailed = true;
          }
        }

        if (isOffline || apiFailed) {
          showAlert("⚠️ Offline: Autocomplete paused.");
          dom.suggestionBox.style.display = "none";
          phoneticFallback.show();
        } else {
          phoneticFallback.hide();
          renderSuggestions(suggestions);
        }
      }, 250);
    } else {
      syncOutput();
    }
  };

  const handleKeydown = (e) => {
    if (currentMode !== "roman2unicode") return;

    if (phoneticFallback.isActive() && e.key === " ") {
      if (phoneticFallback.handleSpace()) {
        e.preventDefault();
        return;
      }
    }

    if (dom.suggestionBox.style.display === "none") return;

    const items = dom.suggestionBox.querySelectorAll("li");

    if (["Enter", "Tab", " "].includes(e.key) && activeIndex >= 0) {
      e.preventDefault();
      selectSuggestion(activeIndex);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSuggestionActive(Math.min(activeIndex + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSuggestionActive(Math.max(activeIndex - 1, 0));
    } else if (e.key === "Escape") {
      dom.suggestionBox.style.display = "none";
    }
  };

  const handleToolbarClick = (event) => {
    const btn = event.target.closest(".nepali-converter__char-btn");
    if (!btn) return;

    const charToInsert = btn.dataset.char;
    const currentVal = dom.input.value;

    const before = currentVal.substring(0, cursorPosition);
    const after = currentVal.substring(cursorPosition);

    dom.input.value = before + charToInsert + after;
    cursorPosition += charToInsert.length;

    dom.input.focus();
    dom.input.setSelectionRange(cursorPosition, cursorPosition);

    localStorage.setItem(`nepaliInput_${currentMode}`, dom.input.value);
    syncOutput();
  };

  const handleModeChange = (event) => {
    if (event.target === dom.toggleP2U || event.target === dom.toggleRoman) {
      if (event.target === dom.toggleP2U && dom.toggleRoman.checked) {
        dom.toggleRoman.checked = false;
      }

      if (dom.toggleRoman.checked) {
        currentMode = "roman2unicode";
        dom.labelRoman.classList.add("toggle-switch__label--active");
        dom.labelU2P.classList.remove("toggle-switch__label--active");
        dom.labelP2U.classList.remove("toggle-switch__label--active");
        dom.toggleRoman.setAttribute("aria-checked", "true");
      } else {
        dom.labelRoman.classList.remove("toggle-switch__label--active");
        dom.toggleRoman.setAttribute("aria-checked", "false");

        if (dom.toggleP2U.checked) {
          currentMode = "preeti2unicode";
          dom.labelP2U.classList.add("toggle-switch__label--active");
          dom.labelU2P.classList.remove("toggle-switch__label--active");
          dom.toggleP2U.setAttribute("aria-checked", "true");
        } else {
          currentMode = "unicode2preeti";
          dom.labelU2P.classList.add("toggle-switch__label--active");
          dom.labelP2U.classList.remove("toggle-switch__label--active");
          dom.toggleP2U.setAttribute("aria-checked", "false");
        }
      }

      updateClassesAndPlaceholders();
      dom.input.value =
        localStorage.getItem(`nepaliInput_${currentMode}`) || "";
      if (currentMode !== "roman2unicode") syncOutput();
      dom.suggestionBox.style.display = "none";
    }
  };

  const closeSuggestionsOnClickOutside = (e) => {
    if (dom.inputGroupSource && !dom.inputGroupSource.contains(e.target)) {
      if (dom.suggestionBox) dom.suggestionBox.style.display = "none";
    }
  };

  const showAlert = (message = "👍 Copied to clipboard!") => {
    const alertSpan = dom.alert.querySelector("span");
    if (alertSpan) alertSpan.textContent = message;

    dom.alert.classList.add("nepali-converter__alert--visible");

    if (message.includes("Copied")) {
      dom.copyBtns.forEach((btn) => btn.classList.add("is-copied"));
    }

    if (alertTimeout) clearTimeout(alertTimeout);
    alertTimeout = setTimeout(() => {
      dom.alert.classList.remove("nepali-converter__alert--visible");
      dom.copyBtns.forEach((btn) => btn.classList.remove("is-copied"));
    }, 10000);
  };

  const handleCopyClick = () => {
    const textToCopy =
      currentMode === "roman2unicode" ? dom.input.value : dom.output.value;
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy).then(() => showAlert());
  };

  const bindEvents = () => {
    dom.input.addEventListener("input", handleInput);
    dom.input.addEventListener("click", handleCursorUpdate);
    dom.input.addEventListener("keyup", handleCursorUpdate);
    dom.input.addEventListener("keydown", handleKeydown);
    dom.toolbar.addEventListener("click", handleToolbarClick);
    dom.copyBtns.forEach((btn) =>
      btn.addEventListener("click", handleCopyClick),
    );
    dom.modes.addEventListener("change", handleModeChange);
    document.addEventListener("click", closeSuggestionsOnClickOutside);
  };

  const initializeState = () => {
    updateClassesAndPlaceholders();
    const savedInput = localStorage.getItem(`nepaliInput_${currentMode}`) || "";
    if (savedInput) {
      dom.input.value = savedInput;
      if (currentMode !== "roman2unicode") syncOutput();
    }
  };

  const destroy = () => {
    if (dom.input) {
      dom.input.removeEventListener("input", handleInput);
      dom.input.removeEventListener("click", handleCursorUpdate);
      dom.input.removeEventListener("keyup", handleCursorUpdate);
      dom.input.removeEventListener("keydown", handleKeydown);
    }
    if (dom.toolbar)
      dom.toolbar.removeEventListener("click", handleToolbarClick);
    if (dom.copyBtns)
      dom.copyBtns.forEach((btn) =>
        btn.removeEventListener("click", handleCopyClick),
      );
    if (dom.modes) dom.modes.removeEventListener("change", handleModeChange);
    document.removeEventListener("click", closeSuggestionsOnClickOutside);

    if (alertTimeout) clearTimeout(alertTimeout);
    if (debounceTimer) clearTimeout(debounceTimer);
    if (phoneticFallback) phoneticFallback.destroy();

    container.innerHTML = "";
    dom = null;
  };

  render();
  cacheDOM();
  bindEvents();
  initializeState();

  return { destroy };
};
