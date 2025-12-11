import { ScanAnalysis } from "@/types/scan";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, RadialBarChart, RadialBar, Legend } from "recharts";

interface VisualAnalysisProps {
  scan: ScanAnalysis;
}

const COLORS = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#22c55e',
};

export function VisualAnalysis({ scan }: VisualAnalysisProps) {
  const pieData = scan.diseases.map(d => ({
    name: d.name,
    value: d.probability,
    color: d.probability >= 70 ? COLORS.high : d.probability >= 40 ? COLORS.medium : COLORS.low,
  }));

  const barData = scan.diseases.map(d => ({
    name: d.name.length > 15 ? d.name.substring(0, 15) + '...' : d.name,
    probability: d.probability,
    fill: d.probability >= 70 ? COLORS.high : d.probability >= 40 ? COLORS.medium : COLORS.low,
  }));

  const radialData = scan.diseases.map((d, i) => ({
    name: d.name,
    probability: d.probability,
    fill: d.probability >= 70 ? COLORS.high : d.probability >= 40 ? COLORS.medium : COLORS.low,
  }));

  const overallHealth = Math.max(0, 100 - (scan.diseases.reduce((acc, d) => acc + d.probability, 0) / Math.max(scan.diseases.length, 1)));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full overflow-y-auto scrollbar-thin">
      {/* Health Score Gauge */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-semibold text-foreground mb-4">Overall Health Score</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="90%"
              barSize={20}
              data={[{ name: 'Health', value: overallHealth, fill: overallHealth >= 70 ? COLORS.low : overallHealth >= 40 ? COLORS.medium : COLORS.high }]}
              startAngle={180}
              endAngle={0}
            >
              <RadialBar
                background={{ fill: 'hsl(222 47% 14%)' }}
                dataKey="value"
                cornerRadius={10}
              />
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-foreground"
                style={{ fontSize: '2.5rem', fontWeight: 'bold' }}
              >
                {Math.round(overallHealth)}%
              </text>
              <text
                x="50%"
                y="62%"
                textAnchor="middle"
                className="fill-muted-foreground"
                style={{ fontSize: '0.875rem' }}
              >
                Health Score
              </text>
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Risk Distribution Pie */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-semibold text-foreground mb-4">Risk Distribution</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(222 47% 8%)',
                  border: '1px solid hsl(222 47% 18%)',
                  borderRadius: '8px',
                  color: 'hsl(210 40% 96%)',
                }}
              />
              <Legend
                formatter={(value) => <span style={{ color: 'hsl(210 40% 96%)' }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Probability Bar Chart */}
      <div className="bg-card border border-border rounded-xl p-6 lg:col-span-2">
        <h3 className="font-semibold text-foreground mb-4">Condition Probability Analysis</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} layout="vertical" margin={{ left: 20, right: 20 }}>
              <XAxis
                type="number"
                domain={[0, 100]}
                tick={{ fill: 'hsl(215 20% 55%)' }}
                axisLine={{ stroke: 'hsl(222 47% 18%)' }}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: 'hsl(215 20% 55%)', fontSize: 12 }}
                axisLine={{ stroke: 'hsl(222 47% 18%)' }}
                width={100}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(222 47% 8%)',
                  border: '1px solid hsl(222 47% 18%)',
                  borderRadius: '8px',
                  color: 'hsl(210 40% 96%)',
                }}
                formatter={(value: number) => [`${value}%`, 'Probability']}
              />
              <Bar dataKey="probability" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
