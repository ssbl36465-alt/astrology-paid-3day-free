import * as Astronomy from 'astronomy-engine';
import { GrahaName, BirthDetails, AstronomicalAudit } from '../types/astrology';

export interface RawGrahaCalculated {
  name: GrahaName;
  tropicalLongitude: number;
  siderealLongitude: number;
  speedDegPerDay: number;
  isRetrograde: boolean;
}

export function calculateJulianDay(utcDate: Date): number {
  const safeDate = (!utcDate || isNaN(utcDate.getTime())) ? new Date() : utcDate;
  // Astronomical Julian Day formula from UTC date
  const year = safeDate.getUTCFullYear();
  const month = safeDate.getUTCMonth() + 1;
  const day = safeDate.getUTCDate();
  const hours = safeDate.getUTCHours();
  const minutes = safeDate.getUTCMinutes();
  const seconds = safeDate.getUTCSeconds();

  let y = year;
  let m = month;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }

  const dayFraction = (hours + minutes / 60 + seconds / 3600) / 24;
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);

  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + dayFraction + b - 1524.5;
}

export function calculateLahiriAyanamsa(julianDay: number): number {
  // N.C. Lahiri Ayanamsa formula relative to J2000.0 (JD 2451545.0)
  const T = (julianDay - 2451545.0) / 36525.0;
  // Lahiri Ayanamsa at J2000.0 is 23° 51' 11" = 23.8530556 degrees
  const ayanamsa = 23.8530556 + 1.39604166 * T + 0.000308 * T * T;
  return ayanamsa;
}

export function calculateObliquity(julianDay: number): number {
  const T = (julianDay - 2451545.0) / 36525.0;
  return 23.43929111 - 0.013004167 * T - 0.000000163889 * T * T;
}

export function calculateLocalSiderealTime(utcDate: Date, longitudeDeg: number): { gmstHours: number; lstHours: number; julianDay: number } {
  const julianDay = calculateJulianDay(utcDate);
  const T = (julianDay - 2451545.0) / 36525.0;

  // Greenwich Mean Sidereal Time in seconds
  const gmstSec = 24110.54841 + 8640184.812866 * T + 0.093104 * T * T - 0.0000062 * T * T * T;
  let gmstHours = ((gmstSec / 3600) % 24 + 24) % 24;

  // Add longitude effect (15 degrees per hour)
  let lstHours = ((gmstHours + longitudeDeg / 15.0) % 24 + 24) % 24;

  return { gmstHours, lstHours, julianDay };
}

export function calculateAscendant(
  utcDate: Date,
  latitudeDeg: number,
  longitudeDeg: number,
  ayanamsa: number
): { tropicalDeg: number; siderealDeg: number; obliquityDeg: number; gmstHours: number; lstHours: number; julianDay: number } {
  const { gmstHours, lstHours, julianDay } = calculateLocalSiderealTime(utcDate, longitudeDeg);
  const obliquityDeg = calculateObliquity(julianDay);

  const ramcRad = (lstHours * 15.0 * Math.PI) / 180.0;
  const latRad = (latitudeDeg * Math.PI) / 180.0;
  const oblRad = (obliquityDeg * Math.PI) / 180.0;

  // Ascendant formula
  const y = Math.cos(ramcRad);
  const x = -Math.sin(ramcRad) * Math.cos(oblRad) - Math.tan(latRad) * Math.sin(oblRad);

  let ascRad = Math.atan2(y, x);
  let ascDeg = ((ascRad * 180.0) / Math.PI + 360.0) % 360.0;

  const siderealDeg = ((ascDeg - ayanamsa) % 360.0 + 360.0) % 360.0;

  return {
    tropicalDeg: ascDeg,
    siderealDeg,
    obliquityDeg,
    gmstHours,
    lstHours,
    julianDay,
  };
}

const BODY_MAP: Record<string, Astronomy.Body> = {
  Sun: Astronomy.Body.Sun,
  Moon: Astronomy.Body.Moon,
  Mars: Astronomy.Body.Mars,
  Mercury: Astronomy.Body.Mercury,
  Jupiter: Astronomy.Body.Jupiter,
  Venus: Astronomy.Body.Venus,
  Saturn: Astronomy.Body.Saturn,
};

