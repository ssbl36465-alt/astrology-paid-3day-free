import { GrahaName } from '../types/astrology';
import { convertADToBS, BSDate } from '../utils/nepaliCalendar';
import { GRAHA_MAP } from '../utils/i18n';

export interface TribhagiMahadasha {
  planet: GrahaName;
  planetNe: string;
  startDate: Date;
  endDate: Date;
  startDateBS: BSDate;
  endDateBS: BSDate;
  startDateFormattedAD: string;
  endDateFormattedAD: string;
  startDateFormattedBS: string;
  endDateFormattedBS: string;
  durationYears: number;
  fullPeriodYMD: TimeYMD;
  bhuktaYMD: TimeYMD;
  bhogyaYMD: TimeYMD;
  isCurrent: boolean;
  remainingTimeFormatted?: string;
  remainingYMD?: TimeYMD;
}

export interface TribhagiDashaResult {
  birthBalanceYears: number;
  startingLord: GrahaName;
  currentMahadasha: GrahaName;
  currentMahadashaItem?: TribhagiMahadasha;
  isBhuktaDeducted: boolean;
  mahadashas: TribhagiMahadasha[];
}

export interface YoginiMahadasha {
  yoginiName: string;
  yoginiNameNe: string;
  ruler: GrahaName;
  cycleNumber: number;
  startDate: Date;
  endDate: Date;
  startDateBS: BSDate;
  endDateBS: BSDate;
  startDateFormattedAD: string;
  endDateFormattedAD: string;
  startDateFormattedBS: string;
  endDateFormattedBS: string;
  durationYears: number;
  fullPeriodYMD: TimeYMD;
  bhuktaYMD: TimeYMD;
  bhogyaYMD: TimeYMD;
  isCurrent: boolean;
  remainingTimeFormatted?: string;
  remainingYMD?: TimeYMD;
}

export interface YoginiDashaResult {
  birthBalanceYears: number;
  startingYogini: string;
  startingYoginiNe: string;
  currentYogini: string;
  currentYoginiItem?: YoginiMahadasha;
  isBhuktaDeducted: boolean;
  mahadashas: YoginiMahadasha[];
}

export interface ArcDMS {
  degrees: number;
  minutes: number;
  seconds: number;
  totalDecimalDegrees: number;
  formatted: string;
}

export interface TimeYMD {
  years: number;
  months: number;
  days: number;
  totalDecimalYears: number;
  formatted: string;
}

export interface BhuktaBhogyaData {
  nakshatraNameEn: string;
  nakshatraNameNe: string;
  nakshatraIndex: number;
  totalSpanArc: ArcDMS;
  bhuktaArc: ArcDMS; // Arc elapsed
  bhogyaArc: ArcDMS; // Arc balance
  bhuktaPercentage: number;
  bhogyaPercentage: number;

  vimshottari: {
    startingLord: GrahaName;
    totalDashaYears: number;
    bhuktaTime: TimeYMD;
    bhogyaTime: TimeYMD;
  };
  tribhagi: {
    startingLord: GrahaName;
    totalDashaYears: number;
    bhuktaTime: TimeYMD;
    bhogyaTime: TimeYMD;
  };
  yogini: {
    startingYogini: string;
    ruler: GrahaName;
    totalDashaYears: number;
    bhuktaTime: TimeYMD;
    bhogyaTime: TimeYMD;
  };
}

export const TRIBHAGI_PERIODS: Record<GrahaName, number> = {
  Ketu: (7 * 2) / 3, // 4.6666667 yrs (4y 8m)
  Venus: (20 * 2) / 3, // 13.3333333 yrs (13y 4m)
  Sun: (6 * 2) / 3, // 4.0 yrs
  Moon: (10 * 2) / 3, // 6.6666667 yrs (6y 8m)
  Mars: (7 * 2) / 3, // 4.6666667 yrs (4y 8m)
  Rahu: (18 * 2) / 3, // 12.0 yrs
  Jupiter: (16 * 2) / 3, // 10.6666667 yrs (10y 8m)
  Saturn: (19 * 2) / 3, // 12.6666667 yrs (12y 8m)
  Mercury: (17 * 2) / 3, // 11.3333333 yrs (11y 4m)
};

export const DASHA_ORDER: GrahaName[] = [
  'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'
];

export interface YoginiInfo {
  nameEn: string;
  nameNe: string;
  ruler: GrahaName;
  durationYears: number;
}

