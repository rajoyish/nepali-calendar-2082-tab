// src/task-reminder/reminder.js

let notificationSound;
try {
  notificationSound = new URL("../assets/notification.mp3", import.meta.url)
    .href;
} catch {
  notificationSound = "/src/assets/notification.mp3";
}

let reminderEndTime = null;
let countdownRAF = null;
let reminderTimeout = null;
let soundTimeout = null;
let audio = null;
let soundEnabled = true;
let isSoundPlaying = false;
let lastTask = "";

const PAST_REMINDERS_KEY = "pastReminders";
const MAX_PAST_REMINDERS = 6;

function loadPastReminders() {
  try {
    return JSON.parse(localStorage.getItem(PAST_REMINDERS_KEY)) || [];
  } catch {
    return [];
  }
}

function savePastReminders(reminders) {
  localStorage.setItem(PAST_REMINDERS_KEY, JSON.stringify(reminders));
}

function addOrMovePastReminder(reminder) {
  const reminders = loadPastReminders();
  // Find if this reminder already exists (by task and time)
  const idx = reminders.findIndex(
    (r) => r.task === reminder.task && r.time === reminder.time
  );
  if (idx !== -1) {
    // Move to top
    reminders.splice(idx, 1);
  }
  reminders.unshift(reminder);
  if (reminders.length > MAX_PAST_REMINDERS)
    reminders.length = MAX_PAST_REMINDERS;
  savePastReminders(reminders);
}

function deletePastReminder(index) {
  const reminders = loadPastReminders();
  reminders.splice(index, 1);
  savePastReminders(reminders);
}

function renderPastReminders() {
  const pastRemindersBlock = document.querySelector(".past-reminders");
  const list = document.querySelector(".past-reminders__list");
  if (!pastRemindersBlock || !list) return;

  const reminders = loadPastReminders();

  // Hide the whole block if no reminders
  if (!reminders.length) {
    pastRemindersBlock.style.display = "none";
    return;
  } else {
    pastRemindersBlock.style.display = "";
  }

  list.innerHTML = "";

  reminders.forEach((reminder, idx) => {
    const li = document.createElement("li");
    li.className = "past-reminders__item";
    li.setAttribute("data-past-reminder-index", idx);

    li.innerHTML = `
      <div class="past-reminders__icon-wrapper">
        <span class="past-reminders__icon">
          <i class="bi bi-clock-history"></i>
        </span>
        <span class="past-reminders__time" data-past-reminder-time>
          ${reminder.time}
        </span>
      </div>
      <h3 class="past-reminders__task-title" data-past-reminder-task-title>
        ${reminder.task}
      </h3>
      <button class="past-reminder-delete-btn" title="Delete reminder">
        <i class="bi bi-trash3-fill"></i>
      </button>
    `;

    list.appendChild(li);
  });
}

function setupPastRemindersListHandler({ setReminder }) {
  const list = document.querySelector(".past-reminders__list");
  if (!list) return;

  list.addEventListener("click", (e) => {
    const btn = e.target.closest(".past-reminder-delete-btn");
    if (btn) {
      // Delete logic
      const li = btn.closest(".past-reminders__item");
      if (!li) return;
      const idx = parseInt(li.getAttribute("data-past-reminder-index"), 10);
      if (!isNaN(idx)) {
        deletePastReminder(idx);
        renderPastReminders();
      }
      return;
    }

    // If not delete button, check for item click
    const item = e.target.closest(".past-reminders__item");
    if (item && !e.target.closest(".past-reminder-delete-btn")) {
      const idx = parseInt(item.getAttribute("data-past-reminder-index"), 10);
      const reminders = loadPastReminders();
      const reminder = reminders[idx];
      if (!reminder) return;

      // Parse minutes from "10 min"
      let minutes = 0;
      if (reminder.time) {
        const match = reminder.time.match(/(\d+)\s*min/);
        if (match) minutes = parseInt(match[1], 10);
      }

      // Start reminder immediately (do not show modal)
      setReminder(reminder.task, minutes, { updatePast: true });
    }
  });
}

