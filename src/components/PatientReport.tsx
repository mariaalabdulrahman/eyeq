import { useState } from "react";
import { Patient, Disease, ScanAnalysis } from "@/types/scan";
import { Download, Stethoscope, User, Camera, AlertTriangle, CheckCircle, Clock, Lightbulb, Lock, Unlock, Link2, X, Microscope, Eye } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { TifImage } from "./TifImage";
import { calculateTrueAge } from "./AgeBar";

interface PatientReportProps {
  patient: Patient | null;
  reportType: 'doctor' | 'patient';
  isEditMode: boolean;
  onRequestEdit: () => void;
}

// Systemic disease associations with ocular conditions and peer-reviewed references
const SYSTEMIC_ASSOCIATIONS: Record<string, { systemicDisease: string; percentage: number; ocularLink: string; reference: string }[]> = {
  "Diabetic Retinopathy": [
    { systemicDisease: "Cardiovascular Disease", percentage: 65, ocularLink: "Microvascular damage in DR reflects systemic endothelial dysfunction", reference: "Cheung N, et al. Lancet. 2010;376(9735):124-36" },
    { systemicDisease: "Chronic Kidney Disease", percentage: 40, ocularLink: "Shared microvascular pathology between retinal and renal vessels", reference: "Wong TY, et al. Kidney Int. 2004;65(6):2237-44" },
    { systemicDisease: "Stroke", percentage: 35, ocularLink: "Retinal microvascular abnormalities predict cerebrovascular events", reference: "Wong TY, et al. JAMA. 2002;287(15):1989-96" },
  ],
  "Glaucoma": [
    { systemicDisease: "Cardiovascular Disease", percentage: 30, ocularLink: "Vascular dysregulation and reduced ocular blood flow", reference: "Flammer J, et al. Prog Retin Eye Res. 2002;21(4):359-93" },
    { systemicDisease: "Alzheimer's Disease", percentage: 25, ocularLink: "Shared neurodegenerative mechanisms and retinal ganglion cell loss", reference: "Hinton DR, et al. N Engl J Med. 1986;315(8):485-7" },
    { systemicDisease: "Sleep Apnea", percentage: 20, ocularLink: "Nocturnal hypoxia affects optic nerve perfusion", reference: "Stein JD, et al. Ophthalmology. 2011;118(12):2427-33" },
  ],
  "Age-Related Macular Degeneration": [
    { systemicDisease: "Cardiovascular Disease", percentage: 45, ocularLink: "Shared atherosclerotic and inflammatory pathways", reference: "Klein R, et al. Arch Ophthalmol. 2003;121(6):785-92" },
    { systemicDisease: "Alzheimer's Disease", percentage: 30, ocularLink: "Common amyloid-beta deposition in drusen and brain plaques", reference: "Ohno-Matsui K. Brain Res Bull. 2010;81(4-5):491-502" },
    { systemicDisease: "Stroke", percentage: 25, ocularLink: "Retinal vascular changes correlate with cerebrovascular risk", reference: "Ikram MK, et al. Stroke. 2006;37(2):424-9" },
  ],
  "Hypertensive Retinopathy": [
    { systemicDisease: "Stroke", percentage: 55, ocularLink: "Retinal arteriolar narrowing predicts cerebrovascular events", reference: "Wong TY, et al. Lancet. 2003;361(9369):1491-4" },
    { systemicDisease: "Heart Failure", percentage: 40, ocularLink: "Microvascular damage reflects cardiac stress", reference: "Wong TY, et al. Circulation. 2005;112(10):1406-13" },
    { systemicDisease: "Chronic Kidney Disease", percentage: 35, ocularLink: "Parallel target organ damage from hypertension", reference: "Dimmitt SB, et al. Hypertension. 1989;13(6):793-800" },
  ],
  "Central Retinal Vein Occlusion": [
    { systemicDisease: "Hypertension", percentage: 60, ocularLink: "Arterial compression and venous stasis", reference: "Hayreh SS, et al. Ophthalmology. 2001;108(5):830-41" },
    { systemicDisease: "Diabetes Mellitus", percentage: 35, ocularLink: "Hypercoagulable state and endothelial dysfunction", reference: "Hayreh SS, et al. Am J Ophthalmol. 2004;137(3):365-76" },
    { systemicDisease: "Cardiovascular Disease", percentage: 40, ocularLink: "Shared vascular risk factors", reference: "Cugati S, et al. Ophthalmology. 2007;114(3):520-4" },
  ],
  "Optic Neuritis": [
    { systemicDisease: "Multiple Sclerosis", percentage: 50, ocularLink: "Demyelinating inflammation of optic nerve", reference: "Beck RW, et al. N Engl J Med. 1992;326(9):581-8" },
    { systemicDisease: "Neuromyelitis Optica", percentage: 20, ocularLink: "Aquaporin-4 antibody-mediated damage", reference: "Wingerchuk DM, et al. Neurology. 2007;68(12):1076-9" },
  ],
  "Papilledema": [
    { systemicDisease: "Intracranial Hypertension", percentage: 70, ocularLink: "Elevated ICP transmitted to optic nerve sheath", reference: "Friedman DI, et al. Ann Neurol. 2013;73(3):304-20" },
    { systemicDisease: "Brain Tumor", percentage: 25, ocularLink: "Mass effect causing CSF obstruction", reference: "Hayreh SS. Prog Retin Eye Res. 2016;50:1-25" },
  ],
  "Retinitis Pigmentosa": [
    { systemicDisease: "Hearing Loss (Usher Syndrome)", percentage: 30, ocularLink: "Shared genetic mutations affecting photoreceptors and cochlea", reference: "Hartong DT, et al. Lancet. 2006;368(9549):1795-809" },
  ],
  "Disc Edema": [
    { systemicDisease: "Diabetes Mellitus", percentage: 45, ocularLink: "Diabetic papillopathy from microvascular ischemia", reference: "Regillo CD, et al. Arch Ophthalmol. 1995;113(7):889-95" },
    { systemicDisease: "Hypertension", percentage: 40, ocularLink: "Malignant hypertension causing optic disc swelling", reference: "Hayreh SS, et al. Ophthalmology. 2001;108(5):830-41" },
  ],
  "Macular Edema": [
    { systemicDisease: "Diabetes Mellitus", percentage: 70, ocularLink: "Blood-retinal barrier breakdown from chronic hyperglycemia", reference: "Bhagat N, et al. Surv Ophthalmol. 2009;54(1):1-32" },
    { systemicDisease: "Cardiovascular Disease", percentage: 30, ocularLink: "Systemic vascular permeability and inflammation", reference: "Klein R, et al. Ophthalmology. 2010;117(6):1064-77" },
  ],
};

