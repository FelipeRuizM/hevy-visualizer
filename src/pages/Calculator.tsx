import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Calculator as CalculatorIcon, ChevronDown, Sparkles, X } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { useSettings } from '../context/SettingsContext';
import { useExercises } from '../context/ExercisesContext';
import { getSetColor, SET_TYPES } from '../utils/workoutDisplay';
import { isBodyweightExercise, getBodyweightAddition } from '../utils/bodyweight';
import { applyRamp, learnRamp, lastWorkingWeightKg } from '../utils/warmupCalculator';
import type { TaggedWorkout } from '../hooks/useWorkouts';
import { labelStyle } from '../styles/formStyles';
import { sectionTitleStyle } from '../styles/typography';
import './Calculator.css';

// Rounding steps offered per unit — real plate jumps, not arbitrary decimals.
const INCREMENTS: Record<string, number[]> = {
  kg:  [1.25, 2.5, 5],
  lbs: [2.5, 5, 10],
};

const setChip = (type: 'warmup' | 'feeder') =>
  SET_TYPES.find(t => t.key === type)?.label ?? '?';

const fmt = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/0$/, ''));

// ── Exercise picker ──────────────────────────────────────────────────────────
const ExercisePicker: React.FC<{
  exercises: string[];
  value: string;
  onChange: (name: string) => void;
}> = ({ exercises, value, onChange }) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? exercises.filter(e => e.toLowerCase().includes(q)) : exercises;
  }, [exercises, query]);

  const pick = (name: string) => {
    onChange(name);
    setQuery('');
    setOpen(false);
  };

  return (
    <div className="calc-picker" ref={ref}>
      <input
        className="calc-input calc-picker-input"
        placeholder={value || 'Search an exercise…'}
        value={open ? query : value}
        onChange={e => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => { setQuery(''); setOpen(true); }}
        onKeyDown={e => {
          if (e.key === 'Enter' && filtered.length > 0) pick(filtered[0]);
          if (e.key === 'Escape') setOpen(false);
        }}
      />
      {value && !open ? (
        <button className="calc-picker-btn" onClick={() => onChange('')} title="Clear">
          <X size={14} />
        </button>
      ) : (
        <ChevronDown size={16} className="calc-picker-caret" />
      )}
      {open && filtered.length > 0 && (
        <div className="calc-dropdown">
          {filtered.slice(0, 80).map(ex => (
            <div
              key={ex}
              className={`calc-option ${ex === value ? 'calc-option--active' : ''}`}
              onMouseDown={e => { e.preventDefault(); pick(ex); }}
            >
              {ex}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Page ─────────────────────────────────────────────────────────────────────
export const Calculator: React.FC<{ workouts: TaggedWorkout[] }> = ({ workouts }) => {
  const { unit } = useSettings();
  const { exercises } = useExercises();
  const multiplier = unit === 'lbs' ? 2.20462 : 1;

  const steps = INCREMENTS[unit] ?? INCREMENTS.kg;
  const [exercise, setExercise] = useState('');
  // null → follow the weight prefilled from history; a string → the user typed.
  const [typedWeight, setTypedWeight] = useState<string | null>(null);
  const [pickedStep, setPickedStep] = useState<number | null>(null);

  // Falls back to the default step when the unit changes under a picked one.
  const increment = pickedStep !== null && steps.includes(pickedStep) ? pickedStep : steps[1];

  const exerciseNames = useMemo(
    () => exercises.map(e => e.name).sort((a, b) => a.localeCompare(b)),
    [exercises],
  );

  const bodyweight = isBodyweightExercise(exercise)
    ? Math.round(getBodyweightAddition(new Date()) * multiplier * 10) / 10
    : 0;

  // The last session that trained this lift seeds the working weight.
  const prefill = useMemo(() => {
    if (!exercise) return '';
    const kg = lastWorkingWeightKg(workouts, exercise);
    if (kg <= 0) return '';
    const shown = kg * multiplier - bodyweight;
    return String(Math.max(0, Math.round(shown * 10) / 10));
  }, [exercise, workouts, multiplier, bodyweight]);

  const working = typedWeight ?? prefill;

  const pickExercise = (name: string) => {
    setExercise(name);
    setTypedWeight(null); // re-seed from the newly picked lift's history
  };

  const scheme = useMemo(
    () => (exercise ? learnRamp(workouts, exercise) : null),
    [workouts, exercise],
  );

  const workingNum = Number(working) || 0;
  const ramp = useMemo(
    () => (scheme ? applyRamp(scheme.rungs, workingNum, increment, bodyweight) : []),
    [scheme, workingNum, increment, bodyweight],
  );

  // Bodyweight lifts show the added load, so 0 reads as "Bodyweight".
  const weightLabel = (w: number) =>
    bodyweight > 0
      ? (w <= 0 ? 'Bodyweight' : `BW + ${fmt(w)} ${unit}`)
      : `${fmt(w)} ${unit}`;

  return (
    <div className="calc-container">
      <PageHeader icon={CalculatorIcon} title="Calculator" />

      <h3 style={sectionTitleStyle}>Warm-Up &amp; Feeder Sets</h3>
      <p className="calc-intro">
        Enter the working weight you're building to — the ramp comes from how you
        actually warm up for that lift.
      </p>

      <div className="calc-panel calc-panel--form">
        <div className="calc-fields">
          <div className="calc-field">
            <label style={labelStyle}>Exercise</label>
            <ExercisePicker exercises={exerciseNames} value={exercise} onChange={pickExercise} />
          </div>
          <div className="calc-field">
            <label style={labelStyle}>
              {bodyweight > 0 ? `Added load (${unit})` : `Working weight (${unit})`}
            </label>
            <input
              className="calc-input"
              type="number" min={0} step="any" inputMode="decimal"
              value={working}
              onChange={e => setTypedWeight(e.target.value)}
              placeholder="0"
              disabled={!exercise}
            />
          </div>
          <div className="calc-field">
            <label style={labelStyle}>Round to</label>
            <div className="calc-steps">
              {steps.map(s => (
                <button
                  key={s}
                  className={`calc-step ${s === increment ? 'calc-step--active' : ''}`}
                  onClick={() => setPickedStep(s)}
                >
                  {fmt(s)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {!exercise ? (
        <div className="calc-empty">Pick an exercise to see your ramp.</div>
      ) : workingNum <= 0 && bodyweight === 0 ? (
        <div className="calc-empty">Enter your working weight to see the ramp.</div>
      ) : scheme && (
        <div className="calc-panel calc-panel--ramp">
          <div className="calc-ramp-head">
            <h3 className="calc-ramp-title">Your Ramp</h3>
            <span className={`calc-source calc-source--${scheme.source}`}>
              {scheme.source === 'history' ? (
                <>
                  <Sparkles size={13} />
                  Learned from {scheme.sessions} session{scheme.sessions === 1 ? '' : 's'}
                </>
              ) : (
                `Standard scheme — ${scheme.sessions === 0 ? 'no' : 'only ' + scheme.sessions} logged ramp${scheme.sessions === 1 ? '' : 's'} yet`
              )}
            </span>
          </div>

          <div className="calc-rows">
            {ramp.map((r, i) => (
              <div key={i} className="calc-row">
                <span className="calc-chip" style={{ background: `${getSetColor(r.setType)}1A`, color: getSetColor(r.setType) }}>
                  {setChip(r.setType)}
                </span>
                <span className="calc-row-weight">
                  {weightLabel(r.weight)}
                  <span className="calc-row-x">×</span>
                  {r.reps}
                </span>
                <span className="calc-row-pct">{Math.round(r.ratio * 100)}%</span>
              </div>
            ))}

            <div className="calc-row calc-row--working">
              <span className="calc-chip calc-chip--working">1</span>
              <span className="calc-row-weight">
                {weightLabel(workingNum)}
                <span className="calc-row-x">×</span>
                working
              </span>
              <span className="calc-row-pct">100%</span>
            </div>
          </div>

          <p className="calc-note">
            {ramp.length} ramp set{ramp.length === 1 ? '' : 's'} before your first working set
            {bodyweight > 0 && ` · bodyweight taken as ${fmt(bodyweight)} ${unit}`}
          </p>
        </div>
      )}
    </div>
  );
};
