import { useState, useEffect, useCallback } from 'react';
import {
  db,
  toDateKey,
  isDueToday,
  type Habit,
  type Completion,
  type RitualStep,
} from './db';
import DayDetail from './DayDetail';

const DAY_HEADERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function monthLabel(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

/** Build a grid of dates: leading blanks, then 1..daysInMonth */
function buildGrid(year: number, month: number): (number | null)[] {
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = first.getDay(); // 0=Sun
  const cells: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

/** Compute warmth 0–1 for a given date */
function computeWarmth(
  dateKey: string,
  date: Date,
  habits: Habit[],
  completionsByDate: Map<string, Completion[]>,
  ritualStepsMap: Map<number, RitualStep[]>,
): number {
  const due = habits.filter((h) => isDueToday(h, date));
  if (due.length === 0) return -1; // nothing due — neutral
  const comps = completionsByDate.get(dateKey) ?? [];
  const compByHabit = new Map<number, Completion>();
  comps.forEach((c) => compByHabit.set(c.habitId, c));

  let total = 0;
  let earned = 0;

  for (const h of due) {
    if (h.frequency === 'xperweek') {
      // For calendar cells, count this day as done if it has a completion
      total += 1;
      if (compByHabit.has(h.id!)) earned += 1;
    } else if (h.isRitual) {
      const steps = ritualStepsMap.get(h.id!) ?? [];
      const stepCount = steps.length || 1;
      total += stepCount;
      const c = compByHabit.get(h.id!);
      earned += c ? (c.stepsCompleted ?? []).length : 0;
    } else {
      total += 1;
      if (compByHabit.has(h.id!)) earned += 1;
    }
  }

  return total === 0 ? -1 : earned / total;
}

function warmthColor(w: number): string {
  if (w < 0) return 'transparent';
  if (w === 0) return 'transparent';
  if (w <= 0.25) return 'rgba(255, 230, 200, 0.25)';
  if (w <= 0.5) return 'rgba(255, 200, 150, 0.4)';
  if (w <= 0.75) return 'rgba(255, 160, 80, 0.5)';
  if (w < 1) return 'rgba(255, 140, 66, 0.6)';
  return 'rgba(255, 140, 66, 0.85)';
}

function warmthGlow(w: number): string | undefined {
  if (w >= 1) return '0 0 12px rgba(255, 179, 71, 0.5)';
  if (w >= 0.75) return '0 0 6px rgba(255, 140, 66, 0.25)';
  return undefined;
}

export default function CalendarView() {
  const [viewDate, setViewDate] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completionsByDate, setCompletionsByDate] = useState<
    Map<string, Completion[]>
  >(new Map());
  const [ritualStepsMap, setRitualStepsMap] = useState<
    Map<number, RitualStep[]>
  >(new Map());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const todayKey = toDateKey(new Date());

  const loadMonth = useCallback(async () => {
    const { year, month } = viewDate;
    const allHabits = await db.habits.orderBy('sortOrder').toArray();
    setHabits(allHabits);

    // Load ritual steps
    const sMap = new Map<number, RitualStep[]>();
    for (const h of allHabits.filter((h) => h.isRitual)) {
      sMap.set(
        h.id!,
        await db.ritualSteps.where('habitId').equals(h.id!).sortBy('sortOrder'),
      );
    }
    setRitualStepsMap(sMap);

    // Load completions for the visible range (may span prev/next month padding)
    const firstVisible = new Date(year, month, 1);
    firstVisible.setDate(1 - firstVisible.getDay()); // back to Sunday
    const lastVisible = new Date(year, month + 1, 0);
    lastVisible.setDate(lastVisible.getDate() + (6 - lastVisible.getDay())); // forward to Saturday

    const startKey = toDateKey(firstVisible);
    const endKey = toDateKey(lastVisible);

    const allComps = await db.completions
      .where('date')
      .between(startKey, endKey, true, true)
      .toArray();

    const byDate = new Map<string, Completion[]>();
    allComps.forEach((c) => {
      const arr = byDate.get(c.date) ?? [];
      arr.push(c);
      byDate.set(c.date, arr);
    });
    setCompletionsByDate(byDate);
  }, [viewDate]);

  useEffect(() => {
    loadMonth();
  }, [loadMonth]);

  function prevMonth() {
    setViewDate((v) => {
      const d = new Date(v.year, v.month - 1, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  function nextMonth() {
    setViewDate((v) => {
      const d = new Date(v.year, v.month + 1, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  function goToToday() {
    const d = new Date();
    setViewDate({ year: d.getFullYear(), month: d.getMonth() });
  }

  const grid = buildGrid(viewDate.year, viewDate.month);
  const displayDate = new Date(viewDate.year, viewDate.month, 1);
  const isCurrentMonth =
    viewDate.year === new Date().getFullYear() &&
    viewDate.month === new Date().getMonth();

  return (
    <div className="calendar-view">
      <header className="calendar-header">
        <button className="cal-nav-btn" onClick={prevMonth}>
          ‹
        </button>
        <button className="cal-month-label" onClick={goToToday}>
          {monthLabel(displayDate)}
        </button>
        <button className="cal-nav-btn" onClick={nextMonth}>
          ›
        </button>
      </header>

      <div className="cal-day-headers">
        {DAY_HEADERS.map((d, i) => (
          <span key={i} className="cal-day-header">
            {d}
          </span>
        ))}
      </div>

      <div className="cal-grid">
        {grid.map((day, i) => {
          if (day == null) {
            return <div key={`blank-${i}`} className="cal-cell blank" />;
          }

          const cellDate = new Date(viewDate.year, viewDate.month, day);
          const key = toDateKey(cellDate);
          const isToday = key === todayKey;
          const isFuture = cellDate > new Date();
          const warmth = isFuture
            ? -1
            : computeWarmth(
                key,
                cellDate,
                habits,
                completionsByDate,
                ritualStepsMap,
              );

          return (
            <button
              key={key}
              className={[
                'cal-cell',
                isToday && 'today',
                isFuture && 'future',
                selectedDate === key && 'selected',
              ]
                .filter(Boolean)
                .join(' ')}
              style={{
                background: warmthColor(warmth),
                boxShadow: warmthGlow(warmth),
              }}
              onClick={() => !isFuture && setSelectedDate(key)}
              disabled={isFuture}
            >
              <span className="cal-day-num">{day}</span>
            </button>
          );
        })}
      </div>

      {!isCurrentMonth && (
        <button className="cal-today-jump" onClick={goToToday}>
          Back to today
        </button>
      )}

      {selectedDate && (
        <DayDetail
          dateKey={selectedDate}
          habits={habits}
          ritualStepsMap={ritualStepsMap}
          onClose={() => setSelectedDate(null)}
          onUpdate={loadMonth}
        />
      )}
    </div>
  );
}
