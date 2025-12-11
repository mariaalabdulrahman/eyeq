import { DiseaseRiskBar } from "@/components/DiseaseRiskBar";
export function TextualAnalysis({ scan }) {
    const highRiskDiseases = scan.diseases.filter(d => d.probability >= 70);
    const hasHighRisk = highRiskDiseases.length > 0;
    return (<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', height: '100%' }}>
      {/* Image Display */}
      <div style={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
        }}>
        <h3 style={{ fontWeight: 600, marginBottom: '16px', color: '#111' }}>Scan Image</h3>
        <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f3f4f6',
            borderRadius: '8px',
            overflow: 'hidden',
        }}>
          <img src={scan.imageUrl} alt={scan.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}/>
        </div>
      </div>

      {/* Analysis Results */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
        {/* Summary Card */}
        <div style={{
            backgroundColor: 'white',
            border: `1px solid ${hasHighRisk ? '#fca5a5' : '#86efac'}`,
            borderRadius: '12px',
            padding: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <span style={{ fontSize: '24px' }}>{hasHighRisk ? '⚠️' : '✅'}</span>
            <h3 style={{ fontWeight: 600, color: '#111' }}>
              {hasHighRisk ? "Attention Required" : "Analysis Complete"}
            </h3>
          </div>
          <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.6 }}>
            {scan.summary}
          </p>
        </div>

        {/* Disease List */}
        <div>
          <h3 style={{ fontWeight: 600, marginBottom: '12px', color: '#111' }}>Detected Conditions</h3>
          {scan.diseases.length > 0 ? (<div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {scan.diseases.map((disease, index) => (<DiseaseRiskBar key={index} disease={disease}/>))}
            </div>) : (<p style={{ fontSize: '14px', color: '#6b7280' }}>
              No significant conditions detected.
            </p>)}
        </div>
      </div>
    </div>);
}
