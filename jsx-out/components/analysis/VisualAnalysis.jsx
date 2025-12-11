import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
const COLORS = {
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#22c55e',
};
export function VisualAnalysis({ scan }) {
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
    const overallHealth = Math.max(0, 100 - (scan.diseases.reduce((acc, d) => acc + d.probability, 0) / Math.max(scan.diseases.length, 1)));
    // Calculate the angle for the gauge needle based on percentage
    // 0% = -90deg (left), 100% = 90deg (right)
    const gaugeAngle = (overallHealth / 100) * 180 - 90;
    const gaugeColor = overallHealth >= 70 ? COLORS.low : overallHealth >= 40 ? COLORS.medium : COLORS.high;
    return (<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full overflow-y-auto scrollbar-thin">
      {/* Health Score Gauge */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-semibold text-foreground mb-4">Overall Health Score</h3>
        <div className="h-64 flex flex-col items-center justify-center">
          {/* SVG Gauge */}
          <svg viewBox="0 0 200 120" className="w-full max-w-[300px]">
            {/* Background arc */}
            <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="hsl(var(--muted))" strokeWidth="16" strokeLinecap="round"/>
            {/* Colored arc based on percentage */}
            <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke={gaugeColor} strokeWidth="16" strokeLinecap="round" strokeDasharray={`${(overallHealth / 100) * 251.2} 251.2`}/>
            {/* Needle */}
            <g transform={`rotate(${gaugeAngle}, 100, 100)`}>
              <line x1="100" y1="100" x2="100" y2="35" stroke="hsl(var(--foreground))" strokeWidth="3" strokeLinecap="round"/>
              <circle cx="100" cy="100" r="8" fill="hsl(var(--foreground))"/>
            </g>
            {/* Labels */}
            <text x="20" y="115" className="fill-muted-foreground" fontSize="10" textAnchor="middle">0%</text>
            <text x="180" y="115" className="fill-muted-foreground" fontSize="10" textAnchor="middle">100%</text>
          </svg>
          {/* Score display */}
          <div className="text-center mt-4">
            <span className="text-4xl font-bold" style={{ color: gaugeColor }}>{Math.round(overallHealth)}%</span>
            <p className="text-muted-foreground text-sm mt-1">Health Score</p>
          </div>
        </div>
      </div>

      {/* Risk Distribution Pie */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-semibold text-foreground mb-4">Risk Distribution</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2} dataKey="value">
                {pieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color}/>))}
              </Pie>
              <Tooltip contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            color: 'hsl(var(--foreground))',
        }}/>
              <Legend formatter={(value) => <span style={{ color: 'hsl(var(--foreground))' }}>{value}</span>}/>
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
              <XAxis type="number" domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))' }} axisLine={{ stroke: 'hsl(var(--border))' }}/>
              <YAxis type="category" dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={{ stroke: 'hsl(var(--border))' }} width={100}/>
              <Tooltip contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            color: 'hsl(var(--foreground))',
        }} formatter={(value) => [`${value}%`, 'Probability']}/>
              <Bar dataKey="probability" radius={[0, 4, 4, 0]}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>);
}
