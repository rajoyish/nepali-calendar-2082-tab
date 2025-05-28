Is the `data-todays-date-np` and `data-month-year-indicator` attributes are dynametically generated?  Add English 2 months based on Nepali Calendar in  `data-month-year-indicator` along with Nepali Month and year separated by `|`


Let's make the `month-view` dynamic. Track the `data-np-date`, `data-np-month-year` find out the Nepali the `todayNp.month_np` value from the `nepaliCalendar.js` file to find out the current month. We are going to render all the dates from this month from data store in the `calendar-data.json` Check the `nepaliWeekday.js`, `renderMonthGrid.js` and `initMonthView.js` files to get the rendering logic. After knowing the current Nepali Month, we have to render all the dates from the `calendar-data.json` file of current month. We are generating 35 column cells with the `month-view__date` class. Nepali month's days are maxium 32 days: Here are the detailed array:
```
[
  { "en": 1, "np": "१" },
  { "en": 2, "np": "२" },
  { "en": 3, "np": "३" },
  { "en": 4, "np": "४" },
  { "en": 5, "np": "५" },
  { "en": 6, "np": "६" },
  { "en": 7, "np": "७" },
  { "en": 8, "np": "८" },
  { "en": 9, "np": "९" },
  { "en": 10, "np": "१०" },
  { "en": 11, "np": "११" },
  { "en": 12, "np": "१२" },
  { "en": 13, "np": "१३" },
  { "en": 14, "np": "१४" },
  { "en": 15, "np": "१५" },
  { "en": 16, "np": "१६" },
  { "en": 17, "np": "१७" },
  { "en": 18, "np": "१८" },
  { "en": 19, "np": "१९" },
  { "en": 20, "np": "२०" },
  { "en": 21, "np": "२१" },
  { "en": 22, "np": "२२" },
  { "en": 23, "np": "२३" },
  { "en": 24, "np": "२४" },
  { "en": 25, "np": "२५" },
  { "en": 26, "np": "२६" },
  { "en": 27, "np": "२७" },
  { "en": 28, "np": "२८" },
  { "en": 29, "np": "२९" },
  { "en": 30, "np": "३०" },
  { "en": 31, "np": "३१" },
  { "en": 32, "np": "३२" }
]
```
Nepali week starts in `Sunday` which is `आइतबार` in Nepali. How can correctly render all the dates based on the data provided in `calendar-data.json` ? Rendering attributes are as follows:
```
"date_en" => data-month-view-date-en
"date_np" => data-month-view-date-np
"tithi" => data-month-view-tithi
```
Check all attached files or see repo: https://github.com/rajoyish/nepali-calendar-2082-tab . Give full code.


We are rendering the full month calender in the `month-view-calendar-root` from the index html.