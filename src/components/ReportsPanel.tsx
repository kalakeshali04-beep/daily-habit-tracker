import type { DailyReport, MonthlyReport, WeeklyReport } from "../models/habit";

interface ReportsPanelProps {
  daily: DailyReport;
  weekly: WeeklyReport;
  monthly: MonthlyReport;
}

export function ReportsPanel({ daily, weekly, monthly }: ReportsPanelProps) {
  return (
    <section className="reports-grid" aria-label="Reports">
      <div className="report-tile">
        <span>Daily</span>
        <strong>{daily.averageCompletionRate}%</strong>
        <p>{daily.habitsCompleted} completed today</p>
      </div>
      <div className="report-tile">
        <span>Weekly</span>
        <strong>{weekly.averageCompletionRate}%</strong>
        <p>Best: {weekly.bestHabit?.habitName ?? "No habits yet"}</p>
      </div>
      <div className="report-tile">
        <span>Monthly</span>
        <strong>{monthly.averageCompletionRate}%</strong>
        <p>{monthly.monthOverMonthGrowth >= 0 ? "+" : ""}{monthly.monthOverMonthGrowth}% vs last month</p>
      </div>
    </section>
  );
}
