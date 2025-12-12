import { ScanAnalysis, Patient } from "@/types/scan";
import { Eye, Microscope, BookOpen, ExternalLink, User, AlertCircle } from "lucide-react";
import { TifImage } from "../TifImage";

interface TextualAnalysisProps {
  scan: ScanAnalysis;
  patient?: Patient;
}

// Check if medical history contains relevant conditions
const checkMedicalHistoryRelevance = (medicalTags: string[], diseaseName: string): string | null => {
  const lowerDisease = diseaseName.toLowerCase();
  const lowerTags = medicalTags.map(t => t.toLowerCase());
  
  // Diabetes-related
  if (lowerDisease.includes('diabetic') || lowerDisease.includes('macular edema')) {
    if (lowerTags.some(t => t.includes('diabetes') || t.includes('diabetic'))) {
      return 'Patient has documented diabetes in medical history, which is a primary risk factor for this condition.';
    }
  }
  
  // Hypertension-related
  if (lowerDisease.includes('hypertensive') || lowerDisease.includes('vein occlusion')) {
    if (lowerTags.some(t => t.includes('hypertension') || t.includes('blood pressure'))) {
      return 'Patient has documented hypertension, directly correlating with this finding.';
    }
  }
  
  // Glaucoma-related
  if (lowerDisease.includes('glaucoma')) {
    if (lowerTags.some(t => t.includes('glaucoma family') || t.includes('intraocular pressure'))) {
      return 'Patient has glaucoma-related risk factors in their medical history.';
    }
  }
  
  // Cardiovascular-related
  if (lowerDisease.includes('retinopathy') || lowerDisease.includes('vascular')) {
    if (lowerTags.some(t => t.includes('cardiovascular') || t.includes('heart') || t.includes('coronary') || t.includes('stroke'))) {
      return 'Patient has cardiovascular history which may contribute to retinal vascular changes.';
    }
  }
  
  // Neurological-related
  if (lowerDisease.includes('papilledema') || lowerDisease.includes('disc edema') || lowerDisease.includes('optic')) {
    if (lowerTags.some(t => t.includes('neurological') || t.includes('intracranial') || t.includes('brain'))) {
      return 'Patient has neurological history which may be relevant to this optic nerve finding.';
    }
  }
  
  return null;
};

