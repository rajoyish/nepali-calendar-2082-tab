const PREETI_TO_UNICODE_MAP = {
  ç: "ॐ",
  "˜": "ऽ",
  ".": "।",
  "'m": "m'",
  "]m": "m]",
  Fmf: "mfF",
  Fm: "mF",
  ")": "०",
  "!": "१",
  "@": "२",
  "#": "३",
  $: "४",
  "%": "५",
  "^": "६",
  "&": "७",
  "*": "८",
  "(": "९",
  "k|m": "फ्र",
  em: "झ",
  km: "फ",
  Qm: "क्त",
  qm: "क्र",
  Nf: "ल",
  "¡": "ज्ञ्",
  "¢": "द्घ",
  1: "ज्ञ",
  2: "द्द",
  4: "द्ध",
  ">": "श्र",
  "?": "रु",
  B: "द्य",
  I: "क्ष्",
  Q: "त्त",
  ß: "द्म",
  q: "त्र",
  "„": "ध्र",
  "‹": "ङ्घ",
  "•": "ड्ड",
  "›": "द्र",
  "§": "ट्ट",
  "°": "ड्ढ",
  "¶": "ठ्ठ",
  "¿": "रू",
  Å: "हृ",
  Ë: "ङ्ग",
  Ì: "त्र",
  Í: "ङ्क",
  Î: "ङ्ख",
  Ý: "ट्ठ",
  å: "द्व",
  "6«": "ट्र",
  "7«": "ठ्र",
  "8«": "ड्र",
  "9«": "ढ्र",
  Ø: "्य",
  "|": "्र",
  "8Þ": "ड़",
  "9Þ": "ढ़",
  S: "क्",
  s: "क",
  V: "ख्",
  v: "ख",
  U: "ग्",
  u: "ग",
  "£": "घ्",
  3: "घ",
  ª: "ङ",
  R: "च्",
  r: "च",
  5: "छ",
  H: "ज्",
  h: "ज",
  "‰": "झ्",
  "´": "झ",
  "~": "ञ्",
  "`": "ञ",
  6: "ट",
  7: "ठ",
  8: "ड",
  9: "ढ",
  0: "ण्",
  T: "त्",
  t: "त",
  Y: "थ्",
  y: "थ",
  b: "द",
  W: "ध्",
  w: "ध",
  G: "न्",
  g: "न",
  K: "प्",
  k: "प",
  ˆ: "फ्",
  A: "ब्",
  a: "ब",
  E: "भ्",
  e: "भ",
  D: "म्",
  d: "म",
  o: "य",
  "/": "र",
  N: "ल्",
  n: "ल",
  J: "व्",
  j: "व",
  Z: "श्",
  z: "श",
  i: "ष्",
  ":": "स्",
  ";": "स",
  X: "ह्",
  x: "ह",
  "cf‘": "ऑ",
  "cf}": "औ",
  "cf]": "ओ",
  cf: "आ",
  c: "अ",
  "O{": "ई",
  O: "इ",
  pm: "ऊ",
  p: "उ",
  C: "ऋ",
  "P]": "ऐ",
  P: "ए",
  "f‘": "ॉ",
  '"': "ू",
  "'": "ु",
  "+": "ं",
  f: "ा",
  "[": "ृ",
  "\\": "्",
  "]": "े",
  "}": "ै",
  F: "ँ",
  L: "ी",
  M: "ः",
};

const PREETI_TO_UNICODE_FIXES = {
  "c‘f": "ऑ",
  "्ा": "",
  "्ो": "े",
  "्ौ": "ै",
  अो: "ओ",
  अा: "आ",
  आै: "औ",
  आे: "ओ",
  "ाो": "ो",
  "ाॅ": "ॉ",
  "ाे": "ो",
  "ंु": "ुं",
  "ेे": "े",
  अै: "अ‍ै",
  अे: "अ‍े",
  "ंा": "ां",
  अॅ: "अ‍ॅ",
  "ाै": "ौ",
  "ैा": "ौ",
  "ंृ": "ृं",
  "ँा": "ाँ",
  "ँू": "ूँ",
  "ेा": "ो",
  "ंे": "ें",
};

