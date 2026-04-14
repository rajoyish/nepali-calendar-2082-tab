# Tabre – Nepali Calendar & Date Converter New Tab Extension

**Live Demo:** [https://tabre.netlify.app/](https://tabre.netlify.app/)

---

Tabre is a Chrome extension that turns your new tab into a modern Nepali calendar dashboard. Instantly see the current Nepali date, time, tithi, and events, convert between Bikram Sambat (BS) and Gregorian (AD) calendars, and manage your tasks—all in one place.

---

## ✨ Features

- 🗓 **Current Nepali Date & Time** View today’s Nepali date and time in Devanagari, updated live.

- 🔄 **Date Converter (AD ↔ BS)** Quickly convert dates between Nepali (BS) and English (AD).

- ⏰ **Time Period Awareness** See the current Nepali time segment (e.g., बिहान, मध्यान्ह). The dashboard background dynamically adapts to the current time period.

- 📅 **Full Month View** Browse the entire current Nepali month seamlessly.

- 🔔 **Smart Reminders & Notifications**
  - Set quick reminder tasks.
  - **New:** Integrated native browser notifications ensure you never miss a task, even if you are on another tab.
  - Get an audio alert when a reminder finishes.
  - View recent reminders and click to quickly restart them.

- 🖼 **Dynamic Aesthetic Backgrounds** Enjoy beautiful, dynamic scenic backgrounds loaded instantly via optimized glob imports for a clean, modern look.

- ⚡ **Fast & Private** All features run locally. No data is collected or sent anywhere.

---

## 🔒 Privacy

- No data collection, tracking, or third-party scripts.
- All features, including notifications and background images, work 100% offline on your device.

---

## 🚀 Installation

**From Chrome Web Store:**

1. Visit the [Chrome Web Store page](https://chromewebstore.google.com/detail/tabre-nepali-calendar-new/aifbilibghomlchloeechmmoeiepgcbo).
2. Click **Add to Chrome**.

**Manual Installation:**

1. Clone or download this repository.
2. Go to `chrome://extensions/` and enable **Developer Mode**.
3. Click **Load unpacked** and select the project folder (or the `dist` folder after building).

---

## 💻 Development

Built with [Vite 6](https://vitejs.dev/), Vanilla JS, HTML & CSS. Our developer workflow is fully automated to compile calendar data on the fly.

```bash
# Install dependencies
npm install

# Start local development server
# This concurrently runs Vite and watches/rebuilds calendar JSON data via nodemon
npm run dev

# Build extension for production
# This runs the prebuild calendar compilation, Vite build, and copies extension assets
npm run build-extension