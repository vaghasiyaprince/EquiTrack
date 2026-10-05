import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import {
  createChart,
  ColorType,
  CrosshairMode,
  LineStyle,
  AreaSeries,
  CandlestickSeries,
  LineSeries,
} from 'lightweight-charts';
import {
  CandlestickChart,
  TrendingUp,
  Activity,
  RotateCcw,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

/**
 * Helper to parse any timestamp string/number into seconds since Unix epoch
 */
const parseToUnixSeconds = (timestamp) => {
  if (!timestamp) return null;
  if (typeof timestamp === 'number') {
    return timestamp > 1e11 ? Math.floor(timestamp / 1000) : Math.floor(timestamp);
  }
  const dateObj = new Date(timestamp);
  if (!isNaN(dateObj.getTime())) {
    return Math.floor(dateObj.getTime() / 1000);
  }
  // Try replacing space with 'T' for strings like "YYYY-MM-DD HH:mm:ss"
  const safeStr = String(timestamp).replace(' ', 'T');
  const dateObj2 = new Date(safeStr);
  if (!isNaN(dateObj2.getTime())) {
    return Math.floor(dateObj2.getTime() / 1000);
  }
  return null;
};

/**
 * Formats a unix timestamp (in seconds) into a readable time / date string
 */
const formatTimestamp = (unixSec) => {
  if (!unixSec) return '';
  const d = new Date(unixSec * 1000);
  return d.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

export const StockChart = ({
  data = [],
  currentPrice = 0,
  isBullish = true,
  symbol = '',
  exchange = 'NSE',
  duration = '1d',
}) => {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const [chartType, setChartType] = useState('candlestick'); // 'candlestick' | 'area' | 'line'
  const [hoverData, setHoverData] = useState(null);
  const [themeMode, setThemeMode] = useState(() => {
    if (typeof document !== 'undefined') {
      return document.documentElement.getAttribute('data-theme') || 'dark';
    }
    return 'dark';
  });

  // Watch for theme changes on <html data-theme="...">
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      setThemeMode(current);
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    return () => observer.disconnect();
  }, []);

  const isDark = themeMode !== 'light';

  // Prepare & strictly deduplicate data for TradingView lightweight-charts
  const { areaData, candleData, lineData, latestPoint, hasValidCandles } = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return { areaData: [], candleData: [], lineData: [], latestPoint: null, hasValidCandles: false };
    }

    const rawParsed = [];
    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      if (!item) continue;
      const t = parseToUnixSeconds(item.timestamp || item.time);
      const close = Number(item.close ?? item.price);
      if (t === null || isNaN(close)) continue;

      const open = Number(item.open ?? close);
      const high = Number(item.high ?? Math.max(open, close));
      const low = Number(item.low ?? Math.min(open, close));

      rawParsed.push({
        time: t,
        open,
        high,
        low,
        close,
        value: close,
      });
    }

    // Sort ascending by time
    rawParsed.sort((a, b) => a.time - b.time);

    // Guarantee strictly monotonic increasing time series
    const unique = [];
    let lastTime = -Infinity;
    let anyCandleSpread = false;

    for (const pt of rawParsed) {
      if (pt.time > lastTime) {
        unique.push(pt);
        lastTime = pt.time;
        if (Math.abs(pt.high - pt.low) > 0.001 || Math.abs(pt.open - pt.close) > 0.001) {
          anyCandleSpread = true;
        }
      }
    }

    const area = unique.map((d) => ({ time: d.time, value: d.value }));
    const candles = unique.map((d) => ({
      time: d.time,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }));
    const lines = unique.map((d) => ({ time: d.time, value: d.value }));
    const latest = unique.length > 0 ? unique[unique.length - 1] : null;

    return {
      areaData: area,
      candleData: candles,
      lineData: lines,
      latestPoint: latest,
      hasValidCandles: anyCandleSpread,
    };
  }, [data]);

  // Fallback to Area if candles have no spread (e.g. single price ticks)
  useEffect(() => {
    if (!hasValidCandles && chartType === 'candlestick' && areaData.length > 0) {
      setChartType('area');
    }
  }, [hasValidCandles, chartType, areaData.length]);

  // Color tokens tailored for Apple Pro & TradingView
  const colors = useMemo(() => {
    const bullishGreen = '#34c759';
    const bearishRed = '#ff3b30';
    const activeColor = isBullish ? bullishGreen : bearishRed;

    return {
      bullish: bullishGreen,
      bearish: bearishRed,
      active: activeColor,
      bg: isDark ? '#1c1c1e' : '#ffffff',
      textColor: isDark ? '#86868b' : '#6e6e73',
      gridColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
      crosshairColor: isDark ? 'rgba(255, 255, 255, 0.35)' : 'rgba(0, 0, 0, 0.3)',
      crosshairLabelBg: isDark ? '#2997ff' : '#0066cc',
      areaTop: isBullish ? 'rgba(52, 199, 89, 0.28)' : 'rgba(255, 59, 48, 0.24)',
      areaBottom: isBullish ? 'rgba(52, 199, 89, 0.0)' : 'rgba(255, 59, 48, 0.0)',
    };
  }, [isDark, isBullish]);

  // Initialize TradingView lightweight-chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart instance
    const chart = createChart(chartContainerRef.current, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: colors.textColor,
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Inter', sans-serif",
        fontSize: 11,
      },
      grid: {
        vertLines: {
          color: colors.gridColor,
          style: LineStyle.Dotted,
        },
        horzLines: {
          color: colors.gridColor,
          style: LineStyle.Dotted,
        },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          width: 1,
          color: colors.crosshairColor,
          style: LineStyle.Dashed,
          labelBackgroundColor: colors.crosshairLabelBg,
        },
        horzLine: {
          width: 1,
          color: colors.crosshairColor,
          style: LineStyle.Dashed,
          labelBackgroundColor: colors.crosshairLabelBg,
        },
      },
      rightPriceScale: {
        borderColor: colors.borderColor,
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
        autoScale: true,
      },
      timeScale: {
        borderColor: colors.borderColor,
        timeVisible: true,
        secondsVisible: false,
        barSpacing: 9,
        minBarSpacing: 3,
        rightOffset: 6,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: true,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
      localization: {
        priceFormatter: (price) => '₹' + Number(price).toFixed(2),
      },
    });

    chartRef.current = chart;

    // Crosshair hover listener for the real-time TradingView OHLC status bar
    chart.subscribeCrosshairMove((param) => {
      if (!param || !param.point || !param.time || !seriesRef.current) {
        setHoverData(null);
        return;
      }

      const pointData = param.seriesData.get(seriesRef.current);
      if (pointData) {
        setHoverData({
          time: param.time,
          open: pointData.open,
          high: pointData.high,
          low: pointData.low,
          close: pointData.close ?? pointData.value,
          value: pointData.value ?? pointData.close,
        });
      } else {
        setHoverData(null);
      }
    });

    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []); // Run once on mount

  // Update chart layout & styling when theme or colors change
  useEffect(() => {
    if (!chartRef.current) return;
    chartRef.current.applyOptions({
      layout: {
        textColor: colors.textColor,
      },
      grid: {
        vertLines: { color: colors.gridColor },
        horzLines: { color: colors.gridColor },
      },
      crosshair: {
        vertLine: {
          color: colors.crosshairColor,
          labelBackgroundColor: colors.crosshairLabelBg,
        },
        horzLine: {
          color: colors.crosshairColor,
          labelBackgroundColor: colors.crosshairLabelBg,
        },
      },
      rightPriceScale: {
        borderColor: colors.borderColor,
      },
      timeScale: {
        borderColor: colors.borderColor,
      },
    });
  }, [colors]);

  // Update series type and data
  useEffect(() => {
    if (!chartRef.current) return;
    const chart = chartRef.current;

    // Remove existing series before adding the new series type
    if (seriesRef.current) {
      try {
        chart.removeSeries(seriesRef.current);
      } catch (e) {
        // ignore
      }
      seriesRef.current = null;
    }

    if (areaData.length === 0) return;

    if (chartType === 'candlestick' && hasValidCandles) {
      const candlestickSeries = chart.addSeries(CandlestickSeries, {
        upColor: colors.bullish,
        downColor: colors.bearish,
        borderUpColor: colors.bullish,
        borderDownColor: colors.bearish,
        wickUpColor: colors.bullish,
        wickDownColor: colors.bearish,
        priceLineVisible: true,
        priceLineWidth: 1,
        priceLineStyle: LineStyle.Dashed,
      });
      candlestickSeries.setData(candleData);
      seriesRef.current = candlestickSeries;
    } else if (chartType === 'line') {
      const lineSeries = chart.addSeries(LineSeries, {
        color: colors.active,
        lineWidth: 2,
        priceLineVisible: true,
        priceLineWidth: 1,
        priceLineStyle: LineStyle.Dashed,
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 4,
        crosshairMarkerBorderColor: '#ffffff',
        crosshairMarkerBackgroundColor: colors.active,
      });
      lineSeries.setData(lineData);
      seriesRef.current = lineSeries;
    } else {
      // Default to Area (Gradient mountain)
      const areaSeries = chart.addSeries(AreaSeries, {
        topColor: colors.areaTop,
        bottomColor: colors.areaBottom,
        lineColor: colors.active,
        lineWidth: 2,
        priceLineVisible: true,
        priceLineWidth: 1,
        priceLineStyle: LineStyle.Dashed,
        crosshairMarkerVisible: true,
        crosshairMarkerRadius: 4,
        crosshairMarkerBorderColor: '#ffffff',
        crosshairMarkerBackgroundColor: colors.active,
      });
      areaSeries.setData(areaData);
      seriesRef.current = areaSeries;
    }

    // Fit content after loading
    chart.timeScale().fitContent();
  }, [chartType, areaData, candleData, lineData, colors, hasValidCandles]);

  // Reset zoom & pan to fit content
  const handleResetFit = useCallback(() => {
    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
    }
  }, []);

  // Zoom In
  const handleZoomIn = useCallback(() => {
    if (chartRef.current) {
      const timeScale = chartRef.current.timeScale();
      const visibleRange = timeScale.getVisibleLogicalRange();
      if (visibleRange) {
        const delta = (visibleRange.to - visibleRange.from) * 0.2;
        timeScale.setVisibleLogicalRange({
          from: visibleRange.from + delta,
          to: visibleRange.to - delta,
        });
      }
    }
  }, []);

  // Zoom Out
  const handleZoomOut = useCallback(() => {
    if (chartRef.current) {
      const timeScale = chartRef.current.timeScale();
      const visibleRange = timeScale.getVisibleLogicalRange();
      if (visibleRange) {
        const delta = (visibleRange.to - visibleRange.from) * 0.25;
        timeScale.setVisibleLogicalRange({
          from: visibleRange.from - delta,
          to: visibleRange.to + delta,
        });
      }
    }
  }, []);

  // Active status values: display hover info or latest candle values
  const activeStats = useMemo(() => {
    if (hoverData) {
      const open = hoverData.open ?? hoverData.close;
      const high = hoverData.high ?? hoverData.close;
      const low = hoverData.low ?? hoverData.close;
      const close = hoverData.close;
      const diff = close - open;
      const pct = open > 0 ? (diff / open) * 100 : 0;
      return {
        timeText: formatTimestamp(hoverData.time),
        open,
        high,
        low,
        close,
        diff,
        pct,
        isUp: diff >= 0,
      };
    }

    if (latestPoint) {
      const open = latestPoint.open ?? latestPoint.close;
      const high = latestPoint.high ?? latestPoint.close;
      const low = latestPoint.low ?? latestPoint.close;
      const close = latestPoint.close;
      const diff = close - open;
      const pct = open > 0 ? (diff / open) * 100 : 0;
      return {
        timeText: formatTimestamp(latestPoint.time),
        open,
        high,
        low,
        close: currentPrice || close,
        diff,
        pct,
        isUp: diff >= 0,
      };
    }

    return null;
  }, [hoverData, latestPoint, currentPrice]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        background: 'var(--apple-surface-card)',
        border: '1px solid var(--apple-hairline)',
        borderRadius: 'var(--rounded-lg)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-apple)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top TradingView Bar: Real-time OHLC Legend & Chart Controls (No indicator/tool clutter) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          padding: '12px 16px',
          borderBottom: '1px solid var(--apple-hairline)',
          background: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.01)',
          minHeight: '48px',
        }}
      >
        {/* Left: TradingView Live Legend (Symbol + Timestamp + OHLC) */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          {symbol && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '3px 8px',
                borderRadius: 'var(--rounded-xs)',
                background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '0.02em',
                color: 'var(--apple-ink)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              <span>{symbol}</span>
              <span style={{ opacity: 0.5, fontWeight: 400 }}>•</span>
              <span style={{ fontSize: '11px', color: 'var(--apple-body-muted)' }}>{exchange}</span>
            </div>
          )}

          {activeStats ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                fontSize: '12px',
                fontFamily: 'var(--font-mono)',
              }}
            >
              <span style={{ color: 'var(--apple-body-muted)', fontSize: '11px' }}>
                {activeStats.timeText}
              </span>

              {chartType === 'candlestick' && hasValidCandles ? (
                <>
                  <span style={{ color: 'var(--apple-body-muted)' }}>
                    O <strong style={{ color: 'var(--apple-ink)' }}>₹{activeStats.open.toFixed(2)}</strong>
                  </span>
                  <span style={{ color: 'var(--apple-body-muted)' }}>
                    H <strong style={{ color: 'var(--apple-ink)' }}>₹{activeStats.high.toFixed(2)}</strong>
                  </span>
                  <span style={{ color: 'var(--apple-body-muted)' }}>
                    L <strong style={{ color: 'var(--apple-ink)' }}>₹{activeStats.low.toFixed(2)}</strong>
                  </span>
                  <span style={{ color: 'var(--apple-body-muted)' }}>
                    C{' '}
                    <strong style={{ color: activeStats.isUp ? colors.bullish : colors.bearish }}>
                      ₹{activeStats.close.toFixed(2)}
                    </strong>
                  </span>
                </>
              ) : (
                <span style={{ color: 'var(--apple-body-muted)' }}>
                  Price{' '}
                  <strong style={{ color: activeStats.isUp ? colors.bullish : colors.bearish }}>
                    ₹{activeStats.close.toFixed(2)}
                  </strong>
                </span>
              )}

              {/* Bar Change Pill */}
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: activeStats.isUp
                    ? 'rgba(52, 199, 89, 0.12)'
                    : 'rgba(255, 59, 48, 0.12)',
                  color: activeStats.isUp ? colors.bullish : colors.bearish,
                }}
              >
                {activeStats.diff >= 0 ? '+' : ''}
                {activeStats.diff.toFixed(2)} ({activeStats.pct >= 0 ? '+' : ''}
                {activeStats.pct.toFixed(2)}%)
              </span>
            </div>
          ) : (
            <div style={{ fontSize: '12px', color: 'var(--apple-body-muted)' }}>
              TradingView Chart
            </div>
          )}
        </div>

        {/* Right: Chart Type Segmented Pill & Smooth Zoom Tools */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Segmented Control for Chart Style */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              background: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
              borderRadius: 'var(--rounded-pill)',
              padding: '2px',
              gap: '2px',
            }}
          >
            {hasValidCandles && (
              <button
                type="button"
                onClick={() => setChartType('candlestick')}
                title="Candlestick View"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  border: 'none',
                  padding: '4px 10px',
                  borderRadius: 'var(--rounded-pill)',
                  background: chartType === 'candlestick' ? 'var(--apple-surface-card)' : 'transparent',
                  color: chartType === 'candlestick' ? 'var(--apple-ink)' : 'var(--apple-body-muted)',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow:
                    chartType === 'candlestick' ? '0 1px 4px rgba(0,0,0,0.12)' : 'none',
                  transition: 'all var(--transition-fast)',
                }}
              >
                <CandlestickChart size={13} />
                <span>Candles</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setChartType('area')}
              title="Area Mountain View"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                border: 'none',
                padding: '4px 10px',
                borderRadius: 'var(--rounded-pill)',
                background: chartType === 'area' ? 'var(--apple-surface-card)' : 'transparent',
                color: chartType === 'area' ? 'var(--apple-ink)' : 'var(--apple-body-muted)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: chartType === 'area' ? '0 1px 4px rgba(0,0,0,0.12)' : 'none',
                transition: 'all var(--transition-fast)',
              }}
            >
              <TrendingUp size={13} />
              <span>Area</span>
            </button>

            <button
              type="button"
              onClick={() => setChartType('line')}
              title="Line Chart View"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                border: 'none',
                padding: '4px 10px',
                borderRadius: 'var(--rounded-pill)',
                background: chartType === 'line' ? 'var(--apple-surface-card)' : 'transparent',
                color: chartType === 'line' ? 'var(--apple-ink)' : 'var(--apple-body-muted)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: chartType === 'line' ? '0 1px 4px rgba(0,0,0,0.12)' : 'none',
                transition: 'all var(--transition-fast)',
              }}
            >
              <Activity size={13} />
              <span>Line</span>
            </button>
          </div>

          {/* Zoom In Button */}
          <button
            type="button"
            onClick={handleZoomIn}
            title="Zoom In"
            style={{
              width: '28px',
              height: '28px',
              borderRadius: 'var(--rounded-pill)',
              border: '1px solid var(--apple-hairline)',
              background: 'var(--apple-surface-card)',
              color: 'var(--apple-ink)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.06)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
          >
            <ZoomIn size={14} />
          </button>

          {/* Zoom Out Button */}
          <button
            type="button"
            onClick={handleZoomOut}
            title="Zoom Out"
            style={{
              width: '28px',
              height: '28px',
              borderRadius: 'var(--rounded-pill)',
              border: '1px solid var(--apple-hairline)',
              background: 'var(--apple-surface-card)',
              color: 'var(--apple-ink)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.06)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
          >
            <ZoomOut size={14} />
          </button>

          {/* Reset / Fit Content View */}
          <button
            type="button"
            onClick={handleResetFit}
            title="Reset Zoom & Fit Content (or double click chart)"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              border: '1px solid var(--apple-hairline)',
              background: 'var(--apple-surface-card)',
              color: 'var(--apple-ink)',
              padding: '4px 10px',
              borderRadius: 'var(--rounded-pill)',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.04)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'none')}
          >
            <RotateCcw size={12} />
            <span>Fit</span>
          </button>
        </div>
      </div>

      {/* Main Interactive TradingView Canvas Container */}
      <div
        ref={chartContainerRef}
        onDoubleClick={handleResetFit}
        style={{
          width: '100%',
          height: '420px',
          position: 'relative',
          cursor: 'crosshair',
        }}
      />

      {/* Bottom Subtle Interaction Guide */}
      <div
        style={{
          padding: '6px 16px',
          borderTop: '1px solid var(--apple-hairline-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '11px',
          color: 'var(--apple-body-muted)',
          background: isDark ? 'rgba(0, 0, 0, 0.15)' : 'rgba(0, 0, 0, 0.015)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>Scroll to zoom</span>
          <span>•</span>
          <span>Drag to pan</span>
          <span>•</span>
          <span>Drag price / time axes to scale</span>
          <span>•</span>
          <span>Double-click to reset</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.8 }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: colors.bullish }} />
          <span>Live Angel One Feed</span>
        </div>
      </div>
    </div>
  );
};
