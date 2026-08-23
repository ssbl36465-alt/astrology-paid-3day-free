import React from 'react';
import { KundaliCalculationOutput, Language } from '../types/astrology';
import { UI_TRANSLATIONS, GRAHA_MAP } from '../utils/i18n';
import { Moon, Sun, CalendarDays, Sparkles, Sunrise, Sunset } from 'lucide-react';

interface PanchangaViewProps {
  data: KundaliCalculationOutput;
  language: Language;
  theme?: 'dark' | 'light';
}

export const PanchangaView: React.FC<PanchangaViewProps> = ({ data, language, theme = 'dark' }) => {
  const t = UI_TRANSLATIONS[language];
  const p = data.panchanga;
  const isNe = language === 'ne';
  const isDark = theme === 'dark';

  return (
    <div className={`${isDark ? 'bg-slate-900 border-amber-900/50 text-slate-100' : 'bg-white border-amber-300 text-slate-900 shadow-xl'} border rounded-2xl p-4 sm:p-6 shadow-2xl space-y-6 transition-colors`}>
      <div className={`flex items-center justify-between pb-3 border-b ${isDark ? 'border-amber-900/30' : 'border-amber-200'}`}>
        <h3 className={`text-base sm:text-lg font-serif font-bold ${isDark ? 'text-amber-200' : 'text-amber-800'} flex items-center gap-2`}>
          <CalendarDays className={`w-5 h-5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
          {t.tabPanchanga}
        </h3>
        <span className={`text-xs ${isDark ? 'text-amber-400/80' : 'text-amber-700'} font-mono`}>
          Five Limbs of Time
        </span>
      </div>

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
              Day Ruler: {isNe ? GRAHA_MAP[p.vara.ruler].ne : p.vara.ruler}
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
              Lord: {isNe ? GRAHA_MAP[p.nakshatra.ruler].ne : p.nakshatra.ruler}
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
    </div>
  );
};

