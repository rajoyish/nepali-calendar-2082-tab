import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  build: {
    outDir: "chrome-extension",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
      },
    },
  },
});