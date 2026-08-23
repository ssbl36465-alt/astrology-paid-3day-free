import React, { useState } from 'react';
import { KundaliCalculationOutput, Language, ChartStyle } from '../types/astrology';
import { UI_TRANSLATIONS } from '../utils/i18n';
import { NorthIndianChart } from './NorthIndianChart';
import { SouthIndianChart } from './SouthIndianChart';
import { EastIndianChart } from './EastIndianChart';
import { Layers } from 'lucide-react';

interface DivisionalChartsViewProps {
  data: KundaliCalculationOutput;
  language: Language;
  chartStyle: ChartStyle;
  theme?: 'dark' | 'light';
}

export const DivisionalChartsView: React.FC<DivisionalChartsViewProps> = ({
  data,
  language,
  chartStyle,
  theme = 'dark',
}) => {
  const t = UI_TRANSLATIONS[language];
  const [selectedChartId, setSelectedChartId] = useState<string>('D9');

  const selectedDivisional = data.divisionalCharts.find((c) => c.id === selectedChartId) || data.divisionalCharts[1];
  const isNe = language === 'ne';
  const isDark = theme === 'dark';

  // Construct a modified calculation object specifically for rendering the chosen divisional chart
  const divKundaliData: KundaliCalculationOutput = {
    ...data,
    ascendant: {
      ...data.ascendant,
      signIndex: selectedDivisional.ascendantSignIndex,
      signNameEn: data.ascendant.signNameEn,
      signNameNe: data.ascendant.signNameNe,
    },
    grahas: data.grahas.map((g) => {
      const p = selectedDivisional.positions.find((pos) => pos.graha === g.name);
      return {
        ...g,
        signIndex: p ? p.signIndex : g.signIndex,
        house: p ? p.house : g.house,
      };
    }),
  };

  return (
    <div className={`border rounded-2xl p-4 sm:p-6 shadow-2xl space-y-6 transition-colors ${isDark ? 'bg-slate-900 border-amber-900/50 text-slate-100' : 'bg-white border-amber-300 text-slate-900 shadow-xl'}`}>
      {/* Header */}
      <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b gap-3 ${isDark ? 'border-amber-900/30' : 'border-amber-200'}`}>
        <div>
          <h3 className={`text-base sm:text-lg font-serif font-bold flex items-center gap-2 ${isDark ? 'text-amber-200' : 'text-amber-800'}`}>
            <Layers className={`w-5 h-5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
            {t.tabDivisional} (Varga Kundalis)
          </h3>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-amber-300/80' : 'text-amber-700'}`}>
            D1 (Rashi), D9 (Navamsa - Marriage/Spouse), D10 (Dashamsa - Career/Power)
          </p>
        </div>

        {/* Divisional Selector Pills */}
        <div className={`flex p-1 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700/80' : 'bg-slate-100 border-slate-300'}`}>
          {data.divisionalCharts.map((chart) => (
            <button
              key={chart.id}
              onClick={() => setSelectedChartId(chart.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedChartId === chart.id
                  ? 'bg-amber-600 text-slate-950 shadow-md'
                  : isDark ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              {chart.code}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Title and Description */}
      <div className={`border rounded-xl p-4 ${isDark ? 'bg-slate-800/80 border-slate-700/80 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-900'}`}>
        <h4 className={`text-base font-serif font-bold ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>
          {isNe ? selectedDivisional.nameNe : selectedDivisional.nameEn}
        </h4>
        <p className={`text-xs mt-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
          {selectedDivisional.description}
        </p>
      </div>

      {/* Render Chart */}
      <div className="flex justify-center pt-2">
        {chartStyle === 'north' ? (
          <NorthIndianChart
            data={divKundaliData}
            language={language}
            title={isNe ? selectedDivisional.nameNe : selectedDivisional.nameEn}
            theme={theme}
          />
        ) : chartStyle === 'south' ? (
          <SouthIndianChart
            data={divKundaliData}
            language={language}
            title={isNe ? selectedDivisional.nameNe : selectedDivisional.nameEn}
            theme={theme}
          />
        ) : (
          <EastIndianChart
            data={divKundaliData}
            language={language}
            title={isNe ? selectedDivisional.nameNe : selectedDivisional.nameEn}
            theme={theme}
          />
        )}
      </div>
    </div>
  );
};
