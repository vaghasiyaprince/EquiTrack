import React, { useState } from 'react';
import { StockChart } from './StockChart';
import { useStock } from '../context/StockContext';
import { Bookmark, BookmarkCheck, ArrowLeft } from 'lucide-react';

export const StockDetail = ({ onBackMobile }) => {
  const { selectedStock, timeframe, setTimeframe, isInWatchlist, toggleWatchlist } = useStock();
  const [scrubbedData, setScrubbedData] = useState(null);

  if (!selectedStock) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: 'var(--apple-ink-secondary)' }}>
        Select a stock to view details
      </div>
    );
  }

  const isSaved = isInWatchlist(selectedStock.symbol);
  const isPositive = selectedStock.change >= 0;

  // Active price display (switches to scrubbed point if user is dragging/hovering on chart)
  const displayPrice = scrubbedData ? scrubbedData.price : selectedStock.price;
  const displayDiff = displayPrice - selectedStock.open;
  const displayDiffPercent = ((displayDiff / selectedStock.open) * 100);
  const isDisplayPositive = displayDiff >= 0;

  const timeframes = ['1D', '1W', '1M', '1Y'];

  return (
    <div
      style={{
        flex: 1,
        height: '100%',
        overflowY: 'auto',
        backgroundColor: 'var(--apple-canvas)',
        padding: '20px 24px 40px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top Header with Back button for mobile */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {onBackMobile && (
            <button
              onClick={onBackMobile}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'var(--apple-surface-secondary)',
                color: 'var(--apple-ink)',
                border: '1px solid var(--apple-hairline)',
              }}
            >
              <ArrowLeft size={18} />
            </button>
          )}

          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' }}>
              <h1
                style={{
                  fontSize: '32px',
                  fontWeight: 700,
                  letterSpacing: '-0.8px',
                  color: 'var(--apple-ink)',
                  lineHeight: 1.1,
                }}
              >
                {selectedStock.symbol.replace('.NS', '')}
              </h1>
              <span
                style={{
                  fontSize: '17px',
                  color: 'var(--apple-ink-secondary)',
                  fontWeight: 400,
                }}
              >
                {selectedStock.name}
              </span>
            </div>

            <div
              style={{
                fontSize: '13px',
                color: 'var(--apple-ink-secondary)',
                marginTop: '4px',
                display: 'flex',
                gap: '6px',
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              <span>{selectedStock.exchange} · India</span>
              <span>•</span>
              <span>INR (₹)</span>
              <span>•</span>
              <span>{selectedStock.category}</span>
            </div>
          </div>
        </div>

        {/* Action Button: Bookmark to Watchlist */}
        <button
          onClick={() => toggleWatchlist(selectedStock.symbol)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            borderRadius: 'var(--radius-pill)',
            backgroundColor: isSaved ? 'var(--apple-surface-selected)' : 'var(--apple-action-blue)',
            color: isSaved ? 'var(--apple-ink)' : '#ffffff',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            border: isSaved ? '1px solid var(--apple-border)' : 'none',
            whiteSpace: 'nowrap',
          }}
        >
          {isSaved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
          <span>{isSaved ? 'In Watchlist' : 'Add to Watchlist'}</span>
        </button>
      </div>

      {/* Large Live/Scrubbed Price Display */}
      <div style={{ marginTop: '20px', display: 'flex', alignItems: 'baseline', gap: '14px', flexWrap: 'wrap' }}>
        <div style={{ fontSize: '38px', fontWeight: 700, letterSpacing: '-0.6px', color: 'var(--apple-ink)' }}>
          ₹{displayPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '15px',
            fontWeight: 600,
            color: isDisplayPositive ? 'var(--apple-green)' : 'var(--apple-red)',
          }}
        >
          <span>{isDisplayPositive ? `+₹${displayDiff.toFixed(2)}` : `-₹${Math.abs(displayDiff).toFixed(2)}`}</span>
          <span>({isDisplayPositive ? `+${displayDiffPercent.toFixed(2)}%` : `${displayDiffPercent.toFixed(2)}%`})</span>
          <span style={{ fontSize: '12px', color: 'var(--apple-ink-secondary)', fontWeight: 400 }}>
            {scrubbedData ? scrubbedData.time : 'Today'}
          </span>
        </div>
      </div>

      {/* Timeframe Selector Pills (Apple Style) */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
          marginTop: '18px',
          marginBottom: '14px',
          borderBottom: '1px solid var(--apple-hairline)',
          paddingBottom: '12px',
        }}
      >
        {timeframes.map((tf) => {
          const isActive = timeframe === tf;
          return (
            <button
              key={tf}
              onClick={() => {
                setTimeframe(tf);
                setScrubbedData(null);
              }}
              style={{
                padding: '4px 16px',
                borderRadius: 'var(--radius-pill)',
                fontSize: '13px',
                fontWeight: isActive ? 700 : 500,
                backgroundColor: isActive ? 'var(--apple-surface-selected)' : 'transparent',
                color: isActive ? 'var(--apple-ink)' : 'var(--apple-ink-secondary)',
              }}
            >
              {tf}
            </button>
          );
        })}
      </div>

      {/* Interactive Apple Curve Chart */}
      <div style={{ margin: '6px 0 20px', minHeight: '260px' }}>
        <StockChart
          basePrice={selectedStock.price}
          timeframe={timeframe}
          isPositive={isPositive}
          onScrubPrice={setScrubbedData}
        />
      </div>

      {/* Financial Key Statistics Grid (SRS R.3.6) */}
      <div style={{ marginTop: '8px' }}>
        <h3
          style={{
            fontSize: '17px',
            fontWeight: 600,
            color: 'var(--apple-ink)',
            marginBottom: '12px',
            letterSpacing: '-0.2px',
          }}
        >
          Key Statistics
        </h3>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '12px',
            backgroundColor: 'var(--apple-surface-secondary)',
            padding: '16px 20px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--apple-hairline)',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', color: 'var(--apple-ink-secondary)' }}>Open</div>
            <div style={{ fontSize: '15px', fontWeight: 600, marginTop: '2px', color: 'var(--apple-ink)' }}>
              ₹{selectedStock.open.toFixed(2)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--apple-ink-secondary)' }}>High</div>
            <div style={{ fontSize: '15px', fontWeight: 600, marginTop: '2px', color: 'var(--apple-ink)' }}>
              ₹{selectedStock.high.toFixed(2)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--apple-ink-secondary)' }}>Low</div>
            <div style={{ fontSize: '15px', fontWeight: 600, marginTop: '2px', color: 'var(--apple-ink)' }}>
              ₹{selectedStock.low.toFixed(2)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--apple-ink-secondary)' }}>52W High</div>
            <div style={{ fontSize: '15px', fontWeight: 600, marginTop: '2px', color: 'var(--apple-ink)' }}>
              ₹{selectedStock.wk52High.toFixed(2)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--apple-ink-secondary)' }}>52W Low</div>
            <div style={{ fontSize: '15px', fontWeight: 600, marginTop: '2px', color: 'var(--apple-ink)' }}>
              ₹{selectedStock.wk52Low.toFixed(2)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--apple-ink-secondary)' }}>Volume</div>
            <div style={{ fontSize: '15px', fontWeight: 600, marginTop: '2px', color: 'var(--apple-ink)' }}>
              {selectedStock.vol}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--apple-ink-secondary)' }}>Market Cap</div>
            <div style={{ fontSize: '15px', fontWeight: 600, marginTop: '2px', color: 'var(--apple-ink)' }}>
              ₹{selectedStock.mktCap}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--apple-ink-secondary)' }}>P/E Ratio</div>
            <div style={{ fontSize: '15px', fontWeight: 600, marginTop: '2px', color: 'var(--apple-ink)' }}>
              {selectedStock.pe}
            </div>
          </div>
        </div>
      </div>

      {/* About Company (SRS R.3.6) */}
      <div style={{ marginTop: '24px' }}>
        <h3
          style={{
            fontSize: '17px',
            fontWeight: 600,
            color: 'var(--apple-ink)',
            marginBottom: '8px',
            letterSpacing: '-0.2px',
          }}
        >
          About {selectedStock.name}
        </h3>
        <p
          style={{
            fontSize: '14px',
            lineHeight: 1.6,
            color: 'var(--apple-ink-secondary)',
          }}
        >
          {selectedStock.description}
        </p>
      </div>
    </div>
  );
};
