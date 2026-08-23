import { GrahaName } from '../types/astrology';
import { convertADToBS, BSDate } from '../utils/nepaliCalendar';

export type DashaSystemType = 'vimshottari' | 'tribhagi' | 'yogini' | 'yoginiExtended';

export interface DashaLevelInfo {
  levelName: 'Mahadasha' | 'Antardasha' | 'Pratyantardasha' | 'Sookshma';
  planetName: string;
  planetNameNe: string;
  startDateAD: Date;
  endDateAD: Date;
  startDateBS: BSDate;
  endDateBS: BSDate;
  totalDurationDays: number;
  totalDurationYears: number;
  elapsedDaysFromTarget: number;
  remainingDaysFromTarget: number;
  remainingYMD: { years: number; months: number; days: number; formatted: string };
  elapsedYMD: { years: number; months: number; days: number; formatted: string };
}

export interface DetailedCurrentDashaResult {
  dashaSystem: DashaSystemType;
  targetDate: Date;
  bhuktaMode: 'subtracted' | 'unsubtracted'; // 'subtracted' = भुक्त काटिएको, 'unsubtracted' = भुक्त नकाटिएको
  janmaLordOrYogini: string;
  birthBalanceYears: number;
  mahadasha: DashaLevelInfo;
  antardasha: DashaLevelInfo;
  pratyantardasha: DashaLevelInfo;
  sookshmaDasha: DashaLevelInfo;
}

export const VIMSHOTTARI_PERIODS: Record<GrahaName, number> = {
  Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7, Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17,
};

export const DASHA_ORDER: GrahaName[] = [
  'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'
];

export const TRIBHAGI_PERIODS_80: Record<GrahaName, number> = {
  Ketu: 14 / 3, // 4.666y
  Venus: 40 / 3, // 13.333y
  Sun: 12 / 3, // 4.0y
  Moon: 20 / 3, // 6.666y
  Mars: 14 / 3, // 4.666y
  Rahu: 36 / 3, // 12.0y
  Jupiter: 32 / 3, // 10.666y
  Saturn: 38 / 3, // 12.666y
  Mercury: 34 / 3, // 11.333y
};

export const YOGINI_LIST_ORDER = [
  { nameEn: 'Mangala', nameNe: 'मङ्गला', ruler: 'Moon' as GrahaName, durationYears: 1 },
  { nameEn: 'Pingala', nameNe: 'पिङ्गला', ruler: 'Sun' as GrahaName, durationYears: 2 },
  { nameEn: 'Dhanya', nameNe: 'धन्या', ruler: 'Jupiter' as GrahaName, durationYears: 3 },
  { nameEn: 'Bhramari', nameNe: 'भ्रामरी', ruler: 'Mars' as GrahaName, durationYears: 4 },
  { nameEn: 'Bhadrika', nameNe: 'भद्रिका', ruler: 'Mercury' as GrahaName, durationYears: 5 },
  { nameEn: 'Ulka', nameNe: 'उल्का', ruler: 'Saturn' as GrahaName, durationYears: 6 },
  { nameEn: 'Siddha', nameNe: 'सिद्धा', ruler: 'Venus' as GrahaName, durationYears: 7 },
  { nameEn: 'Sankata', nameNe: 'सङ्कटा', ruler: 'Rahu' as GrahaName, durationYears: 8 },
];

export function daysToYMD(daysTotal: number): { years: number; months: number; days: number; formatted: string } {
  const safeDays = Math.max(0, daysTotal);
  const years = Math.floor(safeDays / 365.25);
  const remDays1 = safeDays - years * 365.25;
  const months = Math.floor(remDays1 / 30.4375);
  const days = Math.round(remDays1 - months * 30.4375);

  return {
    years,
    months,
    days,
    formatted: `${years}y ${months}m ${days}d`,
  };
}

