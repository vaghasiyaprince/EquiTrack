import React from 'react';
import { generateChartData } from '../services/stockService';

// Apple Catmull-Rom to Cubic Bezier spline converter for perfectly tensioned, organic curves
function getCurvedPath(pts, tension = 0.3) {
  if (!pts || pts.length < 2) return '';
  if (pts.length === 2) {
    return `M ${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)} L ${pts[1].x.toFixed(1)},${pts[1].y.toFixed(1)}`;
  }

  let d = `M ${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;

  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = i > 0 ? pts[i - 1] : pts[0];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = i < pts.length - 2 ? pts[i + 2] : p2;

    const cp1x = p1.x + ((p2.x - p0.x) / 6) * tension * 3;
    const cp1y = p1.y + ((p2.y - p0.y) / 6) * tension * 3;
    const cp2x = p2.x - ((p3.x - p1.x) / 6) * tension * 3;
    const cp2y = p2.y - ((p3.y - p1.y) / 6) * tension * 3;

    d += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
  }

  return d;
}

export const MiniSparkline = ({ data = [], isPositive = true, width = 64, height = 26, symbol = '' }) => {
  // If no detailed data is passed or only 4 synthetic points, generate a realistic 16-point intraday curve
  const pointsData = React.useMemo(() => {
    if (data && data.length >= 8) return data;
    // Generate realistic multi-point path from open to price
    const base = data[0] || 1000;
    const end = data[data.length - 1] || base;
    const diff = end - base;
    const pts = [base];
    const count = 14;
    // Pseudo random walk based on symbol chars
    const seed = (symbol || 'STOCK').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    for (let i = 1; i < count; i++) {
      const progress = i / count;
      const wave = Math.sin((i + seed) * 0.7) * (Math.abs(diff) * 0.45 + base * 0.003);
      pts.push(base + diff * progress + wave);
    }
    pts.push(end);
    return pts;
  }, [data, symbol]);

  const min = Math.min(...pointsData);
  const max = Math.max(...pointsData);
  const range = max - min || 1;

  const pts = pointsData.map((val, idx) => {
    const x = (idx / (pointsData.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 6) - 3;
    return { x, y };
  });

  const pathD = getCurvedPath(pts, 0.4);
  const areaD = `${pathD} L ${width},${height} L 0,${height} Z`;

  const color = isPositive ? 'var(--apple-green)' : 'var(--apple-red)';
  const gradId = `spark-glow-${Math.abs(min).toFixed(0)}-${width}`;

  return (
    <svg
      width={width}
      height={height}
      style={{ overflow: 'visible', flexShrink: 0, display: 'block' }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="80%" stopColor={color} stopOpacity="0.05" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${gradId})`} />
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