const UNICODE_TO_PREETI_OVERRIDES = {
  म्रो: "d|f]",
  शृ: ">[",
  ङ्ख: "ª\\v",
  त्रै: "q}",
  न्त्रि: "lGq",
  ग्रि: "lu|",
  क्ष: "If",
  त्र: "q",
  प्र: "k|",
  ग्र: "u|",
  ण: "0f",
  ल्पि: "lNk",
  र्ण: "0f{",
};

const UNICODE_TO_PREETI_MAP = {
  ...Object.fromEntries(
    Object.entries(PREETI_TO_UNICODE_MAP).map(([k, v]) => [v, k]),
  ),
  "ो": "f]",
  "ौ": "f}",
};

const combinedPreetiMap = {
  ...PREETI_TO_UNICODE_MAP,
  ...PREETI_TO_UNICODE_FIXES,
};

const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const preetiRegex = new RegExp(
  Object.keys(combinedPreetiMap)
    .sort((a, b) => b.length - a.length)
    .map(escapeRegExp)
    .join("|"),
  "g",
);

const overridesRegex = new RegExp(
  Object.keys(UNICODE_TO_PREETI_OVERRIDES)
    .sort((a, b) => b.length - a.length)
    .map(escapeRegExp)
    .join("|"),
  "g",
);

const unicodeRegex = new RegExp(
  Object.keys(UNICODE_TO_PREETI_MAP)
    .sort((a, b) => b.length - a.length)
    .map(escapeRegExp)
    .join("|"),
  "g",
);

export const convertToUnicode = (textToConvert) => {
  if (!textToConvert) return "";

  let convertedText = textToConvert.replace(
    preetiRegex,
    (match) => combinedPreetiMap[match],
  );

  convertedText = convertedText
    .replace(/l(.)/g, "$1ि")
    .replace(/ि्(.)/g, "्$1ि");

  const rephRegex = /([^ािीुूृेैोौं:ँॅ]+)([ािीुूृेैोौं:ँॅ]*){/g;
  let previousText;
  do {
    previousText = convertedText;
    convertedText = convertedText.replace(rephRegex, "र्$1$2");
  } while (convertedText !== previousText);

  return convertedText
    .replace(/=/g, ".")
    .replace(/_/g, ")")
    .replace(/Ö/g, "=")
    .replace(/Ù/g, ";")
    .replace(/…/g, "‘")
    .replace(/Ú/g, "’")
    .replace(/Û/g, "!")
    .replace(/Ü/g, "%")
    .replace(/æ/g, "“")
    .replace(/Æ/g, "”")
    .replace(/±/g, "+")
    .replace(/-/g, "(")
    .replace(/</g, "?");
};

export const convertToPreeti = (textToConvert) => {
  if (!textToConvert) return "";

  let processedText = textToConvert.replace(
    overridesRegex,
    (match) => UNICODE_TO_PREETI_OVERRIDES[match],
  );

  processedText = processedText
    .replace(/र्([क-ह][ािीुूृेैोौं:ँॅ]*)/g, "$1{")
    .replace(/(.)ि/g, "l$1");

  return processedText.replace(
    unicodeRegex,
    (match) => UNICODE_TO_PREETI_MAP[match] || match,
  );
};

export const transliterateNepali = async (text, maxSuggestions = 8) => {
  if (!text?.trim()) return [];

  const params = new URLSearchParams({
    text: text,
    itc: "ne-t-i0-und",
    num: String(maxSuggestions),
    cp: "0",
    cs: "1",
    ie: "utf-8",
    oe: "utf-8",
    app: "demopage",
  });

  try {
    const response = await fetch(
      `https://inputtools.google.com/request?${params.toString()}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      },
    );

    if (!response.ok) return [text];
    const data = await response.json();

    if (data[0] === "SUCCESS" && Array.isArray(data[1]?.[0]?.[1])) {
      return data[1][0][1];
    }
    return [text];
  } catch (error) {
    return [text];
  }
};