import { useState } from "react";
import { X, User, GitCompare, FileText, Upload, MessageCircle, UserPlus } from "lucide-react";
import { Patient } from "@/types/scan";
import { MedicalTagInput } from "@/components/MedicalTagInput";

interface PatientSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (patientId: string) => void;
  onCreatePatient?: (data: { name: string; dateOfBirth: string; gender: 'male' | 'female' | 'other'; medicalTags: string[] }) => string | void;
  patients: Patient[];
  title: string;
  description: string;
  icon: 'compare' | 'textual' | 'upload' | 'chat';
}

export function PatientSelectModal({ isOpen, onClose, onSelect, onCreatePatient, patients, title, description, icon }: PatientSelectModalProps) {
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [showNewPatientForm, setShowNewPatientForm] = useState(false);
  const [newPatientData, setNewPatientData] = useState({
    name: '',
    dateOfBirth: '',
    gender: 'male' as 'male' | 'female' | 'other',
    medicalTags: [] as string[],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleSelect = () => {
    if (selectedPatientId) {
      onSelect(selectedPatientId);
      setSelectedPatientId('');
      onClose();
    }
  };

  const handleCreatePatient = () => {
    const newErrors: Record<string, string> = {};
    if (!newPatientData.name.trim()) newErrors.name = "Name is required";
    if (!newPatientData.dateOfBirth) newErrors.dateOfBirth = "Date of birth is required";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (onCreatePatient) {
      const newId = onCreatePatient(newPatientData);
      if (newId) {
        onSelect(newId);
      }
    }
    setNewPatientData({ name: '', dateOfBirth: '', gender: 'male', medicalTags: [] });
    setShowNewPatientForm(false);
    setErrors({});
    onClose();
  };

  const IconComponent = icon === 'compare' ? GitCompare : icon === 'textual' ? FileText : icon === 'chat' ? MessageCircle : Upload;
  const iconColor = icon === 'compare' ? '#7c3aed' : icon === 'textual' ? '#059669' : icon === 'chat' ? '#2563eb' : '#0891b2';
  const iconBg = icon === 'compare' ? '#f3e8ff' : icon === 'textual' ? '#ecfdf5' : icon === 'chat' ? '#dbeafe' : '#ecfeff';

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "white",
          borderRadius: "16px",
          padding: "32px",
          width: "100%",
          maxWidth: showNewPatientForm ? "520px" : "480px",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              backgroundColor: showNewPatientForm ? "#0891b2" : iconBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              {showNewPatientForm ? <UserPlus size={20} color="white" /> : <IconComponent size={20} color={iconColor} />}
            </div>
            <div>
              <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#111" }}>
                {showNewPatientForm ? "New Patient" : title}
              </h2>
              <p style={{ fontSize: "13px", color: "#6b7280" }}>
                {showNewPatientForm ? "Enter patient information" : description}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: "#f3f4f6",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={18} color="#6b7280" />
          </button>
        </div>

        {showNewPatientForm ? (
          /* New Patient Form */
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "6px", color: "#374151" }}>
                Patient Name <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="text"
                value={newPatientData.name}
                onChange={(e) => setNewPatientData({ ...newPatientData, name: e.target.value })}
                placeholder="Enter full name"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: "10px",
                  border: errors.name ? "2px solid #ef4444" : "1px solid #e5e7eb",
                  fontSize: "15px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              {errors.name && <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px" }}>{errors.name}</p>}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "6px", color: "#374151" }}>
                  Date of Birth <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="date"
                  value={newPatientData.dateOfBirth}
                  onChange={(e) => setNewPatientData({ ...newPatientData, dateOfBirth: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: "10px",
                    border: errors.dateOfBirth ? "2px solid #ef4444" : "1px solid #e5e7eb",
                    fontSize: "15px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                {errors.dateOfBirth && <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px" }}>{errors.dateOfBirth}</p>}
              </div>

              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "6px", color: "#374151" }}>
                  Gender <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <select
                  value={newPatientData.gender}
                  onChange={(e) => setNewPatientData({ ...newPatientData, gender: e.target.value as 'male' | 'female' | 'other' })}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: "10px",
                    border: "1px solid #e5e7eb",
                    fontSize: "15px",
                    outline: "none",
                    backgroundColor: "white",
                    cursor: "pointer",
                    boxSizing: "border-box",
                  }}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "6px", color: "#374151" }}>
                Medical History <span style={{ color: "#6b7280", fontWeight: 400 }}>(Optional)</span>
              </label>
              <MedicalTagInput
                value={newPatientData.medicalTags}
                onChange={(tags) => setNewPatientData({ ...newPatientData, medicalTags: tags })}
                placeholder="Type to search conditions..."
              />
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
              <button
                onClick={() => {
                  setShowNewPatientForm(false);
                  setErrors({});
                }}
                style={{
                  flex: 1,
                  padding: "14px",
                  borderRadius: "10px",
                  border: "1px solid #e5e7eb",
                  backgroundColor: "white",
                  fontSize: "15px",
                  fontWeight: 500,
                  cursor: "pointer",
                  color: "#374151",
                }}
              >
                Back
              </button>
              <button
                onClick={handleCreatePatient}
                style={{
                  flex: 1,
                  padding: "14px",
                  borderRadius: "10px",
                  border: "none",
                  backgroundColor: "#0891b2",
                  color: "white",
                  fontSize: "15px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Create & Continue
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Patient List */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "8px", color: "#374151" }}>
                Select Patient
              </label>
              
              <div style={{ 
                maxHeight: "300px", 
                overflowY: "auto",
                border: "1px solid #e5e7eb",
                borderRadius: "10px",
              }}>
                {/* New Patient Option */}
                {onCreatePatient && (
                  <button
                    onClick={() => setShowNewPatientForm(true)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "14px 16px",
                      border: "none",
                      backgroundColor: "#f0fdf4",
                      cursor: "pointer",
                      textAlign: "left",
                      borderBottom: "2px solid #e5e7eb",
                    }}
                  >
                    <div style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "10px",
                      backgroundColor: "#22c55e",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <UserPlus size={20} color="white" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: "15px", fontWeight: 600, color: "#22c55e", margin: 0 }}>
                        Create New Patient
                      </p>
                      <p style={{ fontSize: "12px", color: "#6b7280", margin: 0 }}>
                        Add a new patient record
                      </p>
                    </div>
                  </button>
                )}

                {patients.length === 0 ? (
                  <div style={{
                    padding: "24px",
                    textAlign: "center",
                    backgroundColor: "#f9fafb",
                  }}>
                    <User size={32} style={{ color: "#9ca3af", marginBottom: "8px" }} />
                    <p style={{ color: "#6b7280", fontSize: "14px" }}>No patients available</p>
                    <p style={{ color: "#9ca3af", fontSize: "12px" }}>Create a new patient to get started</p>
                  </div>
                ) : (
                  patients.map(patient => (
                    <button
                      key={patient.id}
                      onClick={() => setSelectedPatientId(patient.id)}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "14px 16px",
                        border: "none",
                        backgroundColor: selectedPatientId === patient.id ? "#ecfeff" : "transparent",
                        cursor: "pointer",
                        textAlign: "left",
                        borderBottom: "1px solid #f3f4f6",
                        transition: "background-color 0.15s",
                      }}
                    >
                      <div style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "10px",
                        backgroundColor: selectedPatientId === patient.id ? "#0891b2" : "#f3f4f6",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}>
                        <User size={20} color={selectedPatientId === patient.id ? "white" : "#6b7280"} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ 
                          fontSize: "15px", 
                          fontWeight: selectedPatientId === patient.id ? 600 : 500,
                          color: selectedPatientId === patient.id ? "#0891b2" : "#374151",
                          margin: 0,
                        }}>
                          {patient.name}
                        </p>
                        <p style={{ fontSize: "12px", color: "#9ca3af", margin: 0 }}>
                          {patient.age} y/o • {patient.gender} • {patient.scans.length} scan{patient.scans.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      {selectedPatientId === patient.id && (
                        <div style={{
                          width: "20px",
                          height: "20px",
                          borderRadius: "50%",
                          backgroundColor: "#0891b2",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}>
                          <span style={{ color: "white", fontSize: "12px" }}>✓</span>
                        </div>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: "14px",
                  borderRadius: "10px",
                  border: "1px solid #e5e7eb",
                  backgroundColor: "white",
                  fontSize: "15px",
                  fontWeight: 500,
                  cursor: "pointer",
                  color: "#374151",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSelect}
                disabled={!selectedPatientId}
                style={{
                  flex: 1,
                  padding: "14px",
                  borderRadius: "10px",
                  border: "none",
                  backgroundColor: selectedPatientId ? "#0891b2" : "#e5e7eb",
                  color: selectedPatientId ? "white" : "#9ca3af",
                  fontSize: "15px",
                  fontWeight: 600,
                  cursor: selectedPatientId ? "pointer" : "not-allowed",
                }}
              >
                Continue
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
