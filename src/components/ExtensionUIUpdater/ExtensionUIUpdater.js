export function updateExtensionUI(fullDateString, dayNumber) {
  if (!fullDateString) return;

  document.title = `${fullDateString} | Tabre`;

  if (typeof chrome !== "undefined" && chrome.action) {
    chrome.action.setBadgeText({ text: "" });

    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#002b53";
    ctx.beginPath();
    ctx.roundRect(0, 0, 32, 32, 8);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 20px system-ui, -apple-system, sans-serif";

    ctx.fillText(String(dayNumber), 16, 17);

    const imageData = ctx.getImageData(0, 0, 32, 32);

    chrome.action.setIcon({ imageData: imageData });
    chrome.action.setTitle({ title: fullDateString });
  }
}
