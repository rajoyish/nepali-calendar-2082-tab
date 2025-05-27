import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest);
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

function removeRecursiveSync(target) {
  if (!fs.existsSync(target)) return;
  const stat = fs.statSync(target);
  if (stat.isDirectory()) {
    fs.readdirSync(target).forEach((file) => {
      removeRecursiveSync(path.join(target, file));
    });
    fs.rmdirSync(target);
  } else {
    fs.unlinkSync(target);
  }
}

const distDir = path.resolve(__dirname, "../dist");
const extDir = path.resolve(__dirname, "../chrome-extension");
const faviconsDir = path.resolve(__dirname, "../public/favicons");
const manifestSrc = path.resolve(__dirname, "../manifest.json");
const manifestDest = path.join(extDir, "manifest.json");
const iconSrc = path.resolve(__dirname, "../icon-128.png");
const iconDest = path.join(extDir, "icon-128.png");

// 1. Ensure chrome-extension/ exists
if (!fs.existsSync(extDir)) {
  fs.mkdirSync(extDir);
}

// 2. Remove old build files from chrome-extension/ (but NOT manifest.json or icon-128.png)
fs.readdirSync(distDir).forEach((item) => {
  const extItem = path.join(extDir, item);
  if (fs.existsSync(extItem)) {
    removeRecursiveSync(extItem);
  }
});

// 3. Copy dist/ to chrome-extension/
copyRecursiveSync(distDir, extDir);

// 4. Copy favicons from public/favicons/ to chrome-extension/ root
if (fs.existsSync(faviconsDir)) {
  fs.readdirSync(faviconsDir).forEach((file) => {
    const srcFile = path.join(faviconsDir, file);
    const destFile = path.join(extDir, file);
    fs.copyFileSync(srcFile, destFile);
  });
  console.log("Copied favicons to chrome-extension/");
} else {
  console.log("No favicons directory found in public/");
}

// 5. Copy manifest.json to chrome-extension/
if (fs.existsSync(manifestSrc)) {
  fs.copyFileSync(manifestSrc, manifestDest);
}

// 6. Copy icon-128.png to chrome-extension/
if (fs.existsSync(iconSrc)) {
  fs.copyFileSync(iconSrc, iconDest);
}

console.log("Copied build output to chrome-extension/");
