import React, { useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Pencil, Trophy, MapPin, HeartPulse, Users, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useSettings } from '../context/SettingsContext';
import { useExercises } from '../context/ExercisesContext';
import { useAuth } from '../context/AuthContext';
import { groupWorkoutSessions } from '../utils/sessions';
import {
  SET_TYPES,
  PR_TYPES,
  getSetLabel,
  getSetColor,
  getSetTypeName,
  getCategoryStyle,
  type SetType,
} from '../utils/workoutDisplay';
import { computeSetPRs, setPRKey, estimateOneRM, type SetPR } from '../utils/prEngine';
import { sortPeople } from '../utils/people';
import { metaTextStyle } from '../styles/typography';
import type { TaggedWorkout } from '../hooks/useWorkouts';
import './WorkoutDetail.css';

// Palette for the muscle-group volume split (shared with the dashboard chart).
const MUSCLE_COLORS = ['#FF2E93', '#9D00FF', '#00F0FF', '#FF85B3', '#4ADE80', '#F59E0B', '#5C677D'];

const PRBadge: React.FC<{ pr: SetPR }> = ({ pr }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', flexShrink: 0, flexWrap: 'wrap' }}>
    {PR_TYPES.filter(t => pr[t.key]).map(t => {
      const Icon = t.icon;
      return (
        <span
          key={t.key}
          title={t.description}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            background: `${t.color}1F`, color: t.color,
            border: `1px solid ${t.color}59`, borderRadius: '999px',
            padding: '2px 8px', fontSize: '10px', fontWeight: 700,
            fontFamily: 'Inter', textTransform: 'uppercase', letterSpacing: '0.04em',
          }}
        >
          <Icon size={11} /> {t.short}
        </span>
      );
    })}
  </span>
);

interface Props {
  workouts: TaggedWorkout[];
}

