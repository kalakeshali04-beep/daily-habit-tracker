export type HabitUnit = "boolean" | "mins" | "cups" | "liters" | "pages" | "steps" | "custom";

export interface Habit {
  id: string;
  name: string;
  description?: string;
  targetAmount: number;
  unit: HabitUnit | string;
  colorCode: string;
  createdAt: string;
  archivedAt?: string;
}

export interface DailyLog {
  id: string;
  habitId: string;
  date: string;
  completedAmount: number;
  isGoalMet: boolean;
}

export type ReportTimeFrame = "daily" | "weekly" | "monthly";

export interface Report {
  timeFrame: ReportTimeFrame;
  averageCompletionRate: number;
  longestStreak: number;
  habitsCompleted: number;
}

export interface DailyReport extends Report {
  date: string;
  met: Habit[];
  missed: Habit[];
}

export interface WeeklyReport extends Report {
  weekStartDate: string;
  weekEndDate: string;
  bestHabit?: HabitPerformance;
  worstHabit?: HabitPerformance;
  habitPerformance: HabitPerformance[];
}

export interface MonthlyReport extends Report {
  month: number;
  year: number;
  consistencyByDay: Array<{ date: string; completionRate: number }>;
  totalVolumeByHabit: Array<{ habitId: string; habitName: string; total: number; unit: string }>;
  monthOverMonthGrowth: number;
}

export interface HabitPerformance {
  habitId: string;
  habitName: string;
  completionRate: number;
  completedDays: number;
  totalDays: number;
}

export interface RingData {
  habitId: string;
  label: string;
  percentage: number;
  color: string;
}

export interface GraphPoint {
  date: string;
  value: number;
  goal: number;
  isGoalMet: boolean;
}
