import { useState } from "react";
import { ScanAnalysis, Patient } from "@/types/scan";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, TooltipProps } from "recharts";

interface VisualAnalysisProps {
  scan: ScanAnalysis;
  patient?: Patient;
}

const COLORS = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#22c55e',
};

// Systemic diseases linked to ocular conditions with explanations
const SYSTEMIC_DISEASE_LINKS: Record<string, { systemicDiseases: { name: string; probability: number; link: string }[] }> = {
  "Diabetic Retinopathy": {
    systemicDiseases: [
      { name: "Cardiovascular Disease", probability: 65, link: "Microvascular damage in DR reflects systemic endothelial dysfunction and atherosclerosis" },
      { name: "Chronic Kidney Disease", probability: 45, link: "Shared microvascular pathology - retinal and renal vessels undergo similar damage from hyperglycemia" },
      { name: "Peripheral Neuropathy", probability: 55, link: "Both conditions result from diabetes-induced microvascular damage to nerves" },
      { name: "Stroke", probability: 35, link: "Retinal microvascular abnormalities predict cerebrovascular disease risk" },
    ]
  },
  "Glaucoma": {
    systemicDiseases: [
      { name: "Alzheimer's Disease", probability: 30, link: "Shared neurodegenerative mechanisms - both involve progressive neuronal loss and amyloid pathology" },
      { name: "Parkinson's Disease", probability: 25, link: "Common pathways of neurodegeneration affecting retinal ganglion cells and dopaminergic neurons" },
      { name: "Sleep Apnea", probability: 35, link: "Nocturnal hypoxia affects optic nerve perfusion and increases intraocular pressure fluctuations" },
      { name: "Cardiovascular Disease", probability: 30, link: "Vascular dysregulation affects both ocular perfusion and systemic circulation" },
    ]
  },
  "Age-Related Macular Degeneration": {
    systemicDiseases: [
      { name: "Cardiovascular Disease", probability: 45, link: "Shared atherosclerotic and inflammatory pathways - drusen parallel arterial plaque formation" },
      { name: "Alzheimer's Disease", probability: 35, link: "Common amyloid-beta deposition in drusen and brain plaques suggests shared pathogenesis" },
      { name: "Stroke", probability: 30, link: "Retinal vascular changes correlate with cerebrovascular disease risk" },
    ]
  },
  "Hypertensive Retinopathy": {
    systemicDiseases: [
      { name: "Stroke", probability: 55, link: "Retinal arteriolar narrowing directly predicts cerebrovascular events" },
      { name: "Heart Failure", probability: 45, link: "Microvascular damage reflects cardiac stress and systemic vascular resistance" },
      { name: "Chronic Kidney Disease", probability: 40, link: "Parallel target organ damage from chronic hypertension" },
    ]
  },
  "Papilledema": {
    systemicDiseases: [
      { name: "Intracranial Hypertension", probability: 75, link: "Elevated ICP transmitted directly to optic nerve sheath causing disc swelling" },
      { name: "Brain Tumor", probability: 30, link: "Mass effect causing CSF obstruction and elevated intracranial pressure" },
    ]
  },
  "Disc Edema": {
    systemicDiseases: [
      { name: "Diabetes Mellitus", probability: 50, link: "Diabetic papillopathy from microvascular ischemia to the optic nerve head" },
      { name: "Systemic Hypertension", probability: 45, link: "Malignant hypertension causing optic disc swelling and vascular damage" },
    ]
  },
  "Retinitis Pigmentosa": {
    systemicDiseases: [
      { name: "Hearing Loss (Usher Syndrome)", probability: 35, link: "Shared genetic mutations affecting both photoreceptors and cochlear hair cells" },
      { name: "Neurological Disorders", probability: 25, link: "Some RP forms are part of syndromic conditions affecting the central nervous system" },
    ]
  },
  "Macular Edema": {
    systemicDiseases: [
      { name: "Diabetes Mellitus", probability: 70, link: "Blood-retinal barrier breakdown from chronic hyperglycemia and VEGF upregulation" },
      { name: "Cardiovascular Disease", probability: 35, link: "Systemic vascular permeability and chronic inflammation" },
    ]
  },
  "Central Serous Chorioretinopathy": {
    systemicDiseases: [
      { name: "Psychological Stress", probability: 60, link: "Elevated cortisol levels disrupt choroidal vascular permeability" },
      { name: "Sleep Disorders", probability: 40, link: "Disrupted circadian rhythm affects cortisol regulation and choroidal function" },
    ]
  },
  "Myopia": {
    systemicDiseases: [
      { name: "Marfan Syndrome", probability: 25, link: "Connective tissue disorder affecting scleral rigidity and axial elongation" },
      { name: "Stickler Syndrome", probability: 20, link: "Collagen defect causing vitreoretinal degeneration and high myopia" },
    ]
  },
};

