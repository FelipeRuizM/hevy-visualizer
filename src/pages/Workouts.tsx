import React, { useMemo, useState } from 'react';
import { Card } from '../components/common/Card';
import { useSettings } from '../context/SettingsContext';
import type { SplitType } from '../utils/workoutInference';
import { format } from 'date-fns';
import { ChevronDown, ChevronUp } from 'lucide-react';

const WorkoutCard = ({ session, unit, updateSplit }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const multiplier = unit === 'lbs' ? 2.20462 : 1;
  const sessionId = session.startTime.getTime().toString();

  return (
    <Card style={{ cursor: 'pointer', transition: 'all 0.3s ease' }} >
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: isOpen ? '1px solid var(--glass-border)' : 'none', paddingBottom: isOpen ? '16px' : '0' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h3 style={{ fontSize: '20px', fontFamily: 'Outfit', margin: 0 }}>{session.title || 'Workout'}</h3>
              {isOpen ? <ChevronUp size={18} color="var(--accent-pink-main)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
            </div>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              {format(session.startTime, 'EEEE, MMM do yyyy - h:mm a')}
            </span>
          </div>
          
          <div onClick={e => e.stopPropagation()}>
            <select 
              value={session.splitType} 
              onChange={(e) => updateSplit(sessionId, e.target.value as SplitType)}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'var(--accent-pink-main)',
                border: '1px solid var(--glass-border)',
                padding: '6px 12px',
                borderRadius: '8px',
                fontFamily: 'Inter',
                fontWeight: 'bold',
                outline: 'none',
                cursor: 'pointer',
                appearance: 'auto'
              }}
            >
              <option value="Push" style={{background: 'var(--bg-dark)'}}>Push</option>
              <option value="Pull" style={{background: 'var(--bg-dark)'}}>Pull</option>
              <option value="Legs" style={{background: 'var(--bg-dark)'}}>Legs</option>
              <option value="Mixed" style={{background: 'var(--bg-dark)'}}>Mixed</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', paddingTop: isOpen ? '0' : '4px' }}>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Duration</span>
            <div style={{ fontSize: '18px', fontWeight: 'bold', fontFamily: 'Inter' }}>{Math.round(session.durSeconds / 60)} min</div>
          </div>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Volume</span>
            <div style={{ fontSize: '18px', fontWeight: 'bold', fontFamily: 'Inter' }}>{Math.round(session.volume * multiplier).toLocaleString()} {unit}</div>
          </div>
        </div>

        {isOpen && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '16px' }} onClick={(e) => e.stopPropagation()}>
            {Array.from(session.exercises.entries()).map(([exTitle, sets]: any) => (
              <div key={exTitle}>
                <h4 style={{ fontSize: '15px', color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '4px', height: '14px', background: 'var(--accent-gradient)', borderRadius: '4px' }} />
                  {exTitle}
                </h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingLeft: '12px' }}>
                  {sets.map((set: any, idx: number) => {
                    const displayWeight = Math.round(set.weightKg * multiplier);
                    return (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', padding: '6px 0', borderBottom: '1px dashed rgba(255,255,255,0.05)' }}>
                        <span style={{ color: 'var(--text-secondary)', width: '60px' }}>Set {idx + 1}</span>
                        <span style={{ fontWeight: '500', fontFamily: 'Inter', width: '120px' }}>
                          {displayWeight} {unit} <span style={{ color: 'var(--text-muted)', margin: '0 4px' }}>×</span> {set.reps} reps
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export const Workouts: React.FC<any> = ({ workouts, updateSplit }) => {
  const sessions = useMemo(() => {
    const map = new Map<string, { startTime: Date, title: string, splitType: SplitType, volume: number, durSeconds: number, exercises: Map<string, any[]> }>();
    
    workouts.forEach((w: any) => {
      const sessionId = w.startTime.getTime().toString();
      const s = map.get(sessionId) || { 
        startTime: w.startTime, 
        title: w.title, 
        splitType: w.splitType,
        volume: 0, 
        durSeconds: 0, 
        exercises: new Map<string, any[]>() 
      };
      
      s.volume += (w.weightKg * w.reps);

      let ds = w.durationSeconds;
      if (!ds && w.endTime && w.startTime) {
        ds = (w.endTime.getTime() - w.startTime.getTime()) / 1000;
      }
      if (ds > s.durSeconds) s.durSeconds = ds;
      
      const exArray = s.exercises.get(w.exerciseTitle) || [];
      exArray.push(w);
      s.exercises.set(w.exerciseTitle, exArray);

      map.set(sessionId, s);
    });

    return Array.from(map.values()).sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
  }, [workouts]);

  const { unit } = useSettings();

  return (
    <div style={{ padding: '24px', animation: 'fadeIn 0.5s ease-out', paddingBottom: '64px', maxWidth: '1200px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      <h2 style={{ marginBottom: '24px', letterSpacing: '-0.02em', fontFamily: 'Outfit' }}>Workout History</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
        {sessions.map(session => (
           <WorkoutCard 
              key={session.startTime.getTime().toString()} 
              session={session} 
              unit={unit} 
              updateSplit={updateSplit} 
           />
        ))}
        {sessions.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
            No workouts logged yet.
          </div>
        )}
      </div>
    </div>
  );
};
