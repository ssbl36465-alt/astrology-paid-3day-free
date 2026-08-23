import React, { useState } from 'react';
import { KundaliCalculationOutput, Language, BirthDetails } from '../types/astrology';
import { BENCHMARK_PROFILES, runIndependentValidation, ValidationReport } from '../engine/validationEngine';
import { runCalculationEngineTests, EngineTestSuiteResult } from '../engine/tests/astrologyEngine.test';
import { RASHI_LIST, NAKSHATRA_LIST, GRAHA_MAP } from '../utils/i18n';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  FlaskConical,
  Scale,
  Sparkles,
  Info,
  Calendar,
  MapPin,
  RefreshCw,
  SlidersHorizontal,
  Terminal,
  Cpu,
} from 'lucide-react';

interface ValidationSystemViewProps {
  data: KundaliCalculationOutput;
  language: Language;
  onSelectBenchmarkProfile?: (details: BirthDetails) => void;
}

export const ValidationSystemView: React.FC<ValidationSystemViewProps> = ({
  data,
  language,
  onSelectBenchmarkProfile,
}) => {
  const isNe = language === 'ne';
  const report: ValidationReport = data.validationReport;

  const [selectedBenchmarkIdx, setSelectedBenchmarkIdx] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'suite' | 'siddhanta' | 'engineTests'>('suite');
  const [engineTestResults, setEngineTestResults] = useState<EngineTestSuiteResult>(() => runCalculationEngineTests());

  const handleRunEngineTests = () => {
    setEngineTestResults(runCalculationEngineTests());
  };

  const ss = data.suryaSiddhanta;

  return (
    <div className="space-y-6">
      {/* Top Banner & Status Header */}
      <div className="bg-slate-900 border border-emerald-900/60 rounded-2xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-emerald-900/40">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
              <h2 className="text-xl font-serif font-bold text-emerald-200">
                {isNe ? 'स्वतन्त्र कुण्डली प्रमाणीकरण प्रणाली' : 'Independent Calculation Validation Engine'}
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              {isNe
                ? 'सूर्य सिद्धान्त र दृक् सिद्धान्त (Swiss Ephemeris DE441) दुवैको स्वतन्त्र गणितीय परीक्षण, सहनशीलता (Tolerance) र पास/फेल मूल्याङ्कन।'
                : 'Deterministic validation suite across 12 core astronomical & astrological items comparing Expected vs Actual results with strict tolerance boundaries.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-emerald-950/80 border border-emerald-500/60 px-4 py-2 rounded-xl text-center">
              <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-wider block">
                {isNe ? 'प्रमाणीकरण अवस्था' : 'Overall Status'}
              </span>
              <span className="text-sm font-black text-emerald-300 flex items-center gap-1.5 mt-0.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                {report.overallStatus}
              </span>
            </div>

            <div className="bg-slate-950 border border-slate-800 px-3.5 py-2 rounded-xl text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                {isNe ? 'पास दर' : 'Pass Rate'}
              </span>
              <span className="text-base font-bold text-amber-300 font-mono">
                {report.passPercentage.toFixed(0)}% ({report.passCount}/{report.totalTests})
              </span>
            </div>
          </div>
        </div>

        {/* Audit Disclaimer */}
        <div className="mt-4 bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Non-LLM Guarantee:</strong> All 12 items are calculated deterministically using double-entry ephemeris formulas without LLM estimates.
            </span>
          </div>
          <span className="font-mono text-[10px] bg-slate-800 px-2 py-0.5 rounded text-amber-300 border border-slate-700">
            Audit ID: {report.auditHash}
          </span>
        </div>
      </div>

      {/* View Selector Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('suite')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'suite'
                ? 'bg-emerald-600 text-slate-950 shadow-lg shadow-emerald-600/20'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <FlaskConical className="w-4 h-4" />
            12 Validation Point Matrix
          </button>

          <button
            onClick={() => setActiveTab('siddhanta')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'siddhanta'
                ? 'bg-emerald-600 text-slate-950 shadow-lg shadow-emerald-600/20'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Scale className="w-4 h-4" />
            Surya Siddhanta vs Drik Siddhanta
          </button>

          <button
            onClick={() => setActiveTab('engineTests')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'engineTests'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'bg-slate-900 text-amber-400 hover:text-amber-200 border border-amber-900/50'
            }`}
          >
            <Cpu className="w-4 h-4 text-amber-400 group-hover:text-amber-300" />
            Phase 1 Automated Engine Unit Tests ({engineTestResults.passCount}/{engineTestResults.totalTests})
          </button>
        </div>

        {/* Preset Benchmark selector */}
        {onSelectBenchmarkProfile && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Test Profile:</span>
            <select
              value={selectedBenchmarkIdx ?? ''}
              onChange={(e) => {
                const idx = e.target.value === '' ? null : parseInt(e.target.value, 10);
                setSelectedBenchmarkIdx(idx);
                if (idx !== null) {
                  onSelectBenchmarkProfile(BENCHMARK_PROFILES[idx].details);
                }
              }}
              className="bg-slate-900 text-slate-200 border border-slate-700 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-emerald-500"
            >
              <option value="">Current Chart ({data.birthDetails.name})</option>
              {BENCHMARK_PROFILES.map((p, idx) => (
                <option key={idx} value={idx}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Tab 1: 12 Point Validation Results Table */}
      {activeTab === 'suite' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm sm:text-base font-serif font-bold text-amber-200 flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-emerald-400" />
              12 Required Astronomical & Astrological Verification Points
            </h3>
            <span className="text-xs font-mono text-emerald-400">
              {report.passCount}/{report.totalTests} Passed
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 text-amber-400 border-b border-slate-800 uppercase font-mono">
                  <th className="p-3 w-12 text-center">#</th>
                  <th className="p-3 min-w-[150px]">Validation Item</th>
                  <th className="p-3 min-w-[200px]">Expected Result</th>
                  <th className="p-3 min-w-[200px]">Actual Result</th>
                  <th className="p-3 min-w-[120px]">Difference</th>
                  <th className="p-3 min-w-[120px]">Tolerance</th>
                  <th className="p-3 w-24 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {report.items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 text-center text-slate-400 font-bold">{item.id}</td>
                    <td className="p-3">
                      <div className="font-bold text-slate-200">{item.topic}</div>
                      <div className="text-[10px] text-slate-400 font-sans">{item.componentName}</div>
                    </td>
                    <td className="p-3 text-slate-300 break-words text-[11px]">
                      {item.expectedResult}
                    </td>
                    <td className="p-3 text-emerald-300 font-semibold break-words text-[11px]">
                      {item.actualResult}
                    </td>
                    <td className="p-3 text-slate-300 text-[11px]">
                      {item.difference}
                    </td>
                    <td className="p-3 text-slate-400 text-[10px]">
                      {item.tolerance}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black border ${
                          item.status === 'PASS'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                            : 'bg-rose-950 text-rose-300 border-rose-600'
                        }`}
                      >
                        {item.status === 'PASS' ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" /> PASS
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" /> FAIL
                          </>
                        )}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Surya Siddhanta vs Drik Siddhanta Comparison */}
      {activeTab === 'siddhanta' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-2">
            <div>
              <h3 className="text-base font-serif font-bold text-amber-200 flex items-center gap-2">
                <Scale className="w-5 h-5 text-amber-400" />
                Surya Siddhanta vs Drik Siddhanta Comparative Analysis
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Side-by-side verification of traditional canonical Surya Siddhanta vs modern observational Drik Ephemeris for same birth time.
              </p>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="bg-amber-950 text-amber-300 px-2.5 py-1 rounded border border-amber-800/60">
                SS Ayanamsa: {ss.ayanamsa.toFixed(4)}°
              </span>
              <span className="bg-blue-950 text-blue-300 px-2.5 py-1 rounded border border-blue-800/60">
                Lahiri Ayanamsa: {data.audit.lahiriAyanamsaDegrees.toFixed(4)}°
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Surya Siddhanta Summary Card */}
            <div className="bg-slate-950 border border-amber-900/40 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold font-mono uppercase text-amber-400 border-b border-amber-900/40 pb-1.5 flex items-center justify-between">
                <span>Surya Siddhanta (Classical Engine)</span>
                <span className="text-[10px] text-amber-300 font-normal">Kali Ahargana: {ss.ahargana.toFixed(1)} days</span>
              </h4>
              <div className="text-xs space-y-2 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Canonical SS Lagna:</span>
                  <span className="font-mono text-amber-300 font-bold">
                    {RASHI_LIST[ss.lagnaSignIndex].nameEn} ({ss.lagnaLongitude.toFixed(2)}°)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">SS Ayanamsa Model:</span>
                  <span className="font-mono text-slate-200">Trepidation (±27° Cycle)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Equation of Center:</span>
                  <span className="font-mono text-slate-200">Manda Phala Epicycles</span>
                </div>
              </div>
            </div>

            {/* Drik Siddhanta Summary Card */}
            <div className="bg-slate-950 border border-blue-900/40 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold font-mono uppercase text-blue-400 border-b border-blue-900/40 pb-1.5 flex items-center justify-between">
                <span>Drik Siddhanta (Observational Engine)</span>
                <span className="text-[10px] text-blue-300 font-normal">JD: {data.audit.julianDay.toFixed(4)}</span>
              </h4>
              <div className="text-xs space-y-2 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Drik Sidereal Lagna:</span>
                  <span className="font-mono text-blue-300 font-bold">
                    {data.ascendant.signNameEn} ({data.ascendant.siderealLongitude.toFixed(2)}°)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Ephemeris Source:</span>
                  <span className="font-mono text-slate-200">DE441 Vector Precision</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Ayanamsa Model:</span>
                  <span className="font-mono text-slate-200">Chitra Paksha / Lahiri</span>
                </div>
              </div>
            </div>
          </div>

          {/* Planetary Comparison Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 text-amber-400 border-b border-slate-800 uppercase font-mono">
                  <th className="p-3">Body / Graha</th>
                  <th className="p-3">Surya Siddhanta Deg</th>
                  <th className="p-3">Surya Rashi</th>
                  <th className="p-3">Drik Siddhanta Deg</th>
                  <th className="p-3">Drik Rashi</th>
                  <th className="p-3 text-right">Difference (SS vs Drik)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {/* Lagna Row */}
                <tr className="bg-amber-950/20 font-bold">
                  <td className="p-3 text-amber-300">Lagna (Ascendant)</td>
                  <td className="p-3 text-slate-200">{ss.lagnaLongitude.toFixed(2)}°</td>
                  <td className="p-3 text-amber-300">{RASHI_LIST[ss.lagnaSignIndex].nameEn}</td>
                  <td className="p-3 text-slate-200">{data.ascendant.siderealLongitude.toFixed(2)}°</td>
                  <td className="p-3 text-blue-300">{data.ascendant.signNameEn}</td>
                  <td className="p-3 text-right text-amber-400">
                    {Math.abs(ss.lagnaLongitude - data.ascendant.siderealLongitude).toFixed(2)}°
                  </td>
                </tr>

                {/* 9 Grahas */}
                {data.grahas.map((g) => {
                  const ssG = ss.grahas.find((item) => item.name === g.name)!;
                  const diff = Math.abs(ssG.trueLongitude - g.siderealLongitude);
                  return (
                    <tr key={g.name} className="hover:bg-slate-800/40">
                      <td className="p-3 flex items-center gap-2 font-bold text-slate-200">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: GRAHA_MAP[g.name].color }}
                        ></span>
                        {g.name} ({GRAHA_MAP[g.name].ne})
                      </td>
                      <td className="p-3 text-slate-300">{ssG.trueLongitude.toFixed(2)}°</td>
                      <td className="p-3 text-slate-300">{RASHI_LIST[ssG.signIndex].nameEn}</td>
                      <td className="p-3 text-slate-100 font-semibold">{g.siderealLongitude.toFixed(2)}°</td>
                      <td className="p-3 text-blue-300 font-semibold">{g.signNameEn}</td>
                      <td className="p-3 text-right text-amber-300">{diff.toFixed(2)}°</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Automated Calculation Engine Unit Tests View */}
      {activeTab === 'engineTests' && (
        <div className="bg-slate-900 border border-amber-900/50 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-amber-900/30">
            <div>
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-serif font-bold text-amber-200">
                  Phase 1 Astrological Calculation Engine Automated Test Suite
                </h3>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Deterministic unit test suite validating Julian Day, DE441 Ephemeris longitudes, Surya Siddhanta Kali Ahargana, method switching determinism, and error boundaries.
              </p>
            </div>

            <button
              onClick={handleRunEngineTests}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Re-run Unit Tests
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-center">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Unit Tests</span>
              <span className="text-lg font-bold text-slate-100 font-mono">{engineTestResults.totalTests}</span>
            </div>
            <div className="bg-emerald-950/40 border border-emerald-800/50 rounded-xl p-3 text-center">
              <span className="text-[10px] text-emerald-400 uppercase font-bold block">Passed</span>
              <span className="text-lg font-bold text-emerald-300 font-mono">{engineTestResults.passCount}</span>
            </div>
            <div className="bg-rose-950/40 border border-rose-800/50 rounded-xl p-3 text-center">
              <span className="text-[10px] text-rose-400 uppercase font-bold block">Failed</span>
              <span className="text-lg font-bold text-rose-300 font-mono">{engineTestResults.failCount}</span>
            </div>
          </div>

          <div className="space-y-3">
            {engineTestResults.results.map((res, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  res.passed
                    ? 'bg-slate-950/80 border-emerald-900/60'
                    : 'bg-rose-950/20 border-rose-800/60'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {res.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    <span className="text-sm font-bold text-slate-200">{res.testName}</span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono pl-6">{res.message}</p>
                </div>

                <div className="text-right shrink-0 pl-6 sm:pl-0">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    res.passed ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60' : 'bg-rose-950 text-rose-300 border border-rose-800/60'
                  }`}>
                    {res.passed ? 'PASS' : 'FAIL'}
                  </span>
                  <span className="block text-[10px] text-slate-300 font-mono mt-1">
                    {res.executionTimeMs.toFixed(2)} ms
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
