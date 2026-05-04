import "./NepaliPhoneticMap.css";

export const NepaliPhoneticMap = (inputElement, wrapperElement) => {
  const container = document.createElement("div");
  container.className = "phonetic-map phonetic-map--hidden";

  const grid = document.createElement("div");
  grid.className = "phonetic-map__grid";

  container.appendChild(grid);
  wrapperElement.appendChild(container);

  const state = {
    isActive: false,
    exactMatch: "",
    wordStart: 0,
    wordEnd: 0,
  };

  const cons = {
    k: "क",
    kh: "ख",
    g: "ग",
    gh: "घ",
    ng: "ङ",
    c: "च",
    ch: "छ",
    j: "ज",
    jh: "झ",
    yn: "ञ",
    t: "त",
    th: "थ",
    d: "द",
    dh: "ध",
    n: "न",
    tt: "ट",
    tth: "ठ",
    dd: "ड",
    ddh: "ढ",
    nn: "ण",
    p: "प",
    ph: "फ",
    b: "ब",
    bh: "भ",
    m: "म",
    y: "य",
    r: "र",
    l: "ल",
    v: "व",
    w: "व",
    sh: "श",
    ss: "ष",
    s: "स",
    h: "ह",
    ksh: "क्ष",
    tr: "त्र",
    gy: "ज्ञ",
  };

  const vows = {
    "": "",
    "\\": "्",
    a: "",
    aa: "ा",
    i: "ि",
    ee: "ी",
    u: "ु",
    uu: "ू",
    ri: "ृ",
    e: "े",
    ai: "ै",
    o: "ो",
    ou: "ौ",
    am: "ं",
    an: "ँ",
    ah: "ः",
  };

  const indVows = {
    a: "अ",
    aa: "आ",
    i: "इ",
    ee: "ई",
    u: "उ",
    uu: "ऊ",
    ri: "ऋ",
    e: "ए",
    ai: "ऐ",
    o: "ओ",
    ou: "औ",
    am: "अं",
    ah: "अः",
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

  const updateWordBoundaries = () => {
    const val = inputElement.value;
    const cursor = inputElement.selectionStart;

    let start = cursor;
    while (start > 0 && !/\s/.test(val[start - 1])) {
      start--;
    }

    let end = cursor;
    while (end < val.length && !/\s/.test(val[end])) {
      end++;
    }

    state.wordStart = start;
    state.wordEnd = end;
    return val.substring(start, end);
  };

  const parsePhonetic = (word) => {
    let prefix = "";
    let lastTokenExact = "";
    let lastParsed = null;
    let remaining = word;

    const sortedCons = Object.keys(cons).sort((a, b) => b.length - a.length);
    const sortedVows = Object.keys(vows).sort((a, b) => b.length - a.length);
    const sortedIndVows = Object.keys(indVows).sort(
      (a, b) => b.length - a.length,
    );

    while (remaining.length > 0) {
      let matched = false;
      prefix += lastTokenExact;

      for (const c of sortedCons) {
        if (remaining.startsWith(c)) {
          let remAfterCons = remaining.slice(c.length);
          let vMatch = "";
          for (const v of sortedVows) {
            if (remAfterCons.startsWith(v)) {
              vMatch = v;
              break;
            }
          }

          lastTokenExact = cons[c] + vows[vMatch];
          lastParsed = {
            type: "consonant",
            consonant: cons[c],
            consonantKey: c,
          };
          remaining = remAfterCons.slice(vMatch.length);
          matched = true;
          break;
        }
      }

      if (!matched) {
        for (const v of sortedIndVows) {
          if (remaining.startsWith(v)) {
            lastTokenExact = indVows[v];
            lastParsed = { type: "vowel" };
            remaining = remaining.slice(v.length);
            matched = true;
            break;
          }
        }
      }

      if (!matched) {
        lastTokenExact = remaining[0];
        lastParsed = null;
        remaining = remaining.slice(1);
      }
    }

    if (!lastParsed) return null;

    lastParsed.prefix = prefix;
    lastParsed.exactMatch = prefix + lastTokenExact;
    return lastParsed;
  };

  const createCell = (
    displayChar,
    replacementChar,
    exactMatchVal,
    phoneticText,
  ) => {
    if (!displayChar) return;
    const btn = document.createElement("button");
    btn.className = "phonetic-map__cell";

    if (replacementChar === exactMatchVal) {
      btn.classList.add("phonetic-map__cell--active");
    }

    const charSpan = document.createElement("span");
    charSpan.className = "phonetic-map__cell-char";
    charSpan.textContent = displayChar;

    const phoneticSpan = document.createElement("span");
    phoneticSpan.className = "phonetic-map__cell-phonetic";
    phoneticSpan.textContent = phoneticText;

    btn.appendChild(charSpan);
    btn.appendChild(phoneticSpan);
    btn.dataset.char = replacementChar;
    grid.appendChild(btn);
  };

  const generateGrid = (parsed) => {
    grid.innerHTML = "";
    if (parsed.type === "consonant") {
      const suffixes = [
        "",
        "\\",
        "aa",
        "i",
        "ee",
        "u",
        "uu",
        "ri",
        "e",
        "ai",
        "o",
        "ou",
        "am",
        "an",
        "ah",
      ];
      suffixes.forEach((suff) => {
        const displayChar = parsed.consonant + vows[suff];
        const replacementChar = parsed.prefix + displayChar;
        const phoneticText = parsed.consonantKey + suff;
        createCell(
          displayChar,
          replacementChar,
          parsed.exactMatch,
          phoneticText,
        );
      });
    } else if (parsed.type === "vowel") {
      Object.entries(indVows).forEach(([vKey, char]) => {
        const displayChar = char;
        const replacementChar = parsed.prefix + displayChar;
        createCell(displayChar, replacementChar, parsed.exactMatch, vKey);
      });
    }
  };

  const replaceWord = (replacement) => {
    const val = inputElement.value;
    const before = val.substring(0, state.wordStart);
    const after = val.substring(state.wordEnd);
    inputElement.value = before + replacement + after;

    const newPos = before.length + replacement.length;
    inputElement.setSelectionRange(newPos, newPos);
    inputElement.focus();

    hide();
    inputElement.dispatchEvent(new Event("input"));
  };

  const positionMap = () => {
    const coords = getCaretCoordinates(
      inputElement,
      inputElement.selectionStart,
    );
    container.style.top = `${coords.top + 24}px`;
    container.style.left = `${coords.left + 16}px`;
  };

  const show = () => {
    const word = updateWordBoundaries();
    if (!word.trim()) {
      hide();
      return;
    }

    const parsed = parsePhonetic(word.toLowerCase());
    if (!parsed) {
      grid.innerHTML = "";
      state.exactMatch = "";
      container.classList.remove("phonetic-map--hidden");
      state.isActive = true;
      positionMap();
      return;
    }

    state.exactMatch = parsed.exactMatch;
    generateGrid(parsed);
    container.classList.remove("phonetic-map--hidden");
    state.isActive = true;
    positionMap();
  };

  const hide = () => {
    container.classList.add("phonetic-map--hidden");
    state.isActive = false;
  };

  const handleGridClick = (e) => {
    const btn = e.target.closest(".phonetic-map__cell");
    if (!btn) return;
    e.preventDefault();
    replaceWord(btn.dataset.char);
  };

  grid.addEventListener("mousedown", handleGridClick);

  return {
    show,
    hide,
    isActive: () => state.isActive,
    handleSpace: () => {
      if (state.exactMatch) {
        replaceWord(state.exactMatch + " ");
        return true;
      }
      return false;
    },
    destroy: () => {
      grid.removeEventListener("mousedown", handleGridClick);
      if (container.parentNode) container.parentNode.removeChild(container);
    },
  };
};