export function calculateEclipticLongitude(bodyName: GrahaName, date: Date): { longitude: number; speedDegPerDay: number } {
  if (bodyName === 'Rahu' || bodyName === 'Ketu') {
    // Meeus Moon Node Formula
    const jd = calculateJulianDay(date);
    const T = (jd - 2451545.0) / 36525.0;
    // Mean Omega
    let omega = 125.0445222 - 1934.136261 * T + 0.0020708 * T * T + (T * T * T) / 450000;
    omega = ((omega % 360) + 360) % 360;

    if (bodyName === 'Ketu') {
      omega = (omega + 180) % 360;
    }

    return { longitude: omega, speedDegPerDay: -0.05295 }; // Rahu/Ketu mean motion is ~ -0.053 deg/day
  }

  const astroBody = BODY_MAP[bodyName];
  const time = Astronomy.MakeTime(date);
  const geoVector = Astronomy.GeoVector(astroBody, time, true);
  const ecliptic = Astronomy.Ecliptic(geoVector);
  const longitude = ((ecliptic.elon % 360) + 360) % 360;

  // Speed calculation by sampling 1 hour ahead
  const datePlus1Hr = new Date(date.getTime() + 3600 * 1000);
  const time1 = Astronomy.MakeTime(datePlus1Hr);
  const geoVector1 = Astronomy.GeoVector(astroBody, time1, true);
  const ecliptic1 = Astronomy.Ecliptic(geoVector1);

  let diff = ecliptic1.elon - ecliptic.elon;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;

  const speedDegPerDay = diff * 24.0;

  return { longitude, speedDegPerDay };
}

export function calculateAllPlanets(utcDate: Date, ayanamsa: number): RawGrahaCalculated[] {
  const planetNames: GrahaName[] = [
    'Sun',
    'Moon',
    'Mars',
    'Mercury',
    'Jupiter',
    'Venus',
    'Saturn',
    'Rahu',
    'Ketu',
  ];

  return planetNames.map((name) => {
    const { longitude: tropLong, speedDegPerDay } = calculateEclipticLongitude(name, utcDate);
    const siderealLongitude = ((tropLong - ayanamsa) % 360 + 360) % 360;

    let isRetrograde = false;
    if (name === 'Rahu' || name === 'Ketu') {
      isRetrograde = true; // Mean nodes are retrograde
    } else if (name !== 'Sun' && name !== 'Moon') {
      isRetrograde = speedDegPerDay < 0;
    }

    return {
      name,
      tropicalLongitude: tropLong,
      siderealLongitude,
      speedDegPerDay,
      isRetrograde,
    };
  });
}

export function parseBirthDateToUTC(birthDetails: BirthDetails): Date {
  if (!birthDetails || !birthDetails.dob) {
    return new Date();
  }

  const [yearStr, monthStr, dayStr] = (birthDetails.dob || '').split('-');
  const [hourStr, minStr, secStr] = (birthDetails.tob || '00:00:00').split(':');

  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10) - 1;
  const day = parseInt(dayStr, 10);
  const hour = parseInt(hourStr || '0', 10);
  const min = parseInt(minStr || '0', 10);
  const sec = parseInt(secStr || '0', 10);

  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    return new Date();
  }

  // Local time in milliseconds since epoch
  const localMs = Date.UTC(year, month, day, isNaN(hour) ? 0 : hour, isNaN(min) ? 0 : min, isNaN(sec) ? 0 : sec);

  // Adjust for timezone offset (in minutes) and DST
  let totalOffsetMinutes = typeof birthDetails.timezoneOffsetMinutes === 'number' ? birthDetails.timezoneOffsetMinutes : 345;
  if (birthDetails.isDst) {
    totalOffsetMinutes += 60;
  }

  // UTC time = local time - offset
  const utcMs = localMs - totalOffsetMinutes * 60 * 1000;
  const resDate = new Date(utcMs);
  return isNaN(resDate.getTime()) ? new Date() : resDate;
}
