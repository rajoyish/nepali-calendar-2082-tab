import "./NepaliPhoneticMap.css";

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

const sortedCons = Object.keys(cons).sort((a, b) => b.length - a.length);
const sortedVows = Object.keys(vows).sort((a, b) => b.length - a.length);
const sortedIndVows = Object.keys(indVows).sort((a, b) => b.length - a.length);

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
            vowel: vows[vMatch],
            vowelKey: vMatch,
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

  const generateGrid = (parsed) => {
    grid.innerHTML = "";

    const fragment = document.createDocumentFragment();

    const createCell = (
      displayChar,
      replacementChar,
      exactMatchVal,
      phoneticText,
    ) => {
      if (!displayChar) return;
      const btn = document.createElement("button");
      btn.className = "phonetic-map__cell";

      if (exactMatchVal && replacementChar === exactMatchVal) {
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

      fragment.appendChild(btn);
    };

    if (parsed.type === "consonant") {
      const displayCharBase = parsed.consonant + parsed.vowel;
      createCell(
        displayCharBase,
        parsed.prefix + displayCharBase,
        parsed.exactMatch,
        parsed.consonantKey + parsed.vowelKey,
      );

      const relatedKeys = Object.keys(cons).filter(
        (k) => k.startsWith(parsed.consonantKey) && k !== parsed.consonantKey,
      );

      relatedKeys
        .sort((a, b) => a.length - b.length || a.localeCompare(b))
        .forEach((relKey) => {
          const relChar = cons[relKey] + parsed.vowel;
          createCell(relChar, parsed.prefix + relChar, "", relKey + parsed.vowelKey);
        });

      const suffixes = [
        "", "\\", "aa", "i", "ee", "u", "uu", "ri", "e", "ai", "o", "ou", "am", "an", "ah",
      ];
      suffixes.forEach((suff) => {
        if (suff === parsed.vowelKey) return;
        const displayChar = parsed.consonant + vows[suff];
        const replacementChar = parsed.prefix + displayChar;
        const phoneticText = parsed.consonantKey + suff;
        createCell(
          displayChar,
          replacementChar,
          "",
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

    const pvBtn = document.createElement("button");
    pvBtn.className = "phonetic-map__cell";
    pvBtn.dataset.char = "।";
    pvBtn.dataset.action = "insert";

    const pvCharSpan = document.createElement("span");
    pvCharSpan.className = "phonetic-map__cell-char";
    pvCharSpan.textContent = "।";

    const pvPhonSpan = document.createElement("span");
    pvPhonSpan.className = "phonetic-map__cell-phonetic";
    pvPhonSpan.textContent = "⇧ + \\";

    pvBtn.appendChild(pvCharSpan);
    pvBtn.appendChild(pvPhonSpan);
    fragment.appendChild(pvBtn);

    grid.appendChild(fragment);
  };

  const insertAtCursor = (char) => {
    const val = inputElement.value;
    const cursorStart = inputElement.selectionStart;
    const cursorEnd = inputElement.selectionEnd;

    const before = val.substring(0, cursorStart);
    const after = val.substring(cursorEnd);

    inputElement.value = before + char + after;

    const newPos = before.length + char.length;
    inputElement.setSelectionRange(newPos, newPos);
    inputElement.focus();

    hide();
    inputElement.dispatchEvent(new Event("input"));
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

  const show = () => {
    const word = updateWordBoundaries();
    if (!word.trim()) {
      hide();
      return;
    }

    const parsed = parsePhonetic(word.toLowerCase());
    if (!parsed) {
      hide();
      return;
    }

    state.exactMatch = parsed.exactMatch;
    generateGrid(parsed);
    container.classList.remove("phonetic-map--hidden");
    state.isActive = true;
  };

  const hide = () => {
    container.classList.add("phonetic-map--hidden");
    state.isActive = false;
  };

  const handleGridClick = (e) => {
    const btn = e.target.closest(".phonetic-map__cell");
    if (!btn) return;
    e.preventDefault();

    if (btn.dataset.action === "insert") {
      insertAtCursor(btn.dataset.char);
    } else {
      replaceWord(btn.dataset.char);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "|") {
      e.preventDefault();
      insertAtCursor("।");
    }
  };

  grid.addEventListener("mousedown", handleGridClick);
  inputElement.addEventListener("keydown", handleKeyDown);

  return {
    show,
    hide,
    isActive: () => state.isActive,
    handleSpace: () => {
      if (state.exactMatch) {
        replaceWord(state.exactMatch);
        return true;
      }
      return false;
    },
    destroy: () => {
      grid.removeEventListener("mousedown", handleGridClick);
      inputElement.removeEventListener("keydown", handleKeyDown);
      if (container.parentNode) container.parentNode.removeChild(container);
    },
  };
};