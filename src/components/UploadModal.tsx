import { useState, useCallback, useEffect } from "react";
import { Upload, X, Microscope, Eye, Plus, Calendar } from "lucide-react";
import { getImagePreviewUrl } from "@/lib/tifUtils";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (fundusFile: File, octFile?: File, eyeSide?: 'left' | 'right', visitNumber?: number, visitDate?: Date) => void;
  currentPatientScansCount: number; // Number of existing scans for current patient
}

export function UploadModal({ isOpen, onClose, onUpload, currentPatientScansCount }: UploadModalProps) {
  const [dragActive, setDragActive] = useState(false);
  const [fundusFile, setFundusFile] = useState<File | null>(null);
  const [octFile, setOctFile] = useState<File | null>(null);
  const [fundusPreview, setFundusPreview] = useState<string | null>(null);
  const [octPreview, setOctPreview] = useState<string | null>(null);
  const [eyeSide, setEyeSide] = useState<'left' | 'right'>('right');
  const [visitNumber, setVisitNumber] = useState<number>(1);
  const [visitDate, setVisitDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Set default visit number based on existing scans
  useEffect(() => {
    if (currentPatientScansCount === 0) {
      setVisitNumber(1);
    } else {
      // Default to next visit for patients with existing scans
      setVisitNumber(Math.ceil(currentPatientScansCount / 2) + 1);
    }
  }, [currentPatientScansCount, isOpen]);

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
      onUpload(fundusFile, octFile || undefined, eyeSide, visitNumber, new Date(visitDate));
      resetForm();
      onClose();
    }
  };

  const resetForm = () => {
    setFundusFile(null);
    setOctFile(null);
    setFundusPreview(null);
    setOctPreview(null);
    setEyeSide('right');
    setVisitDate(new Date().toISOString().split('T')[0]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  const canSubmit = fundusFile;

  // Generate visit options (1-10)
  const visitOptions = Array.from({ length: 10 }, (_, i) => i + 1);

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

        {/* Visit Information */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: '#374151' }}>
              <Calendar size={16} style={{ color: '#0891b2' }} />
              Image Date
            </label>
            <input
              type="date"
              value={visitDate}
              onChange={(e) => setVisitDate(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                backgroundColor: '#f9fafb',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '8px', color: '#374151' }}>
              Visit Number
            </label>
            <select
              value={visitNumber}
              onChange={(e) => setVisitNumber(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                backgroundColor: '#f9fafb',
                fontSize: '14px',
                boxSizing: 'border-box',
                cursor: 'pointer',
              }}
            >
              {visitOptions.map(num => (
                <option key={num} value={num}>
                  {num === 1 ? 'First Visit' : num === 2 ? 'Second Visit' : num === 3 ? 'Third Visit' : `Visit ${num}`}
                </option>
              ))}
            </select>
          </div>
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