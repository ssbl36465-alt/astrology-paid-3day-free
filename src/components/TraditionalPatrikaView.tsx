import React, { useState, useMemo } from 'react';
import { KundaliCalculationOutput, Language } from '../types/astrology';
import { RASHI_LIST, NAKSHATRA_LIST, GRAHA_MAP } from '../utils/i18n';
import {
  NAMAKSHAR_TABLE,
  getGana,
  getYoni,
  getNadi,
  getVarna,
  getPaya,
  calculateIstakala,
  getAyanaAndRitu,
  formatDMS,
  getSamvatsaraName,
} from '../utils/patrikaHelpers';
import { NorthIndianChart } from './NorthIndianChart';
import { SouthIndianChart } from './SouthIndianChart';
import { EastIndianChart } from './EastIndianChart';
import { calculateTribhagiDasha, calculateYoginiDasha } from '../engine/dashaEngine';
import { getNavamsaSign, getHoraSign } from '../engine/kundaliEngine';
import {
  calculateVimshottariSubperiods,
  calculateTribhagiSubperiods,
  calculateYoginiSubperiods,
} from '../engine/dashaSubPeriods';
import { DashaAccordion } from './DashaAccordion';
import { Printer, Scroll, UserCheck, Sparkles, BookOpen, ShieldCheck, MapPin, Clock, Layers, ArrowLeft } from 'lucide-react';

interface TraditionalPatrikaViewProps {
  data: KundaliCalculationOutput;
  language: Language;
  chartStyle?: 'north' | 'south' | 'east';
  onBack?: () => void;
}

