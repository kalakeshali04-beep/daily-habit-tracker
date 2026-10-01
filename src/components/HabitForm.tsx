import { Plus } from "lucide-react";
import type { FormEvent } from "react";
import { useState } from "react";

const COLORS = ["#5eead4", "#60a5fa", "#f472b6", "#facc15", "#a78bfa", "#fb7185"];

interface HabitFormProps {
  onCreateHabit: (name: string, targetAmount: number, unit: string, color: string, description?: string) => void;
}

export function HabitForm({ onCreateHabit }: HabitFormProps) {
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState(1);
  const [unit, setUnit] = useState("boolean");
  const [color, setColor] = useState(COLORS[0]);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    onCreateHabit(name, targetAmount, unit, color);
    setName("");
    setTargetAmount(1);
    setUnit("boolean");
    setColor(COLORS[0]);
  }

  return (
    <form className="habit-form" onSubmit={handleSubmit}>
      <label>
        <span>Habit</span>
        <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Read for 30 minutes" />
      </label>
      <label>
        <span>Goal</span>
        <input
          type="number"
          min="1"
          value={targetAmount}
          onChange={(event) => setTargetAmount(Number(event.target.value))}
        />
      </label>
      <label>
        <span>Unit</span>
        <select value={unit} onChange={(event) => setUnit(event.target.value)}>
          <option value="boolean">done</option>
          <option value="mins">mins</option>
          <option value="cups">cups</option>
          <option value="liters">liters</option>
          <option value="pages">pages</option>
          <option value="steps">steps</option>
        </select>
      </label>
      <div className="swatches" role="radiogroup" aria-label="Habit color">
        {COLORS.map((item) => (
          <button
            type="button"
            className={item === color ? "swatch active" : "swatch"}
            key={item}
            style={{ background: item }}
            onClick={() => setColor(item)}
            aria-label={`Use color ${item}`}
          />
        ))}
      </div>
      <button className="primary-action" type="submit">
        <Plus size={18} />
        Add
      </button>
    </form>
  );
}
