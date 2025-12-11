import { ScanAnalysis } from "@/types/scan";
import { DiseaseRiskBar } from "@/components/DiseaseRiskBar";
import { AlertTriangle, CheckCircle } from "lucide-react";

interface TextualAnalysisProps {
  scan: ScanAnalysis;
}

export function TextualAnalysis({ scan }: TextualAnalysisProps) {
  const highRiskDiseases = scan.diseases.filter(d => d.probability >= 70);
  const hasHighRisk = highRiskDiseases.length > 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      {/* Image Display */}
      <div className="bg-card border border-border rounded-xl p-4 flex flex-col">
        <h3 className="font-semibold text-foreground mb-4">Scan Image</h3>
        <div className="flex-1 flex items-center justify-center bg-secondary/50 rounded-lg overflow-hidden">
          <img
            src={scan.imageUrl}
            alt={scan.name}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      </div>

      {/* Analysis Results */}
      <div className="flex flex-col gap-4 overflow-y-auto scrollbar-thin pr-2">
        {/* Summary Card */}
        <div className={cn(
          "bg-card border rounded-xl p-4",
          hasHighRisk ? "border-destructive/50" : "border-success/50"
        )}>
          <div className="flex items-center gap-3 mb-3">
            {hasHighRisk ? (
              <AlertTriangle className="w-6 h-6 text-destructive" />
            ) : (
              <CheckCircle className="w-6 h-6 text-success" />
            )}
            <h3 className="font-semibold text-foreground">
              {hasHighRisk ? "Attention Required" : "Analysis Complete"}
            </h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {scan.summary}
          </p>
        </div>

        {/* Disease List */}
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground">Detected Conditions</h3>
          {scan.diseases.length > 0 ? (
            scan.diseases.map((disease, index) => (
              <DiseaseRiskBar key={index} disease={disease} />
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              No significant conditions detected.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";
