import React from 'react';
import { OverviewMetrics } from '../components/dashboard/OverviewMetrics';
import { VolumeChart } from '../components/dashboard/VolumeChart';
import { MuscleChart } from '../components/dashboard/MuscleChart';
import type { WorkoutSet } from '../utils/csvParser';

interface Props {
  workouts: WorkoutSet[];
}

export const Dashboard: React.FC<Props> = ({ workouts }) => {
  return (
    <div style={{ padding: '0 32px', animation: 'fadeIn 0.5s ease-out' }}>
      <h2 style={{ marginBottom: '24px', letterSpacing: '-0.02em', fontFamily: 'Outfit' }}>Analytics Overview</h2>
      <OverviewMetrics workouts={workouts} />
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '24px',
        marginBottom: '24px'
      }}>
         <div style={{ gridColumn: '1 / -1', '@media (min-width: 1200px)': { gridColumn: 'auto / span 2' } } as any}>
           <VolumeChart workouts={workouts} />
         </div>
         <div style={{ gridColumn: '1 / -1', '@media (min-width: 1200px)': { gridColumn: 'auto' } } as any}>
           <MuscleChart workouts={workouts} />
         </div>
      </div>
    </div>
  );
};
