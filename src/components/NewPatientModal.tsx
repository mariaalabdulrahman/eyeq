import { useState } from "react";
import { X, UserPlus } from "lucide-react";

interface NewPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; age: number; gender: 'male' | 'female' | 'other'; relevantInfo?: string }) => void;
}

export function NewPatientModal({ isOpen, onClose, onSubmit }: NewPatientModalProps) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [relevantInfo, setRelevantInfo] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Name is required";
    if (!age || parseInt(age) < 0 || parseInt(age) > 150) newErrors.age = "Valid age is required";
    return newErrors;
  };

  const handleSubmit = () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onSubmit({
      name: name.trim(),
      age: parseInt(age),
      gender,
      relevantInfo: relevantInfo.trim() || undefined,
    });

    // Reset form
    setName("");
    setAge("");
    setGender('male');
    setRelevantInfo("");
    setErrors({});
    onClose();
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
              <UserPlus size={20} color="white" />
            </div>
            <div>
              <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#111" }}>New Patient Analysis</h2>
              <p style={{ fontSize: "13px", color: "#6b7280" }}>Enter patient information to begin</p>
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

        {/* Form */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
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

          {/* Relevant Info */}
          <div>
            <label style={{ display: "block", fontSize: "14px", fontWeight: 500, marginBottom: "6px", color: "#374151" }}>
              Relevant Medical History <span style={{ color: "#6b7280", fontWeight: 400 }}>(Optional)</span>
            </label>
            <textarea
              value={relevantInfo}
              onChange={(e) => setRelevantInfo(e.target.value)}
              placeholder="E.g., diabetes, hypertension, previous eye conditions, medications..."
              rows={3}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: "10px",
                border: "1px solid #e5e7eb",
                fontSize: "15px",
                outline: "none",
                resize: "vertical",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: "12px", marginTop: "28px" }}>
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
            onClick={handleSubmit}
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
            Start Analysis
          </button>
        </div>
      </div>
    </div>
  );
}
