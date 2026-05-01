import "./PreetiConverter.css";
import { convertToUnicode } from "./converter.js";

export const initPreetiConverter = (containerId) => {
  const container = document.getElementById(containerId);
  if (!container) return;

  let cursorPosition = 0;
  let alertTimeout = null;
  let dom = {};

  const render = () => {
    container.innerHTML = `
      <div class="preeti-app__alert" id="copyAlert" role="alert">
        <span>👍 Copied to clipboard!</span>
      </div>
      <section class="container-xl preeti-app glass">
        <div class="preeti-app__input-group">
          <textarea id="preetiInput" class="preeti-app__textarea preeti-app__textarea--source" placeholder="oxfF k|Llt jf gful/s kmG6df n]Vg&quot;xf];\\ ." spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="off"></textarea>
        </div>
        <div class="preeti-app__toolbar" id="charToolbar">
          <button type="button" class="preeti-app__char-btn" data-char="ङ">ङ</button>
          <button type="button" class="preeti-app__char-btn" data-char="क्ष">क्ष</button>
          <button type="button" class="preeti-app__char-btn" data-char="फ्">फ्</button>
          <button type="button" class="preeti-app__char-btn" data-char="झ्">झ्</button>
          <button type="button" class="preeti-app__char-btn" data-char="घ्">घ्</button>
          <button type="button" class="preeti-app__char-btn" data-char="ऱ्">ऱ्</button>
          <button type="button" class="preeti-app__char-btn" data-char="–">–</button>
          <button type="button" class="preeti-app__char-btn" data-char="—">—</button>
          <button type="button" class="preeti-app__char-btn" data-char="‘ ’">‘ ’</button>
          <button type="button" class="preeti-app__char-btn" data-char="“ ”">“ ”</button>
          <button type="button" class="preeti-app__char-btn" data-char="ईं">ईं</button>
          <button type="button" class="preeti-app__char-btn" data-char="ौँ">ौँ</button>
          <button type="button" class="preeti-app__char-btn" data-char="त्त्">त्त्</button>
          <button type="button" class="preeti-app__char-btn" data-char="ऽ">ऽ</button>
          <button type="button" class="preeti-app__char-btn" data-char="ॐ">ॐ</button>
          <button type="button" class="preeti-app__char-btn" data-char="॥">॥</button>
        </div>
        <div class="preeti-app__input-group">
          <textarea id="unicodeOutput" class="preeti-app__textarea preeti-app__textarea--target" placeholder="यहाँ यूनिकोड नेपालीमा रुपान्तरण हुनेछ ।" readonly></textarea>
          <div class="preeti-app__copy-bar">
            <button id="copyBtn" type="button" class="preeti-app__copy-btn">
              <i class="bi bi-clipboard copy-icon-default"></i>
              <i class="bi bi-clipboard-check copy-icon-active"></i>
            </button>
          </div>
        </div>
      </section>
    `;
  };

  const cacheDOM = () => {
    dom = {
      input: document.getElementById("preetiInput"),
      output: document.getElementById("unicodeOutput"),
      toolbar: document.getElementById("charToolbar"),
      copyBtn: document.getElementById("copyBtn"),
      alert: document.getElementById("copyAlert"),
    };
  };

  const syncOutput = () => {
    dom.output.value = convertToUnicode(dom.input.value);
  };

  const handleCursorUpdate = () => {
    cursorPosition = dom.input.selectionStart;
  };

  const handleInput = () => {
    handleCursorUpdate();
    localStorage.setItem("preetiInput", dom.input.value);
    syncOutput();
  };

  const handleToolbarClick = (event) => {
    const btn = event.target.closest(".preeti-app__char-btn");
    if (!btn) return;

    const charToInsert = btn.dataset.char;
    const currentVal = dom.input.value;

    const before = currentVal.substring(0, cursorPosition);
    const after = currentVal.substring(cursorPosition);

    dom.input.value = before + charToInsert + after;
    cursorPosition += charToInsert.length;

    dom.input.focus();
    dom.input.setSelectionRange(cursorPosition, cursorPosition);

    localStorage.setItem("preetiInput", dom.input.value);
    syncOutput();
  };

  const showAlert = () => {
    dom.alert.classList.add("preeti-app__alert--visible");
    dom.copyBtn.classList.add("is-copied");
    if (alertTimeout) clearTimeout(alertTimeout);
    alertTimeout = setTimeout(() => {
      dom.alert.classList.remove("preeti-app__alert--visible");
      dom.copyBtn.classList.remove("is-copied");
    }, 3000);
  };

  const handleCopyClick = () => {
    if (!dom.output.value) return;
    navigator.clipboard.writeText(dom.output.value).then(showAlert);
  };

  const bindEvents = () => {
    dom.input.addEventListener("input", handleInput);
    dom.input.addEventListener("click", handleCursorUpdate);
    dom.input.addEventListener("keyup", handleCursorUpdate);
    dom.toolbar.addEventListener("click", handleToolbarClick);
    dom.copyBtn.addEventListener("click", handleCopyClick);
  };

  const initializeState = () => {
    const savedInput = localStorage.getItem("preetiInput") || "";
    if (savedInput) {
      dom.input.value = savedInput;
      syncOutput();
    }
  };

  const destroy = () => {
    if (dom.input) {
      dom.input.removeEventListener("input", handleInput);
      dom.input.removeEventListener("click", handleCursorUpdate);
      dom.input.removeEventListener("keyup", handleCursorUpdate);
    }
    if (dom.toolbar)
      dom.toolbar.removeEventListener("click", handleToolbarClick);
    if (dom.copyBtn) dom.copyBtn.removeEventListener("click", handleCopyClick);
    if (alertTimeout) clearTimeout(alertTimeout);
    container.innerHTML = "";
    dom = null;
  };

  render();
  cacheDOM();
  bindEvents();
  initializeState();

  return { destroy };
};
