// Persian calendar utilities
export const persianMonths = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
];

export const persianDays = [
  'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه'
];

// Convert Gregorian to Persian date
export const gregorianToPersian = (gregorianDate: Date): { year: number; month: number; day: number } => {
  const gy = gregorianDate.getFullYear();
  const gm = gregorianDate.getMonth() + 1;
  const gd = gregorianDate.getDate();

  let jy, jm, jd;

  if (gy <= 1600) {
    jy = 0;
    gy -= 621;
  } else {
    jy = 979;
    gy -= 1600;
  }

  if (gm > 2) {
    const gy2 = gy + 1;
  } else {
    const gy2 = gy;
  }

  const days = (365 * gy) + (Math.floor((gy2 + 3) / 4)) + (Math.floor((gy2 + 99) / 100)) - 
               (Math.floor((gy2 + 399) / 400)) - 80 + gd + 
               [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334][gm - 1];

  jy += 33 * Math.floor(days / 12053);
  days %= 12053;

  jy += 4 * Math.floor(days / 1461);
  days %= 1461;

  if (days >= 366) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }

  if (days < 186) {
    jm = 1 + Math.floor(days / 31);
    jd = 1 + (days % 31);
  } else {
    jm = 7 + Math.floor((days - 186) / 30);
    jd = 1 + ((days - 186) % 30);
  }

  return { year: jy, month: jm, day: jd };
};

// Convert Persian to Gregorian date
export const persianToGregorian = (jy: number, jm: number, jd: number): Date => {
  let gy, gm, gd;

  if (jy <= 979) {
    gy = 1600;
    jy -= 979;
  } else {
    gy = 621;
    jy -= 979;
  }

  if (jm < 7) {
    const days = (jm - 1) * 31 + jd - 1;
  } else {
    const days = (jm - 7) * 30 + jd + 185;
  }

  const totalDays = (365 * jy) + (Math.floor(jy / 33) * 8) + 
                    (Math.floor(((jy % 33) + 3) / 4)) + 78 + days;

  gy += 400 * Math.floor(totalDays / 146097);
  let remainingDays = totalDays % 146097;

  let leap = true;
  if (remainingDays >= 36525) {
    remainingDays--;
    gy += 100 * Math.floor(remainingDays / 36524);
    remainingDays %= 36524;
    if (remainingDays >= 365) remainingDays++;
  }

  gy += 4 * Math.floor(remainingDays / 1461);
  remainingDays %= 1461;

  if (remainingDays >= 366) {
    leap = false;
    remainingDays--;
    gy += Math.floor(remainingDays / 365);
    remainingDays = remainingDays % 365;
  }

  const sal_a = [0, 31, ((leap) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  gm = 0;
  while (gm < 13 && remainingDays >= sal_a[gm]) {
    remainingDays -= sal_a[gm];
    gm++;
  }

  if (gm > 12) {
    gm = 12;
    remainingDays = sal_a[12] - 1;
  }

  gd = remainingDays + 1;

  return new Date(gy, gm - 1, gd);
};

// Format Persian date for display
export const formatPersianDate = (date: Date): string => {
  const persian = gregorianToPersian(date);
  return `${persian.year}/${persian.month.toString().padStart(2, '0')}/${persian.day.toString().padStart(2, '0')}`;
};

// Format Persian date with month name
export const formatPersianDateWithMonth = (date: Date): string => {
  const persian = gregorianToPersian(date);
  return `${persian.day} ${persianMonths[persian.month - 1]} ${persian.year}`;
};

// Get today's date in Persian format for input default
export const getTodayPersianForInput = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// Convert Persian input to Gregorian for storage
export const parsePersianDateInput = (persianDateString: string): string => {
  if (!persianDateString) return '';
  
  const [year, month, day] = persianDateString.split('-').map(Number);
  if (!year || !month || !day) return persianDateString;
  
  const gregorianDate = persianToGregorian(year, month, day);
  return gregorianDate.toISOString().split('T')[0];
};

// Convert Gregorian date to Persian for input display
export const formatDateForPersianInput = (gregorianDateString: string): string => {
  if (!gregorianDateString) return '';
  
  const date = new Date(gregorianDateString);
  const persian = gregorianToPersian(date);
  return `${persian.year}-${persian.month.toString().padStart(2, '0')}-${persian.day.toString().padStart(2, '0')}`;
};

// Simple Persian date formatter (more accurate implementation)
export const toJalali = (date: Date): string => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    calendar: 'persian',
    numberingSystem: 'latn'
  };
  
  try {
    return new Intl.DateTimeFormat('fa-IR-u-ca-persian-nu-latn', options).format(date);
  } catch {
    // Fallback to manual conversion if Intl doesn't support Persian calendar
    return formatPersianDate(date);
  }
};

// Convert Persian date string to Gregorian Date object
export const fromJalali = (jalaliString: string): Date => {
  if (!jalaliString) return new Date();
  
  const parts = jalaliString.split(/[-/]/);
  if (parts.length !== 3) return new Date();
  
  const [year, month, day] = parts.map(Number);
  return persianToGregorian(year, month, day);
};