import { Disease } from "@/types/scan";

interface DiseaseRiskBarProps {
  disease: Disease;
}

export function DiseaseRiskBar({ disease }: DiseaseRiskBarProps) {
  const getColor = () => {
    if (disease.probability >= 70) return '#ef4444';
    if (disease.probability >= 40) return '#f59e0b';
    return '#22c55e';
  };

  const getBgColor = () => {
    if (disease.probability >= 70) return '#fef2f2';
    if (disease.probability >= 40) return '#fffbeb';
    return '#f0fdf4';
  };

  return (
    <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
        <div>
          <h4 style={{ fontWeight: 600, color: '#111', marginBottom: '2px' }}>{disease.name}</h4>
          <p style={{ fontSize: '13px', color: '#6b7280' }}>{disease.description}</p>
        </div>
        <span style={{ padding: '4px 10px', borderRadius: '16px', fontSize: '13px', fontWeight: 600, backgroundColor: getBgColor(), color: getColor() }}>
          {disease.probability}%
        </span>
      </div>
      <div style={{ height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ width: `${disease.probability}%`, height: '100%', backgroundColor: getColor(), borderRadius: '4px' }} />
      </div>
    </div>
  );
}