export function calculateDetailedCurrentDasha(
  moonSiderealDeg: number,
  janmaLord: GrahaName,
  nakshatraIndex: number,
  utcBirthDate: Date,
  targetDate: Date = new Date(),
  dashaSystem: DashaSystemType = 'vimshottari',
  bhuktaMode: 'subtracted' | 'unsubtracted' = 'subtracted'
): DetailedCurrentDashaResult {
  const targetMs = targetDate.getTime();
  const birthMs = utcBirthDate.getTime();

  // Fraction of Nakshatra passed
  const nakDegree = moonSiderealDeg % 13.333333333333334;
  const fractionElapsed = nakDegree / 13.333333333333334;

  let currentMDName = '';
  let currentMDNameNe = '';
  let mdStart = new Date(birthMs);
  let mdEnd = new Date(birthMs);
  let mdTotalYears = 0;
  let birthBalanceYears = 0;

  if (dashaSystem === 'vimshottari' || dashaSystem === 'tribhagi') {
    const periods = dashaSystem === 'vimshottari' ? VIMSHOTTARI_PERIODS : TRIBHAGI_PERIODS_80;
    const startIndex = DASHA_ORDER.indexOf(janmaLord);
    const initialDur = periods[janmaLord];
    birthBalanceYears = initialDur * (1 - fractionElapsed);

    // Calculate timelines
    let cursor = new Date(birthMs);

    // First Mahadasha (Partial)
    const firstEndMs = cursor.getTime() + birthBalanceYears * 365.25 * 86400 * 1000;
    const firstEnd = new Date(firstEndMs);

    if (targetMs >= cursor.getTime() && targetMs < firstEndMs) {
      currentMDName = janmaLord;
      currentMDNameNe = janmaLord;
      mdStart = cursor;
      mdEnd = firstEnd;
      mdTotalYears = initialDur;
    } else {
      cursor = firstEnd;
      // Loop next dashas
      for (let i = 1; i < 50; i++) {
        const pName = DASHA_ORDER[(startIndex + i) % 9];
        const dur = periods[pName];
        const endMs = cursor.getTime() + dur * 365.25 * 86400 * 1000;
        const endDate = new Date(endMs);

        if (targetMs >= cursor.getTime() && targetMs < endMs) {
          currentMDName = pName;
          currentMDNameNe = pName;
          mdStart = new Date(cursor);
          mdEnd = endDate;
          mdTotalYears = dur;
          break;
        }
        cursor = endDate;
      }
    }
  } else {
    // Yogini (36y) or Yogini Extended (72y)
    const yoginiIndex = (nakshatraIndex + 1 + 3) % 8;
    const janmaYogini = YOGINI_LIST_ORDER[yoginiIndex];
    const initialDur = janmaYogini.durationYears;
    birthBalanceYears = initialDur * (1 - fractionElapsed);

    let cursor = new Date(birthMs);
    const firstEndMs = cursor.getTime() + birthBalanceYears * 365.25 * 86400 * 1000;
    const firstEnd = new Date(firstEndMs);

    if (targetMs >= cursor.getTime() && targetMs < firstEndMs) {
      currentMDName = `${janmaYogini.nameEn} (${janmaYogini.ruler})`;
      currentMDNameNe = `${janmaYogini.nameNe} (${janmaYogini.ruler})`;
      mdStart = cursor;
      mdEnd = firstEnd;
      mdTotalYears = initialDur;
    } else {
      cursor = firstEnd;
      const maxCycles = dashaSystem === 'yoginiExtended' ? 16 : 8;
      for (let i = 1; i < maxCycles; i++) {
        const yInfo = YOGINI_LIST_ORDER[(yoginiIndex + i) % 8];
        const dur = yInfo.durationYears;
        const endMs = cursor.getTime() + dur * 365.25 * 86400 * 1000;
        const endDate = new Date(endMs);

        if (targetMs >= cursor.getTime() && targetMs < endMs) {
          currentMDName = `${yInfo.nameEn} (${yInfo.ruler})`;
          currentMDNameNe = `${yInfo.nameNe} (${yInfo.ruler})`;
          mdStart = new Date(cursor);
          mdEnd = endDate;
          mdTotalYears = dur;
          break;
        }
        cursor = endDate;
      }
    }
  }

  // Fallback if targetDate exceeds cycle bounds
  if (!currentMDName) {
    currentMDName = janmaLord;
    currentMDNameNe = janmaLord;
    mdStart = new Date(birthMs);
    mdEnd = new Date(birthMs + 120 * 365.25 * 86400 * 1000);
    mdTotalYears = 120;
  }

  // Helper to construct DashaLevelInfo
  const buildLevelInfo = (
    levelName: 'Mahadasha' | 'Antardasha' | 'Pratyantardasha' | 'Sookshma',
    pName: string,
    pNameNe: string,
    startAD: Date,
    endAD: Date
  ): DashaLevelInfo => {
    const totalDays = Math.max(1, (endAD.getTime() - startAD.getTime()) / (1000 * 86400));
    const elapsedDays = Math.max(0, (targetMs - startAD.getTime()) / (1000 * 86400));
    const remainingDays = Math.max(0, (endAD.getTime() - targetMs) / (1000 * 86400));

    return {
      levelName,
      planetName: pName,
      planetNameNe: pNameNe,
      startDateAD: startAD,
      endDateAD: endAD,
      startDateBS: convertADToBS(startAD),
      endDateBS: convertADToBS(endAD),
      totalDurationDays: totalDays,
      totalDurationYears: totalDays / 365.25,
      elapsedDaysFromTarget: elapsedDays,
      remainingDaysFromTarget: remainingDays,
      remainingYMD: daysToYMD(remainingDays),
      elapsedYMD: daysToYMD(elapsedDays),
    };
  };

  const mdInfo = buildLevelInfo('Mahadasha', currentMDName, currentMDNameNe, mdStart, mdEnd);

  // Antardasha (AD) Subdivision
  const mdSpanMs = mdEnd.getTime() - mdStart.getTime();
  let adStart = new Date(mdStart.getTime());
  let currentADName = currentMDName;
  let currentADNameNe = currentMDNameNe;
  let adEnd = new Date(mdEnd.getTime());

  if (dashaSystem === 'vimshottari' || dashaSystem === 'tribhagi') {
    const mdLord = currentMDName as GrahaName;
    const startIndex = DASHA_ORDER.indexOf(mdLord);
    const totalCycleYears = dashaSystem === 'vimshottari' ? 120 : 80;

    let adCursorMs = mdStart.getTime();
    for (let i = 0; i < 9; i++) {
      const adLord = DASHA_ORDER[(startIndex + i) % 9];
      const adYears = (VIMSHOTTARI_PERIODS[mdLord] * VIMSHOTTARI_PERIODS[adLord]) / totalCycleYears;
      const adDurationMs = adYears * 365.25 * 86400 * 1000;
      const adEndMs = adCursorMs + adDurationMs;

      if (targetMs >= adCursorMs && targetMs < adEndMs) {
        currentADName = adLord;
        currentADNameNe = adLord;
        adStart = new Date(adCursorMs);
        adEnd = new Date(adEndMs);
        break;
      }
      adCursorMs = adEndMs;
    }
  } else {
    // Yogini AD division into 8 sub-yoginis
    let adCursorMs = mdStart.getTime();
    const mdDurationMs = mdEnd.getTime() - mdStart.getTime();
    for (let i = 0; i < 8; i++) {
      const subYogini = YOGINI_LIST_ORDER[i];
      const subRatio = subYogini.durationYears / 36;
      const adDurationMs = mdDurationMs * subRatio;
      const adEndMs = adCursorMs + adDurationMs;

      if (targetMs >= adCursorMs && targetMs < adEndMs) {
        currentADName = `${subYogini.nameEn} (${subYogini.ruler})`;
        currentADNameNe = `${subYogini.nameNe} (${subYogini.ruler})`;
        adStart = new Date(adCursorMs);
        adEnd = new Date(adEndMs);
        break;
      }
      adCursorMs = adEndMs;
    }
  }

  const adInfo = buildLevelInfo('Antardasha', currentADName, currentADNameNe, adStart, adEnd);

  // Pratyantardasha (PD) Subdivision
  const adSpanMs = adEnd.getTime() - adStart.getTime();
  let pdStart = new Date(adStart.getTime());
  let currentPDName = currentADName;
  let currentPDNameNe = currentADNameNe;
  let pdEnd = new Date(adEnd.getTime());

  if (dashaSystem === 'vimshottari' || dashaSystem === 'tribhagi') {
    const adLord = (currentADName in VIMSHOTTARI_PERIODS ? currentADName : DASHA_ORDER[0]) as GrahaName;
    const startIndex = DASHA_ORDER.indexOf(adLord);

    let pdCursorMs = adStart.getTime();
    for (let i = 0; i < 9; i++) {
      const pdLord = DASHA_ORDER[(startIndex + i) % 9];
      const pdRatio = VIMSHOTTARI_PERIODS[pdLord] / 120;
      const pdDurationMs = adSpanMs * pdRatio;
      const pdEndMs = pdCursorMs + pdDurationMs;

      if (targetMs >= pdCursorMs && targetMs < pdEndMs) {
        currentPDName = pdLord;
        currentPDNameNe = pdLord;
        pdStart = new Date(pdCursorMs);
        pdEnd = new Date(pdEndMs);
        break;
      }
      pdCursorMs = pdEndMs;
    }
  } else {
    let pdCursorMs = adStart.getTime();
    for (let i = 0; i < 8; i++) {
      const subYogini = YOGINI_LIST_ORDER[i];
      const pdDurationMs = adSpanMs * (subYogini.durationYears / 36);
      const pdEndMs = pdCursorMs + pdDurationMs;

      if (targetMs >= pdCursorMs && targetMs < pdEndMs) {
        currentPDName = `${subYogini.nameEn} (${subYogini.ruler})`;
        currentPDNameNe = `${subYogini.nameNe} (${subYogini.ruler})`;
        pdStart = new Date(pdCursorMs);
        pdEnd = new Date(pdEndMs);
        break;
      }
      pdCursorMs = pdEndMs;
    }
  }

  const pdInfo = buildLevelInfo('Pratyantardasha', currentPDName, currentPDNameNe, pdStart, pdEnd);

  // Sookshma Dasha Subdivision
  const pdSpanMs = pdEnd.getTime() - pdStart.getTime();
  let sdStart = new Date(pdStart.getTime());
  let currentSDName = currentPDName;
  let currentSDNameNe = currentPDNameNe;
  let sdEnd = new Date(pdEnd.getTime());

  if (dashaSystem === 'vimshottari' || dashaSystem === 'tribhagi') {
    const pdLord = (currentPDName in VIMSHOTTARI_PERIODS ? currentPDName : DASHA_ORDER[0]) as GrahaName;
    const startIndex = DASHA_ORDER.indexOf(pdLord);

    let sdCursorMs = pdStart.getTime();
    for (let i = 0; i < 9; i++) {
      const sdLord = DASHA_ORDER[(startIndex + i) % 9];
      const sdRatio = VIMSHOTTARI_PERIODS[sdLord] / 120;
      const sdDurationMs = pdSpanMs * sdRatio;
      const sdEndMs = sdCursorMs + sdDurationMs;

      if (targetMs >= sdCursorMs && targetMs < sdEndMs) {
        currentSDName = sdLord;
        currentSDNameNe = sdLord;
        sdStart = new Date(sdCursorMs);
        sdEnd = new Date(sdEndMs);
        break;
      }
      sdCursorMs = sdEndMs;
    }
  } else {
    sdStart = pdStart;
    sdEnd = pdEnd;
  }

  const sdInfo = buildLevelInfo('Sookshma', currentSDName, currentSDNameNe, sdStart, sdEnd);

  return {
    dashaSystem,
    targetDate,
    bhuktaMode,
    janmaLordOrYogini: currentMDName,
    birthBalanceYears,
    mahadasha: mdInfo,
    antardasha: adInfo,
    pratyantardasha: pdInfo,
    sookshmaDasha: sdInfo,
  };
}
