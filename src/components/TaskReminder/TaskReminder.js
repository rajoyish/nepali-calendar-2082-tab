import "./TaskReminder.css";

export function createTaskReminder() {
  let notificationSound;
  try {
    notificationSound = new URL(
      "../../assets/notification.mp3",
      import.meta.url,
    ).href;
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

  let isInitialized = false;

  const PAST_REMINDERS_KEY = "pastReminders";
  const ACTIVE_REMINDER_KEY = "activeReminder";
  const MAX_PAST_REMINDERS = 6;

  function requestNotificationPermission() {
    if (
      "Notification" in window &&
      Notification.permission !== "granted" &&
      Notification.permission !== "denied"
    ) {
      Notification.requestPermission();
    }
  }

  function showNotification(title, body) {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, {
        body: body,
        icon: "/favicons/android-chrome-192x192.png",
        requireInteraction: true,
      });
    }
  }

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
    const idx = reminders.findIndex(
      (r) => r.task === reminder.task && r.time === reminder.time,
    );
    if (idx !== -1) {
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

  function renderPastReminders(pastRemindersBlock, list) {
    if (!pastRemindersBlock || !list) return;

    const reminders = loadPastReminders();

    if (!reminders.length) {
      pastRemindersBlock.style.display = "none";
      return;
    } else {
      pastRemindersBlock.style.display = "";
    }

    list.innerHTML = "";

    const fragment = document.createDocumentFragment();

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
        <h3 class="past-reminders__task-title" title="${reminder.task}" data-past-reminder-task-title>
          ${reminder.task}
        </h3>
        <button class="past-reminder-delete-btn" title="Delete reminder">
          <i class="bi bi-trash3-fill"></i>
        </button>
      `;
      fragment.appendChild(li);
    });

    list.appendChild(fragment);
  }

  function init() {
    if (isInitialized) return;

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
      pastRemindersBlock: panel.querySelector(".past-reminders"),
      list: panel.querySelector(".past-reminders__list"),
    };

    const required = [
      "setBtn",
      "resetBtn",
      "modal",
      "form",
      "displayTitle",
      "displayTime",
    ];
    if (!required.every((key) => elements[key])) return;

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
      pastRemindersBlock,
      list,
    } = elements;

    const updateRemindersUI = () =>
      renderPastReminders(pastRemindersBlock, list);

    function showModal() {
      modal.classList.remove("hidden");
      form.classList.remove("hidden");
      titleInput?.focus();
      requestNotificationPermission();
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
      return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
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
            isSoundPlaying = false;
            updateResetBtnText();
          });
      } catch (error) {
        isSoundPlaying = false;
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

    function startCountdown(task) {
      if (reminderTimeout) clearTimeout(reminderTimeout);
      if (soundTimeout) clearTimeout(soundTimeout);

      function update() {
        if (!reminderEndTime) return;
        const msLeft = reminderEndTime - Date.now();

        if (msLeft <= 0) {
          updateDisplay(task, "00:00");
          localStorage.removeItem(ACTIVE_REMINDER_KEY);
          return;
        }

        const formatted = formatTime(msLeft);
        if (displayTime.textContent !== formatted) {
          updateDisplay(task, formatted);
        }
        countdownRAF = requestAnimationFrame(update);
      }
      countdownRAF = requestAnimationFrame(update);

      const msToSound = Math.max(0, reminderEndTime - Date.now() - 500);
      soundTimeout = setTimeout(() => {
        if (soundEnabled) playSound();
      }, msToSound);

      const msToEnd = reminderEndTime - Date.now();
      reminderTimeout = setTimeout(() => {
        updateDisplay(task, "00:00");
        if (typeof chrome === "undefined" || !chrome.alarms) {
          showNotification(
            `Time to ${task}! ✅`,
            "Your reminder session is complete.",
          );
        }
        localStorage.removeItem(ACTIVE_REMINDER_KEY);
      }, msToEnd);
    }

    function setReminder(task, minutes) {
      requestNotificationPermission();
      soundEnabled = soundCheckbox?.checked ?? true;
      lastTask = task;
      reminderEndTime = Date.now() + Number(minutes) * 60 * 1000;

      localStorage.setItem(
        ACTIVE_REMINDER_KEY,
        JSON.stringify({
          task,
          reminderEndTime,
          soundEnabled,
        }),
      );

      if (typeof chrome !== "undefined" && chrome.alarms) {
        chrome.alarms.create("task-reminder", {
          delayInMinutes: Number(minutes),
        });
        if (chrome.storage) {
          chrome.storage.local.set({
            reminderTask: task,
            reminderSound: soundEnabled,
          });
        }
      }

      if (countdownRAF) cancelAnimationFrame(countdownRAF);
      if (reminderTimeout) clearTimeout(reminderTimeout);
      if (soundTimeout) clearTimeout(soundTimeout);

      startCountdown(task);

      addOrMovePastReminder({
        task,
        time: `${minutes} min`,
        created: Date.now(),
      });
      updateRemindersUI();
    }

    function resetReminder(stopSoundNow = true) {
      updateDisplay("Buy Eggs");
      reminderEndTime = null;
      localStorage.removeItem(ACTIVE_REMINDER_KEY);

      if (typeof chrome !== "undefined" && chrome.alarms) {
        chrome.alarms.clear("task-reminder");
        if (chrome.storage) {
          chrome.storage.local.remove(["reminderTask", "reminderSound"]);
        }
      }

      if (countdownRAF) cancelAnimationFrame(countdownRAF);
      if (reminderTimeout) clearTimeout(reminderTimeout);
      if (soundTimeout) clearTimeout(soundTimeout);

      if (stopSoundNow) stopSound();

      hideModal();
      isSoundPlaying = false;
      updateResetBtnText();
    }

    function handleFormSubmit(e) {
      e.preventDefault();
      const task = titleInput?.value.trim() || "";
      const minutes = minutesInput?.value.trim() || "";

      if (!task || !minutes || isNaN(minutes) || Number(minutes) <= 0) return;
      setReminder(task, Number(minutes));
      hideModal();
    }

    function restoreActiveReminder() {
      try {
        const saved = JSON.parse(localStorage.getItem(ACTIVE_REMINDER_KEY));
        if (saved && saved.reminderEndTime > Date.now()) {
          lastTask = saved.task;
          reminderEndTime = saved.reminderEndTime;
          soundEnabled = saved.soundEnabled;
          startCountdown(lastTask);
        } else if (saved) {
          localStorage.removeItem(ACTIVE_REMINDER_KEY);
        }
      } catch (e) {
        localStorage.removeItem(ACTIVE_REMINDER_KEY);
      }
    }

    setBtn.addEventListener("click", showModal);
    resetBtn.addEventListener("click", () => resetReminder());
    form.addEventListener("submit", handleFormSubmit);
    if (cancelBtn) {
      cancelBtn.addEventListener("click", (e) => {
        e.preventDefault();
        hideModal();
      });
    }

    if (list) {
      list.addEventListener("click", (e) => {
        const btn = e.target.closest(".past-reminder-delete-btn");
        if (btn) {
          const li = btn.closest(".past-reminders__item");
          if (!li) return;
          const idx = parseInt(li.getAttribute("data-past-reminder-index"), 10);
          if (!isNaN(idx)) {
            deletePastReminder(idx);
            updateRemindersUI();
          }
          return;
        }

        const item = e.target.closest(".past-reminders__item");
        if (item && !e.target.closest(".past-reminder-delete-btn")) {
          const idx = parseInt(
            item.getAttribute("data-past-reminder-index"),
            10,
          );
          const reminders = loadPastReminders();
          const reminder = reminders[idx];
          if (!reminder) return;

          let minutes = 0;
          if (reminder.time) {
            const match = reminder.time.match(/(\d+)\s*min/);
            if (match) minutes = parseInt(match[1], 10);
          }
          setReminder(reminder.task, minutes);
        }
      });
    }

    modal.classList.add("hidden");
    form.classList.add("hidden");
    isSoundPlaying = false;
    updateResetBtnText();
    updateRemindersUI();
    restoreActiveReminder();

    isInitialized = true;
  }

  return { init };
}
