import React, { useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Pencil, Footprints, MapPin, HeartPulse, Flame, Users, Clock, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { useRuns, type Run, type RunType } from '../hooks/useRuns';
import { formatDuration, runDifficulty } from '../utils/runFormat';
import { sortPeople } from '../utils/people';
import { metaTextStyle } from '../styles/typography';
import './WorkoutDetail.css';

const TYPE_COLORS: Record<RunType, string> = {
  Light: '#4ADE80',
  Explosion: '#FB7185',
  Long: '#60A5FA',
  Other: '#A78BFA',
};

/** Formats sec/km pace into "m:ss /km". */
const fmtPace = (secPerKm: number) => {
  if (!isFinite(secPerKm) || secPerKm <= 0) return '—';
  const m = Math.floor(secPerKm / 60);
  const s = Math.round(secPerKm % 60);
  return `${m}:${String(s).padStart(2, '0')} /km`;
};

export const RunDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { canWrite } = useAuth();
  const { runs, loading } = useRuns();

  const run = useMemo(() => runs.find(r => r.id === id), [runs, id]);

  // Derived metrics for this run + comparison against the all-time average.
  const analytics = useMemo(() => {
    if (!run) return null;
    const hours = run.durationSeconds / 3600;
    const speed = hours > 0 ? run.distanceKm / hours : 0;
    const cadence = run.durationSeconds > 0 ? run.steps / (run.durationSeconds / 60) : 0;
    const calPerKm = run.distanceKm > 0 ? run.calories / run.distanceKm : 0;
    const elevPerKm = run.distanceKm > 0 ? run.elevationGainM / run.distanceKm : 0;
    const paceSec = run.distanceKm > 0 ? run.durationSeconds / run.distanceKm : 0;

    // Average a field across all runs that have a positive value for it.
    const avg = (fn: (r: Run) => number) => {
      const vals = runs.map(fn).filter(v => v > 0);
      return vals.length ? vals.reduce((s, v) => s + v, 0) / vals.length : 0;
    };
    const comparisons = [
      { label: 'Distance', value: run.distanceKm, avg: avg(r => r.distanceKm), unit: 'km', digits: 2 },
      { label: 'Avg Speed', value: speed, avg: avg(r => (r.durationSeconds > 0 ? r.distanceKm / (r.durationSeconds / 3600) : 0)), unit: 'km/h', digits: 1 },
      { label: 'Avg HR', value: run.avgHeartRate, avg: avg(r => r.avgHeartRate), unit: 'bpm', digits: 0 },
      { label: 'Calories', value: run.calories, avg: avg(r => r.calories), unit: 'kcal', digits: 0 },
    ].filter(c => c.value > 0);

    return { speed, cadence, calPerKm, elevPerKm, paceSec, comparisons, totalRuns: runs.length };
  }, [run, runs]);

  if (loading) {
    return (
      <div className="wkd-page">
        <Link to="/running" className="wkd-back"><ChevronLeft size={16} /> Running</Link>
        <div className="wkd-empty">Loading run…</div>
      </div>
    );
  }

  if (!run || !analytics) {
    return (
      <div className="wkd-page">
        <Link to="/running" className="wkd-back"><ChevronLeft size={16} /> Running</Link>
        <div className="wkd-empty">This run could not be found.</div>
      </div>
    );
  }

  const color = TYPE_COLORS[run.type];
  const people = sortPeople(run.people);
  const diff = run.difficulty > 0 ? runDifficulty(run.difficulty) : null;

  // Primary metric cards.
  const stats: { label: string; value: string; unit?: string }[] = [
    { label: 'Distance', value: run.distanceKm.toFixed(2), unit: 'km' },
    { label: 'Duration', value: formatDuration(run.durationSeconds) },
    { label: 'Pace', value: run.pace || fmtPace(analytics.paceSec) },
    { label: 'Avg Speed', value: analytics.speed.toFixed(1), unit: 'km/h' },
    ...(run.avgHeartRate > 0 ? [{ label: 'Avg HR', value: String(run.avgHeartRate), unit: 'bpm' }] : []),
    ...(run.calories > 0 ? [{ label: 'Calories', value: run.calories.toLocaleString(), unit: 'kcal' }] : []),
    ...(run.steps > 0 ? [{ label: 'Cadence', value: String(Math.round(analytics.cadence)), unit: 'spm' }] : []),
    ...(run.calories > 0 && run.distanceKm > 0 ? [{ label: 'Cal / km', value: String(Math.round(analytics.calPerKm)), unit: 'kcal' }] : []),
    ...(run.elevationGainM > 0 ? [{ label: 'Elev. Gain', value: String(run.elevationGainM), unit: 'm' }] : []),
    ...(run.maxElevationM > 0 ? [{ label: 'Max Elev.', value: String(run.maxElevationM), unit: 'm' }] : []),
    ...(run.steps > 0 ? [{ label: 'Steps', value: run.steps.toLocaleString() }] : []),
  ];

  return (
    <div className="wkd-page" style={{ animation: 'fadeIn 0.5s ease-out' }}>
      <Link to="/running" className="wkd-back">
        <ChevronLeft size={16} /> Running
      </Link>

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="wkd-header" style={{ borderLeft: `4px solid ${color}` }}>
        <div className="wkd-title-row">
          <Footprints size={22} color={color} style={{ flexShrink: 0 }} />
          <h2 className="wkd-title">{run.title || 'Run'}</h2>
          <span className="wkd-chip" style={{ color, background: `${color}1A`, borderColor: `${color}55` }}>
            {run.type}
          </span>
          {diff && (
            <span className="wkd-chip" style={{ color: diff.color, background: `${diff.color}1A`, borderColor: `${diff.color}55` }}>
              {diff.label} {run.difficulty}/10
            </span>
          )}
          {canWrite && (
            <button className="wkd-edit" onClick={() => navigate(`/add/run?edit=${run.id}`)} title="Edit run">
              <Pencil size={13} /> Edit
            </button>
          )}
        </div>

        <div className="wkd-meta">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <Clock size={13} /> {format(run.startTime, 'EEE d MMM yyyy, HH:mm')}
          </span>
          {run.location && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <MapPin size={13} /> {run.location}
            </span>
          )}
          {run.avgHeartRate > 0 && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <HeartPulse size={13} style={{ color: '#FB7185' }} /> {run.avgHeartRate} bpm
            </span>
          )}
          {run.calories > 0 && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <Flame size={13} style={{ color: '#F59E0B' }} /> {run.calories.toLocaleString()} kcal
            </span>
          )}
          {people.length > 0 && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <Users size={13} style={{ color: '#60A5FA' }} /> {people.join(', ')}
            </span>
          )}
        </div>
        {run.description && (
          <div style={{ ...metaTextStyle, marginTop: '10px', fontStyle: 'italic', lineHeight: 1.5 }}>
            "{run.description}"
          </div>
        )}
      </div>

      {/* ── Metrics ────────────────────────────────────────────── */}
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

      {/* ── Comparison vs your average ─────────────────────────── */}
      {analytics.totalRuns > 1 && analytics.comparisons.length > 0 && (
        <>
          <h3 className="wkd-section-title">How this run compares</h3>
          <p style={{ ...metaTextStyle, margin: '-6px 0 14px' }}>
            Against your average across {analytics.totalRuns} runs.
          </p>
          <div className="glass-panel wkd-split">
            {analytics.comparisons.map(c => {
              const delta = c.avg > 0 ? ((c.value - c.avg) / c.avg) * 100 : 0;
              const ratio = c.avg > 0 ? Math.min((c.value / c.avg) * 50, 100) : 50;
              const up = delta > 1;
              const down = delta < -1;
              const arrowColor = up ? '#4ADE80' : down ? '#FB7185' : 'var(--text-muted)';
              const Arrow = up ? ArrowUp : down ? ArrowDown : Minus;
              return (
                <div key={c.label} className="wkd-split-row">
                  <div className="wkd-split-head">
                    <span className="wkd-split-name">{c.label}</span>
                    <span className="wkd-split-pct">
                      {c.value.toFixed(c.digits)} {c.unit}
                      <span className="wkd-split-vol" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: arrowColor }}>
                        <Arrow size={12} /> {Math.abs(delta).toFixed(0)}% vs {c.avg.toFixed(c.digits)}
                      </span>
                    </span>
                  </div>
                  <div className="wkd-split-track">
                    <div className="wkd-split-fill" style={{ width: `${ratio}%`, background: color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
