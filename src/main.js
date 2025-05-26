import "./style.css";

import { renderNepalTime } from "./nepalTime.js";
import { renderTodayNepaliDate } from "./nepaliCalendar.js";

renderNepalTime();
renderTodayNepaliDate();

setInterval(renderNepalTime, 1000);
setInterval(renderTodayNepaliDate, 60 * 1000);
