import { BirthDetails, GrahaName } from '../types/astrology';
import { calculateJulianDay, calculateLahiriAyanamsa, calculateAllPlanets } from './ephemeris';
import { calculateSuryaSiddhanta } from './suryaSiddhantaEngine';
import { RASHI_LIST, NAKSHATRA_LIST, GRAHA_MAP } from '../utils/i18n';

export interface TransitGraha {
  name: GrahaName;
  siderealLongitude: number;
  signIndex: number;
  signNameEn: string;
  signNameNe: string;
  signDegree: number;
  nakshatraIndex: number;
  nakshatraNameEn: string;
  nakshatraNameNe: string;
  pada: number;
  isRetrograde: boolean;
  speedDegPerDay: number;
  houseFromLagna: number;
  houseFromMoon: number;
}

export interface TransitCalculationResult {
  targetDate: Date;
  targetDateISO: string;
  calculationMethod: 'drik' | 'suryaSiddhanta';
  ayanamsaName: string;
  ayanamsaDegrees: number;
  transitGrahas: TransitGraha[];
  timestampISO: string;
}

export function calculateLiveTransit(
  natalLagnaSignIndex: number,
  natalMoonSignIndex: number,
  targetDate: Date = new Date(),
  calculationMethod: 'drik' | 'suryaSiddhanta' = 'drik'
): TransitCalculationResult {
  const jd = calculateJulianDay(targetDate);

  if (calculationMethod === 'suryaSiddhanta') {
    // Construct dummy BirthDetails for targetDate
    const dummyDetails: BirthDetails = {
      name: 'Transit Calculation',
      dob: targetDate.toISOString().split('T')[0],
      tob: targetDate.toISOString().split('T')[1].slice(0, 8),
      birthPlace: 'Greenwich',
      latitude: 0,
      longitude: 0,
      timezoneOffsetMinutes: 0,
      timezoneName: 'UTC',
      isDst: false,
    };

    const ssRes = calculateSuryaSiddhanta(dummyDetails);
    const transitGrahas: TransitGraha[] = ssRes.grahas.map((g) => {
      const houseFromLagna = ((g.signIndex - natalLagnaSignIndex + 12) % 12) + 1;
      const houseFromMoon = ((g.signIndex - natalMoonSignIndex + 12) % 12) + 1;

      return {
        name: g.name,
        siderealLongitude: g.trueLongitude,
        signIndex: g.signIndex,
        signNameEn: RASHI_LIST[g.signIndex].nameEn,
        signNameNe: RASHI_LIST[g.signIndex].nameNe,
        signDegree: g.signDegree,
        nakshatraIndex: g.nakshatraIndex,
        nakshatraNameEn: NAKSHATRA_LIST[g.nakshatraIndex].nameEn,
        nakshatraNameNe: NAKSHATRA_LIST[g.nakshatraIndex].nameNe,
        pada: g.pada,
        isRetrograde: false, // Canonical SS doesn't calculate Retrograde velocity vector in basic epicycles
        speedDegPerDay: 1.0,
        houseFromLagna,
        houseFromMoon,
      };
    });

    return {
      targetDate,
      targetDateISO: targetDate.toISOString(),
      calculationMethod: 'suryaSiddhanta',
      ayanamsaName: 'Surya Siddhanta Trepidation',
      ayanamsaDegrees: ssRes.ayanamsa,
      transitGrahas,
      timestampISO: new Date().toISOString(),
    };
  }

  // Drik Siddhanta Method (DE441 Ecliptic + Lahiri)
  const ayanamsa = calculateLahiriAyanamsa(jd);
  const rawPlanets = calculateAllPlanets(targetDate, ayanamsa);

  // Measure velocity by checking position 6 hours later (+0.25 days)
  const futureDate = new Date(targetDate.getTime() + 6 * 3600 * 1000);
  const jdNext = calculateJulianDay(futureDate);
  const ayanamsaNext = calculateLahiriAyanamsa(jdNext);
  const rawPlanetsNext = calculateAllPlanets(futureDate, ayanamsaNext);

  const transitGrahas: TransitGraha[] = rawPlanets.map((p) => {
    const nextP = rawPlanetsNext.find((item) => item.name === p.name);
    let diffDeg = 0;
    if (nextP) {
      diffDeg = (nextP.siderealLongitude - p.siderealLongitude);
      if (diffDeg > 180) diffDeg -= 360;
      if (diffDeg < -180) diffDeg += 360;
    }

    const speedDegPerDay = diffDeg * 4.0; // 6h delta * 4 = deg/day
    const isRetrograde = speedDegPerDay < -0.0001 && p.name !== 'Rahu' && p.name !== 'Ketu';

    const signIndex = Math.floor(((p.siderealLongitude % 360) + 360) % 360 / 30);
    const signDegree = p.siderealLongitude % 30;
    const nakshatraIndex = Math.floor(((p.siderealLongitude % 360) + 360) % 360 / (360 / 27));
    const nakDegree = ((p.siderealLongitude % 360) + 360) % (360 / 27);
    const pada = Math.floor(nakDegree / (360 / 108)) + 1;

    const houseFromLagna = ((signIndex - natalLagnaSignIndex + 12) % 12) + 1;
    const houseFromMoon = ((signIndex - natalMoonSignIndex + 12) % 12) + 1;

    return {
      name: p.name,
      siderealLongitude: p.siderealLongitude,
      signIndex,
      signNameEn: RASHI_LIST[signIndex].nameEn,
      signNameNe: RASHI_LIST[signIndex].nameNe,
      signDegree,
      nakshatraIndex,
      nakshatraNameEn: NAKSHATRA_LIST[nakshatraIndex].nameEn,
      nakshatraNameNe: NAKSHATRA_LIST[nakshatraIndex].nameNe,
      pada,
      isRetrograde,
      speedDegPerDay,
      houseFromLagna,
      houseFromMoon,
    };
  });

  return {
    targetDate,
    targetDateISO: targetDate.toISOString(),
    calculationMethod: 'drik',
    ayanamsaName: 'Chitra Paksha / Lahiri',
    ayanamsaDegrees: ayanamsa,
    transitGrahas,
    timestampISO: new Date().toISOString(),
  };
}
