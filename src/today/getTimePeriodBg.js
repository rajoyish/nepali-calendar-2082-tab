import { npTimePeriods } from "./nepaliTimePeriod.js";
import { bgImages } from "./bgImages.js";

export function getNepaliTimePeriodIndex(date) {
  const hour = date.getHours();
  const minute = date.getMinutes();
  const totalMinutes = hour * 60 + minute;

  for (let i = 0; i < npTimePeriods.length; i++) {
    const [, range] = npTimePeriods[i];
    const [start, end] = range.split("–");
    const [startH, startM] = start.split(":").map(Number);
    const [endH, endM] = end.split(":").map(Number);
    const startMin = startH * 60 + startM;
    const endMin = endH * 60 + endM;

    if (startMin < endMin) {
      if (totalMinutes >= startMin && totalMinutes < endMin) {
        return i;
      }
    } else {
      if (totalMinutes >= startMin || totalMinutes < endMin) {
        return i;
      }
    }
  }
  return 0;
}

export function getTimePeriodBgImage(date) {
  if (bgImages.length === 0) return "";
  const idx = getNepaliTimePeriodIndex(date);
  return bgImages[idx % bgImages.length];
}