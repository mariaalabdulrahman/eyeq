import { ScanAnalysis } from "@/types/scan";
import { DiseaseRiskBar } from "@/components/DiseaseRiskBar";
import { FileText, Calendar, Stethoscope, AlertTriangle, CheckCircle, Activity } from "lucide-react";

interface DoctorReportProps {
  scan: ScanAnalysis;
}

export function DoctorReport({ scan }: DoctorReportProps) {
  const highRiskDiseases = scan.diseases.filter(d => d.severity === 'high');
  const mediumRiskDiseases = scan.diseases.filter(d => d.severity === 'medium');
  const lowRiskDiseases = scan.diseases.filter(d => d.severity === 'low');

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Clinical Report</h1>
              <p className="text-sm text-muted-foreground">For Medical Professional Use Only</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-secondary/50 rounded-lg p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Scan ID</p>
              <p className="text-sm font-mono font-medium text-foreground mt-1">{scan.id.slice(0, 8)}</p>
            </div>
            <div className="bg-secondary/50 rounded-lg p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Scan Type</p>
              <p className="text-sm font-medium text-foreground mt-1 capitalize">{scan.type} Scan</p>
            </div>
            <div className="bg-secondary/50 rounded-lg p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Date</p>
              <p className="text-sm font-medium text-foreground mt-1">
                {scan.uploadedAt.toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Clinical Summary */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Clinical Summary</h2>
          </div>
          <p className="text-foreground leading-relaxed">{scan.summary}</p>
        </div>

        {/* Risk Stratification */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Risk Stratification</h2>
          </div>

          {highRiskDiseases.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                <h3 className="font-medium text-destructive">High Priority Findings</h3>
              </div>
              <div className="space-y-3">
                {highRiskDiseases.map((disease) => (
                  <div key={disease.name} className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-foreground">{disease.name}</span>
                      <span className="text-sm font-mono text-destructive">{disease.probability}%</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{disease.description}</p>
                    <DiseaseRiskBar disease={disease} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {mediumRiskDiseases.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-warning" />
                <h3 className="font-medium text-warning">Moderate Findings</h3>
              </div>
              <div className="space-y-3">
                {mediumRiskDiseases.map((disease) => (
                  <div key={disease.name} className="bg-warning/5 border border-warning/20 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-foreground">{disease.name}</span>
                      <span className="text-sm font-mono text-warning">{disease.probability}%</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{disease.description}</p>
                    <DiseaseRiskBar disease={disease} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {lowRiskDiseases.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-4 h-4 text-success" />
                <h3 className="font-medium text-success">Low Risk Findings</h3>
              </div>
              <div className="space-y-3">
                {lowRiskDiseases.map((disease) => (
                  <div key={disease.name} className="bg-success/5 border border-success/20 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-foreground">{disease.name}</span>
                      <span className="text-sm font-mono text-success">{disease.probability}%</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{disease.description}</p>
                    <DiseaseRiskBar disease={disease} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Recommendations */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <h2 className="text-lg font-semibold text-foreground mb-4">Clinical Recommendations</h2>
          <ul className="space-y-2 text-foreground">
            {highRiskDiseases.length > 0 && (
              <li className="flex items-start gap-2">
                <span className="text-destructive mt-1">•</span>
                <span>Immediate specialist consultation recommended for high-priority findings</span>
              </li>
            )}
            {mediumRiskDiseases.length > 0 && (
              <li className="flex items-start gap-2">
                <span className="text-warning mt-1">•</span>
                <span>Follow-up examination in 4-6 weeks for moderate findings</span>
              </li>
            )}
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Correlate with patient history and clinical presentation</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Consider additional diagnostic imaging if clinically indicated</span>
            </li>
          </ul>
        </div>

        {/* Footer */}
        <div className="text-center py-4 text-xs text-muted-foreground">
          <p>Generated by EyeQ AI Analysis System</p>
          <p>This report is intended for medical professional use only and should be interpreted in clinical context.</p>
        </div>
      </div>
    </div>
  );
}
