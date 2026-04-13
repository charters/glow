import { useState, useEffect, useCallback } from 'react';
import {
  db,
  isDueToday,
  type Habit,
  type RitualStep,
  type Completion,
} from './db';

interface Props {
  dateKey: string; // YYYY-MM-DD
  habits: Habit[];
  ritualStepsMap: Map<number, RitualStep[]>;
  onClose: () => void;
  onUpdate: () => void;
}

function parseDate(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatDetailDate(key: string): string {
  return parseDate(key).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export default function DayDetail({
  dateKey,
  habits,
  ritualStepsMap,
  onClose,
  onUpdate,
}: Props) {
  const [completions, setCompletions] = useState<Map<number, Completion>>(
    new Map(),
  );

  const date = parseDate(dateKey);
  const due = habits.filter((h) => isDueToday(h, date));

  const loadCompletions = useCallback(async () => {
    const comps = await db.completions
      .where('date')
      .equals(dateKey)
      .toArray();
    const cMap = new Map<number, Completion>();
    comps.forEach((c) => cMap.set(c.habitId, c));
    setCompletions(cMap);
  }, [dateKey]);

  useEffect(() => {
    loadCompletions();
  }, [loadCompletions]);

  async function toggleHabit(habit: Habit) {
    if (habit.isRitual) return; // rituals toggle via steps

    const existing = completions.get(habit.id!);
    if (existing) {
      await db.completions.delete(existing.id!);
    } else {
      await db.completions.add({
        habitId: habit.id!,
        date: dateKey,
        completedAt: new Date().toISOString(),
      });
    }
    loadCompletions();
    onUpdate();
  }

  async function toggleStep(habit: Habit, step: RitualStep) {
    const completion = completions.get(habit.id!);
    const sid = step.id!;

    if (!completion) {
      await db.completions.add({
        habitId: habit.id!,
        date: dateKey,
        completedAt: new Date().toISOString(),
        stepsCompleted: [sid],
      });
    } else {
      const prev = completion.stepsCompleted ?? [];
      const next = prev.includes(sid)
        ? prev.filter((s) => s !== sid)
        : [...prev, sid];

      if (next.length === 0) {
        await db.completions.delete(completion.id!);
      } else {
        await db.completions.update(completion.id!, {
          stepsCompleted: next,
          completedAt: new Date().toISOString(),
        });
      }
    }
    loadCompletions();
    onUpdate();
  }

  function isHabitDone(h: Habit): boolean {
    const c = completions.get(h.id!);
    if (!c) return false;
    if (!h.isRitual) return true;
    const steps = ritualStepsMap.get(h.id!) ?? [];
    return (c.stepsCompleted ?? []).length >= steps.length;
  }

  return (
    <div className="day-detail-overlay" onClick={onClose}>
      <div className="day-detail-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="day-detail-header">
          <h2>{formatDetailDate(dateKey)}</h2>
          <button className="day-detail-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {due.length === 0 ? (
          <p className="day-detail-empty">Nothing was due this day.</p>
        ) : (
          <div className="day-detail-list">
            {due.map((habit) => {
              const done = isHabitDone(habit);
              const steps = ritualStepsMap.get(habit.id!) ?? [];
              const completion = completions.get(habit.id!);

              return (
                <div key={habit.id} className="day-detail-item">
                  <button
                    className={`day-detail-habit${done ? ' done' : ''}`}
                    onClick={() => toggleHabit(habit)}
                  >
                    <span className="habit-emoji">{habit.emoji}</span>
                    <span className="day-detail-name">{habit.name}</span>
                    {!habit.isRitual && (
                      <span
                        className={`check-circle small${done ? ' checked' : ''}`}
                      >
                        {done && '✓'}
                      </span>
                    )}
                  </button>

                  {habit.isRitual && steps.length > 0 && (
                    <div className="day-detail-steps">
                      {steps.map((step) => {
                        const stepDone = (
                          completion?.stepsCompleted ?? []
                        ).includes(step.id!);
                        return (
                          <button
                            key={step.id}
                            className={`ritual-step${stepDone ? ' done' : ''}`}
                            onClick={() => toggleStep(habit, step)}
                          >
                            <span
                              className={`step-check${stepDone ? ' checked' : ''}`}
                            >
                              {stepDone ? '✓' : ''}
                            </span>
                            <span className="step-label">{step.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