export function setupReminder() {
  const panel = document.getElementById("panel-reminder");
  if (!panel) return;

  const elements = {
    setBtn: panel.querySelector(".reminder__btn"),
    resetBtn: panel.querySelectorAll(".reminder__btn")[1],
    modal: panel.querySelector(".reminder__modal"),
    form: panel.querySelector(".reminder-form"),
    cancelBtn: panel.querySelector('.reminder-form__btn[type="button"]'),
    titleInput: panel.querySelector("#reminder-form__task-title"),
    minutesInput: panel.querySelector("#reminder-form__minutes"),
    soundCheckbox: panel.querySelector("#sound"),
    displayTitle: panel.querySelector(".reminder__title"),
    displayTime: panel.querySelector(".reminder__time"),
  };

  if (!validateElements(elements)) return;

  const {
    setBtn,
    resetBtn,
    modal,
    form,
    cancelBtn,
    titleInput,
    minutesInput,
    soundCheckbox,
    displayTitle,
    displayTime,
  } = elements;

  function validateElements(elements) {
    const required = [
      "setBtn",
      "resetBtn",
      "modal",
      "form",
      "displayTitle",
      "displayTime",
    ];
    return required.every((key) => elements[key]);
  }

  function showModal() {
    modal.classList.remove("hidden");
    form.classList.remove("hidden");
    titleInput?.focus();
  }

  function hideModal() {
    modal.classList.add("hidden");
    form.classList.add("hidden");
    form?.reset();
  }

  function formatTime(ms) {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  }

  function updateDisplay(task, time = "20:00") {
    const titleTextNode = displayTitle.childNodes[0];
    if (titleTextNode) {
      titleTextNode.textContent = `${task} `;
    } else {
      displayTitle.innerHTML = `${task} <span class="reminder__title-emphasis">in</span>`;
    }
    displayTime.textContent = time;
    displayTime.setAttribute("datetime", time);
  }

  function updateResetBtnText() {
    if (isSoundPlaying) {
      resetBtn.textContent = "Stop Sound";
    } else {
      resetBtn.textContent = "Reset";
    }
  }

  function startCountdown(task, minutes) {
    // Cancel any previous timeouts
    if (reminderTimeout) {
      clearTimeout(reminderTimeout);
      reminderTimeout = null;
    }
    if (soundTimeout) {
      clearTimeout(soundTimeout);
      soundTimeout = null;
    }

    function update() {
      if (!reminderEndTime) return;

      const msLeft = reminderEndTime - Date.now();

      if (msLeft <= 0) {
        updateDisplay(task, "00:00");
        // Don't call handleReminderEnd here; setTimeout will handle it
        return;
      }

      const formatted = formatTime(msLeft);
      if (displayTime.textContent !== formatted) {
        updateDisplay(task, formatted);
      }
      countdownRAF = requestAnimationFrame(update);
    }
    countdownRAF = requestAnimationFrame(update);

    // Schedule the sound to play 500ms before the end
    const msToSound = Math.max(0, reminderEndTime - Date.now() - 500);
    soundTimeout = setTimeout(() => {
      if (soundEnabled) playSound();
    }, msToSound);

    // Schedule the end event at the actual end
    const msToEnd = reminderEndTime - Date.now();
    reminderTimeout = setTimeout(() => {
      updateDisplay(task, "00:00");
      // Don't play sound here, already played 500ms before
      // You can add any other end logic here if needed
    }, msToEnd);
  }

  // Accepts an options object for special cases (like updatePast)
  function setReminder(task, minutes, options = {}) {
    soundEnabled = soundCheckbox?.checked ?? true;
    lastTask = task;

    reminderEndTime = Date.now() + Number(minutes) * 60 * 1000;

    if (countdownRAF) cancelAnimationFrame(countdownRAF);
    if (reminderTimeout) clearTimeout(reminderTimeout);
    if (soundTimeout) clearTimeout(soundTimeout);

    startCountdown(task, minutes);

    // If called from a past reminder, move it to top, don't duplicate
    if (options.updatePast) {
      addOrMovePastReminder({
        task,
        time: `${minutes} min`,
        created: Date.now(),
      });
    } else {
      // Normal add (from form)
      addOrMovePastReminder({
        task,
        time: `${minutes} min`,
        created: Date.now(),
      });
    }
    renderPastReminders();
  }

  function resetReminder(stopSoundNow = true) {
    updateDisplay("Buy Eggs");
    reminderEndTime = null;

    if (countdownRAF) {
      cancelAnimationFrame(countdownRAF);
      countdownRAF = null;
    }
    if (reminderTimeout) {
      clearTimeout(reminderTimeout);
      reminderTimeout = null;
    }
    if (soundTimeout) {
      clearTimeout(soundTimeout);
      soundTimeout = null;
    }

    if (stopSoundNow) stopSound();

    hideModal();
    isSoundPlaying = false;
    updateResetBtnText();
  }

  function playSound() {
    if (!soundEnabled) return;

    stopSound();
    try {
      audio = new Audio(notificationSound);
      audio.loop = true;
      audio
        .play()
        .then(() => {
          isSoundPlaying = true;
          updateResetBtnText();
        })
        .catch(() => {
          isSoundPlaying = true;
          updateResetBtnText();
        });
    } catch (error) {
      isSoundPlaying = true;
      updateResetBtnText();
    }
  }

  function stopSound() {
    if (audio) {
      try {
        audio.pause();
        audio.currentTime = 0;
        audio = null;
      } catch (error) {}
    }
    isSoundPlaying = false;
    updateResetBtnText();
  }

  function handleFormSubmit(e) {
    e.preventDefault();

    const task = titleInput?.value.trim() || "";
    const minutes = minutesInput?.value.trim() || "";

    if (!task || !minutes || isNaN(minutes) || Number(minutes) <= 0) {
      return;
    }

    setReminder(task, Number(minutes));
    hideModal();
  }

  // Event listeners
  setBtn.addEventListener("click", showModal);
  resetBtn.addEventListener("click", () => resetReminder());
  form.addEventListener("submit", handleFormSubmit);

  if (cancelBtn) {
    cancelBtn.addEventListener("click", (e) => {
      e.preventDefault();
      hideModal();
    });
  }

  // Initialize
  modal.classList.add("hidden");
  form.classList.add("hidden");
  isSoundPlaying = false;
  updateResetBtnText();

  // Past reminders
  renderPastReminders();
  setupPastRemindersListHandler({
    setReminder,
  });
}
