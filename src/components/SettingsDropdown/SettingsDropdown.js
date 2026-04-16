import "./SettingsDropdown.css";
import {
  enterFullscreen,
  exitFullscreen,
  isFullscreen,
} from "../../utils/fullscreen.js";

export function initSettingsDropdown(element) {
  const trigger = element.querySelector(".settings__trigger");
  const menu = element.querySelector(".settings__menu");
  const items = Array.from(element.querySelectorAll(".settings__item"));

  let isOpen = false;
  let currentIndex = -1;
  const controller = new AbortController();
  const { signal } = controller;

  function openMenu() {
    isOpen = true;
    trigger.setAttribute("aria-expanded", "true");
    menu.style.display = "block";
    currentIndex = -1;
  }

  function closeMenu() {
    isOpen = false;
    trigger.setAttribute("aria-expanded", "false");
    menu.style.display = "none";
    currentIndex = -1;
    items.forEach((item) => item.setAttribute("tabindex", "-1"));
  }

  function toggleMenu() {
    isOpen ? closeMenu() : openMenu();
  }

  function focusItem(index) {
    items.forEach((item) => item.setAttribute("tabindex", "-1"));
    if (index >= 0 && index < items.length) {
      const currentItem = items[index];
      currentItem.setAttribute("tabindex", "0");
      currentItem.focus();
    }
  }

  function updateFullscreenIcon() {
    const fullscreenItem = items.find(
      (item) => item.dataset.action === "fullscreen",
    );
    if (fullscreenItem) {
      const icon = fullscreenItem.querySelector("i");
      const textSpan = fullscreenItem.querySelector(".settings__item-text");

      if (isFullscreen()) {
        if (icon) {
          icon.classList.remove("bi-fullscreen");
          icon.classList.add("bi-fullscreen-exit");
        }
        if (textSpan) {
          textSpan.textContent = "Exit";
        }
      } else {
        if (icon) {
          icon.classList.remove("bi-fullscreen-exit");
          icon.classList.add("bi-fullscreen");
        }
        if (textSpan) {
          textSpan.textContent = "Fullscreen";
        }
      }
    }
  }

  function handleAction(action) {
    if (action === "fullscreen") {
      if (!isFullscreen()) {
        enterFullscreen(document.documentElement);
      } else {
        exitFullscreen();
      }
    }
    closeMenu();
    trigger.focus();
  }

  trigger.addEventListener(
    "click",
    (e) => {
      e.preventDefault();
      toggleMenu();
    },
    { signal },
  );

  trigger.addEventListener(
    "keydown",
    (e) => {
      if (["Enter", " ", "ArrowDown"].includes(e.key)) {
        e.preventDefault();
        openMenu();
        currentIndex = 0;
        focusItem(currentIndex);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        openMenu();
        currentIndex = items.length - 1;
        focusItem(currentIndex);
      } else if (e.key === "Escape") {
        closeMenu();
      }
    },
    { signal },
  );

  items.forEach((item) => {
    item.addEventListener(
      "click",
      (e) => {
        const action = item.dataset.action;
        if (action === "fullscreen") {
          e.preventDefault();
        }
        handleAction(action);
      },
      { signal },
    );

    item.addEventListener(
      "keydown",
      (e) => {
        if (["Enter", " "].includes(e.key)) {
          e.preventDefault();
          const action = item.dataset.action;
          handleAction(action);
          if (action !== "fullscreen") item.click();
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          currentIndex = (currentIndex + 1) % items.length;
          focusItem(currentIndex);
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          currentIndex =
            currentIndex <= 0 ? items.length - 1 : currentIndex - 1;
          focusItem(currentIndex);
        } else if (e.key === "Home") {
          e.preventDefault();
          currentIndex = 0;
          focusItem(currentIndex);
        } else if (e.key === "End") {
          e.preventDefault();
          currentIndex = items.length - 1;
          focusItem(currentIndex);
        } else if (e.key === "Escape") {
          closeMenu();
          trigger.focus();
        } else if (e.key === "Tab") {
          closeMenu();
        }
      },
      { signal },
    );
  });

  document.addEventListener(
    "click",
    (e) => {
      if (!element.contains(e.target) && isOpen) {
        closeMenu();
      }
    },
    { signal },
  );

  document.addEventListener(
    "keydown",
    (e) => {
      if (e.key === "Escape" && isOpen) {
        closeMenu();
        trigger.focus();
      }
    },
    { signal },
  );

  document.addEventListener("fullscreenchange", updateFullscreenIcon, {
    signal,
  });
  document.addEventListener("webkitfullscreenchange", updateFullscreenIcon, {
    signal,
  });
  document.addEventListener("msfullscreenchange", updateFullscreenIcon, {
    signal,
  });

  closeMenu();
  updateFullscreenIcon();

  return () => controller.abort();
}
