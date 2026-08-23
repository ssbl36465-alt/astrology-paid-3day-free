import { GrahaName } from '../types/astrology';
import { convertADToBS, BSDate } from '../utils/nepaliCalendar';
import { GRAHA_MAP } from '../utils/i18n';
import { DASHA_ORDER, YOGINI_LIST, TRIBHAGI_PERIODS } from './dashaEngine';

export interface PratyantardashaPeriod {
  planet: GrahaName | string;
  planetNe: string;
  startDate: Date;
  endDate: Date;
  startDateBS: BSDate;
  endDateBS: BSDate;
  startDateFormattedAD: string;
  endDateFormattedAD: string;
  startDateFormattedBS: string;
  endDateFormattedBS: string;
  durationDays: number;
  isCurrent: boolean;
}

export interface AntardashaPeriod {
  planet: GrahaName | string;
  planetNe: string;
  startDate: Date;
  endDate: Date;
  startDateBS: BSDate;
  endDateBS: BSDate;
  startDateFormattedAD: string;
  endDateFormattedAD: string;
  startDateFormattedBS: string;
  endDateFormattedBS: string;
  durationMonths: number;
  pratyantardashas: PratyantardashaPeriod[];
  isCurrent: boolean;
}

export interface MahadashaWithSubperiods {
  planet: GrahaName | string;
  planetNe: string;
  ruler?: GrahaName;
  startDate: Date;
  endDate: Date;
  startDateBS: BSDate;
  endDateBS: BSDate;
  startDateFormattedAD: string;
  endDateFormattedAD: string;
  startDateFormattedBS: string;
  endDateFormattedBS: string;
  durationYears: number;
  antardashas: AntardashaPeriod[];
  isCurrent: boolean;
  cycleNumber?: number;
}

export const VIMSHOTTARI_FULL_PERIODS: Record<GrahaName, number> = {
  Ketu: 7,
  Venus: 20,
  Sun: 6,
  Moon: 10,
  Mars: 7,
  Rahu: 18,
  Jupiter: 16,
  Saturn: 19,
  Mercury: 17,
};

const MS_PER_YEAR = 365.25 * 86400 * 1000;

