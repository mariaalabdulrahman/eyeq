import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ImageTabs } from "@/components/ImageTabs";
import { ChatSidebar } from "@/components/ChatSidebar";
import { ViewModeButtons } from "@/components/ViewModeButtons";
import { AnalysisPanel } from "@/components/AnalysisPanel";
import { UploadModal } from "@/components/UploadModal";
import { useScanAnalysis } from "@/hooks/useScanAnalysis";
import { ViewMode } from "@/types/scan";
import { Eye, FolderOpen } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('textual');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [chatHeight, setChatHeight] = useState(60); // percentage
  
  const {
    scans,
    activeScan,
    activeTabId,
    chatHistory,
    setActiveTabId,
    addScan,
    removeScan,
    addChatMessage,
  } = useScanAnalysis();

  const handleUpload = (file: File, type: 'oct' | 'fundus') => {
    addScan(file, type);
  };

  const handleSendMessage = (message: string, selectedScanIds: string[]) => {
    addChatMessage(message, selectedScanIds);
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <header style={{ 
        backgroundColor: 'white', 
        borderBottom: '1px solid #e5e7eb', 
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div 
          onClick={() => navigate('/')}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
        >
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            backgroundColor: '#ecfeff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Eye size={24} style={{ color: '#0891b2' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#111' }}>EyeQ</h1>
            <p style={{ fontSize: '12px', color: '#6b7280' }}>by LucidEye</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/records')}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            backgroundColor: 'white',
            cursor: 'pointer',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <FolderOpen size={18} /> Patient Records
        </button>
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
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Resizable Sidebar */}
        <aside style={{ 
          width: `${sidebarWidth}px`, 
          minWidth: '250px',
          maxWidth: '500px',
          backgroundColor: 'white', 
          borderRight: '1px solid #e5e7eb',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}>
          {/* Chat Section */}
          <div style={{ height: `${chatHeight}%`, overflow: 'hidden', borderBottom: '1px solid #e5e7eb' }}>
            <ChatSidebar
              scans={scans}
              chatHistory={chatHistory}
              onSendMessage={handleSendMessage}
            />
          </div>
          
          {/* Resize Handle */}
          <div 
            style={{
              height: '8px',
              backgroundColor: '#f3f4f6',
              cursor: 'row-resize',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              const startY = e.clientY;
              const startHeight = chatHeight;
              const sidebar = e.currentTarget.parentElement;
              if (!sidebar) return;
              
              const onMouseMove = (e: MouseEvent) => {
                const deltaY = e.clientY - startY;
                const sidebarHeight = sidebar.clientHeight;
                const newHeight = startHeight + (deltaY / sidebarHeight) * 100;
                setChatHeight(Math.min(80, Math.max(30, newHeight)));
              };
              
              const onMouseUp = () => {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
              };
              
              document.addEventListener('mousemove', onMouseMove);
              document.addEventListener('mouseup', onMouseUp);
            }}
          >
            <div style={{ width: '40px', height: '4px', backgroundColor: '#d1d5db', borderRadius: '2px' }} />
          </div>
          
          {/* View Mode Section */}
          <div style={{ flex: 1, overflow: 'auto' }}>
            <ViewModeButtons
              activeMode={viewMode}
              onModeChange={setViewMode}
            />
          </div>
          
          {/* Horizontal Resize Handle */}
          <div 
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              width: '6px',
              cursor: 'col-resize',
              backgroundColor: 'transparent',
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              const startX = e.clientX;
              const startWidth = sidebarWidth;
              
              const onMouseMove = (e: MouseEvent) => {
                const deltaX = e.clientX - startX;
                setSidebarWidth(Math.min(500, Math.max(250, startWidth + deltaX)));
              };
              
              const onMouseUp = () => {
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
              };
              
              document.addEventListener('mousemove', onMouseMove);
              document.addEventListener('mouseup', onMouseUp);
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0891b2'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          />
        </aside>
        
        {/* Analysis Panel */}
        <main style={{ flex: 1, overflow: 'hidden' }}>
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
