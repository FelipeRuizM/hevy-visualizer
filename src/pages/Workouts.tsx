import React, { useMemo, useState } from 'react';
import { Card } from '../components/common/Card';
import { useSettings } from '../context/SettingsContext';
import { format } from 'date-fns';
import { ChevronDown, ChevronUp, Plus, X } from 'lucide-react';
import { ref, update, push } from 'firebase/database';
import { realtimeDb } from '../config/firebase';

// ── Logger types ──────────────────────────────────────────────
interface LogSet {
  setType: 'normal' | 'warmup' | 'dropset' | 'failure';
  weight: number;
  reps: number;
}
interface LogExercise {
  exerciseTitle: string;
  sets: LogSet[];
}

const SET_TYPES: { key: LogSet['setType']; label: string; color: string }[] = [
  { key: 'normal',  label: '#', color: 'var(--text-primary)' },
  { key: 'warmup',  label: 'W', color: '#F59E0B' },
  { key: 'dropset', label: 'D', color: '#3B82F6' },
  { key: 'failure', label: 'F', color: '#EF4444' },
];

// ── Shared inline styles ──────────────────────────────────────
const inputStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  color: '#fff',
  borderRadius: '10px',
  padding: '10px 14px',
  fontFamily: 'Inter',
  fontSize: '14px',
  outline: 'none',
  width: '100%',
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: 'auto' as const,
  cursor: 'pointer',
};

