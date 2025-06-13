// src/reminder/index.js

import notificationSound from "../assets/notification.mp3";

let reminderEndTime = null;
let countdownRAF = null;
let audio = null;

export function setupReminder() {
  const panel = document.getElementById("panel-reminder");
  if (!panel) return;

  const setBtn = panel.querySelector(".reminder__btn");
  const resetBtn = panel.querySelectorAll(".reminder__btn")[1];
  const modal = panel.querySelector(".reminder__modal");
  const form = panel.querySelector(".reminder-form");
  const cancelBtn = panel.querySelector('.reminder-form__btn[type="button"]');
  const titleInput = form.querySelector("#reminder-form__task-title");
  const minutesInput = form.querySelector("#reminder-form__minutes");
  const soundCheckbox = form.querySelector("#sound");
  const displayTitle = panel.querySelector(".reminder__title");
  const displayTime = panel.querySelector(".reminder__time");

  // Helper: Show/hide modal
  function showModal() {
    modal.style.display = "block";
    titleInput.focus();
  }
  function hideModal() {
    modal.style.display = "none";
    form.reset();
  }

  // Helper: Format mm:ss
  function formatTime(ms) {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return (
      String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0")
    );
  }

  // Helper: Start countdown
  function startCountdown(task, minutes) {
    function update() {
      if (!reminderEndTime) return;
      const now = Date.now();
      const msLeft = reminderEndTime - now;
      if (msLeft <= 0) {
        displayTime.textContent = "00:00";
        displayTime.setAttribute("datetime", "00:00");
        handleReminderEnd(task, minutes);
        resetReminder(false); // Don't stop sound here, let it play until toast is dismissed
        return;
      }
      const formatted = formatTime(msLeft);
      if (displayTime.textContent !== formatted) {
        displayTime.textContent = formatted;
        displayTime.setAttribute("datetime", formatted);
      }
      countdownRAF = requestAnimationFrame(update);
    }
    countdownRAF = requestAnimationFrame(update);
  }

  // Helper: Set reminder
  function setReminder(task, minutes) {
    displayTitle.childNodes[0].textContent = task + " ";
    const now = Date.now();
    const ms = Number(minutes) * 60 * 1000;
    reminderEndTime = now + ms;

    // Start countdown
    if (countdownRAF) cancelAnimationFrame(countdownRAF);
    startCountdown(task, minutes);
  }

  // Helper: Reset reminder
  // If stopSoundNow is false, don't stop sound (used when reminder ends)
  function resetReminder(stopSoundNow = true) {
    displayTitle.childNodes[0].textContent = "Buy Eggs ";
    displayTime.textContent = "20:00";
    displayTime.setAttribute("datetime", "20:00");
    reminderEndTime = null;
    if (countdownRAF) cancelAnimationFrame(countdownRAF);
    countdownRAF = null;
    if (stopSoundNow) stopSound();
    removeToast();
  }

  // Helper: Play and stop sound
  function playSound() {
    stopSound(); // Stop any previous sound
    audio = new Audio(notificationSound);
    audio.loop = true;
    audio.play().catch(() => {
      // Some browsers block autoplay, ignore error
    });
  }
  function stopSound() {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      audio = null;
    }
  }

  // Toast helpers
  function showToast(task, minutes) {
    removeToast(); // Remove any existing toast

    // Create toast
    const toast = document.createElement("div");
    toast.className = "reminder-toast";
    toast.innerHTML = `
      <div class="reminder-toast__content">
        <strong>⏰ Reminder</strong>
        <div class="reminder-toast__details">
          <span class="reminder-toast__task">${task}</span>
          <span class="reminder-toast__minutes">Set for ${minutes} minute${
      minutes > 1 ? "s" : ""
    }</span>
        </div>
        <button class="reminder-toast__ok">Okay</button>
      </div>
    `;
    document.body.appendChild(toast);

    // Focus the OK button for accessibility
    const okBtn = toast.querySelector(".reminder-toast__ok");
    if (okBtn) okBtn.focus();

    okBtn.addEventListener("click", () => {
      stopSound();
      removeToast();
    });
  }

  function removeToast() {
    const toast = document.querySelector(".reminder-toast");
    if (toast) toast.remove();
  }

  // Helper: Handle reminder end
  function handleReminderEnd(task, minutes) {
    if (soundCheckbox && soundCheckbox.checked) {
      playSound();
    }
    showToast(task, minutes);
    // Sound will stop when user clicks Okay
  }

  // Event: Open modal
  setBtn.addEventListener("click", showModal);

  // Event: Cancel button
  cancelBtn.addEventListener("click", (e) => {
    e.preventDefault();
    hideModal();
  });

  // Event: Reset button
  resetBtn.addEventListener("click", () => {
    resetReminder();
  });

  // Event: Form submit
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const task = titleInput.value.trim();
    const minutes = minutesInput.value.trim();
    if (!task || !minutes || isNaN(minutes) || minutes <= 0) {
      showToast("Please enter a valid task and minutes.", 0);
      return;
    }
    setReminder(task, minutes);
    hideModal();
  });

  // Hide modal on load
  hideModal();
}
