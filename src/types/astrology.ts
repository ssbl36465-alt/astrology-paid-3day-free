import type { SuryaSiddhantaResult } from '../engine/suryaSiddhantaEngine';
import type { TribhagiDashaResult, YoginiDashaResult, BhuktaBhogyaData } from '../engine/dashaEngine';
import type { ValidationReport } from '../engine/validationEngine';

export type Language = 'ne' | 'en';

export type ChartStyle = 'north' | 'south' | 'east';

export type CalculationMethod = 'drik' | 'surya_siddhanta';

export interface BirthDetails {
  id?: string;
  name: string;
  dob: string; // YYYY-MM-DD
  tob: string; // HH:mm:ss or HH:mm
  birthPlace: string;
  latitude: number;
  longitude: number;
  timezoneOffsetMinutes: number; // e.g. +345 for Nepal (+5:45)
  timezoneName: string;
  isDst: boolean;
  notes?: string;
  calculationMethod?: CalculationMethod;
}

export interface LocationPreset {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  timezoneOffsetMinutes: number;
  timezoneName: string;
}

export type GrahaName =
  | 'Sun'
  | 'Moon'
  | 'Mars'
  | 'Mercury'
  | 'Jupiter'
  | 'Venus'
  | 'Saturn'
  | 'Rahu'
  | 'Ketu';

export type RashiName =
  | 'Aries'
  | 'Taurus'
  | 'Gemini'
  | 'Cancer'
  | 'Leo'
  | 'Virgo'
  | 'Libra'
  | 'Scorpio'
  | 'Sagittarius'
  | 'Capricorn'
  | 'Aquarius'
  | 'Pisces';

export interface RashiInfo {
  index: number; // 0 to 11
  nameEn: RashiName;
  nameNe: string;
  sanskritName: string;
  symbol: string;
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  ruler: GrahaName;
}

export interface NakshatraInfo {
  index: number; // 0 to 26
  nameEn: string;
  nameNe: string;
  ruler: GrahaName;
  deity: string;
  symbol: string;
}

export interface GrahaPosition {
  name: GrahaName;
  nameNe: string;
  sanskritName: string;
  tropicalLongitude: number;
  siderealLongitude: number;
  signIndex: number; // 0 to 11
  signNameEn: RashiName;
  signNameNe: string;
  signDegree: number; // 0 to 30
  degreeFormatted: string; // e.g. 14° 22' 15"
  house: number; // 1 to 12
  nakshatraIndex: number; // 0 to 26
  nakshatraNameEn: string;
  nakshatraNameNe: string;
  nakshatraRuler: GrahaName;
  pada: number; // 1 to 4
  isRetrograde: boolean;
  isCombust?: boolean;
  combustionNe?: 'अस्त' | 'उदय';
  combustionEn?: 'Combust' | 'Rising';
  dignityNe?: string;
  dignityEn?: string;
  fullStatusNe?: string;
  fullStatusEn?: string;
  speed: number; // degrees per day
  status: 'Exalted' | 'Debilitated' | 'Own Sign' | 'Great Friend' | 'Friend' | 'Neutral' | 'Enemy' | 'Great Enemy';
}

export interface AscendantPosition {
  tropicalLongitude: number;
  siderealLongitude: number;
  signIndex: number;
  signNameEn: RashiName;
  signNameNe: string;
  degreeFormatted: string;
  nakshatraIndex: number;
  nakshatraNameEn: string;
  nakshatraNameNe: string;
  pada: number;
}

export interface HouseDetails {
  houseNumber: number; // 1 to 12
  signIndex: number; // 0 to 11
  signNameEn: RashiName;
  signNameNe: string;
  lord: GrahaName;
  occupyingGrahas: GrahaName[];
  aspectingGrahas: GrahaName[];
}

