import { Patient } from "@/types/scan";

interface AgeBarProps {
  patient: Patient;
}

// Calculate "true age" based on scan analysis - biological age based on disease severity
export const calculateTrueAge = (patient: Patient): number => {
  const actualAge = patient.age || 0;
  if (!patient.scans.length || actualAge === 0) return actualAge;
  
  // Get the highest disease probability from all scans
  const allDiseases = patient.scans.flatMap(s => s.diseases);
  const maxProb = Math.max(...allDiseases.map(d => d.probability), 0);
  
  // Calculate age increment based on disease severity
  // Higher probability = higher biological age
  let ageIncrement = 0;
  if (maxProb >= 70) {
    ageIncrement = Math.round((maxProb - 40) / 10) + 3; // 6-8 years for high risk
  } else if (maxProb >= 40) {
    ageIncrement = Math.round((maxProb - 30) / 15) + 1; // 2-4 years for moderate
  } else if (maxProb >= 20) {
    ageIncrement = 1; // 1 year for low risk
  }
  
  return Math.min(actualAge + ageIncrement, 100);
};

export function AgeBar({ patient }: AgeBarProps) {
  const actualAge = patient.age || 0;
  const trueAge = calculateTrueAge(patient);
  
  if (actualAge === 0) {
    return <span style={{ color: '#6b7280' }}>Age: N/A</span>;
  }

  return (
    <div style={{ marginTop: '12px', width: '100%', maxWidth: '400px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ fontSize: '13px', color: '#374151', fontWeight: 500 }}>Age Assessment</span>
        <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
          <span style={{ color: '#22c55e' }}>Actual: {actualAge}</span>
          <span style={{ color: '#ef4444' }}>True: {trueAge}</span>
        </div>
      </div>
      <div style={{ 
        position: 'relative', 
        height: '24px', 
        borderRadius: '12px', 
        backgroundColor: '#e5e7eb',
        overflow: 'hidden',
      }}>
        {/* Green section: 0 to actual age */}
        <div style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: `${actualAge}%`,
          backgroundColor: '#22c55e',
          borderRadius: '12px 0 0 12px',
        }} />
        
        {/* Red section: actual to true age */}
        {trueAge > actualAge && (
          <div style={{
            position: 'absolute',
            left: `${actualAge}%`,
            top: 0,
            bottom: 0,
            width: `${trueAge - actualAge}%`,
            backgroundColor: '#ef4444',
          }} />
        )}
        
        {/* Grey section is the background */}
        
        {/* Actual age marker */}
        <div style={{
          position: 'absolute',
          left: `${actualAge}%`,
          top: '-2px',
          bottom: '-2px',
          width: '3px',
          backgroundColor: '#166534',
          transform: 'translateX(-50%)',
          borderRadius: '2px',
        }} />
        
        {/* True age marker */}
        {trueAge > actualAge && (
          <div style={{
            position: 'absolute',
            left: `${trueAge}%`,
            top: '-2px',
            bottom: '-2px',
            width: '3px',
            backgroundColor: '#991b1b',
            transform: 'translateX(-50%)',
            borderRadius: '2px',
          }} />
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px', fontSize: '10px', color: '#9ca3af' }}>
        <span>0</span>
        <span>50</span>
        <span>100</span>
      </div>
    </div>
  );
}