const getSystemicAssociations = (diseases: Disease[]) => {
  const associations: { systemicDisease: string; percentage: number; ocularLink: string; reference: string; linkedOcularDisease: string }[] = [];
  
  diseases.forEach(disease => {
    const diseaseAssociations = SYSTEMIC_ASSOCIATIONS[disease.name];
    if (diseaseAssociations) {
      diseaseAssociations.forEach(assoc => {
        // Weight the systemic disease percentage by the ocular disease probability
        const weightedPercentage = Math.round((assoc.percentage * disease.probability) / 100);
        associations.push({
          ...assoc,
          percentage: weightedPercentage,
          linkedOcularDisease: disease.name,
        });
      });
    }
  });

  // Deduplicate and take highest percentage for each systemic disease
  const uniqueAssociations = associations.reduce((acc, curr) => {
    const existing = acc.find(a => a.systemicDisease === curr.systemicDisease);
    if (!existing || existing.percentage < curr.percentage) {
      return [...acc.filter(a => a.systemicDisease !== curr.systemicDisease), curr];
    }
    return acc;
  }, [] as typeof associations);

  return uniqueAssociations.sort((a, b) => b.percentage - a.percentage);
};

export function PatientReport({ patient, reportType, isEditMode, onRequestEdit }: PatientReportProps) {
  const [editedNotes, setEditedNotes] = useState<Record<string, string>>({});
  const [expandedScan, setExpandedScan] = useState<ScanAnalysis | null>(null);

  if (!patient) {
    return (
      <div style={{ 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column',
        color: '#6b7280',
      }}>
        <Stethoscope size={48} style={{ marginBottom: '16px', color: '#9ca3af' }} />
        <p style={{ fontSize: '18px' }}>Select a patient to view their report</p>
      </div>
    );
  }

  const calculateOverallRisk = (): { level: string; color: string } => {
    const allDiseases = patient.scans.flatMap(s => s.diseases);
    const maxProb = Math.max(...allDiseases.map(d => d.probability), 0);
    if (maxProb >= 70) return { level: 'High Risk', color: '#ef4444' };
    if (maxProb >= 40) return { level: 'Moderate Risk', color: '#f59e0b' };
    return { level: 'Low Risk', color: '#22c55e' };
  };

  const generateComprehensiveReport = (): Disease[] => {
    const allDiseases = patient.scans.flatMap(s => s.diseases);
    const uniqueDiseases = allDiseases.reduce((acc, d) => {
      const existing = acc.find(e => e.name === d.name);
      if (!existing || existing.probability < d.probability) {
        return [...acc.filter(e => e.name !== d.name), d];
      }
      return acc;
    }, [] as Disease[]);
    return uniqueDiseases.sort((a, b) => b.probability - a.probability);
  };

  const risk = calculateOverallRisk();
  const diseases = generateComprehensiveReport();

  const downloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFontSize(20);
    doc.setTextColor(8, 145, 178);
    doc.text("EyeQ by LucidEye", 20, 20);
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(reportType === 'doctor' ? "Medical Report (Clinical)" : "Patient Health Summary", 20, 35);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 42);

    // Patient Info
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Patient: ${patient.name}`, 20, 55);
    doc.text(`Actual Age: ${patient.age || 'N/A'} | True Age: ${calculateTrueAge(patient)} | Gender: ${patient.gender ? patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1) : 'N/A'}`, 20, 62);
    doc.text(`DOB: ${new Date(patient.dateOfBirth).toLocaleDateString()}`, 20, 69);
    doc.text(`Total Scans: ${patient.scans.length}`, 20, 76);
    doc.text(`Risk Level: ${risk.level}`, 20, 83);
    if (patient.relevantInfo) {
      doc.text(`Medical History: ${patient.relevantInfo.substring(0, 60)}${patient.relevantInfo.length > 60 ? '...' : ''}`, 20, 90);
    }

    // Diseases Table
    const tableStartY = patient.relevantInfo ? 105 : 95;
    if (diseases.length > 0) {
      doc.setFontSize(14);
      doc.text(reportType === 'doctor' ? "Clinical Findings" : "Health Findings", 20, tableStartY - 5);

      const getGradeFromProbability = (name: string, prob: number) => {
        if (name.toLowerCase().includes('diabetic retinopathy') || name.toLowerCase().includes('dr')) {
          if (prob >= 80) return 'Level 4 (Severe)';
          if (prob >= 60) return 'Level 3 (Moderate)';
          if (prob >= 40) return 'Level 2 (Mild)';
          return 'Level 1 (Minimal)';
        }
        if (name.toLowerCase().includes('glaucoma')) {
          if (prob >= 70) return 'Advanced';
          if (prob >= 40) return 'Moderate';
          return 'Early';
        }
        if (prob >= 70) return 'Severe';
        if (prob >= 40) return 'Moderate';
        return 'Mild';
      };

      const tableData = diseases.map(d => [
        d.name,
        getGradeFromProbability(d.name, d.probability),
        d.severity.toUpperCase(),
        reportType === 'doctor' 
          ? d.description 
          : d.probability >= 70 ? 'Needs attention' : d.probability >= 40 ? 'Monitor' : 'Looking good'
      ]);

      autoTable(doc, {
        startY: tableStartY,
        head: [['Condition', 'Grade', 'Severity', reportType === 'doctor' ? 'Clinical Notes' : 'Status']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [8, 145, 178] },
        styles: { fontSize: 9 },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 30 },
          2: { cellWidth: 25 },
          3: { cellWidth: 'auto' },
        },
      });
    }

    // Recommendations
    const finalY = (doc as any).lastAutoTable?.finalY || 120;
    doc.setFontSize(12);
    doc.text("Recommendations", 20, finalY + 15);
    doc.setFontSize(10);
    const recommendation = risk.level === 'High Risk' 
      ? 'Immediate specialist consultation recommended.'
      : risk.level === 'Moderate Risk'
      ? 'Follow-up appointment within 3-6 months recommended.'
      : 'Continue routine monitoring as per standard guidelines.';
    doc.text(recommendation, 20, finalY + 25);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("This report is generated by AI analysis and should be verified by a medical professional.", 20, 280);

    doc.save(`${patient.name.replace(/\s+/g, '_')}_${reportType}_report.pdf`);
  };

  if (reportType === 'doctor') {
    return (
      <div style={{ padding: '24px', overflowY: 'auto', height: '100%' }}>
        {/* Header */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '12px', 
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <Stethoscope size={28} style={{ color: '#0891b2' }} />
                <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#111' }}>Clinical Report</h2>
              </div>
              <p style={{ color: '#6b7280' }}>
                Patient: {patient.name} | Actual Age: {patient.age || 'N/A'} | True Age: {calculateTrueAge(patient)} | Gender: {patient.gender ? patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1) : 'N/A'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={onRequestEdit}
                style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: 500,
                  color: isEditMode ? '#22c55e' : '#6b7280',
                }}
              >
                {isEditMode ? <Unlock size={16} /> : <Lock size={16} />}
                {isEditMode ? 'Edit Mode' : 'View Only'}
              </button>
              <button
                onClick={downloadPDF}
                style={{
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#0891b2',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontWeight: 500,
                }}
              >
                <Download size={16} /> Download PDF
              </button>
            </div>
          </div>
          <div style={{
            marginTop: '16px',
            padding: '12px 16px',
            borderRadius: '8px',
            backgroundColor: risk.color + '15',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <AlertTriangle size={20} style={{ color: risk.color }} />
            <span style={{ fontWeight: 600, color: risk.color }}>{risk.level}</span>
            <span style={{ color: '#6b7280', marginLeft: '8px' }}>
              Based on {patient.scans.length} scan(s) analyzed
            </span>
          </div>
        </div>

        {/* Scans Overview */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '12px', 
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Camera size={20} /> Imaging Studies ({patient.scans.length})
          </h3>
          <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '12px' }}>Click on an image to expand and view associated OCT scan</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
            {patient.scans.map((scan) => (
              <div 
                key={scan.id} 
                onClick={() => setExpandedScan(scan)}
                style={{ 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '8px', 
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#0891b2';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(8, 145, 178, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
                }}
              >
                <img src={scan.imageUrl} alt={scan.name} style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
                <div style={{ padding: '10px' }}>
                  <p style={{ fontWeight: 500, fontSize: '13px' }}>{scan.name}</p>
                  <p style={{ fontSize: '11px', color: '#6b7280' }}>{scan.type.toUpperCase()} • {scan.uploadedAt.toLocaleDateString()}</p>
                  {scan.linkedOctUrl && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                      <Microscope size={12} style={{ color: '#1d4ed8' }} />
                      <span style={{ fontSize: '10px', color: '#1d4ed8', fontWeight: 500 }}>OCT Available</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expanded Scan Modal */}
        {expandedScan && (
          <div 
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.8)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px',
            }}
            onClick={() => setExpandedScan(null)}
          >
            <div 
              style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                maxWidth: '1200px',
                maxHeight: '90vh',
                width: '100%',
                overflow: 'auto',
                padding: '24px',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: 600 }}>{expandedScan.name}</h3>
                  <p style={{ fontSize: '14px', color: '#6b7280' }}>
                    {expandedScan.eyeSide ? `${expandedScan.eyeSide.charAt(0).toUpperCase() + expandedScan.eyeSide.slice(1)} Eye` : ''} 
                    {expandedScan.visitNumber ? ` • Visit ${expandedScan.visitNumber}` : ''} 
                    • {expandedScan.uploadedAt.toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => setExpandedScan(null)}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#f3f4f6',
                    cursor: 'pointer',
                  }}
                >
                  <X size={20} />
                </button>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: expandedScan.linkedOctUrl ? '1fr 1fr' : '1fr', gap: '20px', marginBottom: '20px' }}>
                {/* Fundus Image */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <Eye size={16} style={{ color: '#0891b2' }} />
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>Fundus Image</span>
                  </div>
                  <img 
                    src={expandedScan.imageUrl} 
                    alt={expandedScan.name} 
                    style={{ 
                      width: '100%', 
                      borderRadius: '8px', 
                      border: '1px solid #e5e7eb',
                      maxHeight: '400px',
                      objectFit: 'contain',
                      backgroundColor: '#000',
                    }} 
                  />
                </div>
                
                {/* OCT Image */}
                {expandedScan.linkedOctUrl && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                      <Microscope size={16} style={{ color: '#1d4ed8' }} />
                      <span style={{ fontWeight: 600, fontSize: '14px' }}>{expandedScan.linkedOctName || 'OCT Scan'}</span>
                    </div>
                    <TifImage 
                      src={expandedScan.linkedOctUrl} 
                      alt={expandedScan.linkedOctName || 'OCT Scan'} 
                      style={{ 
                        width: '100%', 
                        borderRadius: '8px', 
                        border: '1px solid #e5e7eb',
                        maxHeight: '400px',
                        objectFit: 'contain',
                        backgroundColor: '#000',
                      }} 
                    />
                  </div>
                )}
              </div>
              
              {/* Scan Summary */}
              <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', marginBottom: '16px' }}>
                <p style={{ fontWeight: 600, marginBottom: '8px' }}>Summary</p>
                <p style={{ fontSize: '14px', color: '#374151' }}>{expandedScan.summary}</p>
              </div>
              
              {/* Detected Conditions */}
              <div>
                <p style={{ fontWeight: 600, marginBottom: '12px' }}>Detected Conditions</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {expandedScan.diseases.map((disease, idx) => (
                    <div key={idx} style={{ 
                      padding: '12px 16px', 
                      borderRadius: '8px', 
                      border: '1px solid #e5e7eb',
                      backgroundColor: disease.probability >= 70 ? '#fef2f2' : disease.probability >= 40 ? '#fffbeb' : '#f0fdf4',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, fontSize: '14px' }}>{disease.name}</span>
                        <span style={{ 
                          fontWeight: 700, 
                          color: disease.probability >= 70 ? '#ef4444' : disease.probability >= 40 ? '#f59e0b' : '#22c55e',
                        }}>
                          {disease.probability}%
                        </span>
                      </div>
                      <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>{disease.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Clinical Findings */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '12px', 
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Clinical Findings</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f3f4f6' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px' }}>Condition</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px' }}>Grade</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px' }}>Severity</th>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px' }}>Notes</th>
              </tr>
            </thead>
            <tbody>
              {diseases.map((disease, idx) => {
                const getGrade = () => {
                  const name = disease.name.toLowerCase();
                  const prob = disease.probability;
                  if (name.includes('diabetic retinopathy') || name.includes('dr ')) {
                    if (prob >= 80) return 'Level 4 (Severe)';
                    if (prob >= 60) return 'Level 3 (Moderate)';
                    if (prob >= 40) return 'Level 2 (Mild)';
                    return 'Level 1 (Minimal)';
                  }
                  if (name.includes('glaucoma')) {
                    if (prob >= 70) return 'Advanced';
                    if (prob >= 40) return 'Moderate';
                    return 'Early';
                  }
                  if (prob >= 70) return 'Severe';
                  if (prob >= 40) return 'Moderate';
                  return 'Mild';
                };
                
                return (
                  <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px', fontWeight: 500, fontSize: '14px' }}>{disease.name}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ 
                        fontSize: '13px', 
                        fontWeight: 600,
                        padding: '4px 10px',
                        borderRadius: '8px',
                        backgroundColor: disease.probability >= 70 ? '#fef2f2' : disease.probability >= 40 ? '#fffbeb' : '#f0fdf4',
                        color: disease.probability >= 70 ? '#ef4444' : disease.probability >= 40 ? '#f59e0b' : '#22c55e',
                      }}>
                        {getGrade()}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '10px',
                        fontSize: '11px',
                        fontWeight: 600,
                        backgroundColor: disease.severity === 'high' ? '#fef2f2' : disease.severity === 'medium' ? '#fffbeb' : '#f0fdf4',
                        color: disease.severity === 'high' ? '#ef4444' : disease.severity === 'medium' ? '#f59e0b' : '#22c55e',
                      }}>
                        {disease.severity.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      {isEditMode ? (
                        <textarea
                          value={editedNotes[disease.name] ?? disease.description}
                          onChange={(e) => setEditedNotes({ ...editedNotes, [disease.name]: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '8px',
                            borderRadius: '6px',
                            border: '1px solid #e5e7eb',
                            fontSize: '13px',
                            minHeight: '60px',
                            resize: 'vertical',
                          }}
                        />
                      ) : (
                        <span style={{ fontSize: '13px', color: '#6b7280' }}>
                          {editedNotes[disease.name] ?? disease.description}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Systemic Disease Associations - Doctor Report */}
        {(() => {
          const systemicAssociations = getSystemicAssociations(diseases);
          if (systemicAssociations.length === 0) return null;
          return (
            <div style={{ 
              backgroundColor: 'white', 
              borderRadius: '12px', 
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Link2 size={20} style={{ color: '#0891b2' }} />
                Possible Systemic Disease Associations
              </h3>
              <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>
                Based on detected ocular conditions, the following systemic diseases may be associated. Percentages are weighted by ocular disease probability.
              </p>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f3f4f6' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px' }}>Systemic Condition</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px' }}>Risk Level</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px' }}>Linked Ocular Finding</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px' }}>Pathophysiological Link</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '13px' }}>Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {systemicAssociations.map((assoc, idx) => {
                    const isHighRisk = assoc.percentage >= 40;
                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '12px', fontWeight: 500, fontSize: '14px' }}>{assoc.systemicDisease}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ 
                            fontSize: '12px', 
                            fontWeight: 600,
                            padding: '4px 10px',
                            borderRadius: '8px',
                            backgroundColor: isHighRisk ? '#fef2f2' : '#fffbeb',
                            color: isHighRisk ? '#ef4444' : '#f59e0b',
                          }}>
                            {isHighRisk ? 'High Risk' : 'Low Risk'}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '10px',
                            fontSize: '11px',
                            fontWeight: 500,
                            backgroundColor: '#ecfeff',
                            color: '#0891b2',
                          }}>
                            {assoc.linkedOcularDisease}
                          </span>
                        </td>
                        <td style={{ padding: '12px', fontSize: '12px', color: '#6b7280', maxWidth: '200px' }}>
                          {assoc.ocularLink}
                        </td>
                        <td style={{ padding: '12px', fontSize: '11px', color: '#6b7280', fontStyle: 'italic', maxWidth: '150px' }}>
                          {assoc.reference}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })()}
      </div>
    );
  }

  // Filter out low risk diseases for patient report
  const significantDiseases = diseases.filter(d => d.probability >= 40);

  // Patient-friendly report
  return (
    <div style={{ padding: '24px', overflowY: 'auto', height: '100%' }}>
      {/* Header */}
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '12px', 
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <User size={28} style={{ color: '#0891b2' }} />
              <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#111' }}>Your Eye Health Summary</h2>
            </div>
            <p style={{ color: '#6b7280' }}>Hello, {patient.name.split(' ')[0]}! Here's an easy-to-understand overview of your eye health.</p>
            <p style={{ color: '#6b7280', marginTop: '4px', fontSize: '14px' }}>
              Actual Age: {patient.age || 'N/A'} | True Age (based on scan analysis): {calculateTrueAge(patient)}
            </p>
          </div>
          <button
            onClick={downloadPDF}
            style={{
              padding: '10px 16px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#0891b2',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 500,
            }}
          >
            <Download size={16} /> Download PDF
          </button>
        </div>
      </div>

      {/* Overall Status */}
      <div style={{ 
        backgroundColor: risk.level === 'Low Risk' ? '#f0fdf4' : risk.level === 'Moderate Risk' ? '#fffbeb' : '#fef2f2',
        borderRadius: '12px', 
        padding: '24px',
        marginBottom: '24px',
        border: `2px solid ${risk.color}20`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {risk.level === 'Low Risk' ? (
            <CheckCircle size={48} style={{ color: '#22c55e' }} />
          ) : risk.level === 'Moderate Risk' ? (
            <Clock size={48} style={{ color: '#f59e0b' }} />
          ) : (
            <AlertTriangle size={48} style={{ color: '#ef4444' }} />
          )}
          <div>
            <h3 style={{ fontSize: '22px', fontWeight: 700, color: risk.color }}>{risk.level}</h3>
            <p style={{ color: '#6b7280', marginTop: '4px' }}>
              {risk.level === 'Low Risk' 
                ? 'Great news! Your eye scans look healthy.'
                : risk.level === 'Moderate Risk'
                ? 'Some findings need monitoring. Let\'s discuss with your doctor.'
                : 'Please schedule an appointment with your eye doctor soon.'}
            </p>
          </div>
        </div>
      </div>

      {/* Findings - Only show medium and high risk */}
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '12px', 
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>What We Found</h3>
        {significantDiseases.length === 0 ? (
          <p style={{ color: '#6b7280' }}>No concerning findings detected. Keep up the great work with your eye health!</p>
        ) : (
          significantDiseases.map((disease, idx) => (
            <div key={idx} style={{ 
              padding: '16px',
              marginBottom: idx < significantDiseases.length - 1 ? '12px' : 0,
              borderRadius: '10px',
              backgroundColor: disease.probability >= 70 ? '#fef2f2' : '#fffbeb',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 600, fontSize: '16px' }}>{disease.name}</span>
                <span style={{
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: 600,
                  backgroundColor: 'white',
                  color: disease.probability >= 70 ? '#ef4444' : '#f59e0b',
                }}>
                  {disease.probability >= 70 ? '⚠️ Needs Attention' : '👀 Monitor'}
                </span>
              </div>
              <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.6 }}>
                {disease.description}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Systemic Disease Associations - Patient Report */}
      {(() => {
        const systemicAssociations = getSystemicAssociations(significantDiseases);
        if (systemicAssociations.length === 0) return null;
        return (
          <div style={{ 
            backgroundColor: 'white', 
            borderRadius: '12px', 
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link2 size={20} style={{ color: '#0891b2' }} />
              Related Health Conditions to Discuss
            </h3>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
              Your eye findings may be connected to other health conditions. Please discuss these with your doctor.
            </p>
            {systemicAssociations.slice(0, 5).map((assoc, idx) => {
              const isHighRisk = assoc.percentage >= 40;
              return (
                <div key={idx} style={{ 
                  padding: '14px',
                  marginBottom: idx < Math.min(systemicAssociations.length, 5) - 1 ? '10px' : 0,
                  borderRadius: '10px',
                  backgroundColor: isHighRisk ? '#fef2f2' : '#f8fafc',
                  border: `1px solid ${isHighRisk ? '#fecaca' : '#e2e8f0'}`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 600, fontSize: '15px', color: '#1e293b' }}>{assoc.systemicDisease}</span>
                    <span style={{
                      padding: '3px 10px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      backgroundColor: isHighRisk ? '#ef4444' : '#f59e0b',
                      color: 'white',
                    }}>
                      {isHighRisk ? 'High Risk' : 'Low Risk'}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '6px' }}>
                    <strong>Connected to:</strong> {assoc.linkedOcularDisease}
                  </p>
                  <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.5 }}>
                    {assoc.ocularLink}
                  </p>
                  <p style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic', marginTop: '6px' }}>
                    Source: {assoc.reference}
                  </p>
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* Next Steps */}
      <div style={{ 
        backgroundColor: '#ecfeff', 
        borderRadius: '12px', 
        padding: '24px',
        border: '1px solid #0891b220',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Lightbulb size={20} style={{ color: '#0891b2' }} />
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0891b2' }}>What You Should Do Next</h3>
        </div>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#374151', lineHeight: 1.8 }}>
          {risk.level === 'High Risk' && (
            <>
              <li>Schedule an appointment with your eye specialist as soon as possible</li>
              <li>Bring this report to your appointment</li>
              <li>Don't delay - early treatment is important</li>
            </>
          )}
          {risk.level === 'Moderate Risk' && (
            <>
              <li>Schedule a follow-up appointment within the next 3-6 months</li>
              <li>Keep track of any changes in your vision</li>
              <li>Share this report with your eye doctor</li>
            </>
          )}
          {risk.level === 'Low Risk' && (
            <>
              <li>Continue with regular annual eye check-ups</li>
              <li>Maintain a healthy lifestyle for good eye health</li>
              <li>Protect your eyes from UV light with sunglasses</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}