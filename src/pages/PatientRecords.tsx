import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Patient } from "@/types/scan";
import { ArrowLeft, UserPlus, Home, Stethoscope, User, BarChart3, Lock, X, Edit2, Save } from "lucide-react";
import Logo from "@/components/Logo";
import { useScanContext } from "@/contexts/ScanContext";
import { PatientChatSidebar } from "@/components/PatientChatSidebar";
import { PatientReport } from "@/components/PatientReport";
import { PatientStatistics } from "@/components/PatientStatistics";
import { MedicalTagInput } from "@/components/MedicalTagInput";

type RecordsViewMode = 'home' | 'doctor-report' | 'patient-report' | 'statistics';

const PatientRecords = () => {
  const navigate = useNavigate();
  const { patients, addPatient, updatePatient } = useScanContext();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);
  const [viewMode, setViewMode] = useState<RecordsViewMode>('home');
  const [isEditMode, setIsEditMode] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [newPatientName, setNewPatientName] = useState("");
  const [newPatientDob, setNewPatientDob] = useState("");
  const [chatHeight, setChatHeight] = useState(300);
  const [sidebarWidth, setSidebarWidth] = useState(350);
  
  // Patient editing state
  const [isEditingPatient, setIsEditingPatient] = useState(false);
  const [editPatientData, setEditPatientData] = useState({
    name: '',
    age: 0,
    gender: 'other' as 'male' | 'female' | 'other',
    relevantInfo: '',
    medicalTags: [] as string[],
  });
  
  // New patient inline creation state
  const [isCreatingNewPatient, setIsCreatingNewPatient] = useState(false);
  const [newPatientData, setNewPatientData] = useState({
    name: '',
    dateOfBirth: '',
    gender: 'other' as 'male' | 'female' | 'other',
    medicalTags: [] as string[],
  });

  // Sync editPatientData when selectedPatient changes
  useEffect(() => {
    if (selectedPatient && !isCreatingNewPatient) {
      setEditPatientData({
        name: selectedPatient.name,
        age: selectedPatient.age || 0,
        gender: selectedPatient.gender || 'other',
        relevantInfo: selectedPatient.relevantInfo || '',
        medicalTags: selectedPatient.medicalTags || [],
      });
    }
  }, [selectedPatient, isCreatingNewPatient]);

  // Update selectedPatient when patients changes
  useEffect(() => {
    if (selectedPatient) {
      const updated = patients.find(p => p.id === selectedPatient.id);
      if (updated) {
        setSelectedPatient(updated);
      }
    }
  }, [patients, selectedPatient?.id]);

  const calculateOverallRisk = (patient: Patient): { level: string; color: string } => {
    const allDiseases = patient.scans.flatMap(s => s.diseases);
    const maxProb = Math.max(...allDiseases.map(d => d.probability), 0);
    if (maxProb >= 70) return { level: 'High Risk', color: '#ef4444' };
    if (maxProb >= 40) return { level: 'Moderate Risk', color: '#f59e0b' };
    return { level: 'Low Risk', color: '#22c55e' };
  };

  const handleRequestEdit = () => {
    if (isEditMode) {
      setIsEditMode(false);
    } else {
      setShowPasswordModal(true);
    }
  };

  const handlePasswordSubmit = () => {
    if (passwordInput === "eyeq") {
      setIsEditMode(true);
      setShowPasswordModal(false);
      setPasswordInput("");
      setPasswordError("");
    } else {
      setPasswordError("Incorrect password");
    }
  };

  const handleCreatePatient = () => {
    if (newPatientName.trim() && newPatientDob) {
      addPatient(newPatientName.trim(), newPatientDob);
      setNewPatientName("");
      setNewPatientDob("");
      setShowNewPatientModal(false);
    }
  };

  // Start inline new patient creation
  const startNewPatientInline = () => {
    setIsCreatingNewPatient(true);
    setSelectedPatient(null);
    setNewPatientData({
      name: '',
      dateOfBirth: '',
      gender: 'other',
      medicalTags: [],
    });
    setViewMode('home');
  };

  // Save new patient from inline form
  const saveNewPatientInline = () => {
    if (newPatientData.name.trim() && newPatientData.dateOfBirth) {
      const newPatientId = addPatient(newPatientData.name.trim(), newPatientData.dateOfBirth);
      // Update the patient with additional data
      if (newPatientId) {
        updatePatient(newPatientId, {
          gender: newPatientData.gender,
          medicalTags: newPatientData.medicalTags,
        });
        // Select the new patient after state updates
        setTimeout(() => {
          const updated = patients.find(p => p.id === newPatientId);
          if (updated) setSelectedPatient(updated);
        }, 100);
      }
      setIsCreatingNewPatient(false);
      setNewPatientData({ name: '', dateOfBirth: '', gender: 'other', medicalTags: [] });
    }
  };

  // Cancel inline creation
  const cancelNewPatientInline = () => {
    setIsCreatingNewPatient(false);
    setNewPatientData({ name: '', dateOfBirth: '', gender: 'other', medicalTags: [] });
  };

  const viewModes = [
    { mode: 'home' as RecordsViewMode, icon: Home, label: 'Overview' },
    { mode: 'doctor-report' as RecordsViewMode, icon: Stethoscope, label: 'Doctor Report' },
    { mode: 'patient-report' as RecordsViewMode, icon: User, label: 'Patient Report' },
    { mode: 'statistics' as RecordsViewMode, icon: BarChart3, label: 'Statistics' },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <header style={{ 
        backgroundColor: 'white', 
        borderBottom: '1px solid #e5e7eb', 
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <Logo size={40} />
        </div>
        
        {/* View Mode Buttons */}
        <div style={{ display: 'flex', gap: '8px' }}>
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
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              backgroundColor: 'white',
              cursor: 'pointer',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              whiteSpace: 'nowrap',
            }}
          >
            <ArrowLeft size={16} style={{ marginRight: '6px', flexShrink: 0 }} />
            Back to Dashboard
          </button>
          <button
            onClick={startNewPatientInline}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#0891b2',
              color: 'white',
              cursor: 'pointer',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <UserPlus size={16} style={{ marginRight: '6px' }} /> New Patient
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', height: 'calc(100vh - 65px)' }}>
        {/* Left Sidebar - Chat + Patient List - Resizable */}
        <div style={{ 
          width: `${sidebarWidth}px`, 
          minWidth: '250px',
          maxWidth: '500px',
          backgroundColor: 'white', 
          borderRight: '1px solid #e5e7eb',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}>
          
          {/* Horizontal Resize Handle for Sidebar */}
          <div 
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              width: '6px',
              cursor: 'col-resize',
              backgroundColor: 'transparent',
              zIndex: 10,
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
          {/* Chat Section - Resizable */}
          <div style={{ 
            height: `${chatHeight}px`, 
            minHeight: '150px',
            borderBottom: '1px solid #e5e7eb', 
            overflow: 'hidden',
            position: 'relative',
          }}>
            <PatientChatSidebar 
              patients={patients} 
              onPatientSelect={(id) => {
                const p = patients.find(p => p.id === id);
                if (p) setSelectedPatient(p);
              }}
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

          {/* Patient List */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#111' }}>Patients ({patients.length})</h3>
            </div>
            {patients.map((patient) => {
              const risk = calculateOverallRisk(patient);
              return (
                <div
                  key={patient.id}
                  onClick={() => setSelectedPatient(patient)}
                  style={{
                    padding: '14px 16px',
                    borderBottom: '1px solid #e5e7eb',
                    cursor: 'pointer',
                    backgroundColor: selectedPatient?.id === patient.id ? '#ecfeff' : 'transparent',
                    transition: 'background-color 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ fontWeight: 600, color: '#111', fontSize: '14px' }}>{patient.name}</h4>
                      <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                        {patient.scans.length} scan(s)
                      </p>
                    </div>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 600,
                      padding: '3px 6px',
                      borderRadius: '10px',
                      backgroundColor: risk.color + '20',
                      color: risk.color,
                    }}>
                      {risk.level}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#f8fafc' }}>
          {viewMode === 'statistics' ? (
            <PatientStatistics patients={patients} />
          ) : viewMode === 'doctor-report' && !isCreatingNewPatient ? (
            <PatientReport 
              patient={selectedPatient} 
              reportType="doctor" 
              isEditMode={isEditMode}
              onRequestEdit={handleRequestEdit}
            />
          ) : viewMode === 'patient-report' && !isCreatingNewPatient ? (
            <PatientReport 
              patient={selectedPatient} 
              reportType="patient"
              isEditMode={false}
              onRequestEdit={() => {}}
            />
          ) : isCreatingNewPatient ? (
            // Inline New Patient Creation Form
            <div style={{ padding: '24px' }}>
              <div style={{ 
                backgroundColor: 'white', 
                borderRadius: '12px', 
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#111' }}>New Patient</h2>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={cancelNewPatientInline}
                      style={{
                        padding: '10px 20px',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        backgroundColor: 'white',
                        cursor: 'pointer',
                        fontWeight: 500,
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveNewPatientInline}
                      disabled={!newPatientData.name.trim() || !newPatientData.dateOfBirth}
                      style={{
                        padding: '10px 20px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: newPatientData.name.trim() && newPatientData.dateOfBirth ? '#0891b2' : '#d1d5db',
                        color: 'white',
                        cursor: newPatientData.name.trim() && newPatientData.dateOfBirth ? 'pointer' : 'not-allowed',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <Save size={16} /> Create Patient
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gap: '20px', maxWidth: '600px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Full Name *</label>
                    <input
                      type="text"
                      value={newPatientData.name}
                      onChange={(e) => setNewPatientData({ ...newPatientData, name: e.target.value })}
                      placeholder="Enter patient name"
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                        fontSize: '14px',
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Date of Birth *</label>
                      <input
                        type="date"
                        value={newPatientData.dateOfBirth}
                        onChange={(e) => setNewPatientData({ ...newPatientData, dateOfBirth: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb',
                          fontSize: '14px',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Gender</label>
                      <select
                        value={newPatientData.gender}
                        onChange={(e) => setNewPatientData({ ...newPatientData, gender: e.target.value as 'male' | 'female' | 'other' })}
                        style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb',
                          fontSize: '14px',
                          backgroundColor: 'white',
                        }}
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>Medical History</label>
                    <MedicalTagInput
                      value={newPatientData.medicalTags}
                      onChange={(tags) => setNewPatientData({ ...newPatientData, medicalTags: tags })}
                      placeholder="Type to search conditions..."
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Home/Overview Mode - Original content
            selectedPatient ? (
              <div style={{ padding: '24px' }}>
                {/* Patient Header */}
                <div style={{ 
                  backgroundColor: 'white', 
                  borderRadius: '12px', 
                  padding: '24px',
                  marginBottom: '24px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      {isEditingPatient ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <input
                            type="text"
                            value={editPatientData.name}
                            onChange={(e) => setEditPatientData({ ...editPatientData, name: e.target.value })}
                            placeholder="Patient Name"
                            style={{
                              fontSize: '24px',
                              fontWeight: 700,
                              padding: '8px 12px',
                              borderRadius: '8px',
                              border: '2px solid #0891b2',
                              outline: 'none',
                            }}
                          />
                          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            <div>
                              <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Age</label>
                              <input
                                type="number"
                                value={editPatientData.age}
                                onChange={(e) => setEditPatientData({ ...editPatientData, age: parseInt(e.target.value) || 0 })}
                                style={{
                                  padding: '8px 12px',
                                  borderRadius: '8px',
                                  border: '1px solid #e5e7eb',
                                  width: '80px',
                                }}
                              />
                            </div>
                            <div>
                              <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Gender</label>
                              <select
                                value={editPatientData.gender}
                                onChange={(e) => setEditPatientData({ ...editPatientData, gender: e.target.value as 'male' | 'female' | 'other' })}
                                style={{
                                  padding: '8px 12px',
                                  borderRadius: '8px',
                                  border: '1px solid #e5e7eb',
                                }}
                              >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Medical History</label>
                            <MedicalTagInput
                              value={editPatientData.medicalTags}
                              onChange={(tags) => setEditPatientData({ ...editPatientData, medicalTags: tags })}
                              placeholder="Type to search conditions..."
                            />
                          </div>
                        </div>
                      ) : (
                        <>
                          <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#111' }}>{selectedPatient.name}</h2>
                          <p style={{ color: '#6b7280', marginTop: '4px' }}>
                            Age: {selectedPatient.age || 'N/A'} | Gender: {selectedPatient.gender ? selectedPatient.gender.charAt(0).toUpperCase() + selectedPatient.gender.slice(1) : 'N/A'}
                          </p>
                          <p style={{ color: '#6b7280', marginTop: '2px' }}>
                            DOB: {new Date(selectedPatient.dateOfBirth).toLocaleDateString()} | 
                            Patient since: {selectedPatient.createdAt.toLocaleDateString()}
                          </p>
                          {selectedPatient.medicalTags && selectedPatient.medicalTags.length > 0 && (
                            <div style={{ marginTop: '12px' }}>
                              <strong style={{ fontSize: '14px', color: '#374151' }}>Medical History:</strong>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                                {selectedPatient.medicalTags.map((tag, idx) => (
                                  <span
                                    key={idx}
                                    style={{
                                      padding: '4px 10px',
                                      borderRadius: '16px',
                                      backgroundColor: '#ecfeff',
                                      color: '#0891b2',
                                      fontSize: '12px',
                                      fontWeight: 500,
                                    }}
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {selectedPatient.relevantInfo && !selectedPatient.medicalTags?.length && (
                            <p style={{ color: '#374151', marginTop: '8px', fontSize: '14px', padding: '8px 12px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
                              <strong>Medical History:</strong> {selectedPatient.relevantInfo}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                      <div style={{
                        padding: '8px 16px',
                        borderRadius: '20px',
                        backgroundColor: calculateOverallRisk(selectedPatient).color + '20',
                        color: calculateOverallRisk(selectedPatient).color,
                        fontWeight: 600,
                      }}>
                        {calculateOverallRisk(selectedPatient).level}
                      </div>
                      <button
                        onClick={() => {
                          if (isEditingPatient) {
                            // Save changes
                            updatePatient(selectedPatient.id, editPatientData);
                            setIsEditingPatient(false);
                          } else {
                            setIsEditingPatient(true);
                          }
                        }}
                        style={{
                          padding: '8px 14px',
                          borderRadius: '8px',
                          border: '1px solid #e5e7eb',
                          backgroundColor: isEditingPatient ? '#0891b2' : 'white',
                          color: isEditingPatient ? 'white' : '#374151',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '13px',
                          fontWeight: 500,
                        }}
                      >
                        {isEditingPatient ? <><Save size={14} /> Save</> : <><Edit2 size={14} /> Edit Info</>}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                  <button
                    onClick={() => setViewMode('doctor-report')}
                    style={{
                      padding: '20px',
                      backgroundColor: 'white',
                      borderRadius: '12px',
                      border: '1px solid #e5e7eb',
                      cursor: 'pointer',
                      textAlign: 'left',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    }}
                  >
                    <Stethoscope size={24} style={{ color: '#0891b2', marginBottom: '12px' }} />
                    <p style={{ fontWeight: 600, color: '#111' }}>Doctor Report</p>
                    <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>Clinical findings & analysis</p>
                  </button>
                  <button
                    onClick={() => setViewMode('patient-report')}
                    style={{
                      padding: '20px',
                      backgroundColor: 'white',
                      borderRadius: '12px',
                      border: '1px solid #e5e7eb',
                      cursor: 'pointer',
                      textAlign: 'left',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    }}
                  >
                    <User size={24} style={{ color: '#0891b2', marginBottom: '12px' }} />
                    <p style={{ fontWeight: 600, color: '#111' }}>Patient Summary</p>
                    <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>Easy-to-read health overview</p>
                  </button>
                  <button
                    onClick={() => setViewMode('statistics')}
                    style={{
                      padding: '20px',
                      backgroundColor: 'white',
                      borderRadius: '12px',
                      border: '1px solid #e5e7eb',
                      cursor: 'pointer',
                      textAlign: 'left',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    }}
                  >
                    <BarChart3 size={24} style={{ color: '#0891b2', marginBottom: '12px' }} />
                    <p style={{ fontWeight: 600, color: '#111' }}>Analytics</p>
                    <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>Statistics & visualizations</p>
                  </button>
                </div>

                {/* Scans Grid */}
                <div style={{ 
                  backgroundColor: 'white', 
                  borderRadius: '12px', 
                  padding: '24px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>All Scans ({selectedPatient.scans.length})</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                    {selectedPatient.scans.map((scan) => (
                      <div key={scan.id} style={{ 
                        border: '1px solid #e5e7eb', 
                        borderRadius: '8px', 
                        overflow: 'hidden',
                        backgroundColor: '#f9fafb',
                      }}>
                        <img 
                          src={scan.imageUrl} 
                          alt={scan.name}
                          style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                        />
                        <div style={{ padding: '12px' }}>
                          <p style={{ fontWeight: 600, fontSize: '14px' }}>{scan.name}</p>
                          <p style={{ fontSize: '12px', color: '#6b7280' }}>
                            {scan.type.toUpperCase()} • {scan.uploadedAt.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ 
                height: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexDirection: 'column',
                color: '#6b7280',
              }}>
                <User size={48} style={{ marginBottom: '16px', color: '#9ca3af' }} />
                <p style={{ fontSize: '18px' }}>Select a patient to view their records</p>
              </div>
            )
          )}
        </div>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div 
            onClick={() => { setShowPasswordModal(false); setPasswordError(""); setPasswordInput(""); }}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
            }}
          />
          <div style={{
            position: 'relative',
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            width: '360px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
          }}>
            <button
              onClick={() => { setShowPasswordModal(false); setPasswordError(""); setPasswordInput(""); }}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <X size={20} style={{ color: '#6b7280' }} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <Lock size={24} style={{ color: '#0891b2' }} />
              <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Enter Edit Password</h2>
            </div>
            <input 
              type="password"
              value={passwordInput}
              onChange={(e) => { setPasswordInput(e.target.value); setPasswordError(""); }}
              placeholder="Enter password"
              onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: passwordError ? '2px solid #ef4444' : '1px solid #e5e7eb',
                fontSize: '14px',
                marginBottom: '8px',
              }}
            />
            {passwordError && (
              <p style={{ color: '#ef4444', fontSize: '13px', marginBottom: '12px' }}>{passwordError}</p>
            )}
            <button
              onClick={handlePasswordSubmit}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#0891b2',
                color: 'white',
                fontWeight: 600,
                cursor: 'pointer',
                marginTop: '8px',
              }}
            >
              Unlock Edit Mode
            </button>
          </div>
        </div>
      )}

      {/* New Patient Modal */}
      {showNewPatientModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div 
            onClick={() => setShowNewPatientModal(false)}
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.5)',
            }}
          />
          <div style={{
            position: 'relative',
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            width: '400px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px' }}>Add New Patient</h2>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px' }}>Full Name</label>
              <input 
                type="text" 
                value={newPatientName}
                onChange={(e) => setNewPatientName(e.target.value)}
                placeholder="Enter patient name"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  fontSize: '14px',
                }}
              />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px' }}>Date of Birth</label>
              <input 
                type="date"
                value={newPatientDob}
                onChange={(e) => setNewPatientDob(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  fontSize: '14px',
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setShowNewPatientModal(false)}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePatient}
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#0891b2',
                  color: 'white',
                  cursor: 'pointer',
                }}
              >
                Create Patient
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientRecords;