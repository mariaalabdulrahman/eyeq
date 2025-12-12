import { useState } from "react";
import { X, User, GitCompare, FileText, Upload, MessageCircle } from "lucide-react";
import { Patient } from "@/types/scan";

interface PatientSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (patientId: string) => void;
  patients: Patient[];
  title: string;
  description: string;
  icon: 'compare' | 'textual' | 'upload' | 'chat';
}

export function PatientSelectModal({ isOpen, onClose, onSelect, patients, title, description, icon }: PatientSelectModalProps) {
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');

  if (!isOpen) return null;

  const handleSelect = () => {
    if (selectedPatientId) {
      onSelect(selectedPatientId);
      setSelectedPatientId('');
      onClose();
    }
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
          maxWidth: "480px",
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
              backgroundColor: iconBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <IconComponent size={20} color={iconColor} />
            </div>
            <div>
              <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#111" }}>{title}</h2>
              <p style={{ fontSize: "13px", color: "#6b7280" }}>{description}</p>
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

        {/* Patient List */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "8px", color: "#374151" }}>
            Select Patient
          </label>
          
          {patients.length === 0 ? (
            <div style={{
              padding: "24px",
              textAlign: "center",
              backgroundColor: "#f9fafb",
              borderRadius: "10px",
              border: "1px solid #e5e7eb",
            }}>
              <User size={32} style={{ color: "#9ca3af", marginBottom: "8px" }} />
              <p style={{ color: "#6b7280", fontSize: "14px" }}>No patients available</p>
              <p style={{ color: "#9ca3af", fontSize: "12px" }}>Create a patient first using Analyze Patient</p>
            </div>
          ) : (
            <div style={{ 
              maxHeight: "300px", 
              overflowY: "auto",
              border: "1px solid #e5e7eb",
              borderRadius: "10px",
            }}>
              {patients.map(patient => (
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
                  onMouseEnter={(e) => {
                    if (selectedPatientId !== patient.id) {
                      e.currentTarget.style.backgroundColor = "#f9fafb";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedPatientId !== patient.id) {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }
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
              ))}
            </div>
          )}
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
      </div>
    </div>
  );
}
