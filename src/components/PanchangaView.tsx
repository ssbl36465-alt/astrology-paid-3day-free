// File Name: src/components/PanchangaView.tsx
import React, { useState, useMemo } from 'react';
import { KundaliCalculationOutput, Language, PanchangaData, BirthDetails } from '../types/astrology';
import { UI_TRANSLATIONS, GRAHA_MAP } from '../utils/i18n';
import { Moon, Sun, CalendarDays, Sparkles, Sunrise, Sunset, Clock, Compass, ShieldAlert, Award } from 'lucide-react';
import { calculateKundali } from '../engine/kundaliEngine';

interface PanchangaViewProps {
  data: KundaliCalculationOutput;
  language: Language;
  theme?: 'dark' | 'light';
}

export const PanchangaView: React.FC<PanchangaViewProps> = ({ data, language, theme = 'dark' }) => {
  const t = UI_TRANSLATIONS[language];
  const isNe = language === 'ne';
  const isDark = theme === 'dark';

  const [mode, setMode] = useState<'live' | 'birth'>('live');

  // Calculate live today's Panchanga using current UTC date and Kathmandu coordinates
  const livePanchanga: PanchangaData = useMemo(() => {
    try {
      const now = new Date();
      const yyyy = now.getUTCFullYear();
      const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
      const dd = String(now.getUTCDate()).padStart(2, '0');
      const hh = String(now.getUTCHours()).padStart(2, '0');
      const min = String(now.getUTCMinutes()).padStart(2, '0');

      const liveDetails: BirthDetails = {
        name: 'Today Live Panchanga',
        dob: `${yyyy}-${mm}-${dd}`,
        tob: `${hh}:${min}:00`,
        birthPlace: 'Kathmandu, Nepal',
        latitude: 27.7172, // Kathmandu
        longitude: 85.3240,
        timezoneOffsetMinutes: 345, // +5:45
        timezoneName: 'Asia/Kathmandu',
        isDst: false,
      };
      const liveOutput = calculateKundali(liveDetails);
      return liveOutput.panchanga;
    } catch (e) {
      return data.panchanga;
    }
  }, []);

  const p = mode === 'live' ? livePanchanga : data.panchanga;

  return (
    <div className={`${isDark ? 'bg-slate-900 border-amber-900/50 text-slate-100' : 'bg-white border-amber-300 text-slate-900 shadow-xl'} border rounded-2xl p-4 sm:p-6 shadow-2xl space-y-6 transition-colors`}>
      <div className={`flex flex-wrap items-center justify-between pb-3 border-b ${isDark ? 'border-amber-900/30' : 'border-amber-200'} gap-3`}>
        <h3 className={`text-base sm:text-lg font-serif font-bold ${isDark ? 'text-amber-200' : 'text-amber-800'} flex items-center gap-2`}>
          <CalendarDays className={`w-5 h-5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
          {t.tabPanchanga}
          {mode === 'live' && (
            <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full font-mono font-semibold">
              {isNe ? 'प्रत्यक्ष (Live आज)' : 'Live Today'}
            </span>
          )}
        </h3>

        <div className="flex items-center gap-2">
          <div className="bg-slate-800/90 border border-slate-700 p-1 rounded-xl flex items-center gap-1">
            <button
              type="button"
              onClick={() => setMode('live')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${mode === 'live' ? 'bg-amber-600 text-slate-950' : 'text-slate-300 hover:bg-slate-700'}`}
            >
              {isNe ? 'आजको प्रत्यक्ष पञ्चाङ्ग (Live Today)' : 'Live Today'}
            </button>
            <button
              type="button"
              onClick={() => setMode('birth')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${mode === 'birth' ? 'bg-amber-600 text-slate-950' : 'text-slate-300 hover:bg-slate-700'}`}
            >
              {isNe ? 'जन्म कुण्डली पञ्चाङ्ग (Birth Panchanga)' : 'Birth Panchanga'}
            </button>
          </div>
        </div>
      </div>

      {/* Main 5 Limbs (Tithi, Vara, Nakshatra, Yoga, Karana, Sunrise/Sunset) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Tithi */}
        <div className={`${isDark ? 'bg-slate-800/80 border-slate-700/80 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'} border rounded-xl p-4 flex flex-col justify-between hover:border-amber-500/50 transition-colors`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
              {t.panchangaTithi}
            </span>
            <Moon className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <div className={`text-lg font-serif font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
              {isNe ? p.tithi.nameNe : p.tithi.nameEn}
            </div>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} mt-1 font-mono`}>
              Tithi #{p.tithi.number} ({isNe ? p.tithi.pakshaNe : p.tithi.paksha} Paksha)
            </p>
          </div>
          <div className={`w-full ${isDark ? 'bg-slate-700' : 'bg-slate-200'} h-1.5 rounded-full mt-3 overflow-hidden`}>
            <div
              className="bg-amber-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.max(10, p.tithi.percentageLeft)}%` }}
            ></div>
          </div>
        </div>

        {/* Vara */}
        <div className={`${isDark ? 'bg-slate-800/80 border-slate-700/80 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'} border rounded-xl p-4 flex flex-col justify-between hover:border-amber-500/50 transition-colors`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
              {t.panchangaVara}
            </span>
            <Sun className="w-4 h-4 text-orange-500" />
          </div>
          <div>
            <div className={`text-lg font-serif font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
              {isNe ? p.vara.nameNe : p.vara.nameEn}
            </div>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} mt-1 font-mono`}>
              Day Ruler: {isNe ? GRAHA_MAP[p.vara.ruler]?.ne || p.vara.ruler : p.vara.ruler}
            </p>
          </div>
        </div>

        {/* Nakshatra */}
        <div className={`${isDark ? 'bg-slate-800/80 border-slate-700/80 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'} border rounded-xl p-4 flex flex-col justify-between hover:border-amber-500/50 transition-colors`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
              {t.panchangaNakshatra}
            </span>
            <Sparkles className="w-4 h-4 text-cyan-500" />
          </div>
          <div>
            <div className={`text-lg font-serif font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
              {isNe ? p.nakshatra.nameNe : p.nakshatra.nameEn}
            </div>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} mt-1 font-mono`}>
              Lord: {isNe ? GRAHA_MAP[p.nakshatra.ruler]?.ne || p.nakshatra.ruler : p.nakshatra.ruler}
            </p>
          </div>
        </div>

        {/* Yoga */}
        <div className={`${isDark ? 'bg-slate-800/80 border-slate-700/80 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'} border rounded-xl p-4 flex flex-col justify-between hover:border-amber-500/50 transition-colors`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
              {t.panchangaYoga}
            </span>
            <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>#{p.yoga.number}</span>
          </div>
          <div>
            <div className={`text-lg font-serif font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
              {isNe ? p.yoga.nameNe : p.yoga.nameEn}
            </div>
          </div>
        </div>

        {/* Karana */}
        <div className={`${isDark ? 'bg-slate-800/80 border-slate-700/80 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'} border rounded-xl p-4 flex flex-col justify-between hover:border-amber-500/50 transition-colors`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
              {t.panchangaKarana}
            </span>
            <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>#{p.karana.number}</span>
          </div>
          <div>
            <div className={`text-lg font-serif font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
              {isNe ? p.karana.nameNe : p.karana.nameEn}
            </div>
          </div>
        </div>

        {/* Sunrise & Sunset */}
        <div className={`${isDark ? 'bg-slate-800/80 border-slate-700/80 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'} border rounded-xl p-4 flex flex-col justify-between hover:border-amber-500/50 transition-colors`}>
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
              {t.sunrise} / {t.sunset}
            </span>
          </div>
          <div className="space-y-1">
            <div className={`flex items-center justify-between text-xs ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
              <span className="flex items-center gap-1">
                <Sunrise className="w-3.5 h-3.5 text-amber-500" /> {t.sunrise}:
              </span>
              <span className={`font-mono ${isDark ? 'text-amber-300' : 'text-amber-700'} font-semibold`}>{p.sunrise}</span>
            </div>
            <div className={`flex items-center justify-between text-xs ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
              <span className="flex items-center gap-1">
                <Sunset className="w-3.5 h-3.5 text-orange-500" /> {t.sunset}:
              </span>
              <span className={`font-mono ${isDark ? 'text-orange-300' : 'text-orange-700'} font-semibold`}>{p.sunset}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Astronomical & Panchanga Details */}
      <div className={`p-4 rounded-xl ${isDark ? 'bg-slate-800/50 border border-slate-700/60' : 'bg-amber-50/60 border border-amber-200'} space-y-3`}>
        <h4 className={`text-xs font-serif font-bold ${isDark ? 'text-amber-300' : 'text-amber-900'} uppercase tracking-wider flex items-center gap-1.5`}>
          <Compass className="w-4 h-4 text-amber-500" />
          {isNe ? 'थप पञ्चाङ्ग तथा खगोलीय विवरण (Advanced Astronomical Details)' : 'Advanced Astronomical Details'}
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Sun Sign */}
          <div className={`${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-amber-100'} border p-3 rounded-lg flex flex-col justify-between`}>
            <span className="text-slate-400 font-semibold">{isNe ? 'सूर्य राशि (Sun Sign)' : 'Sun Sign'}</span>
            <span className={`font-serif font-bold text-sm mt-1 ${isDark ? 'text-amber-200' : 'text-amber-900'}`}>
              {isNe ? p.sunSignNe : p.sunSign}
            </span>
          </div>

          {/* Moon Sign */}
          <div className={`${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-amber-100'} border p-3 rounded-lg flex flex-col justify-between`}>
            <span className="text-slate-400 font-semibold">{isNe ? 'चन्द्र राशि (Moon Sign)' : 'Moon Sign'}</span>
            <span className={`font-serif font-bold text-sm mt-1 ${isDark ? 'text-cyan-200' : 'text-cyan-900'}`}>
              {isNe ? p.moonSignNe : p.moonSign}
            </span>
          </div>

          {/* Ritu & Ayana */}
          <div className={`${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-amber-100'} border p-3 rounded-lg flex flex-col justify-between`}>
            <span className="text-slate-400 font-semibold">{isNe ? 'ऋतु र अयन (Season & Ayana)' : 'Season & Ayana'}</span>
            <span className={`font-serif font-bold text-xs mt-1 ${isDark ? 'text-emerald-200' : 'text-emerald-900'}`}>
              {isNe ? `${p.rituNe} | ${p.ayanaNe}` : `${p.ritu} | ${p.ayana}`}
            </span>
          </div>

          {/* Rahu Kaal & Abhijit Muhurta */}
          <div className={`${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-amber-100'} border p-3 rounded-lg flex flex-col justify-between`}>
            <span className="text-slate-400 font-semibold flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> {isNe ? 'राहुकाल / अभिजित मुहूर्त' : 'Rahu Kaal / Abhijit'}
            </span>
            <div className="mt-1 space-y-0.5">
              <div className="text-[11px] text-rose-300 font-mono">Rahu: {p.rahuKaal}</div>
              <div className="text-[11px] text-emerald-300 font-mono">Abhijit: {p.abhijitMuhurta}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
