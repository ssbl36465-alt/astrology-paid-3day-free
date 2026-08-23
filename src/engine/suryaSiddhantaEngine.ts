import { BirthDetails, GrahaName } from '../types/astrology';
import { calculateJulianDay, parseBirthDateToUTC } from './ephemeris';

export interface SuryaSiddhantaGraha {
  name: GrahaName;
  meanLongitude: number; // Madhyama
  mandaPhala: number; // Equation of center
  trueLongitude: number; // Manda/Sighra Sphuta (Sidereal)
  signIndex: number;
  signDegree: number;
  nakshatraIndex: number;
  pada: number;
  house: number;
}

export interface SuryaSiddhantaResult {
  ahargana: number; // Kali Ahargana (days since 3102 BCE)
  ayanamsa: number; // Surya Siddhanta Ayanamsa
  lagnaLongitude: number; // SS Sidereal Lagna
  lagnaSignIndex: number;
  lagnaNakshatraIndex: number;
  lagnaPada: number;
  grahas: SuryaSiddhantaGraha[];
}

// Canonical Surya Siddhanta Mahayuga Bhagana Constants (1 Mahayuga = 1,577,917,828 civil days)
const KALI_EPOCH_JD = 588465.5; // Feb 18, 3102 BCE Midnight UTC
const MAHAR_DAYS = 1577917828;

const SS_BHAGANA: Record<string, number> = {
  Sun: 4320000,
  Moon: 57753336,
  Mars: 2296832,
  MercurySighra: 17937060,
  Jupiter: 364220,
  VenusSighra: 7022376,
  Saturn: 146568,
  MoonMandoccha: 488203,
  RahuNode: -232238,
};

// Manda Ucca (Apogee / Perihelion) positions in degrees for SS
const SS_MANDA_UCCA: Record<string, number> = {
  Sun: 77.1667, // 77° 10'
  Moon: 0, // Dynamic via MoonMandoccha
  Mars: 130.0,
  Mercury: 220.0,
  Jupiter: 171.0,
  Venus: 80.0,
  Saturn: 236.0,
};

// Manda Epicycle Circumference (Degrees)
const SS_MANDA_CIRCUMFERENCE: Record<string, number> = {
  Sun: 14.0,
  Moon: 32.0,
  Mars: 75.0,
  Mercury: 30.0,
  Jupiter: 33.0,
  Venus: 12.0,
  Saturn: 40.0,
};