function formatAD(d: Date): string {
  if (!d || isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
}

// 1. Vimshottari Mahadasha + Antardasha + Pratyantardasha
export function calculateVimshottariSubperiods(
  moonSiderealDeg: number,
  janmaRuler: GrahaName,
  utcBirthDate: Date
): MahadashaWithSubperiods[] {
  const now = new Date();
  const nakDegree = moonSiderealDeg % 13.333333333333334;
  const fractionElapsed = nakDegree / 13.333333333333334;

  const janmaFullYears = VIMSHOTTARI_FULL_PERIODS[janmaRuler];
  const bhuktaYears = janmaFullYears * fractionElapsed;

  // Exact start time of the first full Mahadasha
  let currentMdStartMs = utcBirthDate.getTime() - bhuktaYears * MS_PER_YEAR;
  const mdStartIndex = DASHA_ORDER.indexOf(janmaRuler);

  const result: MahadashaWithSubperiods[] = [];

  for (let mIdx = 0; mIdx < 9; mIdx++) {
    const mdPlanet = DASHA_ORDER[(mdStartIndex + mIdx) % 9];
    const mdYears = VIMSHOTTARI_FULL_PERIODS[mdPlanet];
    const mdEndMs = currentMdStartMs + mdYears * MS_PER_YEAR;

    const mdStartDate = new Date(currentMdStartMs);
    const mdEndDate = new Date(mdEndMs);
    const isMdCurrent = now >= mdStartDate && now <= mdEndDate;

    const mdStartBS = convertADToBS(mdStartDate);
    const mdEndBS = convertADToBS(mdEndDate);

    // Compute Antardashas
    const antardashas: AntardashaPeriod[] = [];
    const adStartGrahaIndex = DASHA_ORDER.indexOf(mdPlanet);
    let currentAdStartMs = currentMdStartMs;

    for (let aIdx = 0; aIdx < 9; aIdx++) {
      const adPlanet = DASHA_ORDER[(adStartGrahaIndex + aIdx) % 9];
      const adYears = (mdYears * VIMSHOTTARI_FULL_PERIODS[adPlanet]) / 120;
      const adEndMs = currentAdStartMs + adYears * MS_PER_YEAR;

      const adStartDate = new Date(currentAdStartMs);
      const adEndDate = new Date(adEndMs);
      const isAdCurrent = now >= adStartDate && now <= adEndDate;

      const adStartBS = convertADToBS(adStartDate);
      const adEndBS = convertADToBS(adEndDate);

      // Compute Pratyantardashas
      const pratyantardashas: PratyantardashaPeriod[] = [];
      const padStartGrahaIndex = DASHA_ORDER.indexOf(adPlanet);
      let currentPadStartMs = currentAdStartMs;

      for (let pIdx = 0; pIdx < 9; pIdx++) {
        const padPlanet = DASHA_ORDER[(padStartGrahaIndex + pIdx) % 9];
        const padYears = (adYears * VIMSHOTTARI_FULL_PERIODS[padPlanet]) / 120;
        const padEndMs = currentPadStartMs + padYears * MS_PER_YEAR;

        const padStartDate = new Date(currentPadStartMs);
        const padEndDate = new Date(padEndMs);
        const isPadCurrent = now >= padStartDate && now <= padEndDate;

        const padStartBS = convertADToBS(padStartDate);
        const padEndBS = convertADToBS(padEndDate);

        pratyantardashas.push({
          planet: padPlanet,
          planetNe: GRAHA_MAP[padPlanet]?.ne || padPlanet,
          startDate: padStartDate,
          endDate: padEndDate,
          startDateBS: padStartBS,
          endDateBS: padEndBS,
          startDateFormattedAD: formatAD(padStartDate),
          endDateFormattedAD: formatAD(padEndDate),
          startDateFormattedBS: padStartBS.formatted,
          endDateFormattedBS: padEndBS.formatted,
          durationDays: Math.round(padYears * 365.25),
          isCurrent: isPadCurrent,
        });

        currentPadStartMs = padEndMs;
      }

      antardashas.push({
        planet: adPlanet,
        planetNe: GRAHA_MAP[adPlanet]?.ne || adPlanet,
        startDate: adStartDate,
        endDate: adEndDate,
        startDateBS: adStartBS,
        endDateBS: adEndBS,
        startDateFormattedAD: formatAD(adStartDate),
        endDateFormattedAD: formatAD(adEndDate),
        startDateFormattedBS: adStartBS.formatted,
        endDateFormattedBS: adEndBS.formatted,
        durationMonths: Math.round(adYears * 12 * 10) / 10,
        pratyantardashas,
        isCurrent: isAdCurrent,
      });

      currentAdStartMs = adEndMs;
    }

    result.push({
      planet: mdPlanet,
      planetNe: GRAHA_MAP[mdPlanet]?.ne || mdPlanet,
      startDate: mdStartDate,
      endDate: mdEndDate,
      startDateBS: mdStartBS,
      endDateBS: mdEndBS,
      startDateFormattedAD: formatAD(mdStartDate),
      endDateFormattedAD: formatAD(mdEndDate),
      startDateFormattedBS: mdStartBS.formatted,
      endDateFormattedBS: mdEndBS.formatted,
      durationYears: mdYears,
      antardashas,
      isCurrent: isMdCurrent,
    });

    currentMdStartMs = mdEndMs;
  }

  return result;
}

// 2. Tribhagi Mahadasha + Antardasha + Pratyantardasha (80 Years Cycle)
export function calculateTribhagiSubperiods(
  moonSiderealDeg: number,
  janmaRuler: GrahaName,
  utcBirthDate: Date
): MahadashaWithSubperiods[] {
  const now = new Date();
  const nakDegree = moonSiderealDeg % 13.333333333333334;
  const fractionElapsed = nakDegree / 13.333333333333334;

  const janmaTriYears = TRIBHAGI_PERIODS[janmaRuler];
  const bhuktaYears = janmaTriYears * fractionElapsed;

  let currentMdStartMs = utcBirthDate.getTime() - bhuktaYears * MS_PER_YEAR;
  const mdStartIndex = DASHA_ORDER.indexOf(janmaRuler);

  const result: MahadashaWithSubperiods[] = [];

  for (let mIdx = 0; mIdx < 9; mIdx++) {
    const mdPlanet = DASHA_ORDER[(mdStartIndex + mIdx) % 9];
    const mdYears = TRIBHAGI_PERIODS[mdPlanet];
    const mdEndMs = currentMdStartMs + mdYears * MS_PER_YEAR;

    const mdStartDate = new Date(currentMdStartMs);
    const mdEndDate = new Date(mdEndMs);
    const isMdCurrent = now >= mdStartDate && now <= mdEndDate;

    const mdStartBS = convertADToBS(mdStartDate);
    const mdEndBS = convertADToBS(mdEndDate);

    const antardashas: AntardashaPeriod[] = [];
    const adStartGrahaIndex = DASHA_ORDER.indexOf(mdPlanet);
    let currentAdStartMs = currentMdStartMs;

    for (let aIdx = 0; aIdx < 9; aIdx++) {
      const adPlanet = DASHA_ORDER[(adStartGrahaIndex + aIdx) % 9];
      const adYears = (mdYears * VIMSHOTTARI_FULL_PERIODS[adPlanet]) / 120;
      const adEndMs = currentAdStartMs + adYears * MS_PER_YEAR;

      const adStartDate = new Date(currentAdStartMs);
      const adEndDate = new Date(adEndMs);
      const isAdCurrent = now >= adStartDate && now <= adEndDate;

      const adStartBS = convertADToBS(adStartDate);
      const adEndBS = convertADToBS(adEndDate);

      const pratyantardashas: PratyantardashaPeriod[] = [];
      const padStartGrahaIndex = DASHA_ORDER.indexOf(adPlanet);
      let currentPadStartMs = currentAdStartMs;

      for (let pIdx = 0; pIdx < 9; pIdx++) {
        const padPlanet = DASHA_ORDER[(padStartGrahaIndex + pIdx) % 9];
        const padYears = (adYears * VIMSHOTTARI_FULL_PERIODS[padPlanet]) / 120;
        const padEndMs = currentPadStartMs + padYears * MS_PER_YEAR;

        const padStartDate = new Date(currentPadStartMs);
        const padEndDate = new Date(padEndMs);
        const isPadCurrent = now >= padStartDate && now <= padEndDate;

        const padStartBS = convertADToBS(padStartDate);
        const padEndBS = convertADToBS(padEndDate);

        pratyantardashas.push({
          planet: padPlanet,
          planetNe: GRAHA_MAP[padPlanet]?.ne || padPlanet,
          startDate: padStartDate,
          endDate: padEndDate,
          startDateBS: padStartBS,
          endDateBS: padEndBS,
          startDateFormattedAD: formatAD(padStartDate),
          endDateFormattedAD: formatAD(padEndDate),
          startDateFormattedBS: padStartBS.formatted,
          endDateFormattedBS: padEndBS.formatted,
          durationDays: Math.round(padYears * 365.25),
          isCurrent: isPadCurrent,
        });

        currentPadStartMs = padEndMs;
      }

      antardashas.push({
        planet: adPlanet,
        planetNe: GRAHA_MAP[adPlanet]?.ne || adPlanet,
        startDate: adStartDate,
        endDate: adEndDate,
        startDateBS: adStartBS,
        endDateBS: adEndBS,
        startDateFormattedAD: formatAD(adStartDate),
        endDateFormattedAD: formatAD(adEndDate),
        startDateFormattedBS: adStartBS.formatted,
        endDateFormattedBS: adEndBS.formatted,
        durationMonths: Math.round(adYears * 12 * 10) / 10,
        pratyantardashas,
        isCurrent: isAdCurrent,
      });

      currentAdStartMs = adEndMs;
    }

    result.push({
      planet: mdPlanet,
      planetNe: GRAHA_MAP[mdPlanet]?.ne || mdPlanet,
      startDate: mdStartDate,
      endDate: mdEndDate,
      startDateBS: mdStartBS,
      endDateBS: mdEndBS,
      startDateFormattedAD: formatAD(mdStartDate),
      endDateFormattedAD: formatAD(mdEndDate),
      startDateFormattedBS: mdStartBS.formatted,
      endDateFormattedBS: mdEndBS.formatted,
      durationYears: Math.round(mdYears * 100) / 100,
      antardashas,
      isCurrent: isMdCurrent,
    });

    currentMdStartMs = mdEndMs;
  }

  return result;
}

// 3. Yogini Mahadasha + Antardasha + Pratyantardasha (72 Years Total = 2 x 36 Years Cycles)
export function calculateYoginiSubperiods(
  moonSiderealDeg: number,
  nakshatraIndex: number,
  utcBirthDate: Date
): MahadashaWithSubperiods[] {
  const now = new Date();
  const yoginiIndex = (nakshatraIndex + 1 + 3) % 8;
  const janmaYogini = YOGINI_LIST[yoginiIndex];

  const nakDegree = moonSiderealDeg % 13.333333333333334;
  const fractionElapsed = nakDegree / 13.333333333333334;

  const janmaYogYears = janmaYogini.durationYears;
  const bhuktaYears = janmaYogYears * fractionElapsed;

  let currentMdStartMs = utcBirthDate.getTime() - bhuktaYears * MS_PER_YEAR;

  const result: MahadashaWithSubperiods[] = [];

  // 16 Yoginis across 2 cycles of 36 years = 72 years
  for (let mIdx = 0; mIdx < 16; mIdx++) {
    const yIndex = (yoginiIndex + mIdx) % 8;
    const yInfo = YOGINI_LIST[yIndex];
    const mdYears = yInfo.durationYears;
    const mdEndMs = currentMdStartMs + mdYears * MS_PER_YEAR;

    const mdStartDate = new Date(currentMdStartMs);
    const mdEndDate = new Date(mdEndMs);
    const isMdCurrent = now >= mdStartDate && now <= mdEndDate;

    const mdStartBS = convertADToBS(mdStartDate);
    const mdEndBS = convertADToBS(mdEndDate);

    const antardashas: AntardashaPeriod[] = [];
    let currentAdStartMs = currentMdStartMs;

    for (let aIdx = 0; aIdx < 8; aIdx++) {
      const adYIndex = (yIndex + aIdx) % 8;
      const adYInfo = YOGINI_LIST[adYIndex];
      const adYears = (mdYears * adYInfo.durationYears) / 36;
      const adEndMs = currentAdStartMs + adYears * MS_PER_YEAR;

      const adStartDate = new Date(currentAdStartMs);
      const adEndDate = new Date(adEndMs);
      const isAdCurrent = now >= adStartDate && now <= adEndDate;

      const adStartBS = convertADToBS(adStartDate);
      const adEndBS = convertADToBS(adEndDate);

      const pratyantardashas: PratyantardashaPeriod[] = [];
      let currentPadStartMs = currentAdStartMs;

      for (let pIdx = 0; pIdx < 8; pIdx++) {
        const padYIndex = (adYIndex + pIdx) % 8;
        const padYInfo = YOGINI_LIST[padYIndex];
        const padYears = (adYears * padYInfo.durationYears) / 36;
        const padEndMs = currentPadStartMs + padYears * MS_PER_YEAR;

        const padStartDate = new Date(currentPadStartMs);
        const padEndDate = new Date(padEndMs);
        const isPadCurrent = now >= padStartDate && now <= padEndDate;

        const padStartBS = convertADToBS(padStartDate);
        const padEndBS = convertADToBS(padEndDate);

        pratyantardashas.push({
          planet: padYInfo.nameEn,
          planetNe: `${padYInfo.nameNe} (${GRAHA_MAP[padYInfo.ruler]?.ne || padYInfo.ruler})`,
          startDate: padStartDate,
          endDate: padEndDate,
          startDateBS: padStartBS,
          endDateBS: padEndBS,
          startDateFormattedAD: formatAD(padStartDate),
          endDateFormattedAD: formatAD(padEndDate),
          startDateFormattedBS: padStartBS.formatted,
          endDateFormattedBS: padEndBS.formatted,
          durationDays: Math.round(padYears * 365.25),
          isCurrent: isPadCurrent,
        });

        currentPadStartMs = padEndMs;
      }

      antardashas.push({
        planet: adYInfo.nameEn,
        planetNe: `${adYInfo.nameNe} (${GRAHA_MAP[adYInfo.ruler]?.ne || adYInfo.ruler})`,
        startDate: adStartDate,
        endDate: adEndDate,
        startDateBS: adStartBS,
        endDateBS: adEndBS,
        startDateFormattedAD: formatAD(adStartDate),
        endDateFormattedAD: formatAD(adEndDate),
        startDateFormattedBS: adStartBS.formatted,
        endDateFormattedBS: adEndBS.formatted,
        durationMonths: Math.round(adYears * 12 * 10) / 10,
        pratyantardashas,
        isCurrent: isAdCurrent,
      });

      currentAdStartMs = adEndMs;
    }

    result.push({
      planet: yInfo.nameEn,
      planetNe: `${yInfo.nameNe} (${GRAHA_MAP[yInfo.ruler]?.ne || yInfo.ruler})`,
      ruler: yInfo.ruler,
      startDate: mdStartDate,
      endDate: mdEndDate,
      startDateBS: mdStartBS,
      endDateBS: mdEndBS,
      startDateFormattedAD: formatAD(mdStartDate),
      endDateFormattedAD: formatAD(mdEndDate),
      startDateFormattedBS: mdStartBS.formatted,
      endDateFormattedBS: mdEndBS.formatted,
      durationYears: mdYears,
      antardashas,
      isCurrent: isMdCurrent,
      cycleNumber: mIdx < 8 ? 1 : 2,
    });

    currentMdStartMs = mdEndMs;
  }

  return result;
}
