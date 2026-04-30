export const convertToUnicode = (textToConvert) => {
  const symbolsToReplace = [
    "ç", "˜", ".", "'m", "]m", "Fmf", "Fm", ")", "!", "@", "#", "$", "%", "^", "&", "*", "(", "k|m", "em", "km", "Qm", "qm", "Nf", "¡", "¢", "1", "2", "4", ">", "?", "B", "I", "Q", "ß", "q", "„", "‹", "•", "›", "§", "°", "¶", "¿", "Å", "Ë", "Ì", "Í", "Î", "Ý", "å", "6«", "7«", "8«", "9«", "Ø", "|", "8Þ", "9Þ", "S", "s", "V", "v", "U", "u", "£", "3", "ª", "R", "r", "5", "H", "h", "‰", "´", "~", "`", "6", "7", "8", "9", "0", "T", "t", "Y", "y", "b", "W", "w", "G", "g", "K", "k", "ˆ", "A", "a", "E", "e", "D", "d", "o", "/", "N", "n", "J", "j", "Z", "z", "i", ":", ";", "X", "x", "cf‘", "c‘f", "cf}", "cf]", "cf", "c", "O{", "O", "pm", "p", "C", "P]", "P", "f‘", '"', "'", "+", "f", "[", "\\", "]", "}", "F", "L", "M", "्ा", "्ो", "्ौ", "अो", "अा", "आै", "आे", "ाो", "ाॅ", "ाे", "ंु", "ेे", "अै", "ाे", "अे", "ंा", "अॅ", "ाै", "ैा", "ंृ", "ँा", "ँू", "ेा", "ंे",
  ];
  const correspondingUnicodeSymbols = [
    "ॐ", "ऽ", "।", "m'", "m]", "mfF", "mF", "०", "१", "२", "३", "४", "५", "६", "७", "८", "९", "फ्र", "झ", "फ", "क्त", "क्र", "ल", "ज्ञ्", "द्घ", "ज्ञ", "द्द", "द्ध", "श्र", "रु", "द्य", "क्ष्", "त्त", "द्म", "त्र", "ध्र", "ङ्घ", "ड्ड", "द्र", "ट्ट", "ड्ढ", "ठ्ठ", "रू", "हृ", "ङ्ग", "त्र", "ङ्क", "ङ्ख", "ट्ठ", "द्व", "ट्र", "ठ्र", "ड्र", "ढ्र", "्य", "्र", "ड़", "ढ़", "क्", "क", "ख्", "ख", "ग्", "ग", "घ्", "घ", "ङ", "च्", "च", "छ", "ज्", "ज", "झ्", "झ", "ञ्", "ञ", "ट", "ठ", "ड", "ढ", "ण्", "त्", "त", "थ्", "थ", "द", "ध्", "ध", "न्", "न", "प्", "प", "फ्", "ब्", "ब", "भ्", "भ", "म्", "म", "य", "र", "ल्", "ल", "व्", "व", "श्", "श", "ष्", "स्", "स", "ह्", "ह", "ऑ", "ऑ", "औ", "ओ", "आ", "अ", "ई", "इ", "ऊ", "उ", "ऋ", "ऐ", "ए", "ॉ", "ू", "ु", "ं", "ा", "ृ", "्", "े", "ै", "ँ", "ी", "ः", "", "े", "ै", "ओ", "आ", "औ", "ओ", "ो", "ॉ", "ो", "ुं", "े", "अ‍ै", "ो", "अ‍े", "ां", "अ‍ॅ", "ौ", "ौ", "ृं", "ाँ", "ूँ", "ो", "ें",
  ];
  const symbolCount = symbolsToReplace.length;

  return replaceSymbols(
    textToConvert,
    symbolCount,
    symbolsToReplace,
    correspondingUnicodeSymbols
  );
};

const replaceSymbols = (
  textToConvert,
  symbolCount,
  symbolsToReplace,
  correspondingUnicodeSymbols
) => {
  if (textToConvert !== "") {
    for (let symbolIdx = 0; symbolIdx < symbolCount; symbolIdx++) {
      let index = textToConvert.indexOf(symbolsToReplace[symbolIdx]);
      while (index !== -1) {
        textToConvert = textToConvert.replace(
          symbolsToReplace[symbolIdx],
          correspondingUnicodeSymbols[symbolIdx]
        );
        index = textToConvert.indexOf(symbolsToReplace[symbolIdx], index + 1);
      }
    }

    let positionOfI = textToConvert.indexOf("l");
    while (positionOfI !== -1) {
      let nextChar = textToConvert.charAt(positionOfI + 1);
      let charToReplace = "l" + nextChar;
      textToConvert = textToConvert.replace(charToReplace, nextChar + "ि");
      positionOfI = textToConvert.search(/l/, positionOfI + 1);
    }

    let positionOfWrongEe = textToConvert.indexOf("ि्");
    while (positionOfWrongEe !== -1) {
      let consonantNextToWrongEe = textToConvert.charAt(positionOfWrongEe + 2);
      let charToReplace = "ि्" + consonantNextToWrongEe;
      textToConvert = textToConvert.replace(
        charToReplace,
        "्" + consonantNextToWrongEe + "ि"
      );
      positionOfWrongEe = textToConvert.search(/ि्/, positionOfWrongEe + 2);
    }

    const setOfMatras = "ा ि ी ु ू ृ े ै ो ौ ं : ँ ॅ";
    let positionOfReph = textToConvert.indexOf("{");
    while (positionOfReph > 0) {
      let probablePositionOfHalfR = positionOfReph - 1;
      let charAtProbablePositionOfHalfR = textToConvert.charAt(
        probablePositionOfHalfR
      );

      while (setOfMatras.includes(charAtProbablePositionOfHalfR)) {
        probablePositionOfHalfR = probablePositionOfHalfR - 1;
        charAtProbablePositionOfHalfR = textToConvert.charAt(
          probablePositionOfHalfR
        );
      }

      let charToReplace = textToConvert.substr(
        probablePositionOfHalfR,
        positionOfReph - probablePositionOfHalfR
      );
      let newReplacementString = "र्" + charToReplace;
      charToReplace = charToReplace + "{";

      textToConvert = textToConvert.replace(
        charToReplace,
        newReplacementString
      );
      positionOfReph = textToConvert.indexOf("{");
    }

    textToConvert = textToConvert
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
  }

  return textToConvert;
};