import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, Tooltip, XAxis, YAxis } from "recharts";

const COLORS = ["#DC2626", "#D97706", "#2563EB", "#16A34A", "#C560CC", "#943A9B"];

export function Donut({ data, size = 160, centerLabel, centerValue }: {
  data: { name: string; value: number; color?: string }[];
  size?: number; centerLabel?: string; centerValue?: React.ReactNode;
}) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" innerRadius={size * 0.32} outerRadius={size * 0.48} paddingAngle={2} stroke="none">
            {data.map((d, i) => <Cell key={i} fill={d.color ?? COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip cursor={false} contentStyle={{ borderRadius: 8, border: "1px solid #E9DDEA", fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
      {(centerValue || centerLabel) && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          {centerValue && <div className="text-2xl font-semibold text-foreground">{centerValue}</div>}
          {centerLabel && <div className="text-xs text-muted-foreground">{centerLabel}</div>}
        </div>
      )}
    </div>
  );
}

export function Sparkline({ data, color = "#C560CC", height = 48 }: { data: number[]; color?: string; height?: number }) {
  const series = data.map((v, i) => ({ x: i, v }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={series}>
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function TrendChart({ data, color = "#C560CC", height = 200, dataKey = "v", xKey = "x" }: { data: any[]; color?: string; height?: number; dataKey?: string; xKey?: string }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <XAxis dataKey={xKey} tickLine={false} axisLine={false} fontSize={11} stroke="#6F6478" />
        <YAxis tickLine={false} axisLine={false} fontSize={11} stroke="#6F6478" width={28} />
        <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E9DDEA", fontSize: 12 }} />
        <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={{ r: 3, fill: color }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