export function calculateSuryaSiddhanta(birthDetails: BirthDetails): SuryaSiddhantaResult {
  const utcDate = parseBirthDateToUTC(birthDetails);
  const jd = calculateJulianDay(utcDate);

  // 1. Kali Ahargana
  const ahargana = jd - KALI_EPOCH_JD;

  // 2. Surya Siddhanta Trepidation Ayanamsa
  // Precession rate: 54 arcseconds per year from Kaliyuga epoch
  const elapsedYears = ahargana / 365.258756;
  // Trepidation formula: 27° * sin(2 * pi * elapsedYears / 7200)
  const ayanamsa = 27.0 * Math.sin((2 * Math.PI * elapsedYears) / 7200);

  // Helper for mean longitude
  const getMeanLong = (bhagana: number): number => {
    const revs = (ahargana * bhagana) / MAHAR_DAYS;
    const frac = revs - Math.floor(revs);
    return frac * 360.0;
  };

  const sunMean = getMeanLong(SS_BHAGANA.Sun);
  const moonMean = getMeanLong(SS_BHAGANA.Moon);
  const marsMean = getMeanLong(SS_BHAGANA.Mars);
  const mercSighra = getMeanLong(SS_BHAGANA.MercurySighra);
  const jupMean = getMeanLong(SS_BHAGANA.Jupiter);
  const venSighra = getMeanLong(SS_BHAGANA.VenusSighra);
  const satMean = getMeanLong(SS_BHAGANA.Saturn);
  const moonApogee = getMeanLong(SS_BHAGANA.MoonMandoccha);
  const rahuMean = getMeanLong(SS_BHAGANA.RahuNode);

  // Mercury and Venus mean longitudes in Surya Siddhanta match Sun mean
  const mercMean = sunMean;
  const venMean = sunMean;

  // Function to apply Manda Phala
  const applyMandaCorrection = (
    meanLong: number,
    uccaLong: number,
    circumference: number
  ): { trueLong: number; mandaPhala: number } => {
    let anomaly = meanLong - uccaLong;
    anomaly = ((anomaly % 360) + 360) % 360;

    const rad = (anomaly * Math.PI) / 180.0;
    // Manda Equation of center = - (circumference / 360) * sin(anomaly) * 360 / (2 * pi)
    const mandaPhala = -((circumference / 360.0) * Math.sin(rad) * (180.0 / Math.PI));
    let trueLong = meanLong + mandaPhala;
    trueLong = ((trueLong % 360) + 360) % 360;

    return { trueLong, mandaPhala };
  };

  const sunRes = applyMandaCorrection(sunMean, SS_MANDA_UCCA.Sun, SS_MANDA_CIRCUMFERENCE.Sun);
  const moonRes = applyMandaCorrection(moonMean, moonApogee, SS_MANDA_CIRCUMFERENCE.Moon);
  const marsRes = applyMandaCorrection(marsMean, SS_MANDA_UCCA.Mars, SS_MANDA_CIRCUMFERENCE.Mars);

  // Mercury combines Manda & Sighra
  const mercRes = applyMandaCorrection(mercMean, SS_MANDA_UCCA.Mercury, SS_MANDA_CIRCUMFERENCE.Mercury);
  // Sighra correction adjustment
  const mercSighraAnomaly = mercSighra - mercRes.trueLong;
  const mercSighraPhala = 13.0 * Math.sin((mercSighraAnomaly * Math.PI) / 180.0);
  const mercTrue = ((mercRes.trueLong + mercSighraPhala) % 360 + 360) % 360;

  const jupRes = applyMandaCorrection(jupMean, SS_MANDA_UCCA.Jupiter, SS_MANDA_CIRCUMFERENCE.Jupiter);

  // Venus combines Manda & Sighra
  const venRes = applyMandaCorrection(venMean, SS_MANDA_UCCA.Venus, SS_MANDA_CIRCUMFERENCE.Venus);
  const venSighraAnomaly = venSighra - venRes.trueLong;
  const venSighraPhala = 11.0 * Math.sin((venSighraAnomaly * Math.PI) / 180.0);
  const venTrue = ((venRes.trueLong + venSighraPhala) % 360 + 360) % 360;

  const satRes = applyMandaCorrection(satMean, SS_MANDA_UCCA.Saturn, SS_MANDA_CIRCUMFERENCE.Saturn);

  const ketuTrue = (rahuMean + 180) % 360;

  // 3. Lagna Calculation in Surya Siddhanta
  // SS Obliquity ε = 24°
  const gmstHours = (((ahargana % 1) * 24 + 12) % 24 + 24) % 24;
  const lstHours = ((gmstHours + birthDetails.longitude / 15.0) % 24 + 24) % 24;

  const ramcRad = (lstHours * 15.0 * Math.PI) / 180.0;
  const latRad = (birthDetails.latitude * Math.PI) / 180.0;
  const oblRad = (24.0 * Math.PI) / 180.0; // Canonical SS Obliquity

  const y = Math.cos(ramcRad);
  const x = -Math.sin(ramcRad) * Math.cos(oblRad) - Math.tan(latRad) * Math.sin(oblRad);
  const ascRad = Math.atan2(y, x);
  const ascDegTrop = ((ascRad * 180.0) / Math.PI + 360.0) % 360.0;
  const ssLagnaSidereal = ((ascDegTrop - ayanamsa) % 360 + 360) % 360;

  const lagnaSignIndex = Math.floor(ssLagnaSidereal / 30);
  const lagnaNakshatraIndex = Math.floor(ssLagnaSidereal / 13.333333333333334) % 27;
  const lagnaPada = Math.floor(((ssLagnaSidereal % 13.333333333333334) / 3.3333333333333335)) + 1;

  // Build Graha Array
  const grahaRawList: { name: GrahaName; mean: number; manda: number; trueLong: number }[] = [
    { name: 'Sun', mean: sunMean, manda: sunRes.mandaPhala, trueLong: sunRes.trueLong },
    { name: 'Moon', mean: moonMean, manda: moonRes.mandaPhala, trueLong: moonRes.trueLong },
    { name: 'Mars', mean: marsMean, manda: marsRes.mandaPhala, trueLong: marsRes.trueLong },
    { name: 'Mercury', mean: mercMean, manda: mercRes.mandaPhala, trueLong: mercTrue },
    { name: 'Jupiter', mean: jupMean, manda: jupRes.mandaPhala, trueLong: jupRes.trueLong },
    { name: 'Venus', mean: venMean, manda: venRes.mandaPhala, trueLong: venTrue },
    { name: 'Saturn', mean: satMean, manda: satRes.mandaPhala, trueLong: satRes.trueLong },
    { name: 'Rahu', mean: rahuMean, manda: 0, trueLong: rahuMean },
    { name: 'Ketu', mean: ketuTrue, manda: 0, trueLong: ketuTrue },
  ];

  const grahas: SuryaSiddhantaGraha[] = grahaRawList.map((g) => {
    const signIndex = Math.floor(g.trueLong / 30);
    const signDegree = g.trueLong % 30;
    const nakshatraIndex = Math.floor(g.trueLong / 13.333333333333334) % 27;
    const pada = Math.floor((g.trueLong % 13.333333333333334) / 3.3333333333333335) + 1;
    const house = ((signIndex - lagnaSignIndex + 12) % 12) + 1;

    return {
      name: g.name,
      meanLongitude: g.mean,
      mandaPhala: g.manda,
      trueLongitude: g.trueLong,
      signIndex,
      signDegree,
      nakshatraIndex,
      pada,
      house,
    };
  });

  return {
    ahargana,
    ayanamsa,
    lagnaLongitude: ssLagnaSidereal,
    lagnaSignIndex,
    lagnaNakshatraIndex,
    lagnaPada,
    grahas,
  };
}
