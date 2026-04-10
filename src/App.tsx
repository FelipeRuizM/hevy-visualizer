import React, { useEffect, useState } from 'react';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { fetchAndParseWorkouts, type WorkoutSet } from './utils/csvParser';
import './App.css';

function App() {
  const [workouts, setWorkouts] = useState<WorkoutSet[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("Fetching and parsing workout data...");
        const data = await fetchAndParseWorkouts();
        setWorkouts(data);
        console.log("Successfully parsed data:", data);
      } catch (err) {
        console.error("Failed to fetch or parse workouts:", err);
      }
    };
    
    loadData();
  }, []);

  return (
    <DashboardLayout workouts={workouts} />
  );
}

export default App;
