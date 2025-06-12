// src/utils/fullscreen.js

function enterFullscreen(element) {
  if (element.requestFullscreen) {
    element.requestFullscreen();
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();
  } else if (element.msRequestFullscreen) {
    element.msRequestFullscreen();
  }
}

function exitFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  }
}

function isFullscreen() {
  return (
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.msFullscreenElement
  );
}

export function setupFullscreenButton() {
  const btn = document.querySelector(".btn-fullscreen");
  // Use the whole page:
  const wrapper = document.documentElement; // or document.body
  const icon = btn?.querySelector("i");

  if (!btn || !wrapper || !icon) return;

  btn.addEventListener("click", () => {
    if (!isFullscreen()) {
      enterFullscreen(wrapper);
    } else {
      exitFullscreen();
    }
  });

  document.addEventListener("fullscreenchange", updateIcon);
  document.addEventListener("webkitfullscreenchange", updateIcon);
  document.addEventListener("msfullscreenchange", updateIcon);

  function updateIcon() {
    if (isFullscreen()) {
      icon.classList.remove("bi-fullscreen");
      icon.classList.add("bi-fullscreen-exit");
    } else {
      icon.classList.remove("bi-fullscreen-exit");
      icon.classList.add("bi-fullscreen");
    }
  }
}
