import React from 'react';
import { Card } from '../common/Card';
import type { SplitType } from '../../utils/workoutInference';
import './FilterBar.css';

export type SplitFilter = SplitType | 'All';
export type TimeframeFilter = 'All Time' | 'Last Week' | 'Last Month' | 'Last 3 Months' | 'Last Year';

interface Props {
  splitFilter: SplitFilter;
  setSplitFilter: (s: SplitFilter) => void;
  timeframeFilter: TimeframeFilter;
  setTimeframeFilter: (t: TimeframeFilter) => void;
}

export const FilterBar: React.FC<Props> = ({ splitFilter, setSplitFilter, timeframeFilter, setTimeframeFilter }) => {
  const splits: SplitFilter[] = ['All', 'Push', 'Pull', 'Legs', 'Mixed'];
  const timeframes: TimeframeFilter[] = ['All Time', 'Last Week', 'Last Month', 'Last 3 Months', 'Last Year'];

  const btnStyle = (isActive: boolean) => ({
    background: isActive ? 'var(--accent-pink-main)' : 'rgba(255,255,255,0.05)',
    color: isActive ? '#FFF' : 'var(--text-secondary)',
    border: isActive ? '1px solid var(--accent-pink-light)' : '1px solid var(--glass-border)',
    padding: '6px 14px',
    borderRadius: '20px',
    cursor: 'pointer',
    fontFamily: 'Inter',
    fontSize: '12px',
    fontWeight: '600' as const,
    transition: 'all 0.2s ease',
    boxShadow: isActive ? '0 0 10px rgba(255,46,147,0.3)' : 'none'
  });

  return (
    <Card style={{ padding: '16px 24px', marginBottom: '24px', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
      
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <span style={{ fontFamily: 'Outfit', fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 600 }}>SPLIT</span>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {splits.map(s => (
            <button key={s} onClick={() => setSplitFilter(s)} style={btnStyle(splitFilter === s)}>
              {s}
            </button>
          ))}
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <span style={{ fontFamily: 'Outfit', fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 600 }}>TIMEFRAME</span>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {timeframes.map(t => (
            <button key={t} onClick={() => setTimeframeFilter(t)} style={btnStyle(timeframeFilter === t)}>
              {t}
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
};
