import { ScanAnalysis, ViewMode } from "@/types/scan";
import { TextualAnalysis } from "./analysis/TextualAnalysis";
import { VisualAnalysis } from "./analysis/VisualAnalysis";
import { ComparisonView } from "./analysis/ComparisonView";
import { VisualizationView } from "./analysis/VisualizationView";
import { DoctorReport } from "./analysis/DoctorReport";
import { PatientReport } from "./analysis/PatientReport";
import { Upload } from "lucide-react";

interface AnalysisPanelProps {
  scan: ScanAnalysis | null;
  viewMode: ViewMode;
  allScans: ScanAnalysis[];
  onUploadClick: () => void;
}

export function AnalysisPanel({ scan, viewMode, allScans, onUploadClick }: AnalysisPanelProps) {
  if (!scan) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center px-8">
        <div 
          onClick={onUploadClick}
          className="w-32 h-32 rounded-2xl bg-card border-2 border-dashed border-border flex items-center justify-center mb-6 cursor-pointer hover:border-primary hover:bg-secondary/50 transition-all duration-200 group"
        >
          <Upload className="w-12 h-12 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
        <h2 className="text-2xl font-semibold text-foreground mb-3">
          No Scan Selected
        </h2>
        <p className="text-muted-foreground max-w-md">
          Upload an eye scan or ultrasound image to begin AI-powered analysis. 
          Click the "New Scan" button or drop an image to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full p-6 overflow-hidden">
      {viewMode === 'textual' && <TextualAnalysis scan={scan} />}
      {viewMode === 'visual' && <VisualAnalysis scan={scan} />}
      {viewMode === 'comparison' && <ComparisonView currentScan={scan} allScans={allScans} />}
      {viewMode === 'visualization' && <VisualizationView scan={scan} />}
      {viewMode === 'doctor-report' && <DoctorReport scan={scan} />}
      {viewMode === 'patient-report' && <PatientReport scan={scan} />}
    </div>
  );
}
