import {
  GrahaName,
  GrahaPosition,
  AscendantPosition,
  PanchangaData,
  RashiInfo,
  NakshatraInfo,
} from '../types/astrology';
import { RASHI_LIST, NAKSHATRA_LIST } from './i18n';

// 1. Janma Namakshar (108 Pada Phonetic Characters)
export const NAMAKSHAR_TABLE: string[][] = [
  ['चू', 'चे', 'चो', 'ला'], // 0. Ashwini
  ['ली', 'लू', 'ले', 'लो'], // 1. Bharani
  ['अ', 'ई', 'उ', 'ए'],    // 2. Krittika
  ['ओ', 'वा', 'वी', 'वू'], // 3. Rohini
  ['वे', 'वो', 'का', 'की'], // 4. Mrigashira
  ['कू', 'घ', 'ङ', 'छ'],  // 5. Ardra
  ['के', 'को', 'हा', 'ही'], // 6. Punarvasu
  ['हू', 'हे', 'हो', 'डा'], // 7. Pushya
  ['डी', 'डू', 'डे', 'डो'], // 8. Ashlesha
  ['मा', 'मी', 'मू', 'मे'], // 9. Magha
  ['मो', 'टा', 'टी', 'टू'], // 10. Purva Phalguni
  ['टे', 'टो', 'पा', 'पी'], // 11. Uttara Phalguni
  ['पू', 'ष', 'ण', 'ठ'],  // 12. Hasta
  ['पे', 'पो', 'रा', 'री'], // 13. Chitra
  ['रू', 'रे', 'रो', 'ता'], // 14. Swati
  ['ती', 'तू', 'ते', 'तो'], // 15. Vishakha
  ['ना', 'नी', 'नू', 'ने'], // 16. Anuradha
  ['नो', 'या', 'यी', 'यू'], // 17. Jyeshtha
  ['ये', 'यो', 'भा', 'भी'], // 18. Mula
  ['भू', 'ढा', 'फा', 'ढा'], // 19. Purva Ashadha
  ['भे', 'भो', 'जा', 'जी'], // 20. Uttara Ashadha
  ['खी', 'खू', 'खे', 'खो'], // 21. Shravana
  ['गा', 'गी', 'गू', 'गे'], // 22. Dhanishta
  ['गो', 'सा', 'सी', 'सू'], // 23. Shatabhisha
  ['से', 'सो', 'द', 'दी'],  // 24. Purva Bhadrapada
  ['दू', 'थ', 'झ', 'ञ'],  // 25. Uttara Bhadrapada
  ['दे', 'दो', 'चा', 'ची'], // 26. Revati
];

// 2. Gana Classification
export function getGana(nakshatraIdx: number): 'देव' | 'मनुष्य' | 'राक्षस' {
  const deva = [0, 4, 6, 7, 12, 14, 16, 21, 26];
  const manushya = [1, 3, 5, 10, 11, 19, 20, 24, 25];
  if (deva.includes(nakshatraIdx)) return 'देव';
  if (manushya.includes(nakshatraIdx)) return 'मनुष्य';
  return 'राक्षस';
}

// 3. Yoni Classification
export function getYoni(nakshatraIdx: number): string {
  const yoniMap: Record<number, string> = {
    0: 'अश्व (घोडा)', 23: 'अश्व (घोडा)',
    1: 'गज (हात्ती)', 26: 'गज (हात्ती)',
    2: 'मेष (भेडा)', 7: 'मेष (भेडा)',
    3: 'सर्प (साँप)', 4: 'सर्प (साँप)',
    5: 'श्वान (कुकुर)', 18: 'श्वान (कुकुर)',
    6: 'मार्जार (विरालो)', 8: 'मार्जार (विरालो)',
    9: 'मूषक (मुसो)', 10: 'मूषक (मुसो)',
    11: 'गौ (गाई)', 25: 'गौ (गाई)',
    12: 'महिष (राँगो)', 14: 'महिष (राँगो)',
    13: 'व्याघ्र (बाघ)', 15: 'व्याघ्र (बाघ)',
    16: 'मृग (हरिण)', 17: 'मृग (हरिण)',
    19: 'वानर (बाँदर)', 21: 'वानर (बाँदर)',
    20: 'नकुल (न्याउरी)',
    22: 'सिंह (सिंह)', 24: 'सिंह (सिंह)',
  };
  return yoniMap[nakshatraIdx] || 'महिष (राँगो)';
}

