import React, { useMemo, type CSSProperties } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { useSettings } from '../context/SettingsContext';
import { format } from 'date-fns';
import { ChevronRight, Pencil, Trophy, MapPin, HeartPulse, Users, Clock, Dumbbell, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { groupWorkoutSessions, type WorkoutSession } from '../utils/sessions';
import { getCategoryStyle } from '../utils/workoutDisplay';
import { computeSetPRs, setPRKey, type SetPR } from '../utils/prEngine';
import { labelStyle } from '../styles/formStyles';
import { pageTitleStyle, cardTitleStyle, bodyTextStyle, metaTextStyle, statValueStyle } from '../styles/typography';
import { sortPeople } from '../utils/people';
import type { TaggedWorkout } from '../hooks/useWorkouts';

const fmtDuration = (min: number) => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

// Shared styling for an icon + value metric on the card.
const metricStyle: CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: '5px' };
const mutedIcon: CSSProperties = { color: 'var(--text-muted)' };

// ── WorkoutCard (historical session) ──────────────────────────
// A compact summary that navigates to the full session detail page on click.
const WorkoutCard: React.FC<{
  session: WorkoutSession;
  unit: string;
  setPRs: Map<string, SetPR>;
  onEdit: (session: WorkoutSession) => void;
  onOpen: (session: WorkoutSession) => void;
}> = ({ session, unit, setPRs, onEdit, onOpen }) => {
  const { canWrite } = useAuth();
  const multiplier = unit === 'lbs' ? 2.20462 : 1;

  const { color: catColor, icon: CatIcon } = getCategoryStyle(session.category);

  // Count records broken in this session (each type counts) for a header badge.
  const prCount = useMemo(() => {
    let n = 0;
    session.exercises.forEach((sets, exTitle) => {
      sets.forEach(s => {
        const pr = setPRs.get(setPRKey(s.id, exTitle, s.setIndex));
        if (pr) n += (pr.weight ? 1 : 0) + (pr.volume ? 1 : 0) + (pr.oneRM ? 1 : 0);
      });
    });
    return n;
  }, [session, setPRs]);

  const people = useMemo(() => sortPeople(session.people), [session.people]);

  return (
    <Card style={{ position: 'relative', cursor: 'pointer', transition: 'all 0.3s ease', borderLeft: `4px solid ${catColor}` }}>
      <div onClick={() => onOpen(session)} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Header row — title on the left (free to wrap), category + PRs pinned together on the right */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
            <CatIcon size={16} color={catColor} style={{ flexShrink: 0 }} />
            <h3 style={cardTitleStyle}>{session.title || 'Workout'}</h3>
          </div>

          {/* Right cluster — never wraps; category chip + PR badge stay side by side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <span style={{
              fontSize: '11px', fontFamily: 'Inter', fontWeight: 700, whiteSpace: 'nowrap',
              textTransform: 'uppercase', letterSpacing: '0.05em',
              color: catColor, background: `${catColor}1A`,
              border: `1px solid ${catColor}40`, borderRadius: '999px', padding: '2px 10px',
            }}>
              {session.category || 'Mixed'}
            </span>
            {prCount > 0 && (
              <span
                title={`${prCount} personal record${prCount > 1 ? 's' : ''} this session`}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap',
                  fontSize: '11px', fontFamily: 'Inter', fontWeight: 700,
                  color: '#FFC400', background: 'rgba(255,196,0,0.12)',
                  border: '1px solid rgba(255,196,0,0.35)', borderRadius: '999px', padding: '2px 10px',
                }}
              >
                <Trophy size={12} /> {prCount} PR{prCount > 1 ? 's' : ''}
              </span>
            )}
            <ChevronRight size={18} color="var(--text-muted)" style={{ flexShrink: 0 }} />
          </div>
        </div>

        {/* Metrics row — compact, like the Run card; every value carries an icon */}
        <div style={{ ...bodyTextStyle, display: 'flex', gap: '18px', flexWrap: 'wrap', paddingTop: '2px' }}>
          <span style={metricStyle}>
            <Clock size={13} style={mutedIcon} /> {Math.round(session.durSeconds / 60)} min
          </span>
          <span style={metricStyle}>
            <Dumbbell size={13} style={mutedIcon} /> {Math.round(session.volume * multiplier).toLocaleString()} {unit}
          </span>
          {session.avgHeartRate > 0 && (
            <span style={metricStyle}>
              <HeartPulse size={13} style={{ color: '#FB7185' }} /> {session.avgHeartRate} bpm
            </span>
          )}
          {session.gym && (
            <span style={metricStyle}>
              <MapPin size={13} style={mutedIcon} /> {session.gym}
            </span>
          )}
          {people.length > 0 && (
            <span style={metricStyle}>
              <Users size={13} style={{ color: '#60A5FA' }} /> {people.join(', ')}
            </span>
          )}
        </div>

        {/* Workout description */}
        {session.description && (
          <div style={{ ...metaTextStyle, lineHeight: 1.5, fontStyle: 'italic' }}>
            "{session.description}"
          </div>
        )}

        {/* Footer — date + (owner) edit control */}
        <div
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px' }}
          onClick={e => e.stopPropagation()}
        >
          <span style={{ ...metaTextStyle, display: 'inline-flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap' }}>
            <Calendar size={12} style={mutedIcon} /> {format(session.startTime, 'd MMM, HH:mm')}
          </span>
          {canWrite && (
            <button
              onClick={() => onEdit(session)}
              title="Edit workout"
              style={{
                width: '30px', height: '30px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-secondary)', transition: 'all 0.15s',
              }}
            >
              <Pencil size={14} />
            </button>
          )}
        </div>
      </div>
    </Card>
  );
};

