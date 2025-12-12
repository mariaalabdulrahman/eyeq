import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ImageTabs } from "@/components/ImageTabs";
import { ChatSidebar } from "@/components/ChatSidebar";
import { AnalysisPanel } from "@/components/AnalysisPanel";
import { UploadModal } from "@/components/UploadModal";
import { useScanContext } from "@/contexts/ScanContext";
import { ViewMode } from "@/types/scan";
import { FolderOpen, FileText, BarChart3, GitCompare, Microscope } from "lucide-react";
import Logo from "@/components/Logo";

const Index = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>('textual');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [chatHeight, setChatHeight] = useState(400);
  
  const {
    scans,
    patients,
    activeScan,
    activeTabId,
    chatHistory,
    setActiveTabId,
    addScan,
    addPatient,
    removeScan,
    addChatMessage,
  } = useScanContext();

  const handleUpload = (fundusFile: File, octFile?: File, patientId?: string, newPatientName?: string, eyeSide?: 'left' | 'right') => {
    let assignPatientId = patientId;
    
    if (newPatientName) {
      assignPatientId = addPatient(newPatientName, '');
    }
    
    addScan(fundusFile, octFile, assignPatientId, eyeSide);
  };

  const handleSendMessage = (message: string, selectedScanIds: string[]) => {
    addChatMessage(message, selectedScanIds);
  };

  const viewModes = [
    { mode: 'textual' as ViewMode, icon: FileText, label: 'Textual' },
    { mode: 'visual' as ViewMode, icon: BarChart3, label: 'Visual' },
    { mode: 'comparison' as ViewMode, icon: GitCompare, label: 'Compare' },
    { mode: 'visualization' as ViewMode, icon: Microscope, label: 'Visualize' },
  ];

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
          style={{ cursor: 'pointer' }}
        >
          <Logo size={40} />
        </div>
        
        {/* View Mode Buttons + Patient Records */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {viewModes.map(({ mode, icon: Icon, label }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: viewMode === mode ? '2px solid #0891b2' : '1px solid #e5e7eb',
                backgroundColor: viewMode === mode ? '#ecfeff' : 'white',
                color: viewMode === mode ? '#0891b2' : '#374151',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
          
          <div style={{ width: '1px', height: '24px', backgroundColor: '#e5e7eb', margin: '0 8px' }} />
          
          <button
            onClick={() => navigate('/records')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              backgroundColor: 'white',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <FolderOpen size={16} /> Patient Records
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Resizable Sidebar */}
        <aside style={{ 
          width: `${sidebarWidth}px`, 
          minWidth: '250px',
          maxWidth: '50vw',
          backgroundColor: 'white',
          borderRight: '1px solid #e5e7eb',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}>
          {/* Chat Section - Resizable */}
          <div style={{ 
            height: `${chatHeight}px`, 
            minHeight: '150px',
            overflow: 'hidden', 
            display: 'flex', 
            flexDirection: 'column',
            position: 'relative',
          }}>
            <ChatSidebar
              scans={scans}
              chatHistory={chatHistory}
              onSendMessage={handleSendMessage}
            />
            
            {/* Vertical Resize Handle for Chat */}
            <div 
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                height: '6px',
                cursor: 'row-resize',
                backgroundColor: 'transparent',
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                const startY = e.clientY;
                const startHeight = chatHeight;
                
                const onMouseMove = (e: MouseEvent) => {
                  const deltaY = e.clientY - startY;
                  setChatHeight(Math.max(150, startHeight + deltaY));
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
          </div>
          
          {/* Image Library Below Chat - Takes remaining space */}
          <div style={{ 
            flex: 1, 
            borderTop: '1px solid #e5e7eb', 
            overflowY: 'auto',
            minHeight: '100px',
          }}>
            <ImageTabs
              scans={scans}
              activeTab={activeTabId}
              onTabChange={setActiveTabId}
              onAddNew={() => setUploadModalOpen(true)}
              onRemoveTab={removeScan}
              compact
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
                const maxWidth = window.innerWidth * 0.5;
                setSidebarWidth(Math.min(maxWidth, Math.max(250, startWidth + deltaX)));
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
        patients={patients}
      />
    </div>
  );
};

export default Index;