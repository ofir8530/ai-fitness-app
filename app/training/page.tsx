'use client';

import { useEffect, useState, FormEvent } from 'react';
import AppHeader from '@/components/AppHeader';
import MaterialIcon from '@/components/MaterialIcon';
import { createClient } from '@/app/utils/supabase';
import {
  type WorkoutEntry,
  makeWorkoutId,
  mapDbWorkoutToEntry,
  mapEntryToDbWorkout,
  workoutMeta,
} from '@/lib/workouts';

export default function TrainingPage() {
  const [showToast, setShowToast] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    type: 'pilates',
    duration: '',
    calories: '',
  });
  const [workouts, setWorkouts] = useState<WorkoutEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadWorkouts() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || !isMounted) return;

      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data && isMounted) {
        setWorkouts(data.map(mapDbWorkoutToEntry));
      }
    }

    loadWorkouts();
    return () => {
      isMounted = false;
    };
  }, []);

  const resetDraft = () => {
    setDraft({ type: 'pilates', duration: '', calories: '' });
    setEditingId(null);
  };

  const handleEdit = (entry: WorkoutEntry) => {
    setEditingId(entry.id);
    setDraft({
      type: entry.type,
      duration: String(entry.duration),
      calories: String(entry.calories),
    });
  };

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const type = String(draft.type || 'pilates');
    const duration = Math.max(0, Number(draft.duration) || 0);
    const calories = Math.max(0, Number(draft.calories) || 0);
    const meta = workoutMeta[type] ?? workoutMeta.pilates;
    const currentTime = new Date().toISOString();

    const nextEntry: WorkoutEntry = {
      id: editingId || makeWorkoutId(),
      type,
      title: meta.title,
      time: `היום, ${new Date().toLocaleTimeString('he-IL', {
        hour: '2-digit',
        minute: '2-digit',
      })}`,
      duration,
      calories,
      icon: meta.icon,
      bg: meta.bg,
      color: meta.color,
    };

    setLoading(true);

    try {
      const payload = mapEntryToDbWorkout(nextEntry, user.id);

      if (editingId) {
        const { error } = await supabase
          .from('workouts')
          .update({
            type: payload.type,
            title: payload.title,
            time: payload.time,
            duration: payload.duration,
            calories: payload.calories,
            icon: payload.icon,
            bg: payload.bg,
            color: payload.color,
          })
          .eq('id', editingId)
          .eq('user_id', user.id);

        if (error) throw error;

        setWorkouts((prev) =>
          prev.map((workout) => (workout.id === editingId ? nextEntry : workout))
        );
      } else {
        const { id: _ignoredId, ...insertPayload } = payload;
        const { error } = await supabase.from('workouts').insert([
          {
            ...insertPayload,
            created_at: currentTime,
          },
        ]);

        if (error) throw error;

        setWorkouts((prev) => [nextEntry, ...prev]);
      }

      resetDraft();
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error('Workout save failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase
      .from('workouts')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (!error) {
      setWorkouts((prev) => prev.filter((workout) => workout.id !== id));
    }
  };

  return (
    <>
      <AppHeader title="Training" />
      <div className="relative w-full pt-16 pb-24 bg-surface min-h-screen">
        <div className="flex flex-col w-full">
          <div className="px-container-margin mb-8 relative">
            <div className="bg-primary-container/20 rounded-3xl p-8 flex items-center justify-between overflow-hidden relative">
              <div className="relative z-10 max-w-[60%]">
                <h2 className="font-headline text-headline-md font-semibold text-on-primary-container mb-2">
                  איך היה האימון שלך היום?
                </h2>
                <p className="text-label-md text-on-primary-container/80">
                  כל דקה של תנועה היא צעד נוסף לעבר הגרסה הטובה ביותר שלך.
                </p>
              </div>
              <div className="w-24 h-24 relative z-10 flex items-center justify-center bg-surface/40 backdrop-blur-md rounded-full">
                <MaterialIcon
                  name="favorite"
                  filled
                  className="text-primary text-5xl"
                />
              </div>
              <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
              <div className="absolute -left-4 -top-4 w-24 h-24 bg-secondary-container/20 rounded-full blur-2xl" />
            </div>
          </div>

          <div className="px-container-margin mb-10">
            <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <MaterialIcon name="add_circle" className="text-primary" />
                <h3 className="font-headline text-headline-sm font-semibold text-on-surface">
                  תיעוד אימון חדש
                </h3>
              </div>
              <form className="space-y-6" onSubmit={handleSave}>
                <div className="space-y-2">
                  <label className="text-label-md font-semibold text-on-surface-variant block px-1">
                    סוג אימון
                  </label>
                  <div className="relative">
                    <select
                      name="type"
                      value={draft.type}
                      onChange={(e) => setDraft((prev) => ({ ...prev, type: e.target.value }))}
                      className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3.5 appearance-none text-body-md text-on-surface focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    >
                      <option value="pilates">פילאטיס</option>
                      <option value="yoga">יוגה</option>
                      <option value="strength">אימון כוח</option>
                      <option value="hiit">HIIT</option>
                      <option value="walking">הליכה</option>
                      <option value="running">ריצה</option>
                    </select>
                    <MaterialIcon
                      name="expand_more"
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-label-md font-semibold text-on-surface-variant block px-1">
                      זמן (דקות)
                    </label>
                    <div className="relative">
                      <input
                        name="duration"
                        value={draft.duration}
                        onChange={(e) => setDraft((prev) => ({ ...prev, duration: e.target.value }))}
                        className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3.5 text-body-md text-on-surface focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                        placeholder="45"
                        type="number"
                      />
                      <MaterialIcon
                        name="schedule"
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-label-md font-semibold text-on-surface-variant block px-1">
                      קלוריות שנשרפו
                    </label>
                    <div className="relative">
                      <input
                        name="calories"
                        value={draft.calories}
                        onChange={(e) => setDraft((prev) => ({ ...prev, calories: e.target.value }))}
                        className="w-full bg-surface-container-low border-none rounded-xl px-4 py-3.5 text-body-md text-on-surface focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                        placeholder="250"
                        type="number"
                      />
                      <MaterialIcon
                        name="local_fire_department"
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/50 text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-primary text-on-primary text-label-md font-semibold py-4 rounded-full shadow-md hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <span>{loading ? 'שומר...' : editingId ? 'עדכון אימון' : 'שמירת אימון'}</span>
                    <MaterialIcon name="check" className="text-lg" />
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={resetDraft}
                      className="px-4 py-4 rounded-full border border-outline text-on-surface text-label-md font-semibold"
                    >
                      ביטול
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          <div className="px-container-margin pb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-headline text-headline-sm font-semibold text-on-surface">
                אימונים אחרונים
              </h3>
              <button
                type="button"
                className="text-primary text-label-md font-semibold bg-transparent"
              >
                הצג הכל
              </button>
            </div>
            <div className="space-y-4">
              {workouts.length === 0 ? (
                <div className="bg-surface-container-low rounded-2xl p-6 text-center text-on-surface-variant">
                  עדיין אין אימונים שמורים. הוסיפי אימון ראשון כדי להתחיל להציג את ההיסטוריה שלך.
                </div>
              ) : (
                workouts.map((w) => (
                  <div
                    key={w.id}
                    className="bg-surface-container-low rounded-2xl p-4 flex items-center gap-4 active:bg-surface-container-high transition-colors"
                  >
                    <div
                      className={`w-14 h-14 rounded-xl ${w.bg} flex items-center justify-center ${w.color} shrink-0`}
                    >
                      <MaterialIcon name={w.icon} className="text-3xl" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-label-md font-semibold text-on-surface truncate">
                          {w.title}
                        </h4>
                        <span className="text-label-sm font-medium text-on-surface-variant shrink-0">
                          {w.time}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1 text-on-surface-variant">
                          <MaterialIcon name="schedule" className="text-sm" />
                          <span className="text-label-sm font-medium">
                            {w.duration} דק'
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-on-surface-variant">
                          <MaterialIcon
                            name="local_fire_department"
                            className="text-sm"
                          />
                          <span className="text-label-sm font-medium">
                            {w.calories} קל'
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleEdit(w)}
                        className="text-primary text-label-sm font-semibold"
                      >
                        עריכה
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(w.id)}
                        className="text-error text-label-sm font-semibold"
                      >
                        מחיקה
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div
          className={`fixed bottom-24 left-1/2 -translate-x-1/2 bg-on-surface text-surface px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 z-[60] transition-all duration-500 ${
            showToast
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
        >
          <MaterialIcon name="check_circle" className="text-primary-fixed" />
          <span className="text-label-md font-semibold">
            האימון נשמר בהצלחה!
          </span>
        </div>
      </div>
    </>
  );
}
