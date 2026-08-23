import React from 'react';
import { KundaliCalculationOutput, Language } from '../types/astrology';
import { UI_TRANSLATIONS } from '../utils/i18n';
import { BookOpen, User, Briefcase, Landmark, Heart, GraduationCap, HeartPulse, Globe, Sparkles } from 'lucide-react';
import { PanditShambhuAIAssistant } from './PanditShambhuAIAssistant';

interface InterpretationViewProps {
  data: KundaliCalculationOutput;
  language: Language;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  personality: <User className="w-4 h-4 text-amber-400" />,
  career: <Briefcase className="w-4 h-4 text-cyan-400" />,
  finance: <Landmark className="w-4 h-4 text-emerald-400" />,
  marriage: <Heart className="w-4 h-4 text-rose-400" />,
  education: <GraduationCap className="w-4 h-4 text-indigo-400" />,
  health: <HeartPulse className="w-4 h-4 text-red-400" />,
  foreignTravel: <Globe className="w-4 h-4 text-teal-400" />,
  majorLifePeriods: <Sparkles className="w-4 h-4 text-amber-300" />,
};

export const InterpretationView: React.FC<InterpretationViewProps> = ({ data, language }) => {
  const t = UI_TRANSLATIONS[language];
  const isNe = language === 'ne';

  return (
    <div className="bg-slate-900 border border-amber-900/50 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-amber-900/30">
        <h3 className="text-base sm:text-lg font-serif font-bold text-amber-200 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-amber-400" />
          {t.tabInterpretations} (Jyotish Faladesh)
        </h3>
        <span className="text-xs text-amber-400/80 font-mono">
          Calculation-Driven Insights
        </span>
      </div>

      {/* Grid of Interpretation Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.interpretations.map((cat, idx) => {
          const icon = CATEGORY_ICONS[cat.categoryKey] || <Sparkles className="w-4 h-4 text-amber-400" />;
          const points = isNe ? cat.pointsNe : cat.pointsEn;

          return (
            <div
              key={idx}
              className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 shadow-md space-y-3 hover:border-amber-500/50 transition-colors"
            >
              <div className="flex items-center space-x-2 pb-2 border-b border-slate-700/60">
                {icon}
                <h4 className="text-sm font-serif font-bold text-amber-200">
                  {isNe ? cat.titleNe : cat.titleEn}
                </h4>
              </div>

              <ul className="space-y-2">
                {points.map((pt, pIdx) => (
                  <li key={pIdx} className="text-xs text-slate-300 leading-relaxed flex items-start space-x-2">
                    <span className="text-amber-400 font-bold shrink-0 mt-0.5">•</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Pandit Shambhu Prasad Lamsal (Binay) AI Assistant at the very bottom of Phaladeesh analysis */}
      <PanditShambhuAIAssistant data={data} language={language} />
    </div>
  );
};

