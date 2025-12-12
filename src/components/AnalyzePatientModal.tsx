import { useState } from "react";
import { X, UserPlus, User, Stethoscope } from "lucide-react";
import { Patient } from "@/types/scan";
import { MedicalTagInput } from "./MedicalTagInput";

interface AnalyzePatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExisting: (patientId: string) => void;
  onCreateNew: (data: { name: string; age: number; gender: 'male' | 'female' | 'other'; medicalTags: string[] }) => void;
  patients: Patient[];
}

export function AnalyzePatientModal({ isOpen, onClose, onSelectExisting, onCreateNew, patients }: AnalyzePatientModalProps) {
  const [mode, setMode] = useState<'select' | 'existing' | 'new'>('select');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [medicalTags, setMedicalTags] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const resetForm = () => {
    setMode('select');
    setSelectedPatientId('');
    setName("");
    setAge("");
    setGender('male');
    setMedicalTags([]);
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateNew = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!age || parseInt(age) < 0 || parseInt(age) > 150) newErrors.age = "Valid age is required";
    return newErrors;
  };

  const handleSubmitNew = () => {
    const validationErrors = validateNew();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onCreateNew({
      name: name.trim(),
      age: parseInt(age),
      gender,
      medicalTags,
    });
    handleClose();
  };

  const handleSelectExisting = () => {
    if (selectedPatientId) {
      onSelectExisting(selectedPatientId);
      handleClose();
    }
  };

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
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "white",
          borderRadius: "16px",
          padding: "32px",
          width: "100%",
          maxWidth: "520px",
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
              backgroundColor: "#0891b2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <Stethoscope size={20} color="white" />
            </div>
            <div>
              <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#111" }}>Analyze Patient</h2>
              <p style={{ fontSize: "13px", color: "#6b7280" }}>
                {mode === 'select' ? "Choose an option to continue" : 
                 mode === 'existing' ? "Select a patient from the list" : 
                 "Enter new patient information"}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
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

        {/* Mode Selection */}
        {mode === 'select' && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <button
              onClick={() => setMode('existing')}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                padding: "20px",
                borderRadius: "12px",
                border: "1px solid #e5e7eb",
                backgroundColor: "white",
                cursor: "pointer",
                textAlign: "left",
                transition: "border-color 0.2s, background-color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#0891b2";
                e.currentTarget.style.backgroundColor = "#ecfeff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#e5e7eb";
                e.currentTarget.style.backgroundColor = "white";
              }}
            >
              <div style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                backgroundColor: "#f0fdf4",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <User size={24} color="#059669" />
              </div>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#111", marginBottom: "4px" }}>
                  Existing Patient
                </h3>
                <p style={{ fontSize: "13px", color: "#6b7280" }}>
                  Select from {patients.length} existing patient record{patients.length !== 1 ? 's' : ''}
                </p>
              </div>
            </button>

            <button
              onClick={() => setMode('new')}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                padding: "20px",
                borderRadius: "12px",
                border: "1px solid #e5e7eb",
                backgroundColor: "white",
                cursor: "pointer",
                textAlign: "left",
                transition: "border-color 0.2s, background-color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#0891b2";
                e.currentTarget.style.backgroundColor = "#ecfeff";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#e5e7eb";
                e.currentTarget.style.backgroundColor = "white";
              }}
            >
              <div style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                backgroundColor: "#eff6ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <UserPlus size={24} color="#2563eb" />
              </div>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#111", marginBottom: "4px" }}>
                  New Patient
                </h3>
                <p style={{ fontSize: "13px", color: "#6b7280" }}>
                  Create a new patient record and start analysis
                </p>
              </div>
            </button>
          </div>
        )}

        {/* Existing Patient Selection */}
        {mode === 'existing' && (
          <div>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "8px", color: "#374151" }}>
                Select Patient
              </label>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
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
                <option value="">-- Select a patient --</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.name} ({patient.age} y/o, {patient.gender}) - {patient.scans.length} scan{patient.scans.length !== 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setMode('select')}
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
                onClick={handleSelectExisting}
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
        )}

        {/* New Patient Form */}
        {mode === 'new' && (
          <div>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "24px" }}>
              {/* Name */}
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "6px", color: "#374151" }}>
                  Patient Name <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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

              {/* Age and Gender Row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "6px", color: "#374151" }}>
                    Age <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Years"
                    min="0"
                    max="150"
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      borderRadius: "10px",
                      border: errors.age ? "2px solid #ef4444" : "1px solid #e5e7eb",
                      fontSize: "15px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                  />
                  {errors.age && <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px" }}>{errors.age}</p>}
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "6px", color: "#374151" }}>
                    Gender <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as 'male' | 'female' | 'other')}
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

              {/* Medical Tags */}
              <div>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "6px", color: "#374151" }}>
                  Medical History <span style={{ color: "#6b7280", fontWeight: 400 }}>(Optional)</span>
                </label>
                <MedicalTagInput
                  value={medicalTags}
                  onChange={setMedicalTags}
                  placeholder="Type to search conditions, symptoms, medications..."
                />
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setMode('select')}
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
                onClick={handleSubmitNew}
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
        )}
      </div>
    </div>
  );
}
