import { useState } from "react";
export function ComparisonView({ currentScan, allScans }) {
    const [compareScanId, setCompareScanId] = useState(allScans.find(s => s.id !== currentScan.id)?.id || null);
    const compareScan = allScans.find(s => s.id === compareScanId);
    const otherScans = allScans.filter(s => s.id !== currentScan.id);
    const getColor = (probability) => {
        if (probability >= 70)
            return '#ef4444';
        if (probability >= 40)
            return '#f59e0b';
        return '#22c55e';
    };
    return (<div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Scan Selector */}
      {otherScans.length > 0 && (<div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '16px'
            }}>
          <span style={{ fontSize: '14px', color: '#6b7280' }}>Compare with:</span>
          <select value={compareScanId || ''} onChange={(e) => setCompareScanId(e.target.value || null)} style={{
                backgroundColor: '#f3f4f6',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '14px',
                border: '1px solid #e5e7eb',
                outline: 'none',
            }}>
            {otherScans.map(scan => (<option key={scan.id} value={scan.id}>{scan.name}</option>))}
          </select>
        </div>)}

      {/* Comparison Grid */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', minHeight: 0 }}>
        {/* Current Scan */}
        <div style={{
            backgroundColor: 'white',
            border: '2px solid #0891b2',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
        }}>
          <h3 style={{ fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0891b2' }}/>
            {currentScan.name}
          </h3>
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f3f4f6',
            borderRadius: '8px',
            marginBottom: '16px',
            minHeight: '200px',
        }}>
            <img src={currentScan.imageUrl} alt={currentScan.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}/>
          </div>
          <div style={{ overflowY: 'auto' }}>
            {currentScan.diseases.map((disease, i) => (<div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', padding: '4px 0' }}>
                <span style={{ color: '#6b7280' }}>{disease.name}</span>
                <span style={{ fontWeight: 600, fontFamily: 'monospace', color: getColor(disease.probability) }}>
                  {disease.probability}%
                </span>
              </div>))}
          </div>
        </div>

        {/* Compare Scan */}
        {compareScan ? (<div style={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
            }}>
            <h3 style={{ fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#6b7280' }}/>
              {compareScan.name}
            </h3>
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f3f4f6',
                borderRadius: '8px',
                marginBottom: '16px',
                minHeight: '200px',
            }}>
              <img src={compareScan.imageUrl} alt={compareScan.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}/>
            </div>
            <div style={{ overflowY: 'auto' }}>
              {compareScan.diseases.map((disease, i) => {
                const currentDisease = currentScan.diseases.find(d => d.name === disease.name);
                const diff = currentDisease ? disease.probability - currentDisease.probability : 0;
                return (<div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', padding: '4px 0' }}>
                    <span style={{ color: '#6b7280' }}>{disease.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 600, fontFamily: 'monospace', color: getColor(disease.probability) }}>
                        {disease.probability}%
                      </span>
                      {diff !== 0 && (<span style={{ fontSize: '12px', fontFamily: 'monospace', color: diff > 0 ? '#ef4444' : '#22c55e' }}>
                          ({diff > 0 ? '+' : ''}{diff}%)
                        </span>)}
                    </div>
                  </div>);
            })}
            </div>
          </div>) : (<div style={{
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
              Upload another scan to compare results
            </p>
          </div>)}
      </div>
    </div>);
}