// 4. Nadi Classification
export function getNadi(nakshatraIdx: number): 'आदि' | 'मध्य' | 'अन्त्य' {
  const adi = [0, 5, 6, 11, 12, 17, 18, 23, 24];
  const madhya = [1, 4, 7, 10, 13, 16, 19, 22, 25];
  if (adi.includes(nakshatraIdx)) return 'आदि';
  if (madhya.includes(nakshatraIdx)) return 'मध्य';
  return 'अन्त्य';
}

// 5. Varna Classification
export function getVarna(signIdx: number): 'ब्राह्मण' | 'क्षत्रिय' | 'वैश्य' | 'शूद्र' {
  if ([3, 7, 11].includes(signIdx)) return 'ब्राह्मण';
  if ([0, 4, 8].includes(signIdx)) return 'क्षत्रिय';
  if ([1, 5, 9].includes(signIdx)) return 'वैश्य';
  return 'शूद्र';
}

// 6. Paya Classification (from Moon relative to Lagna)
export function getPaya(moonHouseFromLagna: number): { name: string; quality: string } {
  if ([1, 6, 11].includes(moonHouseFromLagna)) {
    return { name: 'स्वर्ण (सुनको पाया)', quality: 'अति शुभ / मध्यम' };
  }
  if ([2, 5, 9].includes(moonHouseFromLagna)) {
    return { name: 'रजत (चाँदीको पाया)', quality: 'अत्यन्त श्रेष्ठ तथा शुभ' };
  }
  if ([3, 7, 10].includes(moonHouseFromLagna)) {
    return { name: 'ताम्र (तामाको पाया)', quality: 'शुभ फलदायी' };
  }
  return { name: 'लोह (फलामको पाया)', quality: 'कष्टप्रद / शान्ति योग्य' };
}

// 7. Calculate Istakala (इष्टकाल) in Ghadi - Pala
export function calculateIstakala(tobStr: string, sunriseStr: string): { ghadi: number; pala: number; formatted: string } {
  try {
    const parseTimeToSeconds = (str: string) => {
      const parts = str.split(':').map((p) => parseInt(p, 10) || 0);
      const h = parts[0] || 0;
      const m = parts[1] || 0;
      const s = parts[2] || 0;
      return h * 3600 + m * 60 + s;
    };

    let tobSec = parseTimeToSeconds(tobStr);
    let sunSec = parseTimeToSeconds(sunriseStr);

    if (tobSec < sunSec) {
      tobSec += 86400; // After midnight prior to sunrise
    }

    const diffSec = tobSec - sunSec;
    // 1 Ghadi = 24 minutes = 1440 seconds
    const totalGhadi = diffSec / 1440;
    const ghadi = Math.floor(totalGhadi);
    const palaFloat = (totalGhadi - ghadi) * 60;
    const pala = Math.floor(palaFloat);

    return {
      ghadi,
      pala,
      formatted: `${ghadi} घडी ${pala} पला`,
    };
  } catch (e) {
    return { ghadi: 15, pala: 30, formatted: '१५ घडी ३० पला' };
  }
}

// 8. Ayana & Ritu
export function getAyanaAndRitu(dobStr: string): { ayana: string; ritu: string; samvatBS: number; samvatShak: number } {
  const date = new Date(dobStr);
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 1-12

  // Uttarayana roughly Jan 15 to Jul 15
  const dayOfYear = Math.floor((date.getTime() - new Date(year, 0, 0).getTime()) / 86400000);
  const isUttarayana = dayOfYear >= 14 && dayOfYear <= 196;

  let ritu = 'वसन्त';
  if (month === 5 || month === 6) ritu = 'ग्रीष्म';
  else if (month === 7 || month === 8) ritu = 'वर्षा';
  else if (month === 9 || month === 10) ritu = 'शरद';
  else if (month === 11 || month === 12) ritu = 'हेमन्त';
  else if (month === 1 || month === 2) ritu = 'शिशिर';

  // BS calculation approximation (AD + 56.7)
  const samvatBS = month >= 4 ? year + 57 : year + 56;
  const samvatShak = year - 78;

  return {
    ayana: isUttarayana ? 'उत्तरायण' : 'दक्षिणायन',
    ritu,
    samvatBS,
    samvatShak,
  };
}

