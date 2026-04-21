// src/utils/dataFetcher.js
let cachedData = null;
let fetchPromise = null;

export async function getCalendarData() {
  // If we already have the data, return it instantly
  if (cachedData) return cachedData;
  
  // If a fetch is already in progress, wait for it instead of starting a new one
  if (fetchPromise) return fetchPromise;

  fetchPromise = fetch('./calendar-data.json')
    .then((res) => {
      if (!res.ok) throw new Error("Failed to load calendar data");
      return res.json();
    })
    .then((data) => {
      cachedData = data;
      return data;
    })
    .catch((error) => {
      console.error("Error fetching calendar data:", error);
      return null;
    });

  return fetchPromise;
}