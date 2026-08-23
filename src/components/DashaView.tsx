import React, { useState, useMemo } from 'react';
import { KundaliCalculationOutput, Language } from '../types/astrology';
import { UI_TRANSLATIONS, GRAHA_MAP } from '../utils/i18n';
import { calculateTribhagiDasha, calculateYoginiDasha } from '../engine/dashaEngine';
import {
  calculateVimshottariSubperiods,
  calculateTribhagiSubperiods,
  calculateYoginiSubperiods,
} from '../engine/dashaSubPeriods';
import { DashaAccordion } from './DashaAccordion';
import { Clock, ChevronDown, ChevronRight, CheckCircle2, PieChart, Sparkles, Layers } from 'lucide-react';

interface DashaViewProps {
  data: KundaliCalculationOutput;
  language: Language;
}

export const DashaView: React.FC<DashaViewProps> = ({ data, language }) => {
  const t = UI_TRANSLATIONS[language];
  const isNe = language === 'ne';

  const [dashaType, setDashaType] = useState<'vimshottari' | 'tribhagi' | 'yogini' | 'bhuktaBhogya'>('vimshottari');
  const [isBhuktaDeducted, setIsBhuktaDeducted] = useState<boolean>(true);

  const vim = data.vimshottariDasha;
  const bb = data.bhuktaBhogya;

  // Calculate live Tribhagi & Yogini Dashas based on current bhukta toggle state
  const moonPosition = data.grahas?.find((g) => g.name === 'Moon');
  const moonSiderealDeg = moonPosition ? moonPosition.siderealLongitude : 0;
  const nakshatraIndex = moonPosition ? moonPosition.nakshatraIndex : 0;
  const utcBirthDate = useMemo(() => {
    return data.audit?.utcDateString ? new Date(data.audit.utcDateString) : new Date();
  }, [data.audit?.utcDateString]);

  const triData = useMemo(() => {
    return calculateTribhagiDasha(
      moonSiderealDeg,
      data.vimshottariDasha.startingLord,
      utcBirthDate,
      isBhuktaDeducted
    );
  }, [moonSiderealDeg, data.vimshottariDasha.startingLord, utcBirthDate, isBhuktaDeducted]);

  const yogData = useMemo(() => {
    return calculateYoginiDasha(
      moonSiderealDeg,
      nakshatraIndex,
      utcBirthDate,
      isBhuktaDeducted
    );
  }, [moonSiderealDeg, nakshatraIndex, utcBirthDate, isBhuktaDeducted]);

  // Exact Subperiod Calculations (Mahadasha, Antardasha, Pratyantardasha)
  const vimSubperiods = useMemo(() => {
    return calculateVimshottariSubperiods(
      moonSiderealDeg,
      data.vimshottariDasha.startingLord,
      utcBirthDate
    );
  }, [moonSiderealDeg, data.vimshottariDasha.startingLord, utcBirthDate]);

  const triSubperiods = useMemo(() => {
    return calculateTribhagiSubperiods(
      moonSiderealDeg,
      data.vimshottariDasha.startingLord,
      utcBirthDate
    );
  }, [moonSiderealDeg, data.vimshottariDasha.startingLord, utcBirthDate]);

  const yogSubperiods = useMemo(() => {
    return calculateYoginiSubperiods(
      moonSiderealDeg,
      nakshatraIndex,
      utcBirthDate
    );
  }, [moonSiderealDeg, nakshatraIndex, utcBirthDate]);

  const currentActiveTribhagi = triData.currentMahadashaItem || triData.mahadashas.find((m) => m.isCurrent);
  const currentActiveYogini = yogData.currentYoginiItem || yogData.mahadashas.find((m) => m.isCurrent);

  const [expandedIndex, setExpandedIndex] = useState<number | null>(
    vim.mahadashas.findIndex((m) => m.isCurrent) !== -1
      ? vim.mahadashas.findIndex((m) => m.isCurrent)
      : 0
  );

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="bg-slate-900 border border-amber-900/50 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-amber-900/30 gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-serif font-bold text-amber-200 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            {isNe ? 'दशा प्रणाली विश्लेषण (Dasha Systems)' : 'Dasha Systems & Timeline Analysis'}
          </h3>
          <p className="text-xs text-amber-300/80 mt-0.5">
            {isNe
              ? 'विंशोत्तरी (१२० वर्ष), त्रिभागी (८० वर्ष) र योगिनी (७२ वर्ष: ३६+३६ चक्र) गणितीय गणना'
              : 'Vimshottari (120y), Tribhagi (80y), Yogini (72y 2-Cycle) & Bhukta/Bhogya analysis.'}
          </p>
        </div>

        {/* System Selector Sub-Tabs */}
        <div className="flex flex-wrap gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setDashaType('vimshottari')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              dashaType === 'vimshottari'
                ? 'bg-amber-600 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Vimshottari (120y)
          </button>
          <button
            onClick={() => setDashaType('tribhagi')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              dashaType === 'tribhagi'
                ? 'bg-amber-600 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tribhagi (80y)
          </button>
          <button
            onClick={() => setDashaType('yogini')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              dashaType === 'yogini'
                ? 'bg-purple-600 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Yogini (72y)
          </button>
          <button
            onClick={() => setDashaType('bhuktaBhogya')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              dashaType === 'bhuktaBhogya'
                ? 'bg-amber-600 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            Bhukta / Bhogya
          </button>
        </div>
      </div>

      {/* 1. Vimshottari Dasha Display */}
      {dashaType === 'vimshottari' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs flex-wrap gap-2">
            <span className="text-slate-400 font-medium">
              Janma Nakshatra Lord: <strong className="text-amber-300">{vim.startingLord}</strong>
            </span>
            <span className="text-slate-400 font-medium">
              Birth Balance: <strong className="text-amber-300 font-mono">{vim.birthBalanceYears.toFixed(2)} years</strong>
            </span>
          </div>

          <DashaAccordion
            mahadashas={vimSubperiods}
            language={language}
            systemName={isNe ? 'विंशोत्तरी महादशा' : 'Vimshottari Dasha'}
            isPrintMode={false}
          />
        </div>
      )}

      {/* 2. Tribhagi Mahadasha Display (80 Years Total Cycle) */}
      {dashaType === 'tribhagi' && (
        <div className="space-y-5">
          {/* Bhukta Deducted vs Not Deducted Toggle Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-4 rounded-xl border border-amber-900/40 text-xs">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <span className="font-bold text-amber-200 text-sm block">
                  {isNe ? 'त्रिभागी महादशा (८० वर्षे चक्र)' : 'Tribhagi Mahadasha (80 Years Total Cycle)'}
                </span>
                <span className="text-[11px] text-slate-400">
                  {isNe
                    ? `जन्म नक्षत्र स्वामी: ${GRAHA_MAP[triData.startingLord]?.ne || triData.startingLord} | जन्म समयको बाँकी (Bhogya): ${triData.birthBalanceYears.toFixed(2)} वर्ष`
                    : `Janma Nakshatra Lord: ${triData.startingLord} | Birth Balance: ${triData.birthBalanceYears.toFixed(2)} years`}
                </span>
              </div>
            </div>

            {/* Bhukta Toggle Buttons */}
            <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-lg border border-slate-800 shrink-0">
              <button
                type="button"
                onClick={() => setIsBhuktaDeducted(true)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  isBhuktaDeducted
                    ? 'bg-amber-600 text-slate-950 shadow ring-1 ring-amber-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                [ भुक्त काटिएको ]
              </button>
              <button
                type="button"
                onClick={() => setIsBhuktaDeducted(false)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  !isBhuktaDeducted
                    ? 'bg-amber-600 text-slate-950 shadow ring-1 ring-amber-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                [ भुक्त नकाटिएको ]
              </button>
            </div>
          </div>

          {/* Currently Running Active Tribhagi Mahadasha Banner */}
          <div className="bg-gradient-to-r from-amber-950/80 via-slate-950 to-amber-950/80 border-2 border-amber-500/80 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-amber-800/40">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400 animate-pulse" />
                <h4 className="font-serif font-bold text-base sm:text-lg text-amber-200">
                  {isNe ? 'हाल चलिरहेको त्रिभागी महादशा:' : 'Currently Active Tribhagi Mahadasha:'}
                </h4>
              </div>
              <span className="bg-amber-500 text-slate-950 text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                {isNe ? 'हाल चालू' : 'ACTIVE'}
              </span>
            </div>

            {currentActiveTribhagi ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                {/* Graha Lord */}
                <div className="bg-slate-900/90 border border-amber-900/50 p-3.5 rounded-xl flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-slate-950 shadow-md shrink-0"
                    style={{ backgroundColor: GRAHA_MAP[currentActiveTribhagi.planet]?.color || '#f59e0b' }}
                  >
                    {currentActiveTribhagi.planet.slice(0, 2)}
                  </div>
                  <div>
                    <span className="text-[10px] text-amber-400 uppercase font-bold block">
                      {isNe ? 'ग्रह (Dasha Lord)' : 'Graha / Dasha Lord'}
                    </span>
                    <span className="text-sm font-bold text-amber-100">
                      {GRAHA_MAP[currentActiveTribhagi.planet]?.ne || currentActiveTribhagi.planet} ({currentActiveTribhagi.planet})
                    </span>
                  </div>
                </div>

                {/* Start Date AD/BS */}
                <div className="bg-slate-900/90 border border-amber-900/50 p-3.5 rounded-xl">
                  <span className="text-[10px] text-amber-400 uppercase font-bold block">
                    {isNe ? 'सुरु मिति (Start Date)' : 'Start Date'}
                  </span>
                  <div className="text-slate-200 font-mono font-bold mt-0.5 text-xs">
                    AD: {currentActiveTribhagi.startDateFormattedAD}
                  </div>
                  <div className="text-amber-300/90 font-mono text-[11px] mt-0.5">
                    BS: {currentActiveTribhagi.startDateFormattedBS}
                  </div>
                </div>

                {/* End Date AD/BS */}
                <div className="bg-slate-900/90 border border-amber-900/50 p-3.5 rounded-xl">
                  <span className="text-[10px] text-amber-400 uppercase font-bold block">
                    {isNe ? 'अन्त मिति (End Date)' : 'End Date'}
                  </span>
                  <div className="text-slate-200 font-mono font-bold mt-0.5 text-xs">
                    AD: {currentActiveTribhagi.endDateFormattedAD}
                  </div>
                  <div className="text-amber-300/90 font-mono text-[11px] mt-0.5">
                    BS: {currentActiveTribhagi.endDateFormattedBS}
                  </div>
                </div>

                {/* Remaining Duration Banner */}
                <div className="bg-slate-900/90 border border-amber-900/50 p-3.5 rounded-xl sm:col-span-2 lg:col-span-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] text-amber-400 uppercase font-bold block">
                      {isNe ? 'बाँकी समय (Remaining Duration)' : 'Remaining Duration'}
                    </span>
                    <span className="text-sm sm:text-base font-black text-emerald-400 font-mono mt-0.5 block">
                      {currentActiveTribhagi.remainingTimeFormatted || (isNe ? 'सम्पन्न' : 'Completed')}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300 font-mono bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                    {isNe
                      ? `पूर्ण अवधि: ${currentActiveTribhagi.fullPeriodYMD?.formatted || `${currentActiveTribhagi.durationYears.toFixed(2)} yrs`}`
                      : `Full Period: ${currentActiveTribhagi.fullPeriodYMD?.formatted || `${currentActiveTribhagi.durationYears.toFixed(2)} yrs`}`}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-3 text-slate-400 text-xs">
                {isNe ? 'लक्ष्य मिति त्रिभागी चक्रभन्दा बाहिर छ।' : 'Date is outside Tribhagi cycle range.'}
              </div>
            )}
          </div>

          {/* Full Tribhagi Mahadasha Timeline Table */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
            <h4 className="font-bold text-amber-300 text-xs uppercase tracking-wider flex items-center justify-between">
              <span>{isNe ? 'त्रिभागी महादशा टाइमलाइन (८० वर्षे चक्र)' : 'Full Tribhagi Mahadasha Timeline (80 Years Cycle)'}</span>
              <span className="text-[10px] text-slate-400 font-mono">Total Span: 80 Years</span>
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-mono min-w-[750px]">
                <thead>
                  <tr className="bg-slate-900 text-amber-400 border-b border-slate-800 uppercase text-[11px]">
                    <th className="p-3">ग्रह (Lord)</th>
                    <th className="p-3">पूर्ण अवधि</th>
                    <th className="p-3">भुक्त अवधि</th>
                    <th className="p-3">भोग्य / बाँकी</th>
                    <th className="p-3">सुरु मिति (Start AD / BS)</th>
                    <th className="p-3">अन्त मिति (End AD / BS)</th>
                    <th className="p-3 text-center">स्थिति</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {triData.mahadashas.map((md, idx) => (
                    <tr
                      key={idx}
                      className={`${
                        md.isCurrent
                          ? 'bg-amber-950/60 font-bold text-amber-200 border-l-4 border-l-amber-500'
                          : 'hover:bg-slate-900/60 text-slate-300'
                      }`}
                    >
                      <td className="p-3 flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: GRAHA_MAP[md.planet]?.color || '#f59e0b' }}
                        ></span>
                        <span className="font-semibold">{GRAHA_MAP[md.planet]?.ne || md.planet}</span>
                        <span className="text-slate-400 text-[10px]">({md.planet})</span>
                      </td>
                      <td className="p-3 text-slate-200">
                        {md.fullPeriodYMD?.formatted || `${md.durationYears.toFixed(2)} yrs`}
                      </td>
                      <td className="p-3 text-slate-400">
                        {md.bhuktaYMD?.formatted || '0 yrs'}
                      </td>
                      <td className="p-3 text-amber-300 font-bold">
                        {md.bhogyaYMD?.formatted || `${md.durationYears.toFixed(2)} yrs`}
                      </td>
                      <td className="p-3">
                        <div className="text-slate-200">{md.startDateFormattedAD} AD</div>
                        <div className="text-amber-400/80 text-[10px]">{md.startDateFormattedBS}</div>
                      </td>
                      <td className="p-3">
                        <div className="text-slate-200">{md.endDateFormattedAD} AD</div>
                        <div className="text-amber-400/80 text-[10px]">{md.endDateFormattedBS}</div>
                      </td>
                      <td className="p-3 text-center">
                        {md.isCurrent ? (
                          <span className="bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded text-[10px] uppercase">
                            {isNe ? 'हाल चालू' : 'ACTIVE'}
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[10px]">
                            {new Date() > md.endDate ? (isNe ? 'सम्पन्न' : 'Past') : (isNe ? 'भविष्य' : 'Future')}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-2">
            <h4 className="font-bold text-amber-300 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-amber-400" />
              {isNe ? 'त्रिभागी दशा - विस्तृत अन्तर्दशा र प्रत्यन्तर्दशा सुची:' : 'Tribhagi Dasha - Detailed Antardashas & Pratyantardashas:'}
            </h4>
            <DashaAccordion
              mahadashas={triSubperiods}
              language={language}
              systemName={isNe ? 'त्रिभागी महादशा' : 'Tribhagi Dasha'}
              isPrintMode={false}
            />
          </div>
        </div>
      )}

      {/* 3. Yogini Mahadasha Display (72 Years Total Cycle: 2 x 36 Years) */}
      {dashaType === 'yogini' && (
        <div className="space-y-5">
          {/* Bhukta Deducted vs Not Deducted Toggle Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-4 rounded-xl border border-purple-900/40 text-xs">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 text-purple-400 shrink-0" />
              <div>
                <span className="font-bold text-purple-200 text-sm block">
                  {isNe ? 'योगिनी महादशा (७२ वर्षे विस्तार: ३६ + ३६ चक्र)' : 'Yogini Mahadasha (72 Years Total Cycle: 36 + 36 Years)'}
                </span>
                <span className="text-[11px] text-slate-400">
                  {isNe
                    ? `जन्म योगिनी: ${yogData.startingYoginiNe} (${yogData.startingYogini}) | जन्म समयको बाँकी (Bhogya): ${yogData.birthBalanceYears.toFixed(2)} वर्ष`
                    : `Janma Yogini: ${yogData.startingYogini} | Birth Balance: ${yogData.birthBalanceYears.toFixed(2)} years`}
                </span>
              </div>
            </div>

            {/* Bhukta Toggle Buttons */}
            <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-lg border border-slate-800 shrink-0">
              <button
                type="button"
                onClick={() => setIsBhuktaDeducted(true)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  isBhuktaDeducted
                    ? 'bg-purple-600 text-slate-950 shadow ring-1 ring-purple-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                [ भुक्त काटिएको ]
              </button>
              <button
                type="button"
                onClick={() => setIsBhuktaDeducted(false)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  !isBhuktaDeducted
                    ? 'bg-purple-600 text-slate-950 shadow ring-1 ring-purple-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                [ भुक्त नकाटिएको ]
              </button>
            </div>
          </div>

          {/* Currently Running Active Yogini Banner */}
          <div className="bg-gradient-to-r from-purple-950/80 via-slate-950 to-purple-950/80 border-2 border-purple-500/80 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-purple-800/40">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-400 animate-pulse" />
                <h4 className="font-serif font-bold text-base sm:text-lg text-purple-200">
                  {isNe ? 'हाल चलिरहेको योगिनी महादशा:' : 'Currently Active Yogini Mahadasha:'}
                </h4>
              </div>
              <span className="bg-purple-500 text-slate-950 text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                {isNe ? 'हाल चालू' : 'ACTIVE'}
              </span>
            </div>

            {currentActiveYogini ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                {/* Yogini Name & Ruler */}
                <div className="bg-slate-900/90 border border-purple-900/50 p-3.5 rounded-xl flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-slate-950 shadow-md shrink-0"
                    style={{ backgroundColor: GRAHA_MAP[currentActiveYogini.ruler]?.color || '#a855f7' }}
                  >
                    {currentActiveYogini.ruler.slice(0, 2)}
                  </div>
                  <div>
                    <span className="text-[10px] text-purple-400 uppercase font-bold block">
                      {isNe ? 'योगिनी र स्वामी ग्रह' : 'Yogini & Ruling Graha'}
                    </span>
                    <span className="text-sm font-bold text-purple-100 block">
                      {currentActiveYogini.yoginiNameNe} ({currentActiveYogini.yoginiName})
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      Swami: {GRAHA_MAP[currentActiveYogini.ruler]?.ne || currentActiveYogini.ruler} ({currentActiveYogini.ruler})
                    </span>
                  </div>
                </div>

                {/* Start Date AD/BS */}
                <div className="bg-slate-900/90 border border-purple-900/50 p-3.5 rounded-xl">
                  <span className="text-[10px] text-purple-400 uppercase font-bold block">
                    {isNe ? 'सुरु मिति (Start Date)' : 'Start Date'}
                  </span>
                  <div className="text-slate-200 font-mono font-bold mt-0.5 text-xs">
                    AD: {currentActiveYogini.startDateFormattedAD}
                  </div>
                  <div className="text-purple-300/90 font-mono text-[11px] mt-0.5">
                    BS: {currentActiveYogini.startDateFormattedBS}
                  </div>
                </div>

                {/* End Date AD/BS */}
                <div className="bg-slate-900/90 border border-purple-900/50 p-3.5 rounded-xl">
                  <span className="text-[10px] text-purple-400 uppercase font-bold block">
                    {isNe ? 'अन्त मिति (End Date)' : 'End Date'}
                  </span>
                  <div className="text-slate-200 font-mono font-bold mt-0.5 text-xs">
                    AD: {currentActiveYogini.endDateFormattedAD}
                  </div>
                  <div className="text-purple-300/90 font-mono text-[11px] mt-0.5">
                    BS: {currentActiveYogini.endDateFormattedBS}
                  </div>
                </div>

                {/* Remaining Duration Banner */}
                <div className="bg-slate-900/90 border border-purple-900/50 p-3.5 rounded-xl sm:col-span-2 lg:col-span-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] text-purple-400 uppercase font-bold block">
                      {isNe ? 'बाँकी समय (Remaining Duration)' : 'Remaining Duration'}
                    </span>
                    <span className="text-sm sm:text-base font-black text-emerald-400 font-mono mt-0.5 block">
                      {currentActiveYogini.remainingTimeFormatted || (isNe ? 'सम्पन्न' : 'Completed')}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300 font-mono bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center gap-3">
                    <span>
                      {isNe ? `चक्र ${currentActiveYogini.cycleNumber}` : `Cycle ${currentActiveYogini.cycleNumber}`}
                    </span>
                    <span>•</span>
                    <span>
                      {isNe
                        ? `पूर्ण अवधि: ${currentActiveYogini.fullPeriodYMD?.formatted || `${currentActiveYogini.durationYears.toFixed(2)} yrs`}`
                        : `Full Period: ${currentActiveYogini.fullPeriodYMD?.formatted || `${currentActiveYogini.durationYears.toFixed(2)} yrs`}`}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-3 text-slate-400 text-xs">
                {isNe ? 'लक्ष्य मिति योगिनी चक्रभन्दा बाहिर छ।' : 'Date is outside Yogini cycle range.'}
              </div>
            )}
          </div>

          {/* Full Yogini Mahadasha Timeline Table (72 Years) */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
            <h4 className="font-bold text-purple-300 text-xs uppercase tracking-wider flex items-center justify-between">
              <span>{isNe ? 'योगिनी महादशा टाइमलाइन (७२ वर्षे चक्र: ३६ + ३६)' : 'Full Yogini Mahadasha Timeline (72 Years Cycle)'}</span>
              <span className="text-[10px] text-slate-400 font-mono">16 Yoginis (2 Cycles)</span>
            </h4>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-mono min-w-[780px]">
                <thead>
                  <tr className="bg-slate-900 text-purple-400 border-b border-slate-800 uppercase text-[11px]">
                    <th className="p-3">योगिनी (Yogini / Ruler)</th>
                    <th className="p-3 text-center">चक्र (Cycle)</th>
                    <th className="p-3">पूर्ण अवधि</th>
                    <th className="p-3">भुक्त अवधि</th>
                    <th className="p-3">भोग्य / बाँकी</th>
                    <th className="p-3">सुरु मिति (Start AD / BS)</th>
                    <th className="p-3">अन्त मिति (End AD / BS)</th>
                    <th className="p-3 text-center">स्थिति</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {yogData.mahadashas.map((md, idx) => (
                    <tr
                      key={idx}
                      className={`${
                        md.isCurrent
                          ? 'bg-purple-950/60 font-bold text-purple-200 border-l-4 border-l-purple-500'
                          : 'hover:bg-slate-900/60 text-slate-300'
                      }`}
                    >
                      <td className="p-3 flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: GRAHA_MAP[md.ruler]?.color || '#a855f7' }}
                        ></span>
                        <div>
                          <span className="font-bold text-purple-200 block">{md.yoginiNameNe} ({md.yoginiName})</span>
                          <span className="text-slate-400 text-[10px]">Ruler: {GRAHA_MAP[md.ruler]?.ne || md.ruler}</span>
                        </div>
                      </td>
                      <td className="p-3 text-center font-bold text-slate-400">
                        {isNe ? `चक्र ${md.cycleNumber}` : `Cycle ${md.cycleNumber}`}
                      </td>
                      <td className="p-3 text-slate-200">
                        {md.fullPeriodYMD?.formatted || `${md.durationYears.toFixed(2)} yrs`}
                      </td>
                      <td className="p-3 text-slate-400">
                        {md.bhuktaYMD?.formatted || '0 yrs'}
                      </td>
                      <td className="p-3 text-purple-300 font-bold">
                        {md.bhogyaYMD?.formatted || `${md.durationYears.toFixed(2)} yrs`}
                      </td>
                      <td className="p-3">
                        <div className="text-slate-200">{md.startDateFormattedAD} AD</div>
                        <div className="text-purple-400/80 text-[10px]">{md.startDateFormattedBS}</div>
                      </td>
                      <td className="p-3">
                        <div className="text-slate-200">{md.endDateFormattedAD} AD</div>
                        <div className="text-purple-400/80 text-[10px]">{md.endDateFormattedBS}</div>
                      </td>
                      <td className="p-3 text-center">
                        {md.isCurrent ? (
                          <span className="bg-purple-500 text-slate-950 font-black px-2 py-0.5 rounded text-[10px] uppercase">
                            {isNe ? 'हाल चालू' : 'ACTIVE'}
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[10px]">
                            {new Date() > md.endDate ? (isNe ? 'सम्पन्न' : 'Past') : (isNe ? 'भविष्य' : 'Future')}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-2">
            <h4 className="font-bold text-purple-300 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-purple-400" />
              {isNe ? 'योगिनी दशा - विस्तृत अन्तर्दशा र प्रत्यन्तर्दशा सुची:' : 'Yogini Dasha - Detailed Antardashas & Pratyantardashas:'}
            </h4>
            <DashaAccordion
              mahadashas={yogSubperiods}
              language={language}
              systemName={isNe ? 'योगिनी महादशा' : 'Yogini Dasha'}
              isPrintMode={false}
            />
          </div>
        </div>
      )}

      {/* 4. Bhukta & Bhogya Calculation Breakdown */}
      {dashaType === 'bhuktaBhogya' && (
        <div className="space-y-6">
          {/* Nakshatra Arc Division */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between pb-3 border-b border-slate-800 gap-2">
              <div>
                <h4 className="text-sm font-serif font-bold text-amber-200 flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-amber-400" />
                  Janma Nakshatra Arc Division (Bhukta / Bhogya)
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Moon Nakshatra: <strong className="text-amber-300">{bb.nakshatraNameEn} ({bb.nakshatraNameNe})</strong> — Total Arc: 13° 20' 00" (800 Arc Minutes)
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2.5 py-1 rounded">
                  Bhukta (Elapsed): {bb.bhuktaPercentage.toFixed(2)}%
                </span>
                <span className="bg-blue-950 text-blue-300 border border-blue-800 px-2.5 py-1 rounded">
                  Bhogya (Balance): {bb.bhogyaPercentage.toFixed(2)}%
                </span>
              </div>
            </div>

            {/* Visual Arc Bar */}
            <div className="space-y-1.5">
              <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden flex">
                <div
                  className="bg-emerald-500 h-full transition-all flex items-center justify-center text-[10px] font-black text-slate-950"
                  style={{ width: `${bb.bhuktaPercentage}%` }}
                >
                  {bb.bhuktaPercentage > 15 ? `${bb.bhuktaPercentage.toFixed(1)}%` : ''}
                </div>
                <div
                  className="bg-blue-500 h-full transition-all flex items-center justify-center text-[10px] font-black text-slate-950"
                  style={{ width: `${bb.bhogyaPercentage}%` }}
                >
                  {bb.bhogyaPercentage > 15 ? `${bb.bhogyaPercentage.toFixed(1)}%` : ''}
                </div>
              </div>
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>0° 00' 00" (Nakshatra Start)</span>
                <span className="text-emerald-400 font-bold">{bb.bhuktaArc.formatted} (Birth Position)</span>
                <span>13° 20' 00" (Nakshatra End)</span>
              </div>
            </div>

            {/* Table of Bhukta & Bhogya Arc */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="bg-slate-900 border border-emerald-900/60 p-3.5 rounded-xl space-y-2">
                <div className="text-emerald-400 font-bold uppercase border-b border-emerald-900/60 pb-1">
                  Bhukta Arc (भुक्त अंश - Position Passed)
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Decimal Degrees:</span>
                  <span className="text-slate-100">{bb.bhuktaArc.totalDecimalDegrees.toFixed(6)}°</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Degree, Min, Sec:</span>
                  <span className="text-emerald-300 font-bold">{bb.bhuktaArc.formatted}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Elapsed Percentage:</span>
                  <span className="text-emerald-300 font-bold">{bb.bhuktaPercentage.toFixed(4)}%</span>
                </div>
              </div>

              <div className="bg-slate-900 border border-blue-900/60 p-3.5 rounded-xl space-y-2">
                <div className="text-blue-400 font-bold uppercase border-b border-blue-900/60 pb-1">
                  Bhogya Arc (भोग्य अंश - Position Balance)
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Decimal Degrees:</span>
                  <span className="text-slate-100">{bb.bhogyaArc.totalDecimalDegrees.toFixed(6)}°</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Degree, Min, Sec:</span>
                  <span className="text-blue-300 font-bold">{bb.bhogyaArc.formatted}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Remaining Percentage:</span>
                  <span className="text-blue-300 font-bold">{bb.bhogyaPercentage.toFixed(4)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Dasha Time Conversion Table */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
            <h4 className="text-sm font-serif font-bold text-amber-200 border-b border-slate-800 pb-2">
              Time Conversion: Dasha Bhukta (Elapsed) vs Bhogya (Balance)
            </h4>

            <div className="overflow-x-auto font-mono text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-amber-400 border-b border-slate-800 uppercase">
                    <th className="p-3">Dasha Engine</th>
                    <th className="p-3">Starting Lord / Yogini</th>
                    <th className="p-3">Total Period</th>
                    <th className="p-3">Bhukta Time (Elapsed)</th>
                    <th className="p-3 text-emerald-300">Bhogya Time (Birth Balance)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  <tr className="hover:bg-slate-900/60">
                    <td className="p-3 font-bold text-slate-100">Vimshottari Dasha</td>
                    <td className="p-3 text-amber-300">{bb.vimshottari.startingLord}</td>
                    <td className="p-3 text-slate-300">{bb.vimshottari.totalDashaYears} Years</td>
                    <td className="p-3 text-slate-400">{bb.vimshottari.bhuktaTime.formatted}</td>
                    <td className="p-3 text-amber-300 font-bold">{bb.vimshottari.bhogyaTime.formatted}</td>
                  </tr>

                  <tr className="hover:bg-slate-900/60">
                    <td className="p-3 font-bold text-slate-100">Tribhagi Dasha</td>
                    <td className="p-3 text-amber-300">{bb.tribhagi.startingLord}</td>
                    <td className="p-3 text-slate-300">{bb.tribhagi.totalDashaYears.toFixed(2)} Years</td>
                    <td className="p-3 text-slate-400">{bb.tribhagi.bhuktaTime.formatted}</td>
                    <td className="p-3 text-amber-300 font-bold">{bb.tribhagi.bhogyaTime.formatted}</td>
                  </tr>

                  <tr className="hover:bg-slate-900/60">
                    <td className="p-3 font-bold text-slate-100">Yogini Dasha</td>
                    <td className="p-3 text-purple-300">{bb.yogini.startingYogini} ({bb.yogini.ruler})</td>
                    <td className="p-3 text-slate-300">{bb.yogini.totalDashaYears} Years</td>
                    <td className="p-3 text-slate-400">{bb.yogini.bhuktaTime.formatted}</td>
                    <td className="p-3 text-purple-300 font-bold">{bb.yogini.bhogyaTime.formatted}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
