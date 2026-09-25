import React, { useState, useMemo } from 'react';

export const StockChart = ({ data = [], currentPrice = 0, isBullish = true }) => {
  const [hoverIndex, setHoverIndex] = useState(null);

  const width = 800;
  const height = 300;
  const padding = { top: 15, right: 20, bottom: 35, left: 50 };

  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const pointsData = useMemo(() => {
    if (!data || data.length === 0) {
      return [{ time: 'Now', price: currentPrice }];
    }
    return data;
  }, [data, currentPrice]);

  const { minPrice, maxPrice, coordinates, pathD, areaD } = useMemo(() => {
    if (pointsData.length === 0) {
      return { minPrice: 0, maxPrice: 0, coordinates: [], pathD: '', areaD: '' };
    }

    const prices = pointsData.map((d) => d.price);
    let min = Math.min(...prices);
    let max = Math.max(...prices);

    if (min === max) {
      min = min * 0.99;
      max = max * 1.01;
    }

    const range = max - min;
    const paddedMin = min - range * 0.05;
    const paddedMax = max + range * 0.05;
    const paddedRange = paddedMax - paddedMin;

    const coords = pointsData.map((d, index) => {
      const x = padding.left + (index / (pointsData.length - 1 || 1)) * chartWidth;
      const y = padding.top + chartHeight - ((d.price - paddedMin) / paddedRange) * chartHeight;
      return { x, y, price: d.price, time: d.time };
    });

    let path = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 1; i < coords.length; i++) {
      const prev = coords[i - 1];
      const curr = coords[i];
      const midX = (prev.x + curr.x) / 2;
      path += ` C ${midX} ${prev.y}, ${midX} ${curr.y}, ${curr.x} ${curr.y}`;
    }

    const area = `${path} L ${coords[coords.length - 1].x} ${padding.top + chartHeight} L ${coords[0].x} ${padding.top + chartHeight} Z`;

    return { minPrice: min, maxPrice: max, coordinates: coords, pathD: path, areaD: area };
  }, [pointsData, chartWidth, chartHeight, padding.left, padding.top]);

  const activePoint = hoverIndex !== null && coordinates[hoverIndex] ? coordinates[hoverIndex] : null;

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * width;
    
    let closestIdx = 0;
    let minDiff = Infinity;
    coordinates.forEach((coord, idx) => {
      const diff = Math.abs(coord.x - mouseX);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = idx;
      }
    });

    setHoverIndex(closestIdx);
  };

  const trendColor = isBullish ? '#34c759' : '#ff3b30';
  const gradId = `appleChartGrad_${isBullish ? 'up' : 'down'}`;

  return (
    <div style={{ position: 'relative', width: '100%', userSelect: 'none' }}>
      {/* Floating Active Info */}
      {activePoint && (
        <div
          style={{
            position: 'absolute',
            top: '0',
            right: '10px',
            background: 'var(--apple-surface-card)',
            border: '1px solid var(--apple-hairline)',
            padding: '4px 12px',
            borderRadius: 'var(--rounded-pill)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: 'var(--shadow-apple)',
            fontSize: '13px',
            zIndex: 10,
          }}
        >
          <span style={{ color: 'var(--apple-body-muted)' }}>{activePoint.time}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--apple-ink)' }}>
            ₹{activePoint.price.toFixed(2)}
          </span>
        </div>
      )}

      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', height: 'auto', display: 'block' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverIndex(null)}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={trendColor} stopOpacity="0.18" />
            <stop offset="100%" stopColor={trendColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Minimal horizontal reference lines */}
        {[0, 0.5, 1].map((ratio) => {
          const y = padding.top + chartHeight * ratio;
          const priceVal = maxPrice - (maxPrice - minPrice) * ratio;
          return (
            <g key={ratio}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="var(--apple-hairline)"
                strokeDasharray="2 4"
              />
              <text
                x={padding.left - 8}
                y={y + 4}
                textAnchor="end"
                fontSize="11"
                fill="var(--apple-body-muted)"
                fontFamily="var(--font-mono)"
              >
                ₹{priceVal.toFixed(0)}
              </text>
            </g>
          );
        })}

        {/* Gradient fill under spline */}
        {areaD && <path d={areaD} fill={`url(#${gradId})`} />}

        {/* Main curve */}
        {pathD && (
          <path
            d={pathD}
            fill="none"
            stroke={trendColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Apple hairline crosshair */}
        {activePoint && (
          <g>
            <line
              x1={activePoint.x}
              y1={padding.top}
              x2={activePoint.x}
              y2={padding.top + chartHeight}
              stroke="var(--apple-ink)"
              strokeOpacity="0.3"
              strokeWidth="1"
            />
            <circle
              cx={activePoint.x}
              cy={activePoint.y}
              r="4"
              fill={trendColor}
              stroke="var(--apple-surface-card)"
              strokeWidth="2"
            />
          </g>
        )}

        {/* X Axis Time Labels */}
        {coordinates.length > 1 &&
          [0, Math.floor(coordinates.length / 2), coordinates.length - 1].map((idx) => {
            const pt = coordinates[idx];
            if (!pt) return null;
            return (
              <text
                key={idx}
                x={pt.x}
                y={height - 10}
                textAnchor={idx === 0 ? 'start' : idx === coordinates.length - 1 ? 'end' : 'middle'}
                fontSize="11"
                fill="var(--apple-body-muted)"
                fontFamily="var(--font-mono)"
              >
                {pt.time}
              </text>
            );
          })}
      </svg>
    </div>
  );
};
