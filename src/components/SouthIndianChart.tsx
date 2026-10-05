import React, { useState } from 'react';
import { KundaliCalculationOutput, Language, GrahaName } from '../types/astrology';
import { GRAHA_MAP, RASHI_LIST } from '../utils/i18n';
import { Maximize2, Minimize2, Sun, Moon } from 'lucide-react';

interface SouthIndianChartProps {
  data: KundaliCalculationOutput;
  language: Language;
  title?: string;
  theme?: 'dark' | 'light';
  allowToggleTheme?: boolean;
}

const SOUTH_GRID: { signIndex: number; r: number; c: number }[] = [
  { signIndex: 11, r: 0, c: 0 }, // Pisces
  { signIndex: 0,  r: 0, c: 1 }, // Aries
  { signIndex: 1,  r: 0, c: 2 }, // Taurus
  { signIndex: 2,  r: 0, c: 3 }, // Gemini
  { signIndex: 3,  r: 1, c: 3 }, // Cancer
  { signIndex: 4,  r: 2, c: 3 }, // Leo
  { signIndex: 5,  r: 3, c: 3 }, // Virgo
  { signIndex: 6,  r: 3, c: 2 }, // Libra
  { signIndex: 7,  r: 3, c: 1 }, // Scorpio
  { signIndex: 8,  r: 3, c: 0 }, // Sagittarius
  { signIndex: 9,  r: 2, c: 0 }, // Capricorn
  { signIndex: 10, r: 1, c: 0 }, // Aquarius
];

export const SouthIndianChart: React.FC<SouthIndianChartProps> = ({
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

  // Smart Anti-Collision Planet Placer for 100x100 Grid Cell
  const renderCellPlanets = (
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
            {isNe ? 'दक्षिण भारतीय स्थिर राशि चक्र (South Indian)' : 'South Indian Fixed Sign Chart'}
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

          {/* 4x4 Grid Lines */}
          <line x1="100" y1="0" x2="100" y2="400" stroke={isDark ? '#b45309' : '#d97706'} strokeWidth="1.8" />
          <line x1="200" y1="0" x2="200" y2="400" stroke={isDark ? '#b45309' : '#d97706'} strokeWidth="1.8" />
          <line x1="300" y1="0" x2="300" y2="400" stroke={isDark ? '#b45309' : '#d97706'} strokeWidth="1.8" />

          <line x1="0" y1="100" x2="400" y2="100" stroke={isDark ? '#b45309' : '#d97706'} strokeWidth="1.8" />
          <line x1="0" y1="200" x2="400" y2="200" stroke={isDark ? '#b45309' : '#d97706'} strokeWidth="1.8" />
          <line x1="0" y1="300" x2="400" y2="300" stroke={isDark ? '#b45309' : '#d97706'} strokeWidth="1.8" />

          {/* Center Fill (2x2 Box: 100,100 to 300,300) */}
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
            {isNe ? 'दक्षिण भारतीय चक्र' : 'South Indian Chart'}
          </text>
          <text x="200" y="210" fill={isDark ? '#cbd5e1' : '#b91c1c'} fontSize="13.5" fontWeight="800" textAnchor="middle">
            {isNe ? 'लग्न' : 'Lagna'}: {isNe ? RASHI_LIST[ascendant.signIndex].nameNe : ascendant.signNameEn} ({Math.floor(ascendant.degree)}°)
          </text>

          {/* Render 12 Perimeter Sign Blocks */}
          {SOUTH_GRID.map((cell) => {
            const rashi = RASHI_LIST[cell.signIndex];
            const isLagnaSign = cell.signIndex === ascendant.signIndex;
            const pList = signPlanets[cell.signIndex];

            const x0 = cell.c * 100;
            const y0 = cell.r * 100;

            return (
              <g key={cell.signIndex}>
                {/* Protected Rashi Sign Name Label in top-left */}
                <rect
                  x={x0 + 4}
                  y={y0 + 4}
                  width="42"
                  height="17"
                  rx="4"
                  fill={isDark ? '#334155' : '#fef3c7'}
                  stroke={isDark ? '#475569' : '#fde68a'}
                  strokeWidth="1"
                />
                <text
                  x={x0 + 25}
                  y={y0 + 13}
                  fill={isDark ? '#fde047' : '#9a3412'}
                  fontSize="12"
                  fontWeight="900"
                  textAnchor="middle"
                  dominantBaseline="central"
                >
                  {isNe ? rashi.nameNe : rashi.nameEn.substring(0, 3)}
                </text>

                {/* Lagna Badge in top-right corner if applicable */}
                {isLagnaSign && (
                  <g>
                    <rect
                      x={x0 + 56}
                      y={y0 + 4}
                      width="40"
                      height="17"
                      rx="4"
                      fill={isDark ? '#450a0a' : '#fee2e2'}
                      stroke={isDark ? '#dc2626' : '#b91c1c'}
                      strokeWidth="1"
                    />
                    <text
                      x={x0 + 76}
                      y={y0 + 13}
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

                {/* Non-overlapping Planets inside this sign box */}
                {renderCellPlanets(pList, x0, y0)}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="w-full mt-3 pt-2.5 border-t border-amber-500/20 flex flex-wrap items-center justify-between text-[11px] font-medium gap-2">
        <span className={isDark ? 'text-amber-400/90 font-mono' : 'text-amber-900 font-mono font-bold'}>
          {isNe ? 'राशि स्थिर (Fixed Signs clockwise from Aries)' : 'Clockwise from Aries'}
        </span>
        <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>
          Lagna: <strong className={isDark ? 'text-amber-300' : 'text-amber-900'}>{isNe ? RASHI_LIST[ascendant.signIndex].nameNe : ascendant.signNameEn}</strong>
        </span>
      </div>
    </div>
  );
};
