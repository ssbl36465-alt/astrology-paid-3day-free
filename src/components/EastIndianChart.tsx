import React, { useState } from 'react';
import { KundaliCalculationOutput, Language, GrahaName } from '../types/astrology';
import { GRAHA_MAP, RASHI_LIST } from '../utils/i18n';
import { Maximize2, Minimize2, Sun, Moon } from 'lucide-react';

interface EastIndianChartProps {
  data: KundaliCalculationOutput;
  language: Language;
  title?: string;
  theme?: 'dark' | 'light';
  allowToggleTheme?: boolean;
}

const EAST_GRID: { signIndex: number; x0: number; y0: number; w: number; h: number }[] = [
  { signIndex: 11, x0: 0,   y0: 0,   w: 100, h: 100 }, // Pisces (Meena - Top-Left)
  { signIndex: 0,  x0: 100, y0: 0,   w: 100, h: 100 }, // Aries (Mesha - Top-Mid-Left)
  { signIndex: 1,  x0: 200, y0: 0,   w: 100, h: 100 }, // Taurus (Vrishabha - Top-Mid-Right)
  { signIndex: 2,  x0: 300, y0: 0,   w: 100, h: 100 }, // Gemini (Mithuna - Top-Right)
  { signIndex: 3,  x0: 300, y0: 100, w: 100, h: 100 }, // Cancer (Karka - Right-Mid-Top)
  { signIndex: 4,  x0: 300, y0: 200, w: 100, h: 100 }, // Leo (Simha - Right-Mid-Bottom)
  { signIndex: 5,  x0: 300, y0: 300, w: 100, h: 100 }, // Virgo (Kanya - Bottom-Right)
  { signIndex: 6,  x0: 200, y0: 300, w: 100, h: 100 }, // Libra (Tula - Bottom-Mid-Right)
  { signIndex: 7,  x0: 100, y0: 300, w: 100, h: 100 }, // Scorpio (Vrishchika - Bottom-Mid-Left)
  { signIndex: 8,  x0: 0,   y0: 300, w: 100, h: 100 }, // Sagittarius (Dhanu - Bottom-Left)
  { signIndex: 9,  x0: 0,   y0: 200, w: 100, h: 100 }, // Capricorn (Makara - Left-Mid-Bottom)
  { signIndex: 10, x0: 0,   y0: 100, w: 100, h: 100 }, // Aquarius (Kumbha - Left-Mid-Top)
];

