import React from 'react';
import { KundaliCalculationOutput, Language } from '../types/astrology';
import { UI_TRANSLATIONS, GRAHA_MAP } from '../utils/i18n';
import { Home } from 'lucide-react';

interface HouseTableProps {
  data: KundaliCalculationOutput;
  language: Language;
  theme?: 'dark' | 'light';
}

const HOUSE_NAMES_EN = [
  '1st (Tanu - Self/Body)',
  '2nd (Dhana - Wealth/Speech)',
  '3rd (Sahaja - Siblings/Courage)',
  '4th (Sukha - Home/Mother)',
  '5th (Putra - Intellect/Children)',
  '6th (Shatru - Health/Obstacles)',
  '7th (Yuvati - Spouse/Partnership)',
  '8th (Randhra - Longevity/Transformation)',
  '9th (Dharma - Luck/Higher Learning)',
  '10th (Karma - Career/Public Life)',
  '11th (Labha - Gains/Income)',
  '12th (Vyaya - Expenses/Moksha)',
];

const HOUSE_NAMES_NE = [
  '१म (तनु भाव - शरीर/व्यक्तित्व)',
  '२यम (धन भाव - सञ्चित धन/वाणी)',
  '३य (सहज भाव - भाइ-बहिनी/पराक्रम)',
  '४र्थ (सुख भाव - माता/घर-जग्गा)',
  '५म (पुत्र भाव - विद्या/बुद्धि)',
  '६ष्ठ (शत्रु भाव - रोग/ऋण)',
  '७म (युवती भाव - जीवनसाथी/व्यापार)',
  '८म (रन्ध्र भाव - आयु/सङ्कट)',
  '९म (धर्म भाव - भाग्य/धर्म)',
  '१०म (कर्म भाव - पेशा/प्रतिष्ठा)',
  '११म (लाभ भाव - आम्दानी/सफलता)',
  '१२म (व्यय भाव - खर्च/मोक्ष)',
];

export const HouseTable: React.FC<HouseTableProps> = ({ data, language, theme = 'dark' }) => {
  const t = UI_TRANSLATIONS[language];
  const isNe = language === 'ne';
  const isDark = theme === 'dark';

  return (
    <div className={`${isDark ? 'bg-slate-900 border-amber-900/50 text-slate-100' : 'bg-white border-amber-300 text-slate-900 shadow-xl'} border rounded-2xl p-4 sm:p-6 shadow-2xl overflow-x-auto transition-colors`}>
      <div className={`flex items-center justify-between pb-4 mb-4 border-b ${isDark ? 'border-amber-900/30' : 'border-amber-200'}`}>
        <h3 className={`text-base sm:text-lg font-serif font-bold ${isDark ? 'text-amber-200' : 'text-amber-800'} flex items-center gap-2`}>
          <Home className={`w-5 h-5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
          {t.tabHouses}
        </h3>
        <span className={`text-xs ${isDark ? 'text-amber-400/80' : 'text-amber-700'} font-mono`}>
          Whole Sign House System
        </span>
      </div>

      <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[650px]">
        <thead>
          <tr className={`border-b ${isDark ? 'border-slate-700 bg-slate-800/80 text-amber-300' : 'border-slate-200 bg-slate-100 text-amber-900'} uppercase tracking-wider font-semibold text-[11px]`}>
            <th className="py-3 px-3">{t.house}</th>
            <th className="py-3 px-3">{t.sign}</th>
            <th className="py-3 px-3">{t.lord}</th>
            <th className="py-3 px-3">{t.occupants}</th>
            <th className="py-3 px-3">{t.aspects}</th>
          </tr>
        </thead>
        <tbody className={`divide-y ${isDark ? 'divide-slate-800 text-slate-200' : 'divide-slate-200 text-slate-800'}`}>
          {data.houses.map((h) => {
            const lordInfo = GRAHA_MAP[h.lord];

            return (
              <tr key={h.houseNumber} className={`${isDark ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'} transition-colors`}>
                <td className={`py-3 px-3 font-semibold ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>
                  {isNe ? HOUSE_NAMES_NE[h.houseNumber - 1] : HOUSE_NAMES_EN[h.houseNumber - 1]}
                </td>
                <td className="py-3 px-3 font-medium">
                  {isNe ? h.signNameNe : h.signNameEn}
                </td>
                <td className="py-3 px-3">
                  <span className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: lordInfo.color }}
                    ></span>
                    <span>{isNe ? lordInfo.ne : h.lord}</span>
                  </span>
                </td>
                <td className="py-3 px-3">
                  {h.occupyingGrahas.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {h.occupyingGrahas.map((gName, gIdx) => (
                        <span
                          key={gIdx}
                          className={`px-2 py-0.5 rounded border text-xs font-semibold ${isDark ? 'bg-slate-800 border-amber-500/30 text-amber-200' : 'bg-amber-50 border-amber-300 text-amber-900'}`}
                        >
                          {isNe ? GRAHA_MAP[gName].ne : gName}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className={`${isDark ? 'text-slate-500' : 'text-slate-400'} font-mono italic text-xs`}>-</span>
                  )}
                </td>
                <td className="py-3 px-3">
                  {h.aspectingGrahas.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {h.aspectingGrahas.map((gName, aIdx) => (
                        <span
                          key={aIdx}
                          className={`px-2 py-0.5 rounded border text-xs ${isDark ? 'bg-slate-800/80 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-700'}`}
                        >
                          {isNe ? GRAHA_MAP[gName].ne : gName}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className={`${isDark ? 'text-slate-500' : 'text-slate-400'} font-mono italic text-xs`}>-</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

