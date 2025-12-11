import { cn } from "@/lib/utils";
import { Disease } from "@/types/scan";

interface DiseaseRiskBarProps {
  disease: Disease;
}

export function DiseaseRiskBar({ disease }: DiseaseRiskBarProps) {
  const getColorClass = () => {
    if (disease.probability >= 70) return "bg-destructive";
    if (disease.probability >= 40) return "bg-warning";
    return "bg-success";
  };

  const getGlowClass = () => {
    if (disease.probability >= 70) return "glow-destructive";
    if (disease.probability >= 40) return "glow-warning";
    return "glow-success";
  };

  const getSeverityBadge = () => {
    const base = "px-2 py-0.5 rounded-full text-xs font-medium";
    switch (disease.severity) {
      case 'high':
        return cn(base, "bg-destructive/20 text-destructive");
      case 'medium':
        return cn(base, "bg-warning/20 text-warning");
      case 'low':
        return cn(base, "bg-success/20 text-success");
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 animate-slide-in">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-foreground">{disease.name}</h4>
        <span className={getSeverityBadge()}>
          {disease.severity} risk
        </span>
      </div>
      
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1.5">
          <span className="text-muted-foreground">Probability</span>
          <span className="font-mono font-medium text-foreground">{disease.probability}%</span>
        </div>
        <div className="h-3 bg-secondary rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              getColorClass(),
              getGlowClass()
            )}
            style={{ width: `${disease.probability}%` }}
          />
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground leading-relaxed">
        {disease.description}
      </p>
    </div>
  );
}
