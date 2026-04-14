import { useState, useEffect, useCallback, useRef } from 'react';
import { db, type Habit, type RitualStep } from './db';

const DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const FREQ_LABELS: Record<string, string> = {
  daily: 'Every day',
  weekly: 'Weekly',
  biweekly: 'Every 2 weeks',
  xperweek: 'X per week',
};

const EMOJI_OPTIONS = [
  '✨','🧹','🧺','🛏️','🌙','💪','📖','🏃','💧','🧘',
  '🍎','💊','🪥','🐶','🗑️','📝','🎯','🌱','☀️','🧠',
  '🎨','🎵','💰','📦','🧴','🚿','🍳','📱','🧊','❤️',
];

export default function HabitsView() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [steps, setSteps] = useState<Map<number, RitualStep[]>>(new Map());
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('');
  const [frequency, setFrequency] = useState<Habit['frequency']>('daily');
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [timesPerWeek, setTimesPerWeek] = useState(3);
  const [isRitual, setIsRitual] = useState(false);
  const [stepLabels, setStepLabels] = useState<string[]>([]);
  const [deletingHabit, setDeletingHabit] = useState<Habit | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const editFormRef = useRef<HTMLFormElement>(null);

  const load = useCallback(async () => {
    const all = await db.habits.orderBy('sortOrder').toArray();
    setHabits(all);
    const sMap = new Map<number, RitualStep[]>();
    for (const h of all.filter((h) => h.isRitual)) {
      sMap.set(
        h.id!,
        await db.ritualSteps.where('habitId').equals(h.id!).sortBy('sortOrder'),
      );
    }
    setSteps(sMap);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (showForm && !editingId && formRef.current) {
      requestAnimationFrame(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }, [showForm, editingId]);

  useEffect(() => {
    if (editingId != null && editFormRef.current) {
      requestAnimationFrame(() => {
        editFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    }
  }, [editingId]);

  function openAddForm() {
    setEditingId(null);
    setName('');
    setEmoji('');
    setFrequency('daily');
    setDayOfWeek(1);
    setTimesPerWeek(3);
    setIsRitual(false);
    setStepLabels([]);
    setShowForm(true);
  }

  function openEditForm(h: Habit) {
    setShowForm(false);
    setDeletingHabit(null);
    setEditingId(h.id!);
    setName(h.name);
    setEmoji(h.emoji);
    setFrequency(h.frequency);
    setDayOfWeek(h.dayOfWeek ?? 1);
    setTimesPerWeek(h.timesPerWeek ?? 3);
    setIsRitual(h.isRitual);
    const existingSteps = steps.get(h.id!) ?? [];
    setStepLabels(existingSteps.map((s) => s.label));
  }

  async function saveHabit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    const data: Partial<Habit> = {
      name: name.trim(),
      emoji: emoji || '✨',
      frequency,
      dayOfWeek: frequency === 'weekly' || frequency === 'biweekly' ? dayOfWeek : undefined,
      timesPerWeek: frequency === 'xperweek' ? timesPerWeek : undefined,
    };

    const ritualFlag = isRitual && stepLabels.filter((s) => s.trim()).length > 0;
    data.isRitual = ritualFlag;

    if (editingId != null) {
      // Update existing — keeps all completions intact
      await db.habits.update(editingId, data);
      // Rebuild ritual steps
      await db.ritualSteps.where('habitId').equals(editingId).delete();
      if (ritualFlag) {
        await db.ritualSteps.bulkAdd(
          stepLabels
            .filter((s) => s.trim())
            .map((label, i) => ({ habitId: editingId, label: label.trim(), sortOrder: i })),
        );
      }
    } else {
      const newId = await db.habits.add({
        ...data,
        isRitual: ritualFlag,
        sortOrder: habits.length,
        createdAt: new Date().toISOString(),
      } as Habit);
      if (ritualFlag) {
        await db.ritualSteps.bulkAdd(
          stepLabels
            .filter((s) => s.trim())
            .map((label, i) => ({ habitId: newId as number, label: label.trim(), sortOrder: i })),
        );
      }
    }

    setShowForm(false);
    setEditingId(null);
    setDeletingHabit(null);
    load();
  }

  async function confirmDelete() {
    if (!deletingHabit) return;
    await db.completions.where('habitId').equals(deletingHabit.id!).delete();
    await db.ritualSteps.where('habitId').equals(deletingHabit.id!).delete();
    await db.habits.delete(deletingHabit.id!);
    setEditingId(null);
    setDeletingHabit(null);
    load();
  }

  function renderFormFields(isEdit: boolean) {
    return (
      <>
        <label className="form-label">Pick an emoji</label>
        <div className="emoji-grid">
          {EMOJI_OPTIONS.map((e) => (
            <button
              key={e}
              type="button"
              className={`emoji-option${emoji === e ? ' selected' : ''}`}
              onClick={() => setEmoji(e)}
            >
              {e}
            </button>
          ))}
        </div>

        <label className="form-label">Habit name</label>
        <input
          className="form-input name-input"
          placeholder="e.g. Drink water"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label className="form-label">Frequency</label>
        <div className="form-row">
          <select
            className="form-select"
            value={frequency}
            onChange={(e) =>
              setFrequency(e.target.value as Habit['frequency'])
            }
          >
            <option value="daily">Every day</option>
            <option value="weekly">Weekly</option>
            <option value="biweekly">Every 2 weeks</option>
            <option value="xperweek">X times per week</option>
          </select>
          {(frequency === 'weekly' || frequency === 'biweekly') && (
            <select
              className="form-select"
              value={dayOfWeek}
              onChange={(e) => setDayOfWeek(Number(e.target.value))}
            >
              {DAYS.map((d, i) => (
                <option key={i} value={i}>
                  {d}
                </option>
              ))}
            </select>
          )}
          {frequency === 'xperweek' && (
            <div className="times-per-week-row">
              <button
                type="button"
                className="stepper-btn"
                onClick={() => setTimesPerWeek((v) => Math.max(1, v - 1))}
              >
                −
              </button>
              <span className="stepper-value">{timesPerWeek}×</span>
              <button
                type="button"
                className="stepper-btn"
                onClick={() => setTimesPerWeek((v) => Math.min(7, v + 1))}
              >
                +
              </button>
            </div>
          )}
        </div>

        <div className="ritual-toggle-row">
          <span className="form-label">Ritual</span>
          <button
            type="button"
            className={`toggle-switch${isRitual ? ' on' : ''}`}
            onClick={() => {
              const next = !isRitual;
              setIsRitual(next);
              if (next && stepLabels.length === 0) setStepLabels(['']);
            }}
            aria-pressed={isRitual}
          >
            <span className="toggle-thumb" />
          </button>
        </div>

        {isRitual && (
          <div className="step-editor">
            <label className="form-label">Steps</label>
            {stepLabels.map((label, i) => (
              <div key={i} className="step-editor-row">
                <span className="step-number">{i + 1}.</span>
                <input
                  className="form-input step-input"
                  placeholder={`Step ${i + 1}`}
                  value={label}
                  onChange={(e) => {
                    const copy = [...stepLabels];
                    copy[i] = e.target.value;
                    setStepLabels(copy);
                  }}
                />
                <button
                  type="button"
                  className="step-remove-btn"
                  onClick={() => setStepLabels(stepLabels.filter((_, j) => j !== i))}
                  aria-label="Remove step"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              className="step-add-btn"
              onClick={() => setStepLabels([...stepLabels, ''])}
            >
              + Add step
            </button>
          </div>
        )}

        {isEdit && (
          <div className="delete-zone">
            <button
              type="button"
              className="delete-trigger"
              onClick={() => {
                const h = habits.find((h) => h.id === editingId);
                if (h) setDeletingHabit(h);
              }}
            >
              Delete habit…
            </button>
          </div>
        )}
        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => { setShowForm(false); setEditingId(null); setDeletingHabit(null); }}
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            {isEdit ? 'Save' : 'Add Habit'}
          </button>
        </div>
      </>
    );
  }

  return (
    <div className="habits-view">
      <header className="view-header">
        <h1>Your Habits</h1>
      </header>

      <div className="habit-manage-list">
        {habits.map((h) => (
          <div key={h.id} className="habit-manage-wrapper">
            <div className="habit-manage-card">
              <button
                className="habit-manage-info"
                onClick={() => {
                  if (editingId === h.id!) {
                    setEditingId(null);
                    setDeletingHabit(null);
                  } else {
                    openEditForm(h);
                  }
                }}
              >
                <span className="habit-emoji">{h.emoji}</span>
                <div>
                  <p className="habit-manage-name">{h.name}</p>
                  <p className="habit-manage-freq">
                    {h.frequency === 'xperweek'
                      ? `${h.timesPerWeek}× per week`
                      : FREQ_LABELS[h.frequency]}
                    {h.dayOfWeek != null &&
                      (h.frequency === 'weekly' || h.frequency === 'biweekly') &&
                      ` · ${DAYS[h.dayOfWeek]}`}
                    {h.isRitual &&
                      ` · ${(steps.get(h.id!) ?? []).length} steps`}
                  </p>
                </div>
                <span className="edit-chevron">{editingId === h.id! ? '▾' : '▸'}</span>
              </button>
            </div>
            {editingId === h.id! && (
              <form
                className="add-form inline-edit-form"
                ref={editFormRef}
                onSubmit={saveHabit}
              >
                {renderFormFields(true)}
              </form>
            )}
          </div>
        ))}
      </div>

      {showForm && editingId == null ? (
        <form className="add-form" ref={formRef} onSubmit={saveHabit}>
          {renderFormFields(false)}
        </form>
      ) : editingId == null ? (
        <button className="add-btn" onClick={openAddForm}>
          + Add Habit
        </button>
      ) : null}

      {deletingHabit && (
        <div className="day-detail-overlay" onClick={() => setDeletingHabit(null)}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="delete-modal-icon">{deletingHabit.emoji}</div>
            <h2 className="delete-modal-title">{deletingHabit.name}</h2>
            <p className="delete-modal-meta">
              Created {new Date(deletingHabit.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
              {' · '}
              {deletingHabit.frequency === 'xperweek'
                ? `${deletingHabit.timesPerWeek}× per week`
                : FREQ_LABELS[deletingHabit.frequency]}
            </p>
            <p className="delete-modal-warning">
              This will permanently delete this habit and all of its completion history.
            </p>
            <div className="delete-modal-actions">
              <button
                className="btn-secondary"
                onClick={() => setDeletingHabit(null)}
              >
                Keep Habit
              </button>
              <button
                className="btn-danger"
                onClick={confirmDelete}
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