// ── Workouts page (history only) ──────────────────────────────
export const Workouts: React.FC<{ workouts: TaggedWorkout[] }> = ({ workouts }) => {
  const { unit } = useSettings();
  const { canWrite } = useAuth();
  const navigate = useNavigate();

  const sessions = useMemo(() => groupWorkoutSessions(workouts), [workouts]);
  const setPRs = useMemo(() => computeSetPRs(workouts), [workouts]);

  const stats = useMemo(() => {
    const totalSeconds = sessions.reduce((s, x) => s + x.durSeconds, 0);
    const totalReps = workouts.reduce((s, w) => s + w.reps, 0);
    return {
      totalLifts: sessions.length,
      totalMinutes: Math.round(totalSeconds / 60),
      totalReps,
    };
  }, [sessions, workouts]);

  return (
    <div style={{ padding: '24px', animation: 'fadeIn 0.5s ease-out', paddingBottom: '64px', maxWidth: '1200px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>

      {/* Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          marginBottom: '32px',
        }}
      >
        <Card>
          <div style={labelStyle}>Total Lifts</div>
          <div style={statValueStyle}>{stats.totalLifts.toLocaleString()}</div>
        </Card>
        <Card>
          <div style={labelStyle}>Total Time Working Out</div>
          <div style={statValueStyle}>{fmtDuration(stats.totalMinutes)}</div>
        </Card>
        <Card>
          <div style={labelStyle}>Total Reps</div>
          <div style={statValueStyle}>{stats.totalReps.toLocaleString()}</div>
        </Card>
      </div>

      <h2 style={{ ...pageTitleStyle, marginBottom: '24px' }}>Workout History</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
        {sessions.map(session => (
          <WorkoutCard
            key={session.startTime.getTime().toString()}
            session={session}
            unit={unit}
            setPRs={setPRs}
            onEdit={(s) => navigate(`/add/workout?edit=${s.id}`)}
            onOpen={(s) => navigate(`/workouts/${s.id}`)}
          />
        ))}
        {sessions.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
            No workouts logged yet.{canWrite ? ' Add one from the home screen.' : ''}
          </div>
        )}
      </div>
    </div>
  );
};