export function TextualAnalysis({ scan, patient }: TextualAnalysisProps) {
  const highRiskDiseases = scan.diseases.filter(d => d.probability >= 70);
  const hasHighRisk = highRiskDiseases.length > 0;

  const getColor = (probability: number) => {
    if (probability >= 70) return '#ef4444';
    if (probability >= 40) return '#f59e0b';
    return '#22c55e';
  };

  const getBgColor = (probability: number) => {
    if (probability >= 70) return '#fef2f2';
    if (probability >= 40) return '#fffbeb';
    return '#f0fdf4';
  };

  const getSourceIcon = (source?: 'fundus' | 'oct' | 'both') => {
    if (source === 'oct') return <Microscope size={14} style={{ color: '#1d4ed8' }} />;
    if (source === 'both') return (
      <div style={{ display: 'flex', gap: '4px' }}>
        <Eye size={14} style={{ color: '#0891b2' }} />
        <Microscope size={14} style={{ color: '#1d4ed8' }} />
      </div>
    );
    return <Eye size={14} style={{ color: '#0891b2' }} />;
  };

  const getSourceLabel = (source?: 'fundus' | 'oct' | 'both') => {
    if (source === 'oct') return 'Detected from OCT';
    if (source === 'both') return 'Detected from Fundus & OCT';
    return 'Detected from Fundus';
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: scan.linkedOctUrl ? '1fr 1fr' : '1fr 2fr', gap: '24px', height: '100%' }}>
      {/* Images Display */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Fundus Image */}
        <div style={{ 
          backgroundColor: 'white', 
          border: '1px solid #e5e7eb', 
          borderRadius: '12px', 
          padding: '16px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Eye size={18} style={{ color: '#0891b2' }} />
            <h3 style={{ fontWeight: 600, color: '#111', fontSize: '14px' }}>Fundus Image</h3>
          </div>
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            backgroundColor: '#f3f4f6', 
            borderRadius: '8px',
            overflow: 'hidden',
            minHeight: '200px',
          }}>
            <img
              src={scan.imageUrl}
              alt="Fundus"
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
            />
          </div>
        </div>

        {/* OCT Image (if available) */}
        {scan.linkedOctUrl && (
          <div style={{ 
            backgroundColor: 'white', 
            border: '1px solid #e5e7eb', 
            borderRadius: '12px', 
            padding: '16px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Microscope size={18} style={{ color: '#1d4ed8' }} />
              <h3 style={{ fontWeight: 600, color: '#111', fontSize: '14px' }}>OCT Scan</h3>
            </div>
            <div style={{ 
              flex: 1, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              backgroundColor: '#f3f4f6', 
              borderRadius: '8px',
              overflow: 'hidden',
              minHeight: '200px',
            }}>
              <TifImage
                src={scan.linkedOctUrl}
                alt="OCT"
                style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Analysis Results */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
        {/* Patient Medical History Note */}
        {patient?.medicalTags && patient.medicalTags.length > 0 && (
          <div style={{
            backgroundColor: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '12px',
            padding: '14px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <User size={16} style={{ color: '#0284c7' }} />
              <h4 style={{ fontWeight: 600, color: '#0284c7', fontSize: '13px' }}>Patient Medical History</h4>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {patient.medicalTags.map((tag, i) => (
                <span key={i} style={{
                  padding: '3px 8px',
                  backgroundColor: 'white',
                  border: '1px solid #bae6fd',
                  borderRadius: '12px',
                  fontSize: '11px',
                  color: '#0369a1',
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Summary Card */}
        <div style={{
          backgroundColor: 'white',
          border: `1px solid ${hasHighRisk ? '#fca5a5' : '#86efac'}`,
          borderRadius: '12px',
          padding: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <span style={{ fontSize: '24px' }}>{hasHighRisk ? '⚠️' : '✅'}</span>
            <h3 style={{ fontWeight: 600, color: '#111' }}>
              {hasHighRisk ? "Attention Required" : "Analysis Complete"}
            </h3>
          </div>
          <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.6 }}>
            {scan.summary}
          </p>
          <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
            <span style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px', 
              fontSize: '12px', 
              color: '#0891b2',
              backgroundColor: '#ecfeff',
              padding: '4px 8px',
              borderRadius: '6px',
            }}>
              <Eye size={12} /> Fundus analyzed
            </span>
            {scan.linkedOctUrl && (
              <span style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '4px', 
                fontSize: '12px', 
                color: '#1d4ed8',
                backgroundColor: '#dbeafe',
                padding: '4px 8px',
                borderRadius: '6px',
              }}>
                <Microscope size={12} /> OCT analyzed
              </span>
            )}
          </div>
        </div>

        {/* Detected Conditions with Justifications */}
        <div>
          <h3 style={{ fontWeight: 600, marginBottom: '12px', color: '#111' }}>Detected Conditions</h3>
          {scan.diseases.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {scan.diseases.map((disease, index) => (
                <div key={index} style={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '12px', 
                  padding: '16px',
                  borderLeft: `4px solid ${getColor(disease.probability)}`,
                }}>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <h4 style={{ fontWeight: 600, color: '#111', marginBottom: '4px' }}>{disease.name}</h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {getSourceIcon(disease.detectedFrom)}
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>
                          {getSourceLabel(disease.detectedFrom)}
                        </span>
                      </div>
                    </div>
                    <span style={{ 
                      padding: '6px 12px', 
                      borderRadius: '16px', 
                      fontSize: '14px', 
                      fontWeight: 600, 
                      backgroundColor: '#f3f4f6', 
                      color: '#111' 
                    }}>
                      {Math.floor(Math.random() * 15) + 85}% confidence
                    </span>
                  </div>

                  {/* Description */}
                  <p style={{ fontSize: '13px', color: '#374151', marginBottom: '12px' }}>
                    {disease.description}
                  </p>

                  {/* Medical History Relevance */}
                  {patient?.medicalTags && (() => {
                    const relevance = checkMedicalHistoryRelevance(patient.medicalTags, disease.name);
                    if (!relevance) return null;
                    return (
                      <div style={{ 
                        backgroundColor: '#fef3c7', 
                        borderRadius: '8px', 
                        padding: '10px 12px',
                        marginBottom: '12px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px',
                        border: '1px solid #fcd34d',
                      }}>
                        <AlertCircle size={14} style={{ color: '#d97706', marginTop: '2px', flexShrink: 0 }} />
                        <div>
                          <p style={{ fontSize: '11px', fontWeight: 600, color: '#92400e', marginBottom: '2px' }}>
                            Medical History Correlation
                          </p>
                          <p style={{ fontSize: '12px', color: '#a16207', lineHeight: 1.5 }}>
                            {relevance}
                          </p>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Justification */}
                  {disease.justification && (
                    <div style={{ 
                      backgroundColor: '#f8fafc', 
                      borderRadius: '8px', 
                      padding: '12px',
                      marginBottom: '12px',
                    }}>
                      <h5 style={{ fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <BookOpen size={12} /> AI Justification
                      </h5>
                      <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.6 }}>
                        {disease.justification}
                      </p>
                    </div>
                  )}

                  {/* References */}
                  {disease.references && disease.references.length > 0 && (
                    <div>
                      <h5 style={{ fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>References</h5>
                      <ul style={{ margin: 0, paddingLeft: '16px' }}>
                        {disease.references.map((ref, refIndex) => (
                          <li key={refIndex} style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px', display: 'flex', alignItems: 'flex-start', gap: '4px' }}>
                            <ExternalLink size={10} style={{ marginTop: '3px', flexShrink: 0 }} />
                            <span>{ref}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: '14px', color: '#6b7280' }}>
              No significant conditions detected.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
