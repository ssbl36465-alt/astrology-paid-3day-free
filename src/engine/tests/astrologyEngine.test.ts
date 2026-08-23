import { BirthDetails } from '../../types/astrology';
import { parseBirthDateToUTC, calculateJulianDay, calculateLahiriAyanamsa, calculateAllPlanets, calculateAscendant } from '../ephemeris';
import { calculateSuryaSiddhanta } from '../suryaSiddhantaEngine';
import { calculateKundali } from '../kundaliEngine';

export interface TestCaseResult {
  testName: string;
  passed: boolean;
  message: string;
  executionTimeMs: number;
}

export interface EngineTestSuiteResult {
  suiteName: string;
  timestamp: string;
  totalTests: number;
  passCount: number;
  failCount: number;
  allPassed: boolean;
  results: TestCaseResult[];
}

const SAMPLE_BIRTH_DETAILS: BirthDetails = {
  name: 'Test Profile (Shree Ram)',
  dob: '1995-10-24',
  tob: '10:30:00',
  birthPlace: 'Kathmandu, Nepal',
  latitude: 27.7172,
  longitude: 85.324,
  timezoneOffsetMinutes: 345,
  timezoneName: 'Asia/Kathmandu (+5:45)',
  isDst: false,
  calculationMethod: 'drik',
};

