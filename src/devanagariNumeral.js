// src/devanagariNumeral.js

const devanagariDigits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];

/**
 * Converts all ASCII digits in a string to Devanagari numerals.
 * @param {string} str
 * @returns {string}
 */
export function toDevanagariNumeral(str) {
  // Use a single regex replace for performance
  return str.replace(/\d/g, (d) => devanagariDigits[d]);
}
