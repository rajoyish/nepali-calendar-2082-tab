// src/devanagariNumeral.js

const devanagariDigits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];

/**
 * Converts a string of Western digits to Devanagari numerals.
 */
export function toDevanagariNumeral(str) {
  return String(str).replace(/\d/g, (d) => devanagariDigits[d]);
}
