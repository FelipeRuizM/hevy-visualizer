import React, { useMemo } from 'react';
import { Card } from '../common/Card';
import type { WorkoutSet } from '../../utils/csvParser';

interface Props {
  workouts: WorkoutSet[];
}

export const OverviewMetrics: React.FC<Props> = ({ workouts }) => {
  const metrics = useMemo(() => {
    if (workouts.length === 0) return { avgVol: 0, avgDur: 0, avgSets: 0 };
    
    // Group by unique session. Using startTime works beautifully.
    const sessions = new Map<string, { vol: number, dur: number, sets: number }>();
    
    workouts.forEach(w => {
      const sessionId = w.startTime.getTime().toString();
      const existing = sessions.get(sessionId) || { vol: 0, dur: 0, sets: 0 };
      
      const setVol = w.weightKg * w.reps;
      
      let dur = w.durationSeconds;
      if (!dur && w.endTime && w.startTime) {
        dur = (w.endTime.getTime() - w.startTime.getTime()) / 1000;
      }
      
      sessions.set(sessionId, {
        vol: existing.vol + setVol,
        dur: dur > existing.dur ? dur : existing.dur, // Record highest duration
        sets: existing.sets + 1
      });
    });

    let totalVol = 0;
    let totalDur = 0;
    let totalSets = 0;
    
    sessions.forEach(s => {
      totalVol += s.vol;
      totalDur += s.dur;
      totalSets += s.sets;
    });

    const sessionCount = sessions.size;
    
    return {
      avgVol: sessionCount ? Math.round(totalVol / sessionCount) : 0,
      avgDur: sessionCount ? Math.round(totalDur / sessionCount / 60) : 0, // in minutes
      avgSets: sessionCount ? Math.round(totalSets / sessionCount) : 0
    };
  }, [workouts]);

  const valueStyle = {
    fontFamily: 'Inter, sans-serif', 
    fontSize: '42px', 
    fontWeight: 'bold', 
    background: 'var(--accent-gradient)', 
    WebkitBackgroundClip: 'text', 
    WebkitTextFillColor: 'transparent', 
    WebkitBoxDecorationBreak: 'clone' as const
  };

  const labelStyle = {
    fontFamily: 'Outfit, sans-serif', 
    color: 'var(--text-secondary)', 
    fontSize: '14px', 
    textTransform: 'uppercase' as const, 
    letterSpacing: '0.05em', 
    marginBottom: '8px'
  };

  const unitStyle = {
    fontSize: '18px', 
    WebkitTextFillColor: 'var(--text-muted)'
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '24px' }}>
      <Card>
        <div style={labelStyle}>Avg Volume / Session</div>
        <div style={valueStyle}>
          {metrics.avgVol.toLocaleString()} <span style={unitStyle}>kg</span>
        </div>
      </Card>

      <Card>
        <div style={labelStyle}>Avg Session Time</div>
        <div style={valueStyle}>
          {metrics.avgDur} <span style={unitStyle}>min</span>
        </div>
      </Card>

      <Card>
        <div style={labelStyle}>Avg Sets / Session</div>
        <div style={valueStyle}>
          {metrics.avgSets} <span style={unitStyle}>sets</span>
        </div>
      </Card>
    </div>
  );
};
