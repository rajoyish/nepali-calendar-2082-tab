import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup for ES modules to get __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define paths (Adjust these if you place the script in the root directory instead of /scripts)
const sourceDir = path.join(__dirname, '../src/data/calendar-2083');
const outputFile = path.join(__dirname, '../src/data/calendar-data.json');
const calendarYear = "२०८३"; 

function buildCalendarData() {
  try {
    // 1. Get all JSON files from the directory
    const files = fs.readdirSync(sourceDir).filter(file => file.endsWith('.json'));

    // 2. Sort files numerically based on their prefix (1-, 2-, ..., 10-, 11-, 12-)
    // This ensures '10-magh' doesn't accidentally come before '2-jeth'
    files.sort((a, b) => {
      const numA = parseInt(a.split('-')[0], 10);
      const numB = parseInt(b.split('-')[0], 10);
      return numA - numB;
    });

    const monthsData = [];

    // 3. Read and parse each file
    files.forEach(file => {
      const filePath = path.join(sourceDir, file);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const monthData = JSON.parse(fileContent);
      monthsData.push(monthData);
    });

    // 4. Construct the final JSON structure
    const finalData = {
      year: calendarYear,
      months: monthsData
    };

    // 5. Write the compiled data to calendar-data.json
    fs.writeFileSync(outputFile, JSON.stringify(finalData, null, 2), 'utf8');

    console.log(`✅ Successfully built calendar-data.json with ${monthsData.length} months.`);
  } catch (error) {
    console.error("❌ Error building calendar data:", error);
  }
}

buildCalendarData();