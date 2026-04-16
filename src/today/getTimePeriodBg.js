import { bgImages } from "./bgImages.js";

let manualOffset = 0;

export function getTimePeriodBgImage(date) {
  if (bgImages.length === 0) return "";
  const totalMinutes = date.getHours() * 60 + date.getMinutes();
  const intervalIndex = Math.floor(totalMinutes / 30);
  const targetIndex = (intervalIndex + manualOffset) % bgImages.length;
  return bgImages[targetIndex];
}

export function changeBackgroundManually() {
  manualOffset++;
}
