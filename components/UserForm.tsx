'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '../app/utils/supabase';
import MaterialIcon from './MaterialIcon';
import { LOGO_URL } from '@/lib/brand';

const TOTAL_STEPS = 4;

const DIET_OPTIONS = [
  'כשר',
  'צמחוני',
  'טבעוני',
  'ללא גלוטן',
  'קיטו',
  'אלרגיה לאגוזים',
  'ללא לקטוז',
  'דל פחמימה',
];

const GOALS = [
  {
    value: 'lose',
    label: 'ירידה במשקל',
    desc: 'שריפת שומן ושמירה על גירעון קלורי בריא',
    icon: 'trending_down',
    iconClass: 'text-secondary',
  },
  {
    value: 'maintain',
    label: 'חיטוב הגוף',
    desc: 'שילוב של בניית שריר וירידה באחוזי שומן',
    icon: 'fitness_center',
    iconClass: 'text-primary',
  },
  {
    value: 'gain',
    label: 'עלייה במסת שריר',
    desc: 'מיקוד בבניית כוח ותזונה עשירה בחלבון',
    icon: 'bolt',
    iconClass: 'text-tertiary',
  },
] as const;

function workoutsToActivity(sedentary: boolean, workouts: number) {
  if (sedentary) return 1.2;
  if (workouts <= 1) return 1.375;
  if (workouts <= 3) return 1.55;
  if (workouts <= 5) return 1.725;
  return 1.9;
}

