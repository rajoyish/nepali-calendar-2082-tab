// src/task-reminder/reminder.js

let notificationSound;
try {
  notificationSound = new URL('../assets/notification.mp3', import.meta.url)
    .href;
} catch {
  notificationSound = '/src/assets/notification.mp3';
}

let reminderEndTime = null;
let countdownRAF = null;
let audio = null;
let soundEnabled = true;
let isSoundPlaying = false;
let lastTask = '';

export function setupReminder() {
  const panel = document.getElementById('panel-reminder');
  if (!panel) return;

  const elements = {
    setBtn: panel.querySelector('.reminder__btn'),
    resetBtn: panel.querySelectorAll('.reminder__btn')[1],
    modal: panel.querySelector('.reminder__modal'),
    form: panel.querySelector('.reminder-form'),
    cancelBtn: panel.querySelector('.reminder-form__btn[type="button"]'),
    titleInput: panel.querySelector('#reminder-form__task-title'),
    minutesInput: panel.querySelector('#reminder-form__minutes'),
    soundCheckbox: panel.querySelector('#sound'),
    displayTitle: panel.querySelector('.reminder__title'),
    displayTime: panel.querySelector('.reminder__time'),
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
      'setBtn',
      'resetBtn',
      'modal',
      'form',
      'displayTitle',
      'displayTime',
    ];
    return required.every((key) => elements[key]);
  }

  function showModal() {
    modal.classList.remove('hidden');
    form.classList.remove('hidden');
    titleInput?.focus();
  }

  function hideModal() {
    modal.classList.add('hidden');
    form.classList.add('hidden');
    form?.reset();
  }

  function formatTime(ms) {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(
      2,
      '0'
    )}`;
  }

  function updateDisplay(task, time = '20:00') {
    const titleTextNode = displayTitle.childNodes[0];
    if (titleTextNode) {
      titleTextNode.textContent = `${task} `;
    } else {
      displayTitle.innerHTML = `${task} <span class="reminder__title-emphasis">in</span>`;
    }
    displayTime.textContent = time;
    displayTime.setAttribute('datetime', time);
  }

  function updateResetBtnText() {
    if (isSoundPlaying) {
      resetBtn.textContent = 'Stop Sound';
    } else {
      resetBtn.textContent = 'Reset';
    }
  }

  function startCountdown(task, minutes) {
    function update() {
      if (!reminderEndTime) return;

      const msLeft = reminderEndTime - Date.now();

      if (msLeft <= 0) {
        updateDisplay(task, '00:00');
        handleReminderEnd(task);
        return;
      }

      const formatted = formatTime(msLeft);
      if (displayTime.textContent !== formatted) {
        updateDisplay(task, formatted);
      }
      countdownRAF = requestAnimationFrame(update);
    }
    countdownRAF = requestAnimationFrame(update);
  }

  function setReminder(task, minutes) {
    soundEnabled = soundCheckbox?.checked ?? true;
    lastTask = task;

    reminderEndTime = Date.now() + Number(minutes) * 60 * 1000;

    if (countdownRAF) cancelAnimationFrame(countdownRAF);
    startCountdown(task, minutes);
  }

  function resetReminder(stopSoundNow = true) {
    updateDisplay('Buy Eggs');
    reminderEndTime = null;

    if (countdownRAF) {
      cancelAnimationFrame(countdownRAF);
      countdownRAF = null;
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

  function handleReminderEnd(task) {
    if (soundEnabled) {
      playSound();
      // Don't reset here, let user stop sound
    }
    // If sound is not enabled, do nothing (no alert, no sound)
  }

  function handleFormSubmit(e) {
    e.preventDefault();

    const task = titleInput?.value.trim() || '';
    const minutes = minutesInput?.value.trim() || '';

    if (!task || !minutes || isNaN(minutes) || Number(minutes) <= 0) {
      return;
    }

    setReminder(task, Number(minutes));
    hideModal();
  }

  // Event listeners
  setBtn.addEventListener('click', showModal);
  resetBtn.addEventListener('click', () => resetReminder());
  form.addEventListener('submit', handleFormSubmit);

  if (cancelBtn) {
    cancelBtn.addEventListener('click', (e) => {
      e.preventDefault();
      hideModal();
    });
  }

  // Initialize
  modal.classList.add('hidden');
  form.classList.add('hidden');
  isSoundPlaying = false;
  updateResetBtnText();
}
