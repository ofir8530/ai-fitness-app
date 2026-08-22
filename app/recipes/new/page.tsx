'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AppHeader from '@/components/AppHeader';
import MaterialIcon from '@/components/MaterialIcon';
import { getRecipeNutritionAnalysis } from '@/app/actions/recipeActions';
import {
  createRecipeId,
  DEFAULT_RECIPE_IMAGE,
  saveUserRecipe,
} from '@/lib/recipeStorage';
import type { Recipe } from '@/lib/recipes';

const CATEGORIES = ['ארוחת בוקר', 'צהריים', 'ערב', 'קינוחים בריאים', 'נשנושים'];

export default function NewRecipePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [time, setTime] = useState('20 דק׳');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState(['']);
  const [steps, setSteps] = useState(['']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const updateList = (
    list: string[],
    setList: (v: string[]) => void,
    index: number,
    value: string
  ) => {
    const next = [...list];
    next[index] = value;
    setList(next);
  };

  const addListItem = (list: string[], setList: (v: string[]) => void) => {
    setList([...list, '']);
  };

  const removeListItem = (
    list: string[],
    setList: (v: string[]) => void,
    index: number
  ) => {
    if (list.length <= 1) return;
    setList(list.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanIngredients = ingredients.map((i) => i.trim()).filter(Boolean);
    const cleanSteps = steps.map((s) => s.trim()).filter(Boolean);

    if (!title.trim()) {
      setError('נא להזין שם למתכון');
      return;
    }
    if (cleanIngredients.length === 0) {
      setError('נא להוסיף לפחות מרכיב אחד');
      return;
    }
    if (cleanSteps.length === 0) {
      setError('נא להוסיף לפחות שלב הכנה אחד');
      return;
    }

    setLoading(true);
    try {
      const analysis = await getRecipeNutritionAnalysis({
        title: title.trim(),
        ingredients: cleanIngredients,
        steps: cleanSteps,
      });

      const recipe: Recipe = {
        id: createRecipeId(),
        title: title.trim(),
        category,
        time: time.trim() || '20 דק׳',
        description: description.trim() || `מתכון ${title.trim()}`,
        image: DEFAULT_RECIPE_IMAGE,
        ingredients: cleanIngredients,
        steps: cleanSteps,
        calories: analysis.calories,
        protein: analysis.protein,
        carbs: analysis.carbs,
        fats: analysis.fats,
        aiInsight: analysis.insight,
        userCreated: true,
      };

      saveUserRecipe(recipe);
      router.push(`/recipes/${recipe.id}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'ניתוח AI נכשל. נסי שוב.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AppHeader title="מתכון חדש" showBack backHref="/recipes" />
      <div className="relative w-full pt-16 pb-24 bg-surface min-h-screen px-container-margin">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-lg mx-auto">
          <div className="flex items-center gap-2 pt-2">
            <MaterialIcon name="auto_awesome" className="text-primary" />
            <p className="text-body-md text-on-surface-variant">
              לאחר השמירה, ה-AI ינתח את הערכים התזונתיים של המתכון.
            </p>
          </div>

          <Field label="שם המתכון">
            <input
              className="input-field"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="למשל: סלט קinoa ים-תיכוני"
            />
          </Field>

          <Field label="קטגוריה">
            <select
              className="input-field"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </Field>

          <Field label="זמן הכנה">
            <input
              className="input-field"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="20 דק׳"
            />
          </Field>

          <Field label="תיאור קצר">
            <textarea
              className="input-field min-h-[80px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="תארי את המתכון בקצרה..."
            />
          </Field>

          <ListEditor
            label="מרכיבים"
            items={ingredients}
            onChange={(i, v) => updateList(ingredients, setIngredients, i, v)}
            onAdd={() => addListItem(ingredients, setIngredients)}
            onRemove={(i) => removeListItem(ingredients, setIngredients, i)}
            placeholder="למשל: 1 כוס קינואה"
          />

          <ListEditor
            label="שלבי הכנה"
            items={steps}
            onChange={(i, v) => updateList(steps, setSteps, i, v)}
            onAdd={() => addListItem(steps, setSteps)}
            onRemove={(i) => removeListItem(steps, setSteps, i)}
            placeholder="תארי שלב..."
          />

          {error && (
            <p className="text-error text-label-md font-medium">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-full bg-primary text-on-primary font-headline text-headline-sm font-semibold shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <>
                <MaterialIcon name="auto_awesome" className="animate-pulse" />
                מנתח עם AI...
              </>
            ) : (
              <>
                <MaterialIcon name="save" />
                שמירה וניתוח AI
              </>
            )}
          </button>

          <Link
            href="/recipes"
            className="text-center text-primary text-label-md font-semibold py-2"
          >
            ביטול
          </Link>
        </form>
      </div>

      <style jsx global>{`
        .input-field {
          width: 100%;
          background: var(--color-surface-container-low, #f3f4f6);
          padding: 1rem;
          border-radius: 0.75rem;
          outline: none;
          border: none;
        }
        .input-field:focus {
          box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb, 59, 130, 246), 0.2);
        }
      `}</style>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-label-md font-semibold text-on-surface-variant">
        {label}
      </label>
      {children}
    </div>
  );
}

function ListEditor({
  label,
  items,
  onChange,
  onAdd,
  onRemove,
  placeholder,
}: {
  label: string;
  items: string[];
  onChange: (index: number, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  placeholder: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <span className="text-label-md font-semibold text-on-surface-variant">
          {label}
        </span>
        <button
          type="button"
          onClick={onAdd}
          className="text-primary text-label-sm font-semibold flex items-center gap-1"
        >
          <MaterialIcon name="add" className="text-[18px]" />
          הוספה
        </button>
      </div>
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <input
            className="input-field flex-1"
            value={item}
            onChange={(e) => onChange(i, e.target.value)}
            placeholder={placeholder}
          />
          {items.length > 1 && (
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center shrink-0"
              aria-label="הסרה"
            >
              <MaterialIcon name="close" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
