import { Plus, X, Eye, Radio } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScanAnalysis } from "@/types/scan";

interface ImageTabsProps {
  scans: ScanAnalysis[];
  activeTab: string | null;
  onTabChange: (id: string) => void;
  onAddNew: () => void;
  onRemoveTab: (id: string) => void;
}

export function ImageTabs({ scans, activeTab, onTabChange, onAddNew, onRemoveTab }: ImageTabsProps) {
  return (
    <div className="flex items-center gap-1 bg-card border-b border-border px-4 py-2 overflow-x-auto scrollbar-thin">
      {scans.map((scan) => (
        <button
          key={scan.id}
          onClick={() => onTabChange(scan.id)}
          className={cn(
            "group flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
            activeTab === scan.id
              ? "bg-primary text-primary-foreground glow-primary"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          )}
        >
          {scan.type === 'eye' ? (
            <Eye className="w-4 h-4" />
          ) : (
            <Radio className="w-4 h-4" />
          )}
          <span className="max-w-[120px] truncate">{scan.name}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemoveTab(scan.id);
            }}
            className={cn(
              "ml-1 p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity",
              activeTab === scan.id
                ? "hover:bg-primary-foreground/20"
                : "hover:bg-muted"
            )}
          >
            <X className="w-3 h-3" />
          </button>
        </button>
      ))}
      
      <button
        onClick={onAddNew}
        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-transparent border border-dashed border-border text-muted-foreground hover:text-foreground hover:border-primary hover:bg-secondary/50 transition-all duration-200"
      >
        <Plus className="w-4 h-4" />
        <span>New Scan</span>
      </button>
    </div>
  );
}
