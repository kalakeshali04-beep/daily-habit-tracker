import type { DailyLog, Habit } from "../models/habit";

const HABITS_KEY = "habit-tracker:habits";
const LOGS_KEY = "habit-tracker:daily-logs";

export interface HabitTrackerState {
  habits: Habit[];
  logs: DailyLog[];
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  window.localStorage.setItem(key, JSON.stringify(value));
}

export const storageService = {
  load(): HabitTrackerState {
    return {
      habits: readJson<Habit[]>(HABITS_KEY, []),
      logs: readJson<DailyLog[]>(LOGS_KEY, []),
    };
  },

  save(state: HabitTrackerState): void {
    writeJson(HABITS_KEY, state.habits);
    writeJson(LOGS_KEY, state.logs);
  },

  clear(): void {
    window.localStorage.removeItem(HABITS_KEY);
    window.localStorage.removeItem(LOGS_KEY);
  },
};
