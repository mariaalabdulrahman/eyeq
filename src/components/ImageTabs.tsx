import { ScanAnalysis } from "@/types/scan";
import { Plus, X, Image } from "lucide-react";

interface ImageTabsProps {
  scans: ScanAnalysis[];
  activeTab: string | null;
  onTabChange: (id: string) => void;
  onAddNew: () => void;
  onRemoveTab: (id: string) => void;
  compact?: boolean;
}

export function ImageTabs({ scans, activeTab, onTabChange, onAddNew, onRemoveTab, compact = false }: ImageTabsProps) {
  if (compact) {
    return (
      <div style={{ padding: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <p style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>
            Image Library ({scans.length})
          </p>
          <button
            onClick={onAddNew}
            style={{
              padding: '4px 8px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: '#0891b2',
              color: 'white',
              cursor: 'pointer',
              fontSize: '11px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Plus size={12} /> Add
          </button>
        </div>
        
        {scans.length === 0 ? (
          <div style={{ 
            padding: '16px', 
            textAlign: 'center', 
            color: '#9ca3af',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
          }}>
            <Image size={24} style={{ margin: '0 auto 8px' }} />
            <p style={{ fontSize: '12px' }}>No images uploaded</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {scans.map((scan) => (
              <div
                key={scan.id}
                onClick={() => onTabChange(scan.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  border: activeTab === scan.id ? '2px solid #0891b2' : '1px solid #e5e7eb',
                  backgroundColor: activeTab === scan.id ? '#ecfeff' : '#f9fafb',
                }}
              >
                <img
                  src={scan.imageUrl}
                  alt={scan.name}
                  style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ 
                    fontSize: '13px', 
                    fontWeight: activeTab === scan.id ? 600 : 500, 
                    color: activeTab === scan.id ? '#0891b2' : '#374151',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {scan.name}
                  </p>
                  <p style={{ fontSize: '10px', color: '#9ca3af' }}>
                    {scan.linkedOctUrl ? 'Fundus + OCT' : 'Fundus'}
                  </p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); onRemoveTab(scan.id); }}
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    border: 'none',
                    backgroundColor: 'transparent',
                    color: '#9ca3af',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 16px', backgroundColor: 'white', borderBottom: '1px solid #e5e7eb', overflowX: 'auto' }}>
      {scans.map((scan) => (
        <div
          key={scan.id}
          onClick={() => onTabChange(scan.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '8px',
            backgroundColor: activeTab === scan.id ? '#ecfeff' : 'transparent',
            border: activeTab === scan.id ? '1px solid #0891b2' : '1px solid transparent',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          <img src={scan.imageUrl} alt={scan.name} style={{ width: '24px', height: '24px', borderRadius: '4px', objectFit: 'cover' }} />
          <span style={{ fontSize: '14px', fontWeight: activeTab === scan.id ? 600 : 400, color: activeTab === scan.id ? '#0891b2' : '#374151', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {scan.name}
          </span>
          <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '10px', backgroundColor: scan.linkedOctUrl ? '#dbeafe' : '#fef3c7', color: scan.linkedOctUrl ? '#1d4ed8' : '#92400e', fontWeight: 600 }}>
            {scan.linkedOctUrl ? 'FUNDUS+OCT' : 'FUNDUS'}
          </span>
          <button onClick={(e) => { e.stopPropagation(); onRemoveTab(scan.id); }} style={{ width: '20px', height: '20px', borderRadius: '50%', border: 'none', backgroundColor: 'transparent', cursor: 'pointer', fontSize: '14px', color: '#9ca3af' }}>
            ×
          </button>
        </div>
      ))}
      <button onClick={onAddNew} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', border: '1px dashed #d1d5db', backgroundColor: 'transparent', cursor: 'pointer', color: '#6b7280', fontSize: '14px' }}>
        <Plus size={16} /> Add Scan
      </button>
    </div>
  );
}
