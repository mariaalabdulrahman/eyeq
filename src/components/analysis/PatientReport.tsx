import { ScanAnalysis } from "@/types/scan";
import { Heart, Calendar, Eye, CheckCircle, AlertCircle, Info } from "lucide-react";

interface PatientReportProps {
  scan: ScanAnalysis;
}

export function PatientReport({ scan }: PatientReportProps) {
  const hasHighRisk = scan.diseases.some(d => d.severity === 'high');
  const hasMediumRisk = scan.diseases.some(d => d.severity === 'medium');
  
  const getOverallStatus = () => {
    if (hasHighRisk) return { label: 'Needs Attention', color: 'text-destructive', bg: 'bg-destructive/10' };
    if (hasMediumRisk) return { label: 'Monitor Closely', color: 'text-warning', bg: 'bg-warning/10' };
    return { label: 'Looking Good', color: 'text-success', bg: 'bg-success/10' };
  };

  const status = getOverallStatus();

  const getSeverityInfo = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high':
        return { 
          label: 'Important to Address', 
          color: 'text-destructive', 
          bg: 'bg-destructive/10',
          border: 'border-destructive/20'
        };
      case 'medium':
        return { 
          label: 'Worth Monitoring', 
          color: 'text-warning', 
          bg: 'bg-warning/10',
          border: 'border-warning/20'
        };
      default:
        return { 
          label: 'Low Concern', 
          color: 'text-success', 
          bg: 'bg-success/10',
          border: 'border-success/20'
        };
    }
  };

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Friendly Header */}
        <div className="bg-card rounded-xl p-6 border border-border text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Eye className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Your Eye Health Summary</h1>
          <p className="text-muted-foreground">
            Here's what we found from your {scan.type === 'eye' ? 'eye scan' : 'ultrasound'}
          </p>
          
          <div className={`inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full ${status.bg}`}>
            <Heart className={`w-5 h-5 ${status.color}`} />
            <span className={`font-medium ${status.color}`}>{status.label}</span>
          </div>
        </div>

        {/* Simple Summary */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">What We Found</h2>
          </div>
          <p className="text-foreground leading-relaxed text-lg">
            {scan.summary}
          </p>
        </div>

        {/* Results in Simple Terms */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <h2 className="text-lg font-semibold text-foreground mb-4">Your Results Explained</h2>
          
          <div className="space-y-4">
            {scan.diseases.map((disease) => {
              const info = getSeverityInfo(disease.severity);
              return (
                <div key={disease.name} className={`rounded-lg p-4 border ${info.bg} ${info.border}`}>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-foreground">{disease.name}</h3>
                    <span className={`text-sm font-medium px-2 py-1 rounded ${info.bg} ${info.color}`}>
                      {info.label}
                    </span>
                  </div>
                  <p className="text-muted-foreground">{disease.description}</p>
                  
                  {/* Simple visual indicator */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Likelihood</span>
                      <span className={`font-medium ${info.color}`}>
                        {disease.probability < 30 ? 'Low' : disease.probability < 60 ? 'Moderate' : 'Higher'}
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          disease.severity === 'high' ? 'bg-destructive' :
                          disease.severity === 'medium' ? 'bg-warning' : 'bg-success'
                        }`}
                        style={{ width: `${disease.probability}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* What To Do Next */}
        <div className="bg-card rounded-xl p-6 border border-border">
          <h2 className="text-lg font-semibold text-foreground mb-4">What This Means For You</h2>
          
          <div className="space-y-4">
            {hasHighRisk && (
              <div className="flex items-start gap-3 p-4 bg-destructive/5 rounded-lg border border-destructive/20">
                <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
                <div>
                  <h3 className="font-medium text-foreground">Schedule a Follow-Up</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    We recommend talking to your eye doctor soon about some of the findings. 
                    Don't worry - this is just to make sure you get the best care possible.
                  </p>
                </div>
              </div>
            )}
            
            {hasMediumRisk && !hasHighRisk && (
              <div className="flex items-start gap-3 p-4 bg-warning/5 rounded-lg border border-warning/20">
                <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
                <div>
                  <h3 className="font-medium text-foreground">Keep Monitoring</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Some things are worth keeping an eye on. Your doctor may want to check 
                    again in a few months to make sure everything stays healthy.
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex items-start gap-3 p-4 bg-success/5 rounded-lg border border-success/20">
              <CheckCircle className="w-5 h-5 text-success mt-0.5" />
              <div>
                <h3 className="font-medium text-foreground">Keep Up the Good Work</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Continue with regular eye exams and maintain a healthy lifestyle. 
                  Eating well and protecting your eyes from bright light helps keep them healthy!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Scan Details */}
        <div className="bg-secondary/30 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Scan taken on {scan.uploadedAt.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center py-4 text-xs text-muted-foreground">
          <p>This summary is meant to help you understand your results.</p>
          <p>Always discuss your health concerns with your doctor.</p>
        </div>
      </div>
    </div>
  );
}
