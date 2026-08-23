import React from 'react';
import { KundaliCalculationOutput, Language } from '../types/astrology';
import { UI_TRANSLATIONS, GRAHA_MAP } from '../utils/i18n';
import { Compass, RotateCcw, ShieldCheck } from 'lucide-react';

interface PlanetaryTableProps {
  data: KundaliCalculationOutput;
  language: Language;
  theme?: 'dark' | 'light';
}

export const PlanetaryTable: React.FC<PlanetaryTableProps> = ({ data, language, theme = 'dark' }) => {
  const t = UI_TRANSLATIONS[language];
  const isNe = language === 'ne';
  const isDark = theme === 'dark';

  return (
    <div className={`${isDark ? 'bg-slate-900 border-amber-900/50 text-slate-100' : 'bg-white border-amber-300 text-slate-900 shadow-xl'} border rounded-2xl p-4 sm:p-6 shadow-2xl overflow-x-auto transition-colors`}>
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b ${isDark ? 'border-amber-900/30' : 'border-amber-200'}`}>
        <h3 className={`text-base sm:text-lg font-serif font-bold ${isDark ? 'text-amber-200' : 'text-amber-800'} flex items-center gap-2`}>
          <Compass className={`w-5 h-5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
          {t.tabPlanets}
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`text-xs ${isDark ? 'bg-amber-950/90 text-amber-300 border-amber-700/60' : 'bg-amber-100 text-amber-900 border-amber-300'} border px-2.5 py-1 rounded-full font-mono`}>
            {data.audit.calculationMethod}
          </span>
          <span className={`text-xs ${isDark ? 'text-amber-400/80' : 'text-amber-700'} font-mono`}>
            Lagna: {isNe ? data.ascendant.signNameNe : data.ascendant.signNameEn} ({data.ascendant.degreeFormatted})
          </span>
        </div>
      </div>

      <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[650px]">
        <thead>
          <tr className={`border-b ${isDark ? 'border-slate-700 bg-slate-800/80 text-amber-300' : 'border-slate-200 bg-slate-100 text-amber-900'} uppercase tracking-wider font-semibold text-[11px]`}>
            <th className="py-3 px-3">{t.graha}</th>
            <th className="py-3 px-3">{t.sign}</th>
            <th className="py-3 px-3">{t.degree}</th>
            <th className="py-3 px-3">{t.house}</th>
            <th className="py-3 px-3">{t.nakshatra}</th>
            <th className="py-3 px-3">{t.pada}</th>
            <th className="py-3 px-3">{t.status}</th>
          </tr>
        </thead>
        <tbody className={`divide-y ${isDark ? 'divide-slate-800 text-slate-200' : 'divide-slate-200 text-slate-800'}`}>
          {/* Ascendant Row */}
          <tr className={`${isDark ? 'bg-amber-950/30 text-amber-200' : 'bg-amber-50 text-amber-900'} font-semibold`}>
            <td className="py-3 px-3 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block animate-ping"></span>
              <span>{t.lagna}</span>
            </td>
            <td className="py-3 px-3">{isNe ? data.ascendant.signNameNe : data.ascendant.signNameEn}</td>
            <td className="py-3 px-3 font-mono">{data.ascendant.degreeFormatted}</td>
            <td className="py-3 px-3 font-mono">House #1</td>
            <td className="py-3 px-3">{isNe ? data.ascendant.nakshatraNameNe : data.ascendant.nakshatraNameEn}</td>
            <td className="py-3 px-3 font-mono">{data.ascendant.pada}</td>
            <td className="py-3 px-3 text-emerald-600">
              <span className={`px-2 py-0.5 rounded border text-[11px] ${isDark ? 'bg-emerald-950/80 border-emerald-800/60 text-emerald-300' : 'bg-emerald-100 border-emerald-300 text-emerald-900'}`}>
                Rising Sign
              </span>
            </td>
          </tr>

          {/* Grahas Rows */}
          {data.grahas.map((g, idx) => {
            const grahaInfo = GRAHA_MAP[g.name];

            return (
              <tr key={idx} className={`${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'} transition-colors`}>
                <td className="py-3 px-3 font-medium flex items-center space-x-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: grahaInfo.color }}
                  ></span>
                  <span>{isNe ? grahaInfo.ne : g.name}</span>
                  <span className={`${isDark ? 'text-slate-400' : 'text-slate-500'} text-[11px] font-serif`}>({grahaInfo.sanskrit})</span>
                </td>
                <td className="py-3 px-3">{isNe ? g.signNameNe : g.signNameEn}</td>
                <td className={`py-3 px-3 font-mono ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{g.degreeFormatted}</td>
                <td className={`py-3 px-3 font-mono ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>House #{g.house}</td>
                <td className="py-3 px-3">
                  {isNe ? g.nakshatraNameNe : g.nakshatraNameEn}
                  <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'} block font-mono`}>
                    Lord: {isNe ? GRAHA_MAP[g.nakshatraRuler].ne : g.nakshatraRuler}
                  </span>
                </td>
                <td className="py-3 px-3 font-mono">{g.pada}</td>
                <td className="py-3 px-3">
                  <div className="flex flex-wrap gap-1 items-center">
                    {/* Motion */}
                    {g.isRetrograde ? (
                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-800/60 font-semibold">
                        <RotateCcw className="w-3 h-3" />
                        {isNe ? 'वक्री (R)' : 'Retrograde'}
                      </span>
                    ) : (
                      <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded border ${isDark ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                        {isNe ? 'मार्गी (D)' : 'Direct'}
                      </span>
                    )}

                    {/* Combustion */}
                    {g.isCombust !== undefined && (
                      <span className={`text-[10px] px-2 py-0.5 rounded font-medium border ${
                        g.isCombust
                          ? 'bg-amber-950/80 text-amber-300 border-amber-700/80 font-bold animate-pulse'
                          : 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60'
                      }`}>
                        {isNe ? (g.isCombust ? 'अस्त (Combust)' : 'उदय (Rising)') : (g.isCombust ? 'Combust' : 'Rising')}
                      </span>
                    )}

                    {/* Dignity */}
                    {g.dignityNe && (
                      <span className={`text-[10px] px-2 py-0.5 rounded font-medium border ${
                        g.dignityNe === 'उच्च' ? 'bg-amber-500/20 text-amber-800 border-amber-500/50 font-bold' :
                        g.dignityNe === 'नीच' ? 'bg-red-500/20 text-red-800 border-red-500/50 font-bold' :
                        g.dignityNe === 'स्वगृही' ? 'bg-emerald-500/20 text-emerald-800 border-emerald-500/50 font-bold' :
                        g.dignityNe === 'मित्र' ? 'bg-sky-500/20 text-sky-800 border-sky-500/40' :
                        g.dignityNe === 'शत्रु' ? 'bg-orange-500/20 text-orange-800 border-orange-500/40' :
                        isDark ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {isNe ? g.dignityNe : g.dignityEn}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

