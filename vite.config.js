import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  build: {
    outDir: "chrome-extension",
    emptyOutDir: true,
  },
});