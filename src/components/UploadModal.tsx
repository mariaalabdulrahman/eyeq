import { useState, useCallback } from "react";
import { Upload, X, Microscope, Eye, UserPlus, User, Plus } from "lucide-react";
import { Patient } from "@/types/scan";
import { getImagePreviewUrl } from "@/lib/tifUtils";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (fundusFile: File, octFile?: File, patientId?: string, newPatientName?: string, eyeSide?: 'left' | 'right') => void;
  patients: Patient[];
}

export function UploadModal({ isOpen, onClose, onUpload, patients }: UploadModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [fundusFile, setFundusFile] = useState<File | null>(null);
  const [octFile, setOctFile] = useState<File | null>(null);
  const [fundusPreview, setFundusPreview] = useState<string | null>(null);
  const [octPreview, setOctPreview] = useState<string | null>(null);
  const [patientOption, setPatientOption] = useState<'none' | 'existing' | 'new'>('none');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [newPatientName, setNewPatientName] = useState<string>('');
  const [eyeSide, setEyeSide] = useState<'left' | 'right'>('right');

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setFundusFile(file);
      const previewUrl = await getImagePreviewUrl(file);
      setFundusPreview(previewUrl);
    }
  }, []);

  const handleFundusSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFundusFile(file);
      const previewUrl = await getImagePreviewUrl(file);
      setFundusPreview(previewUrl);
    }
  };

  const handleOctSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setOctFile(file);
      const previewUrl = await getImagePreviewUrl(file);
      setOctPreview(previewUrl);
    }
  };

  const removeOct = () => {
    setOctFile(null);
    setOctPreview(null);
  };

  const handleSubmit = () => {
    if (fundusFile) {
      const patientId = patientOption === 'existing' ? selectedPatientId : undefined;
      const patientName = patientOption === 'new' ? newPatientName : undefined;
      onUpload(fundusFile, octFile || undefined, patientId, patientName, eyeSide);
      resetForm();
      onClose();
    }
  };

  const resetForm = () => {
    setFundusFile(null);
    setOctFile(null);
    setFundusPreview(null);
    setOctPreview(null);
    setPatientOption('none');
    setSelectedPatientId('');
    setNewPatientName('');
    setEyeSide('right');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  const canSubmit = fundusFile && 
    (patientOption === 'none' || 
     (patientOption === 'existing' && selectedPatientId) || 
     (patientOption === 'new' && newPatientName.trim()));

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
        maxWidth: '600px',
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

        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px', color: '#111' }}>
          Upload Eye Scan
        </h2>
        <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>
          Fundus image is required. You can optionally add an OCT scan of the same eye.
        </p>

        {/* Patient Assignment Options */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '12px', color: '#374151' }}>
            Assign to Patient
          </label>
          
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

        {/* Eye Side Selection */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '12px', color: '#374151' }}>
            Eye Side
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setEyeSide('right')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '10px 12px',
                borderRadius: '8px',
                border: eyeSide === 'right' ? '2px solid #0891b2' : '1px solid #e5e7eb',
                backgroundColor: eyeSide === 'right' ? '#ecfeff' : '#f9fafb',
                color: eyeSide === 'right' ? '#0891b2' : '#6b7280',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '13px',
              }}
            >
              <Eye size={16} />
              Right Eye (OD)
            </button>
            <button
              onClick={() => setEyeSide('left')}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '10px 12px',
                borderRadius: '8px',
                border: eyeSide === 'left' ? '2px solid #0891b2' : '1px solid #e5e7eb',
                backgroundColor: eyeSide === 'left' ? '#ecfeff' : '#f9fafb',
                color: eyeSide === 'left' ? '#0891b2' : '#6b7280',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '13px',
              }}
            >
              <Eye size={16} />
              Left Eye (OS)
            </button>
          </div>
        </div>

        {/* Upload Areas */}
        <div style={{ display: 'grid', gridTemplateColumns: fundusPreview ? '1fr 1fr' : '1fr', gap: '16px', marginBottom: '24px' }}>
          {/* Fundus Upload - Required */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: '#374151' }}>
              <Eye size={18} style={{ color: '#0891b2' }} />
              Fundus Image <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              style={{
                position: 'relative',
                border: dragActive ? '2px dashed #0891b2' : fundusPreview ? '2px solid #22c55e' : '2px dashed #e5e7eb',
                borderRadius: '12px',
                padding: '24px',
                textAlign: 'center',
                backgroundColor: dragActive ? '#ecfeff' : fundusPreview ? '#f0fdf4' : '#f9fafb',
                minHeight: '180px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {fundusPreview ? (
                <div>
                  <img
                    src={fundusPreview}
                    alt="Fundus Preview"
                    style={{ maxHeight: '120px', margin: '0 auto', borderRadius: '8px', objectFit: 'contain' }}
                  />
                  <p style={{ fontSize: '12px', color: '#22c55e', marginTop: '8px', fontWeight: 500 }}>✓ {fundusFile?.name}</p>
                </div>
              ) : (
                <>
                  <Upload size={36} style={{ marginBottom: '12px', color: '#9ca3af' }} />
                  <p style={{ fontWeight: 500, marginBottom: '4px', color: '#111', fontSize: '14px' }}>
                    Drop fundus image here
                  </p>
                  <p style={{ fontSize: '12px', color: '#6b7280' }}>
                    Required for analysis
                  </p>
                </>
              )}
              
              <input
                type="file"
                accept="image/*,.tif,.tiff"
                onChange={handleFundusSelect}
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
          </div>

          {/* OCT Upload - Optional, only shown when fundus is uploaded */}
          {fundusPreview && (
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: '#374151' }}>
                <Microscope size={18} style={{ color: '#0891b2' }} />
                OCT Scan <span style={{ color: '#6b7280', fontWeight: 400 }}>(optional)</span>
              </label>
              <div
                style={{
                  position: 'relative',
                  border: octPreview ? '2px solid #22c55e' : '2px dashed #e5e7eb',
                  borderRadius: '12px',
                  padding: '24px',
                  textAlign: 'center',
                  backgroundColor: octPreview ? '#f0fdf4' : '#f9fafb',
                  minHeight: '180px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {octPreview ? (
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeOct(); }}
                      style={{
                        position: 'absolute',
                        top: '-8px',
                        right: '-8px',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        border: 'none',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10,
                      }}
                    >
                      <X size={14} />
                    </button>
                    <img
                      src={octPreview}
                      alt="OCT Preview"
                      style={{ maxHeight: '120px', margin: '0 auto', borderRadius: '8px', objectFit: 'contain' }}
                    />
                    <p style={{ fontSize: '12px', color: '#22c55e', marginTop: '8px', fontWeight: 500 }}>✓ {octFile?.name}</p>
                  </div>
                ) : (
                  <>
                    <Plus size={36} style={{ marginBottom: '12px', color: '#9ca3af' }} />
                    <p style={{ fontWeight: 500, marginBottom: '4px', color: '#111', fontSize: '14px' }}>
                      Add OCT scan
                    </p>
                    <p style={{ fontSize: '12px', color: '#6b7280' }}>
                      Same eye as fundus
                    </p>
                  </>
                )}
                
                <input
                  type="file"
                  accept="image/*,.tif,.tiff"
                  onChange={handleOctSelect}
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
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '12px' }}>
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
            disabled={!canSubmit}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: canSubmit ? '#0891b2' : '#9ca3af',
              color: 'white',
              cursor: canSubmit ? 'pointer' : 'not-allowed',
              fontWeight: 500,
            }}
          >
            Analyze Scan{octFile ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  );
}
