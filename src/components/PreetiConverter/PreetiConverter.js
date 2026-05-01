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
              <svg fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="preeti-app__copy-icon"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5A3.375 3.375 0 0 0 6.375 7.5H5.25m11.9-3.664A2.251 2.251 0 0 0 15 2.25h-1.5a2.251 2.251 0 0 0-2.15 1.586m5.8 0c.065.21.1.433.1.664v.75h-6V4.5c0-.231.035-.454.1-.664M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V16.5a9 9 0 0 0-9-9Z" /></svg>
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
    if (alertTimeout) clearTimeout(alertTimeout);
    alertTimeout = setTimeout(() => {
      dom.alert.classList.remove("preeti-app__alert--visible");
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