export const YOGINI_LIST: YoginiInfo[] = [
  { nameEn: 'Mangala', nameNe: 'मङ्गला', ruler: 'Moon', durationYears: 1 },
  { nameEn: 'Pingala', nameNe: 'पिङ्गला', ruler: 'Sun', durationYears: 2 },
  { nameEn: 'Dhanya', nameNe: 'धन्या', ruler: 'Jupiter', durationYears: 3 },
  { nameEn: 'Bhramari', nameNe: 'भ्रामरी', ruler: 'Mars', durationYears: 4 },
  { nameEn: 'Bhadrika', nameNe: 'भद्रिका', ruler: 'Mercury', durationYears: 5 },
  { nameEn: 'Ulka', nameNe: 'उल्का', ruler: 'Saturn', durationYears: 6 },
  { nameEn: 'Siddha', nameNe: 'सिद्धा', ruler: 'Venus', durationYears: 7 },
  { nameEn: 'Sankata', nameNe: 'सङ्कटा', ruler: 'Rahu', durationYears: 8 },
];

export function decimalDegToDMS(deg: number): ArcDMS {
  const d = Math.floor(deg);
  const minFloat = (deg - d) * 60;
  const m = Math.floor(minFloat);
  const s = Math.round((minFloat - m) * 60);

  const pad = (n: number) => n.toString().padStart(2, '0');
  return {
    degrees: d,
    minutes: m,
    seconds: s,
    totalDecimalDegrees: deg,
    formatted: `${d}° ${pad(m)}' ${pad(s)}"`,
  };
}

export function decimalYearsToYMD(yearsDecimal: number): TimeYMD {
  const y = Math.floor(yearsDecimal);
  const monthsFloat = (yearsDecimal - y) * 12;
  const m = Math.floor(monthsFloat);
  const days = Math.round((monthsFloat - m) * 30.4375); // Average month length

  return {
    years: y,
    months: m,
    days,
    totalDecimalYears: yearsDecimal,
    formatted: `${y} yrs ${m} mos ${days} days`,
  };
}

