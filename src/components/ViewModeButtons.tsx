import { ViewMode } from "@/types/scan";
import { FileText, BarChart3, GitCompare, Microscope, LucideIcon } from "lucide-react";

interface ViewModeButtonsProps {
  activeMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

const modes: { mode: ViewMode; icon: LucideIcon; label: string }[] = [
  { mode: 'textual', icon: FileText, label: 'Textual' },
  { mode: 'visual', icon: BarChart3, label: 'Visual' },
  { mode: 'comparison', icon: GitCompare, label: 'Compare' },
  { mode: 'visualization', icon: Microscope, label: 'Visualize' },
];

export function ViewModeButtons({ activeMode, onModeChange }: ViewModeButtonsProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '16px', borderTop: '1px solid #e5e7eb' }}>
      <p style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
        View Mode
      </p>
      {modes.map(({ mode, icon: Icon, label }) => (
        <button
          key={mode}
          onClick={() => onModeChange(mode)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 12px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeMode === mode ? '#0891b2' : 'transparent',
            color: activeMode === mode ? 'white' : '#374151',
            cursor: 'pointer',
            textAlign: 'left',
            fontWeight: 500,
            fontSize: '14px',
            transition: 'all 0.2s',
          }}
        >
          <Icon size={18} />
          {label}
        </button>
      ))}
    </div>
  );
}