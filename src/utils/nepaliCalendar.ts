import NepaliDate from 'nepali-date-converter';

export interface BSDate {
  year: number;
  month: number; // 1 to 12
  day: number; // 1 to 32
  monthNameNp: string;
  monthNameEn: string;
  formatted: string;
}

export const NEPALI_MONTHS_NP = [
  'वैशाख', 'जेठ', 'असार', 'साउन', 'भदौ', 'असोज',
  'कात्तिक', 'मंसिर', 'पुस', 'माघ', 'फागुन', 'चैत'
];

export const NEPALI_MONTHS_EN = [
  'Baishakh', 'Jestha', 'Ashadh', 'Shrawan', 'Bhadra', 'Ashwin',
  'Kartik', 'Mangsir', 'Poush', 'Magh', 'Falgun', 'Chaitra'
];

export function getDaysInBSMonth(bsYear: number, bsMonthIndex: number): number {
  try {
    for (let d = 32; d >= 28; d--) {
      try {
        const nd = new NepaliDate(bsYear, bsMonthIndex, d);
        if (nd.getYear() === bsYear && nd.getMonth() === bsMonthIndex) {
          return d;
        }
      } catch (e) {
        // continue
      }
    }
    return 30;
  } catch (e) {
    return 30;
  }
}

export function convertADToBS(adDate: Date): BSDate {
  try {
    const safeDate = (!adDate || isNaN(adDate.getTime())) ? new Date() : adDate;
    const yearAD = safeDate.getFullYear();

    if (yearAD >= 1943 && yearAD <= 2033) {
      const nd = new NepaliDate(safeDate);
      const year = nd.getYear();
      const monthIndex = nd.getMonth(); // 0-11
      const day = nd.getDate(); // 1-32

      const monthNp = NEPALI_MONTHS_NP[monthIndex] || 'वैशाख';
      const monthEn = NEPALI_MONTHS_EN[monthIndex] || 'Baishakh';
      const pad = (n: number) => n.toString().padStart(2, '0');
      const formatted = `${year}-${pad(monthIndex + 1)}-${pad(day)} BS (${monthNp} ${day}, ${year})`;

      return {
        year,
        month: monthIndex + 1,
        day,
        monthNameNp: monthNp,
        monthNameEn: monthEn,
        formatted,
      };
    } else {
      const approxBSYear = yearAD + 57;
      const monthIndex = safeDate.getMonth();
      const day = safeDate.getDate();
      const monthNp = NEPALI_MONTHS_NP[monthIndex] || 'वैशाख';
      const monthEn = NEPALI_MONTHS_EN[monthIndex] || 'Baishakh';
      const pad = (n: number) => n.toString().padStart(2, '0');
      const formatted = `${approxBSYear}-${pad(monthIndex + 1)}-${pad(day)} BS (${monthNp} ${day}, ${approxBSYear})`;

      return {
        year: approxBSYear,
        month: monthIndex + 1,
        day,
        monthNameNp: monthNp,
        monthNameEn: monthEn,
        formatted,
      };
    }
  } catch (e) {
    return {
      year: 2052,
      month: 7,
      day: 8,
      monthNameNp: 'कात्तिक',
      monthNameEn: 'Kartik',
      formatted: '2052-07-08 BS',
    };
  }
}

export function convertBSToAD(bsYear: number, bsMonth: number, bsDay: number): Date {
  try {
    const validYear = bsYear || 2052;
    const validMonth = (bsMonth >= 1 && bsMonth <= 12) ? bsMonth - 1 : 0;
    const validDay = bsDay || 1;

    if (validYear >= 2000 && validYear <= 2090) {
      const nd = new NepaliDate(validYear, validMonth, validDay);
      return nd.toJsDate();
    } else {
      const adYear = validYear - 57;
      return new Date(adYear, validMonth, validDay);
    }
  } catch (e) {
    return new Date(1995, 9, 24);
  }
}

export function formatDualDate(date: Date): { ad: string; bs: string; dualFormatted: string } {
  const safeDate = (!date || isNaN(date.getTime())) ? new Date() : date;
  const adFormatted = formatADDateString(safeDate);
  const bsDate = convertADToBS(safeDate);
  return {
    ad: adFormatted,
    bs: bsDate.formatted,
    dualFormatted: `${adFormatted} AD / ${bsDate.year}-${bsDate.month.toString().padStart(2, '0')}-${bsDate.day.toString().padStart(2, '0')} BS (${bsDate.monthNameNp})`,
  };
}