export const EastIndianChart: React.FC<EastIndianChartProps> = ({
  data,
  language,
  title,
  theme = 'light',
  allowToggleTheme = true,
}) => {
  const { ascendant, grahas } = data;
  const isNe = language === 'ne';
  const [currentTheme, setCurrentTheme] = useState<'dark' | 'light'>(theme);
  const [isLarge, setIsLarge] = useState(true);

  React.useEffect(() => {
    setCurrentTheme(theme);
  }, [theme]);

  const isDark = currentTheme === 'dark';

  // Group planets by sign index (0 to 11)
  const signPlanets: Record<number, { name: GrahaName; degStr: string; isRetro: boolean }[]> = {};
  for (let s = 0; s < 12; s++) {
    signPlanets[s] = [];
  }

  grahas.forEach((g) => {
    signPlanets[g.signIndex].push({
      name: g.name,
      degStr: Math.floor(g.signDegree) + '°',
      isRetro: g.isRetrograde,
    });
  });

  const getGrahaColor = (name: GrahaName, dark: boolean) => {
    if (dark) return GRAHA_MAP[name]?.color || '#f59e0b';
    switch (name) {
      case 'Sun': return '#b91c1c';
      case 'Moon': return '#1d4ed8';
      case 'Mars': return '#dc2626';
      case 'Mercury': return '#047857';
      case 'Jupiter': return '#b45309';
      case 'Venus': return '#be185d';
      case 'Saturn': return '#1e293b';
      case 'Rahu': return '#334155';
      case 'Ketu': return '#7c2d12';
      default: return '#1e293b';
    }
  };

  // Anti-Collision Planet Placer for East Indian Compartments
  const renderCompartmentPlanets = (
    pList: { name: GrahaName; degStr: string; isRetro: boolean }[],
    x0: number,
    y0: number
  ) => {
    if (pList.length === 0) return null;

    if (pList.length === 1) {
      const p = pList[0];
      const label = isNe ? GRAHA_MAP[p.name].ne : p.name.substring(0, 2);
      const retroTag = p.isRetro ? (isNe ? '(व)' : '(R)') : '';
      const color = getGrahaColor(p.name, isDark);

      return (
        <text
          x={x0 + 50}
          y={y0 + 58}
          fill={color}
          fontSize="15"
          fontWeight="900"
          textAnchor="middle"
          dominantBaseline="central"
        >
          {label} {p.degStr}{retroTag}
        </text>
      );
    }

    if (pList.length === 2) {
      return (
        <>
          {pList.map((p, idx) => {
            const label = isNe ? GRAHA_MAP[p.name].ne : p.name.substring(0, 2);
            const retroTag = p.isRetro ? (isNe ? '(व)' : '(R)') : '';
            const color = getGrahaColor(p.name, isDark);
            const yPos = y0 + 46 + idx * 22;

            return (
              <text
                key={idx}
                x={x0 + 50}
                y={yPos}
                fill={color}
                fontSize="14"
                fontWeight="800"
                textAnchor="middle"
                dominantBaseline="central"
              >
                {label} {p.degStr}{retroTag}
              </text>
            );
          })}
        </>
      );
    }

    if (pList.length === 3) {
      return (
        <>
          {pList.map((p, idx) => {
            const label = isNe ? GRAHA_MAP[p.name].ne : p.name.substring(0, 2);
            const retroTag = p.isRetro ? (isNe ? '(व)' : '(R)') : '';
            const color = getGrahaColor(p.name, isDark);
            const yPos = y0 + 38 + idx * 18;

            return (
              <text
                key={idx}
                x={x0 + 50}
                y={yPos}
                fill={color}
                fontSize="13"
                fontWeight="800"
                textAnchor="middle"
                dominantBaseline="central"
              >
                {label} {p.degStr}{retroTag}
              </text>
            );
          })}
        </>
      );
    }

    // 4+ planets: 2 neat columns
    return (
      <>
        {pList.map((p, idx) => {
          const label = isNe ? GRAHA_MAP[p.name].ne : p.name.substring(0, 2);
          const retroTag = p.isRetro ? (isNe ? '(व)' : '(R)') : '';
          const color = getGrahaColor(p.name, isDark);

          const col = idx % 2;
          const row = Math.floor(idx / 2);
          const xPos = x0 + (col === 0 ? 26 : 74);
          const yPos = y0 + 44 + row * 18;

          return (
            <text
              key={idx}
              x={xPos}
              y={yPos}
              fill={color}
              fontSize="12"
              fontWeight="800"
              textAnchor="middle"
              dominantBaseline="central"
            >
              {label} {p.degStr}{retroTag}
            </text>
          );
        })}
      </>
    );
  };

  return (
    <div className={`border-2 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col items-center transition-all ${
      isDark
        ? 'bg-slate-900 border-amber-900/60 text-slate-100 shadow-amber-950/20'
        : 'bg-gradient-to-b from-[#fffefc] via-[#fffdf7] to-[#fff9ee] border-amber-500/70 text-slate-900 shadow-amber-900/10'
    }`}>
      {/* Top Header & Controls */}
      <div className="w-full flex items-center justify-between gap-2 pb-3 mb-3 border-b border-amber-500/30">
        <div>
          {title && (
            <h3 className={`text-base sm:text-lg font-serif font-black tracking-wide ${
              isDark ? 'text-amber-300' : 'text-amber-950'
            }`}>
              {title}
            </h3>
          )}
          <span className={`text-[11px] font-semibold ${isDark ? 'text-amber-400/80' : 'text-amber-800'}`}>
            {isNe ? 'पूर्वीय भारतीय चक्र (East Indian)' : 'East Indian Solar Chart'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {allowToggleTheme && (
            <button
              type="button"
              onClick={() => setCurrentTheme(isDark ? 'light' : 'dark')}
              className={`p-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                isDark
                  ? 'bg-slate-800 text-amber-300 border-amber-600/40 hover:bg-slate-700'
                  : 'bg-amber-100/80 text-amber-950 border-amber-300 hover:bg-amber-200'
              }`}
              title={isDark ? 'Lite मोडमा बदल्नुहोस्' : 'Dark मोडमा बदल्नुहोस्'}
            >
              {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-amber-800" />}
              <span className="hidden sm:inline text-[11px]">{isDark ? 'Lite' : 'Dark'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsLarge(!isLarge)}
            className={`p-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
              isDark
                ? 'bg-slate-800 text-amber-300 border-amber-600/40 hover:bg-slate-700'
                : 'bg-amber-100/80 text-amber-950 border-amber-300 hover:bg-amber-200'
            }`}
            title={isLarge ? 'सामान्य साइज' : 'ठूलो साइज'}
          >
            {isLarge ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline text-[11px]">{isLarge ? (isNe ? 'मध्यम' : 'Normal') : (isNe ? 'ठूलो' : 'Large')}</span>
          </button>
        </div>
      </div>

      <div className={`relative w-full aspect-square mx-auto transition-all duration-300 ${
        isLarge ? 'max-w-[540px] sm:max-w-[580px]' : 'max-w-[420px]'
      }`}>
        <svg viewBox="0 0 400 400" className="w-full h-full select-none drop-shadow-md">
          {/* Main Outer Box */}
          <rect
            width="400"
            height="400"
            fill={isDark ? '#0f172a' : '#fffdf9'}
            stroke={isDark ? '#92400e' : '#b45309'}
            strokeWidth="3.5"
            rx="6"
          />

          {/* Main Corner Diagonals */}
          <line x1="0" y1="0" x2="400" y2="400" stroke={isDark ? '#b45309' : '#c2410c'} strokeWidth="1.8" />
          <line x1="400" y1="0" x2="0" y2="400" stroke={isDark ? '#b45309' : '#c2410c'} strokeWidth="1.8" />

          {/* Grid Lines */}
          <line x1="100" y1="0" x2="100" y2="400" stroke={isDark ? '#b45309' : '#d97706'} strokeWidth="1.8" />
          <line x1="300" y1="0" x2="300" y2="400" stroke={isDark ? '#b45309' : '#d97706'} strokeWidth="1.8" />
          <line x1="0" y1="100" x2="400" y2="100" stroke={isDark ? '#b45309' : '#d97706'} strokeWidth="1.8" />
          <line x1="0" y1="300" x2="400" y2="300" stroke={isDark ? '#b45309' : '#d97706'} strokeWidth="1.8" />

          {/* Side Perpendicular Mid-Lines */}
          <line x1="200" y1="0" x2="200" y2="100" stroke={isDark ? '#b45309' : '#d97706'} strokeWidth="1.8" />
          <line x1="200" y1="300" x2="200" y2="400" stroke={isDark ? '#b45309' : '#d97706'} strokeWidth="1.8" />
          <line x1="0" y1="200" x2="100" y2="200" stroke={isDark ? '#b45309' : '#d97706'} strokeWidth="1.8" />
          <line x1="300" y1="200" x2="400" y2="200" stroke={isDark ? '#b45309' : '#d97706'} strokeWidth="1.8" />

          {/* Center Box (2x2 Box: 100,100 to 300,300) */}
          <rect
            x="100"
            y="100"
            width="200"
            height="200"
            fill={isDark ? '#1e293b' : '#fffbeb'}
            stroke={isDark ? '#d97706' : '#b45309'}
            strokeWidth="2.5"
          />

          {/* Center Text */}
          <text x="200" y="180" fill={isDark ? '#f59e0b' : '#92400e'} fontSize="16" fontWeight="900" textAnchor="middle">
            {isNe ? 'पूर्वीय चक्र' : 'East Indian Chart'}
          </text>
          <text x="200" y="210" fill={isDark ? '#cbd5e1' : '#b91c1c'} fontSize="13.5" fontWeight="800" textAnchor="middle">
            {isNe ? 'लग्न' : 'Lagna'}: {isNe ? RASHI_LIST[ascendant.signIndex].nameNe : ascendant.signNameEn} ({Math.floor(ascendant.degree)}°)
          </text>

          {/* Render 12 Sign Compartments */}
          {EAST_GRID.map((cell) => {
            const rashi = RASHI_LIST[cell.signIndex];
            const isLagnaSign = cell.signIndex === ascendant.signIndex;
            const pList = signPlanets[cell.signIndex];

            return (
              <g key={cell.signIndex}>
                {/* Protected Rashi Badge in top-left */}
                <rect
                  x={cell.x0 + 4}
                  y={cell.y0 + 4}
                  width="42"
                  height="17"
                  rx="4"
                  fill={isDark ? '#334155' : '#fef3c7'}
                  stroke={isDark ? '#475569' : '#fde68a'}
                  strokeWidth="1"
                />
                <text
                  x={cell.x0 + 25}
                  y={cell.y0 + 13}
                  fill={isDark ? '#fde047' : '#9a3412'}
                  fontSize="12"
                  fontWeight="900"
                  textAnchor="middle"
                  dominantBaseline="central"
                >
                  {isNe ? rashi.nameNe : rashi.nameEn.substring(0, 3)}
                </text>

                {/* Lagna Badge in opposite corner */}
                {isLagnaSign && (
                  <g>
                    <rect
                      x={cell.x0 + cell.w - 44}
                      y={cell.y0 + 4}
                      width="40"
                      height="17"
                      rx="4"
                      fill={isDark ? '#450a0a' : '#fee2e2'}
                      stroke={isDark ? '#dc2626' : '#b91c1c'}
                      strokeWidth="1"
                    />
                    <text
                      x={cell.x0 + cell.w - 24}
                      y={cell.y0 + 13}
                      fill={isDark ? '#fca5a5' : '#b91c1c'}
                      fontSize="11"
                      fontWeight="900"
                      textAnchor="middle"
                      dominantBaseline="central"
                    >
                      ✦ {isNe ? 'लग्न' : 'Asc'}
                    </text>
                  </g>
                )}

                {/* Non-overlapping Planets inside this compartment */}
                {renderCompartmentPlanets(pList, cell.x0, cell.y0)}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="w-full mt-3 pt-2.5 border-t border-amber-500/20 flex flex-wrap items-center justify-between text-[11px] font-medium gap-2">
        <span className={isDark ? 'text-amber-400/90 font-mono' : 'text-amber-900 font-mono font-bold'}>
          {isNe ? 'स्थिर राशि पद्धति (सूर्य कुण्डली)' : 'Fixed Sign Solar Format'}
        </span>
        <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>
          Lagna: <strong className={isDark ? 'text-amber-300' : 'text-amber-900'}>{isNe ? RASHI_LIST[ascendant.signIndex].nameNe : ascendant.signNameEn}</strong>
        </span>
      </div>
    </div>
  );
};
