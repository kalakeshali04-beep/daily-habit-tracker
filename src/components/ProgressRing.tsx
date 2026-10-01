import type { RingData } from "../models/habit";

interface ProgressRingProps {
  percentage: number;
  color: string;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

interface ConcentricProgressRingsProps {
  rings: RingData[];
  size?: number;
}

export function ProgressRing({ percentage, color, size = 136, strokeWidth = 12, label }: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, percentage));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label={label}>
      <circle
        className="ring-track"
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={strokeWidth}
      />
      <circle
        className="ring-fill"
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
      />
    </svg>
  );
}

export function ConcentricProgressRings({ rings, size = 220 }: ConcentricProgressRingsProps) {
  const strokeWidth = 10;
  const gap = 12;
  const center = size / 2;
  const average = rings.length
    ? Math.round(rings.reduce((sum, ring) => sum + Math.min(100, ring.percentage), 0) / rings.length)
    : 0;

  return (
    <div className="ring-stack" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {rings.map((ring, index) => {
          const radius = center - strokeWidth / 2 - index * (strokeWidth + gap);
          if (radius <= 16) return null;
          const circumference = 2 * Math.PI * radius;
          const offset = circumference - (Math.max(0, Math.min(100, ring.percentage)) / 100) * circumference;

          return (
            <g key={ring.habitId}>
              <circle className="ring-track" cx={center} cy={center} r={radius} strokeWidth={strokeWidth} />
              <circle
                className="ring-fill"
                cx={center}
                cy={center}
                r={radius}
                stroke={ring.color}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
              />
            </g>
          );
        })}
      </svg>
      <div className="ring-center">
        <strong>{average}%</strong>
        <span>today</span>
      </div>
    </div>
  );
}
