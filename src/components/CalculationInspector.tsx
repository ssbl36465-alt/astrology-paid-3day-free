import React from 'react';
import { KundaliCalculationOutput, Language } from '../types/astrology';
import { UI_TRANSLATIONS } from '../utils/i18n';
import { Terminal, ShieldCheck, Cpu } from 'lucide-react';

interface CalculationInspectorProps {
  data: KundaliCalculationOutput;
  language: Language;
}

export const CalculationInspector: React.FC<CalculationInspectorProps> = ({ data, language }) => {
  const t = UI_TRANSLATIONS[language];
  const audit = data.audit;

  return (
    <div className="bg-slate-900 border border-amber-900/50 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-amber-900/30">
        <h3 className="text-base sm:text-lg font-serif font-bold text-amber-200 flex items-center gap-2">
          <Terminal className="w-5 h-5 text-amber-400" />
          {t.tabAudit} (Method & Telemetry)
        </h3>
        <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-mono bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-800/60">
          <ShieldCheck className="w-3.5 h-3.5" /> NON-LLM PRECISION
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Telemetry Block */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs space-y-2.5 text-slate-300">
          <div className="text-amber-400 font-bold uppercase border-b border-slate-800 pb-1 flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-amber-400" /> Astronomical Constants
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Ephemeris Engine:</span>
            <span className="text-amber-300 font-bold">{audit.ephemerisSource}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Julian Day (JD):</span>
            <span className="text-slate-100">{audit.julianDay.toFixed(6)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">UTC Date String:</span>
            <span className="text-slate-100">{audit.utcDateString}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">GMST (Hours):</span>
            <span className="text-slate-100">{audit.greenwichSiderealTimeHours.toFixed(4)} hr</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">LST (Local Sidereal Time):</span>
            <span className="text-slate-100">{audit.localSiderealTimeHours.toFixed(4)} hr</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Ecliptic Obliquity (ε):</span>
            <span className="text-slate-100">{audit.obliquityDegrees.toFixed(6)}°</span>
          </div>
        </div>

        {/* Sidereal / Ayanamsa Block */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs space-y-2.5 text-slate-300">
          <div className="text-amber-400 font-bold uppercase border-b border-slate-800 pb-1">
            Zodiac & Ayanamsa Subtraction
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Lahiri Ayanamsa:</span>
            <span className="text-amber-300 font-bold">{audit.lahiriAyanamsaFormatted} ({audit.lahiriAyanamsaDegrees.toFixed(6)}°)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Tropical Lagna:</span>
            <span className="text-slate-100">{audit.tropicalLagnaDegrees.toFixed(4)}°</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Sidereal Lagna:</span>
            <span className="text-amber-300 font-bold">{audit.siderealLagnaDegrees.toFixed(4)}°</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">House System:</span>
            <span className="text-slate-100">Whole Sign (Rashi Bhava)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Calculation Method:</span>
            <span className="text-slate-100 text-[11px] text-right">{audit.calculationMethod}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
