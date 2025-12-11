import { useState } from "react";
import { ScanAnalysis } from "@/types/scan";
import { cn } from "@/lib/utils";
import { Thermometer, Grid3X3, Circle, Contrast } from "lucide-react";

interface VisualizationViewProps {
  scan: ScanAnalysis;
}

type FilterType = 'original' | 'thermal' | 'segmentation' | 'contrast';

const filters: { type: FilterType; icon: React.ElementType; label: string }[] = [
  { type: 'original', icon: Circle, label: 'Original' },
  { type: 'thermal', icon: Thermometer, label: 'Thermal' },
  { type: 'segmentation', icon: Grid3X3, label: 'Segmentation' },
  { type: 'contrast', icon: Contrast, label: 'High Contrast' },
];

export function VisualizationView({ scan }: VisualizationViewProps) {
  const [activeFilter, setActiveFilter] = useState<FilterType>('original');

  const getFilterStyle = (): React.CSSProperties => {
    switch (activeFilter) {
      case 'thermal':
        return {
          filter: 'hue-rotate(180deg) saturate(200%) brightness(0.9)',
        };
      case 'segmentation':
        return {
          filter: 'contrast(200%) brightness(1.2) saturate(0)',
        };
      case 'contrast':
        return {
          filter: 'contrast(180%) brightness(1.1)',
        };
      default:
        return {};
    }
  };

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 bg-card border border-border rounded-xl p-4">
        {filters.map(({ type, icon: Icon, label }) => (
          <button
            key={type}
            onClick={() => setActiveFilter(type)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
              activeFilter === type
                ? "bg-primary text-primary-foreground glow-primary"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Image Display */}
      <div className="flex-1 bg-card border border-border rounded-xl p-4 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">{scan.name}</h3>
          <span className="text-sm text-muted-foreground capitalize">
            {activeFilter} View
          </span>
        </div>
        
        <div className="flex-1 flex items-center justify-center bg-secondary/30 rounded-lg overflow-hidden relative">
          <img
            src={scan.imageUrl}
            alt={scan.name}
            className="max-w-full max-h-full object-contain transition-all duration-300"
            style={getFilterStyle()}
          />
          
          {/* Overlay for segmentation */}
          {activeFilter === 'segmentation' && (
            <div className="absolute inset-0 pointer-events-none">
              <svg className="w-full h-full opacity-30">
                <defs>
                  <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="hsl(187 85% 53%)" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>
          )}

          {/* Thermal color bar */}
          {activeFilter === 'thermal' && (
            <div className="absolute right-4 top-4 bottom-4 w-6 rounded-lg overflow-hidden">
              <div className="w-full h-full" style={{
                background: 'linear-gradient(to bottom, #ff0000, #ff7700, #ffff00, #00ff00, #0077ff, #0000ff)',
              }} />
              <div className="absolute top-0 left-full ml-2 text-xs text-foreground">High</div>
              <div className="absolute bottom-0 left-full ml-2 text-xs text-foreground">Low</div>
            </div>
          )}
        </div>

        {/* Info Panel */}
        <div className="mt-4 p-4 bg-secondary/50 rounded-lg">
          <p className="text-sm text-muted-foreground">
            {activeFilter === 'original' && "Original scan without any processing. Shows the raw image as captured."}
            {activeFilter === 'thermal' && "Thermal visualization highlights temperature variations and blood flow patterns. Warmer areas appear in red/yellow, cooler areas in blue."}
            {activeFilter === 'segmentation' && "Segmentation overlay helps identify distinct regions and structures within the scan. Grid assists in precise measurements."}
            {activeFilter === 'contrast' && "High contrast mode enhances visibility of subtle features and anomalies that may be less visible in the original scan."}
          </p>
        </div>
      </div>
    </div>
  );
}
