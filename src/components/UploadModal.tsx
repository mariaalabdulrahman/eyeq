import { useState, useCallback } from "react";
import { Upload, X, Microscope, Eye, UserPlus, User } from "lucide-react";
import { Patient } from "@/types/scan";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File, type: 'oct' | 'fundus', patientId?: string, newPatientName?: string) => void;
  patients: Patient[];
}

export function UploadModal({ isOpen, onClose, onUpload, patients }: UploadModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [scanType, setScanType] = useState<'oct' | 'fundus'>('oct');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [patientOption, setPatientOption] = useState<'none' | 'existing' | 'new'>('none');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [newPatientName, setNewPatientName] = useState<string>('');

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = () => {
    if (selectedFile) {
      const patientId = patientOption === 'existing' ? selectedPatientId : undefined;
      const patientName = patientOption === 'new' ? newPatientName : undefined;
      onUpload(selectedFile, scanType, patientId, patientName);
      resetForm();
      onClose();
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setPatientOption('none');
    setSelectedPatientId('');
    setNewPatientName('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 50,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div 
        onClick={handleClose}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
        }}
      />
      
      <div style={{
        position: 'relative',
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '24px',
        width: '100%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
      }}>
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            padding: '8px',
            borderRadius: '8px',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <X size={20} />
        </button>

        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '24px', color: '#111' }}>
          Upload Medical Scan
        </h2>

        {/* Patient Assignment Options */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '12px', color: '#374151' }}>
            Assign to Patient
          </label>
          
          {/* Option Buttons */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <button
              onClick={() => setPatientOption('none')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '10px 12px',
                borderRadius: '8px',
                border: patientOption === 'none' ? '2px solid #0891b2' : '1px solid #e5e7eb',
                backgroundColor: patientOption === 'none' ? '#ecfeff' : '#f9fafb',
                color: patientOption === 'none' ? '#0891b2' : '#6b7280',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '13px',
              }}
            >
              <X size={16} />
              None
            </button>
            <button
              onClick={() => setPatientOption('existing')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '10px 12px',
                borderRadius: '8px',
                border: patientOption === 'existing' ? '2px solid #0891b2' : '1px solid #e5e7eb',
                backgroundColor: patientOption === 'existing' ? '#ecfeff' : '#f9fafb',
                color: patientOption === 'existing' ? '#0891b2' : '#6b7280',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '13px',
              }}
            >
              <User size={16} />
              Existing
            </button>
            <button
              onClick={() => setPatientOption('new')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '10px 12px',
                borderRadius: '8px',
                border: patientOption === 'new' ? '2px solid #0891b2' : '1px solid #e5e7eb',
                backgroundColor: patientOption === 'new' ? '#ecfeff' : '#f9fafb',
                color: patientOption === 'new' ? '#0891b2' : '#6b7280',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '13px',
              }}
            >
              <UserPlus size={16} />
              New Patient
            </button>
          </div>

          {/* Existing Patient Dropdown */}
          {patientOption === 'existing' && (
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                backgroundColor: '#f9fafb',
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              <option value="">-- Select a patient --</option>
              {patients.map(patient => (
                <option key={patient.id} value={patient.id}>{patient.name}</option>
              ))}
            </select>
          )}

          {/* New Patient Input */}
          {patientOption === 'new' && (
            <input
              type="text"
              value={newPatientName}
              onChange={(e) => setNewPatientName(e.target.value)}
              placeholder="Enter patient name"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                backgroundColor: '#f9fafb',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
            />
          )}
        </div>

        {/* Scan Type Selection */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <button
            onClick={() => setScanType('oct')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px',
              borderRadius: '8px',
              border: scanType === 'oct' ? '2px solid #0891b2' : '1px solid #e5e7eb',
              backgroundColor: scanType === 'oct' ? '#ecfeff' : '#f9fafb',
              color: scanType === 'oct' ? '#0891b2' : '#6b7280',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            <Microscope size={18} />
            OCT Scan
          </button>
          <button
            onClick={() => setScanType('fundus')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px',
              borderRadius: '8px',
              border: scanType === 'fundus' ? '2px solid #0891b2' : '1px solid #e5e7eb',
              backgroundColor: scanType === 'fundus' ? '#ecfeff' : '#f9fafb',
              color: scanType === 'fundus' ? '#0891b2' : '#6b7280',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            <Eye size={18} />
            Fundus Image
          </button>
        </div>

        {/* Upload Area */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          style={{
            position: 'relative',
            border: dragActive ? '2px dashed #0891b2' : previewUrl ? '2px solid #0891b2' : '2px dashed #e5e7eb',
            borderRadius: '12px',
            padding: '32px',
            textAlign: 'center',
            backgroundColor: dragActive ? '#ecfeff' : '#f9fafb',
          }}
        >
          {previewUrl ? (
            <div>
              <img
                src={previewUrl}
                alt="Preview"
                style={{ maxHeight: '192px', margin: '0 auto', borderRadius: '8px', objectFit: 'contain' }}
              />
              <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '16px' }}>{selectedFile?.name}</p>
            </div>
          ) : (
            <>
              <Upload size={48} style={{ margin: '0 auto 16px', color: '#9ca3af' }} />
              <p style={{ fontWeight: 500, marginBottom: '8px', color: '#111' }}>
                Drop your scan here or click to browse
              </p>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>
                Supports JPG, PNG, DICOM formats
              </p>
            </>
          )}
          
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              opacity: 0,
              cursor: 'pointer',
            }}
          />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <button
            onClick={handleClose}
            style={{
              flex: 1,
              padding: '12px',
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
            onClick={handleSubmit}
            disabled={!selectedFile || (patientOption === 'existing' && !selectedPatientId) || (patientOption === 'new' && !newPatientName.trim())}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: selectedFile && (patientOption === 'none' || (patientOption === 'existing' && selectedPatientId) || (patientOption === 'new' && newPatientName.trim())) ? '#0891b2' : '#9ca3af',
              color: 'white',
              cursor: selectedFile ? 'pointer' : 'not-allowed',
              fontWeight: 500,
            }}
          >
            Analyze Scan
          </button>
        </div>
      </div>
    </div>
  );
}