// 9. Format Degree to Degree-Kala-Vikala string
export function formatDMS(deg: number): { d: number; m: number; s: number; formatted: string } {
  const pure = ((deg % 30) + 30) % 30;
  const d = Math.floor(pure);
  const minFloat = (pure - d) * 60;
  const m = Math.floor(minFloat);
  const s = Math.round((minFloat - m) * 60);

  const pad = (n: number) => n.toString().padStart(2, '0');
  return {
    d,
    m,
    s,
    formatted: `${d}° ${pad(m)}' ${pad(s)}"`,
  };
}

// 10. Samvatsara Name Map (60 Jupiter Cycles)
export const SAMVATSARA_60 = [
  'प्रभव', 'विभव', 'शुक्ल', 'प्रमोद', 'प्रजापति', 'अङ्गिरा', 'श्रीमुख', 'भाव', 'युवा', 'धाता',
  'ईश्वर', 'बहुधान्य', 'प्रमाथी', 'विक्रम', 'वृषप्रजा', 'चित्रभानु', 'सुभानु', 'तारण', 'पार्थिव', 'व्यय',
  'सर्वजित्', 'सर्वधारी', 'विरोधी', 'विकृति', 'खर', 'नन्दन', 'विजय', 'जय', 'मन्मथ', 'दुर्मुख',
  'हेमलम्ब', 'विलम्ब', 'विकारी', 'शार्वरी', 'प्लव', 'शुभकृत्', 'शोभन', 'क्रोधो', 'विश्वावसु', 'परावसु',
  'प्लवङ्ग', 'कीलक', 'सौम्य', 'साधारण', 'विरोधकृत्', 'परिधावी', 'प्रमादी', 'आनन्द', 'राक्षस', 'नल',
  'पिङ्गल', 'कालयुक्त', 'सिद्धार्थी', 'रौद्र', 'दुर्मति', 'दुन्दुभी', 'रुधिरोद्गारी', 'रक्ताक्ष', 'क्रोधन', 'क्षय'
];

export function getSamvatsaraName(samvatShak: number): string {
  const idx = (samvatShak + 12) % 60;
  return SAMVATSARA_60[idx] || 'आनन्द';
}

// 11. Detailed Planetary Status Calculation (Motion, Combustion, Dignity)
export interface DetailedGrahaStatus {
  motionNe: 'मार्गी' | 'वक्री';
  motionEn: 'Direct' | 'Retrograde';
  isCombust: boolean;
  combustionNe: 'अस्त' | 'उदय';
  combustionEn: 'Combust' | 'Rising';
  dignityNe: 'उच्च' | 'नीच' | 'स्वगृही' | 'मित्र' | 'शत्रु' | 'सम';
  dignityEn: 'Exalted' | 'Debilitated' | 'Own Sign' | 'Friendly' | 'Enemy' | 'Neutral';
  fullStatusNe: string; // e.g., "मार्गी, उदय, उच्च"
  fullStatusEn: string; // e.g., "Direct, Rising, Exalted"
}

const SIGN_RULERS: GrahaName[] = [
  'Mars',     // 0 Aries
  'Venus',    // 1 Taurus
  'Mercury',  // 2 Gemini
  'Moon',     // 3 Cancer
  'Sun',      // 4 Leo
  'Mercury',  // 5 Virgo
  'Venus',    // 6 Libra
  'Mars',     // 7 Scorpio
  'Jupiter',  // 8 Sagittarius
  'Saturn',   // 9 Capricorn
  'Saturn',   // 10 Aquarius
  'Jupiter',  // 11 Pisces
];

