'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/AppHeader';
import MaterialIcon from '@/components/MaterialIcon';
import { createClient } from '@/app/utils/supabase';

type ProfileView = {
  displayName: string;
  email: string;
  age: number | null;
  gender: string | null;
  weight: number | null;
  height: number | null;
  targetWeight: number | null;
  goal: string | null;
  activityLevel: number | null;
  dietaryPreferences: string[];
  dailyCalories: number;
  protein: number;
  carbs: number;
  fats: number;
  aiInsight?: string;
};

const GOAL_LABELS: Record<string, string> = {
  lose: 'ירידה במשקל',
  maintain: 'חיטוב הגוף',
  gain: 'עלייה במסת שריר',
};

const ACTIVITY_LABELS: Record<number, string> = {
  1.2: 'יושבנית',
  1.375: 'פעילות קלה',
  1.55: 'פעילות מתונה',
  1.725: 'פעילות גבוהה',
  1.9: 'פעילות גבוהה מאוד',
};

function activityLabel(level: number | null) {
  if (!level) return 'לא הוגדר';
  return ACTIVITY_LABELS[level] || `מקדם ${level}`;
}

export default function ProfileClient({ profile }: { profile: ProfileView }) {
  const router = useRouter();
  const [chartMode, setChartMode] = useState<'daily' | 'weekly'>('daily');
  const [loggingOut, setLoggingOut] = useState(false);

  const weight = profile.weight ?? 0;
  const target = profile.targetWeight ?? weight;
  const startGuess =
    profile.goal === 'gain'
      ? Math.min(weight, target) - Math.abs(target - weight) * 0.2
      : Math.max(weight, target) + Math.abs(weight - target) * 0.25;

  const totalDelta = Math.abs(startGuess - target) || 1;
  const doneDelta = Math.abs(startGuess - weight);
  const progressPct = Math.min(100, Math.round((doneDelta / totalDelta) * 100));
  const remainingKg = Math.abs(weight - target);

  const handleLogout = async () => {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <>
      <AppHeader title="Profile" />
      <div className="relative w-full pt-16 pb-24 bg-background min-h-screen">
        <div className="flex flex-col w-full px-container-margin gap-6 max-w-lg mx-auto">
          <section className="flex flex-col gap-2 pt-4">
            <div className="flex items-center gap-2">
              <MaterialIcon
                name="auto_awesome"
                filled
                className="text-secondary"
              />
              <h2 className="font-headline text-headline-md font-semibold text-on-surface">
                ההתקדמות שלך
                {profile.displayName ? `, ${profile.displayName}` : ''}
              </h2>
            </div>
            <p className="text-body-md text-on-surface-variant">
              כל צעד קטן הוא ניצחון גדול. את בדרך הנכונה!
            </p>
            {profile.email && (
              <p className="text-label-sm text-on-surface-variant/80">
                {profile.email}
              </p>
            )}
          </section>

          <section className="bg-primary-container/20 rounded-xl p-5 relative overflow-hidden">
            <div className="relative z-10 flex flex-col gap-3">
              <div className="flex justify-between items-end gap-3">
                <div className="flex flex-col">
                  <span className="text-label-sm text-on-primary-container opacity-80">
                    היעד הבא
                  </span>
                  <span className="font-headline text-headline-sm font-semibold text-on-primary-container">
                    {GOAL_LABELS[profile.goal || ''] || 'יעד אישי'}
                    {target ? ` · ${target} ק״ג` : ''}
                  </span>
                </div>
                <span className="text-label-md text-primary font-bold bg-white/60 px-3 py-1 rounded-full">
                  {progressPct}%
                </span>
              </div>
              <div className="w-full h-3 bg-white/40 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-1000"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <p className="text-label-sm text-on-primary-container/70">
                {remainingKg < 0.1
                  ? 'הגעת למשקל היעד — כל הכבוד!'
                  : `עוד ${remainingKg.toFixed(1)} ק״ג להשגת היעד.`}
              </p>
            </div>
            <svg
              className="absolute -bottom-4 -left-4 text-primary/10 w-24 h-24"
              fill="currentColor"
              viewBox="0 0 100 100"
            >
              <circle cx="50" cy="50" r="40" />
            </svg>
          </section>

          <section className="bg-surface-container-lowest rounded-xl p-5 shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="font-headline text-headline-sm font-semibold text-primary">
                משקל נוכחי
              </h3>
              <div className="flex bg-surface-container rounded-full p-1">
                <button
                  type="button"
                  onClick={() => setChartMode('daily')}
                  className={`px-4 py-1 rounded-full text-label-sm font-medium transition-all ${
                    chartMode === 'daily'
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-on-surface-variant bg-transparent'
                  }`}
                >
                  יומי
                </button>
                <button
                  type="button"
                  onClick={() => setChartMode('weekly')}
                  className={`px-4 py-1 rounded-full text-label-sm font-medium transition-all ${
                    chartMode === 'weekly'
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-on-surface-variant bg-transparent'
                  }`}
                >
                  שבועי
                </button>
              </div>
            </div>

            <div className="h-40 w-full relative flex items-center justify-center bg-surface-container-low rounded-xl">
              <div className="text-center">
                <p className="font-headline text-headline-lg-mobile font-bold text-primary">
                  {weight || '—'}
                  <span className="text-label-md text-on-surface-variant mr-1">
                    ק״ג
                  </span>
                </p>
                <p className="text-label-sm text-on-surface-variant mt-1">
                  {chartMode === 'daily' ? 'משקל עדכני' : 'סיכום שבועי'}
                </p>
                {target > 0 && (
                  <p className="text-label-sm text-primary mt-2 font-semibold">
                    יעד: {target} ק״ג
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="font-headline text-headline-sm font-semibold text-on-surface">
                הפרטים שלך
              </h3>
              <Link
                href="/onboarding"
                className="text-primary text-label-md font-semibold flex items-center gap-1"
              >
                עדכון פרטים
                <MaterialIcon name="edit" className="text-[18px]" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <InfoTile label="גיל" value={profile.age ? `${profile.age}` : '—'} />
              <InfoTile
                label="מין"
                value={
                  profile.gender === 'male'
                    ? 'זכר'
                    : profile.gender === 'female'
                      ? 'נקבה'
                      : '—'
                }
              />
              <InfoTile
                label="גובה"
                value={profile.height ? `${profile.height} ס״מ` : '—'}
              />
              <InfoTile
                label="משקל"
                value={profile.weight ? `${profile.weight} ק״ג` : '—'}
              />
              <InfoTile
                label="משקל יעד"
                value={profile.targetWeight ? `${profile.targetWeight} ק״ג` : '—'}
              />
              <InfoTile
                label="מטרה"
                value={GOAL_LABELS[profile.goal || ''] || '—'}
              />
              <InfoTile
                label="פעילות"
                value={activityLabel(profile.activityLevel)}
                className="col-span-2"
              />
            </div>

            {profile.dietaryPreferences.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {profile.dietaryPreferences.map((d) => (
                  <span
                    key={d}
                    className="px-3 py-1.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant text-label-sm font-medium"
                  >
                    {d}
                  </span>
                ))}
              </div>
            )}
          </section>

          <section className="bg-surface-container-low rounded-xl p-5 flex flex-col gap-3">
            <h3 className="font-headline text-headline-sm font-semibold text-on-surface">
              יעדים יומיים מחושבים
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <InfoTile
                label="קלוריות"
                value={`${profile.dailyCalories.toLocaleString('he-IL')}`}
              />
              <InfoTile label="חלבון" value={`${profile.protein}g`} />
              <InfoTile label="פחמימות" value={`${profile.carbs}g`} />
              <InfoTile label="שומן" value={`${profile.fats}g`} />
            </div>
          </section>

          {profile.aiInsight && (
            <section className="bg-surface-container-low rounded-xl p-4">
              <h3 className="font-headline text-headline-sm font-semibold text-on-surface mb-2">
                תובנה אישית
              </h3>
              <p className="text-body-md text-on-surface-variant leading-relaxed">
                {profile.aiInsight}
              </p>
            </section>
          )}

          <Link
            href="/chat"
            className="w-full py-4 bg-secondary text-on-secondary rounded-full text-label-md font-semibold flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-transform"
          >
            <MaterialIcon name="chat" />
            ייעוץ תזונה ב-AI
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full py-4 border-2 border-error/20 text-error rounded-full text-label-md font-semibold bg-transparent mb-4"
          >
            {loggingOut ? 'מתנתק...' : 'התנתקות'}
          </button>
        </div>
      </div>
    </>
  );
}

function InfoTile({
  label,
  value,
  className = '',
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div
      className={`bg-secondary-container/10 p-4 rounded-xl flex flex-col gap-1 ${className}`}
    >
      <span className="text-label-sm text-on-secondary-container opacity-70">
        {label}
      </span>
      <span className="font-headline text-headline-sm font-semibold text-on-secondary-container">
        {value}
      </span>
    </div>
  );
}