export const TraditionalPatrikaView: React.FC<TraditionalPatrikaViewProps> = ({
  data,
  language,
  chartStyle = 'north',
  onBack,
}) => {
  const { birthDetails, panchanga, ascendant, grahas, vimshottariDasha, audit } = data;

  // Selected Chart Style state
  const [selectedChartStyle, setSelectedChartStyle] = useState<'north' | 'south' | 'east'>(chartStyle);

  // Editable lineage and astrologer state fields for personalized Patrika
  const [gotra, setGotra] = useState<string>('कश्यप');
  const [grandfatherName, setGrandfatherName] = useState<string>('');
  const [fatherName, setFatherName] = useState<string>('');
  const [motherName, setMotherName] = useState<string>('');
  const [astrologerName, setAstrologerName] = useState<string>('पं. ज्योतिषाचार्य');
  const [astrologerAddress, setAstrologerAddress] = useState<string>('काठमाडौँ, नेपाल');
  const [astrologerPhone, setAstrologerPhone] = useState<string>('+९७७-९८XXXXXXXX');

  // Moon Position & Nakshatra
  const moon = grahas.find((g) => g.name === 'Moon') || grahas[1];
  const moonRashi = RASHI_LIST[moon.signIndex];
  const moonNakshatra = NAKSHATRA_LIST[moon.nakshatraIndex];

  // Chandra Kundali Data
  const chandraData: KundaliCalculationOutput = useMemo(() => {
    return {
      ...data,
      ascendant: {
        ...data.ascendant,
        signIndex: moon.signIndex,
        signNameEn: moon.signNameEn,
        signNameNe: moon.signNameNe,
        signDegree: moon.signDegree,
        degreeFormatted: formatDMS(moon.signDegree).formatted,
      },
      houses: Array.from({ length: 12 }, (_, i) => {
        const houseSignIndex = (moon.signIndex + i) % 12;
        const rashi = RASHI_LIST[houseSignIndex];
        return {
          houseNumber: i + 1,
          signIndex: houseSignIndex,
          signNameEn: rashi.nameEn,
          signNameNe: rashi.nameNe,
          lord: rashi.ruler,
          occupyingGrahas: [],
          aspectingGrahas: [],
        };
      }),
      grahas: data.grahas.map((g) => {
        const houseFromMoon = ((g.signIndex - moon.signIndex + 12) % 12) + 1;
        return {
          ...g,
          house: houseFromMoon,
        };
      }),
    };
  }, [data, moon]);

  // Navamsha (D-9) Kundali Data
  const navamshaData: KundaliCalculationOutput = useMemo(() => {
    const navamsaLagnaSign = getNavamsaSign(ascendant.siderealDeg);
    return {
      ...data,
      ascendant: {
        ...data.ascendant,
        signIndex: navamsaLagnaSign,
        signNameEn: RASHI_LIST[navamsaLagnaSign].nameEn,
        signNameNe: RASHI_LIST[navamsaLagnaSign].nameNe,
      },
      houses: Array.from({ length: 12 }, (_, i) => {
        const houseSignIndex = (navamsaLagnaSign + i) % 12;
        const rashi = RASHI_LIST[houseSignIndex];
        return {
          houseNumber: i + 1,
          signIndex: houseSignIndex,
          signNameEn: rashi.nameEn,
          signNameNe: rashi.nameNe,
          lord: rashi.ruler,
          occupyingGrahas: [],
          aspectingGrahas: [],
        };
      }),
      grahas: data.grahas.map((g) => {
        const nSign = getNavamsaSign(g.siderealLongitude);
        const nHouse = ((nSign - navamsaLagnaSign + 12) % 12) + 1;
        return {
          ...g,
          signIndex: nSign,
          signNameEn: RASHI_LIST[nSign].nameEn,
          signNameNe: RASHI_LIST[nSign].nameNe,
          house: nHouse,
        };
      }),
    };
  }, [data, ascendant.siderealDeg]);

  // Hora (D-2) Kundali Data
  const horaData: KundaliCalculationOutput = useMemo(() => {
    const horaLagnaSign = getHoraSign(ascendant.siderealDeg);
    return {
      ...data,
      ascendant: {
        ...data.ascendant,
        signIndex: horaLagnaSign,
        signNameEn: RASHI_LIST[horaLagnaSign].nameEn,
        signNameNe: RASHI_LIST[horaLagnaSign].nameNe,
      },
      houses: Array.from({ length: 12 }, (_, i) => {
        const houseSignIndex = (horaLagnaSign + i) % 12;
        const rashi = RASHI_LIST[houseSignIndex];
        return {
          houseNumber: i + 1,
          signIndex: houseSignIndex,
          signNameEn: rashi.nameEn,
          signNameNe: rashi.nameNe,
          lord: rashi.ruler,
          occupyingGrahas: [],
          aspectingGrahas: [],
        };
      }),
      grahas: data.grahas.map((g) => {
        const hSign = getHoraSign(g.siderealLongitude);
        const hHouse = ((hSign - horaLagnaSign + 12) % 12) + 1;
        return {
          ...g,
          signIndex: hSign,
          signNameEn: RASHI_LIST[hSign].nameEn,
          signNameNe: RASHI_LIST[hSign].nameNe,
          house: hHouse,
        };
      }),
    };
  }, [data, ascendant.siderealDeg]);

  const moonPada = moon.pada;

  // 1. Janma Namakshar
  const namakshar = NAMAKSHAR_TABLE[moon.nakshatraIndex]?.[moonPada - 1] || 'अ';

  // 2. Avakahada Classifications
  const gana = getGana(moon.nakshatraIndex);
  const yoni = getYoni(moon.nakshatraIndex);
  const nadi = getNadi(moon.nakshatraIndex);
  const varna = getVarna(moon.signIndex);

  // House position of Moon from Lagna for Paya
  const moonHouseFromLagna = ((moon.signIndex - ascendant.signIndex + 12) % 12) + 1;
  const paya = getPaya(moonHouseFromLagna);

  // 3. Istakala (Ghadi-Pala)
  const istakala = calculateIstakala(birthDetails.tob, panchanga.sunrise);

  // 4. Ayana & Ritu & Samvat
  const { ayana, ritu, samvatBS, samvatShak } = getAyanaAndRitu(birthDetails.dob);
  const samvatsaraName = getSamvatsaraName(samvatShak);

  // Print Controls State
  const [includeSubperiodsInPrint, setIncludeSubperiodsInPrint] = useState<boolean>(false);
  const [selectedSubperiodSystem, setSelectedSubperiodSystem] = useState<'vimshottari' | 'tribhagi' | 'yogini'>('vimshottari');

  // 5. Dashas Calculation (Tribhagi & Yogini)
  const utcBirthDate = useMemo(() => {
    return audit?.utcDateString ? new Date(audit.utcDateString) : new Date();
  }, [audit?.utcDateString]);

  const triData = useMemo(() => {
    return calculateTribhagiDasha(
      moon.siderealLongitude,
      vimshottariDasha.startingLord,
      utcBirthDate,
      true
    );
  }, [moon.siderealLongitude, vimshottariDasha.startingLord, utcBirthDate]);

  const yogData = useMemo(() => {
    return calculateYoginiDasha(
      moon.siderealLongitude,
      moon.nakshatraIndex,
      utcBirthDate,
      true
    );
  }, [moon.siderealLongitude, moon.nakshatraIndex, utcBirthDate]);

  // Exact Subperiod Calculations (Mahadasha, Antardasha, Pratyantardasha)
  const vimSubperiods = useMemo(() => {
    return calculateVimshottariSubperiods(
      moon.siderealLongitude,
      vimshottariDasha.startingLord,
      utcBirthDate
    );
  }, [moon.siderealLongitude, vimshottariDasha.startingLord, utcBirthDate]);

  const triSubperiods = useMemo(() => {
    return calculateTribhagiSubperiods(
      moon.siderealLongitude,
      vimshottariDasha.startingLord,
      utcBirthDate
    );
  }, [moon.siderealLongitude, vimshottariDasha.startingLord, utcBirthDate]);

  const yogSubperiods = useMemo(() => {
    return calculateYoginiSubperiods(
      moon.siderealLongitude,
      moon.nakshatraIndex,
      utcBirthDate
    );
  }, [moon.siderealLongitude, moon.nakshatraIndex, utcBirthDate]);

  const activeSubperiodData =
    selectedSubperiodSystem === 'tribhagi'
      ? triSubperiods
      : selectedSubperiodSystem === 'yogini'
      ? yogSubperiods
      : vimSubperiods;

  const activeSystemName =
    selectedSubperiodSystem === 'tribhagi'
      ? 'त्रिभागी दशा (८० वर्ष चक्र)'
      : selectedSubperiodSystem === 'yogini'
      ? 'योगिनी दशा (७२ वर्ष चक्र)'
      : 'विंशोत्तरी दशा (१२० वर्ष चक्र)';

  const handlePrint = () => {
    window.print();
  };

  const renderChart = (chartData: KundaliCalculationOutput, chartTitle: string) => {
    if (selectedChartStyle === 'south') {
      return <SouthIndianChart data={chartData} language={language} title={chartTitle} />;
    }
    if (selectedChartStyle === 'east') {
      return <EastIndianChart data={chartData} language={language} title={chartTitle} />;
    }
    return <NorthIndianChart data={chartData} language={language} title={chartTitle} />;
  };

  return (
    <div className="space-y-6">
      {/* Top Interactive Controls Banner (Hidden in Print) */}
      <div className="bg-slate-900 border border-amber-900/60 rounded-2xl p-4 sm:p-6 shadow-2xl print:hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg sm:text-xl font-serif font-bold text-amber-200 flex items-center gap-2">
            <Scroll className="w-6 h-6 text-amber-400" />
            परम्परागत नेपाली हस्तलिखित शैली चिना (Traditional Nepalese Patrika)
          </h2>
          <p className="text-xs text-amber-300/80 mt-1">
            नेपाली परम्परा अनुसार निर्मित २-पेजको मुद्रणयोग्य (Print-Ready A4) विस्तृत जन्म कुण्डली तथा पञ्चाङ्ग चिना पत्र।
          </p>
        </div>

        <div className="flex items-center gap-2 self-stretch md:self-auto">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer justify-center"
            >
              <ArrowLeft className="w-4 h-4" />
              गृहपृष्ठमा फर्कनुहोस् (Home)
            </button>
          )}
          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-3 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-950 font-extrabold rounded-xl shadow-lg hover:shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer justify-center flex-1 md:flex-initial"
          >
            <Printer className="w-5 h-5 text-slate-950" />
            चिना प्रिन्ट / PDF डाउनलोड गर्नुहोस्
          </button>
        </div>
      </div>

      {/* Editable Inputs Toolbar for Lineage & Astrologer (Hidden in Print) */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-md print:hidden space-y-3">
        <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
          <UserCheck className="w-4 h-4 text-amber-400" />
          वंश विवरण तथा ज्योतिषाचार्य जानकारी प्रविष्टि (प्रिन्ट अघि मिलाउनुहोस्)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">वंश गोत्र (Gotra):</label>
            <input
              type="text"
              value={gotra}
              onChange={(e) => setGotra(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-amber-100 rounded px-2.5 py-1.5"
              placeholder="उदा. कश्यप"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">हजुरबुबाको नाम:</label>
            <input
              type="text"
              value={grandfatherName}
              onChange={(e) => setGrandfatherName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-amber-100 rounded px-2.5 py-1.5"
              placeholder="हजुरबुबाको नाम"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">बुबाको नाम:</label>
            <input
              type="text"
              value={fatherName}
              onChange={(e) => setFatherName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-amber-100 rounded px-2.5 py-1.5"
              placeholder="बुबाको नाम"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">आमाको नाम:</label>
            <input
              type="text"
              value={motherName}
              onChange={(e) => setMotherName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-amber-100 rounded px-2.5 py-1.5"
              placeholder="आमाको नाम"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs pt-1 border-t border-slate-800">
          <div>
            <label className="block text-slate-400 mb-1">कुण्डली चक्र शैली (Chart Style):</label>
            <select
              value={selectedChartStyle}
              onChange={(e) => setSelectedChartStyle(e.target.value as 'north' | 'south' | 'east')}
              className="w-full bg-slate-900 border border-slate-700 text-amber-100 rounded px-2.5 py-1.5"
            >
              <option value="north">उत्तरी भारतीय (North Indian)</option>
              <option value="south">दक्षिणी भारतीय (South Indian)</option>
              <option value="east">पूर्वीय भारतीय (East Indian)</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-400 mb-1">ज्योतिषी / लेखकको नाम:</label>
            <input
              type="text"
              value={astrologerName}
              onChange={(e) => setAstrologerName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-amber-100 rounded px-2.5 py-1.5"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">ठेगाना:</label>
            <input
              type="text"
              value={astrologerAddress}
              onChange={(e) => setAstrologerAddress(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-amber-100 rounded px-2.5 py-1.5"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">सम्पर्क नम्बर:</label>
            <input
              type="text"
              value={astrologerPhone}
              onChange={(e) => setAstrologerPhone(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-amber-100 rounded px-2.5 py-1.5"
            />
          </div>
        </div>

        {/* Print Control Toggle Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-slate-800/80 text-xs bg-slate-950/60 p-3 rounded-xl border border-amber-900/40">
          <label className="flex items-center gap-2.5 cursor-pointer text-amber-200 font-bold select-none">
            <input
              type="checkbox"
              checked={includeSubperiodsInPrint}
              onChange={(e) => setIncludeSubperiodsInPrint(e.target.checked)}
              className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 bg-slate-900 border-slate-700"
            />
            <span className="flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-amber-400" />
              प्रिन्टमा अन्तर्दशा/प्रत्यन्तर्दशा विवरण पनि समावेश गर्नुहोस् (Include Antardasha in Print)
            </span>
          </label>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-slate-400 text-[11px]">दशा प्रणाली:</span>
            <select
              value={selectedSubperiodSystem}
              onChange={(e) => setSelectedSubperiodSystem(e.target.value as 'vimshottari' | 'tribhagi' | 'yogini')}
              className="bg-slate-900 border border-slate-700 text-amber-200 rounded px-2.5 py-1 text-xs font-bold"
            >
              <option value="vimshottari">विंशोत्तरी (Vimshottari 120y)</option>
              <option value="tribhagi">त्रिभागी (Tribhagi 80y)</option>
              <option value="yogini">योगिनी (Yogini 72y)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PRINT CONTAINER: PAGE 1 & PAGE 2 LAYOUT */}
      {/* ========================================================================= */}
      <div className="patrika-print-container bg-slate-950 text-slate-900 flex flex-col items-center gap-8 py-4">

        {/* ----------------------------------------------------------------------- */}
        {/* PAGE 1: PANCHANGA, SANKALPA, VAMSHA VIVARAN & AVAKAHADA CHAKRA */}
        {/* ----------------------------------------------------------------------- */}
        <div className="patrika-page bg-[#fdfbf7] text-[#1c0d02] w-full max-w-[210mm] min-h-[297mm] p-6 border-[8px] border-[#78350f] rounded-lg shadow-2xl relative flex flex-col justify-between font-serif">
          {/* Inner Decorative Double Border */}
          <div className="border-2 border-[#92400e] border-dashed p-4 h-full flex flex-col justify-between">

            {/* Corner Decorative "ॐ" Symbols */}
            <span className="absolute top-3 left-3 text-[#78350f] text-xl font-bold">ॐ</span>
            <span className="absolute top-3 right-3 text-[#78350f] text-xl font-bold">ॐ</span>
            <span className="absolute bottom-3 left-3 text-[#78350f] text-xl font-bold">ॐ</span>
            <span className="absolute bottom-3 right-3 text-[#78350f] text-xl font-bold">ॐ</span>

            {/* Page 1 Header */}
            <div className="text-center border-b-2 border-[#78350f] pb-3 mb-3">
              <div className="text-[#991b1b] font-extrabold text-sm sm:text-base tracking-widest uppercase mb-1">
                ॥ श्री मन्महागणपतये नमः ॥ श्री सरस्वत्यै नमः ॥ श्री कुलदेवताभ्यो नमः ॥
              </div>
              <div className="text-xl sm:text-2xl font-black text-[#78350f] font-serif py-1 flex items-center justify-center gap-2">
                <span>🚩</span>
                <span>अथ जन्म पत्रिका तथा पञ्चाङ्ग विवरण</span>
                <span>🚩</span>
              </div>
              <p className="text-xs text-[#881337] italic font-semibold max-w-xl mx-auto">
                "श्री वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ। निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥"
              </p>
            </div>

            {/* 1. Sankalpa & Location Description */}
            <div className="bg-[#fff7ed] border border-[#d97706] rounded p-2.5 mb-3 text-[11px] leading-relaxed text-[#78350f] text-justify">
              <span className="font-bold text-[#991b1b]">देश, काल तथा सङ्कल्प विवरण: </span>
              ॐ तत्सत् श्रीब्रह्मणो द्वितीये परार्धे श्वेतावराहकल्पे वैवस्वतमन्वन्तरे अष्टाविंशतितमे कलियुगे कलिप्रथमचरणे जम्बूद्वीपे भारतवर्षे हिमवत्खण्डे नेपालदेशे {birthDetails.birthPlace} नगरसमीपे अक्षांश {birthDetails.latitude}°N देशान्तर {birthDetails.longitude}°E मध्ये।
            </div>

            {/* 2. Lineage & Jatak Details Box */}
            <div className="border border-[#78350f] rounded bg-[#fffbeb] p-3 mb-3 text-xs leading-relaxed">
              <h4 className="font-bold text-[#991b1b] border-b border-[#d97706] pb-1 mb-2 text-center text-sm">
                ॥ वंश विवरण तथा जातकांग परिचय ॥
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2 gap-x-4">
                <div><span className="font-bold text-[#78350f]">वंश गोत्र:</span> {gotra || '—'}</div>
                <div><span className="font-bold text-[#78350f]">प्रपितामह/पितामह:</span> {grandfatherName || '—'}</div>
                <div><span className="font-bold text-[#78350f]">पिताको नाम:</span> {fatherName || '—'}</div>
                <div><span className="font-bold text-[#78350f]">माताको नाम:</span> {motherName || '—'}</div>
                <div className="col-span-2"><span className="font-bold text-[#991b1b] text-sm">जातकांग (शिशुको नाम):</span> <strong className="text-sm underline decoration-amber-700">{birthDetails.name}</strong></div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-1.5 gap-x-4 pt-2 border-t border-[#d97706]/40 mt-2 text-[11px]">
                <div><span className="font-bold text-[#78350f]">जन्म मिति (ई.सं.):</span> {birthDetails.dob}</div>
                <div><span className="font-bold text-[#78350f]">विक्रम संवत् (B.S.):</span> वि.सं. {samvatBS}</div>
                <div><span className="font-bold text-[#78350f]">जन्म समय:</span> {birthDetails.tob} (Exact 24hr)</div>
                <div><span className="font-bold text-[#78350f]">इष्टकाल:</span> {istakala.formatted}</div>
                <div className="col-span-2"><span className="font-bold text-[#78350f]">जन्म स्थान:</span> {birthDetails.birthPlace}</div>
              </div>
            </div>

            {/* 3. Panchanga Table */}
            <div className="mb-3">
              <h4 className="font-bold text-[#991b1b] text-xs uppercase tracking-wider mb-1.5 flex items-center justify-between border-b border-[#78350f] pb-1">
                <span>॥ जन्मकालीन पञ्चाङ्ग तथा गणितीय विवरण ॥</span>
                <span className="text-[10px] text-[#78350f] italic">संवत्सर: {samvatsaraName}</span>
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-[11px] border-collapse border border-[#78350f] text-center bg-white">
                  <thead>
                    <tr className="bg-[#fef3c7] text-[#78350f] font-bold">
                      <th className="border border-[#78350f] p-1.5">पञ्चाङ्ग अङ्ग</th>
                      <th className="border border-[#78350f] p-1.5">नाम / विवरण</th>
                      <th className="border border-[#78350f] p-1.5">मान / स्वामी</th>
                      <th className="border border-[#78350f] p-1.5">विशेष</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-[#78350f] p-1 font-bold bg-[#fffbeb]">संवत् तथा आयन</td>
                      <td className="border border-[#78350f] p-1">वि.सं. {samvatBS} / शक {samvatShak}</td>
                      <td className="border border-[#78350f] p-1">{ayana}</td>
                      <td className="border border-[#78350f] p-1">{ritu} ऋतु</td>
                    </tr>
                    <tr>
                      <td className="border border-[#78350f] p-1 font-bold bg-[#fffbeb]">तिथि (Tithi)</td>
                      <td className="border border-[#78350f] p-1 font-bold text-[#991b1b]">{panchanga.tithi.nameNe}</td>
                      <td className="border border-[#78350f] p-1">{panchanga.tithi.pakshaNe} पक्ष</td>
                      <td className="border border-[#78350f] p-1">{panchanga.tithi.percentageLeft.toFixed(1)}% बाँकी</td>
                    </tr>
                    <tr>
                      <td className="border border-[#78350f] p-1 font-bold bg-[#fffbeb]">वार (Vara)</td>
                      <td className="border border-[#78350f] p-1">{panchanga.vara.nameNe}</td>
                      <td className="border border-[#78350f] p-1">स्वामी: {GRAHA_MAP[panchanga.vara.ruler]?.ne}</td>
                      <td className="border border-[#78350f] p-1">सूर्योदय: {panchanga.sunrise}</td>
                    </tr>
                    <tr>
                      <td className="border border-[#78350f] p-1 font-bold bg-[#fffbeb]">नक्षत्र (Nakshatra)</td>
                      <td className="border border-[#78350f] p-1 font-bold text-[#991b1b]">{moonNakshatra.nameNe}</td>
                      <td className="border border-[#78350f] p-1">{moonPada} चरण (पद)</td>
                      <td className="border border-[#78350f] p-1">स्वामी: {GRAHA_MAP[moonNakshatra.ruler]?.ne}</td>
                    </tr>
                    <tr>
                      <td className="border border-[#78350f] p-1 font-bold bg-[#fffbeb]">योग (Yoga)</td>
                      <td className="border border-[#78350f] p-1">{panchanga.yoga.nameNe}</td>
                      <td className="border border-[#78350f] p-1">Soli-Lunar Yoga</td>
                      <td className="border border-[#78350f] p-1">इष्टकाल: {istakala.formatted}</td>
                    </tr>
                    <tr>
                      <td className="border border-[#78350f] p-1 font-bold bg-[#fffbeb]">करण (Karana)</td>
                      <td className="border border-[#78350f] p-1">{panchanga.karana.nameNe}</td>
                      <td className="border border-[#78350f] p-1">Half Tithi</td>
                      <td className="border border-[#78350f] p-1">सूर्यास्त: {panchanga.sunset}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4. Avakahada Chakra & Naming Classification Box */}
            <div className="border-2 border-[#991b1b] rounded-lg bg-[#fffbeb] p-3">
              <h4 className="font-bold text-[#991b1b] text-center text-xs uppercase tracking-wider mb-2 border-b border-[#d97706] pb-1">
                ॥ अवकहडा चक्र तथा नामाक्षर वर्गीकरण (Avakahada Chakra) ॥
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-semibold">
                <div className="bg-white border border-[#d97706] rounded p-2">
                  <div className="text-[10px] text-[#78350f]">जन्म नामाक्षर</div>
                  <div className="text-xl font-black text-[#991b1b] mt-0.5">{namakshar}</div>
                </div>
                <div className="bg-white border border-[#d97706] rounded p-2">
                  <div className="text-[10px] text-[#78350f]">जन्म राशि</div>
                  <div className="text-sm font-bold text-[#78350f] mt-1">{moonRashi.nameNe} ({moonRashi.sanskritName})</div>
                </div>
                <div className="bg-white border border-[#d97706] rounded p-2">
                  <div className="text-[10px] text-[#78350f]">नक्षत्र तथा पद</div>
                  <div className="text-xs font-bold text-[#78350f] mt-1">{moonNakshatra.nameNe} ({moonPada}-चरण)</div>
                </div>
                <div className="bg-white border border-[#d97706] rounded p-2">
                  <div className="text-[10px] text-[#78350f]">गण (Gana)</div>
                  <div className="text-sm font-bold text-[#991b1b] mt-1">{gana} गण</div>
                </div>

                <div className="bg-white border border-[#d97706] rounded p-2">
                  <div className="text-[10px] text-[#78350f]">योनि (Yoni)</div>
                  <div className="text-xs font-bold text-[#78350f] mt-1">{yoni}</div>
                </div>
                <div className="bg-white border border-[#d97706] rounded p-2">
                  <div className="text-[10px] text-[#78350f]">नाडी (Nadi)</div>
                  <div className="text-xs font-bold text-[#78350f] mt-1">{nadi} नाडी</div>
                </div>
                <div className="bg-white border border-[#d97706] rounded p-2">
                  <div className="text-[10px] text-[#78350f]">वर्ण (Varna)</div>
                  <div className="text-xs font-bold text-[#78350f] mt-1">{varna} वर्ण</div>
                </div>
                <div className="bg-white border border-[#d97706] rounded p-2">
                  <div className="text-[10px] text-[#78350f]">पाया (Paya)</div>
                  <div className="text-[11px] font-bold text-[#991b1b] mt-0.5">{paya.name}</div>
                </div>
              </div>
            </div>

            {/* Page 1 Footer stamp */}
            <div className="text-center text-[10px] text-[#78350f] pt-2 border-t border-[#d97706]/50 mt-2 flex items-center justify-between">
              <span>नेपाल परम्परागत जन्म कुण्डली (पृष्ठ १ / २)</span>
              <span>लाहिरी अयनांश: {data.audit.lahiriAyanamsaFormatted}</span>
            </div>

          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* PAGE 2: GRAHA SPASHTA, CIRCULAR CHARTS, DASHA TABLES & ASTROLOGER FOOTER */}
        {/* ----------------------------------------------------------------------- */}
        <div className="patrika-page bg-[#fdfbf7] text-[#1c0d02] w-full max-w-[210mm] min-h-[297mm] p-6 border-[8px] border-[#78350f] rounded-lg shadow-2xl relative flex flex-col justify-between font-serif">
          {/* Inner Decorative Double Border */}
          <div className="border-2 border-[#92400e] border-dashed p-4 h-full flex flex-col justify-between">

            {/* Corner Decorative "श्री" Symbols */}
            <span className="absolute top-3 left-3 text-[#78350f] text-xl font-bold">श्री</span>
            <span className="absolute top-3 right-3 text-[#78350f] text-xl font-bold">श्री</span>
            <span className="absolute bottom-3 left-3 text-[#78350f] text-xl font-bold">श्री</span>
            <span className="absolute bottom-3 right-3 text-[#78350f] text-xl font-bold">श्री</span>

            {/* Page 2 Header */}
            <div className="text-center border-b-2 border-[#78350f] pb-2 mb-3">
              <div className="text-lg font-black text-[#78350f] font-serif uppercase">
                ॥ ग्रह स्पष्ट, लग्न तथा चन्द्र कुण्डली चक्र र दशा सारणी ॥
              </div>
            </div>

            {/* 1. Graha Spashta Table */}
            <div className="mb-3">
              <h4 className="font-bold text-[#991b1b] text-xs uppercase tracking-wider mb-1 flex items-center justify-between border-b border-[#78350f] pb-0.5">
                <span>१. ग्रह स्पष्ट तथा अवस्थिति सारणी (Sphuta Planet Table)</span>
                <span className="text-[10px] text-[#78350f]">अंश/कला/विकला सटिक</span>
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-[10px] border-collapse border border-[#78350f] text-center bg-white">
                  <thead>
                    <tr className="bg-[#fef3c7] text-[#78350f] font-bold">
                      <th className="border border-[#78350f] p-1">ग्रह / लग्न</th>
                      <th className="border border-[#78350f] p-1">राशि (Sign)</th>
                      <th className="border border-[#78350f] p-1">अंश ° कला ' विकला "</th>
                      <th className="border border-[#78350f] p-1">नक्षत्र</th>
                      <th className="border border-[#78350f] p-1">पद</th>
                      <th className="border border-[#78350f] p-1">भाव</th>
                      <th className="border border-[#78350f] p-1">अवस्था / गति</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Lagna Row */}
                    <tr className="bg-[#fffbeb] font-bold">
                      <td className="border border-[#78350f] p-1 text-[#991b1b]">लग्न (Lagna)</td>
                      <td className="border border-[#78350f] p-1">{ascendant.signNameNe}</td>
                      <td className="border border-[#78350f] p-1">{ascendant.degreeFormatted}</td>
                      <td className="border border-[#78350f] p-1">{ascendant.nakshatraNameNe}</td>
                      <td className="border border-[#78350f] p-1">{ascendant.pada}</td>
                      <td className="border border-[#78350f] p-1">१</td>
                      <td className="border border-[#78350f] p-1">लग्न केन्द्र</td>
                    </tr>
                    {/* 9 Planets Rows */}
                    {grahas.map((g) => {
                      const dms = formatDMS(g.signDegree);
                      const gInfo = GRAHA_MAP[g.name];
                      return (
                        <tr key={g.name} className="hover:bg-[#fef3c7]/30">
                          <td className="border border-[#78350f] p-1 font-bold" style={{ color: gInfo.color }}>
                            {gInfo.ne} ({g.name})
                          </td>
                          <td className="border border-[#78350f] p-1">{g.signNameNe}</td>
                          <td className="border border-[#78350f] p-1 font-mono">{dms.formatted}</td>
                          <td className="border border-[#78350f] p-1">{g.nakshatraNameNe}</td>
                          <td className="border border-[#78350f] p-1">{g.pada}</td>
                          <td className="border border-[#78350f] p-1">{g.house}</td>
                          <td className="border border-[#78350f] p-1 font-semibold text-[9.5px]">
                            {g.fullStatusNe || `${g.isRetrograde ? 'वक्री' : 'मार्गी'}, ${g.isCombust ? 'अस्त' : 'उदय'}, ${g.dignityNe || 'सम'}`}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 2. 4 Key Kundali Charts (Lagna, Rashi, Navamsha D-9, Hora D-2) */}
            <div className="mb-3">
              <h4 className="font-bold text-[#991b1b] text-xs uppercase tracking-wider mb-1.5 border-b border-[#78350f] pb-0.5 text-center">
                ॥ २. जन्म (लग्न), चन्द्र (राशि), नवमांश (D-9) तथा होरा (D-2) कुण्डली चक्र ॥
              </h4>
              <div className="grid grid-cols-2 gap-2.5 items-center justify-center">
                <div className="border border-[#78350f] rounded-lg p-1 bg-[#fffbeb] shadow-sm">
                  {renderChart(data, language === 'ne' ? '१. D1 जन्म (लग्न) कुण्डली' : '1. D1 Birth (Lagna) Chart')}
                </div>
                <div className="border border-[#78350f] rounded-lg p-1 bg-[#fffbeb] shadow-sm">
                  {renderChart(chandraData, language === 'ne' ? '२. चन्द्र (राशि) कुण्डली' : '2. Chandra (Moon) Chart')}
                </div>
                <div className="border border-[#78350f] rounded-lg p-1 bg-[#fffbeb] shadow-sm">
                  {renderChart(navamshaData, language === 'ne' ? '३. D9 नवमांश कुण्डली' : '3. D9 Navamsha Chart')}
                </div>
                <div className="border border-[#78350f] rounded-lg p-1 bg-[#fffbeb] shadow-sm">
                  {renderChart(horaData, language === 'ne' ? '४. D2 होरा कुण्डली' : '4. D2 Hora Chart')}
                </div>
              </div>
            </div>

            {/* 3. Dasha Summary Tables (Vimshottari, Tribhagi, Yogini) */}
            <div className="mb-3">
              <h4 className="font-bold text-[#991b1b] text-xs uppercase tracking-wider mb-1.5 border-b border-[#78350f] pb-0.5">
                ३. दशा प्रणाली विवरण (Vimshottari, Tribhagi & Yogini Dashas)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px]">

                {/* Vimshottari Table */}
                <div className="border border-[#78350f] rounded bg-white p-1.5">
                  <div className="font-bold text-[#991b1b] text-center border-b border-[#78350f] pb-0.5 mb-1">
                    विंशोत्तरी दशा (१२० वर्ष)
                  </div>
                  <div className="space-y-0.5 max-h-[110px] overflow-y-auto">
                    {vimshottariDasha.mahadashas.slice(0, 9).map((m) => (
                      <div
                        key={m.planet}
                        className={`flex justify-between px-1 rounded ${
                          m.isCurrent ? 'bg-[#fef3c7] font-bold text-[#991b1b]' : 'text-slate-800'
                        }`}
                      >
                        <span>{GRAHA_MAP[m.planet]?.ne}</span>
                        <span>{new Date(m.startDate).getFullYear()}-{new Date(m.endDate).getFullYear()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tribhagi Table */}
                <div className="border border-[#78350f] rounded bg-white p-1.5">
                  <div className="font-bold text-[#991b1b] text-center border-b border-[#78350f] pb-0.5 mb-1">
                    त्रिभागी दशा (८० वर्ष)
                  </div>
                  <div className="space-y-0.5 max-h-[110px] overflow-y-auto">
                    {triData.mahadashas.slice(0, 9).map((m) => (
                      <div
                        key={m.planet}
                        className={`flex justify-between px-1 rounded ${
                          m.isCurrent ? 'bg-[#fef3c7] font-bold text-[#991b1b]' : 'text-slate-800'
                        }`}
                      >
                        <span>{GRAHA_MAP[m.planet]?.ne}</span>
                        <span>{new Date(m.startDate).getFullYear()}-{new Date(m.endDate).getFullYear()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Yogini Table */}
                <div className="border border-[#78350f] rounded bg-white p-1.5">
                  <div className="font-bold text-[#991b1b] text-center border-b border-[#78350f] pb-0.5 mb-1">
                    योगिनी दशा (३६ वर्ष चक्र)
                  </div>
                  <div className="space-y-0.5 max-h-[110px] overflow-y-auto">
                    {yogData.mahadashas.slice(0, 8).map((m) => (
                      <div
                        key={m.yoginiName}
                        className={`flex justify-between px-1 rounded ${
                          m.isCurrent ? 'bg-[#fef3c7] font-bold text-[#991b1b]' : 'text-slate-800'
                        }`}
                      >
                        <span>{m.yoginiNameNe} ({GRAHA_MAP[m.ruler]?.ne})</span>
                        <span>{new Date(m.startDate).getFullYear()}-{new Date(m.endDate).getFullYear()}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* 4. Astrologer / Writer Footer Block */}
            <div className="border-2 border-[#78350f] rounded-lg bg-[#fffbeb] p-3 mt-1">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <h5 className="font-bold text-[#991b1b] border-b border-[#d97706] pb-0.5 mb-1">
                    ज्योतिषाचार्य / लेखक विवरण:
                  </h5>
                  <p className="font-bold text-[#78350f]">{astrologerName}</p>
                  <p className="text-[11px] text-slate-700">ठेगाना: {astrologerAddress}</p>
                  <p className="text-[11px] text-slate-700">सम्पर्क: {astrologerPhone}</p>
                </div>
                <div className="border-l border-[#d97706] pl-4 flex flex-col justify-between">
                  <div className="font-bold text-[#991b1b] text-right">
                    हस्ताक्षर तथा seal / छाप:
                  </div>
                  <div className="h-10 border-b border-dashed border-[#78350f] my-1"></div>
                  <div className="flex justify-between text-[10px] text-[#78350f]">
                    <span>मिति: {new Date().toISOString().split('T')[0]}</span>
                    <span>शुभम् भूयात् ॥</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Page 2 Footer stamp */}
            <div className="text-center text-[10px] text-[#78350f] pt-2 border-t border-[#d97706]/50 mt-2 flex items-center justify-between">
              <span>नेपाल परम्परागत जन्म कुण्डली {includeSubperiodsInPrint ? '(पृष्ठ २ / ३)' : '(पृष्ठ २ / २)'}</span>
              <span>वैदिक जन्म कुण्डली इन्जिन स्वचलित गणना प्रणाली</span>
            </div>

          </div>
        </div>

        {/* ----------------------------------------------------------------------- */}
        {/* OPTIONAL PAGE 3 FOR PRINT: DETAILED ANTARDASHA & PRATYANTARDASHA TABLE */}
        {/* ----------------------------------------------------------------------- */}
        {includeSubperiodsInPrint && (
          <div className="patrika-page bg-[#fdfbf7] text-[#1c0d02] w-full max-w-[210mm] min-h-[297mm] p-6 border-[8px] border-[#78350f] rounded-lg shadow-2xl relative flex flex-col justify-between font-serif">
            <div className="border-2 border-[#92400e] border-dashed p-4 h-full flex flex-col justify-between">
              <span className="absolute top-3 left-3 text-[#78350f] text-xl font-bold">ॐ</span>
              <span className="absolute top-3 right-3 text-[#78350f] text-xl font-bold">ॐ</span>
              <span className="absolute bottom-3 left-3 text-[#78350f] text-xl font-bold">ॐ</span>
              <span className="absolute bottom-3 right-3 text-[#78350f] text-xl font-bold">ॐ</span>

              <div>
                <div className="text-center border-b-2 border-[#78350f] pb-2 mb-3">
                  <div className="text-base font-black text-[#78350f] font-serif uppercase">
                    ॥ {activeSystemName} - विस्तृत अन्तर्दशा तथा प्रत्यन्तर्दशा सारणी ॥
                  </div>
                  <p className="text-[11px] text-[#881337] italic">
                    जातक: {birthDetails.name || 'नाम नखुलेको'} | जन्म: {birthDetails.dob} {birthDetails.tob}
                  </p>
                </div>

                <DashaAccordion
                  mahadashas={activeSubperiodData}
                  language={language}
                  systemName={activeSystemName}
                  isPrintMode={true}
                />
              </div>

              <div className="text-center text-[10px] text-[#78350f] pt-2 border-t border-[#d97706]/50 mt-4 flex items-center justify-between">
                <span>नेपाल परम्परागत जन्म कुण्डली (पृष्ठ ३ / ३ - अन्तर्दशा विवरण)</span>
                <span>वैदिक जन्म कुण्डली इन्जिन स्वचलित गणना प्रणाली</span>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ----------------------------------------------------------------------- */}
      {/* INTERACTIVE EXPANDABLE ACCORDION SECTION (FOR ON-SCREEN VIEWING) */}
      {/* ----------------------------------------------------------------------- */}
      <div className="bg-slate-900 border border-amber-900/60 rounded-2xl p-4 sm:p-6 shadow-2xl print:hidden space-y-4 max-w-[210mm] mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-amber-900/40">
          <div>
            <h3 className="text-base font-serif font-bold text-amber-200 flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400" />
              ॥ अन्तर्दशा र प्रत्यन्तर्दशा विस्तृत हेर्नुहोस् (Interactive Subperiods) ॥
            </h3>
            <p className="text-xs text-amber-300/80 mt-0.5">
              कुनै पनि महादशामा थिचेर त्यसका ९ वटा अन्तर्दशा र प्रत्यन्तर्दशाहरू हेर्नुहोस्।
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setSelectedSubperiodSystem('vimshottari')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedSubperiodSystem === 'vimshottari'
                  ? 'bg-amber-600 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              विंशोत्तरी (120y)
            </button>
            <button
              type="button"
              onClick={() => setSelectedSubperiodSystem('tribhagi')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedSubperiodSystem === 'tribhagi'
                  ? 'bg-amber-600 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              त्रिभागी (80y)
            </button>
            <button
              type="button"
              onClick={() => setSelectedSubperiodSystem('yogini')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedSubperiodSystem === 'yogini'
                  ? 'bg-purple-600 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              योगिनी (72y)
            </button>
          </div>
        </div>

        <DashaAccordion
          mahadashas={activeSubperiodData}
          language={language}
          systemName={activeSystemName}
          isPrintMode={false}
        />
      </div>

      {/* Print Specific CSS to handle clean A4 pages */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          /* Hide non-printable UI elements */
          header, nav, sidebar, button, .print\\:hidden {
            display: none !important;
          }
          .patrika-print-container {
            padding: 0 !important;
            gap: 0 !important;
            background: transparent !important;
          }
          .patrika-page {
            box-shadow: none !important;
            border-radius: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            min-height: 297mm !important;
            page-break-after: always !important;
            page-break-inside: avoid !important;
            margin: 0 !important;
            padding: 12mm !important;
            background-color: #fdfbf7 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
};
