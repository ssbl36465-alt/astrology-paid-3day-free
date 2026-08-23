import React, { useState, useEffect } from 'react';
import { KundaliCalculationOutput, Language } from '../types/astrology';
import { calculateDetailedCurrentDasha, DashaSystemType, DetailedCurrentDashaResult } from '../engine/pratyantardashaEngine';
import { calculateLiveTransit, TransitCalculationResult } from '../engine/transitEngine';
import { convertADToBS, formatDualDate } from '../utils/nepaliCalendar';
import { RASHI_LIST, NAKSHATRA_LIST, GRAHA_MAP } from '../utils/i18n';
import {
  Clock,
  Compass,
  Calendar,
  RefreshCw,
  Sparkles,
  SlidersHorizontal,
  Layers,
  ArrowRight,
  Info,
  Radio,
  CheckCircle2,
  ChevronRight,
  Zap,
} from 'lucide-react';

interface CurrentDashaAndTransitViewProps {
  data: KundaliCalculationOutput;
  language: Language;
}

export const CurrentDashaAndTransitView: React.FC<CurrentDashaAndTransitViewProps> = ({
  data,
  language,
}) => {
  const isNe = language === 'ne';

  // Live Date State
  const [targetDateStr, setTargetDateStr] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [dashaSystem, setDashaSystem] = useState<DashaSystemType>('vimshottari');
  const [calcMethod, setCalcMethod] = useState<'drik' | 'suryaSiddhanta'>('drik');
  const [bhuktaMode, setBhuktaMode] = useState<'subtracted' | 'unsubtracted'>('subtracted');
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const parsedDate = targetDateStr ? new Date(targetDateStr.includes('T') ? targetDateStr : targetDateStr + 'T12:00:00Z') : new Date();
  const targetDate = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;

  const moonGraha = data?.grahas?.find((g) => g.name === 'Moon') || data?.grahas?.[0] || {
    name: 'Moon' as const,
    siderealLongitude: 45.0,
    nakshatraRuler: 'Sun' as const,
    nakshatraIndex: 2,
    signIndex: 1,
  };

  const moonSiderealDeg = moonGraha.siderealLongitude || 0;
  const janmaLord = moonGraha.nakshatraRuler || 'Sun';
  const nakshatraIndex = moonGraha.nakshatraIndex || 0;

  const birthUtcDate = data?.audit?.utcDate ? new Date(data.audit.utcDate) : new Date();

  // Compute Current Dasha
  const dashaResult: DetailedCurrentDashaResult = calculateDetailedCurrentDasha(
    moonSiderealDeg,
    janmaLord,
    nakshatraIndex,
    birthUtcDate,
    targetDate,
    dashaSystem,
    bhuktaMode
  );

  // Compute Current Transit
  const transitResult: TransitCalculationResult = calculateLiveTransit(
    data?.ascendant?.signIndex ?? 0,
    moonGraha.signIndex ?? 0,
    targetDate,
    calcMethod
  );

  const dualTargetDate = formatDualDate(targetDate);

  const handleResetToToday = () => {
    setTargetDateStr(new Date().toISOString().split('T')[0]);
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="space-y-6">
      {/* 1. CURRENT PLANET HERO CARD (अहिले चलिरहेको ग्रह) */}
      <div className="bg-gradient-to-br from-slate-900 via-amber-950/40 to-slate-900 border-2 border-amber-500/60 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-amber-900/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/40">
                <Zap className="w-5 h-5 animate-pulse" />
              </span>
              <div>
                <h2 className="text-xl sm:text-2xl font-serif font-black text-amber-100">
                  {isNe ? 'अहिले चलिरहेको ग्रह' : 'Current Active Planets (Dasha)'}
                </h2>
                <p className="text-xs text-amber-300/80 mt-0.5">
                  {isNe
                    ? `लक्षित मिति: ${dualTargetDate.dualFormatted}`
                    : `Target Date: ${dualTargetDate.dualFormatted}`}
                </p>
              </div>
            </div>
          </div>

          {/* Dual Date Badge */}
          <div className="bg-slate-950/90 border border-amber-500/50 px-4 py-2.5 rounded-2xl text-right font-mono text-xs shadow-inner shrink-0">
            <span className="text-[10px] text-amber-400 font-bold block uppercase tracking-wider">
              {isNe ? 'अहिलेको मिति (AD / BS)' : 'Current Target Date'}
            </span>
            <div className="text-amber-200 font-extrabold mt-0.5">
              {dualTargetDate.ad} AD
            </div>
            <div className="text-slate-300 text-[11px] font-semibold">
              {dualTargetDate.bs}
            </div>
          </div>
        </div>

        {/* 3 Active Dasha Level Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {/* Mahadasha Pillar */}
          <div className="bg-slate-950/80 border border-amber-500/40 rounded-2xl p-4 relative space-y-3">
            <span className="text-[10px] uppercase font-black tracking-widest text-amber-400 block border-b border-amber-900/60 pb-1">
              {isNe ? 'महादशा (Mahadasha)' : 'Mahadasha'}
            </span>
            <div className="flex items-center space-x-3">
              <span
                className="w-4 h-4 rounded-full shadow-lg shrink-0"
                style={{
                  backgroundColor:
                    GRAHA_MAP[dashaResult.mahadasha.planetName as keyof typeof GRAHA_MAP]?.color || '#f59e0b',
                }}
              ></span>
              <div>
                <span className="text-lg font-serif font-bold text-slate-100">
                  {dashaResult.mahadasha.planetNameNe}
                </span>
                <span className="text-xs text-slate-400 font-mono block">
                  ({dashaResult.mahadasha.planetName})
                </span>
              </div>
            </div>
            <div className="text-[11px] text-slate-300 font-mono space-y-1 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-400">Start AD/BS:</span>
                <span className="text-amber-300">{dashaResult.mahadasha.startDateAD.toISOString().split('T')[0]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">End AD/BS:</span>
                <span className="text-amber-300">{dashaResult.mahadasha.endDateAD.toISOString().split('T')[0]}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-800 font-bold">
                <span className="text-slate-400">Remaining:</span>
                <span className="text-emerald-400">{dashaResult.mahadasha.remainingYMD.formatted}</span>
              </div>
            </div>
          </div>

          {/* Antardasha Pillar */}
          <div className="bg-slate-950/80 border border-amber-500/40 rounded-2xl p-4 relative space-y-3">
            <span className="text-[10px] uppercase font-black tracking-widest text-amber-400 block border-b border-amber-900/60 pb-1">
              {isNe ? 'अन्तरदशा (Antardasha)' : 'Antardasha'}
            </span>
            <div className="flex items-center space-x-3">
              <span
                className="w-4 h-4 rounded-full shadow-lg shrink-0"
                style={{
                  backgroundColor:
                    GRAHA_MAP[dashaResult.antardasha.planetName as keyof typeof GRAHA_MAP]?.color || '#3b82f6',
                }}
              ></span>
              <div>
                <span className="text-lg font-serif font-bold text-slate-100">
                  {dashaResult.antardasha.planetNameNe}
                </span>
                <span className="text-xs text-slate-400 font-mono block">
                  ({dashaResult.antardasha.planetName})
                </span>
              </div>
            </div>
            <div className="text-[11px] text-slate-300 font-mono space-y-1 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-400">Start AD/BS:</span>
                <span className="text-amber-300">{dashaResult.antardasha.startDateAD.toISOString().split('T')[0]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">End AD/BS:</span>
                <span className="text-amber-300">{dashaResult.antardasha.endDateAD.toISOString().split('T')[0]}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-800 font-bold">
                <span className="text-slate-400">Remaining:</span>
                <span className="text-emerald-400">{dashaResult.antardasha.remainingYMD.formatted}</span>
              </div>
            </div>
          </div>

          {/* Pratyantardasha Pillar */}
          <div className="bg-slate-950/80 border border-amber-500/40 rounded-2xl p-4 relative space-y-3">
            <span className="text-[10px] uppercase font-black tracking-widest text-amber-400 block border-b border-amber-900/60 pb-1">
              {isNe ? 'प्रत्यन्तरदशा (Pratyantardasha)' : 'Pratyantardasha'}
            </span>
            <div className="flex items-center space-x-3">
              <span
                className="w-4 h-4 rounded-full shadow-lg shrink-0"
                style={{
                  backgroundColor:
                    GRAHA_MAP[dashaResult.pratyantardasha.planetName as keyof typeof GRAHA_MAP]?.color || '#10b981',
                }}
              ></span>
              <div>
                <span className="text-lg font-serif font-bold text-slate-100">
                  {dashaResult.pratyantardasha.planetNameNe}
                </span>
                <span className="text-xs text-slate-400 font-mono block">
                  ({dashaResult.pratyantardasha.planetName})
                </span>
              </div>
            </div>
            <div className="text-[11px] text-slate-300 font-mono space-y-1 bg-slate-900/90 p-2.5 rounded-xl border border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-400">Start AD/BS:</span>
                <span className="text-amber-300">{dashaResult.pratyantardasha.startDateAD.toISOString().split('T')[0]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">End AD/BS:</span>
                <span className="text-amber-300">{dashaResult.pratyantardasha.endDateAD.toISOString().split('T')[0]}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-800 font-bold">
                <span className="text-slate-400">Remaining:</span>
                <span className="text-emerald-400">{dashaResult.pratyantardasha.remainingYMD.formatted}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CONTROL PANEL (Date Picker, Dasha System, Bhukta/Bhogya, Calculation Method) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4" />
            {isNe ? 'गणना नियन्त्रण र मिति छनोट' : 'Live Calculation Controls & Date Selection'}
          </h3>

          <button
            onClick={handleResetToToday}
            className="px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-xs font-bold border border-amber-500/40 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            {isNe ? 'अहिलेको मितिमा फर्किनुहोस् (Today)' : 'Use Live Today'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Target Date Picker */}
          <div className="space-y-1.5">
            <label className="text-slate-400 font-medium block">
              {isNe ? 'लक्षित मिति चयन (Target AD Date):' : 'Select Target AD Date:'}
            </label>
            <input
              type="date"
              value={targetDateStr}
              onChange={(e) => setTargetDateStr(e.target.value)}
              className="w-full bg-slate-950 text-slate-100 border border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>

          {/* Dasha System Selector */}
          <div className="space-y-1.5">
            <label className="text-slate-400 font-medium block">
              {isNe ? 'दशा प्रणाली (Dasha System):' : 'Dasha System:'}
            </label>
            <select
              value={dashaSystem}
              onChange={(e) => setDashaSystem(e.target.value as DashaSystemType)}
              className="w-full bg-slate-950 text-slate-100 border border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 font-mono"
            >
              <option value="vimshottari">Vimshottari (120 Years)</option>
              <option value="tribhagi">Tribhagi (80 Years)</option>
              <option value="yogini">Yogini (36 Years)</option>
              <option value="yoginiExtended">Yogini Extended (72 Years)</option>
            </select>
          </div>

          {/* Bhukta / Bhogya Mode Toggle */}
          <div className="space-y-1.5">
            <label className="text-slate-400 font-medium block">
              {isNe ? 'भुक्त / भोग्य विकल्प:' : 'Bhukta Mode:'}
            </label>
            <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setBhuktaMode('subtracted')}
                className={`py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                  bhuktaMode === 'subtracted'
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                [ भुक्त काटिएको ]
              </button>
              <button
                onClick={() => setBhuktaMode('unsubtracted')}
                className={`py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                  bhuktaMode === 'unsubtracted'
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                [ भुक्त नकाटिएको ]
              </button>
            </div>
          </div>

          {/* Calculation Engine Method (Drik vs Surya Siddhanta) */}
          <div className="space-y-1.5">
            <label className="text-slate-400 font-medium block">
              {isNe ? 'खगोलीय सिद्धान्त (Engine):' : 'Calculation Engine:'}
            </label>
            <div className="grid grid-cols-2 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setCalcMethod('drik')}
                className={`py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                  calcMethod === 'drik'
                    ? 'bg-blue-600 text-slate-950'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                दृक् सिद्धान्त
              </button>
              <button
                onClick={() => setCalcMethod('suryaSiddhanta')}
                className={`py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                  calcMethod === 'suryaSiddhanta'
                    ? 'bg-amber-600 text-slate-950'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                सौर्य सिद्धान्त
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION A: CURRENT DASHA BREAKDOWN (जन्म कुण्डली दशा) */}
      <div className="bg-slate-900 border border-amber-900/60 rounded-2xl p-5 sm:p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-amber-900/40 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              <h3 className="text-base sm:text-lg font-serif font-bold text-amber-100">
                {isNe ? 'अ) जन्म कुण्डली अनुसार चलिरहेको दशा विवरण' : 'SECTION A: Current Natal Dasha Hierarchy'}
              </h3>
            </div>
            <p className="text-xs text-amber-300/80 mt-0.5">
              {isNe
                ? 'जन्म समयको चन्द्र नक्षत्र र डिग्रीबाट गणित महादशा, अन्तरदशा, प्रत्यन्तरदशा र सूक्ष्म दशा।'
                : 'Deterministic Natal Dasha breakdown evaluated for the chosen target date in both AD and BS dates.'}
            </p>
          </div>

          <span className="text-xs font-mono bg-amber-950 text-amber-300 border border-amber-800 px-3 py-1 rounded-xl">
            {dashaSystem.toUpperCase()} System
          </span>
        </div>

        {/* 4 Level Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'Mahadasha (महादशा)', level: dashaResult.mahadasha, color: 'amber' },
            { label: 'Antardasha (अन्तरदशा)', level: dashaResult.antardasha, color: 'blue' },
            { label: 'Pratyantardasha (प्रत्यन्तरदशा)', level: dashaResult.pratyantardasha, color: 'emerald' },
            { label: 'Sookshma Dasha (सूक्ष्म दशा)', level: dashaResult.sookshmaDasha, color: 'purple' },
          ].map((item, idx) => {
            const l = item.level;

            return (
              <div
                key={idx}
                className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 font-mono text-xs hover:border-amber-500/40 transition-colors"
              >
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="font-bold text-amber-300 text-xs font-serif uppercase">
                    {item.label}
                  </span>
                  <span className="text-[11px] font-black text-slate-100 bg-slate-900 px-2.5 py-0.5 rounded border border-slate-700">
                    {l.planetNameNe} ({l.planetName})
                  </span>
                </div>

                <div className="space-y-1.5 text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Start Date (AD):</span>
                    <span className="text-slate-200">{l.startDateAD.toISOString().split('T')[0]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Start Date (BS):</span>
                    <span className="text-slate-300 text-[11px]">{l.startDateBS.formatted}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-900 pt-1">
                    <span className="text-slate-400">End Date (AD):</span>
                    <span className="text-slate-200">{l.endDateAD.toISOString().split('T')[0]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">End Date (BS):</span>
                    <span className="text-slate-300 text-[11px]">{l.endDateBS.formatted}</span>
                  </div>
                </div>

                <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800 space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Duration:</span>
                    <span className="text-slate-200">{l.totalDurationDays.toFixed(0)} days ({l.totalDurationYears.toFixed(2)} yrs)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Elapsed (भुक्त):</span>
                    <span className="text-amber-400">{l.elapsedDaysFromTarget.toFixed(0)} days ({l.elapsedYMD.formatted})</span>
                  </div>
                  <div className="flex justify-between font-bold text-emerald-400 border-t border-slate-800 pt-1">
                    <span>Remaining (भोग्य):</span>
                    <span>{l.remainingDaysFromTarget.toFixed(0)} days ({l.remainingYMD.formatted})</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION B: CURRENT TRANSIT BREAKDOWN (हालको गोचर) */}
      <div className="bg-slate-900 border border-blue-900/60 rounded-2xl p-5 sm:p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-blue-900/40 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-blue-400" />
              <h3 className="text-base sm:text-lg font-serif font-bold text-blue-100">
                {isNe ? 'आ) हालको आकाशीय गोचर स्थिति (Current Sky Transit)' : 'SECTION B: Current Planetary Sky Transit'}
              </h3>
            </div>
            <p className="text-xs text-blue-300/80 mt-0.5">
              {isNe
                ? 'लक्षित मितिमा प्रत्यक्ष आकाशमा ९ ग्रहहरू कुन राशि, डिग्री, नक्षत्र, पद र वक्री/मार्गी अवस्थामा छन्।'
                : 'Real-time planetary sky longitudes computed for target date & time.'}
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="bg-blue-950 text-blue-300 border border-blue-800 px-3 py-1 rounded-xl">
              Engine: {transitResult.calculationMethod === 'drik' ? 'Drik Siddhanta (DE441)' : 'Surya Siddhanta'}
            </span>
            <span className="bg-slate-950 text-slate-300 border border-slate-800 px-3 py-1 rounded-xl">
              Ayanamsa: {transitResult.ayanamsaDegrees.toFixed(2)}°
            </span>
          </div>
        </div>

        {/* Transit 9 Grahas Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="bg-slate-950 text-amber-400 border-b border-slate-800 uppercase">
                <th className="p-3">Graha / Planet</th>
                <th className="p-3">Rashi (Zodiac)</th>
                <th className="p-3">Sidereal Degree</th>
                <th className="p-3">Nakshatra & Pada</th>
                <th className="p-3 text-center">Motion Status</th>
                <th className="p-3 text-center">Lagna House</th>
                <th className="p-3 text-center">Moon House</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {transitResult.transitGrahas.map((g) => (
                <tr key={g.name} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 flex items-center gap-2 font-bold text-slate-100">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: GRAHA_MAP[g.name as keyof typeof GRAHA_MAP]?.color || '#f59e0b' }}
                    ></span>
                    {g.name} ({GRAHA_MAP[g.name as keyof typeof GRAHA_MAP]?.ne || g.name})
                  </td>
                  <td className="p-3 text-slate-200 font-semibold">
                    {g.signNameEn} ({g.signNameNe})
                  </td>
                  <td className="p-3 text-amber-300 font-bold">
                    {g.siderealLongitude.toFixed(2)}° ({g.signDegree.toFixed(2)}°)
                  </td>
                  <td className="p-3 text-slate-300">
                    {g.nakshatraNameEn} ({g.nakshatraNameNe}) - Pada {g.pada}
                  </td>
                  <td className="p-3 text-center">
                    {g.isRetrograde ? (
                      <span className="bg-rose-950 text-rose-300 border border-rose-600 text-[10px] font-black px-2 py-0.5 rounded-full">
                        वक्री (R)
                      </span>
                    ) : (
                      <span className="bg-emerald-950 text-emerald-300 border border-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        मार्गी (D)
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-center font-bold text-amber-400">
                    House {g.houseFromLagna}
                  </td>
                  <td className="p-3 text-center font-bold text-blue-400">
                    House {g.houseFromMoon}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Calculation Parameters Summary Footer */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-300 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Calculation Engine:</span>
            <span className="text-amber-300 font-bold">{transitResult.calculationMethod.toUpperCase()}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Ayanamsa Model:</span>
            <span className="text-slate-200">{transitResult.ayanamsaName} ({transitResult.ayanamsaDegrees.toFixed(4)}°)</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Target AD / BS Date:</span>
            <span className="text-slate-200">{dualTargetDate.dualFormatted}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Calculation Timestamp:</span>
            <span className="text-emerald-400 text-[10px]">{transitResult.timestampISO}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
