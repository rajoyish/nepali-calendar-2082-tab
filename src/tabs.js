export function setupTabs() {
  const tabsList = document.querySelector(".tabs-list");
  const tabsContainer = document.querySelector(".tabs-container");
  if (!tabsList || !tabsContainer) return;

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
      tab.setAttribute("tabindex", "0");
    } else {
      tab.setAttribute("aria-selected", "false");
      tab.setAttribute("tabindex", "-1");
      tabPanels[index].setAttribute("hidden", "");
    }
  });

  tabPanels.forEach((panel) => {
    panel.setAttribute("role", "tabpanel");
    panel.setAttribute("tabindex", "0");
  });

  const hamburgerBtn = document.getElementById("hamburger-btn");
  const dropdownTabs = document.getElementById("dropdown-tabs");

  if (hamburgerBtn && dropdownTabs) {
    hamburgerBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isExpanded = hamburgerBtn.getAttribute("aria-expanded") === "true";
      hamburgerBtn.setAttribute("aria-expanded", !isExpanded);
      dropdownTabs.classList.toggle("show");
    });

    document.addEventListener("click", (e) => {
      if (
        !tabsList.contains(e.target) &&
        dropdownTabs.classList.contains("show")
      ) {
        dropdownTabs.classList.remove("show");
        hamburgerBtn.setAttribute("aria-expanded", "false");
      }
    });
  }

  tabsList.addEventListener("click", (e) => {
    const clickedTab = e.target.closest("a");
    if (!clickedTab) return;
    e.preventDefault();
    switchTab(clickedTab);

    if (dropdownTabs && dropdownTabs.classList.contains("show")) {
      dropdownTabs.classList.remove("show");
      if (hamburgerBtn) hamburgerBtn.setAttribute("aria-expanded", "false");
    }
  });

  tabsList.addEventListener("keydown", (e) => {
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
