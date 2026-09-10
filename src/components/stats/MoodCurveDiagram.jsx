import React, { useState, useMemo } from 'react';
import { subDays, format } from 'date-fns';
import { getDayCalendarInfo } from '../../data/calendarHolidays.js';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext.jsx';

export default function MoodCurveDiagram({ moods = [], onSelectDay }) {
  const { t, lang, dateLocale } = useLanguage();
  const [daysCount, setDaysCount] = useState(14); // 14 or 30 days
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Generate data points for the selected period
  const curveData = useMemo(() => {
    const today = new Date();
    const points = [];

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = subDays(today, i);
      const dateStr = format(d, 'yyyy-MM-dd');
      const dayMoods = moods.filter(m => m.date === dateStr);
      const dayInfo = getDayCalendarInfo(d, lang);

      let avgScore = null;
      if (dayMoods.length > 0) {
        const sum = dayMoods.reduce((acc, m) => acc + m.score, 0);
        avgScore = Number((sum / dayMoods.length).toFixed(2));
      }

      points.push({
        date: d,
        dateStr,
        score: avgScore,
        count: dayMoods.length,
        dayInfo,
        moods: dayMoods
      });
    }

    return points;
  }, [moods, daysCount, lang]);

  // Diagram Dimensions
  const svgWidth = 800;
  const svgHeight = 280;
  const paddingX = 40;
  const paddingTop = 30;
  const paddingBottom = 40;
  const graphWidth = svgWidth - paddingX * 2;
  const graphHeight = svgHeight - paddingTop - paddingBottom;

  // Scale functions (Score 1-5 -> Y coord)
  const getX = (index) => paddingX + (index / (curveData.length - 1)) * graphWidth;
  const getY = (score) => {
    const s = score !== null ? score : 3.0; // fallback to neutral
    return paddingTop + graphHeight - ((s - 1) / 4) * graphHeight;
  };

  // Build SVG path with smooth cubic beziers
  const validPoints = curveData.map((pt, idx) => ({
    ...pt,
    x: getX(idx),
    y: getY(pt.score)
  }));

  const pathD = useMemo(() => {
    if (validPoints.length < 2) return '';
    let d = `M ${validPoints[0].x} ${validPoints[0].y}`;

    for (let i = 0; i < validPoints.length - 1; i++) {
      const p0 = validPoints[i === 0 ? 0 : i - 1];
      const p1 = validPoints[i];
      const p2 = validPoints[i + 1];
      const p3 = validPoints[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  }, [validPoints]);

  const areaD = useMemo(() => {
    if (!pathD) return '';
    const lastPoint = validPoints[validPoints.length - 1];
    const firstPoint = validPoints[0];
    const bottomY = paddingTop + graphHeight;
    return `${pathD} L ${lastPoint.x} ${bottomY} L ${firstPoint.x} ${bottomY} Z`;
  }, [pathD, validPoints]);

  // Statistics summaries
  const recordedScores = curveData.filter(d => d.score !== null).map(d => d.score);
  const averageScore = recordedScores.length > 0 
    ? (recordedScores.reduce((a, b) => a + b, 0) / recordedScores.length).toFixed(1)
    : '0.0';
  const highestScore = recordedScores.length > 0 ? Math.max(...recordedScores) : '-';
  const lowestScore = recordedScores.length > 0 ? Math.min(...recordedScores) : '-';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>{t('stats.title')}</span>
          </div>
          <h3 className="text-xl font-bold text-white">
            {t('stats.subtitle')}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {t('stats.subtext')}
          </p>
        </div>

        {/* Days count tabs */}
        <div className="inline-flex bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs font-medium self-start sm:self-auto">
          <button
            onClick={() => setDaysCount(14)}
            className={`px-3 py-1.5 rounded-lg transition ${
              daysCount === 14 ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t('stats.days14')}
          </button>
          <button
            onClick={() => setDaysCount(30)}
            className={`px-3 py-1.5 rounded-lg transition ${
              daysCount === 30 ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t('stats.days30')}
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
          <div className="text-[10px] text-slate-500 uppercase font-semibold">{t('stats.periodAvg')}</div>
          <div className="text-lg sm:text-xl font-bold text-cyan-400 mt-0.5 flex items-center space-x-1">
            <span>★ {averageScore}</span>
            <span className="text-xs text-slate-500 font-normal">/ 5</span>
          </div>
        </div>

        <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
          <div className="text-[10px] text-slate-500 uppercase font-semibold">{t('stats.highestPeak')}</div>
          <div className="text-lg sm:text-xl font-bold text-emerald-400 mt-0.5 flex items-center space-x-1">
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
            <span>{highestScore}</span>
          </div>
        </div>

        <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
          <div className="text-[10px] text-slate-500 uppercase font-semibold">{t('stats.lowestDip')}</div>
          <div className="text-lg sm:text-xl font-bold text-rose-400 mt-0.5 flex items-center space-x-1">
            <ArrowDownRight className="w-4 h-4 text-rose-400" />
            <span>{lowestScore}</span>
          </div>
        </div>
      </div>

      {/* Interactive SVG Curve Diagram */}
      <div className="relative overflow-x-auto select-none bg-slate-950/50 rounded-xl border border-slate-800/80 p-2">
        <svg 
          viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
          className="w-full h-auto min-w-[600px] overflow-visible"
        >
          <defs>
            {/* Gradient under the curve */}
            <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
              <stop offset="60%" stopColor="#0284c7" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0.0" />
            </linearGradient>

            {/* Stroke gradient */}
            <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines for scores 1 to 5 */}
          {[5, 4, 3, 2, 1].map((level) => {
            const y = getY(level);
            const isNeutral = level === 3;
            return (
              <g key={level}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={svgWidth - paddingX}
                  y2={y}
                  stroke={isNeutral ? '#334155' : '#1e293b'}
                  strokeDasharray={isNeutral ? '4 4' : undefined}
                  strokeWidth="1"
                />
                <text
                  x={paddingX - 10}
                  y={y + 3}
                  textAnchor="end"
                  fill={isNeutral ? '#94a3b8' : '#475569'}
                  fontSize="10"
                  fontFamily="sans-serif"
                >
                  {level === 5 ? '🤩 5' : level === 4 ? '🙂 4' : level === 3 ? '😐 3' : level === 2 ? '🙁 2' : '😫 1'}
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          {areaD && (
            <path d={areaD} fill="url(#curveGradient)" />
          )}

          {/* Main Curve Line */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke="url(#strokeGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Interactive Date Nodes */}
          {validPoints.map((pt, idx) => {
            const isHovered = hoveredPoint?.dateStr === pt.dateStr;
            const hasData = pt.score !== null;

            return (
              <g 
                key={pt.dateStr}
                onClick={() => onSelectDay(pt.dateStr)}
                onMouseEnter={() => setHoveredPoint(pt)}
                onMouseLeave={() => setHoveredPoint(null)}
                className="cursor-pointer group"
              >
                {/* Vertical hover guide */}
                {isHovered && (
                  <line
                    x1={pt.x}
                    y1={paddingTop}
                    x2={pt.x}
                    y2={paddingTop + graphHeight}
                    stroke="#06b6d4"
                    strokeWidth="1"
                    strokeDasharray="2 2"
                    opacity="0.6"
                  />
                )}

                {/* Outer ring */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 7 : hasData ? 4.5 : 3}
                  fill={hasData ? (pt.score >= 4 ? '#10b981' : pt.score >= 2.5 ? '#06b6d4' : '#f43f5e') : '#334155'}
                  stroke="#0f172a"
                  strokeWidth="2"
                  className="transition-all duration-150 group-hover:scale-125"
                />

                {/* X-axis date labels */}
                <text
                  x={pt.x}
                  y={paddingTop + graphHeight + 20}
                  textAnchor="middle"
                  fill={isHovered ? '#38bdf8' : pt.dayInfo.isRedDay ? '#f87171' : '#64748b'}
                  fontSize={daysCount > 14 ? '9' : '10'}
                  fontWeight={isHovered || pt.dayInfo.isRedDay ? 'bold' : 'normal'}
                >
                  {format(pt.date, 'd/M')}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredPoint && (
          <div 
            className="absolute top-4 right-4 bg-slate-900 border border-slate-700 shadow-2xl rounded-xl p-3 text-xs pointer-events-none z-20 animate-fade-in"
          >
            <div className="font-bold text-white flex items-center justify-between space-x-3">
              <span>{format(hoveredPoint.date, 'EEEE d MMMM', { locale: dateLocale })}</span>
              {hoveredPoint.score && (
                <span className="text-cyan-400">★ {hoveredPoint.score} / 5</span>
              )}
            </div>

            {hoveredPoint.dayInfo.holiday && (
              <div className="text-red-300 text-[11px] mt-0.5">
                {hoveredPoint.dayInfo.flag} {hoveredPoint.dayInfo.holiday}
              </div>
            )}

            {hoveredPoint.dayInfo.nameDay && (
              <div className="text-slate-400 text-[10px] italic">
                {t('calendar.nameDay')} {hoveredPoint.dayInfo.nameDay}
              </div>
            )}

            <div className="mt-1 text-[11px] text-slate-400">
              {hoveredPoint.count > 0 ? `${hoveredPoint.count} ${t('stats.moodLogsCount').toLowerCase()} • ${t('stats.drawerTitle')}` : t('stats.noDayMoods')}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2 text-[11px] text-slate-500">
        <Info className="w-3.5 h-3.5 flex-shrink-0 text-cyan-400" />
        <span>
          {t('stats.curveNote')}
        </span>
      </div>
    </div>
  );
}