export default function UserForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lifestyle, setLifestyle] = useState<'sedentary' | 'active'>('sedentary');
  const [workoutsPerWeek, setWorkoutsPerWeek] = useState(3);

  const [formData, setFormData] = useState({
    age: '',
    gender: 'female',
    weight: '',
    height: '',
    goal: 'lose',
    targetWeight: '',
    activityLevel: 1.2,
    dietaryPreferences: [] as string[],
  });

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
      else {
        console.error('No user found in session', authError);
        setError('משתמש לא מחובר. אנא בצע הרשמה או התחברות.');
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      activityLevel: workoutsToActivity(lifestyle === 'sedentary', workoutsPerWeek),
    }));
  }, [lifestyle, workoutsPerWeek]);

  const progress = (step / TOTAL_STEPS) * 100;

  const canContinue = () => {
    if (step === 1) {
      return Boolean(
        formData.age &&
          formData.height &&
          formData.weight &&
          formData.targetWeight
      );
    }
    return true;
  };

  const handleSubmit = async () => {
    setError('');
    setIsLoading(true);

    if (!userId) {
      setError('משתמש לא מזוהה. אנא הרשם מחדש.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          age: formData.age,
          gender: formData.gender,
          weight: formData.weight,
          height: formData.height,
          goal: formData.goal,
          targetWeight: formData.targetWeight || formData.weight,
          activityLevel: formData.activityLevel,
          dietaryPreferences: formData.dietaryPreferences,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'אירעה שגיאה בשמירת הנתונים בשרת');
      }

      router.push('/summary');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'שגיאה בתהליך השמירה. נסה שוב.');
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (!canContinue()) {
      setError('נא למלא את כל השדות בשלב זה');
      return;
    }
    setError('');
    if (step < TOTAL_STEPS) setStep((s) => s + 1);
    else void handleSubmit();
  };

  const toggleDiet = (diet: string) => {
    setFormData((prev) => {
      const current = prev.dietaryPreferences;
      const next = current.includes(diet)
        ? current.filter((i) => i !== diet)
        : [...current, diet];
      return { ...prev, dietaryPreferences: next };
    });
  };

  return (
    <div className="w-full min-h-screen bg-background text-on-surface">
      <header className="fixed top-0 left-1/2 z-50 w-full max-w-[430px] -translate-x-1/2 bg-surface/80 backdrop-blur-xl pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 px-container-margin flex items-center gap-3">
          <img alt="Calceat" className="h-8 w-auto object-contain" src={LOGO_URL} />
          <span className="font-headline text-headline-sm font-semibold text-primary">
            יצירת פרופיל
          </span>
        </div>
      </header>

      <main className="pt-16 pb-10 px-container-margin max-w-lg mx-auto">
        <div className="flex flex-col gap-4 sticky top-16 bg-background/95 backdrop-blur-md pt-4 z-20 pb-2">
          <div className="flex justify-between items-center">
            <span className="text-label-md font-semibold text-primary">
              שלב {step} מתוך {TOTAL_STEPS}
            </span>
            <span className="text-label-md font-semibold text-on-surface-variant">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {error && (
          <p className="mt-4 text-error text-label-md font-medium">{error}</p>
        )}

        <div className="relative mt-6 min-h-[420px]">
          {step === 1 && (
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-2">
                <h2 className="font-headline text-headline-md font-semibold text-on-surface">
                  ספרי לנו קצת על עצמך
                </h2>
                <p className="text-body-md text-on-surface-variant">
                  הנתונים האלו יעזרו לנו לדייק את תוכנית התזונה והאימונים שלך.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 flex flex-col gap-3">
                  <span className="text-label-md font-semibold text-on-surface-variant">
                    מין
                  </span>
                  <div className="flex gap-3">
                    {(
                      [
                        ['female', 'נקבה'],
                        ['male', 'זכר'],
                      ] as const
                    ).map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setFormData({ ...formData, gender: value })}
                        className={`flex-1 py-4 rounded-xl font-semibold text-label-md transition-all ${
                          formData.gender === value
                            ? 'bg-primary text-on-primary'
                            : 'bg-surface-container-low text-on-surface'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {(
                  [
                    ['age', 'גיל', '25'],
                    ['height', 'גובה (ס״מ)', '165'],
                    ['weight', 'משקל נוכחי (ק״ג)', '68'],
                    ['targetWeight', 'משקל יעד (ק״ג)', '62'],
                  ] as const
                ).map(([key, label, placeholder]) => (
                  <div key={key} className="flex flex-col gap-2">
                    <label className="text-label-md font-semibold text-on-surface-variant">
                      {label}
                    </label>
                    <input
                      className="w-full bg-surface-container-low p-4 rounded-xl text-on-surface outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder={placeholder}
                      type="number"
                      value={formData[key]}
                      onChange={(e) =>
                        setFormData({ ...formData, [key]: e.target.value })
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-2">
                <h2 className="font-headline text-headline-md font-semibold text-on-surface">
                  רמת פעילות
                </h2>
                <p className="text-body-md text-on-surface-variant">
                  כמה את בתנועה במהלך היום?
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <button
                  type="button"
                  onClick={() => setLifestyle('sedentary')}
                  className={`p-6 rounded-2xl flex items-center gap-4 text-right transition-all ${
                    lifestyle === 'sedentary'
                      ? 'bg-primary-container text-on-primary-container shadow-md'
                      : 'bg-surface-container-low'
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-secondary-container/30 flex items-center justify-center text-secondary shrink-0">
                    <MaterialIcon name="desk" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-label-md font-semibold">יושבנית</span>
                    <span className="text-xs text-on-surface-variant">
                      עבודה משרדית, מעט תנועה
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setLifestyle('active')}
                  className={`p-6 rounded-2xl flex items-center gap-4 text-right transition-all ${
                    lifestyle === 'active'
                      ? 'bg-primary-container text-on-primary-container shadow-md'
                      : 'bg-surface-container-low'
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-primary-container/30 flex items-center justify-center text-primary shrink-0">
                    <MaterialIcon name="directions_run" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-label-md font-semibold">פעילה</span>
                    <span className="text-xs text-on-surface-variant">
                      עבודה פיזית או הרבה הליכה
                    </span>
                  </div>
                </button>

                <div className="mt-4 flex flex-col gap-3">
                  <label className="text-label-md font-semibold text-on-surface-variant">
                    כמה אימונים בשבוע?
                  </label>
                  <div className="flex justify-between items-center gap-2 max-w-xs mx-auto w-full">
                    <button
                      type="button"
                      className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center"
                      onClick={() =>
                        setWorkoutsPerWeek((n) => Math.max(0, n - 1))
                      }
                      aria-label="הפחת"
                    >
                      <MaterialIcon name="remove" />
                    </button>
                    <span className="font-headline text-headline-md font-semibold w-12 text-center text-primary">
                      {workoutsPerWeek}
                    </span>
                    <button
                      type="button"
                      className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center"
                      onClick={() =>
                        setWorkoutsPerWeek((n) => Math.min(7, n + 1))
                      }
                      aria-label="הוסף"
                    >
                      <MaterialIcon name="add" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-2">
                <h2 className="font-headline text-headline-md font-semibold text-on-surface">
                  מה המטרה שלך?
                </h2>
                <p className="text-body-md text-on-surface-variant">
                  נוכל להתאים את התפריט לפי היעד האישי שלך.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {GOALS.map((goal) => (
                  <button
                    key={goal.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, goal: goal.value })}
                    className={`p-5 rounded-2xl border-2 text-right transition-all ${
                      formData.goal === goal.value
                        ? 'bg-primary-container text-on-primary-container border-primary/30 shadow-md'
                        : 'bg-surface-container-low border-transparent'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-label-md font-semibold">{goal.label}</span>
                      <MaterialIcon name={goal.icon} className={goal.iconClass} />
                    </div>
                    <p className="text-xs text-on-surface-variant">{goal.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-2">
                <h2 className="font-headline text-headline-md font-semibold text-on-surface">
                  העדפות תזונה
                </h2>
                <p className="text-body-md text-on-surface-variant">
                  חשוב לנו שיהיה לך טעים ונוח.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {DIET_OPTIONS.map((diet) => {
                  const active = formData.dietaryPreferences.includes(diet);
                  return (
                    <button
                      key={diet}
                      type="button"
                      onClick={() => toggleDiet(diet)}
                      className={`px-5 py-3 rounded-full text-label-sm font-medium transition-all ${
                        active
                          ? 'bg-primary text-on-primary'
                          : 'bg-surface-container-low text-on-surface'
                      }`}
                    >
                      {diet}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 p-6 rounded-3xl bg-primary/10 flex flex-col items-center text-center gap-3">
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm">
                  <MaterialIcon
                    name="auto_awesome"
                    className="text-primary text-[32px]"
                  />
                </div>
                <p className="text-label-md font-semibold text-primary">
                  כמעט סיימנו! המתכונים שלך יותאמו אוטומטית לפי הבחירות שלך.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 mt-8 pb-10">
          <button
            type="button"
            onClick={nextStep}
            disabled={isLoading}
            className="w-full py-4 rounded-full bg-primary text-on-primary font-headline text-headline-sm font-semibold shadow-md transition-transform active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <MaterialIcon name="auto_awesome" className="animate-pulse" />
                {step === TOTAL_STEPS ? 'מנתחת עם AI...' : 'שומר...'}
              </>
            ) : step === TOTAL_STEPS ? (
              'בואי נתחיל!'
            ) : (
              'המשך'
            )}
          </button>
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="w-full py-4 rounded-full border-2 border-primary/20 text-primary text-label-md font-semibold bg-transparent"
            >
              חזרה
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
