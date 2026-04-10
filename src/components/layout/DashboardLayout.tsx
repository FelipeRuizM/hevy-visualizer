import React from 'react';
import { Sidebar } from './Sidebar';
import { TopNavigation } from './TopNavigation';
import { OverviewMetrics } from '../dashboard/OverviewMetrics';
import { VolumeChart } from '../dashboard/VolumeChart';
import { MuscleChart } from '../dashboard/MuscleChart';
import type { WorkoutSet } from '../../utils/csvParser';
import './DashboardLayout.css';

interface DashboardProps {
  workouts: WorkoutSet[];
}

export const DashboardLayout: React.FC<DashboardProps> = ({ workouts }) => {
  return (
    <div className="dashboard-layout fade-in">
      <Sidebar />
      <div className="dashboard-main">
        <TopNavigation />
        <main className="dashboard-content">
          <OverviewMetrics workouts={workouts} />
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
            gap: '24px',
            marginBottom: '24px'
          }}>
             <div style={{ gridColumn: 'auto / span 2' /* Span wider roughly if space permits */ }}>
               <VolumeChart workouts={workouts} />
             </div>
             <div>
               <MuscleChart workouts={workouts} />
             </div>
          </div>
        </main>
      </div>
    </div>
  );
};
