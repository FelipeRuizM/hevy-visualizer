import React, { useState, useMemo } from 'react';
import { OverviewMetrics } from '../components/dashboard/OverviewMetrics';
import { VolumeChart } from '../components/dashboard/VolumeChart';
import { MuscleChart } from '../components/dashboard/MuscleChart';
import { FilterBar, type TimeframeFilter } from '../components/dashboard/FilterBar';
import { subWeeks, subMonths, subYears } from 'date-fns';

export const Dashboard: React.FC<any> = ({ workouts }) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [timeframeFilter, setTimeframeFilter] = useState<TimeframeFilter>('All Time');

  const filteredWorkouts = useMemo(() => {
    return workouts.filter((w: any) => {
      if (selectedCategories.length > 0) {
        const cat = w.category || w.splitType || 'Mixed';
        if (!selectedCategories.includes(cat)) return false;
      }
      
      if (timeframeFilter !== 'All Time') {
        const now = new Date();
        let cutoff = new Date();
        
        if (timeframeFilter === 'Last Week') cutoff = subWeeks(now, 1);
        else if (timeframeFilter === 'Last Month') cutoff = subMonths(now, 1);
        else if (timeframeFilter === 'Last 3 Months') cutoff = subMonths(now, 3);
        else if (timeframeFilter === 'Last Year') cutoff = subYears(now, 1);
        
        if (w.startTime < cutoff) return false;
      }
      
      return true;
    });
  }, [workouts, selectedCategories, timeframeFilter]);

  return (
    <div style={{ padding: '0 32px', animation: 'fadeIn 0.5s ease-out' }}>
      
      <FilterBar 
        selectedCategories={selectedCategories} 
        setSelectedCategories={setSelectedCategories}
        timeframeFilter={timeframeFilter}
        setTimeframeFilter={setTimeframeFilter}
      />
      
      <h2 style={{ marginBottom: '24px', letterSpacing: '-0.02em', fontFamily: 'Outfit' }}>Analytics Overview</h2>
      <OverviewMetrics workouts={filteredWorkouts} />
      
      <div className="dashboard-charts-grid">
        <VolumeChart workouts={filteredWorkouts} />
        <MuscleChart workouts={filteredWorkouts} />
      </div>
    </div>
  );
};
