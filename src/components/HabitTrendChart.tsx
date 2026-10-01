import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { GraphPoint } from "../models/habit";
import { formatReadableDate } from "../utils/date";

interface HabitTrendChartProps {
  data: GraphPoint[];
  mode: "weekly" | "monthly";
}

export function HabitTrendChart({ data, mode }: HabitTrendChartProps) {
  const chartData = data.map((point) => ({
    ...point,
    label: formatReadableDate(point.date),
  }));

  const sharedProps = {
    data: chartData,
    margin: { top: 14, right: 14, left: -22, bottom: 0 },
  };

  return (
    <div className="chart-shell">
      <ResponsiveContainer width="100%" height={260}>
        {mode === "weekly" ? (
          <BarChart {...sharedProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#9ca3af", fontSize: 12 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: "#9ca3af", fontSize: 12 }} />
            <Tooltip contentStyle={{ background: "#111827", border: "1px solid #273244", borderRadius: 8 }} />
            <Bar dataKey="value" fill="#5eead4" radius={[6, 6, 0, 0]} />
            <Bar dataKey="goal" fill="rgba(255,255,255,0.16)" radius={[6, 6, 0, 0]} />
          </BarChart>
        ) : (
          <LineChart {...sharedProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#9ca3af", fontSize: 12 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: "#9ca3af", fontSize: 12 }} />
            <Tooltip contentStyle={{ background: "#111827", border: "1px solid #273244", borderRadius: 8 }} />
            <Line type="monotone" dataKey="value" stroke="#5eead4" strokeWidth={3} dot={false} />
            <Line type="monotone" dataKey="goal" stroke="rgba(255,255,255,0.28)" strokeDasharray="4 4" dot={false} />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