export function formatADDateString(date: Date): string {
  if (!date || isNaN(date.getTime())) return '1995-10-24';
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function calculateExactAge(birthAdDate: Date): {
  bsYears: number;
  bsMonths: number;
  bsDays: number;
  adYears: number;
  adMonths: number;
  adDays: number;
  bsAgeFormatted: string;
  adAgeFormatted: string;
} {
  try {
    const today = new Date();
    const birthBs = convertADToBS(birthAdDate);
    const todayBs = convertADToBS(today);

    let years = todayBs.year - birthBs.year;
    let months = todayBs.month - birthBs.month;
    let days = todayBs.day - birthBs.day;

    if (days < 0) {
      months -= 1;
      const prevMonth = todayBs.month === 1 ? 12 : todayBs.month - 1;
      const prevYear = todayBs.month === 1 ? todayBs.year - 1 : todayBs.year;
      const daysInPrev = getDaysInBSMonth(prevYear, prevMonth - 1);
      days += daysInPrev;
    }

    if (months < 0) {
      years -= 1;
      months += 12;
    }

    let adYears = today.getFullYear() - birthAdDate.getFullYear();
    let adMonths = today.getMonth() - birthAdDate.getMonth();
    let adDays = today.getDate() - birthAdDate.getDate();

    if (adDays < 0) {
      adMonths -= 1;
      const prevAdMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      adDays += prevAdMonth.getDate();
    }
    if (adMonths < 0) {
      adYears -= 1;
      adMonths += 12;
    }

    const bsAgeFormatted = `${years} वर्ष ${months} महिना ${days} दिन`;
    const adAgeFormatted = `${adYears} years ${adMonths} months ${adDays} days`;

    return {
      bsYears: years,
      bsMonths: months,
      bsDays: days,
      adYears,
      adMonths,
      adDays,
      bsAgeFormatted,
      adAgeFormatted,
    };
  } catch (e) {
    return {
      bsYears: 0,
      bsMonths: 0,
      bsDays: 0,
      adYears: 0,
      adMonths: 0,
      adDays: 0,
      bsAgeFormatted: '0 वर्ष 0 महिना 0 दिन',
      adAgeFormatted: '0 years 0 months 0 days',
    };
  }
}

const NAKSHATRA_NAMAKSHARA: string[][] = [
  ['चु', 'चे', 'चो', 'ला'],      // 1. Ashwini
  ['ली', 'लू', 'ले', 'लो'],      // 2. Bharani
  ['अ', 'ई', 'उ', 'ए'],         // 3. Krittika
  ['ओ', 'वा', 'वी', 'वू'],      // 4. Rohini
  ['वे', 'वो', 'का', 'की'],      // 5. Mrigashira
  ['कू', 'घ', 'ङ', 'छ'],        // 6. Ardra
  ['के', 'को', 'हा', 'ही'],      // 7. Punarvasu
  ['हू', 'हे', 'हो', 'डा'],      // 8. Pushya
  ['डी', 'डु', 'डे', 'डो'],      // 9. Ashlesha
  ['मा', 'मी', 'मू', 'मे'],      // 10. Magha
  ['मो', 'टा', 'टी', 'टू'],      // 11. Purva Phalguni
  ['टे', 'टो', 'पा', 'पी'],      // 12. Uttara Phalguni
  ['पू', 'ष', 'ण', 'ठ'],        // 13. Hasta
  ['पे', 'पो', 'रा', 'री'],      // 14. Chitra
  ['रू', 'रे', 'रो', 'ता'],      // 15. Swati
  ['ती', 'तू', 'ते', 'तो'],      // 16. Visakha
  ['ना', 'नी', 'नु', 'ने'],      // 17. Anuradha
  ['नो', 'या', 'यी', 'यू'],      // 18. Jyeshtha
  ['ये', 'यो', 'भा', 'भी'],      // 19. Mula
  ['भू', 'धा', 'फा', 'ढा'],      // 20. Purva Ashadha
  ['भे', 'भो', 'जा', 'जी'],      // 21. Uttara Ashadha
  ['खी', 'खू', 'खे', 'खो'],      // 22. Shravana
  ['गा', 'गी', 'गु', 'गे'],      // 23. Dhanistha
  ['गो', 'सा', 'सी', 'सु'],      // 24. Satabhisha
  ['से', 'सो', 'दा', 'दी'],      // 25. Purva Bhadrapada
  ['दू', 'थ', 'झ', 'ञ'],       // 26. Uttara Bhadrapada
  ['दे', 'दो', 'चा', 'ची'],      // 27. Revati
];

export function getNakshatraNamakshara(nakshatraIndex: number, pada: number): string {
  const nList = NAKSHATRA_NAMAKSHARA[nakshatraIndex];
  if (nList && pada >= 1 && pada <= 4) {
    return nList[pada - 1];
  }
  return '-';
}

const DEVA_NAKSHATRAS = [0, 4, 6, 7, 12, 13, 14, 16, 26];
const MANUSHYA_NAKSHATRAS = [1, 3, 5, 10, 11, 19, 20, 24, 25];
const RAKSHASA_NAKSHATRAS = [2, 8, 9, 15, 17, 18, 21, 22, 23];

export function getNakshatraGana(nakshatraIndex: number, isNe: boolean): string {
  if (DEVA_NAKSHATRAS.includes(nakshatraIndex)) {
    return isNe ? 'देव गण (Deva)' : 'Deva Gana';
  } else if (MANUSHYA_NAKSHATRAS.includes(nakshatraIndex)) {
    return isNe ? 'मनुष्य गण (Manushya)' : 'Manushya Gana';
  } else if (RAKSHASA_NAKSHATRAS.includes(nakshatraIndex)) {
    return isNe ? 'राक्षस गण (Rakshasa)' : 'Rakshasa Gana';
  }
  return isNe ? 'मनुष्य गण' : 'Manushya';
}
