import { defineConfig } from "vite";
import fs from "fs";
import path from "path";

function serveDebugJson() {
  return {
    name: "serve-debug-json",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use("/debug-calendar.json", (req, res) => {
        const filePath = path.resolve(__dirname, "src/data/calendar-data.json");
        if (fs.existsSync(filePath)) {
          res.setHeader("Content-Type", "application/json");
          res.end(fs.readFileSync(filePath, "utf-8"));
        } else {
          res.statusCode = 404;
          res.end(JSON.stringify({ error: "calendar-data.json not found" }));
        }
      });

      const originalPrintUrls = server.printUrls;
      server.printUrls = () => {
        originalPrintUrls();
        const url = server.resolvedUrls?.local[0] || "http://localhost:5173/";
        console.log(
          `  \x1b[36m➜\x1b[0m  \x1b[1mDebug JSON\x1b[0m: \x1b[36m${url}debug-calendar.json\x1b[0m`,
        );
      };
    },
  };
}

export default defineConfig({
  base: "./",
  build: {
    outDir: "chrome-extension",
    emptyOutDir: true,
  },
  plugins: [serveDebugJson()],
});
