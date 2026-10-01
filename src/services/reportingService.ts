import type {
  DailyReport,
  GraphPoint,
  Habit,
  HabitPerformance,
  MonthlyReport,
  WeeklyReport,
} from "../models/habit";
import { addDays, eachDay, endOfMonth, previousMonth, startOfMonth, toDateKey, todayKey } from "../utils/date";
import { checkDailyGoalStatus, getActiveHabits, type HabitServiceState } from "./habitService";

function getLogValue(state: HabitServiceState, habitId: string, date: string): number {
  return state.logs.find((log) => log.habitId === habitId && log.date === date)?.completedAmount ?? 0;
}

function getLongestStreakForHabits(state: HabitServiceState, habits: Habit[], days: string[]): number {
  let longest = 0;

  for (const habit of habits) {
    let running = 0;
    for (const day of days) {
      const met = checkDailyGoalStatus(state, habit.id, day).isGoalMet;
      running = met ? running + 1 : 0;
      longest = Math.max(longest, running);
    }
  }

  return longest;
}

function summarizeHabitPerformance(state: HabitServiceState, habit: Habit, days: string[]): HabitPerformance {
  const completedDays = days.filter((day) => checkDailyGoalStatus(state, habit.id, day).isGoalMet).length;
  return {
    habitId: habit.id,
    habitName: habit.name,
    completionRate: days.length ? Math.round((completedDays / days.length) * 100) : 0,
    completedDays,
    totalDays: days.length,
  };
}

function averageCompletion(state: HabitServiceState, habits: Habit[], days: string[]): number {
  const possibleCompletions = habits.length * days.length;
  if (!possibleCompletions) return 0;

  const metCount = habits.reduce(
    (sum, habit) => sum + days.filter((day) => checkDailyGoalStatus(state, habit.id, day).isGoalMet).length,
    0,
  );

  return Math.round((metCount / possibleCompletions) * 100);
}

export function calculateCurrentStreak(state: HabitServiceState, habitId: string): number {
  let streak = 0;
  let cursor = todayKey();

  while (checkDailyGoalStatus(state, habitId, cursor).isGoalMet) {
    streak += 1;
    cursor = toDateKey(addDays(cursor, -1));
  }

  return streak;
}

export function getGraphData(
  state: HabitServiceState,
  habitId: string,
  startDate: Date | string,
  endDate: Date | string,
): GraphPoint[] {
  const habit = state.habits.find((item) => item.id === habitId);
  if (!habit) return [];

  return eachDay(startDate, endDate).map((date) => {
    const value = getLogValue(state, habitId, date);
    return {
      date,
      value,
      goal: habit.targetAmount,
      isGoalMet: value >= habit.targetAmount,
    };
  });
}

export function generateDailyReport(state: HabitServiceState, date: Date | string): DailyReport {
  const dateKey = toDateKey(date);
  const habits = getActiveHabits(state);
  const met = habits.filter((habit) => checkDailyGoalStatus(state, habit.id, dateKey).isGoalMet);
  const missed = habits.filter((habit) => !checkDailyGoalStatus(state, habit.id, dateKey).isGoalMet);

  return {
    timeFrame: "daily",
    date: dateKey,
    averageCompletionRate: habits.length ? Math.round((met.length / habits.length) * 100) : 0,
    longestStreak: Math.max(0, ...habits.map((habit) => calculateCurrentStreak(state, habit.id))),
    habitsCompleted: met.length,
    met,
    missed,
  };
}

export function generateWeeklyReport(state: HabitServiceState, weekStartDate: Date | string): WeeklyReport {
  const weekStart = toDateKey(weekStartDate);
  const weekEnd = toDateKey(addDays(weekStart, 6));
  const days = eachDay(weekStart, weekEnd);
  const habits = getActiveHabits(state);
  const habitPerformance = habits.map((habit) => summarizeHabitPerformance(state, habit, days));
  const sorted = [...habitPerformance].sort((a, b) => b.completionRate - a.completionRate);

  return {
    timeFrame: "weekly",
    weekStartDate: weekStart,
    weekEndDate: weekEnd,
    averageCompletionRate: averageCompletion(state, habits, days),
    longestStreak: getLongestStreakForHabits(state, habits, days),
    habitsCompleted: habitPerformance.reduce((sum, habit) => sum + habit.completedDays, 0),
    bestHabit: sorted[0],
    worstHabit: sorted[sorted.length - 1],
    habitPerformance,
  };
}

export function generateMonthlyReport(state: HabitServiceState, month: number, year: number): MonthlyReport {
  const monthStart = startOfMonth(month, year);
  const monthEnd = endOfMonth(month, year);
  const days = eachDay(monthStart, monthEnd);
  const habits = getActiveHabits(state);
  const previous = previousMonth(month, year);
  const previousDays = eachDay(startOfMonth(previous.month, previous.year), endOfMonth(previous.month, previous.year));
  const currentAverage = averageCompletion(state, habits, days);
  const previousAverage = averageCompletion(state, habits, previousDays);

  return {
    timeFrame: "monthly",
    month,
    year,
    averageCompletionRate: currentAverage,
    longestStreak: getLongestStreakForHabits(state, habits, days),
    habitsCompleted: habits.reduce(
      (sum, habit) => sum + days.filter((day) => checkDailyGoalStatus(state, habit.id, day).isGoalMet).length,
      0,
    ),
    consistencyByDay: days.map((date) => ({
      date,
      completionRate: averageCompletion(state, habits, [date]),
    })),
    totalVolumeByHabit: habits.map((habit) => ({
      habitId: habit.id,
      habitName: habit.name,
      total: days.reduce((sum, date) => sum + getLogValue(state, habit.id, date), 0),
      unit: habit.unit,
    })),
    monthOverMonthGrowth: currentAverage - previousAverage,
  };
}
