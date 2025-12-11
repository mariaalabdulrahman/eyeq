import { useState } from "react";
import { ScanAnalysis } from "@/types/scan";
import { cn } from "@/lib/utils";
import { ArrowLeftRight } from "lucide-react";

interface ComparisonViewProps {
  currentScan: ScanAnalysis;
  allScans: ScanAnalysis[];
}

export function ComparisonView({ currentScan, allScans }: ComparisonViewProps) {
  const [compareScanId, setCompareScanId] = useState<string | null>(
    allScans.find(s => s.id !== currentScan.id)?.id || null
  );

  const compareScan = allScans.find(s => s.id === compareScanId);
  const otherScans = allScans.filter(s => s.id !== currentScan.id);

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Scan Selector */}
      {otherScans.length > 0 && (
        <div className="flex items-center gap-4 bg-card border border-border rounded-xl p-4">
          <span className="text-sm text-muted-foreground">Compare with:</span>
          <select
            value={compareScanId || ''}
            onChange={(e) => setCompareScanId(e.target.value || null)}
            className="bg-secondary text-foreground rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {otherScans.map(scan => (
              <option key={scan.id} value={scan.id}>{scan.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Comparison Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
        {/* Current Scan */}
        <div className="bg-card border border-primary/50 rounded-xl p-4 flex flex-col overflow-hidden">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            {currentScan.name}
          </h3>
          <div className="flex-1 flex items-center justify-center bg-secondary/50 rounded-lg mb-4 min-h-[200px]">
            <img
              src={currentScan.imageUrl}
              alt={currentScan.name}
              className="max-w-full max-h-full object-contain"
            />
          </div>
          <div className="space-y-2 overflow-y-auto scrollbar-thin">
            {currentScan.diseases.map((disease, i) => (
              <div key={i} className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">{disease.name}</span>
                <span className={cn(
                  "font-mono font-medium",
                  disease.probability >= 70 ? "text-destructive" :
                  disease.probability >= 40 ? "text-warning" : "text-success"
                )}>
                  {disease.probability}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Compare Scan */}
        {compareScan ? (
          <div className="bg-card border border-border rounded-xl p-4 flex flex-col overflow-hidden">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-muted-foreground" />
              {compareScan.name}
            </h3>
            <div className="flex-1 flex items-center justify-center bg-secondary/50 rounded-lg mb-4 min-h-[200px]">
              <img
                src={compareScan.imageUrl}
                alt={compareScan.name}
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <div className="space-y-2 overflow-y-auto scrollbar-thin">
              {compareScan.diseases.map((disease, i) => {
                const currentDisease = currentScan.diseases.find(d => d.name === disease.name);
                const diff = currentDisease ? disease.probability - currentDisease.probability : 0;
                
                return (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">{disease.name}</span>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "font-mono font-medium",
                        disease.probability >= 70 ? "text-destructive" :
                        disease.probability >= 40 ? "text-warning" : "text-success"
                      )}>
                        {disease.probability}%
                      </span>
                      {diff !== 0 && (
                        <span className={cn(
                          "text-xs font-mono",
                          diff > 0 ? "text-destructive" : "text-success"
                        )}>
                          ({diff > 0 ? '+' : ''}{diff}%)
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-card border border-dashed border-border rounded-xl p-4 flex flex-col items-center justify-center text-center">
            <ArrowLeftRight className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="font-semibold text-foreground mb-2">No Comparison Available</h3>
            <p className="text-sm text-muted-foreground">
              Upload another scan to compare results
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
