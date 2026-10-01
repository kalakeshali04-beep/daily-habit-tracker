import { CalendarDays, Clock, Footprints, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { HabitCard } from "./components/HabitCard";
import { HabitForm } from "./components/HabitForm";
import { HabitTrendChart } from "./components/HabitTrendChart";
import { ConcentricProgressRings } from "./components/ProgressRing";
import { ReportsPanel } from "./components/ReportsPanel";
import type { HabitTrackerState } from "./services/storage";
import {
  checkDailyGoalStatus,
  createHabit,
  deleteHabit,
  getActiveHabits,
  getDailyRingData,
  logProgress,
  setProgress,
} from "./services/habitService";
import {
  calculateCurrentStreak,
  generateDailyReport,
  generateMonthlyReport,
  generateWeeklyReport,
  getGraphData,
} from "./services/reportingService";
import { storageService } from "./services/storage";
import { addDays, eachDay, todayKey } from "./utils/date";

const seedState: HabitTrackerState = {
  habits: [
    {
      id: "habit_read",
      name: "Read",
      description: "Focused pages or minutes",
      targetAmount: 30,
      unit: "mins",
      colorCode: "#5eead4",
      createdAt: new Date().toISOString(),
    },
    {
      id: "habit_water",
      name: "Hydrate",
      description: "Drink water steadily",
      targetAmount: 3,
      unit: "liters",
      colorCode: "#60a5fa",
      createdAt: new Date().toISOString(),
    },
    {
      id: "habit_move",
      name: "Move",
      description: "Daily movement",
      targetAmount: 1,
      unit: "boolean",
      colorCode: "#f472b6",
      createdAt: new Date().toISOString(),
    },
  ],
  logs: [],
};

function buildSeedState(): HabitTrackerState {
  const start = addDays(todayKey(), -27);
  let state = seedState;

  for (const day of eachDay(start, todayKey())) {
    const dayNumber = new Date(`${day}T12:00:00`).getDate();
    state = setProgress(state, "habit_read", day, dayNumber % 4 === 0 ? 20 : 30);
    state = setProgress(state, "habit_water", day, dayNumber % 5 === 0 ? 2 : 3);
    state = setProgress(state, "habit_move", day, dayNumber % 3 === 0 ? 0 : 1);
  }

  return state;
}

function getDayTiming(now = new Date()): { countdown: string; nextDayLabel: string } {
  const nextDay = new Date(now);
  nextDay.setHours(24, 0, 0, 0);
  const remainingMs = Math.max(0, nextDay.getTime() - now.getTime());
  const hours = Math.floor(remainingMs / 3_600_000);
  const minutes = Math.floor((remainingMs % 3_600_000) / 60_000);
  const seconds = Math.floor((remainingMs % 60_000) / 1_000);

  return {
    countdown: [hours, minutes, seconds].map((part) => String(part).padStart(2, "0")).join(":"),
    nextDayLabel: new Intl.DateTimeFormat("en", { weekday: "short", month: "short", day: "numeric" }).format(nextDay),
  };
}

export default function App() {
  const [state, setState] = useState<HabitTrackerState>(() => {
    const saved = storageService.load();
    return saved.habits.length ? saved : buildSeedState();
  });
  const [selectedHabitId, setSelectedHabitId] = useState(state.habits[0]?.id ?? "");
  const [chartMode, setChartMode] = useState<"weekly" | "monthly">("weekly");
  const [today, setToday] = useState(todayKey);
  const [dayTiming, setDayTiming] = useState(getDayTiming);
  const [stepTracking, setStepTracking] = useState(false);
  const [stepStatus, setStepStatus] = useState("Use this on a phone and tap Start counting. Desktop browsers can use +100 steps.");
  const lastMagnitude = useRef(0);
  const lastStepAt = useRef(0);
  const habits = getActiveHabits(state);

  useEffect(() => {
    storageService.save(state);
  }, [state]);

  useEffect(() => {
    const hasStepHabit = habits.some((habit) => habit.unit === "steps" || habit.name.toLowerCase() === "steps");
    if (!hasStepHabit) {
      setState((current) => createHabit(current, "Steps", 10000, "steps", "#a78bfa", "Phone motion step counter"));
    }
  }, [habits]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setDayTiming(getDayTiming());
      setToday((currentDay) => {
        const nextDay = todayKey();
        return currentDay === nextDay ? currentDay : nextDay;
      });
    }, 1_000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!habits.some((habit) => habit.id === selectedHabitId)) {
      setSelectedHabitId(habits[0]?.id ?? "");
    }
  }, [habits, selectedHabitId]);

  const stepHabit = habits.find((habit) => habit.unit === "steps") ?? habits.find((habit) => habit.name.toLowerCase() === "steps");
  const stepCount = stepHabit
    ? state.logs.find((log) => log.habitId === stepHabit.id && log.date === today)?.completedAmount ?? 0
    : 0;

  useEffect(() => {
    if (!stepTracking || !stepHabit) return;

    function handleMotion(event: DeviceMotionEvent) {
      const acceleration = event.accelerationIncludingGravity ?? event.acceleration;
      if (!acceleration || !stepHabit) return;

      const magnitude = Math.sqrt(
        (acceleration.x ?? 0) ** 2 + (acceleration.y ?? 0) ** 2 + (acceleration.z ?? 0) ** 2,
      );
      const delta = Math.abs(magnitude - lastMagnitude.current);
      const now = Date.now();
      lastMagnitude.current = magnitude;

      if (delta > 2.8 && now - lastStepAt.current > 350) {
        lastStepAt.current = now;
        setState((current) => logProgress(current, stepHabit.id, today, 1));
      }
    }

    window.addEventListener("devicemotion", handleMotion);
    return () => window.removeEventListener("devicemotion", handleMotion);
  }, [stepHabit, stepTracking, today]);

  const rings = useMemo(() => getDailyRingData(state, today), [state, today]);
  const selectedHabit = habits.find((habit) => habit.id === selectedHabitId) ?? habits[0];
  const dailyReport = useMemo(() => generateDailyReport(state, today), [state, today]);
  const weeklyReport = useMemo(() => generateWeeklyReport(state, addDays(today, -6)), [state, today]);
  const monthlyReport = useMemo(() => {
    const now = new Date();
    return generateMonthlyReport(state, now.getMonth() + 1, now.getFullYear());
  }, [state]);
  const graphData = useMemo(() => {
    if (!selectedHabit) return [];
    const start = chartMode === "weekly" ? addDays(today, -6) : addDays(today, -29);
    return getGraphData(state, selectedHabit.id, start, today);
  }, [chartMode, selectedHabit, state, today]);

  function handleCreateHabit(name: string, targetAmount: number, unit: string, color: string, description?: string) {
    setState((current) => createHabit(current, name, targetAmount, unit, color, description));
  }

  function logAmount(habitId: string, amount: number) {
    setState((current) => logProgress(current, habitId, today, amount));
  }

  function completeHabit(habitId: string) {
    const habit = habits.find((item) => item.id === habitId);
    if (!habit) return;
    setState((current) => setProgress(current, habitId, today, habit.targetAmount));
  }

  function resetDemoData() {
    storageService.clear();
    setState(buildSeedState());
  }

  async function startStepCounter() {
    if (!stepHabit) {
      setStepStatus("Creating a Steps habit. Tap Start counting again in a moment.");
      return;
    }

    if (!("DeviceMotionEvent" in window)) {
      setStepStatus("This browser does not expose motion sensors. Use +100 steps or run this on a phone browser.");
      return;
    }

    try {
      const motionEvent = DeviceMotionEvent as typeof DeviceMotionEvent & {
        requestPermission?: () => Promise<"granted" | "denied">;
      };
      if (typeof motionEvent.requestPermission === "function") {
        const permission = await motionEvent.requestPermission();
        if (permission !== "granted") {
          setStepStatus("Motion permission was not granted. You can still add steps manually.");
          return;
        }
      }
      lastMagnitude.current = 0;
      lastStepAt.current = 0;
      setStepTracking(true);
      setStepStatus("Counting from phone motion. Keep this page open while walking.");
    } catch {
      setStepStatus("Motion access is blocked here. You can still add steps manually.");
    }
  }

  function addManualSteps(amount: number) {
    if (!stepHabit) return;
    setState((current) => setProgress(current, stepHabit.id, today, stepCount + amount));
    setStepStatus(`Added ${amount} steps manually.`);
  }

  function resetSteps() {
    if (!stepHabit) return;
    setState((current) => setProgress(current, stepHabit.id, today, 0));
    setStepTracking(false);
    setStepStatus("Today's step count was reset.");
  }

  return (
    <main className="app-shell">
      <section className="topbar">
        <div>
          <span className="eyebrow">Daily Habit Tracker</span>
          <h1>Today’s momentum</h1>
        </div>
        <div className="topbar-actions">
          <div className="day-timer" aria-live="polite">
            <Clock size={18} />
            <div>
              <span>New day opens in</span>
              <strong>{dayTiming.countdown}</strong>
              <small>{dayTiming.nextDayLabel}</small>
            </div>
          </div>
          <button className="ghost-action" type="button" onClick={resetDemoData}>
            <RotateCcw size={18} />
            Reset demo
          </button>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="overview-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Progress rings</span>
              <h2>{dailyReport.habitsCompleted} of {habits.length} habits complete</h2>
            </div>
            <CalendarDays size={22} />
          </div>
          <ConcentricProgressRings rings={rings} />
          <div className="ring-legend">
            {rings.map((ring) => (
              <span key={ring.habitId}>
                <i style={{ background: ring.color }} />
                {ring.label} {ring.percentage}%
              </span>
            ))}
          </div>
        </div>

        <div className="habits-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Quick log</span>
              <h2>Today's habits</h2>
            </div>
          </div>
          <div className="habit-list">
            {habits.map((habit) => {
              const status = checkDailyGoalStatus(state, habit.id, today);
              const completedAmount =
                state.logs.find((log) => log.habitId === habit.id && log.date === today)?.completedAmount ?? 0;
              return (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  completedAmount={completedAmount}
                  percentage={status.percentage}
                  streak={calculateCurrentStreak(state, habit.id)}
                  onIncrement={() => logAmount(habit.id, habit.unit === "boolean" ? 1 : 1)}
                  onDecrement={() => logAmount(habit.id, -1)}
                  onComplete={() => completeHabit(habit.id)}
                  onDelete={() => setState((current) => deleteHabit(current, habit.id))}
                />
              );
            })}
          </div>
        </div>
      </section>

      <section className="step-panel" aria-label="Step counter">
        <div className="step-metric">
          <span className="eyebrow">Step Counter</span>
          <strong>{stepCount.toLocaleString()}</strong>
          <p>
            {stepCount.toLocaleString()} / {(stepHabit?.targetAmount ?? 10000).toLocaleString()} steps today
          </p>
        </div>
        <div className="step-controls">
          <button className="primary-step" type="button" onClick={startStepCounter}>
            <Footprints size={18} />
            {stepTracking ? "Counting..." : "Start counting"}
          </button>
          <button type="button" onClick={() => {
            setStepTracking(false);
            setStepStatus("Step counting paused.");
          }}>
            Pause
          </button>
          <button type="button" onClick={() => addManualSteps(100)}>+100 steps</button>
          <button type="button" onClick={resetSteps}>Reset steps</button>
        </div>
        <div className="step-status">{stepStatus}</div>
      </section>

      <HabitForm onCreateHabit={handleCreateHabit} />

      <ReportsPanel daily={dailyReport} weekly={weeklyReport} monthly={monthlyReport} />

      <section className="analytics-panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">Historical trends</span>
            <h2>{selectedHabit?.name ?? "No habit selected"}</h2>
          </div>
          <div className="segmented-control">
            <button
              type="button"
              className={chartMode === "weekly" ? "active" : ""}
              onClick={() => setChartMode("weekly")}
            >
              Weekly
            </button>
            <button
              type="button"
              className={chartMode === "monthly" ? "active" : ""}
              onClick={() => setChartMode("monthly")}
            >
              Monthly
            </button>
          </div>
        </div>
        <div className="habit-tabs">
          {habits.map((habit) => (
            <button
              key={habit.id}
              type="button"
              className={habit.id === selectedHabit?.id ? "active" : ""}
              onClick={() => setSelectedHabitId(habit.id)}
            >
              <i style={{ background: habit.colorCode }} />
              {habit.name}
            </button>
          ))}
        </div>
        <HabitTrendChart data={graphData} mode={chartMode} />
      </section>
    </main>
  );
}
