import React, { useState } from 'react';
import { Language } from '../types/astrology';
import { convertADToBS, convertBSToAD, getDaysInBSMonth, NEPALI_MONTHS_NP, NEPALI_MONTHS_EN, formatADDateString } from '../utils/nepaliCalendar';
import { Calendar, ArrowRightLeft, Sparkles, RefreshCw } from 'lucide-react';

interface DateConverterViewProps {
  language: Language;
  theme?: 'dark' | 'light';
}

export const DateConverterView: React.FC<DateConverterViewProps> = ({ language, theme = 'dark' }) => {
  const isNe = language === 'ne';
  const isDark = theme === 'dark';

  const today = new Date();
  const todayBs = convertADToBS(today);

  const [mode, setMode] = useState<'bs2ad' | 'ad2bs'>('bs2ad');

  // BS state
  const [bsYear, setBsYear] = useState<number>(todayBs.year);
  const [bsMonth, setBsMonth] = useState<number>(todayBs.month);
  const [bsDay, setBsDay] = useState<number>(todayBs.day);

  // AD state
  const [adDateStr, setAdDateStr] = useState<string>(formatADDateString(today));

  // Calculated results
  const convertedAdDate = mode === 'bs2ad' 
    ? convertBSToAD(bsYear, bsMonth, bsDay) 
    : new Date(adDateStr);

  const convertedBsDate = mode === 'ad2bs'
    ? convertADToBS(new Date(adDateStr))
    : convertADToBS(convertedAdDate);

  const formatOutputDate = (d: Date) => {
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString(isNe ? 'ne-NP' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className={`${isDark ? 'bg-slate-900 border-amber-900/55 text-slate-100' : 'bg-white border-amber-300 text-slate-900 shadow-xl'} border rounded-3xl p-5 sm:p-8 shadow-2xl space-y-6 max-w-3xl mx-auto transition-colors`}>
      <div className={`flex items-center justify-between pb-4 border-b ${isDark ? 'border-amber-900/40' : 'border-amber-200'}`}>
        <h3 className={`text-lg sm:text-xl font-serif font-bold ${isDark ? 'text-amber-200' : 'text-amber-800'} flex items-center gap-2.5`}>
          <Calendar className={`w-6 h-6 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
          {isNe ? 'मिति कन्भर्टर (Calendar Date Converter)' : 'Nepali-English Date Converter'}
        </h3>
        <span className={`text-xs px-3 py-1 rounded-full font-mono font-semibold ${isDark ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60' : 'bg-amber-100 text-amber-900 border border-amber-300'}`}>
          BS ⇄ AD
        </span>
      </div>

      {/* Mode Switcher */}
      <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
        <button
          type="button"
          onClick={() => setMode('bs2ad')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            mode === 'bs2ad'
              ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 shadow-md ring-1 ring-amber-300'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>{isNe ? 'विक्रम संवत् (BS) बाट ईस्वी (AD)' : 'BS to AD Converter'}</span>
        </button>
        <button
          type="button"
          onClick={() => setMode('ad2bs')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            mode === 'ad2bs'
              ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-slate-950 shadow-md ring-1 ring-amber-300'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>{isNe ? 'ईस्वी (AD) बाट विक्रम संवत् (BS)' : 'AD to BS Converter'}</span>
        </button>
      </div>

      {/* Converter Input Section */}
      <div className={`${isDark ? 'bg-slate-800/70 border-slate-700/80' : 'bg-slate-50 border-slate-200'} p-5 rounded-2xl border space-y-4`}>
        {mode === 'bs2ad' ? (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-amber-300/90 mb-2">
              {isNe ? 'विक्रम संवत् (BS) मिति छान्नुहोस्:' : 'Select BS Date:'}
            </label>
            <div className="flex flex-row gap-2 w-full">
              <input
                type="text"
                inputMode="numeric"
                placeholder="2052"
                maxLength={4}
                value={bsYear}
                onChange={(e) => setBsYear(parseInt(e.target.value.replace(/\D/g, ''), 10) || 2052)}
                className="flex-1 min-w-[100px] bg-slate-900 border border-slate-700 focus:border-amber-500 text-slate-100 rounded-xl px-3 py-2.5 text-base font-mono font-bold text-center outline-none"
              />
              <select
                value={bsMonth}
                onChange={(e) => setBsMonth(parseInt(e.target.value, 10) || 1)}
                className="flex-1 min-w-[100px] bg-slate-900 border border-slate-700 focus:border-amber-500 text-slate-100 rounded-xl px-3 py-2.5 text-base font-semibold outline-none"
              >
                {NEPALI_MONTHS_EN.map((mName, idx) => (
                  <option key={idx} value={idx + 1}>
                    {idx + 1}. {NEPALI_MONTHS_NP[idx]} ({mName})
                  </option>
                ))}
              </select>
              <input
                type="text"
                inputMode="numeric"
                placeholder="07"
                maxLength={2}
                value={bsDay}
                onChange={(e) => setBsDay(parseInt(e.target.value.replace(/\D/g, ''), 10) || 1)}
                className="flex-1 min-w-[100px] bg-slate-900 border border-slate-700 focus:border-amber-500 text-slate-100 rounded-xl px-3 py-2.5 text-base font-mono font-bold text-center outline-none"
              />
            </div>
          </div>
        ) : (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-amber-300/90 mb-2">
              {isNe ? 'ईस्वी (AD) मिति छान्नुहोस्:' : 'Select AD Date:'}
            </label>
            <input
              type="date"
              value={adDateStr}
              onChange={(e) => setAdDateStr(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 focus:border-amber-500 text-slate-100 rounded-xl px-4 py-3 text-base font-mono outline-none"
            />
          </div>
        )}
      </div>

      {/* Result Output Card */}
      <div className="bg-gradient-to-br from-amber-950/60 via-slate-900 to-slate-950 border border-amber-600/50 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{isNe ? 'रूपान्तरित मिति नतिजा (Converted Results)' : 'Conversion Results'}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-950/80 border border-amber-900/40 p-4 rounded-xl space-y-1">
            <span className="text-slate-400 text-xs font-medium block">विक्रम संवत् (BS):</span>
            <p className="text-amber-200 font-mono font-bold text-base sm:text-lg">
              {convertedBsDate.formatted}
            </p>
          </div>

          <div className="bg-slate-950/80 border border-amber-900/40 p-4 rounded-xl space-y-1">
            <span className="text-slate-400 text-xs font-medium block">English Date (AD):</span>
            <p className="text-amber-200 font-mono font-bold text-base sm:text-lg">
              {formatOutputDate(convertedAdDate)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
