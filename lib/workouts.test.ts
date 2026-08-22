import test from 'node:test';
import assert from 'node:assert/strict';

import { applyWorkoutDraft, buildWorkoutEntry, removeWorkoutEntry, type WorkoutEntry } from './workouts';

test('applyWorkoutDraft creates a new workout entry when no id is provided', () => {
  const entries: WorkoutEntry[] = [];

  const next = applyWorkoutDraft(entries, {
    type: 'strength',
    duration: 40,
    calories: 300,
  });

  assert.equal(next.length, 1);
  assert.equal(next[0].type, 'strength');
  assert.equal(next[0].duration, 40);
  assert.equal(next[0].calories, 300);
  assert.equal(next[0].title, 'אימון כוח');
});

test('applyWorkoutDraft updates an existing workout entry when an id is provided', () => {
  const entries: WorkoutEntry[] = [
    buildWorkoutEntry('walking', 20, 120),
  ];

  const next = applyWorkoutDraft(entries, {
    id: entries[0].id,
    type: 'running',
    duration: 35,
    calories: 280,
  });

  assert.equal(next.length, 1);
  assert.equal(next[0].id, entries[0].id);
  assert.equal(next[0].type, 'running');
  assert.equal(next[0].title, 'ריצה');
  assert.equal(next[0].duration, 35);
  assert.equal(next[0].calories, 280);
});

test('removeWorkoutEntry deletes the correct workout', () => {
  const entries: WorkoutEntry[] = [
    buildWorkoutEntry('pilates', 30, 150),
    buildWorkoutEntry('yoga', 25, 120),
  ];

  const next = removeWorkoutEntry(entries, entries[0].id);

  assert.equal(next.length, 1);
  assert.equal(next[0].type, 'yoga');
});
