import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell,
} from 'recharts';
import { Card } from '../common/Card';
import { useSettings } from '../../context/SettingsContext';
import { getTopExercises } from '../../utils/workoutUtils';
import type { WorkoutSet } from '../../utils/csvParser';

interface Props {
  workouts: WorkoutSet[];
}

// Gradient from deep purple → accent pink across top 10 bars
const BAR_COLORS = [
  '#FF2E93',
  '#E8239E',
  '#CC1AA9',
  '#B011B3',
  '#9D00FF',
  '#8B00EE',
  '#7800DD',
  '#6600CC',
  '#5400BB',
  '#4200AA',
];

export const TopExercisesChart: React.FC<Props> = ({ workouts }) => {
  const { unit } = useSettings();

  const chartData = useMemo(() => {
    const multiplier = unit === 'lbs' ? 2.20462 : 1;
    return getTopExercises(workouts, 10).map(e => ({
      name: e.exerciseTitle.length > 22
        ? e.exerciseTitle.slice(0, 20) + '…'
        : e.exerciseTitle,
      volume: Math.round(e.volumeKg * multiplier),
    }));
  }, [workouts, unit]);

  if (workouts.length === 0) {
    return (
      <Card style={{ height: '420px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-muted)', fontFamily: 'Outfit' }}>No data for this range</p>
      </Card>
    );
  }

  return (
    <Card style={{ height: '420px' }}>
      <h3 style={{ fontFamily: 'Outfit', fontSize: '16px', fontWeight: 600, marginBottom: '20px', color: 'var(--text-primary)' }}>
        Top Exercises by Volume ({unit.toUpperCase()})
      </h3>
      <div style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 4, right: 24, left: 8, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.05)"
              horizontal={false}
            />
            <XAxis
              type="number"
              stroke="var(--text-muted)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
            />
            <YAxis
              type="category"
              dataKey="name"
              stroke="var(--text-muted)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              width={115}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--bg-darker)',
                border: '1px solid var(--glass-border)',
                borderRadius: '12px',
                fontFamily: 'Outfit',
              }}
              itemStyle={{ color: '#9D00FF', fontWeight: 'bold' }}
              labelStyle={{ color: 'var(--text-secondary)', marginBottom: '4px' }}
              formatter={(value: unknown) => [`${Number(value).toLocaleString()} ${unit}`, 'Volume']}
            />
            <Bar dataKey="volume" radius={[0, 4, 4, 0]} maxBarSize={26}>
              {chartData.map((_entry, index) => (
                <Cell key={index} fill={BAR_COLORS[index % BAR_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};
