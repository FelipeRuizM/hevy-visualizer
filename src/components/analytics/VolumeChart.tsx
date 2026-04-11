import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell,
} from 'recharts';
import { Card } from '../common/Card';
import { useSettings } from '../../context/SettingsContext';
import { getWeeklyVolume } from '../../utils/workoutUtils';
import type { WorkoutSet } from '../../utils/csvParser';

interface Props {
  workouts: WorkoutSet[];
}

export const WeeklyVolumeChart: React.FC<Props> = ({ workouts }) => {
  const { unit } = useSettings();

  const weeklyBase = useMemo(() => getWeeklyVolume(workouts), [workouts]);

  const displayData = useMemo(() => {
    const multiplier = unit === 'lbs' ? 2.20462 : 1;
    return weeklyBase.map(d => ({
      label: d.label,
      volume: Math.round(d.volumeKg * multiplier),
    }));
  }, [weeklyBase, unit]);

  if (workouts.length === 0) {
    return (
      <Card style={{ height: '360px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-muted)', fontFamily: 'Outfit' }}>No data for this range</p>
      </Card>
    );
  }

  return (
    <Card style={{ height: '360px' }}>
      <h3 style={{ fontFamily: 'Outfit', fontSize: '16px', fontWeight: 600, marginBottom: '20px', color: 'var(--text-primary)' }}>
        Weekly Volume ({unit.toUpperCase()})
      </h3>
      <div style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={displayData} margin={{ top: 4, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="weeklyBarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent-pink-main)" stopOpacity={1} />
                <stop offset="100%" stopColor="var(--accent-pink-dark)" stopOpacity={0.7} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis
              dataKey="label"
              stroke="var(--text-muted)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval="preserveStartEnd"
            />
            <YAxis
              stroke="var(--text-muted)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--bg-darker)',
                border: '1px solid var(--glass-border)',
                borderRadius: '12px',
                fontFamily: 'Outfit',
              }}
              itemStyle={{ color: 'var(--accent-pink-main)', fontWeight: 'bold' }}
              labelStyle={{ color: 'var(--text-secondary)', marginBottom: '4px' }}
              formatter={(value: unknown) => [`${Number(value).toLocaleString()} ${unit}`, 'Volume']}
            />
            <Bar dataKey="volume" fill="url(#weeklyBarGradient)" radius={[4, 4, 0, 0]} maxBarSize={40}>
              {displayData.map((_entry, index) => (
                <Cell key={index} fill="url(#weeklyBarGradient)" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
