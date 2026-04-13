import Dexie, { type Table } from 'dexie';

export interface Habit {
  id?: number;
  name: string;
  emoji: string;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'xperweek';
  dayOfWeek?: number; // 0=Sun … 6=Sat (weekly/biweekly)
  timesPerWeek?: number; // xperweek only
  isRitual: boolean;
  sortOrder: number;
  createdAt: string; // ISO
}

export interface RitualStep {
  id?: number;
  habitId: number;
  label: string;
  sortOrder: number;
}

export interface Completion {
  id?: number;
  habitId: number;
  date: string; // YYYY-MM-DD
  completedAt: string; // ISO
  stepsCompleted?: number[]; // ritual step IDs
}

class GlowDB extends Dexie {
  habits!: Table<Habit, number>;
  ritualSteps!: Table<RitualStep, number>;
  completions!: Table<Completion, number>;

  constructor() {
    super('GlowDB');
    this.version(1).stores({
      habits: '++id, sortOrder',
      ritualSteps: '++id, habitId',
      completions: '++id, habitId, date, [habitId+date]',
    });
    // v2: adds timesPerWeek field (no schema change needed, just bump)
    this.version(2).stores({
      habits: '++id, sortOrder',
      ritualSteps: '++id, habitId',
      completions: '++id, habitId, date, [habitId+date]',
    });
  }
}

export const db = new GlowDB();

/* ── helpers ── */

export function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function startOfWeek(d: Date): Date {
  const r = new Date(d);
  r.setDate(r.getDate() - r.getDay());
  r.setHours(0, 0, 0, 0);
  return r;
}

export function isDueToday(habit: Habit, today: Date): boolean {
  const dow = today.getDay();
  switch (habit.frequency) {
    case 'daily':
      return true;
    case 'xperweek':
      return true; // always shows; completion logic decides if "done for the week"
    case 'weekly':
      return dow === habit.dayOfWeek;
    case 'biweekly': {
      if (dow !== habit.dayOfWeek) return false;
      const anchor = new Date(habit.createdAt);
      const msPerWeek = 7 * 24 * 60 * 60 * 1000;
      const weeks = Math.round(
        (startOfWeek(today).getTime() - startOfWeek(anchor).getTime()) / msPerWeek,
      );
      return weeks % 2 === 0;
    }
    default:
      return false;
  }
}

/** Get date keys for Sun–Sat of the week containing `d` */
export function weekDateKeys(d: Date): string[] {
  const sun = startOfWeek(d);
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(sun);
    day.setDate(sun.getDate() + i);
    return toDateKey(day);
  });
}

/** Count how many days this week a habit was completed */
export async function getWeekCompletionCount(
  habitId: number,
  today: Date,
): Promise<number> {
  const keys = weekDateKeys(today);
  const completions = await db.completions
    .where('habitId')
    .equals(habitId)
    .toArray();
  return completions.filter((c) => keys.includes(c.date)).length;
}

/* ── seed ── */

export async function seedIfEmpty(): Promise<void> {
  if ((await db.habits.count()) > 0) return;

  const now = new Date().toISOString();

  await db.habits.add({
    name: 'Take out trash',
    emoji: '🗑️',
    frequency: 'weekly',
    dayOfWeek: 1,
    isRitual: false,
    sortOrder: 0,
    createdAt: now,
  });

  await db.habits.add({
    name: 'Wash towels',
    emoji: '🧺',
    frequency: 'weekly',
    dayOfWeek: 3,
    isRitual: false,
    sortOrder: 1,
    createdAt: now,
  });

  await db.habits.add({
    name: 'Change sheets',
    emoji: '🛏️',
    frequency: 'biweekly',
    dayOfWeek: 6,
    isRitual: false,
    sortOrder: 2,
    createdAt: now,
  });

  const sleepId = await db.habits.add({
    name: 'Sleep hygiene',
    emoji: '🌙',
    frequency: 'daily',
    isRitual: true,
    sortOrder: 3,
    createdAt: now,
  });

  await db.ritualSteps.bulkAdd([
    { habitId: sleepId, label: 'Phone on charger in other room', sortOrder: 0 },
    { habitId: sleepId, label: 'Brush teeth', sortOrder: 1 },
    { habitId: sleepId, label: 'Wash face', sortOrder: 2 },
    { habitId: sleepId, label: 'Melatonin', sortOrder: 3 },
    { habitId: sleepId, label: 'Read for 10 minutes', sortOrder: 4 },
  ]);
}
