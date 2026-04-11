import React, { useState, useMemo } from 'react';
import { subDays, subYears } from 'date-fns';
import { WeeklyVolumeChart } from '../components/analytics/VolumeChart';
import { FrequencyChart } from '../components/analytics/FrequencyChart';
import { TopExercisesChart } from '../components/analytics/TopExercisesChart';
import { useSettings } from '../context/SettingsContext';
import type { TaggedWorkout } from '../hooks/useWorkouts';
import './Analytics.css';

type TimeRange = '30d' | '90d' | '180d' | '1y' | 'All';

interface Props {
  workouts: TaggedWorkout[];
}

const TIME_RANGES: { key: TimeRange; label: string }[] = [
  { key: '30d', label: '30D' },
  { key: '90d', label: '90D' },
  { key: '180d', label: '180D' },
  { key: '1y', label: '1Y' },
  { key: 'All', label: 'All' },
];

function getDateCutoff(range: TimeRange): Date | null {
  const now = new Date();
  if (range === '30d') return subDays(now, 30);
  if (range === '90d') return subDays(now, 90);
  if (range === '180d') return subDays(now, 180);
  if (range === '1y') return subYears(now, 1);
  return null;
}

export const Analytics: React.FC<Props> = ({ workouts }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('90d');
  const { unit } = useSettings();

  // Memoized time-filtered slice — only recomputes when range or raw data changes
  const filteredWorkouts = useMemo(() => {
    const cutoff = getDateCutoff(timeRange);
    if (!cutoff) return workouts;
    return workouts.filter(w => w.startTime >= cutoff);
  }, [workouts, timeRange]);

  // Key metrics derived from filtered workouts
  const metrics = useMemo(() => {
    const multiplier = unit === 'lbs' ? 2.20462 : 1;
    const sessions = new Set(filteredWorkouts.map(w => w.id));
    const totalVolumeKg = filteredWorkouts.reduce((sum, w) => sum + w.weightKg * w.reps, 0);
    const totalReps = filteredWorkouts.reduce((sum, w) => sum + w.reps, 0);
    const avgReps = filteredWorkouts.length > 0
      ? Math.round(totalReps / filteredWorkouts.length)
      : 0;

    return {
      totalWorkouts: sessions.size,
      totalVolume: Math.round(totalVolumeKg * multiplier),
      avgReps,
    };
  }, [filteredWorkouts, unit]);

  const fmtVolume = (v: number) =>
    v >= 1_000_000
      ? `${(v / 1_000_000).toFixed(1)}M`
      : v >= 1000
      ? `${(v / 1000).toFixed(1)}k`
      : String(v);

  return (
    <div className="analytics-page" style={{ animation: 'fadeIn 0.5s ease-out' }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="analytics-header">
        <h2 className="analytics-title">Analytics</h2>
        <div className="analytics-time-selector">
          {TIME_RANGES.map(({ key, label }) => (
            <button
              key={key}
              className={`time-range-btn ${timeRange === key ? 'active' : ''}`}
              onClick={() => setTimeRange(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Key Metrics ────────────────────────────────────────── */}
      <div className="analytics-metrics-row">
        <div className="analytics-metric-card glass-panel">
          <span className="metric-label">Total Workouts</span>
          <span className="metric-value">{metrics.totalWorkouts}</span>
        </div>
        <div className="analytics-metric-card glass-panel">
          <span className="metric-label">Total Volume</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span className="metric-value">{fmtVolume(metrics.totalVolume)}</span>
            <span className="metric-unit">{unit.toUpperCase()}</span>
          </div>
        </div>
        <div className="analytics-metric-card glass-panel">
          <span className="metric-label">Avg Reps / Set</span>
          <span className="metric-value">{metrics.avgReps}</span>
        </div>
      </div>

      {/* ── Charts Grid ────────────────────────────────────────── */}
      <div className="analytics-charts-grid">
        <WeeklyVolumeChart workouts={filteredWorkouts} />
        <FrequencyChart workouts={filteredWorkouts} />
        <div className="analytics-charts-full">
          <TopExercisesChart workouts={filteredWorkouts} />
        </div>
      </div>

    </div>
  );
};
