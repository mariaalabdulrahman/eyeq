import { ScanAnalysis, ViewMode, Patient } from "@/types/scan";
import { TextualAnalysis } from "./analysis/TextualAnalysis";
import { VisualAnalysis } from "./analysis/VisualAnalysis";
import { ComparisonView } from "./analysis/ComparisonView";
import { VisualizationView } from "./analysis/VisualizationView";

interface AnalysisPanelProps {
  scan: ScanAnalysis | null;
  viewMode: ViewMode;
  allScans: ScanAnalysis[];
  onUploadClick: () => void;
  patient?: Patient;
}

export function AnalysisPanel({ scan, viewMode, allScans, onUploadClick, patient }: AnalysisPanelProps) {
  if (!scan) {
    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb' }}>
        <div style={{ width: '120px', height: '120px', borderRadius: '50%', backgroundColor: '#ecfeff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
          <span style={{ fontSize: '48px' }}>👁️</span>
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#111', marginBottom: '8px' }}>No Scan Selected</h2>
        <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '24px' }}>Upload an OCT or Fundus scan to begin analysis</p>
        <button onClick={onUploadClick} style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', backgroundColor: '#0891b2', color: 'white', fontSize: '16px', fontWeight: 500, cursor: 'pointer' }}>
          📤 Upload Scan
        </button>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', padding: '24px', overflow: 'auto', backgroundColor: '#f9fafb' }}>
      {viewMode === 'textual' && <TextualAnalysis scan={scan} patient={patient} />}
      {viewMode === 'visual' && <VisualAnalysis scan={scan} patient={patient} />}
      {viewMode === 'comparison' && <ComparisonView currentScan={scan} allScans={allScans} />}
      {viewMode === 'visualization' && <VisualizationView scan={scan} />}
    </div>
  );
}
