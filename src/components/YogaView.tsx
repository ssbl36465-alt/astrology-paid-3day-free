import React from 'react';
import { KundaliCalculationOutput, Language } from '../types/astrology';
import { UI_TRANSLATIONS, GRAHA_MAP } from '../utils/i18n';
import { Award, CheckCircle, Info } from 'lucide-react';

interface YogaViewProps {
  data: KundaliCalculationOutput;
  language: Language;
}

export const YogaView: React.FC<YogaViewProps> = ({ data, language }) => {
  const t = UI_TRANSLATIONS[language];
  const isNe = language === 'ne';

  return (
    <div className="bg-slate-900 border border-amber-900/50 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-amber-900/30">
        <h3 className="text-base sm:text-lg font-serif font-bold text-amber-200 flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" />
          {t.tabYogas} (Verified Astronomical Formations)
        </h3>
        <span className="text-xs text-amber-400/80 font-mono">
          Strict Rule Evaluation
        </span>
      </div>

      {data.yogas.length > 0 ? (
        <div className="space-y-4">
          {data.yogas.map((y) => (
            <div
              key={y.id}
              className="bg-slate-800/80 border border-amber-500/40 rounded-xl p-4 shadow-md space-y-2 hover:border-amber-400/70 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-amber-400 shrink-0" />
                  <h4 className="text-base font-serif font-bold text-amber-200">
                    {isNe ? y.nameNe : y.nameEn}
                  </h4>
                </div>
                <span className="text-[11px] font-semibold font-mono bg-amber-950 text-amber-300 border border-amber-800/60 px-2.5 py-0.5 rounded-full">
                  {isNe ? y.categoryNe : y.category}
                </span>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed pl-7">
                {isNe ? y.descriptionNe : y.descriptionEn}
              </p>

              {/* Planets involved & Fulfilled rule */}
              <div className="pl-7 pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs gap-2 border-t border-slate-700/60">
                <div className="flex items-center space-x-1.5">
                  <span className="text-slate-400 font-medium">Involved Grahas:</span>
                  <div className="flex gap-1">
                    {y.involvedGrahas.map((g, gIdx) => (
                      <span
                        key={gIdx}
                        className="px-2 py-0.5 rounded bg-slate-900 border border-amber-500/30 text-amber-300 font-semibold text-[11px]"
                      >
                        {isNe ? GRAHA_MAP[g].ne : g}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-[11px] text-amber-300/90 font-mono bg-slate-900/80 px-2.5 py-1 rounded border border-slate-700">
                  <span className="text-slate-400 mr-1">{t.ruleFulfilled}:</span>
                  {isNe ? y.fulfillmentReasonNe : y.fulfillmentReasonEn}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center text-slate-400 bg-slate-800/40 border border-slate-700 rounded-xl">
          <Info className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <p className="text-sm font-medium">{t.noYogaFound}</p>
        </div>
      )}
    </div>
  );
};