const GRAHA_RELATIONSHIPS: Record<GrahaName, { friends: GrahaName[]; enemies: GrahaName[] }> = {
  Sun: { friends: ['Moon', 'Mars', 'Jupiter'], enemies: ['Venus', 'Saturn'] },
  Moon: { friends: ['Sun', 'Mercury'], enemies: [] },
  Mars: { friends: ['Sun', 'Moon', 'Jupiter'], enemies: ['Mercury'] },
  Mercury: { friends: ['Sun', 'Venus'], enemies: ['Moon'] },
  Jupiter: { friends: ['Sun', 'Moon', 'Mars'], enemies: ['Mercury', 'Venus'] },
  Venus: { friends: ['Mercury', 'Saturn'], enemies: ['Sun', 'Moon'] },
  Saturn: { friends: ['Mercury', 'Venus'], enemies: ['Sun', 'Moon', 'Mars'] },
  Rahu: { friends: ['Venus', 'Saturn', 'Mercury'], enemies: ['Sun', 'Moon', 'Mars'] },
  Ketu: { friends: ['Mars', 'Venus', 'Jupiter'], enemies: ['Sun', 'Moon'] },
};

const EXALT_MAP: Record<GrahaName, number[]> = {
  Sun: [0], Moon: [1], Mars: [9], Mercury: [5], Jupiter: [3], Venus: [11], Saturn: [6], Rahu: [1, 2], Ketu: [7, 8]
};
const DEBIL_MAP: Record<GrahaName, number[]> = {
  Sun: [6], Moon: [7], Mars: [3], Mercury: [11], Jupiter: [9], Venus: [5], Saturn: [0], Rahu: [7, 8], Ketu: [1, 2]
};
const OWN_MAP: Record<GrahaName, number[]> = {
  Sun: [4], Moon: [3], Mars: [0, 7], Mercury: [2, 5], Jupiter: [8, 11], Venus: [1, 6], Saturn: [9, 10], Rahu: [10], Ketu: [7]
};

export function getDetailedGrahaStatus(
  name: GrahaName,
  siderealLongitude: number,
  signIndex: number,
  isRetrograde: boolean,
  sunLongitude: number
): DetailedGrahaStatus {
  // Motion
  const isNodes = name === 'Rahu' || name === 'Ketu';
  const motionNe = isNodes || isRetrograde ? 'वक्री' : 'मार्गी';
  const motionEn = isNodes || isRetrograde ? 'Retrograde' : 'Direct';

  // Combustion (अस्त / उदय)
  let isCombust = false;
  if (name !== 'Sun' && !isNodes) {
    let diff = Math.abs(siderealLongitude - sunLongitude) % 360;
    if (diff > 180) diff = 360 - diff;

    let limit = 15;
    if (name === 'Moon') limit = 12;
    else if (name === 'Mars') limit = 17;
    else if (name === 'Mercury') limit = isRetrograde ? 12 : 14;
    else if (name === 'Jupiter') limit = 11;
    else if (name === 'Venus') limit = isRetrograde ? 8 : 10;
    else if (name === 'Saturn') limit = 15;

    isCombust = diff <= limit;
  }

  const combustionNe = isCombust ? 'अस्त' : 'उदय';
  const combustionEn = isCombust ? 'Combust' : 'Rising';

  // Dignity
  let dignityNe: DetailedGrahaStatus['dignityNe'] = 'सम';
  let dignityEn: DetailedGrahaStatus['dignityEn'] = 'Neutral';

  if (EXALT_MAP[name]?.includes(signIndex)) {
    dignityNe = 'उच्च';
    dignityEn = 'Exalted';
  } else if (DEBIL_MAP[name]?.includes(signIndex)) {
    dignityNe = 'नीच';
    dignityEn = 'Debilitated';
  } else if (OWN_MAP[name]?.includes(signIndex)) {
    dignityNe = 'स्वगृही';
    dignityEn = 'Own Sign';
  } else {
    const ruler = SIGN_RULERS[signIndex];
    const rel = GRAHA_RELATIONSHIPS[name];
    if (rel && ruler) {
      if (rel.friends.includes(ruler)) {
        dignityNe = 'मित्र';
        dignityEn = 'Friendly';
      } else if (rel.enemies.includes(ruler)) {
        dignityNe = 'शत्रु';
        dignityEn = 'Enemy';
      } else {
        dignityNe = 'सम';
        dignityEn = 'Neutral';
      }
    }
  }

  return {
    motionNe,
    motionEn,
    isCombust,
    combustionNe,
    combustionEn,
    dignityNe,
    dignityEn,
    fullStatusNe: `${motionNe}, ${combustionNe}, ${dignityNe}`,
    fullStatusEn: `${motionEn}, ${combustionEn}, ${dignityEn}`,
  };
}