export interface PanchangaData {
  tithi: {
    number: number; // 1 to 30
    nameEn: string;
    nameNe: string;
    paksha: 'Shukla' | 'Krishna';
    pakshaNe: string;
    percentageLeft: number;
  };
  vara: {
    dayNumber: number; // 0 (Sun) to 6 (Sat)
    nameEn: string;
    nameNe: string;
    ruler: GrahaName;
  };
  nakshatra: {
    index: number;
    nameEn: string;
    nameNe: string;
    ruler: GrahaName;
    percentageLeft: number;
  };
  yoga: {
    number: number; // 1 to 27
    nameEn: string;
    nameNe: string;
  };
  karana: {
    number: number; // 1 to 60 half-tithis
    nameEn: string;
    nameNe: string;
  };
  sunrise: string;
  sunset: string;
}

export interface AntardashaPeriod {
  planet: GrahaName;
  startDate: Date;
  endDate: Date;
}

export interface MahadashaPeriod {
  planet: GrahaName;
  startDate: Date;
  endDate: Date;
  durationYears: number;
  antardashas: AntardashaPeriod[];
  isCurrent: boolean;
}

export interface VimshottariDasha {
  birthBalanceYears: number;
  startingLord: GrahaName;
  currentMahadasha: GrahaName;
  currentAntardasha: GrahaName;
  mahadashas: MahadashaPeriod[];
}

export interface DivisionalChart {
  id: string; // e.g. 'D1', 'D9', 'D10'
  nameEn: string;
  nameNe: string;
  code: string;
  description: string;
  ascendantSignIndex: number;
  positions: {
    graha: GrahaName;
    signIndex: number;
    house: number;
  }[];
}

export interface YogaRule {
  id: string;
  nameEn: string;
  nameNe: string;
  category: 'Raja Yoga' | 'Dhana Yoga' | 'Auspicious' | 'Inauspicious' | 'Chandra Yoga' | 'Surya Yoga' | 'Mahapurusha';
  categoryNe: string;
  descriptionEn: string;
  descriptionNe: string;
  isFulfilled: boolean;
  involvedGrahas: GrahaName[];
  fulfillmentReasonEn: string;
  fulfillmentReasonNe: string;
}

export interface AshtakavargaResult {
  binnashtakavarga: Record<GrahaName | 'Lagna', number[]>; // Array of 12 signs points
  samudayaAshtakavarga: number[]; // 12 signs total points
}

export interface InterpretationCategory {
  categoryKey:
    | 'personality'
    | 'career'
    | 'finance'
    | 'marriage'
    | 'education'
    | 'family'
    | 'health'
    | 'foreignTravel'
    | 'spirituality'
    | 'majorLifePeriods';
  titleEn: string;
  titleNe: string;
  pointsEn: string[];
  pointsNe: string[];
}

export interface AstronomicalAudit {
  julianDay: number;
  utcDateString: string;
  greenwichSiderealTimeHours: number;
  localSiderealTimeHours: number;
  obliquityDegrees: number;
  lahiriAyanamsaDegrees: number;
  lahiriAyanamsaFormatted: string;
  tropicalLagnaDegrees: number;
  siderealLagnaDegrees: number;
  calculationMethod: string;
  ephemerisSource: string;
}

export interface KundaliCalculationOutput {
  birthDetails: BirthDetails;
  audit: AstronomicalAudit;
  ascendant: AscendantPosition;
  grahas: GrahaPosition[];
  houses: HouseDetails[];
  panchanga: PanchangaData;
  vimshottariDasha: VimshottariDasha;
  tribhagiDasha: TribhagiDashaResult;
  yoginiDasha: YoginiDashaResult;
  bhuktaBhogya: BhuktaBhogyaData;
  suryaSiddhanta: SuryaSiddhantaResult;
  validationReport: ValidationReport;
  divisionalCharts: DivisionalChart[];
  yogas: YogaRule[];
  ashtakavarga: AshtakavargaResult;
  interpretations: InterpretationCategory[];
}
