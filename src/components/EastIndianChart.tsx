import React from 'react';
import { KundaliCalculationOutput, Language, GrahaName } from '../types/astrology';
import { GRAHA_MAP, RASHI_LIST } from '../utils/i18n';

interface EastIndianChartProps {
  data: KundaliCalculationOutput;
  language: Language;
  title?: string;
  theme?: 'dark' | 'light';
}

// Fixed Sign positions in East Indian (Surya / Eastern) Kundali layout:
// Outer 12 compartments arranged around central 2x2 box:
// Top row: Pisces (11) [Corner], Aries (0), Taurus (1), Gemini (2) [Corner]
// Right col: Cancer (3), Leo (4), Virgo (5) [Corner]
// Bottom row: Libra (6), Scorpio (7), Sagittarius (8) [Corner]
// Left col: Capricorn (9), Aquarius (10)

const EAST_GRID: { signIndex: number; x0: number; y0: number; w: number; h: number }[] = [
  { signIndex: 11, x0: 0, y0: 0, w: 100, h: 100 },     // Pisces (Meena - Top-Left)
  { signIndex: 0,  x0: 100, y0: 0, w: 100, h: 100 },   // Aries (Mesha - Top-Mid-Left)
  { signIndex: 1,  x0: 200, y0: 0, w: 100, h: 100 },   // Taurus (Vrishabha - Top-Mid-Right)
  { signIndex: 2,  x0: 300, y0: 0, w: 100, h: 100 },   // Gemini (Mithuna - Top-Right)
  { signIndex: 3,  x0: 300, y0: 100, w: 100, h: 100 }, // Cancer (Karka - Right-Mid-Top)
  { signIndex: 4,  x0: 300, y0: 200, w: 100, h: 100 }, // Leo (Simha - Right-Mid-Bottom)
  { signIndex: 5,  x0: 300, y0: 300, w: 100, h: 100 }, // Virgo (Kanya - Bottom-Right)
  { signIndex: 6,  x0: 200, y0: 300, w: 100, h: 100 }, // Libra (Tula - Bottom-Mid-Right)
  { signIndex: 7,  x0: 100, y0: 300, w: 100, h: 100 }, // Scorpio (Vrishchika - Bottom-Mid-Left)
  { signIndex: 8,  x0: 0, y0: 300, w: 100, h: 100 },   // Sagittarius (Dhanu - Bottom-Left)
  { signIndex: 9,  x0: 0, y0: 200, w: 100, h: 100 },   // Capricorn (Makara - Left-Mid-Bottom)
  { signIndex: 10, x0: 0, y0: 100, w: 100, h: 100 },   // Aquarius (Kumbha - Left-Mid-Top)
];

export const EastIndianChart: React.FC<EastIndianChartProps> = ({ data, language, title, theme = 'dark' }) => {
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

          {/* Main Corner Diagonals */}
          <line x1="0" y1="0" x2="400" y2="400" stroke={isDark ? '#b45309' : '#d97706'} strokeWidth="1.5" />
          <line x1="400" y1="0" x2="0" y2="400" stroke={isDark ? '#b45309' : '#d97706'} strokeWidth="1.5" />

          {/* Grid Lines */}
          <line x1="100" y1="0" x2="100" y2="400" stroke={isDark ? '#b45309' : '#d97706'} strokeWidth="1.5" />
          <line x1="300" y1="0" x2="300" y2="400" stroke={isDark ? '#b45309' : '#d97706'} strokeWidth="1.5" />
          <line x1="0" y1="100" x2="400" y2="100" stroke={isDark ? '#b45309' : '#d97706'} strokeWidth="1.5" />
          <line x1="0" y1="300" x2="400" y2="300" stroke={isDark ? '#b45309' : '#d97706'} strokeWidth="1.5" />

          {/* Side Perpendicular Mid-Lines */}
          <line x1="200" y1="0" x2="200" y2="100" stroke={isDark ? '#b45309' : '#d97706'} strokeWidth="1.5" />
          <line x1="200" y1="300" x2="200" y2="400" stroke={isDark ? '#b45309' : '#d97706'} strokeWidth="1.5" />
          <line x1="0" y1="200" x2="100" y2="200" stroke={isDark ? '#b45309' : '#d97706'} strokeWidth="1.5" />
          <line x1="300" y1="200" x2="400" y2="200" stroke={isDark ? '#b45309' : '#d97706'} strokeWidth="1.5" />

          {/* Center Box (2x2 Box: 100,100 to 300,300) */}
          <rect x="100" y="100" width="200" height="200" fill={isDark ? '#1e293b' : '#fef3c7'} stroke={isDark ? '#d97706' : '#b45309'} strokeWidth="2" />

          {/* Center Text */}
          <text x="200" y="180" fill={isDark ? '#f59e0b' : '#92400e'} fontSize="13" fontWeight="bold" textAnchor="middle">
            {isNe ? 'पूर्वीय (पूर्वी) चक्र' : 'East Indian Chart'}
          </text>
          <text x="200" y="210" fill={isDark ? '#94a3b8' : '#78350f'} fontSize="11" textAnchor="middle">
            Lagna: {isNe ? RASHI_LIST[ascendant.signIndex].nameNe : ascendant.signNameEn}
          </text>
          <text x="200" y="230" fill={isDark ? '#cbd5e1' : '#92400e'} fontSize="10" fontStyle="italic" textAnchor="middle">
            Fixed Sign Format
          </text>

          {/* Render 12 Sign Compartments */}
          {EAST_GRID.map((cell) => {
            const rashi = RASHI_LIST[cell.signIndex];
            const isLagnaSign = cell.signIndex === ascendant.signIndex;
            const houseRelNumber = ((cell.signIndex - ascendant.signIndex + 12) % 12) + 1;
            const pList = signPlanets[cell.signIndex];

            const { x0, y0, w, h } = cell;

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

                {/* House Relative Number in top-right of box */}
                <text
                  x={x0 + w - 6}
                  y={y0 + 14}
                  fill="#fbbf24"
                  fontSize="9"
                  fontWeight="bold"
                  textAnchor="end"
                >
                  H{houseRelNumber}
                </text>

                {/* Lagna Indicator Badge */}
                {isLagnaSign && (
                  <g>
                    <rect
                      x={x0 + 4}
                      y={y0 + 20}
                      width="38"
                      height="15"
                      rx="3"
                      fill="#d97706"
                    />
                    <text
                      x={x0 + 23}
                      y={y0 + 31}
                      fill="#020617"
                      fontSize="9"
                      fontWeight="extrabold"
                      textAnchor="middle"
                    >
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
                    const startY = isLagnaSign ? y0 + 48 : y0 + 38;
                    const py = startY + pIdx * 14;

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
        {isNe ? 'पूर्वीय भारतीय चक्र (निश्चित राशि सूर्य चक्र)' : 'East Indian Chart (Fixed Sign Eastern Grid)'}
      </p>
    </div>
  );
};