// 1. Tribhagi Dasha Calculation (80-Year Total Cycle)
export function calculateTribhagiDasha(
  moonSiderealDeg: number,
  janmaRuler: GrahaName,
  utcBirthDate: Date,
  isBhuktaDeducted: boolean = true
): TribhagiDashaResult {
  const startIndex = DASHA_ORDER.indexOf(janmaRuler);
  const nakDegree = moonSiderealDeg % 13.333333333333334;
  const fractionElapsed = nakDegree / 13.333333333333334;

  const fullDuration = TRIBHAGI_PERIODS[janmaRuler];
  const bhuktaYears = fullDuration * fractionElapsed;
  const birthBalanceYears = fullDuration * (1 - fractionElapsed);

  const mahadashas: TribhagiMahadasha[] = [];
  const now = new Date();

  let currentStart: Date;
  let firstItemDurationYears: number;

  if (isBhuktaDeducted) {
    currentStart = new Date(utcBirthDate.getTime());
    firstItemDurationYears = birthBalanceYears;
  } else {
    // Bhukta not deducted: Start Date = utcBirthDate - bhuktaYears
    const startMs = utcBirthDate.getTime() - bhuktaYears * 365.25 * 86400 * 1000;
    currentStart = new Date(startMs);
    firstItemDurationYears = fullDuration;
  }

  const firstEndMs = currentStart.getTime() + firstItemDurationYears * 365.25 * 86400 * 1000;
  const firstEndDate = new Date(firstEndMs);
  const isFirstCurrent = now >= currentStart && now <= firstEndDate;

  let currentMahadasha = janmaRuler;
  let currentMahadashaItem: TribhagiMahadasha | undefined = undefined;

  const startBS0 = convertADToBS(currentStart);
  const endBS0 = convertADToBS(firstEndDate);
  const fullYMD0 = decimalYearsToYMD(fullDuration);
  const bhuktaYMD0 = decimalYearsToYMD(bhuktaYears);
  const bhogyaYMD0 = decimalYearsToYMD(birthBalanceYears);

  let remStr0: string | undefined = undefined;
  let remYMD0: TimeYMD | undefined = undefined;

  if (isFirstCurrent) {
    currentMahadasha = janmaRuler;
    const diffMs = firstEndDate.getTime() - now.getTime();
    if (diffMs > 0) {
      remYMD0 = decimalYearsToYMD(diffMs / (365.25 * 86400 * 1000));
      remStr0 = `${remYMD0.years} वर्ष ${remYMD0.months} महिना ${remYMD0.days} दिन`;
    } else {
      remStr0 = 'सम्पन्न (Completed)';
    }
  }

  const item0: TribhagiMahadasha = {
    planet: janmaRuler,
    planetNe: GRAHA_MAP[janmaRuler]?.ne || janmaRuler,
    startDate: new Date(currentStart),
    endDate: firstEndDate,
    startDateBS: startBS0,
    endDateBS: endBS0,
    startDateFormattedAD: currentStart.toISOString().split('T')[0],
    endDateFormattedAD: firstEndDate.toISOString().split('T')[0],
    startDateFormattedBS: startBS0.formatted,
    endDateFormattedBS: endBS0.formatted,
    durationYears: firstItemDurationYears,
    fullPeriodYMD: fullYMD0,
    bhuktaYMD: bhuktaYMD0,
    bhogyaYMD: bhogyaYMD0,
    isCurrent: isFirstCurrent,
    remainingTimeFormatted: remStr0,
    remainingYMD: remYMD0,
  };

  mahadashas.push(item0);
  if (isFirstCurrent) {
    currentMahadashaItem = item0;
  }

  currentStart = firstEndDate;

  // Next 8 full Mahadashas (completing the full 80-year cycle across 9 planets)
  for (let idx = 1; idx < 9; idx++) {
    const pName = DASHA_ORDER[(startIndex + idx) % 9];
    const dur = TRIBHAGI_PERIODS[pName];
    const endMs = currentStart.getTime() + dur * 365.25 * 86400 * 1000;
    const endDate = new Date(endMs);

    const isCurrent = now >= currentStart && now <= endDate;
    if (isCurrent) {
      currentMahadasha = pName;
    }

    const startBS = convertADToBS(currentStart);
    const endBS = convertADToBS(endDate);
    const fullYMD = decimalYearsToYMD(dur);
    const bhuktaYMD = decimalYearsToYMD(0);
    const bhogyaYMD = decimalYearsToYMD(dur);

    let remStr: string | undefined = undefined;
    let remYMD: TimeYMD | undefined = undefined;

    if (isCurrent) {
      const diffMs = endDate.getTime() - now.getTime();
      if (diffMs > 0) {
        remYMD = decimalYearsToYMD(diffMs / (365.25 * 86400 * 1000));
        remStr = `${remYMD.years} वर्ष ${remYMD.months} महिना ${remYMD.days} दिन`;
      } else {
        remStr = 'सम्पन्न (Completed)';
      }
    }

    const item: TribhagiMahadasha = {
      planet: pName,
      planetNe: GRAHA_MAP[pName]?.ne || pName,
      startDate: new Date(currentStart),
      endDate,
      startDateBS: startBS,
      endDateBS: endBS,
      startDateFormattedAD: currentStart.toISOString().split('T')[0],
      endDateFormattedAD: endDate.toISOString().split('T')[0],
      startDateFormattedBS: startBS.formatted,
      endDateFormattedBS: endBS.formatted,
      durationYears: dur,
      fullPeriodYMD: fullYMD,
      bhuktaYMD: bhuktaYMD,
      bhogyaYMD: bhogyaYMD,
      isCurrent,
      remainingTimeFormatted: remStr,
      remainingYMD: remYMD,
    };

    mahadashas.push(item);
    if (isCurrent) {
      currentMahadashaItem = item;
    }

    currentStart = endDate;
  }

  // Fallback active item if none matched
  if (!currentMahadashaItem && mahadashas.length > 0) {
    currentMahadashaItem = mahadashas.find((m) => m.isCurrent) || mahadashas[0];
  }

  return {
    birthBalanceYears,
    startingLord: janmaRuler,
    currentMahadasha,
    currentMahadashaItem,
    isBhuktaDeducted,
    mahadashas,
  };
}

