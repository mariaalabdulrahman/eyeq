import { ScanAnalysis } from "@/types/scan";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

interface VisualAnalysisProps {
  scan: ScanAnalysis;
}

const COLORS = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#22c55e',
};

export function VisualAnalysis({ scan }: VisualAnalysisProps) {
  // Medical statistics calculations
  const avgProbability = scan.diseases.length > 0 
    ? Math.round(scan.diseases.reduce((acc, d) => acc + d.probability, 0) / scan.diseases.length)
    : 0;
  
  const maxProbability = scan.diseases.length > 0 
    ? Math.max(...scan.diseases.map(d => d.probability))
    : 0;

  const highRiskCount = scan.diseases.filter(d => d.probability >= 70).length;
  const moderateRiskCount = scan.diseases.filter(d => d.probability >= 40 && d.probability < 70).length;
  const lowRiskCount = scan.diseases.filter(d => d.probability < 40).length;

  // Fundus vs OCT detection breakdown
  const fundusDetected = scan.diseases.filter(d => d.detectedFrom === 'fundus' || d.detectedFrom === 'both').length;
  const octDetected = scan.diseases.filter(d => d.detectedFrom === 'oct' || d.detectedFrom === 'both').length;

  // Severity distribution for pie chart
  const severityData = [
    { name: 'High Risk', value: highRiskCount, color: COLORS.high },
    { name: 'Moderate Risk', value: moderateRiskCount, color: COLORS.medium },
    { name: 'Low Risk', value: lowRiskCount, color: COLORS.low },
  ].filter(d => d.value > 0);

  // Condition probability data for bar chart
  const conditionData = scan.diseases.map(d => ({
    name: d.name.length > 20 ? d.name.substring(0, 17) + '...' : d.name,
    fullName: d.name,
    probability: d.probability,
    fill: d.probability >= 70 ? COLORS.high : d.probability >= 40 ? COLORS.medium : COLORS.low,
  }));

  // Clinical metrics for radar chart
  const clinicalMetrics = [
    { metric: 'Retinal Health', value: Math.max(0, 100 - avgProbability), fullMark: 100 },
    { metric: 'Vascular Status', value: 100 - (scan.diseases.find(d => d.name.includes('Diabetic') || d.name.includes('Hypertensive'))?.probability || 0), fullMark: 100 },
    { metric: 'Optic Nerve', value: 100 - (scan.diseases.find(d => d.name.includes('Glaucoma') || d.name.includes('Papilledema'))?.probability || 0), fullMark: 100 },
    { metric: 'Macular Health', value: 100 - (scan.diseases.find(d => d.name.includes('Macular') || d.name.includes('AMD'))?.probability || 0), fullMark: 100 },
    { metric: 'Vitreous Status', value: 100 - (scan.diseases.find(d => d.name.includes('Vitreo') || d.name.includes('Epiretinal'))?.probability || 0), fullMark: 100 },
  ];

  // Detection source distribution
  const sourceData = [
    { name: 'Fundus Only', value: scan.diseases.filter(d => d.detectedFrom === 'fundus').length },
    { name: 'OCT Only', value: scan.diseases.filter(d => d.detectedFrom === 'oct').length },
    { name: 'Both Modalities', value: scan.diseases.filter(d => d.detectedFrom === 'both').length },
  ].filter(d => d.value > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full overflow-y-auto scrollbar-thin p-1">
      {/* Key Clinical Indicators */}
      <div className="bg-card border border-border rounded-xl p-6 lg:col-span-2">
        <h3 className="font-semibold text-foreground mb-4">Key Clinical Indicators</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-secondary/30 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Conditions Detected</p>
            <p className="text-3xl font-bold text-foreground">{scan.diseases.length}</p>
          </div>
          <div className="bg-secondary/30 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Max Risk Level</p>
            <p className="text-3xl font-bold" style={{ color: maxProbability >= 70 ? COLORS.high : maxProbability >= 40 ? COLORS.medium : COLORS.low }}>
              {maxProbability}%
            </p>
          </div>
          <div className="bg-secondary/30 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Avg. Probability</p>
            <p className="text-3xl font-bold text-foreground">{avgProbability}%</p>
          </div>
          <div className="bg-secondary/30 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Imaging Modalities</p>
            <p className="text-3xl font-bold text-primary">{scan.linkedOctUrl ? '2' : '1'}</p>
          </div>
        </div>
      </div>

      {/* Retinal Health Assessment Radar */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-semibold text-foreground mb-4">Retinal Health Assessment</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={clinicalMetrics}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis 
                dataKey="metric" 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 100]} 
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
              />
              <Radar
                name="Health Status"
                dataKey="value"
                stroke="#0891b2"
                fill="#0891b2"
                fillOpacity={0.3}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [`${value}%`, 'Health Score']}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Higher values indicate better health status in each category
        </p>
      </div>

      {/* Risk Stratification */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-semibold text-foreground mb-4">Risk Stratification</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={severityData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
                labelLine={false}
              >
                {severityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
              <Legend
                formatter={(value) => <span style={{ color: 'hsl(var(--foreground))' }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Condition Probability Analysis */}
      <div className="bg-card border border-border rounded-xl p-6 lg:col-span-2">
        <h3 className="font-semibold text-foreground mb-4">Condition Probability Analysis</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={conditionData} layout="vertical" margin={{ left: 20, right: 20 }}>
              <XAxis
                type="number"
                domain={[0, 100]}
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickFormatter={(v) => `${v}%`}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                width={140}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))',
                }}
                formatter={(value: number, name: string, props: any) => [`${value}%`, props.payload.fullName]}
              />
              <Bar dataKey="probability" radius={[0, 4, 4, 0]}>
                {conditionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.high }} />
            <span className="text-sm text-muted-foreground">High Risk (≥70%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.medium }} />
            <span className="text-sm text-muted-foreground">Moderate (40-69%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.low }} />
            <span className="text-sm text-muted-foreground">Low Risk (&lt;40%)</span>
          </div>
        </div>
      </div>

      {/* Detection Source Analysis (only if OCT available) */}
      {scan.linkedOctUrl && sourceData.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-6 lg:col-span-2">
          <h3 className="font-semibold text-foreground mb-4">Detection by Imaging Modality</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-lg p-4 text-center border border-cyan-200 dark:border-cyan-800">
              <p className="text-sm text-cyan-700 dark:text-cyan-300 mb-1">Fundus Detection</p>
              <p className="text-2xl font-bold text-cyan-600">{fundusDetected}</p>
              <p className="text-xs text-cyan-600/70 mt-1">conditions</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-1">OCT Detection</p>
              <p className="text-2xl font-bold text-blue-600">{octDetected}</p>
              <p className="text-xs text-blue-600/70 mt-1">conditions</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 text-center border border-purple-200 dark:border-purple-800">
              <p className="text-sm text-purple-700 dark:text-purple-300 mb-1">Multi-Modal</p>
              <p className="text-2xl font-bold text-purple-600">{scan.diseases.filter(d => d.detectedFrom === 'both').length}</p>
              <p className="text-xs text-purple-600/70 mt-1">confirmed by both</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
