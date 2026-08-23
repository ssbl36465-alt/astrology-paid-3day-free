import React from 'react';
import { KundaliCalculationOutput, Language, GrahaName } from '../types/astrology';
import { GRAHA_MAP, RASHI_LIST } from '../utils/i18n';

interface SouthIndianChartProps {
  data: KundaliCalculationOutput;
  language: Language;
  title?: string;
  theme?: 'dark' | 'light';
}

// Fixed Sign grid positions in 4x4 layout:
// Row 0: Pisces (11), Aries (0), Taurus (1), Gemini (2)
// Row 1: Aquarius (10), Center, Center, Cancer (3)
// Row 2: Capricorn (9), Center, Center, Leo (4)
// Row 3: Sagittarius (8), Scorpio (7), Libra (6), Virgo (5)

const SOUTH_GRID: { signIndex: number; r: number; c: number }[] = [
  { signIndex: 11, r: 0, c: 0 }, // Pisces
  { signIndex: 0, r: 0, c: 1 },  // Aries
  { signIndex: 1, r: 0, c: 2 },  // Taurus
  { signIndex: 2, r: 0, c: 3 },  // Gemini
  { signIndex: 3, r: 1, c: 3 },  // Cancer
  { signIndex: 4, r: 2, c: 3 },  // Leo
  { signIndex: 5, r: 3, c: 3 },  // Virgo
  { signIndex: 6, r: 3, c: 2 },  // Libra
  { signIndex: 7, r: 3, c: 1 },  // Scorpio
  { signIndex: 8, r: 3, c: 0 },  // Sagittarius
  { signIndex: 9, r: 2, c: 0 },  // Capricorn
  { signIndex: 10, r: 1, c: 0 }, // Aquarius
];

export const SouthIndianChart: React.FC<SouthIndianChartProps> = ({ data, language, title, theme = 'dark' }) => {
  const { ascendant, grahas } = data;
  const isNe = language === 'ne';
  const isDark = theme === 'dark';

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

  return (
    <div className={`border rounded-2xl p-4 shadow-2xl flex flex-col items-center transition-colors ${isDark ? 'bg-slate-900 border-amber-900/50 text-slate-100' : 'bg-white border-amber-300 text-slate-900 shadow-xl'}`}>
      {title && (
        <h3 className={`text-sm font-serif font-bold mb-3 uppercase tracking-wider ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>
          {title}
        </h3>
      )}

      <div className="relative w-full max-w-[380px] aspect-square">
        <svg viewBox="0 0 400 400" className="w-full h-full select-none">
          {/* Main Outer Box */}
          <rect width="400" height="400" fill={isDark ? '#0f172a' : '#ffffff'} stroke={isDark ? '#78350f' : '#d97706'} strokeWidth="3" />

          {/* 4x4 Grid Lines */}
          <line x1="100" y1="0" x2="100" y2="400" stroke={isDark ? '#b45309' : '#d97706'} strokeWidth="1.5" />
          <line x1="200" y1="0" x2="200" y2="400" stroke={isDark ? '#b45309' : '#d97706'} strokeWidth="1.5" />
          <line x1="300" y1="0" x2="300" y2="400" stroke={isDark ? '#b45309' : '#d97706'} strokeWidth="1.5" />

          <line x1="0" y1="100" x2="400" y2="100" stroke={isDark ? '#b45309' : '#d97706'} strokeWidth="1.5" />
          <line x1="0" y1="200" x2="400" y2="200" stroke={isDark ? '#b45309' : '#d97706'} strokeWidth="1.5" />
          <line x1="0" y1="300" x2="400" y2="300" stroke={isDark ? '#b45309' : '#d97706'} strokeWidth="1.5" />

          {/* Center Fill (2x2 Box: 100,100 to 300,300) */}
          <rect x="100" y="100" width="200" height="200" fill={isDark ? '#1e293b' : '#fef3c7'} stroke={isDark ? '#d97706' : '#b45309'} strokeWidth="2" />

          {/* Center Text */}
          <text x="200" y="180" fill={isDark ? '#f59e0b' : '#92400e'} fontSize="13" fontWeight="bold" textAnchor="middle">
            {isNe ? 'दक्षिण भारतीय चक्र' : 'South Indian Chart'}
          </text>
          <text x="200" y="210" fill={isDark ? '#94a3b8' : '#78350f'} fontSize="11" textAnchor="middle">
            Lagna: {isNe ? RASHI_LIST[ascendant.signIndex].nameNe : ascendant.signNameEn}
          </text>
          <text x="200" y="230" fill={isDark ? '#cbd5e1' : '#92400e'} fontSize="10" fontStyle="italic" textAnchor="middle">
            Fixed Sign Format
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
                {/* Sign Name Label in top-left of box */}
                <text
                  x={x0 + 6}
                  y={y0 + 14}
                  fill="#94a3b8"
                  fontSize="9"
                  fontWeight="bold"
                >
                  {isNe ? rashi.nameNe : rashi.nameEn.substring(0, 3)}
                </text>

                {/* Lagna indicator line or badge */}
                {isLagnaSign && (
                  <g>
                    <line x1={x0} y1={y0} x2={x0 + 25} y2={y0 + 25} stroke="#f59e0b" strokeWidth="2" />
                    <text x={x0 + 8} y={y0 + 26} fill="#f59e0b" fontSize="10" fontWeight="extrabold">
                      {isNe ? 'लग्न' : 'Lag'}
                    </text>
                  </g>
                )}

                {/* Planets List inside Sign Box */}
                <g>
                  {pList.map((p, pIdx) => {
                    const grahaInfo = GRAHA_MAP[p.name];
                    const label = isNe ? grahaInfo.ne : p.name.substring(0, 2);
                    const retroTag = p.isRetro ? '(R)' : '';

                    const px = x0 + 50;
                    const py = y0 + 38 + pIdx * 14;

                    return (
                      <text
                        key={pIdx}
                        x={px}
                        y={py}
                        fill={grahaInfo.color}
                        fontSize="10"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {label} {p.degStr}{retroTag}
                      </text>
                    );
                  })}
                </g>
              </g>
            );
          })}
        </svg>
      </div>

      <p className="text-[11px] text-amber-400/70 mt-2 font-mono text-center">
        {isNe ? 'दक्षिणी भारतीय चक्र (निश्चित राशि आधारित)' : 'South Indian Chart (Fixed Sign Grid)'}
      </p>
    </div>
  );
};