// 2. Yogini Dasha Calculation (72-Year Extended Cycle: 2 x 36 Years)
export function calculateYoginiDasha(
  moonSiderealDeg: number,
  nakshatraIndex: number,
  utcBirthDate: Date,
  isBhuktaDeducted: boolean = true
): YoginiDashaResult {
  const yoginiIndex = (nakshatraIndex + 1 + 3) % 8;
  const janmaYogini = YOGINI_LIST[yoginiIndex];

  const nakDegree = moonSiderealDeg % 13.333333333333334;
  const fractionElapsed = nakDegree / 13.333333333333334;
  const fullDuration = janmaYogini.durationYears;
  const bhuktaYears = fullDuration * fractionElapsed;
  const birthBalanceYears = fullDuration * (1 - fractionElapsed);

  const mahadashas: YoginiMahadasha[] = [];
  const now = new Date();

  let currentStart: Date;
  let firstItemDurationYears: number;

  if (isBhuktaDeducted) {
    currentStart = new Date(utcBirthDate.getTime());
    firstItemDurationYears = birthBalanceYears;
  } else {
    // Start Date = utcBirthDate - bhuktaYears
    const startMs = utcBirthDate.getTime() - bhuktaYears * 365.25 * 86400 * 1000;
    currentStart = new Date(startMs);
    firstItemDurationYears = fullDuration;
  }

  const firstEndMs = currentStart.getTime() + firstItemDurationYears * 365.25 * 86400 * 1000;
  const firstEndDate = new Date(firstEndMs);
  const isFirstCurrent = now >= currentStart && now <= firstEndDate;

  let currentYogini = janmaYogini.nameEn;
  let currentYoginiItem: YoginiMahadasha | undefined = undefined;

  const startBS0 = convertADToBS(currentStart);
  const endBS0 = convertADToBS(firstEndDate);
  const fullYMD0 = decimalYearsToYMD(fullDuration);
  const bhuktaYMD0 = decimalYearsToYMD(bhuktaYears);
  const bhogyaYMD0 = decimalYearsToYMD(birthBalanceYears);

  let remStr0: string | undefined = undefined;
  let remYMD0: TimeYMD | undefined = undefined;

  if (isFirstCurrent) {
    currentYogini = janmaYogini.nameEn;
    const diffMs = firstEndDate.getTime() - now.getTime();
    if (diffMs > 0) {
      remYMD0 = decimalYearsToYMD(diffMs / (365.25 * 86400 * 1000));
      remStr0 = `${remYMD0.years} वर्ष ${remYMD0.months} महिना ${remYMD0.days} दिन`;
    } else {
      remStr0 = 'सम्पन्न (Completed)';
    }
  }

  const item0: YoginiMahadasha = {
    yoginiName: janmaYogini.nameEn,
    yoginiNameNe: janmaYogini.nameNe,
    ruler: janmaYogini.ruler,
    cycleNumber: 1,
    startDate: new Date(currentStart),
    endDate: firstEndDate,
    startDateBS: startBS0,
    endDateBS: endBS0,
    startDateFormattedAD: currentStart.toISOString().split('T')[0],
    endDateFormattedAD: firstEndDate.toISOString().split('T')[0],
    startDateFormattedBS: startBS0.formatted,
    endDateFormattedBS: endBS0.formatted,
    durationYears: firstItemDurationYears,
    fullPeriodYMD: fullYMD0,
    bhuktaYMD: bhuktaYMD0,
    bhogyaYMD: bhogyaYMD0,
    isCurrent: isFirstCurrent,
    remainingTimeFormatted: remStr0,
    remainingYMD: remYMD0,
  };

  mahadashas.push(item0);
  if (isFirstCurrent) {
    currentYoginiItem = item0;
  }

  currentStart = firstEndDate;

  // 16 Yoginis in total across two 36-year repeating cycles (72 years total)
  for (let idx = 1; idx < 16; idx++) {
    const yInfo = YOGINI_LIST[(yoginiIndex + idx) % 8];
    const dur = yInfo.durationYears;
    const endMs = currentStart.getTime() + dur * 365.25 * 86400 * 1000;
    const endDate = new Date(endMs);

    const isCurrent = now >= currentStart && now <= endDate;
    if (isCurrent) {
      currentYogini = yInfo.nameEn;
    }

    const startBS = convertADToBS(currentStart);
    const endBS = convertADToBS(endDate);
    const fullYMD = decimalYearsToYMD(dur);
    const bhuktaYMD = decimalYearsToYMD(0);
    const bhogyaYMD = decimalYearsToYMD(dur);

    let remStr: string | undefined = undefined;
    let remYMD: TimeYMD | undefined = undefined;

    if (isCurrent) {
      const diffMs = endDate.getTime() - now.getTime();
      if (diffMs > 0) {
        remYMD = decimalYearsToYMD(diffMs / (365.25 * 86400 * 1000));
        remStr = `${remYMD.years} वर्ष ${remYMD.months} महिना ${remYMD.days} दिन`;
      } else {
        remStr = 'सम्पन्न (Completed)';
      }
    }

    const cycleNumber = idx < 8 ? 1 : 2;

    const item: YoginiMahadasha = {
      yoginiName: yInfo.nameEn,
      yoginiNameNe: yInfo.nameNe,
      ruler: yInfo.ruler,
      cycleNumber,
      startDate: new Date(currentStart),
      endDate,
      startDateBS: startBS,
      endDateBS: endBS,
      startDateFormattedAD: currentStart.toISOString().split('T')[0],
      endDateFormattedAD: endDate.toISOString().split('T')[0],
      startDateFormattedBS: startBS.formatted,
      endDateFormattedBS: endBS.formatted,
      durationYears: dur,
      fullPeriodYMD: fullYMD,
      bhuktaYMD: bhuktaYMD,
      bhogyaYMD: bhogyaYMD,
      isCurrent,
      remainingTimeFormatted: remStr,
      remainingYMD: remYMD,
    };

    mahadashas.push(item);
    if (isCurrent) {
      currentYoginiItem = item;
    }

    currentStart = endDate;
  }

  if (!currentYoginiItem && mahadashas.length > 0) {
    currentYoginiItem = mahadashas.find((m) => m.isCurrent) || mahadashas[0];
  }

  return {
    birthBalanceYears,
    startingYogini: janmaYogini.nameEn,
    startingYoginiNe: janmaYogini.nameNe,
    currentYogini,
    currentYoginiItem,
    isBhuktaDeducted,
    mahadashas,
  };
}

