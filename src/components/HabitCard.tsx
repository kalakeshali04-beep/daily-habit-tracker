import { Archive, Check, Minus, Plus } from "lucide-react";
import type { Habit } from "../models/habit";
import { ProgressRing } from "./ProgressRing";

interface HabitCardProps {
  habit: Habit;
  completedAmount: number;
  percentage: number;
  streak: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onComplete: () => void;
  onDelete: () => void;
}

export function HabitCard({
  habit,
  completedAmount,
  percentage,
  streak,
  onIncrement,
  onDecrement,
  onComplete,
  onDelete,
}: HabitCardProps) {
  const remaining = Math.max(0, habit.targetAmount - completedAmount);

  return (
    <article className="habit-card">
      <div className="habit-main">
        <ProgressRing percentage={percentage} color={habit.colorCode} size={72} strokeWidth={8} label={habit.name} />
        <div>
          <h3>{habit.name}</h3>
          <p>
            {completedAmount} / {habit.targetAmount} {habit.unit === "boolean" ? "done" : habit.unit}
          </p>
          <span>{remaining === 0 ? "Goal met" : `${remaining} ${habit.unit} remaining`} · {streak} day streak</span>
        </div>
      </div>
      <div className="habit-actions">
        <button type="button" onClick={onDecrement} aria-label={`Decrease ${habit.name}`}>
          <Minus size={18} />
        </button>
        <button type="button" onClick={onIncrement} aria-label={`Add progress to ${habit.name}`}>
          <Plus size={18} />
        </button>
        <button type="button" onClick={onComplete} aria-label={`Complete ${habit.name}`}>
          <Check size={18} />
        </button>
        <button type="button" onClick={onDelete} aria-label={`Archive ${habit.name}`}>
          <Archive size={18} />
        </button>
      </div>
    </article>
  );
}
