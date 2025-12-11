import { FileText, BarChart3, GitCompare, Layers, Stethoscope, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ViewMode } from "@/types/scan";

interface ViewModeButtonsProps {
  activeMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

const modes: { mode: ViewMode; icon: React.ElementType; label: string }[] = [
  { mode: 'textual', icon: FileText, label: 'Textual' },
  { mode: 'visual', icon: BarChart3, label: 'Visual' },
  { mode: 'comparison', icon: GitCompare, label: 'Compare' },
  { mode: 'visualization', icon: Layers, label: 'Visualize' },
  { mode: 'doctor-report', icon: Stethoscope, label: 'Doctor Report' },
  { mode: 'patient-report', icon: User, label: 'Patient Report' },
];

export function ViewModeButtons({ activeMode, onModeChange }: ViewModeButtonsProps) {
  return (
    <div className="flex flex-col gap-2 p-4 border-t border-sidebar-border">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
        View Mode
      </p>
      {modes.map(({ mode, icon: Icon, label }) => (
        <Button
          key={mode}
          variant={activeMode === mode ? "sidebar-active" : "sidebar"}
          size="sm"
          onClick={() => onModeChange(mode)}
          className="justify-start gap-3"
        >
          <Icon className="w-4 h-4" />
          {label}
        </Button>
      ))}
    </div>
  );
}
