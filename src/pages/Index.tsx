import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ImageTabs } from "@/components/ImageTabs";
import { ChatSidebar } from "@/components/ChatSidebar";
import { AnalysisPanel } from "@/components/AnalysisPanel";
import { UploadModal } from "@/components/UploadModal";
import { useScanContext } from "@/contexts/ScanContext";
import { ViewMode } from "@/types/scan";
import { FolderOpen, FileText, BarChart3, GitCompare, Microscope, ChevronDown, User, UserPlus } from "lucide-react";
import Logo from "@/components/Logo";
import { NewPatientModal } from "@/components/NewPatientModal";

const Index = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<ViewMode>('textual');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [chatHeight, setChatHeight] = useState(400);
  const [patientDropdownOpen, setPatientDropdownOpen] = useState(false);
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);
  
  const {
    patients,
    activeScan,
    activeTabId,
    chatHistory,
    currentPatientId,
    setActiveTabId,
    setCurrentPatientId,
    addScanToPatient,
    removeScan,
    addChatMessage,
    addPatient,
  } = useScanContext();

  // Sync currentPatientId and viewMode with URL params
  useEffect(() => {
    const patientIdFromUrl = searchParams.get('patientId');
    const viewFromUrl = searchParams.get('view');
    
    if (patientIdFromUrl && patientIdFromUrl !== currentPatientId) {
      setCurrentPatientId(patientIdFromUrl);
    } else if (!patientIdFromUrl && patients.length > 0 && !currentPatientId) {
      // Default to first patient if none selected
      setCurrentPatientId(patients[0].id);
      setSearchParams({ patientId: patients[0].id });
    }
    
    // Set view mode from URL
    if (viewFromUrl && ['textual', 'visual', 'comparison', 'visualization'].includes(viewFromUrl)) {
      setViewMode(viewFromUrl as ViewMode);
    }
  }, [searchParams, patients, currentPatientId, setCurrentPatientId, setSearchParams]);

  // Get current patient
  const currentPatient = useMemo(() => 
    patients.find(p => p.id === currentPatientId) || patients[0],
    [patients, currentPatientId]
  );

  // Get scans for current patient only
  const patientScans = useMemo(() => 
    currentPatient?.scans || [],
    [currentPatient]
  );

  // Update active tab when patient changes
  useEffect(() => {
    if (patientScans.length > 0 && !patientScans.find(s => s.id === activeTabId)) {
      setActiveTabId(patientScans[0].id);
    } else if (patientScans.length === 0) {
      setActiveTabId(null);
    }
  }, [patientScans, activeTabId, setActiveTabId]);

  const activeScanFromPatient = useMemo(() => 
    patientScans.find(s => s.id === activeTabId) || null,
    [patientScans, activeTabId]
  );

  const handlePatientChange = (patientId: string) => {
    setCurrentPatientId(patientId);
    setSearchParams({ patientId });
    setPatientDropdownOpen(false);
  };

  const handleUpload = (fundusFile: File, octFile?: File, eyeSide?: 'left' | 'right', visitNumber?: number, visitDate?: Date) => {
    if (currentPatientId) {
      addScanToPatient(currentPatientId, fundusFile, octFile, eyeSide, visitNumber, visitDate);
    }
  };

  const handleSendMessage = (message: string, selectedScanIds: string[]) => {
    addChatMessage(message, selectedScanIds);
  };

  const handleRemoveScan = (scanId: string) => {
    if (currentPatientId) {
      removeScan(scanId, currentPatientId);
    }
  };

  const viewModes = [
    { mode: 'textual' as ViewMode, icon: FileText, label: 'Textual' },
    { mode: 'visual' as ViewMode, icon: BarChart3, label: 'Statistics' },
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            onClick={() => navigate('/')}
            style={{ cursor: 'pointer' }}
          >
            <Logo size={40} />
          </div>
          
          {/* Patient Selector */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setPatientDropdownOpen(!patientDropdownOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                backgroundColor: '#f9fafb',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '14px',
                color: '#374151',
              }}
            >
              <User size={16} style={{ color: '#0891b2' }} />
              {currentPatient?.name || 'Select Patient'}
              <ChevronDown size={16} style={{ color: '#6b7280' }} />
            </button>
            
            {patientDropdownOpen && (
              <>
                <div 
                  onClick={() => setPatientDropdownOpen(false)}
                  style={{ position: 'fixed', inset: 0, zIndex: 40 }}
                />
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  marginTop: '4px',
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                  minWidth: '220px',
                  zIndex: 50,
                  maxHeight: '300px',
                  overflowY: 'auto',
                }}>
                  {/* Add New Patient Option */}
                  <button
                    onClick={() => {
                      setPatientDropdownOpen(false);
                      setShowNewPatientModal(true);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 14px',
                      border: 'none',
                      backgroundColor: '#f0fdf4',
                      cursor: 'pointer',
                      textAlign: 'left',
                      borderBottom: '2px solid #e5e7eb',
                      color: '#22c55e',
                      fontWeight: 500,
                    }}
                  >
                    <UserPlus size={16} />
                    <span style={{ fontSize: '14px' }}>Add New Patient</span>
                  </button>
                  
                  {patients.map(patient => (
                    <button
                      key={patient.id}
                      onClick={() => handlePatientChange(patient.id)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px 14px',
                        border: 'none',
                        backgroundColor: patient.id === currentPatientId ? '#ecfeff' : 'transparent',
                        cursor: 'pointer',
                        textAlign: 'left',
                        borderBottom: '1px solid #f3f4f6',
                      }}
                    >
                      <User size={16} style={{ color: patient.id === currentPatientId ? '#0891b2' : '#9ca3af' }} />
                      <div>
                        <p style={{ 
                          fontSize: '14px', 
                          fontWeight: patient.id === currentPatientId ? 600 : 400,
                          color: patient.id === currentPatientId ? '#0891b2' : '#374151',
                          margin: 0,
                        }}>
                          {patient.name}
                        </p>
                        <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>
                          {patient.scans.length} scan{patient.scans.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Fixed Navigation Tabs */}
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
          <button
            onClick={() => {}}
            style={{
              padding: '8px 0',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '14px',
              color: '#0891b2',
              borderBottom: '2px solid #0891b2',
            }}
          >
            Image Analysis
          </button>
          <button
            onClick={() => navigate('/records')}
            style={{
              padding: '8px 0',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '14px',
              color: '#6b7280',
              borderBottom: '2px solid transparent',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#374151'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
          >
            Patient Records
          </button>
          <button
            onClick={() => navigate('/llm')}
            style={{
              padding: '8px 0',
              border: 'none',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '14px',
              color: '#6b7280',
              borderBottom: '2px solid transparent',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#374151'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#6b7280'}
          >
            LLM
          </button>
          
          <div style={{ width: '1px', height: '24px', backgroundColor: '#e5e7eb' }} />
          
          {/* View Mode Buttons */}
          {viewModes.map(({ mode, icon: Icon, label }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: viewMode === mode ? '2px solid #0891b2' : '1px solid #e5e7eb',
                backgroundColor: viewMode === mode ? '#ecfeff' : 'white',
                color: viewMode === mode ? '#0891b2' : '#374151',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
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
              scans={patientScans}
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
              scans={patientScans}
              activeTab={activeTabId}
              onTabChange={setActiveTabId}
              onAddNew={() => setUploadModalOpen(true)}
              onRemoveTab={handleRemoveScan}
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
            scan={activeScanFromPatient}
            viewMode={viewMode}
            allScans={patientScans}
            onUploadClick={() => setUploadModalOpen(true)}
            patient={currentPatient}
          />
        </main>
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUpload={handleUpload}
        currentPatientScansCount={patientScans.length}
      />

      {/* New Patient Modal */}
      <NewPatientModal
        isOpen={showNewPatientModal}
        onClose={() => setShowNewPatientModal(false)}
        onSubmit={(data) => {
          // Calculate DOB from age
          const today = new Date();
          const birthYear = today.getFullYear() - data.age;
          const dob = `${birthYear}-01-01`;
          const newPatientId = addPatient(data.name, dob);
          if (newPatientId) {
            setCurrentPatientId(newPatientId);
            setSearchParams({ patientId: newPatientId });
          }
          setShowNewPatientModal(false);
        }}
      />
    </div>
  );
};

export default Index;