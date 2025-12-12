import { useState, useMemo } from "react";
import { ScanAnalysis } from "@/types/scan";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from "recharts";

interface ComparisonViewProps {
  currentScan: ScanAnalysis;
  allScans: ScanAnalysis[];
}

type CompareMode = 'left-right' | 'progression';

// Systemic disease associations based on ocular findings
const getSystemicAssociations = (diseases: { name: string; probability: number }[]) => {
  const associations: { condition: string; relatedTo: string; description: string }[] = [];
  
  diseases.forEach(d => {
    if (d.probability < 40) return; // Only include medium/high severity
    
    if (d.name.toLowerCase().includes('diabetic')) {
      associations.push({
        condition: 'Diabetes Mellitus',
        relatedTo: d.name,
        description: 'Retinal microvascular changes indicate systemic glucose dysregulation affecting multiple organ systems.',
      });
      associations.push({
        condition: 'Cardiovascular Disease',
        relatedTo: d.name,
        description: 'Diabetic retinopathy correlates with increased risk of heart disease and stroke.',
      });
    }
    
    if (d.name.toLowerCase().includes('hypertensive') || d.name.toLowerCase().includes('hypertension')) {
      associations.push({
        condition: 'Hypertension',
        relatedTo: d.name,
        description: 'Retinal vascular changes reflect systemic hypertension status and cardiovascular risk.',
      });
      associations.push({
        condition: 'Stroke Risk',
        relatedTo: d.name,
        description: 'Hypertensive retinopathy is associated with increased cerebrovascular disease risk.',
      });
    }
    
    if (d.name.toLowerCase().includes('glaucoma')) {
      associations.push({
        condition: 'Cardiovascular Disease',
        relatedTo: d.name,
        description: 'Glaucoma shares risk factors with systemic vascular diseases including low perfusion pressure.',
      });
    }
    
    if (d.name.toLowerCase().includes('macular degeneration') || d.name.toLowerCase().includes('amd')) {
      associations.push({
        condition: 'Cardiovascular Disease',
        relatedTo: d.name,
        description: 'AMD and cardiovascular disease share common risk factors including smoking and hyperlipidemia.',
      });
    }
    
    if (d.name.toLowerCase().includes('papilledema') || d.name.toLowerCase().includes('disc edema')) {
      associations.push({
        condition: 'Intracranial Hypertension',
        relatedTo: d.name,
        description: 'Optic disc swelling may indicate elevated intracranial pressure requiring neurological evaluation.',
      });
    }
  });
  
  // Remove duplicates
  return associations.filter((v, i, a) => a.findIndex(t => t.condition === v.condition) === i);
};

