import { useState, useEffect, useCallback } from 'react';
import {
  db,
  toDateKey,
  isDueToday,
  getWeekCompletionCount,
  type Habit,
  type RitualStep,
  type Completion,
} from './db';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export default function TodayView() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<Map<number, Completion>>(
    new Map(),
  );
  const [ritualSteps, setRitualSteps] = useState<
    Map<number, RitualStep[]>
  >(new Map());
  const [expandedRitual, setExpandedRitual] = useState<number | null>(null);
  const [justCompleted, setJustCompleted] = useState<Set<number>>(new Set());
  const [weekCounts, setWeekCounts] = useState<Map<number, number>>(new Map());

  const today = new Date();
  const dateKey = toDateKey(today);

  const loadData = useCallback(async () => {
    const allHabits = await db.habits.orderBy('sortOrder').toArray();
    const due = allHabits.filter((h) => isDueToday(h, new Date()));

    const todayCompletions = await db.completions
      .where('date')
      .equals(dateKey)
      .toArray();
    const cMap = new Map<number, Completion>();
    todayCompletions.forEach((c) => cMap.set(c.habitId, c));

    const sMap = new Map<number, RitualStep[]>();
    for (const h of due.filter((h) => h.isRitual)) {
      sMap.set(
        h.id!,
        await db.ritualSteps.where('habitId').equals(h.id!).sortBy('sortOrder'),
      );
    }

    setHabits(due);
    setCompletions(cMap);
    setRitualSteps(sMap);

    // Load week counts for xperweek habits
    const wMap = new Map<number, number>();
    for (const h of due.filter((h) => h.frequency === 'xperweek')) {
      wMap.set(h.id!, await getWeekCompletionCount(h.id!, new Date()));
    }
    setWeekCounts(wMap);
  }, [dateKey]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* ── toggle simple habit ── */
  async function toggleHabit(habit: Habit) {
    if (habit.isRitual) {
      setExpandedRitual((prev) => (prev === habit.id! ? null : habit.id!));
      return;
    }

    const existing = completions.get(habit.id!);
    if (existing) {
      await db.completions.delete(existing.id!);
    } else {
      await db.completions.add({
        habitId: habit.id!,
        date: dateKey,
        completedAt: new Date().toISOString(),
      });
      pulse(habit.id!);
    }
    loadData();
  }

  /* ── toggle ritual step ── */
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
        const total = (ritualSteps.get(habit.id!) ?? []).length;
        if (next.length === total) pulse(habit.id!);
      }
    }
    loadData();
  }

  function pulse(habitId: number) {
    setJustCompleted((p) => new Set(p).add(habitId));
    setTimeout(() => {
      setJustCompleted((p) => {
        const n = new Set(p);
        n.delete(habitId);
        return n;
      });
    }, 500);
  }

  /* ── derived state ── */
  function isComplete(h: Habit): boolean {
    const c = completions.get(h.id!);
    if (h.frequency === 'xperweek') {
      // Goal met = enough days completed this week
      return (weekCounts.get(h.id!) ?? 0) >= (h.timesPerWeek ?? 1);
    }
    if (!c) return false;
    if (!h.isRitual) return true;
    const steps = ritualSteps.get(h.id!) ?? [];
    return (c.stepsCompleted ?? []).length >= steps.length;
  }

  /** Is *today* already checked off (for xperweek) */
  function isTodayDone(h: Habit): boolean {
    return completions.has(h.id!);
  }

  function progress(h: Habit): number {
    if (h.frequency === 'xperweek') {
      const count = weekCounts.get(h.id!) ?? 0;
      const goal = h.timesPerWeek ?? 1;
      return Math.min(count / goal, 1);
    }
    if (!h.isRitual) return isComplete(h) ? 1 : 0;
    const c = completions.get(h.id!);
    if (!c) return 0;
    const total = (ritualSteps.get(h.id!) ?? []).length;
    return total === 0 ? 0 : (c.stepsCompleted ?? []).length / total;
  }

  /** For the warmth bar: did the user do their part for this habit today? */
  function isDoneForToday(h: Habit): boolean {
    if (h.frequency === 'xperweek') return isTodayDone(h);
    return isComplete(h);
  }

  const done = habits.filter(isDoneForToday).length;
  const warmth = habits.length > 0 ? done / habits.length : 0;

  return (
    <div className="today-view">
      <header className="today-header">
        <p className="greeting">{getGreeting()}</p>
        <h1 className="date-display">{formatDate(today)}</h1>
      </header>

      {/* warmth meter */}
      <div className="warmth-section">
        <div className="warmth-label">
          <span>
            {done} of {habits.length}
          </span>
          {warmth === 1 && habits.length > 0 && (
            <span className="warmth-complete">✨ All done!</span>
          )}
        </div>
        <div className="warmth-bar">
          <div
            className={`warmth-fill${warmth === 1 && habits.length > 0 ? ' full' : ''}`}
            style={{
              width: `${warmth * 100}%`,
              background:
                warmth > 0
                  ? `linear-gradient(90deg, #ff6b35, #ff8c42 ${Math.min(warmth * 100 + 20, 100)}%, #ffb347)`
                  : undefined,
            }}
          />
        </div>
      </div>

      {/* habit list */}
      {habits.length === 0 ? (
        <div className="empty-state">
          <p className="empty-emoji">🌅</p>
          <p>Nothing due today. Enjoy your free time!</p>
        </div>
      ) : (
        <div className="habit-list">
          {habits.map((habit) => {
            const comp = isComplete(habit);
            const prog = progress(habit);
            const expanded = expandedRitual === habit.id;
            const pulsing = justCompleted.has(habit.id!);
            const steps = ritualSteps.get(habit.id!) ?? [];
            const completion = completions.get(habit.id!);

            return (
              <div key={habit.id} className="habit-card-wrapper">
                <button
                  className={[
                    'habit-card',
                    comp && 'complete',
                    pulsing && 'just-completed',
                    prog > 0 && !comp && 'partial',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => toggleHabit(habit)}
                >
                  <span className="habit-emoji">{habit.emoji}</span>
                  <div className="habit-name-col">
                    <span className="habit-name">
                      {habit.name}
                      {habit.isRitual && (
                        <span className="ritual-indicator">
                          {expanded ? ' ▾' : ' ▸'}
                        </span>
                      )}
                    </span>
                    {habit.frequency === 'xperweek' && (
                      <span className="week-progress-badge">
                        {weekCounts.get(habit.id!) ?? 0} of{' '}
                        {habit.timesPerWeek} this week
                        {comp && ' ✨'}
                      </span>
                    )}
                  </div>
                  {habit.frequency === 'xperweek' ? (
                    <span
                      className={`check-circle${isTodayDone(habit) ? ' checked' : ''}`}
                    >
                      {isTodayDone(habit) && '✓'}
                    </span>
                  ) : (
                    <span
                      className={`check-circle${comp ? ' checked' : ''}`}
                    >
                      {comp && '✓'}
                    </span>
                  )}
                </button>

                {habit.isRitual && expanded && (
                  <div className="ritual-steps">
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
  );
}