export const WorkoutDetail: React.FC<Props> = ({ workouts }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { unit } = useSettings();
  const { canWrite } = useAuth();
  const { getMuscleGroup } = useExercises();
  const multiplier = unit === 'lbs' ? 2.20462 : 1;

  const session = useMemo(
    () => groupWorkoutSessions(workouts).find(s => s.id === id),
    [workouts, id],
  );
  const setPRs = useMemo(() => computeSetPRs(workouts), [workouts]);

  // ── Session-level analytics (only when a session is found) ──────
  const analytics = useMemo(() => {
    if (!session) return null;
    let totalSets = 0;
    let totalReps = 0;
    let prCount = 0;
    let topSet = { kg: 0, reps: 0, exercise: '' };
    let bestOneRM = 0;

    // Per-exercise rollups + muscle-group volume split.
    const perExercise: { title: string; volume: number; sets: number; topKg: number }[] = [];
    const muscleVol = new Map<string, number>();

    session.exercises.forEach((sets, exTitle) => {
      let exVolume = 0;
      let exTop = 0;
      sets.forEach(s => {
        totalSets += 1;
        totalReps += s.reps;
        const vol = s.weightKg * s.reps;
        exVolume += vol;
        if (s.weightKg > exTop) exTop = s.weightKg;
        if (s.weightKg > topSet.kg) topSet = { kg: s.weightKg, reps: s.reps, exercise: exTitle };
        bestOneRM = Math.max(bestOneRM, estimateOneRM(s.weightKg, s.reps));
        const pr = setPRs.get(setPRKey(s.id, exTitle, s.setIndex));
        if (pr) prCount += (pr.weight ? 1 : 0) + (pr.volume ? 1 : 0) + (pr.oneRM ? 1 : 0);
      });
      perExercise.push({ title: exTitle, volume: exVolume, sets: sets.length, topKg: exTop });
      const mg = getMuscleGroup(exTitle);
      muscleVol.set(mg, (muscleVol.get(mg) ?? 0) + exVolume);
    });

    const totalVolume = perExercise.reduce((s, e) => s + e.volume, 0);
    const muscleSplit = Array.from(muscleVol.entries())
      .map(([group, vol]) => ({ group, vol, pct: totalVolume ? (vol / totalVolume) * 100 : 0 }))
      .sort((a, b) => b.vol - a.vol);
    // perExercise stays in insertion order — i.e. the order the exercises were added.

    return { totalSets, totalReps, prCount, topSet, bestOneRM, totalVolume, muscleSplit, perExercise };
  }, [session, setPRs, getMuscleGroup]);

  if (!session || !analytics) {
    return (
      <div className="wkd-page" style={{ animation: 'fadeIn 0.5s ease-out' }}>
        <Link to="/workouts" className="wkd-back">
          <ChevronLeft size={16} /> Workout History
        </Link>
        <div className="wkd-empty">This workout could not be found.</div>
      </div>
    );
  }

  const { color: catColor, icon: CatIcon } = getCategoryStyle(session.category);
  const people = sortPeople(session.people);
  const stats: { label: string; value: string; unit?: string }[] = [
    { label: 'Duration', value: String(Math.round(session.durSeconds / 60)), unit: 'min' },
    { label: 'Volume', value: Math.round(analytics.totalVolume * multiplier).toLocaleString(), unit },
    { label: 'Exercises', value: String(session.exercises.size) },
    { label: 'Sets', value: String(analytics.totalSets) },
    { label: 'Reps', value: String(analytics.totalReps) },
    { label: 'Top Set', value: Math.round(analytics.topSet.kg * multiplier).toLocaleString(), unit },
    { label: 'Best Est. 1RM', value: Math.round(analytics.bestOneRM * multiplier).toLocaleString(), unit },
    ...(session.avgHeartRate > 0 ? [{ label: 'Avg HR', value: String(session.avgHeartRate), unit: 'bpm' }] : []),
  ];

  return (
    <div className="wkd-page" style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <Link to="/workouts" className="wkd-back">
        <ChevronLeft size={16} /> Workout History
      </Link>

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="wkd-header" style={{ borderLeft: `4px solid ${catColor}` }}>
        <div className="wkd-title-row">
          <CatIcon size={22} color={catColor} style={{ flexShrink: 0 }} />
          <h2 className="wkd-title">{session.title || 'Workout'}</h2>
          <span className="wkd-chip" style={{ color: catColor, background: `${catColor}1A`, borderColor: `${catColor}40` }}>
            {session.category || 'Mixed'}
          </span>
          {analytics.prCount > 0 && (
            <span className="wkd-chip" style={{ color: '#FFC400', background: 'rgba(255,196,0,0.12)', borderColor: 'rgba(255,196,0,0.35)' }}>
              <Trophy size={12} /> {analytics.prCount} PR{analytics.prCount > 1 ? 's' : ''}
            </span>
          )}
          {canWrite && (
            <button className="wkd-edit" onClick={() => navigate(`/add/workout?edit=${session.id}`)} title="Edit workout">
              <Pencil size={13} /> Edit
            </button>
          )}
        </div>

        <div className="wkd-meta">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <Clock size={13} /> {format(session.startTime, 'EEE d MMM yyyy, HH:mm')}
          </span>
          {session.gym && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <MapPin size={13} /> {session.gym}
            </span>
          )}
          {session.avgHeartRate > 0 && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <HeartPulse size={13} style={{ color: '#FB7185' }} /> {session.avgHeartRate} bpm
            </span>
          )}
          {people.length > 0 && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <Users size={13} style={{ color: '#60A5FA' }} /> {people.join(', ')}
            </span>
          )}
        </div>
        {session.description && (
          <div style={{ ...metaTextStyle, marginTop: '10px', fontStyle: 'italic', lineHeight: 1.5 }}>
            "{session.description}"
          </div>
        )}
      </div>

      {/* ── Summary stats ──────────────────────────────────────── */}
      <div className="wkd-stats-row">
        {stats.map(s => (
          <div key={s.label} className="wkd-stat glass-panel">
            <span className="wkd-stat-label">{s.label}</span>
            <div className="wkd-stat-value-row">
              <span className="wkd-stat-value">{s.value}</span>
              {s.unit && <span className="wkd-stat-unit">{s.unit}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* ── Muscle-group volume split ──────────────────────────── */}
      <h3 className="wkd-section-title">Muscle Focus</h3>
      <div className="glass-panel wkd-split">
        {analytics.muscleSplit.map((m, i) => (
          <div key={m.group} className="wkd-split-row">
            <div className="wkd-split-head">
              <span className="wkd-split-name">{m.group}</span>
              <span className="wkd-split-pct">
                {m.pct.toFixed(0)}%
                <span className="wkd-split-vol">{Math.round(m.vol * multiplier).toLocaleString()} {unit}</span>
              </span>
            </div>
            <div className="wkd-split-track">
              <div className="wkd-split-fill" style={{ width: `${m.pct}%`, background: MUSCLE_COLORS[i % MUSCLE_COLORS.length] }} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Per-exercise set breakdown ─────────────────────────── */}
      <h3 className="wkd-section-title">Exercises</h3>
      <div className="glass-panel wkd-breakdown">
        {analytics.perExercise.map(({ title: exTitle }) => {
          const rawSets = session.exercises.get(exTitle) ?? [];
          const sets = rawSets.slice().sort((a, b) => (a.setIndex ?? 0) - (b.setIndex ?? 0));
          const notes = rawSets[0]?.exerciseNotes;
          const exVolume = sets.reduce((s, x) => s + x.weightKg * x.reps, 0);
          return (
            <div key={exTitle} className="wkd-ex">
              <div className="wkd-ex-head">
                <h4 className="wkd-ex-title">
                  <span className="wkd-ex-bar" style={{ background: catColor }} />
                  {exTitle}
                </h4>
                <span className="wkd-ex-vol">
                  {sets.length} set{sets.length > 1 ? 's' : ''} · {Math.round(exVolume * multiplier).toLocaleString()} {unit}
                </span>
              </div>
              {notes && <p className="wkd-ex-notes">{notes}</p>}
              <div className="wkd-sets">
                {sets.map((set, idx) => {
                  const pr = setPRs.get(setPRKey(set.id, exTitle, set.setIndex));
                  const setType = set.setType as SetType;
                  const color = getSetColor(setType);
                  return (
                    <div key={idx} className="wkd-set">
                      <span className="wkd-set-chip" style={{
                        background: setType === 'normal' ? 'rgba(255,255,255,0.05)' : `${color}1A`,
                        color,
                      }}>
                        {getSetLabel(sets, idx)}
                      </span>
                      {setType !== 'normal' && (
                        <span style={{ fontSize: '12px', color, fontFamily: 'Inter', fontWeight: 600, minWidth: '54px' }}>
                          {getSetTypeName(setType)}
                        </span>
                      )}
                      <span style={{ fontWeight: 500, fontFamily: 'Inter' }}>
                        {Math.round(set.weightKg * multiplier)} {unit}
                        <span style={{ color: 'var(--text-muted)', margin: '0 4px' }}>×</span>
                        {set.reps} reps
                      </span>
                      {pr && <PRBadge pr={pr} />}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Set-type legend */}
        <div className="wkd-legend">
          {SET_TYPES.filter(t => t.key !== 'normal').map(t => (
            <span key={t.key} className="wkd-legend-item">
              <span className="wkd-legend-chip" style={{ background: `${t.color}1A`, color: t.color }}>{t.label}</span>
              {t.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