// ── WorkoutCard (historical) ──────────────────────────────────
const WorkoutCard = ({ session, unit }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const multiplier = unit === 'lbs' ? 2.20462 : 1;

  const handleCategoryChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory = e.target.value;
    if (!session.id) return;

    try {
      const workoutRef = ref(realtimeDb, `/${session.id}`);
      await update(workoutRef, { category: newCategory });

      setShowSavedToast(true);
      setTimeout(() => setShowSavedToast(false), 2000);
    } catch (err) {
      console.error('Error updating category in RTDB:', err);
    }
  };

  return (
    <Card style={{ position: 'relative', cursor: 'pointer', transition: 'all 0.3s ease' }}>
      <div style={{
        position: 'absolute',
        top: '16px',
        right: '16px',
        background: 'rgba(46, 204, 113, 0.1)',
        color: '#2ecc71',
        padding: '4px 8px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: 'bold',
        fontFamily: 'Inter',
        opacity: showSavedToast ? 1 : 0,
        pointerEvents: 'none',
        transition: 'opacity 0.3s ease',
        zIndex: 10
      }}>
        ✓ Saved
      </div>

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

          <div onClick={e => e.stopPropagation()} style={{ marginRight: '80px' }}>
            <select
              value={session.category || 'Mixed'}
              onChange={handleCategoryChange}
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

// ── Helper: set label ─────────────────────────────────────────
const getSetLabel = (sets: LogSet[], idx: number): string => {
  const s = sets[idx];
  if (s.setType !== 'normal') {
    return SET_TYPES.find(t => t.key === s.setType)?.label || '?';
  }
  let n = 0;
  for (let i = 0; i <= idx; i++) if (sets[i].setType === 'normal') n++;
  return n.toString();
};

const getSetColor = (type: LogSet['setType']) =>
  SET_TYPES.find(t => t.key === type)?.color || 'var(--text-primary)';

// ── Main page ─────────────────────────────────────────────────
export const Workouts: React.FC<any> = ({ workouts }) => {
  const { unit } = useSettings();

  // ── Historical sessions (existing logic, unchanged) ──
  const sessions = useMemo(() => {
    const map = new Map<string, { id: string, startTime: Date, title: string, category: string, volume: number, durSeconds: number, exercises: Map<string, any[]> }>();

    workouts.forEach((w: any) => {
      const sessionId = w.startTime.getTime().toString();
      const s = map.get(sessionId) || {
        id: w.id,
        startTime: w.startTime,
        title: w.title,
        category: w.category || 'Mixed',
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

  // ── Logger state ──
  const [isExpanded, setIsExpanded] = useState(false);
  const [logTitle, setLogTitle] = useState('Workout');
  const [logDateTime, setLogDateTime] = useState(() => {
    const d = new Date();
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  });
  const [logDuration, setLogDuration] = useState(60);
  const [logCategory, setLogCategory] = useState('Mixed');
  const [logExercises, setLogExercises] = useState<LogExercise[]>([]);
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // ── Unique exercises from dataset ──
  const uniqueExercises: string[] = useMemo(() => {
    const s = new Set<string>(workouts.map((w: any) => w.exerciseTitle as string));
    return Array.from(s).sort();
  }, [workouts]);

  const filteredExercises: string[] = useMemo(() => {
    const q = exerciseSearch.trim().toLowerCase();
    const list = q ? uniqueExercises.filter((e: string) => e.toLowerCase().includes(q)) : uniqueExercises;
    return list.filter((e: string) => !logExercises.some(le => le.exerciseTitle === e));
  }, [uniqueExercises, exerciseSearch, logExercises]);

  // ── Logger handlers ──
  const addExercise = (title: string) => {
    if (!title || logExercises.some(e => e.exerciseTitle === title)) return;
    setLogExercises(prev => [...prev, {
      exerciseTitle: title,
      sets: [{ setType: 'normal', weight: 0, reps: 0 }],
    }]);
    setExerciseSearch('');
    setShowDropdown(false);
  };

  const removeExercise = (idx: number) => {
    setLogExercises(prev => prev.filter((_, i) => i !== idx));
  };

  const updateSet = (exIdx: number, setIdx: number, field: keyof LogSet, value: any) => {
    setLogExercises(prev => prev.map((ex, ei) => {
      if (ei !== exIdx) return ex;
      return { ...ex, sets: ex.sets.map((s, si) => si === setIdx ? { ...s, [field]: value } : s) };
    }));
  };

  const cycleSetType = (exIdx: number, setIdx: number) => {
    const order: LogSet['setType'][] = ['normal', 'warmup', 'dropset', 'failure'];
    setLogExercises(prev => prev.map((ex, ei) => {
      if (ei !== exIdx) return ex;
      return {
        ...ex,
        sets: ex.sets.map((s, si) => {
          if (si !== setIdx) return s;
          const next = order[(order.indexOf(s.setType) + 1) % order.length];
          return { ...s, setType: next };
        }),
      };
    }));
  };

  const addSet = (exIdx: number) => {
    setLogExercises(prev => prev.map((ex, ei) => {
      if (ei !== exIdx) return ex;
      const last = ex.sets[ex.sets.length - 1];
      return { ...ex, sets: [...ex.sets, { setType: 'normal', weight: last?.weight || 0, reps: last?.reps || 0 }] };
    }));
  };

  const removeSet = (exIdx: number, setIdx: number) => {
    setLogExercises(prev => prev.map((ex, ei) => {
      if (ei !== exIdx || ex.sets.length <= 1) return ex;
      return { ...ex, sets: ex.sets.filter((_, si) => si !== setIdx) };
    }));
  };

  // ── Save to Realtime DB ──
  const saveWorkout = async () => {
    if (logExercises.length === 0) return;
    setIsSaving(true);

    const startTime = new Date(logDateTime);
    const endTime = new Date(startTime.getTime() + logDuration * 60000);
    const toKg = unit === 'lbs' ? 1 / 2.20462 : 1;

    const payload = {
      title: logTitle,
      start_time: format(startTime, 'd MMM yyyy, HH:mm'),
      end_time: format(endTime, 'd MMM yyyy, HH:mm'),
      category: logCategory,
      description: '',
      exercises: logExercises.map(ex => ({
        exercise_title: ex.exerciseTitle,
        exercise_notes: '',
        sets: ex.sets.map((s, i) => ({
          set_index: i + 1,
          set_type: s.setType,
          weight_kg: Math.round(s.weight * toKg * 100) / 100,
          reps: s.reps,
          duration_seconds: 0,
        })),
      })),
    };

    try {
      await push(ref(realtimeDb, '/'), payload);
      // reset
      setLogTitle('Workout');
      setLogDuration(60);
      setLogCategory('Mixed');
      setLogExercises([]);
      setExerciseSearch('');
      setIsExpanded(false);
      // fresh datetime
      const d = new Date();
      setLogDateTime(new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
      // toast
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.error('Error saving workout:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // ── Render ──
  return (
    <div style={{ padding: '24px', animation: 'fadeIn 0.5s ease-out', paddingBottom: '64px', maxWidth: '1200px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>

      {/* Success toast */}
      {showToast && (
        <div style={{
          position: 'fixed', bottom: '32px', left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(46, 204, 113, 0.15)', border: '1px solid rgba(46, 204, 113, 0.3)',
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          color: '#2ecc71', padding: '12px 28px', borderRadius: '12px',
          fontFamily: 'Inter', fontWeight: 600, fontSize: '14px',
          zIndex: 1000, animation: 'fadeIn 0.3s ease-out',
        }}>
          Workout saved successfully
        </div>
      )}

      {/* ─── Workout Logger ─── */}
      <div style={{
        background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)',
        border: isExpanded ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(255, 46, 147, 0.25)',
        boxShadow: isExpanded ? 'var(--glass-shadow)' : 'var(--glass-shadow), 0 0 20px rgba(255, 46, 147, 0.08)',
        borderRadius: '20px', marginBottom: '32px',
        transition: 'all 0.3s ease',
      }}>
        {/* Collapsed / Header bar */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '20px 24px', cursor: 'pointer', userSelect: 'none',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: isExpanded ? 'rgba(255, 46, 147, 0.15)' : 'var(--accent-gradient)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.3s ease',
            }}>
              <Plus size={20} color={isExpanded ? 'var(--accent-pink-main)' : '#fff'} style={{
                transform: isExpanded ? 'rotate(45deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s ease',
              }} />
            </div>
            <span style={{ fontFamily: 'Outfit', fontSize: '18px', fontWeight: 600 }}>
              {isExpanded ? 'Log New Workout' : 'Start Workout'}
            </span>
          </div>
          {isExpanded
            ? <ChevronUp size={20} color="var(--text-muted)" />
            : <ChevronDown size={20} color="var(--text-muted)" />}
        </div>

        {/* Expanded form */}
        {isExpanded && (
          <div style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* ── Metadata row ── */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px',
              borderTop: '1px solid var(--glass-border)', paddingTop: '20px',
            }}>
              <div>
                <label style={labelStyle}>Title</label>
                <input value={logTitle} onChange={e => setLogTitle(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Category</label>
                <select value={logCategory} onChange={e => setLogCategory(e.target.value)} style={selectStyle}>
                  <option value="Push" style={{ background: 'var(--bg-dark)' }}>Push</option>
                  <option value="Pull" style={{ background: 'var(--bg-dark)' }}>Pull</option>
                  <option value="Legs" style={{ background: 'var(--bg-dark)' }}>Legs</option>
                  <option value="Mixed" style={{ background: 'var(--bg-dark)' }}>Mixed</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Date & Time</label>
                <input type="datetime-local" value={logDateTime} onChange={e => setLogDateTime(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Duration (min)</label>
                <input type="number" min={1} value={logDuration} onChange={e => setLogDuration(Math.max(1, Number(e.target.value)))} style={inputStyle} />
              </div>
            </div>

            {/* ── Exercise search ── */}
            <div style={{ position: 'relative' }}>
              <label style={labelStyle}>Add Exercise</label>
              <input
                value={exerciseSearch}
                onChange={e => { setExerciseSearch(e.target.value); setShowDropdown(true); }}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                onKeyDown={e => { if (e.key === 'Enter' && filteredExercises.length > 0) addExercise(filteredExercises[0]); }}
                placeholder="Search exercises..."
                style={inputStyle}
              />
              {showDropdown && filteredExercises.length > 0 && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px',
                  background: 'rgba(15, 18, 25, 0.95)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px', maxHeight: '200px', overflowY: 'auto',
                  zIndex: 50, backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                }}>
                  {filteredExercises.map(ex => (
                    <div
                      key={ex}
                      onMouseDown={e => { e.preventDefault(); addExercise(ex); }}
                      style={{
                        padding: '10px 16px', cursor: 'pointer', fontSize: '14px', fontFamily: 'Inter',
                        color: 'var(--text-secondary)', borderBottom: '1px solid rgba(255,255,255,0.04)',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      {ex}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Exercise cards ── */}
            {logExercises.map((ex, exIdx) => (
              <div key={ex.exerciseTitle} style={{
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '16px', padding: '20px', position: 'relative',
              }}>
                {/* Exercise header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '4px', height: '18px', background: 'var(--accent-gradient)', borderRadius: '4px' }} />
                    <h4 style={{ fontFamily: 'Outfit', fontSize: '16px', margin: 0 }}>{ex.exerciseTitle}</h4>
                  </div>
                  <button onClick={() => removeExercise(exIdx)} style={{
                    background: 'rgba(239, 68, 68, 0.1)', border: 'none', borderRadius: '8px',
                    width: '30px', height: '30px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <X size={14} color="#EF4444" />
                  </button>
                </div>

                {/* Column headers */}
                <div style={{
                  display: 'grid', gridTemplateColumns: '52px 1fr 1fr 32px',
                  gap: '8px', padding: '0 0 8px', marginBottom: '8px',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                }}>
                  <span style={colHeaderStyle}>SET</span>
                  <span style={colHeaderStyle}>{unit.toUpperCase()}</span>
                  <span style={colHeaderStyle}>REPS</span>
                  <span />
                </div>

                {/* Set rows */}
                {ex.sets.map((s, sIdx) => (
                  <div key={sIdx} style={{
                    display: 'grid', gridTemplateColumns: '52px 1fr 1fr 32px',
                    gap: '8px', alignItems: 'center', marginBottom: '6px',
                  }}>
                    {/* Set type toggle */}
                    <button
                      onClick={() => cycleSetType(exIdx, sIdx)}
                      title="Click to change set type"
                      style={{
                        width: '40px', height: '40px', borderRadius: '10px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        background: s.setType !== 'normal' ? `${getSetColor(s.setType)}18` : 'rgba(255,255,255,0.04)',
                        color: getSetColor(s.setType),
                        fontWeight: 700, fontSize: '14px', fontFamily: 'Inter',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {getSetLabel(ex.sets, sIdx)}
                    </button>

                    {/* Weight input */}
                    <input
                      type="number"
                      min={0}
                      step="any"
                      value={s.weight || ''}
                      onChange={e => updateSet(exIdx, sIdx, 'weight', Number(e.target.value))}
                      placeholder="0"
                      style={{ ...inputStyle, padding: '10px 12px', textAlign: 'center', fontWeight: 600 }}
                    />

                    {/* Reps input */}
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={s.reps || ''}
                      onChange={e => updateSet(exIdx, sIdx, 'reps', Number(e.target.value))}
                      placeholder="0"
                      style={{ ...inputStyle, padding: '10px 12px', textAlign: 'center', fontWeight: 600 }}
                    />

                    {/* Remove set */}
                    {ex.sets.length > 1 ? (
                      <button onClick={() => removeSet(exIdx, sIdx)} style={{
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        opacity: 0.4, transition: 'opacity 0.15s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                      onMouseLeave={e => (e.currentTarget.style.opacity = '0.4')}
                      >
                        <X size={14} color="var(--text-muted)" />
                      </button>
                    ) : <span />}
                  </div>
                ))}

                {/* Add set button */}
                <button onClick={() => addSet(exIdx)} style={{
                  marginTop: '10px', width: '100%', padding: '10px',
                  background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.1)',
                  borderRadius: '10px', color: 'var(--text-secondary)',
                  fontFamily: 'Inter', fontSize: '13px', fontWeight: 500,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                >
                  <Plus size={14} /> Add Set
                </button>
              </div>
            ))}

            {/* Empty state */}
            {logExercises.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px 0', fontSize: '14px' }}>
                Search and add exercises above to get started.
              </div>
            )}

            {/* Save button */}
            <button
              onClick={saveWorkout}
              disabled={logExercises.length === 0 || isSaving}
              style={{
                width: '100%', padding: '14px',
                background: logExercises.length === 0 ? 'rgba(255,255,255,0.05)' : 'var(--accent-gradient)',
                border: 'none', borderRadius: '14px',
                color: logExercises.length === 0 ? 'var(--text-muted)' : '#fff',
                fontFamily: 'Outfit', fontSize: '16px', fontWeight: 600,
                cursor: logExercises.length === 0 ? 'not-allowed' : 'pointer',
                opacity: isSaving ? 0.6 : 1,
                transition: 'all 0.2s ease',
                letterSpacing: '0.02em',
              }}
            >
              {isSaving ? 'Saving...' : 'Save Workout'}
            </button>
          </div>
        )}
      </div>

      {/* ─── Workout History ─── */}
      <h2 style={{ marginBottom: '24px', letterSpacing: '-0.02em', fontFamily: 'Outfit' }}>Workout History</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
        {sessions.map(session => (
           <WorkoutCard
              key={session.startTime.getTime().toString()}
              session={session}
              unit={unit}
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

// ── Micro-styles ──────────────────────────────────────────────
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '12px', color: 'var(--text-muted)',
  textTransform: 'uppercase', letterSpacing: '0.06em',
  marginBottom: '6px', fontFamily: 'Inter',
};

const colHeaderStyle: React.CSSProperties = {
  fontSize: '11px', color: 'var(--text-muted)',
  textTransform: 'uppercase', letterSpacing: '0.06em',
  fontFamily: 'Inter', fontWeight: 600, textAlign: 'center',
};
