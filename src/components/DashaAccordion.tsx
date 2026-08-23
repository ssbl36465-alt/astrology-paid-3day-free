import React, { useState } from 'react';
import { MahadashaWithSubperiods } from '../engine/dashaSubPeriods';
import { GRAHA_MAP } from '../utils/i18n';
import { ChevronDown, ChevronRight, CheckCircle2, Layers } from 'lucide-react';

interface DashaAccordionProps {
  mahadashas: MahadashaWithSubperiods[];
  language: 'ne' | 'en';
  systemName: string;
  isPrintMode?: boolean;
}

export const DashaAccordion: React.FC<DashaAccordionProps> = ({
  mahadashas,
  language,
  systemName,
  isPrintMode = false,
}) => {
  const isNe = language === 'ne';

  // Default expand active Mahadasha
  const activeMdIdx = mahadashas.findIndex((m) => m.isCurrent);
  const [expandedMdIndex, setExpandedMdIndex] = useState<number | null>(
    activeMdIdx !== -1 ? activeMdIdx : 0
  );

  // Expanded Antardasha key format: `${mdIdx}-${adIdx}`
  const [expandedAdKey, setExpandedAdKey] = useState<string | null>(null);

  if (isPrintMode) {
    // Print View: Clean, structured nested tables suitable for multi-page print or full page view
    return (
      <div className="space-y-4 text-xs font-serif text-[#78350f]">
        <div className="border-b-2 border-[#78350f] pb-1 font-bold text-sm text-[#991b1b] uppercase tracking-wide flex justify-between items-center">
          <span>॥ {systemName} - सम्पूर्ण महादशा, अन्तर्दशा र प्रत्यन्तर्दशा विवरण ॥</span>
        </div>

        {mahadashas.map((md, mdIdx) => (
          <div key={mdIdx} className="border border-[#78350f] rounded bg-white p-2 break-inside-avoid shadow-sm">
            {/* Mahadasha Header */}
            <div className="flex justify-between items-center bg-[#fffbeb] p-1.5 border-b border-[#78350f] font-bold text-xs">
              <span className="text-[#991b1b] flex items-center gap-1.5">
                <span>{md.planetNe} {isNe ? 'महादशा' : 'Mahadasha'}</span>
                {md.cycleNumber && <span className="text-[10px] text-slate-600">(चक्र {md.cycleNumber})</span>}
                {md.isCurrent && <span className="text-[9px] bg-[#991b1b] text-white px-1.5 rounded">हाल सक्रिय</span>}
              </span>
              <span className="font-mono text-[11px] text-[#78350f]">
                {md.startDateFormattedBS} ({md.startDateFormattedAD}) ~ {md.endDateFormattedBS} ({md.endDateFormattedAD})
              </span>
              <span className="text-[11px] font-semibold">{md.durationYears} वर्ष</span>
            </div>

            {/* Antardasha Table */}
            <div className="mt-1.5 overflow-x-auto">
              <table className="w-full border-collapse text-[10px] text-center border border-[#78350f]">
                <thead>
                  <tr className="bg-[#fef3c7] font-bold text-[#78350f] border-b border-[#78350f]">
                    <th className="border border-[#78350f] p-1 w-1/5">अन्तरदशा (AD)</th>
                    <th className="border border-[#78350f] p-1 w-1/4">सुरु मिति (BS / AD)</th>
                    <th className="border border-[#78350f] p-1 w-1/4">अन्त्य मिति (BS / AD)</th>
                    <th className="border border-[#78350f] p-1">अवधि (महिना)</th>
                  </tr>
                </thead>
                <tbody>
                  {md.antardashas.map((ad, adIdx) => (
                    <React.Fragment key={adIdx}>
                      <tr className={`border-b border-[#78350f]/60 ${ad.isCurrent ? 'bg-amber-100 font-bold' : adIdx % 2 === 0 ? 'bg-white' : 'bg-amber-50/40'}`}>
                        <td className="border border-[#78350f] p-1 font-bold text-[#991b1b]">
                          {ad.planetNe}
                          {ad.isCurrent && <span className="ml-1 text-[8px] bg-amber-600 text-white px-1 rounded">सक्रिय</span>}
                        </td>
                        <td className="border border-[#78350f] p-1 font-mono text-[9.5px]">
                          {ad.startDateFormattedBS} <span className="text-slate-500">({ad.startDateFormattedAD})</span>
                        </td>
                        <td className="border border-[#78350f] p-1 font-mono text-[9.5px]">
                          {ad.endDateFormattedBS} <span className="text-slate-500">({ad.endDateFormattedAD})</span>
                        </td>
                        <td className="border border-[#78350f] p-1 font-mono">{ad.durationMonths} म.</td>
                      </tr>

                      {/* Pratyantardasha Row in Print if active or detailed */}
                      {ad.isCurrent && (
                        <tr>
                          <td colSpan={4} className="p-1.5 bg-[#fefce8] border border-[#78350f]">
                            <div className="text-[9.5px] font-bold text-[#991b1b] mb-1 text-left">
                              ॥ {md.planetNe} &gt; {ad.planetNe} का प्रत्यन्तर्दशाहरू (Pratyantardashas) ॥
                            </div>
                            <div className="grid grid-cols-3 gap-1 text-[9px] font-mono text-left">
                              {ad.pratyantardashas.map((pad, padIdx) => (
                                <div
                                  key={padIdx}
                                  className={`p-1 rounded border ${pad.isCurrent ? 'bg-amber-200 border-amber-600 font-bold text-[#991b1b]' : 'bg-white border-[#78350f]/40'}`}
                                >
                                  <div className="flex justify-between font-bold">
                                    <span>{pad.planetNe}</span>
                                    <span>{pad.durationDays} दिन</span>
                                  </div>
                                  <div className="text-[8.5px] text-slate-700 mt-0.5">
                                    {pad.startDateFormattedBS} ~ {pad.endDateFormattedBS}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Interactive Screen Accordion View
  return (
    <div className="space-y-3">
      {mahadashas.map((md, mdIdx) => {
        const isMdExpanded = expandedMdIndex === mdIdx;
        const grahaInfo = GRAHA_MAP[md.planet as string];
        const planetColor = grahaInfo?.color || '#d97706';

        return (
          <div
            key={mdIdx}
            className={`border rounded-xl transition-all overflow-hidden ${
              md.isCurrent
                ? 'bg-amber-950/20 border-amber-500/80 shadow-lg ring-1 ring-amber-500/30'
                : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
            }`}
          >
            {/* Mahadasha Row Toggle */}
            <button
              type="button"
              onClick={() => setExpandedMdIndex(isMdExpanded ? null : mdIdx)}
              className="w-full text-left p-3.5 sm:p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center space-x-3 min-w-0">
                <span
                  className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: planetColor }}
                ></span>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-slate-100 flex items-center gap-2 flex-wrap">
                    <span>{md.planetNe} {isNe ? 'महादशा' : 'Mahadasha'}</span>
                    {md.cycleNumber && (
                      <span className="text-[10px] text-purple-300 bg-purple-950/80 border border-purple-800 px-1.5 py-0.2 rounded font-mono">
                        चक्र {md.cycleNumber}
                      </span>
                    )}
                    {md.isCurrent && (
                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-extrabold shadow">
                        <CheckCircle2 className="w-3 h-3" /> {isNe ? 'हाल सक्रिय' : 'ACTIVE'}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5 flex flex-wrap gap-x-2 gap-y-0.5 items-center">
                    <span>
                      BS: <strong className="text-amber-200">{md.startDateFormattedBS}</strong> ~ <strong className="text-amber-200">{md.endDateFormattedBS}</strong>
                    </span>
                    <span className="text-slate-500">|</span>
                    <span>
                      AD: {md.startDateFormattedAD} ~ {md.endDateFormattedAD}
                    </span>
                    <span className="text-slate-500">|</span>
                    <span className="text-amber-400 font-semibold">({md.durationYears} वर्ष)</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-400 shrink-0">
                <span className="text-xs font-mono hidden sm:inline text-amber-300/80">
                  {isMdExpanded ? (isNe ? 'लुकाउनुहोस्' : 'Hide Subperiods') : (isNe ? 'अन्तरदशा हेर्नुहोस्' : 'View Subperiods')}
                </span>
                {isMdExpanded ? (
                  <ChevronDown className="w-5 h-5 text-amber-400" />
                ) : (
                  <ChevronRight className="w-5 h-5" />
                )}
              </div>
            </button>

            {/* Level 1 Expansion: Antardashas */}
            {isMdExpanded && (
              <div className="border-t border-slate-800 bg-slate-950/90 p-3 sm:p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h4 className="text-xs font-bold uppercase text-amber-300 font-serif flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-amber-400" />
                    {md.planetNe} को अन्तर्गत ९ वटा अन्तर्दशाहरू (Antardashas)
                  </h4>
                  <span className="text-[11px] text-slate-400">
                    प्रत्येक अन्तरदशामा थिचेर प्रत्यन्तर्दशा हेर्नुहोस्
                  </span>
                </div>

                <div className="space-y-2">
                  {md.antardashas.map((ad, adIdx) => {
                    const adKey = `${mdIdx}-${adIdx}`;
                    const isAdExpanded = expandedAdKey === adKey;
                    const adGrahaInfo = GRAHA_MAP[ad.planet as string];
                    const adColor = adGrahaInfo?.color || '#3b82f6';

                    return (
                      <div
                        key={adIdx}
                        className={`border rounded-lg transition-all overflow-hidden ${
                          ad.isCurrent
                            ? 'bg-amber-950/40 border-amber-500/80 text-amber-100'
                            : 'bg-slate-900/90 border-slate-800/80 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        {/* Antardasha Row Button */}
                        <button
                          type="button"
                          onClick={() => setExpandedAdKey(isAdExpanded ? null : adKey)}
                          className="w-full text-left p-2.5 sm:p-3 flex items-center justify-between gap-2 cursor-pointer hover:bg-slate-800/40"
                        >
                          <div className="flex items-center space-x-2.5 min-w-0">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: adColor }}
                            ></span>
                            <div>
                              <div className="text-xs font-bold flex items-center gap-2">
                                <span className="text-slate-100">{ad.planetNe}</span>
                                {ad.isCurrent && (
                                  <span className="text-[9px] bg-amber-500 text-slate-950 font-extrabold px-1.5 py-0.2 rounded">
                                    NOW
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] font-mono text-slate-400 mt-0.5 flex flex-wrap gap-x-2 gap-y-0.5">
                                <span>BS: {ad.startDateFormattedBS} ~ {ad.endDateFormattedBS}</span>
                                <span>(AD: {ad.startDateFormattedAD} ~ {ad.endDateFormattedAD})</span>
                                <span className="text-amber-300 font-semibold">{ad.durationMonths} महिना</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 text-[11px] text-amber-400/90 hover:text-amber-200 shrink-0">
                            <span className="font-mono text-[10px] hidden sm:inline">
                              {isAdExpanded ? 'प्रत्यन्तर्दशा लुकाउनुहोस्' : 'प्रत्यन्तर्दशा (PRATYANTARDASHA)'}
                            </span>
                            {isAdExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </div>
                        </button>

                        {/* Level 2 Expansion: Pratyantardashas */}
                        {isAdExpanded && (
                          <div className="border-t border-slate-800/90 bg-slate-950 p-3">
                            <div className="text-[11px] font-bold text-amber-400 mb-2 border-b border-slate-800 pb-1 flex items-center justify-between">
                              <span>॥ {md.planetNe} &gt; {ad.planetNe} का ९ प्रत्यन्तर्दशाहरू (Pratyantardashas) ॥</span>
                              <span className="text-[10px] text-slate-400 font-normal">अवधि दिनमा</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                              {ad.pratyantardashas.map((pad, padIdx) => {
                                const padGrahaInfo = GRAHA_MAP[pad.planet as string];
                                const padColor = padGrahaInfo?.color || '#94a3b8';

                                return (
                                  <div
                                    key={padIdx}
                                    className={`p-2 rounded-lg border text-xs flex flex-col justify-between ${
                                      pad.isCurrent
                                        ? 'bg-amber-900/50 border-amber-500 text-amber-100 shadow-md ring-1 ring-amber-400/50'
                                        : 'bg-slate-900/90 border-slate-800 text-slate-300'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between font-bold">
                                      <span className="flex items-center gap-1.5">
                                        <span
                                          className="w-2 h-2 rounded-full"
                                          style={{ backgroundColor: padColor }}
                                        ></span>
                                        {pad.planetNe}
                                      </span>
                                      <span className="text-[10px] font-mono text-amber-300">
                                        {pad.durationDays} दिन
                                      </span>
                                    </div>
                                    <div className="text-[10px] font-mono text-slate-400 mt-1 space-y-0.5">
                                      <div>BS: {pad.startDateFormattedBS} ~ {pad.endDateFormattedBS}</div>
                                      <div className="text-slate-500 text-[9.5px]">AD: {pad.startDateFormattedAD} ~ {pad.endDateFormattedAD}</div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
