import React from 'react';
import { MiniSparkline } from './MiniSparkline';

export const MarketIndices = ({ indices = [] }) => {
  return (
    <div
      style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        padding: '12px 14px 10px',
        borderBottom: '1px solid var(--apple-hairline)',
        scrollbarWidth: 'none',
      }}
    >
      {indices.map((idx) => {
        const isPositive = idx.change >= 0;
        return (
          <div
            key={idx.symbol}
            style={{
              flex: '1 0 105px',
              backgroundColor: 'var(--apple-surface-secondary)',
              borderRadius: 'var(--radius-md)',
              padding: '8px 10px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              border: '1px solid var(--apple-hairline)',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--apple-ink)' }}>
              {idx.name}
            </div>
            <div style={{ margin: '4px 0' }}>
              <MiniSparkline data={idx.sparkline} isPositive={isPositive} width={75} height={16} />
            </div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--apple-ink)' }}>
              {idx.price.toLocaleString('en-IN')}
            </div>
            <div
              style={{
                fontSize: '10px',
                fontWeight: 600,
                color: isPositive ? 'var(--apple-green)' : 'var(--apple-red)',
              }}
            >
              {isPositive ? `+${idx.changePercent}%` : `${idx.changePercent}%`}
            </div>
          </div>
        );
      })}
    </div>
  );
};