export function ComparisonView({ currentScan, allScans }: ComparisonViewProps) {
  const [compareMode, setCompareMode] = useState<CompareMode>('left-right');
  const [compareScanId, setCompareScanId] = useState<string | null>(null);

  // Get scans filtered by comparison mode
  const availableCompareScans = useMemo(() => {
    if (compareMode === 'left-right') {
      // Find scans from the opposite eye on the same visit
      return allScans.filter(s => 
        s.id !== currentScan.id && 
        s.eyeSide !== currentScan.eyeSide &&
        s.visitNumber === currentScan.visitNumber
      );
    } else {
      // Find scans from the same eye on different visits
      return allScans.filter(s => 
        s.id !== currentScan.id && 
        s.eyeSide === currentScan.eyeSide &&
        s.visitNumber !== currentScan.visitNumber
      ).sort((a, b) => (a.visitNumber || 0) - (b.visitNumber || 0));
    }
  }, [allScans, currentScan, compareMode]);

  // Auto-select first available scan when mode changes
  useMemo(() => {
    if (availableCompareScans.length > 0 && !availableCompareScans.find(s => s.id === compareScanId)) {
      setCompareScanId(availableCompareScans[0].id);
    }
  }, [availableCompareScans, compareScanId]);

  const compareScan = allScans.find(s => s.id === compareScanId);

  const getColor = (probability: number) => {
    if (probability >= 70) return '#ef4444';
    if (probability >= 40) return '#f59e0b';
    return '#22c55e';
  };

  // Calculate progression data for chart
  const progressionData = useMemo(() => {
    if (!compareScan) return [];
    
    const allDiseaseNames = [...new Set([
      ...currentScan.diseases.map(d => d.name),
      ...compareScan.diseases.map(d => d.name),
    ])];

    return allDiseaseNames.map(name => {
      const current = currentScan.diseases.find(d => d.name === name);
      const compare = compareScan.diseases.find(d => d.name === name);
      
      const currentLabel = compareMode === 'progression' 
        ? `Visit ${compareScan.visitNumber || 1}` 
        : `${compareScan.eyeSide === 'left' ? 'Left' : 'Right'} Eye`;
      const selectedLabel = compareMode === 'progression'
        ? `Visit ${currentScan.visitNumber || 1}`
        : `${currentScan.eyeSide === 'left' ? 'Left' : 'Right'} Eye`;

      return {
        name: name.length > 15 ? name.substring(0, 15) + '...' : name,
        fullName: name,
        [selectedLabel]: current?.probability || 0,
        [currentLabel]: compare?.probability || 0,
        diff: (current?.probability || 0) - (compare?.probability || 0),
      };
    });
  }, [currentScan, compareScan, compareMode]);

  // Get systemic associations from both scans
  const systemicAssociations = useMemo(() => {
    const allDiseases = [
      ...currentScan.diseases,
      ...(compareScan?.diseases || []),
    ];
    return getSystemicAssociations(allDiseases);
  }, [currentScan, compareScan]);

  // Generate analysis description
  const analysisDescription = useMemo(() => {
    if (!compareScan) return '';
    
    const improvements: string[] = [];
    const worsenings: string[] = [];
    const stable: string[] = [];
    
    progressionData.forEach(d => {
      if (d.diff < -10) {
        worsenings.push(d.fullName);
      } else if (d.diff > 10) {
        improvements.push(d.fullName);
      } else {
        stable.push(d.fullName);
      }
    });

    let description = '';
    
    if (compareMode === 'progression') {
      if (improvements.length > 0) {
        description += `**Improvement observed** in ${improvements.join(', ')}. `;
      }
      if (worsenings.length > 0) {
        description += `**Progression detected** in ${worsenings.join(', ')} - recommend closer monitoring. `;
      }
      if (stable.length > 0 && improvements.length === 0 && worsenings.length === 0) {
        description += 'Disease markers remain stable between visits. Continue current management plan.';
      }
    } else {
      if (Math.abs(progressionData.reduce((sum, d) => sum + d.diff, 0)) > 20) {
        description += '**Asymmetry detected** between eyes. ';
        if (worsenings.length > 0) {
          description += `The ${currentScan.eyeSide === 'left' ? 'right' : 'left'} eye shows higher risk for ${worsenings.join(', ')}. `;
        }
        description += 'Bilateral asymmetry may warrant further investigation.';
      } else {
        description += 'Both eyes show similar patterns. No significant bilateral asymmetry detected.';
      }
    }
    
    return description;
  }, [progressionData, compareScan, compareMode, currentScan]);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
      {/* Mode Selector */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '16px', 
        backgroundColor: 'white', 
        border: '1px solid #e5e7eb', 
        borderRadius: '12px', 
        padding: '16px' 
      }}>
        <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: 500 }}>Compare:</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setCompareMode('left-right')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: compareMode === 'left-right' ? '2px solid #0891b2' : '1px solid #e5e7eb',
              backgroundColor: compareMode === 'left-right' ? '#ecfeff' : 'white',
              color: compareMode === 'left-right' ? '#0891b2' : '#6b7280',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500,
            }}
          >
            Left vs Right Eye (Same Visit)
          </button>
          <button
            onClick={() => setCompareMode('progression')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: compareMode === 'progression' ? '2px solid #0891b2' : '1px solid #e5e7eb',
              backgroundColor: compareMode === 'progression' ? '#ecfeff' : 'white',
              color: compareMode === 'progression' ? '#0891b2' : '#6b7280',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500,
            }}
          >
            Same Eye (Different Visits)
          </button>
        </div>

        {availableCompareScans.length > 0 && (
          <>
            <div style={{ width: '1px', height: '24px', backgroundColor: '#e5e7eb' }} />
            <select
              value={compareScanId || ''}
              onChange={(e) => setCompareScanId(e.target.value || null)}
              style={{
                backgroundColor: '#f3f4f6',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '14px',
                border: '1px solid #e5e7eb',
                outline: 'none',
              }}
            >
              {availableCompareScans.map(scan => (
                <option key={scan.id} value={scan.id}>
                  {scan.name} {scan.visitNumber ? `(Visit ${scan.visitNumber})` : ''}
                </option>
              ))}
            </select>
          </>
        )}
      </div>

      {/* Comparison Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Current Scan */}
        <div style={{ 
          backgroundColor: 'white', 
          border: '2px solid #0891b2', 
          borderRadius: '12px', 
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <h3 style={{ fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0891b2' }} />
            {currentScan.name}
            {currentScan.visitNumber && (
              <span style={{ fontSize: '11px', padding: '2px 8px', backgroundColor: '#f3e8ff', color: '#7c3aed', borderRadius: '10px' }}>
                Visit {currentScan.visitNumber}
              </span>
            )}
          </h3>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            backgroundColor: '#f3f4f6', 
            borderRadius: '8px', 
            marginBottom: '16px',
            minHeight: '180px',
          }}>
            <img
              src={currentScan.imageUrl}
              alt={currentScan.name}
              style={{ maxWidth: '100%', maxHeight: '180px', objectFit: 'contain' }}
            />
          </div>
          <div style={{ overflowY: 'auto', maxHeight: '150px' }}>
            {currentScan.diseases.map((disease, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', padding: '4px 0' }}>
                <span style={{ color: '#6b7280' }}>{disease.name}</span>
                <span style={{ fontWeight: 600, fontFamily: 'monospace', color: getColor(disease.probability) }}>
                  {disease.probability}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Compare Scan */}
        {compareScan ? (
          <div style={{ 
            backgroundColor: 'white', 
            border: '1px solid #e5e7eb', 
            borderRadius: '12px', 
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <h3 style={{ fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#6b7280' }} />
              {compareScan.name}
              {compareScan.visitNumber && (
                <span style={{ fontSize: '11px', padding: '2px 8px', backgroundColor: '#f3e8ff', color: '#7c3aed', borderRadius: '10px' }}>
                  Visit {compareScan.visitNumber}
                </span>
              )}
            </h3>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              backgroundColor: '#f3f4f6', 
              borderRadius: '8px', 
              marginBottom: '16px',
              minHeight: '180px',
            }}>
              <img
                src={compareScan.imageUrl}
                alt={compareScan.name}
                style={{ maxWidth: '100%', maxHeight: '180px', objectFit: 'contain' }}
              />
            </div>
            <div style={{ overflowY: 'auto', maxHeight: '150px' }}>
              {compareScan.diseases.map((disease, i) => {
                const currentDisease = currentScan.diseases.find(d => d.name === disease.name);
                const diff = currentDisease ? disease.probability - currentDisease.probability : 0;
                
                return (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', padding: '4px 0' }}>
                    <span style={{ color: '#6b7280' }}>{disease.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 600, fontFamily: 'monospace', color: getColor(disease.probability) }}>
                        {disease.probability}%
                      </span>
                      {diff !== 0 && (
                        <span style={{ fontSize: '12px', fontFamily: 'monospace', color: diff > 0 ? '#ef4444' : '#22c55e' }}>
                          ({diff > 0 ? '+' : ''}{diff}%)
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div style={{ 
            backgroundColor: 'white', 
            border: '2px dashed #e5e7eb', 
            borderRadius: '12px', 
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
          }}>
            <span style={{ fontSize: '48px', marginBottom: '16px' }}>⚖️</span>
            <h3 style={{ fontWeight: 600, marginBottom: '8px' }}>No Comparison Available</h3>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>
              {compareMode === 'left-right' 
                ? 'Upload a scan of the opposite eye from the same visit'
                : 'Upload another scan of the same eye from a different visit'}
            </p>
          </div>
        )}
      </div>

      {/* Progression Chart */}
      {compareScan && progressionData.length > 0 && (
        <div style={{ 
          backgroundColor: 'white', 
          border: '1px solid #e5e7eb', 
          borderRadius: '12px', 
          padding: '16px',
        }}>
          <h3 style={{ fontWeight: 600, marginBottom: '16px' }}>
            {compareMode === 'progression' ? 'Disease Progression Chart' : 'Bilateral Comparison Chart'}
          </h3>
          <div style={{ height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={progressionData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} unit="%" />
                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value: number, name: string) => [`${value}%`, name]}
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Legend />
                <Bar 
                  dataKey={compareMode === 'progression' ? `Visit ${currentScan.visitNumber || 1}` : `${currentScan.eyeSide === 'left' ? 'Left' : 'Right'} Eye`}
                  fill="#0891b2" 
                  radius={[0, 4, 4, 0]}
                />
                <Bar 
                  dataKey={compareMode === 'progression' ? `Visit ${compareScan.visitNumber || 1}` : `${compareScan.eyeSide === 'left' ? 'Left' : 'Right'} Eye`}
                  fill="#94a3b8" 
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Analysis Description */}
          <div style={{ 
            marginTop: '16px', 
            padding: '12px', 
            backgroundColor: '#f8fafc', 
            borderRadius: '8px',
            borderLeft: '4px solid #0891b2',
          }}>
            <h4 style={{ fontWeight: 600, marginBottom: '8px', fontSize: '14px' }}>Analysis Summary</h4>
            <p style={{ fontSize: '13px', color: '#4b5563', lineHeight: 1.6 }}
              dangerouslySetInnerHTML={{ 
                __html: analysisDescription
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              }} 
            />
          </div>
        </div>
      )}

      {/* Systemic Conditions */}
      {systemicAssociations.length > 0 && (
        <div style={{ 
          backgroundColor: 'white', 
          border: '1px solid #e5e7eb', 
          borderRadius: '12px', 
          padding: '16px',
        }}>
          <h3 style={{ fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>🩺</span>
            Possible Systemic Conditions
          </h3>
          <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '12px' }}>
            Based on detected ocular findings with medium-to-high severity (≥40%)
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {systemicAssociations.map((assoc, i) => (
              <div key={i} style={{ 
                padding: '12px', 
                backgroundColor: '#fef3c7', 
                borderRadius: '8px',
                borderLeft: '4px solid #f59e0b',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600, color: '#92400e' }}>{assoc.condition}</span>
                  <span style={{ fontSize: '11px', color: '#6b7280', backgroundColor: 'white', padding: '2px 8px', borderRadius: '10px' }}>
                    Related to: {assoc.relatedTo}
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: '#78350f' }}>{assoc.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}