// 3. Bhukta & Bhogya Calculation
export function calculateBhuktaBhogya(
  moonSiderealDeg: number,
  nakshatraNameEn: string,
  nakshatraNameNe: string,
  nakshatraIndex: number,
  janmaRuler: GrahaName
): BhuktaBhogyaData {
  const nakDegree = moonSiderealDeg % 13.333333333333334;
  const bhuktaDeg = nakDegree;
  const bhogyaDeg = 13.333333333333334 - nakDegree;

  const fractionElapsed = bhuktaDeg / 13.333333333333334;
  const fractionRemaining = bhogyaDeg / 13.333333333333334;

  const totalSpanArc = decimalDegToDMS(13.333333333333334);
  const bhuktaArc = decimalDegToDMS(bhuktaDeg);
  const bhogyaArc = decimalDegToDMS(bhogyaDeg);

  // Vimshottari
  const VIMSHOTTARI_FULL_PERIODS: Record<GrahaName, number> = {
    Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7, Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17
  };
  const vTotal = VIMSHOTTARI_FULL_PERIODS[janmaRuler];
  const vBhukta = decimalYearsToYMD(vTotal * fractionElapsed);
  const vBhogya = decimalYearsToYMD(vTotal * fractionRemaining);

  // Tribhagi
  const tTotal = TRIBHAGI_PERIODS[janmaRuler];
  const tBhukta = decimalYearsToYMD(tTotal * fractionElapsed);
  const tBhogya = decimalYearsToYMD(tTotal * fractionRemaining);

  // Yogini
  const yoginiIndex = (nakshatraIndex + 1 + 3) % 8;
  const janmaYogini = YOGINI_LIST[yoginiIndex];
  const yTotal = janmaYogini.durationYears;
  const yBhukta = decimalYearsToYMD(yTotal * fractionElapsed);
  const yBhogya = decimalYearsToYMD(yTotal * fractionRemaining);

  return {
    nakshatraNameEn,
    nakshatraNameNe,
    nakshatraIndex,
    totalSpanArc,
    bhuktaArc,
    bhogyaArc,
    bhuktaPercentage: fractionElapsed * 100,
    bhogyaPercentage: fractionRemaining * 100,
    vimshottari: {
      startingLord: janmaRuler,
      totalDashaYears: vTotal,
      bhuktaTime: vBhukta,
      bhogyaTime: vBhogya,
    },
    tribhagi: {
      startingLord: janmaRuler,
      totalDashaYears: tTotal,
      bhuktaTime: tBhukta,
      bhogyaTime: tBhogya,
    },
    yogini: {
      startingYogini: janmaYogini.nameEn,
      ruler: janmaYogini.ruler,
      totalDashaYears: yTotal,
      bhuktaTime: yBhukta,
      bhogyaTime: yBhogya,
    },
  };
}
