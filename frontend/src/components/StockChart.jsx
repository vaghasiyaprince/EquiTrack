import React, { useState, useRef, useMemo, useEffect } from 'react';
import { generateChartData } from '../services/stockService';

// Catmull-Rom to Cubic Bezier curve for silky Apple smoothness
function buildSmoothSpline(points) {
  if (!points || points.length < 2) return '';
  if (points.length === 2) {
    return `M ${points[0].x.toFixed(1)},${points[0].y.toFixed(1)} L ${points[1].x.toFixed(1)},${points[1].y.toFixed(1)}`;
  }

  const tension = 0.35;
  let d = `M ${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = i > 0 ? points[i - 1] : points[0];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = i < points.length - 2 ? points[i + 2] : p2;

    const cp1x = p1.x + ((p2.x - p0.x) / 6) * tension * 3;
    const cp1y = p1.y + ((p2.y - p0.y) / 6) * tension * 3;
    const cp2x = p2.x - ((p3.x - p1.x) / 6) * tension * 3;
    const cp2y = p2.y - ((p3.y - p1.y) / 6) * tension * 3;

    d += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
  }

  return d;
}

export const StockChart = ({ basePrice, timeframe, isPositive, onScrubPrice }) => {
  const [hoverIndex, setHoverIndex] = useState(null);
  const containerRef = useRef(null);

  // Generate 60+ points for ultra high-density curve smoothness
  const data = useMemo(() => {
    return generateChartData(basePrice, timeframe);
  }, [basePrice, timeframe]);

  const prices = data.map((d) => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const range = maxPrice - minPrice || 1;

  // Virtual Canvas Dimensions
  const width = 850;
  const height = 340;
  const paddingLeft = 12;
  const paddingRight = 80;
  const paddingTop = 25;
  const paddingBottom = 45;

  const graphWidth = width - paddingLeft - paddingRight;
  const graphHeight = height - paddingTop - paddingBottom;

  // Normalized Point Coordinates
  const points = useMemo(() => {
    return data.map((d, index) => {
      const x = paddingLeft + (index / (data.length - 1)) * graphWidth;
      const y = height - paddingBottom - ((d.price - minPrice) / range) * graphHeight;
      return { x, y, price: d.price, time: d.time };
    });
  }, [data, minPrice, range, graphWidth, graphHeight, height, paddingLeft, paddingBottom]);

  // Construct Smooth Path and Area
  const { linePath, areaPath } = useMemo(() => {
    if (points.length < 2) return { linePath: '', areaPath: '' };

    const spline = buildSmoothSpline(points);
    const firstX = points[0].x;
    const lastX = points[points.length - 1].x;
    const bottomY = height - paddingBottom;
    const area = `${spline} L ${lastX.toFixed(1)},${bottomY} L ${firstX.toFixed(1)},${bottomY} Z`;

    return { linePath: spline, areaPath: area };
  }, [points, height, paddingBottom]);

  const strokeColor = isPositive ? 'var(--apple-green)' : 'var(--apple-red)';
  const gradId = `apple-chart-glow-${isPositive ? 'up' : 'down'}`;

  // Interactive Scrubbing Pointer (Mouse + Mobile Touch)
  const handlePointer = (clientX) => {
    if (!containerRef.current || points.length === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const targetX = paddingLeft + ratio * graphWidth;

    let closestIdx = 0;
    let minDiff = Infinity;
    points.forEach((pt, idx) => {
      const diff = Math.abs(pt.x - targetX);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = idx;
      }
    });

    setHoverIndex(closestIdx);
    if (onScrubPrice && points[closestIdx]) {
      onScrubPrice(points[closestIdx]);
    }
  };

  const handlePointerLeave = () => {
    setHoverIndex(null);
    if (onScrubPrice) {
      onScrubPrice(null);
    }
  };

  const currentHover = hoverIndex !== null && points[hoverIndex] ? points[hoverIndex] : null;

  return (
    <div
      ref={containerRef}
      onMouseMove={(e) => handlePointer(e.clientX)}
      onTouchMove={(e) => {
        if (e.touches && e.touches[0]) handlePointer(e.touches[0].clientX);
      }}
      onMouseLeave={handlePointerLeave}
      onTouchEnd={handlePointerLeave}
      style={{
        width: '100%',
        position: 'relative',
        userSelect: 'none',
        touchAction: 'none',
        cursor: 'crosshair',
      }}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{
          width: '100%',
          height: 'auto',
          maxHeight: '360px',
          overflow: 'visible',
          display: 'block',
        }}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.32" />
            <stop offset="60%" stopColor={strokeColor} stopOpacity="0.08" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Apple Horizontal Reference Grid with Y-Axis Benchmarks */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = height - paddingBottom - ratio * graphHeight;
          const p = minPrice + ratio * range;
          return (
            <g key={ratio}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={width - paddingRight}
                y2={y}
                stroke="var(--apple-hairline)"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <text
                x={width - paddingRight + 12}
                y={y + 4}
                fill="var(--apple-ink-secondary)"
                fontSize="12"
                fontWeight="500"
                fontFamily="var(--font-sf)"
              >
                ₹{p.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </text>
            </g>
          );
        })}

        {/* Date / Interval Markers along bottom axis */}
        {points
          .filter((_, idx) => idx % Math.floor(points.length / 5) === 0 || idx === points.length - 1)
          .map((pt, i) => (
            <text
              key={i}
              x={pt.x}
              y={height - 12}
              textAnchor={i === 0 ? 'start' : i === points.length - 1 ? 'end' : 'middle'}
              fill="var(--apple-ink-secondary)"
              fontSize="11"
              fontWeight="500"
              fontFamily="var(--font-sf)"
            >
              {pt.time}
            </text>
          ))}

        {/* Gradient Area Fill */}
        <path d={areaPath} fill={`url(#${gradId})`} />

        {/* Ultra-Smooth Price Spline Curve */}
        <path
          d={linePath}
          fill="none"
          stroke={strokeColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Active Scrub Target Crosshair & Outer Pulsing Ring */}
        {currentHover && (
          <g>
            <line
              x1={currentHover.x}
              y1={paddingTop}
              x2={currentHover.x}
              y2={height - paddingBottom}
              stroke="var(--apple-ink-tertiary)"
              strokeWidth="1.2"
              strokeDasharray="3 3"
            />
            {/* Outer halo */}
            <circle
              cx={currentHover.x}
              cy={currentHover.y}
              r="10"
              fill={strokeColor}
              fillOpacity="0.25"
            />
            {/* Solid core indicator */}
            <circle
              cx={currentHover.x}
              cy={currentHover.y}
              r="5.5"
              fill={strokeColor}
              stroke="var(--apple-canvas)"
              strokeWidth="2.5"
            />
          </g>
        )}
      </svg>
    </div>
  );
};
