// src/tabs.js

export function setupTabs(containerSelector = ".tabs-container") {
  const tabsContainer = document.querySelector(containerSelector);
  if (!tabsContainer) return;

  const tabsList = tabsContainer.querySelector("ul");
  const tabButtons = tabsList.querySelectorAll("a");
  const tabPanels = tabsContainer.querySelectorAll(".tabs__panels > div");

  tabsList.setAttribute("role", "tablist");
  tabsList.querySelectorAll("li").forEach((li) => {
    li.setAttribute("role", "presentation");
  });

  tabButtons.forEach((tab, index) => {
    tab.setAttribute("role", "tab");
    if (index === 0) {
      tab.setAttribute("aria-selected", "true");
    } else {
      tab.setAttribute("tabindex", "-1");
      tabPanels[index].setAttribute("hidden", "");
    }
  });

  tabPanels.forEach((panel) => {
    panel.setAttribute("role", "tabpanel");
    panel.setAttribute("tabindex", "0");
  });

  tabsContainer.addEventListener("click", (e) => {
    const clickedTab = e.target.closest("a");
    if (!clickedTab) return;
    e.preventDefault();
    switchTab(clickedTab);
  });

  tabsContainer.addEventListener("keydown", (e) => {
    switch (e.key) {
      case "ArrowLeft":
        moveLeft();
        break;
      case "ArrowRight":
        moveRight();
        break;
      case "Home":
        e.preventDefault();
        switchTab(tabButtons[0]);
        break;
      case "End":
        e.preventDefault();
        switchTab(tabButtons[tabButtons.length - 1]);
        break;
    }
  });

  function moveLeft() {
    const currentTab = document.activeElement;
    const idx = Array.from(tabButtons).indexOf(currentTab);
    const prevIdx = (idx - 1 + tabButtons.length) % tabButtons.length;
    switchTab(tabButtons[prevIdx]);
  }

  function moveRight() {
    const currentTab = document.activeElement;
    const idx = Array.from(tabButtons).indexOf(currentTab);
    const nextIdx = (idx + 1) % tabButtons.length;
    switchTab(tabButtons[nextIdx]);
  }

  function switchTab(newTab) {
    const activePanelId = newTab.getAttribute("href");
    const activePanel = tabsContainer.querySelector(activePanelId);

    tabButtons.forEach((button) => {
      button.setAttribute("aria-selected", "false");
      button.setAttribute("tabindex", "-1");
    });

    tabPanels.forEach((panel) => {
      panel.setAttribute("hidden", "true");
    });

    activePanel.removeAttribute("hidden");
    newTab.setAttribute("aria-selected", "true");
    newTab.setAttribute("tabindex", "0");
    newTab.focus();
  }
}
