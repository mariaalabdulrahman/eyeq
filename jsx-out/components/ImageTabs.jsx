export function ImageTabs({ scans, activeTab, onTabChange, onAddNew, onRemoveTab }) {
    return (<div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 16px', backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', overflowX: 'auto' }}>
      {scans.map((scan) => (<div key={scan.id} onClick={() => onTabChange(scan.id)} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
                backgroundColor: activeTab === scan.id ? '#ecfeff' : 'transparent',
                border: activeTab === scan.id ? '1px solid #0891b2' : '1px solid transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
            }}>
          <img src={scan.imageUrl} alt={scan.name} style={{ width: '24px', height: '24px', borderRadius: '4px', objectFit: 'cover' }}/>
          <span style={{ fontSize: '14px', fontWeight: activeTab === scan.id ? 600 : 400, color: activeTab === scan.id ? '#0891b2' : '#374151', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {scan.name}
          </span>
          <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '10px', backgroundColor: scan.type === 'oct' ? '#dbeafe' : '#fef3c7', color: scan.type === 'oct' ? '#1d4ed8' : '#92400e', fontWeight: 600 }}>
            {scan.type.toUpperCase()}
          </span>
          <button onClick={(e) => { e.stopPropagation(); onRemoveTab(scan.id); }} style={{ width: '20px', height: '20px', borderRadius: '50%', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', fontSize: '14px', color: '#9ca3af' }}>
            ×
          </button>
        </div>))}
      <button onClick={onAddNew} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', border: '1px dashed #d1d5db', backgroundColor: 'transparent', cursor: 'pointer', color: '#6b7280', fontSize: '14px' }}>
        <span>+</span> Add Scan
      </button>
    </div>);
}
