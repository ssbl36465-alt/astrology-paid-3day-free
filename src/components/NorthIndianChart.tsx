import React from 'react';
import { KundaliCalculationOutput, Language, GrahaName } from '../types/astrology';
import { GRAHA_MAP, RASHI_LIST } from '../utils/i18n';

interface NorthIndianChartProps {
  data: KundaliCalculationOutput;
  language: Language;
  title?: string;
  theme?: 'dark' | 'light';
}

export const NorthIndianChart: React.FC<NorthIndianChartProps> = ({ data, language, title, theme = 'dark' }) => {
  const { ascendant, grahas, houses } = data;
  const isNe = language === 'ne';
  const isDark = theme === 'dark';

  // Map planets to their houses (1 to 12)
  const housePlanets: Record<number, { name: GrahaName; degStr: string; isRetro: boolean }[]> = {};
  for (let h = 1; h <= 12; h++) {
    housePlanets[h] = [];
  }

  grahas.forEach((g) => {
    housePlanets[g.house].push({
      name: g.name,
      degStr: Math.floor(g.signDegree) + '°',
      isRetro: g.isRetrograde,
    });
  });

  // House coordinates and path segments for SVG 400x400 diamond chart
  // Outer box: 0,0 to 400,400
  // Inner diamond vertices: (200,0), (400,200), (200,400), (0,200)
  // Diagonals: (0,0)-(400,400), (400,0)-(0,400)

  // Label coordinates for House Numbers and Planet List inside each house polygon
  const houseConfig: Record<
    number,
    { signPos: { x: number; y: number }; planetsPos: { x: number; y: number } }
  > = {
    1: { signPos: { x: 200, y: 130 }, planetsPos: { x: 200, y: 80 } }, // Top-center diamond
    2: { signPos: { x: 100, y: 60 }, planetsPos: { x: 90, y: 35 } }, // Top-left triangle
    3: { signPos: { x: 60, y: 100 }, planetsPos: { x: 35, y: 90 } }, // Top-far-left triangle
    4: { signPos: { x: 130, y: 200 }, planetsPos: { x: 80, y: 200 } }, // Middle-left diamond
    5: { signPos: { x: 60, y: 300 }, planetsPos: { x: 35, y: 310 } }, // Bottom-far-left triangle
    6: { signPos: { x: 100, y: 340 }, planetsPos: { x: 90, y: 365 } }, // Bottom-left triangle
    7: { signPos: { x: 200, y: 270 }, planetsPos: { x: 200, y: 320 } }, // Bottom-center diamond
    8: { signPos: { x: 300, y: 340 }, planetsPos: { x: 310, y: 365 } }, // Bottom-right triangle
    9: { signPos: { x: 340, y: 300 }, planetsPos: { x: 365, y: 310 } }, // Bottom-far-right triangle
    10: { signPos: { x: 270, y: 200 }, planetsPos: { x: 320, y: 200 } }, // Middle-right diamond
    11: { signPos: { x: 340, y: 100 }, planetsPos: { x: 365, y: 90 } }, // Top-far-right triangle
    12: { signPos: { x: 300, y: 60 }, planetsPos: { x: 310, y: 35 } }, // Top-right triangle
  };

  return (
    <div className={`border rounded-2xl p-4 shadow-2xl flex flex-col items-center transition-colors ${isDark ? 'bg-slate-900 border-amber-900/50 text-slate-100' : 'bg-white border-amber-300 text-slate-900 shadow-xl'}`}>
      {title && (
        <h3 className={`text-sm font-serif font-bold mb-3 uppercase tracking-wider ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>
          {title}
        </h3>
      )}

      <div className="relative w-full max-w-[380px] aspect-square">
        <svg viewBox="0 0 400 400" className="w-full h-full select-none">
          {/* Background */}
          <rect width="400" height="400" fill={isDark ? '#0f172a' : '#ffffff'} stroke={isDark ? '#78350f' : '#d97706'} strokeWidth="3" />

          {/* Grid Lines */}
          {/* Main Diagonals */}
          <line x1="0" y1="0" x2="400" y2="400" stroke={isDark ? '#b45309' : '#d97706'} strokeWidth="1.5" />
          <line x1="400" y1="0" x2="0" y2="400" stroke={isDark ? '#b45309' : '#d97706'} strokeWidth="1.5" />

          {/* Inner Diamond */}
          <polygon
            points="200,0 400,200 200,400 0,200"
            fill={isDark ? 'none' : '#fffbeb'}
            stroke={isDark ? '#d97706' : '#b45309'}
            strokeWidth="2"
          />

          {/* Render Houses 1 to 12 */}
          {Array.from({ length: 12 }, (_, i) => {
            const hNum = i + 1;
            const houseData = houses.find((h) => h.houseNumber === hNum)!;
            const rashiNum = houseData.signIndex + 1; // 1 to 12
            const cfg = houseConfig[hNum];
            const pList = housePlanets[hNum];

            return (
              <g key={hNum}>
                {/* Sign Number */}
                <text
                  x={cfg.signPos.x}
                  y={cfg.signPos.y}
                  fill={isDark ? '#fbbf24' : '#92400e'}
                  fontSize="13"
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="central"
                >
                  {rashiNum}
                </text>

                {/* Lagna Badge in House 1 */}
                {hNum === 1 && (
                  <text
                    x={cfg.signPos.x}
                    y={cfg.signPos.y - 20}
                    fill={isDark ? '#f59e0b' : '#b45309'}
                    fontSize="11"
                    fontWeight="extrabold"
                    textAnchor="middle"
                  >
                    {isNe ? 'लग्न (Lagn)' : 'Lagna'}
                  </text>
                )}

                {/* Planet Badges */}
                <g>
                  {pList.map((p, pIdx) => {
                    const grahaInfo = GRAHA_MAP[p.name];
                    const label = isNe ? grahaInfo.ne : p.name.substring(0, 2);
                    const retroTag = p.isRetro ? '(R)' : '';

                    // Stagger multi-planets vertically/horizontally
                    const rowOffset = (pIdx - (pList.length - 1) / 2) * 14;

                    return (
                      <text
                        key={pIdx}
                        x={cfg.planetsPos.x}
                        y={cfg.planetsPos.y + rowOffset}
                        fill={grahaInfo.color}
                        fontSize="10"
                        fontWeight="bold"
                        textAnchor="middle"
                        dominantBaseline="central"
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
        {isNe ? 'उत्तरी भारतीय चक्र (स्थानिक भाव आधारित)' : 'North Indian Chart (House Fixed Diamond)'}
      </p>
    </div>
  );
};
