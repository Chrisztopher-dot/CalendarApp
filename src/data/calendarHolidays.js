import { getSwedishDayInfo } from './swedishCalendar.js';
import { getUSDayInfo } from './usHolidays.js';

export function getDayCalendarInfo(date, lang = 'sv') {
  if (lang === 'en') {
    const info = getUSDayInfo(date);
    return {
      ...info,
      flag: '🇺🇸',
      holidayTypeLabel: info.isRedDay ? 'Federal Holiday' : info.isEve ? 'Observance' : null
    };
  } else {
    const info = getSwedishDayInfo(date);
    return {
      ...info,
      flag: '🇸🇪',
      holidayTypeLabel: info.isRedDay ? 'Röd dag' : info.isEve ? 'Afton' : null
    };
  }
}
