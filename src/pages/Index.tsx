import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ImageTabs } from "@/components/ImageTabs";
import { ChatSidebar } from "@/components/ChatSidebar";
import { ViewModeButtons } from "@/components/ViewModeButtons";
import { AnalysisPanel } from "@/components/AnalysisPanel";
import { UploadModal } from "@/components/UploadModal";
import { useScanAnalysis } from "@/hooks/useScanAnalysis";
import { ViewMode } from "@/types/scan";
import { Activity } from "lucide-react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";

const Index = () => {
  const navigate = useNavigate();
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
        <div 
          onClick={() => navigate('/')}
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Activity className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">EyeQ</h1>
            <p className="text-xs text-muted-foreground">by LucidEye</p>
          </div>
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
        {/* Resizable Sidebar */}
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          <ResizablePanel defaultSize={25} minSize={15} maxSize={40}>
            <aside className="h-full bg-sidebar border-r border-sidebar-border flex flex-col">
              <ResizablePanelGroup direction="vertical">
                <ResizablePanel defaultSize={70} minSize={30}>
                  <div className="h-full overflow-hidden">
                    <ChatSidebar
                      scan={activeScan}
                      onSendMessage={handleSendMessage}
                    />
                  </div>
                </ResizablePanel>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={30} minSize={20}>
                  <div className="h-full overflow-y-auto">
                    <ViewModeButtons
                      activeMode={viewMode}
                      onModeChange={setViewMode}
                    />
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </aside>
          </ResizablePanel>
          
          <ResizableHandle withHandle />
          
          {/* Analysis Panel */}
          <ResizablePanel defaultSize={75}>
            <main className="h-full overflow-hidden">
              <AnalysisPanel
                scan={activeScan}
                viewMode={viewMode}
                allScans={scans}
                onUploadClick={() => setUploadModalOpen(true)}
              />
            </main>
          </ResizablePanel>
        </ResizablePanelGroup>
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
