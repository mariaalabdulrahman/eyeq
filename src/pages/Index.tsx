import { useState } from "react";
import { ImageTabs } from "@/components/ImageTabs";
import { ChatSidebar } from "@/components/ChatSidebar";
import { ViewModeButtons } from "@/components/ViewModeButtons";
import { AnalysisPanel } from "@/components/AnalysisPanel";
import { UploadModal } from "@/components/UploadModal";
import { useScanAnalysis } from "@/hooks/useScanAnalysis";
import { ViewMode } from "@/types/scan";
import { Activity } from "lucide-react";

const Index = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('textual');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  
  const {
    scans,
    activeScan,
    activeTabId,
    setActiveTabId,
    addScan,
    removeScan,
    addChatMessage,
  } = useScanAnalysis();

  const handleUpload = (file: File, type: 'eye' | 'ultrasound') => {
    addScan(file, type);
  };

  const handleSendMessage = (message: string) => {
    if (activeTabId) {
      addChatMessage(activeTabId, message);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Activity className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground">MedScan AI</h1>
          <p className="text-sm text-muted-foreground">Medical Image Analysis Platform</p>
        </div>
      </header>

      {/* Tabs */}
      <ImageTabs
        scans={scans}
        activeTab={activeTabId}
        onTabChange={setActiveTabId}
        onAddNew={() => setUploadModalOpen(true)}
        onRemoveTab={removeScan}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 bg-sidebar border-r border-sidebar-border flex flex-col shrink-0">
          <div className="flex-1 overflow-hidden">
            <ChatSidebar
              scan={activeScan}
              onSendMessage={handleSendMessage}
            />
          </div>
          <ViewModeButtons
            activeMode={viewMode}
            onModeChange={setViewMode}
          />
        </aside>

        {/* Analysis Panel */}
        <main className="flex-1 overflow-hidden">
          <AnalysisPanel
            scan={activeScan}
            viewMode={viewMode}
            allScans={scans}
            onUploadClick={() => setUploadModalOpen(true)}
          />
        </main>
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUpload={handleUpload}
      />
    </div>
  );
};

export default Index;
