import React from 'react';
import { KundaliCalculationOutput, Language, GrahaName } from '../types/astrology';
import { UI_TRANSLATIONS, RASHI_LIST, GRAHA_MAP } from '../utils/i18n';
import { Activity } from 'lucide-react';

interface ShadbalaAshtakavargaViewProps {
  data: KundaliCalculationOutput;
  language: Language;
}

export const ShadbalaAshtakavargaView: React.FC<ShadbalaAshtakavargaViewProps> = ({
  data,
  language,
}) => {
  const t = UI_TRANSLATIONS[language];
  const ash = data.ashtakavarga;
  const isNe = language === 'ne';

  return (
    <div className="bg-slate-900 border border-amber-900/50 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-amber-900/30">
        <h3 className="text-base sm:text-lg font-serif font-bold text-amber-200 flex items-center gap-2">
          <Activity className="w-5 h-5 text-amber-400" />
          {t.tabAshtakavarga} (Samudaya Ashtakavarga Points)
        </h3>
        <span className="text-xs text-amber-400/80 font-mono">
          Eightfold Strength Points (0 to 8 per Sign)
        </span>
      </div>

      {/* Samudaya Ashtakavarga Chart Grid */}
      <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4">
        <h4 className="text-xs font-semibold uppercase text-amber-400 mb-3 font-mono">
          Samudaya Ashtakavarga Total Points per Sign (Ideal: 28+ points)
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {RASHI_LIST.map((rashi, idx) => {
            const points = ash.samudayaAshtakavarga[idx];
            const isStrong = points >= 28;

            return (
              <div
                key={idx}
                className={`p-3 rounded-xl border text-center flex flex-col items-center justify-between transition-all ${
                  isStrong
                    ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                    : 'bg-slate-900/80 border-slate-700 text-slate-300'
                }`}
              >
                <span className="text-xs font-bold text-slate-300">
                  {isNe ? rashi.nameNe : rashi.nameEn}
                </span>
                <span className="text-2xl font-serif font-bold text-amber-300 my-1 font-mono">
                  {points}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                    isStrong ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {isStrong ? 'STRONG' : 'AVERAGE'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Binnashtakavarga Table */}
      <div className="overflow-x-auto">
        <h4 className="text-xs font-semibold uppercase text-amber-400 mb-3 font-mono">
          Binnashtakavarga Individual Planet Points
        </h4>

        <table className="w-full text-left text-xs border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-800/90 text-amber-300">
              <th className="py-2.5 px-3">Graha</th>
              {RASHI_LIST.map((r, i) => (
                <th key={i} className="py-2.5 px-2 text-center font-mono">
                  {isNe ? r.nameNe.substring(0, 3) : r.nameEn.substring(0, 3)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-200 font-mono">
            {Object.entries(ash.binnashtakavarga).map(([gName, pointsArr], gIdx) => (
              <tr key={gIdx} className="hover:bg-slate-800/50">
                <td className="py-2 px-3 font-sans font-semibold text-amber-200">
                  {isNe && GRAHA_MAP[gName as GrahaName] ? GRAHA_MAP[gName as GrahaName].ne : gName}
                </td>
                {(pointsArr as number[]).map((pts, pIdx) => (
                  <td
                    key={pIdx}
                    className={`py-2 px-2 text-center ${
                      pts >= 5 ? 'text-amber-300 font-bold' : 'text-slate-400'
                    }`}
                  >
                    {pts}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
