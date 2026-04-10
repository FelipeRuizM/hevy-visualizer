import React from 'react';
import { Card } from '../common/Card';
import './FilterBar.css';

export type TimeframeFilter = 'All Time' | 'Last Week' | 'Last Month' | 'Last 3 Months' | 'Last Year';

interface Props {
  selectedCategories: string[];
  setSelectedCategories: (s: string[]) => void;
  timeframeFilter: TimeframeFilter;
  setTimeframeFilter: (t: TimeframeFilter) => void;
}

export const FilterBar: React.FC<Props> = ({ selectedCategories, setSelectedCategories, timeframeFilter, setTimeframeFilter }) => {
  const categories = ['Push', 'Pull', 'Legs', 'Mixed'];
  const timeframes: TimeframeFilter[] = ['All Time', 'Last Week', 'Last Month', 'Last 3 Months', 'Last Year'];

  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter(c => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

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
          {categories.map(c => (
            <button key={c} onClick={() => toggleCategory(c)} style={btnStyle(selectedCategories.includes(c) || selectedCategories.length === 0)}>
              {c}
            </button>
          ))}
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginLeft: 'auto' }}>
        <span style={{ fontFamily: 'Outfit', fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 600 }}>TIMEFRAME</span>
        <select 
          value={timeframeFilter} 
          onChange={(e) => setTimeframeFilter(e.target.value as TimeframeFilter)}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            color: 'var(--accent-pink-main)',
            border: '1px solid var(--glass-border)',
            padding: '8px 16px',
            borderRadius: '12px',
            fontFamily: 'Inter',
            fontWeight: '600',
            fontSize: '14px',
            outline: 'none',
            cursor: 'pointer',
            appearance: 'auto'
          }}
        >
          {timeframes.map(t => (
            <option key={t} value={t} style={{background: 'var(--bg-dark)'}}>{t}</option>
          ))}
        </select>
      </div>
    </Card>
  );
};
