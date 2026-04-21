# 🇳🇵 Tabre – Nepali Calendar & Date Converter New Tab Extension

**Live Demo:** [https://tabre.netlify.app/](https://tabre.netlify.app/)

---

Tabre is a Chrome extension that turns your new tab into a modern Nepali calendar dashboard. Instantly see the current Nepali date, time, tithi, and events, convert between Bikram Sambat (BS) and Gregorian (AD) calendars, and manage your tasks—all in one beautifully designed place.

---

## ✨ Features

- 🗓 **Current Nepali Date & Time:** View today’s Nepali date and time in Devanagari, updated live.

- 🔄 **Date Converter (AD ↔ BS):** Quickly convert dates between Nepali (BS) and English (AD).

- 📅 **Interactive Full Calendar:** Browse the entire current Nepali month seamlessly with improved optimization and bug fixes. 
  - **Enhanced Daily Details:** Tapping on a date now opens a comprehensive modal featuring Sunrise and Sunset times, Nepal Samvat details, Panchanga, a Daily Events List, and Auspicious Times & Muhurtas.

- 🔔 **Smart Reminders, Tasks & Events:** - **Task Reminders:** Stay on top of your to-do list with a task reminder system that includes native browser push notifications and audio alerts—so you never miss a beat, even on another tab.
  - **Upcoming Events:** Create and track custom events. The app will automatically send you a notification when today's date matches your saved event.
  - View recent reminders and click to quickly restart them.

- 🎨 **Customizable Aesthetic UI:** - **Glassmorphism Design:** Experience a modern look with our new glassmorphism effect. Prefer the classic look? You can easily toggle this feature on or off in the settings menu.
  - **Dynamic Backgrounds:** The dashboard background dynamically adapts to the current time period (e.g., बिहान, मध्यान्ह). Enjoy beautiful, scenic backgrounds loaded instantly via optimized glob imports.

- ⚡ **Fast & Private:** All features run locally. No data is collected or sent anywhere.

---

## 🔒 Privacy

- 🚫 No data collection, tracking, or third-party scripts.
- 💻 All features, including notifications and background images, work 100% offline on your device.

---

## 🚀 Installation

**From Chrome Web Store:**

1. 🌐 Visit the [Chrome Web Store page](https://chromewebstore.google.com/detail/tabre-nepali-calendar-new/aifbilibghomlchloeechmmoeiepgcbo).
2. 🖱 Click **Add to Chrome**.

**Manual Installation:**

1. 📥 Clone or download this repository.
2. ⚙️ Go to `chrome://extensions/` and enable **Developer Mode**.
3. 📂 Click **Load unpacked** and select the project folder (or the `dist` folder after building).

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
