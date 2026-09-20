import React from 'react';
import { MiniSparkline } from './MiniSparkline';
import { useStock } from '../context/StockContext';

export const StockListItem = ({ stock }) => {
  const { selectedSymbol, setSelectedSymbol } = useStock();
  const isSelected = selectedSymbol === stock.symbol;
  const isPositive = stock.change >= 0;

  // Multi-point seed data from low, high, open and close
  const sparkData = [
    stock.open,
    stock.open + (stock.low - stock.open) * 0.7,
    stock.low,
    stock.open + (stock.high - stock.open) * 0.4,
    stock.high - (stock.high - stock.low) * 0.2,
    stock.high,
    stock.price,
  ];

  return (
    <div
      onClick={() => setSelectedSymbol(stock.symbol)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 14px',
        margin: '2px 8px',
        borderRadius: 'var(--radius-md)',
        cursor: 'pointer',
        backgroundColor: isSelected ? 'var(--apple-surface-selected)' : 'transparent',
        transition: 'background-color 0.12s ease',
        userSelect: 'none',
      }}
      onMouseEnter={(e) => {
        if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--apple-surface-hover)';
      }}
      onMouseLeave={(e) => {
        if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      {/* Ticker & Name */}
      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, paddingRight: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--apple-ink)' }}>
            {stock.symbol.replace('.NS', '')}
          </span>
          <span
            style={{
              fontSize: '10px',
              padding: '1px 5px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--apple-surface-secondary)',
              color: 'var(--apple-ink-secondary)',
              fontWeight: 600,
            }}
          >
            {stock.exchange}
          </span>
        </div>
        <span
          style={{
            fontSize: '12px',
            color: 'var(--apple-ink-secondary)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            marginTop: '2px',
            maxWidth: '140px',
          }}
        >
          {stock.name}
        </span>
      </div>

      {/* Mini Sparkline Chart */}
      <div style={{ padding: '0 8px' }}>
        <MiniSparkline
          data={sparkData}
          isPositive={isPositive}
          width={60}
          height={24}
          symbol={stock.symbol}
        />
      </div>

      {/* Price & Change Pill */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--apple-ink)' }}>
          ₹{stock.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </span>
        <div
          style={{
            marginTop: '3px',
            padding: '2px 7px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: isPositive ? 'var(--apple-green)' : 'var(--apple-red)',
            color: '#ffffff',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '-0.2px',
          }}
        >
          {isPositive ? `+${stock.changePercent.toFixed(2)}%` : `${stock.changePercent.toFixed(2)}%`}
        </div>
      </div>
    </div>
  );
};
