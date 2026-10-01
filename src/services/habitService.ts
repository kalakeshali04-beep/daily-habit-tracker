import type { DailyLog, Habit, RingData } from "../models/habit";
import { toDateKey } from "../utils/date";

export interface CreateHabitInput {
  name: string;
  targetAmount: number;
  unit: string;
  color: string;
  description?: string;
}

export interface HabitServiceState {
  habits: Habit[];
  logs: DailyLog[];
}

function uid(prefix: string): string {
  return `${prefix}_${crypto.randomUUID()}`;
}

function isActive(habit: Habit): boolean {
  return !habit.archivedAt;
}

function getHabitOrThrow(habits: Habit[], id: string): Habit {
  const habit = habits.find((item) => item.id === id && isActive(item));
  if (!habit) throw new Error(`Habit ${id} was not found.`);
  return habit;
}

function getLog(logs: DailyLog[], habitId: string, date: string): DailyLog | undefined {
  return logs.find((log) => log.habitId === habitId && log.date === date);
}

export function createHabit(
  state: HabitServiceState,
  name: string,
  targetAmount: number,
  unit: string,
  color: string,
  description = "",
): HabitServiceState {
  const habit: Habit = {
    id: uid("habit"),
    name: name.trim(),
    description: description.trim(),
    targetAmount: Math.max(1, targetAmount),
    unit,
    colorCode: color,
    createdAt: new Date().toISOString(),
  };

  return { ...state, habits: [habit, ...state.habits] };
}

export function updateHabit(
  state: HabitServiceState,
  id: string,
  updates: Partial<Omit<Habit, "id" | "createdAt">>,
): HabitServiceState {
  getHabitOrThrow(state.habits, id);

  return {
    ...state,
    habits: state.habits.map((habit) => (habit.id === id ? { ...habit, ...updates } : habit)),
  };
}

export function deleteHabit(state: HabitServiceState, id: string, hardDelete = false): HabitServiceState {
  getHabitOrThrow(state.habits, id);

  if (hardDelete) {
    return {
      habits: state.habits.filter((habit) => habit.id !== id),
      logs: state.logs.filter((log) => log.habitId !== id),
    };
  }

  return updateHabit(state, id, { archivedAt: new Date().toISOString() });
}

export function logProgress(
  state: HabitServiceState,
  habitId: string,
  date: Date | string,
  amount: number,
): HabitServiceState {
  const habit = getHabitOrThrow(state.habits, habitId);
  const dateKey = toDateKey(date);
  const existing = getLog(state.logs, habitId, dateKey);
  const nextAmount = Math.max(0, (existing?.completedAmount ?? 0) + amount);
  const nextLog: DailyLog = {
    id: existing?.id ?? uid("log"),
    habitId,
    date: dateKey,
    completedAmount: habit.unit === "boolean" ? Math.min(1, nextAmount) : nextAmount,
    isGoalMet: (habit.unit === "boolean" ? Math.min(1, nextAmount) : nextAmount) >= habit.targetAmount,
  };

  return {
    ...state,
    logs: existing
      ? state.logs.map((log) => (log.id === existing.id ? nextLog : log))
      : [...state.logs, nextLog],
  };
}

export function setProgress(
  state: HabitServiceState,
  habitId: string,
  date: Date | string,
  amount: number,
): HabitServiceState {
  const habit = getHabitOrThrow(state.habits, habitId);
  const dateKey = toDateKey(date);
  const existing = getLog(state.logs, habitId, dateKey);
  const normalizedAmount = habit.unit === "boolean" ? Math.min(1, Math.max(0, amount)) : Math.max(0, amount);
  const nextLog: DailyLog = {
    id: existing?.id ?? uid("log"),
    habitId,
    date: dateKey,
    completedAmount: normalizedAmount,
    isGoalMet: normalizedAmount >= habit.targetAmount,
  };

  return {
    ...state,
    logs: existing
      ? state.logs.map((log) => (log.id === existing.id ? nextLog : log))
      : [...state.logs, nextLog],
  };
}

export function checkDailyGoalStatus(
  state: HabitServiceState,
  habitId: string,
  date: Date | string,
): { isGoalMet: boolean; percentage: number } {
  const habit = getHabitOrThrow(state.habits, habitId);
  const log = getLog(state.logs, habitId, toDateKey(date));
  const percentage = Math.min(100, Math.round(((log?.completedAmount ?? 0) / habit.targetAmount) * 100));

  return { isGoalMet: percentage >= 100, percentage };
}

export function getDailyRingData(state: HabitServiceState, date: Date | string): RingData[] {
  return state.habits.filter(isActive).map((habit) => {
    const status = checkDailyGoalStatus(state, habit.id, date);
    return {
      habitId: habit.id,
      label: habit.name,
      percentage: status.percentage,
      color: habit.colorCode,
    };
  });
}

export function getActiveHabits(state: HabitServiceState): Habit[] {
  return state.habits.filter(isActive);
}