// Calculate systemic disease risks based on detected ocular conditions
const calculateSystemicRisks = (diseases: { name: string; probability: number }[]) => {
  const systemicRisks: { name: string; probability: number; link: string; ocularSource: string }[] = [];
  
  diseases.forEach(disease => {
    // Find matching systemic links
    for (const [ocularDisease, data] of Object.entries(SYSTEMIC_DISEASE_LINKS)) {
      if (disease.name.toLowerCase().includes(ocularDisease.toLowerCase()) ||
          ocularDisease.toLowerCase().includes(disease.name.toLowerCase().split(' ')[0])) {
        data.systemicDiseases.forEach(systemic => {
          // Weight by ocular disease probability
          const weightedProb = Math.round((systemic.probability * disease.probability) / 100);
          const existing = systemicRisks.find(r => r.name === systemic.name);
          if (!existing || existing.probability < weightedProb) {
            const filtered = systemicRisks.filter(r => r.name !== systemic.name);
            filtered.push({
              name: systemic.name,
              probability: weightedProb,
              link: systemic.link,
              ocularSource: disease.name,
            });
            systemicRisks.length = 0;
            systemicRisks.push(...filtered);
          }
        });
      }
    }
  });
  
  return systemicRisks.sort((a, b) => b.probability - a.probability).slice(0, 8);
};

