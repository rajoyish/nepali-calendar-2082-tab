import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sourceDir = path.join(__dirname, "../src/data/calendar-2083");
const publicDir = path.join(__dirname, "../public");
const outputFile = path.join(publicDir, "calendar-data.json");
const calendarYear = "२०८३";

function buildCalendarData() {
  try {
    const files = fs
      .readdirSync(sourceDir)
      .filter((file) => file.endsWith(".json"));

    files.sort((a, b) => {
      const numA = parseInt(a.split("-")[0], 10);
      const numB = parseInt(b.split("-")[0], 10);
      return numA - numB;
    });

    const monthsData = [];

    files.forEach((file) => {
      const filePath = path.join(sourceDir, file);
      const fileContent = fs.readFileSync(filePath, "utf8");
      const monthData = JSON.parse(fileContent);
      monthsData.push(monthData);
    });

    const finalData = {
      yearNp: calendarYear,
      months: monthsData,
    };

    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    fs.writeFileSync(outputFile, JSON.stringify(finalData, null, 2), "utf8");
    console.log(`Successfully built calendar-data.json into the public folder with ${monthsData.length} months.`);
  } catch (error) {
    console.error(error);
  }
}

buildCalendarData();