import "./Bookmarks.css";

const STORAGE_KEY = "tabre_user_bookmarks";
const SETTINGS_KEY = "tabre_show_bookmarks";
const MAX_BOOKMARKS = 10;

export async function initBookmarks() {
  const section = document.getElementById("bookmarks-section");
  const openBtn = document.getElementById("btn-open-bookmarks-modal");
  const closeBtn = document.getElementById("btn-close-bookmarks-modal");
  const modal = document.getElementById("bookmarks-modal");

  if (!section) return;

  await syncVisibility();
  await renderSavedBookmarks();

  // Modal Controls
  if (openBtn && modal) {
    openBtn.addEventListener("click", async () => {
      modal.showModal();
      await populateModalTree();
    });
  }

  if (closeBtn && modal) {
    closeBtn.addEventListener("click", () => {
      modal.close();
      // Re-render the main UI in case changes were made in the modal
      renderSavedBookmarks();
    });
  }

  // Close modal if clicked outside
  modal?.addEventListener("click", (e) => {
    const dialogDimensions = modal.getBoundingClientRect();
    if (
      e.clientX < dialogDimensions.left ||
      e.clientX > dialogDimensions.right ||
      e.clientY < dialogDimensions.top ||
      e.clientY > dialogDimensions.bottom
    ) {
      modal.close();
      renderSavedBookmarks();
    }
  });

  document.addEventListener("bookmarksVisibilityChanged", async (e) => {
    if (e.detail.isEnabled) {
      section.classList.remove("hidden");
    } else {
      section.classList.add("hidden");
    }
  });
}

// --- Storage Handlers ---

async function getSavedBookmarks() {
  if (typeof chrome !== "undefined" && chrome.storage) {
    const data = await chrome.storage.local.get([STORAGE_KEY]);
    return data[STORAGE_KEY] || [];
  }
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

async function saveBookmarks(bookmarks) {
  if (typeof chrome !== "undefined" && chrome.storage) {
    await chrome.storage.local.set({ [STORAGE_KEY]: bookmarks });
  } else {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
  }
}

async function syncVisibility() {
  const section = document.getElementById("bookmarks-section");
  let isEnabled = true;

  if (typeof chrome !== "undefined" && chrome.storage) {
    const data = await chrome.storage.local.get([SETTINGS_KEY]);
    if (data[SETTINGS_KEY] !== undefined) isEnabled = data[SETTINGS_KEY];
  } else {
    const data = localStorage.getItem(SETTINGS_KEY);
    if (data !== null) isEnabled = JSON.parse(data);
  }

  if (isEnabled) {
    section.classList.remove("hidden");
  } else {
    section.classList.add("hidden");
  }
}

// --- Main UI Renderer ---

async function renderSavedBookmarks() {
  const list = document.getElementById("bookmarks-list");
  const countSpan = document.getElementById("bookmarks-count");
  const openBtn = document.getElementById("btn-open-bookmarks-modal");

  const bookmarks = await getSavedBookmarks();

  countSpan.textContent = `${bookmarks.length}/${MAX_BOOKMARKS}`;

  // Hide add button if limit reached
  if (openBtn) {
    openBtn.style.display = bookmarks.length >= MAX_BOOKMARKS ? "none" : "flex";
  }

  list.innerHTML = "";

  if (bookmarks.length === 0) {
    list.innerHTML =
      '<li style="grid-column: 1 / -1; text-align: center; opacity: 0.6; padding: 1rem;">No links selected. Click Add to select from your bookmarks.</li>';
    return;
  }

  bookmarks.forEach((bm) => {
    const li = document.createElement("li");
    li.className = "bookmarks__item";

    li.innerHTML = `
            <a href="${bm.url}" class="bookmarks__link" title="${bm.title}">
                <img src="https://www.google.com/s2/favicons?domain=${bm.url}&sz=32" alt="" class="bookmarks__icon" loading="lazy">
                <span>${bm.title}</span>
            </a>
            <button class="bookmarks__delete" aria-label="Remove bookmark" data-id="${bm.id}">
                <i class="bi bi-x-circle-fill"></i>
            </button>
        `;

    li.querySelector(".bookmarks__delete").addEventListener(
      "click",
      async () => {
        let current = await getSavedBookmarks();
        current = current.filter((b) => b.id !== bm.id);
        await saveBookmarks(current);
        await renderSavedBookmarks();
      },
    );

    list.appendChild(li);
  });
}

// --- Modal Tree Logic ---

async function populateModalTree() {
  const body = document.getElementById("bookmarks-modal-body");
  const saved = await getSavedBookmarks();
  const savedIds = saved.map((b) => b.id);

  if (typeof chrome !== "undefined" && chrome.bookmarks) {
    chrome.bookmarks.getTree((tree) => {
      body.innerHTML = "";
      const treeEl = buildTreeNodes(tree[0].children, savedIds);
      body.appendChild(treeEl);
    });
  } else {
    body.innerHTML =
      '<p style="text-align:center; color:#ff6b6b; padding:1rem;">Bookmarks API is only available inside the Chrome Extension.</p>';
  }
}

function buildTreeNodes(nodes, savedIds) {
  const ul = document.createElement("ul");
  ul.className = "bm-tree";

  nodes.forEach((node) => {
    const li = document.createElement("li");

    if (node.children) {
      // It's a folder
      const details = document.createElement("details");
      const summary = document.createElement("summary");
      summary.innerHTML = `<i class="bi bi-folder-fill" style="color: #ffd166;"></i> ${node.title || "Folder"}`;
      details.appendChild(summary);

      // Recursively build children
      if (node.children.length > 0) {
        details.appendChild(buildTreeNodes(node.children, savedIds));
      } else {
        const empty = document.createElement("div");
        empty.className = "bm-tree__empty";
        empty.textContent = "(Empty)";
        details.appendChild(empty);
      }
      li.appendChild(details);
    } else if (node.url) {
      // It's a link
      const label = document.createElement("label");
      label.className = "bm-tree__node";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = savedIds.includes(node.id);

      // Handle Checking/Unchecking
      checkbox.addEventListener("change", async (e) => {
        const isChecked = e.target.checked;
        let currentSaved = await getSavedBookmarks();

        if (isChecked) {
          if (currentSaved.length >= MAX_BOOKMARKS) {
            e.target.checked = false; // revert
            alert(`You can only select up to ${MAX_BOOKMARKS} quick links.`);
            return;
          }
          currentSaved.push({ id: node.id, title: node.title, url: node.url });
        } else {
          currentSaved = currentSaved.filter((b) => b.id !== node.id);
        }

        await saveBookmarks(currentSaved);
        // Update counter in main UI live behind the modal
        const countSpan = document.getElementById("bookmarks-count");
        if (countSpan)
          countSpan.textContent = `${currentSaved.length}/${MAX_BOOKMARKS}`;
      });

      label.appendChild(checkbox);

      const img = document.createElement("img");
      img.src = `https://www.google.com/s2/favicons?domain=${node.url}&sz=16`;
      img.width = 16;
      img.height = 16;
      label.appendChild(img);

      const textSpan = document.createElement("span");
      textSpan.textContent = node.title || node.url;
      label.appendChild(textSpan);

      li.appendChild(label);
    }

    // Don't append completely empty root folders without names
    if (node.title || node.url) {
      ul.appendChild(li);
    }
  });

  return ul;
}