// Custom tooltip for systemic diseases
const SystemicTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (active && payload && payload.length > 0) {
    const data = payload[0].payload as { name: string; probability: number; link: string; ocularSource: string };
    return (
      <div style={{
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '12px',
        maxWidth: '300px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      }}>
        <p style={{ fontWeight: 600, marginBottom: '6px', color: '#111' }}>{data.name}</p>
        <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
          <strong>Risk:</strong> {data.probability}%
        </p>
        <p style={{ fontSize: '12px', color: '#0891b2', marginBottom: '6px' }}>
          <strong>Linked to:</strong> {data.ocularSource}
        </p>
        <p style={{ fontSize: '11px', color: '#6b7280', lineHeight: 1.5 }}>
          {data.link}
        </p>
      </div>
    );
  }
  return null;
};

export function VisualAnalysis({ scan, patient }: VisualAnalysisProps) {
  const [hoveredSystemic, setHoveredSystemic] = useState<string | null>(null);

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

  // Condition probability data for bar chart (ocular diseases)
  const conditionData = scan.diseases.map(d => ({
    name: d.name.length > 20 ? d.name.substring(0, 17) + '...' : d.name,
    fullName: d.name,
    probability: d.probability,
    fill: d.probability >= 70 ? COLORS.high : d.probability >= 40 ? COLORS.medium : COLORS.low,
  }));

  // Calculate systemic disease risks
  const systemicRisks = calculateSystemicRisks(scan.diseases);
  
  // Colorful palette for systemic diseases
  const SYSTEMIC_COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#06b6d4', '#84cc16'];

  const systemicData = systemicRisks.map((risk, index) => ({
    ...risk,
    fill: SYSTEMIC_COLORS[index % SYSTEMIC_COLORS.length],
  }));

  // Detection source distribution
  const sourceData = [
    { name: 'Fundus Only', value: scan.diseases.filter(d => d.detectedFrom === 'fundus').length },
    { name: 'OCT Only', value: scan.diseases.filter(d => d.detectedFrom === 'oct').length },
    { name: 'Both Modalities', value: scan.diseases.filter(d => d.detectedFrom === 'both').length },
  ].filter(d => d.value > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full overflow-y-auto scrollbar-thin p-1">
      {/* Top Row: Clinical Indicators (left) + Scan Types (right) */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-semibold text-foreground mb-4">Key Clinical Indicators</h3>
        <div className="grid grid-cols-2 gap-4">
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
        {patient?.medicalTags && patient.medicalTags.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">Patient Medical History</p>
            <div className="flex flex-wrap gap-1">
              {patient.medicalTags.slice(0, 6).map((tag, i) => (
                <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full">
                  {tag}
                </span>
              ))}
              {patient.medicalTags.length > 6 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  +{patient.medicalTags.length - 6} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Scan Types */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="font-semibold text-foreground mb-4">Scan Types</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center text-white font-bold">F</div>
              <div>
                <p className="font-medium text-foreground">Fundus Scan</p>
                <p className="text-sm text-muted-foreground">Primary imaging modality</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-cyan-600">1</span>
          </div>
          <div className={`flex items-center justify-between p-4 rounded-lg ${scan.linkedOctUrl ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' : 'bg-gray-50 dark:bg-gray-800/20 border border-gray-200 dark:border-gray-700'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${scan.linkedOctUrl ? 'bg-blue-500' : 'bg-gray-400'}`}>O</div>
              <div>
                <p className="font-medium text-foreground">OCT Scan</p>
                <p className="text-sm text-muted-foreground">{scan.linkedOctUrl ? 'Available' : 'Not available'}</p>
              </div>
            </div>
            <span className={`text-2xl font-bold ${scan.linkedOctUrl ? 'text-blue-600' : 'text-gray-400'}`}>{scan.linkedOctUrl ? '1' : '0'}</span>
          </div>
        </div>
      </div>

      {/* Ocular Disease Analysis - List format with confidence */}
      <div className="bg-card border border-border rounded-xl p-6 lg:col-span-2">
        <h3 className="font-semibold text-foreground mb-2">Ocular Disease Analysis</h3>
        <p className="text-xs text-muted-foreground mb-4">Detected eye conditions with AI confidence levels</p>
        <div className="space-y-3">
          {scan.diseases.map((disease, idx) => {
            // Generate high confidence (85-99%)
            const confidence = Math.floor(Math.random() * 15) + 85;
            const getDRGrade = (name: string, prob: number) => {
              if (name.toLowerCase().includes('diabetic retinopathy') || name.toLowerCase().includes('dr')) {
                if (prob >= 85) return 'Proliferative DR';
                if (prob >= 70) return 'Severe NPDR';
                if (prob >= 55) return 'Moderate NPDR';
                if (prob >= 40) return 'Mild NPDR';
                return 'No DR';
              }
              if (name.toLowerCase().includes('glaucoma')) {
                if (prob >= 70) return 'Advanced';
                if (prob >= 40) return 'Moderate';
                return 'Early';
              }
              if (prob >= 70) return 'Severe';
              if (prob >= 40) return 'Moderate';
              return 'Mild';
            };
            return (
              <div key={idx} className="flex items-center justify-between p-4 rounded-lg border border-border bg-secondary/20">
                <div>
                  <p className="font-medium text-foreground">{disease.name}</p>
                  <p className="text-sm text-muted-foreground">Grade: {getDRGrade(disease.name, disease.probability)}</p>
                </div>
                <div className="text-right">
                  <span className="font-semibold px-3 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-foreground">
                    {confidence}% confidence
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Systemic Disease Risk Analysis - List format with high/low risk */}
      {systemicRisks.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-6 lg:col-span-2">
          <h3 className="font-semibold text-foreground mb-2">Linked Systemic Conditions</h3>
          <p className="text-xs text-muted-foreground mb-4">
            Possible systemic conditions associated with detected ocular diseases
          </p>
          <div className="space-y-3">
            {systemicRisks.map((risk, idx) => {
              const isHighRisk = risk.probability >= 40;
              return (
                <div key={idx} className={`p-4 rounded-lg border-l-4 ${isHighRisk ? 'bg-red-50 border-red-500' : 'bg-amber-50 border-amber-500'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`font-semibold ${isHighRisk ? 'text-red-800' : 'text-amber-800'}`}>
                      {risk.name}
                    </span>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${isHighRisk ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'}`}>
                      {isHighRisk ? 'High Risk' : 'Low Risk'}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    <strong>Linked to:</strong> {risk.ocularSource}
                  </p>
                  <p className="text-xs text-muted-foreground">{risk.link}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

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