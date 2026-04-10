import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Dashboard } from './pages/Dashboard';
import { Settings } from './pages/Settings';
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
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Dashboard workouts={workouts} />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default App;
