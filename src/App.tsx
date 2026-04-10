import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { Settings } from './pages/Settings';
import { Workouts } from './pages/Workouts';
import { PersonalRecords } from './pages/PersonalRecords';
import { useWorkouts } from './hooks/useWorkouts';
import './App.css';

function App() {
  const { workouts, loading } = useWorkouts();

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
          <div style={{ fontFamily: 'Outfit', fontSize: '24px', letterSpacing: '4px', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'pulse 1.5s infinite', opacity: 0.8 }}>
            HEVY
          </div>
          <p style={{ marginTop: '16px', color: 'var(--text-muted)' }}>Synching Backend...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Dashboard workouts={workouts} />} />
        <Route path="workouts" element={<Workouts workouts={workouts} />} />
        <Route path="records" element={<PersonalRecords workouts={workouts} />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default App;
