/**
 * US Holidays Module
 * Calculates all official US Federal Holidays and notable American cultural observances.
 */

function getNthDayOfMonth(year, month, dayOfWeek, n) {
  // dayOfWeek: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  // month: 0-indexed (0 = Jan)
  const firstDay = new Date(Date.UTC(year, month, 1));
  let dayOffset = (dayOfWeek - firstDay.getUTCDay() + 7) % 7;
  let targetDate = 1 + dayOffset + (n - 1) * 7;
  return new Date(Date.UTC(year, month, targetDate));
}

function getLastDayOfMonth(year, month, dayOfWeek) {
  // Last day of month
  const lastDate = new Date(Date.UTC(year, month + 1, 0));
  let dayOffset = (lastDate.getUTCDay() - dayOfWeek + 7) % 7;
  let targetDate = lastDate.getUTCDate() - dayOffset;
  return new Date(Date.UTC(year, month, targetDate));
}

function formatDateKey(date) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getUSHolidaysForYear(year) {
  const holidays = {};

  const addHoliday = (dateStr, name, isFederal = true, isObservance = false) => {
    holidays[dateStr] = {
      name,
      isFederal,
      isObservance
    };
  };

  // Fixed Federal Holidays
  addHoliday(`${year}-01-01`, "New Year's Day", true);
  addHoliday(`${year}-06-19`, "Juneteenth National Independence Day", true);
  addHoliday(`${year}-07-04`, "Independence Day (4th of July)", true);
  addHoliday(`${year}-11-11`, "Veterans Day", true);
  addHoliday(`${year}-12-25`, "Christmas Day", true);

  // Floating Federal Holidays
  // Martin Luther King Jr. Day: 3rd Monday in January
  const mlk = getNthDayOfMonth(year, 0, 1, 3);
  addHoliday(formatDateKey(mlk), "Martin Luther King Jr. Day", true);

  // Presidents' Day (Washington's Birthday): 3rd Monday in February
  const presidentsDay = getNthDayOfMonth(year, 1, 1, 3);
  addHoliday(formatDateKey(presidentsDay), "Presidents' Day", true);

  // Memorial Day: Last Monday in May
  const memorialDay = getLastDayOfMonth(year, 4, 1);
  addHoliday(formatDateKey(memorialDay), "Memorial Day", true);

  // Labor Day: 1st Monday in September
  const laborDay = getNthDayOfMonth(year, 8, 1, 1);
  addHoliday(formatDateKey(laborDay), "Labor Day", true);

  // Columbus Day / Indigenous Peoples' Day: 2nd Monday in October
  const columbusDay = getNthDayOfMonth(year, 9, 1, 2);
  addHoliday(formatDateKey(columbusDay), "Columbus Day / Indigenous Peoples' Day", true);

  // Thanksgiving Day: 4th Thursday in November
  const thanksgiving = getNthDayOfMonth(year, 10, 4, 4);
  addHoliday(formatDateKey(thanksgiving), "Thanksgiving Day", true);
  
  // Black Friday: Day after Thanksgiving
  const blackFriday = new Date(thanksgiving);
  blackFriday.setUTCDate(blackFriday.getUTCDate() + 1);
  addHoliday(formatDateKey(blackFriday), "Day After Thanksgiving", false, true);

  // Notable American Cultural Observances
  addHoliday(`${year}-02-14`, "Valentine's Day", false, true);
  addHoliday(`${year}-03-17`, "St. Patrick's Day", false, true);
  addHoliday(`${year}-10-31`, "Halloween", false, true);
  addHoliday(`${year}-12-24`, "Christmas Eve", false, true);
  addHoliday(`${year}-12-31`, "New Year's Eve", false, true);

  return holidays;
}

const usCache = {};

export function getUSDayInfo(inputDate) {
  let year, monthStr, dayStr, dateKey;

  if (typeof inputDate === 'string') {
    const parts = inputDate.split('-');
    year = parseInt(parts[0], 10);
    monthStr = parts[1].padStart(2, '0');
    dayStr = parts[2].padStart(2, '0');
    dateKey = `${year}-${monthStr}-${dayStr}`;
  } else {
    year = inputDate.getFullYear();
    monthStr = String(inputDate.getMonth() + 1).padStart(2, '0');
    dayStr = String(inputDate.getDate()).padStart(2, '0');
    dateKey = `${year}-${monthStr}-${dayStr}`;
  }

  if (!usCache[year]) {
    usCache[year] = getUSHolidaysForYear(year);
  }

  const holidayInfo = usCache[year][dateKey] || null;

  return {
    dateKey,
    nameDay: null, // US calendar does not have official name days
    holiday: holidayInfo ? holidayInfo.name : null,
    isRedDay: holidayInfo ? holidayInfo.isFederal : false,
    isEve: holidayInfo ? holidayInfo.isObservance : false
  };
}