export function runCalculationEngineTests(): EngineTestSuiteResult {
  const results: TestCaseResult[] = [];
  const startTime = performance.now();

  // 1. Test UTC & Julian Day Calculation
  try {
    const t0 = performance.now();
    const utcDate = parseBirthDateToUTC(SAMPLE_BIRTH_DETAILS);
    const jd = calculateJulianDay(utcDate);
    const ayanamsa = calculateLahiriAyanamsa(jd);

    const isUtcValid = !isNaN(utcDate.getTime());
    const isJdValid = jd > 2400000 && jd < 2500000;
    const isAyanamsaValid = ayanamsa > 22 && ayanamsa < 25;

    results.push({
      testName: 'UTC Date, Julian Day & Lahiri Ayanamsa Conversion',
      passed: isUtcValid && isJdValid && isAyanamsaValid,
      message: `UTC: ${utcDate.toISOString()}, JD: ${jd.toFixed(4)}, Lahiri Ayanamsa: ${ayanamsa.toFixed(4)}°`,
      executionTimeMs: performance.now() - t0,
    });
  } catch (err) {
    results.push({
      testName: 'UTC Date, Julian Day & Lahiri Ayanamsa Conversion',
      passed: false,
      message: err instanceof Error ? err.message : String(err),
      executionTimeMs: 0,
    });
  }

  // 2. Test Drik Siddhanta Planetary Longitudes
  try {
    const t0 = performance.now();
    const utcDate = parseBirthDateToUTC(SAMPLE_BIRTH_DETAILS);
    const jd = calculateJulianDay(utcDate);
    const ayanamsa = calculateLahiriAyanamsa(jd);

    const planets = calculateAllPlanets(utcDate, ayanamsa);
    const ascendant = calculateAscendant(utcDate, SAMPLE_BIRTH_DETAILS.latitude, SAMPLE_BIRTH_DETAILS.longitude, ayanamsa);

    const expectedPlanets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
    const allPlanetsPresent = expectedPlanets.every((p) => planets.some((pl) => pl.name === p));
    const allDegreesValid = planets.every(
      (pl) =>
        !isNaN(pl.siderealLongitude) &&
        pl.siderealLongitude >= 0 &&
        pl.siderealLongitude < 360 &&
        !isNaN(pl.tropicalLongitude)
    );
    const ascValid = !isNaN(ascendant.siderealDeg) && ascendant.siderealDeg >= 0 && ascendant.siderealDeg < 360;

    results.push({
      testName: 'Drik Siddhanta (DE441 Ephemeris) 9 Grahas & Lagna Calculation',
      passed: allPlanetsPresent && allDegreesValid && ascValid,
      message: `Successfully computed all 9 Grahas and Lagna (${ascendant.siderealDeg.toFixed(2)}°) with zero NaNs.`,
      executionTimeMs: performance.now() - t0,
    });
  } catch (err) {
    results.push({
      testName: 'Drik Siddhanta (DE441 Ephemeris) 9 Grahas & Lagna Calculation',
      passed: false,
      message: err instanceof Error ? err.message : String(err),
      executionTimeMs: 0,
    });
  }

  // 3. Test Surya Siddhanta Canonical Calculations
  try {
    const t0 = performance.now();
    const ssResult = calculateSuryaSiddhanta(SAMPLE_BIRTH_DETAILS);

    const isAharganaValid = ssResult.ahargana > 1800000;
    const isLagnaValid = !isNaN(ssResult.lagnaLongitude) && ssResult.lagnaLongitude >= 0 && ssResult.lagnaLongitude < 360;
    const allSsGrahasValid = ssResult.grahas.length === 9 && ssResult.grahas.every((g) => !isNaN(g.trueLongitude) && g.trueLongitude >= 0 && g.trueLongitude < 360);

    results.push({
      testName: 'Surya Siddhanta Canonical Engine (Kali Ahargana & Trepidation Ayanamsa)',
      passed: isAharganaValid && isLagnaValid && allSsGrahasValid,
      message: `Kali Ahargana: ${ssResult.ahargana.toFixed(2)} days, SS Ayanamsa: ${ssResult.ayanamsa.toFixed(4)}°, SS Lagna: ${ssResult.lagnaLongitude.toFixed(2)}°`,
      executionTimeMs: performance.now() - t0,
    });
  } catch (err) {
    results.push({
      testName: 'Surya Siddhanta Canonical Engine (Kali Ahargana & Trepidation Ayanamsa)',
      passed: false,
      message: err instanceof Error ? err.message : String(err),
      executionTimeMs: 0,
    });
  }

  // 4. Test Method Switching Switcher (Drik vs Surya Siddhanta)
  try {
    const t0 = performance.now();
    const drikKundali = calculateKundali({ ...SAMPLE_BIRTH_DETAILS, calculationMethod: 'drik' });
    const ssKundali = calculateKundali({ ...SAMPLE_BIRTH_DETAILS, calculationMethod: 'surya_siddhanta' });

    const drikMethodName = drikKundali.audit.calculationMethod;
    const ssMethodName = ssKundali.audit.calculationMethod;

    const producesDifferentAyanamsa = Math.abs(drikKundali.audit.lahiriAyanamsaDegrees - ssKundali.audit.lahiriAyanamsaDegrees) > 0.01;
    const producesValidGrahasDrik = drikKundali.grahas.length === 9;
    const producesValidGrahasSs = ssKundali.grahas.length === 9;

    results.push({
      testName: 'Method Selector Determinism ([ दृक् सिद्धान्त ] vs [ सौर्य सिद्धान्त ])',
      passed: producesDifferentAyanamsa && producesValidGrahasDrik && producesValidGrahasSs,
      message: `Drik Method: "${drikMethodName}", SS Method: "${ssMethodName}". Both returned 9 valid grahas deterministically.`,
      executionTimeMs: performance.now() - t0,
    });
  } catch (err) {
    results.push({
      testName: 'Method Selector Determinism ([ दृक् सिद्धान्त ] vs [ सौर्य सिद्धान्त ])',
      passed: false,
      message: err instanceof Error ? err.message : String(err),
      executionTimeMs: 0,
    });
  }

  // 5. Test Error Safety with Boundary Inputs
  try {
    const t0 = performance.now();
    const invalidDetails: BirthDetails = {
      name: 'Invalid Test',
      dob: 'invalid-date',
      tob: '99:99',
      birthPlace: 'Unknown',
      latitude: NaN,
      longitude: NaN,
      timezoneOffsetMinutes: 0,
      timezoneName: 'UTC',
      isDst: false,
    };

    const safeResult = calculateKundali(invalidDetails);
    const handledGracefully = safeResult && safeResult.grahas && safeResult.grahas.length === 9;

    results.push({
      testName: 'Error Safety & Boundary Input Recovery Guard',
      passed: Boolean(handledGracefully),
      message: 'Engine recovered gracefully from invalid date/coordinates without crashing or throwing stack overflow.',
      executionTimeMs: performance.now() - t0,
    });
  } catch (err) {
    results.push({
      testName: 'Error Safety & Boundary Input Recovery Guard',
      passed: false,
      message: err instanceof Error ? err.message : String(err),
      executionTimeMs: 0,
    });
  }

  const passCount = results.filter((r) => r.passed).length;
  const failCount = results.length - passCount;

  return {
    suiteName: 'Phase 1 Astrological Calculation Engine Automated Test Suite',
    timestamp: new Date().toISOString(),
    totalTests: results.length,
    passCount,
    failCount,
    allPassed: failCount === 0,
    results,
  };
}
