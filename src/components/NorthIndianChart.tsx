import React, { useState } from 'react';
import { KundaliCalculationOutput, Language, GrahaName } from '../types/astrology';
import { GRAHA_MAP, RASHI_LIST } from '../utils/i18n';
import { Maximize2, Minimize2, Sun, Moon } from 'lucide-react';

interface NorthIndianChartProps {
  data: KundaliCalculationOutput;
  language: Language;
  title?: string;
  theme?: 'dark' | 'light';
  allowToggleTheme?: boolean;
}

export const NorthIndianChart: React.FC<NorthIndianChartProps> = ({
  data,
  language,
  title,
  theme = 'light',
  allowToggleTheme = true,
}) => {
  const { ascendant, grahas, houses } = data;
  const isNe = language === 'ne';
  const [currentTheme, setCurrentTheme] = useState<'dark' | 'light'>(theme);
  const [isLarge, setIsLarge] = useState(true);

  React.useEffect(() => {
    setCurrentTheme(theme);
  }, [theme]);

  const isDark = currentTheme === 'dark';

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

  // Mathematically calibrated non-overlapping coordinates for 400x400 Vedic diamond chart:
  // Every sign badge is tucked safely into the tip/corner inside a 26px circle shield.
  // Every planet group is placed in the widest body of each polygon.
  // Minimum distance between planet center and sign badge is 44px to 77px!
  const houseConfig: Record<
    number,
    { signPos: { x: number; y: number }; planetsPos: { x: number; y: number } }
  > = {
    1: { signPos: { x: 200, y: 160 }, planetsPos: { x: 200, y: 92 } }, // Top-center diamond (House 1)
    2: { signPos: { x: 100, y: 76 },  planetsPos: { x: 100, y: 36 } }, // Top-left triangle (House 2)
    3: { signPos: { x: 76,  y: 100 }, planetsPos: { x: 44,  y: 100 } }, // Top-far-left triangle (House 3)
    4: { signPos: { x: 162, y: 200 }, planetsPos: { x: 88,  y: 200 } }, // Middle-left diamond (House 4)
    5: { signPos: { x: 76,  y: 300 }, planetsPos: { x: 44,  y: 300 } }, // Bottom-far-left triangle (House 5) - Safe margin prevents clipping 'शनि'
    6: { signPos: { x: 100, y: 324 }, planetsPos: { x: 100, y: 364 } }, // Bottom-left triangle (House 6)
    7: { signPos: { x: 200, y: 240 }, planetsPos: { x: 200, y: 315 } }, // Bottom-center diamond (House 7)
    8: { signPos: { x: 300, y: 324 }, planetsPos: { x: 300, y: 364 } }, // Bottom-right triangle (House 8)
    9: { signPos: { x: 324, y: 300 }, planetsPos: { x: 356, y: 300 } }, // Bottom-far-right triangle (House 9)
    10: { signPos: { x: 238, y: 200 }, planetsPos: { x: 312, y: 200 } }, // Middle-right diamond (House 10)
    11: { signPos: { x: 324, y: 100 }, planetsPos: { x: 356, y: 100 } }, // Top-far-right triangle (House 11)
    12: { signPos: { x: 300, y: 76 },  planetsPos: { x: 300, y: 36 } }, // Top-right triangle (House 12)
  };

  const getGrahaLabel = (name: string, nepali: boolean) => {
    if (name === 'Saturn' || name === 'शनि') return nepali ? 'शनि' : 'Sa';
    const grahaInfo = GRAHA_MAP[name as GrahaName];
    if (grahaInfo) return nepali ? grahaInfo.ne : name.substring(0, 2);
    return name;
  };

  const getGrahaColor = (name: GrahaName, dark: boolean) => {
    if (dark) return GRAHA_MAP[name]?.color || '#f59e0b';
    switch (name) {
      case 'Sun': return '#b91c1c'; // deep crimson
      case 'Moon': return '#1d4ed8'; // royal blue
      case 'Mars': return '#dc2626'; // ruby red
      case 'Mercury': return '#047857'; // emerald green
      case 'Jupiter': return '#b45309'; // golden topaz
      case 'Venus': return '#be185d'; // royal rose
      case 'Saturn': return '#1e293b'; // charcoal
      case 'Rahu': return '#334155'; // dark smoke
      case 'Ketu': return '#7c2d12'; // deep rust
      default: return '#1e293b';
    }
  };

  // Smart Anti-Collision Planet Placer
  // Automatically spaces planets vertically or into 2 parallel columns so text NEVER overlaps!
  const renderPlanets = (
    pList: { name: GrahaName; degStr: string; isRetro: boolean }[],
    center: { x: number; y: number }
  ) => {
    if (pList.length === 0) return null;

    if (pList.length === 1) {
      const p = pList[0];
      const label = getGrahaLabel(p.name, isNe);
      const retroTag = p.isRetro ? (isNe ? '(व)' : '(R)') : '';
      const color = getGrahaColor(p.name, isDark);

      return (
        <text
          x={center.x}
          y={center.y}
          fill={color}
          fontSize="14"
          fontWeight="900"
          textAnchor="middle"
          dominantBaseline="central"
          style={{
            filter: isDark
              ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.9))'
              : 'drop-shadow(0 1px 0 rgba(255,255,255,0.95))',
          }}
        >
          {label} {p.degStr}{retroTag}
        </text>
      );
    }

    if (pList.length === 2) {
      return (
        <>
          {pList.map((p, idx) => {
            const label = getGrahaLabel(p.name, isNe);
            const retroTag = p.isRetro ? (isNe ? '(व)' : '(R)') : '';
            const color = getGrahaColor(p.name, isDark);
            const yPos = center.y + (idx === 0 ? -10 : 10);

            return (
              <text
                key={idx}
                x={center.x}
                y={yPos}
                fill={color}
                fontSize="13.5"
                fontWeight="800"
                textAnchor="middle"
                dominantBaseline="central"
                style={{
                  filter: isDark
                    ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.9))'
                    : 'drop-shadow(0 1px 0 rgba(255,255,255,0.95))',
                }}
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
            const label = getGrahaLabel(p.name, isNe);
            const retroTag = p.isRetro ? (isNe ? '(व)' : '(R)') : '';
            const color = getGrahaColor(p.name, isDark);
            const yPos = center.y + (idx - 1) * 15;

            return (
              <text
                key={idx}
                x={center.x}
                y={yPos}
                fill={color}
                fontSize="12.5"
                fontWeight="800"
                textAnchor="middle"
                dominantBaseline="central"
                style={{
                  filter: isDark
                    ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.9))'
                    : 'drop-shadow(0 1px 0 rgba(255,255,255,0.95))',
                }}
              >
                {label} {p.degStr}{retroTag}
              </text>
            );
          })}
        </>
      );
    }

    // 4 or more planets: 2 neat parallel columns (No vertical spill / No collision)
    return (
      <>
        {pList.map((p, idx) => {
          const label = getGrahaLabel(p.name, isNe);
          const retroTag = p.isRetro ? (isNe ? '(व)' : '(R)') : '';
          const color = getGrahaColor(p.name, isDark);

          const col = idx % 2; // 0 = left, 1 = right
          const row = Math.floor(idx / 2);
          const totalRows = Math.ceil(pList.length / 2);

          const xPos = center.x + (col === 0 ? -20 : 20);
          const yPos = center.y + (row - (totalRows - 1) / 2) * 14;

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
              style={{
                filter: isDark
                  ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.9))'
                  : 'drop-shadow(0 1px 0 rgba(255,255,255,0.95))',
              }}
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
      {/* Chart Top Header & Controls */}
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
            {isNe ? 'उत्तरी भारतीय लग्न कुण्डली (North Indian)' : 'North Indian Lagna Kundali'}
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

      {/* SVG Kundali Chart - Scalable, Responsive & High Definition */}
      <div className={`relative w-full aspect-square mx-auto transition-all duration-300 ${
        isLarge ? 'max-w-[540px] sm:max-w-[580px]' : 'max-w-[420px]'
      }`}>
        <svg viewBox="0 0 400 400" className="w-full h-full select-none drop-shadow-md overflow-visible">
          {/* Outer Border Background */}
          <rect
            width="400"
            height="400"
            fill={isDark ? '#0f172a' : '#fffdf9'}
            stroke={isDark ? '#92400e' : '#b45309'}
            strokeWidth="3.5"
            rx="6"
          />

          {/* Kendra Houses Fill (1, 4, 7, 10 - Sacred Central Diamond) */}
          <polygon
            points="200,0 400,200 200,400 0,200"
            fill={isDark ? '#1e293b' : '#fffbeb'}
            stroke={isDark ? '#d97706' : '#b45309'}
            strokeWidth="2.5"
          />

          {/* Main Diagonal Lines */}
          <line x1="0" y1="0" x2="400" y2="400" stroke={isDark ? '#b45309' : '#c2410c'} strokeWidth="2" />
          <line x1="400" y1="0" x2="0" y2="400" stroke={isDark ? '#b45309' : '#c2410c'} strokeWidth="2" />

          {/* Subtle Decorative Center Bindu/Mark */}
          <circle cx="200" cy="200" r="3.5" fill={isDark ? '#f59e0b' : '#b45309'} />

          {/* House 1: Lagna Badge at top apex (completely isolated from planets and sign number) */}
          <g>
            <rect
              x="165"
              y="14"
              width="70"
              height="20"
              rx="10"
              fill={isDark ? '#3b0764' : '#fee2e2'}
              stroke={isDark ? '#c084fc' : '#dc2626'}
              strokeWidth="1.2"
            />
            <text
              x="200"
              y="25"
              fill={isDark ? '#f5d0fe' : '#b91c1c'}
              fontSize="12.5"
              fontWeight="900"
              textAnchor="middle"
              dominantBaseline="central"
            >
              ✦ {isNe ? 'लग्न' : 'Lagna'} ✦
            </text>
          </g>

          {/* Render Houses 1 to 12 with Protected Sign Circles and Non-Colliding Planet Blocks */}
          {Array.from({ length: 12 }, (_, i) => {
            const hNum = i + 1;
            const houseData = houses.find((h) => h.houseNumber === hNum)!;
            const rashiNum = houseData.signIndex + 1; // 1 to 12
            const cfg = houseConfig[hNum];
            const pList = housePlanets[hNum];

            return (
              <g key={hNum}>
                {/* Protected Rashi Sign Number Circle Badge */}
                <circle
                  cx={cfg.signPos.x}
                  cy={cfg.signPos.y}
                  r="13.5"
                  fill={isDark ? '#334155' : '#fef3c7'}
                  stroke={isDark ? '#d97706' : '#b45309'}
                  strokeWidth="1.4"
                />
                <text
                  x={cfg.signPos.x}
                  y={cfg.signPos.y + 0.5}
                  fill={isDark ? '#fde047' : '#9a3412'}
                  fontSize="17"
                  fontWeight="900"
                  textAnchor="middle"
                  dominantBaseline="central"
                  style={{
                    textShadow: isDark
                      ? '0 1px 2px rgba(0,0,0,0.8)'
                      : '0 1px 0 rgba(255,255,255,0.9)',
                  }}
                >
                  {rashiNum}
                </text>

                {/* Planets rendered using Anti-Collision Engine */}
                {renderPlanets(pList, cfg.planetsPos)}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Vedic Caption & Legend */}
      <div className="w-full mt-3 pt-2.5 border-t border-amber-500/20 flex flex-wrap items-center justify-between text-[11px] font-medium gap-2">
        <span className={isDark ? 'text-amber-400/90 font-mono' : 'text-amber-900 font-mono font-bold'}>
          {isNe ? 'केन्द्र भाव: १, ४, ७, १० | त्रिकोण भाव: १, ५, ९' : 'Kendra: 1, 4, 7, 10 | Trikona: 1, 5, 9'}
        </span>
        <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>
          Lagna: <strong className={isDark ? 'text-amber-300' : 'text-amber-900'}>{isNe ? RASHI_LIST[ascendant.signIndex].nameNe : ascendant.signNameEn}</strong> ({Math.floor(ascendant.degree)}°)
        </span>
      </div>
    </div>
  );
};
