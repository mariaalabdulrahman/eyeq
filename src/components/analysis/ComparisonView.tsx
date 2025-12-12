import { useState, useMemo } from "react";
import { ScanAnalysis } from "@/types/scan";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from "recharts";
import { Download } from "lucide-react";
import { TifImage } from "../TifImage";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface ComparisonViewProps {
  currentScan: ScanAnalysis;
  allScans: ScanAnalysis[];
}

type CompareMode = 'left-right' | 'progression';

// Systemic disease associations based on ocular findings
const getSystemicAssociations = (diseases: { name: string; probability: number }[]) => {
  const associations: { condition: string; relatedTo: string; description: string }[] = [];
  
  diseases.forEach(d => {
    if (d.probability < 40) return; // Only include medium/high severity
    
    if (d.name.toLowerCase().includes('diabetic')) {
      associations.push({
        condition: 'Diabetes Mellitus',
        relatedTo: d.name,
        description: 'Retinal microvascular changes indicate systemic glucose dysregulation affecting multiple organ systems.',
      });
      associations.push({
        condition: 'Cardiovascular Disease',
        relatedTo: d.name,
        description: 'Diabetic retinopathy correlates with increased risk of heart disease and stroke.',
      });
    }
    
    if (d.name.toLowerCase().includes('hypertensive') || d.name.toLowerCase().includes('hypertension')) {
      associations.push({
        condition: 'Hypertension',
        relatedTo: d.name,
        description: 'Retinal vascular changes reflect systemic hypertension status and cardiovascular risk.',
      });
      associations.push({
        condition: 'Stroke Risk',
        relatedTo: d.name,
        description: 'Hypertensive retinopathy is associated with increased cerebrovascular disease risk.',
      });
    }
    
    if (d.name.toLowerCase().includes('glaucoma')) {
      associations.push({
        condition: 'Cardiovascular Disease',
        relatedTo: d.name,
        description: 'Glaucoma shares risk factors with systemic vascular diseases including low perfusion pressure.',
      });
    }
    
    if (d.name.toLowerCase().includes('macular degeneration') || d.name.toLowerCase().includes('amd')) {
      associations.push({
        condition: 'Cardiovascular Disease',
        relatedTo: d.name,
        description: 'AMD and cardiovascular disease share common risk factors including smoking and hyperlipidemia.',
      });
    }
    
    if (d.name.toLowerCase().includes('papilledema') || d.name.toLowerCase().includes('disc edema')) {
      associations.push({
        condition: 'Intracranial Hypertension',
        relatedTo: d.name,
        description: 'Optic disc swelling may indicate elevated intracranial pressure requiring neurological evaluation.',
      });
    }
  });
  
  // Remove duplicates
  return associations.filter((v, i, a) => a.findIndex(t => t.condition === v.condition) === i);
};

export function ComparisonView({ currentScan, allScans }: ComparisonViewProps) {
  const [compareMode, setCompareMode] = useState<CompareMode>('left-right');
  const [compareScanId, setCompareScanId] = useState<string | null>(null);

  // Get scans filtered by comparison mode
  const availableCompareScans = useMemo(() => {
    if (compareMode === 'left-right') {
      // Find scans from the opposite eye on the same visit
      return allScans.filter(s => 
        s.id !== currentScan.id && 
        s.eyeSide !== currentScan.eyeSide &&
        s.visitNumber === currentScan.visitNumber
      );
    } else {
      // Find scans from the same eye on different visits
      return allScans.filter(s => 
        s.id !== currentScan.id && 
        s.eyeSide === currentScan.eyeSide &&
        s.visitNumber !== currentScan.visitNumber
      ).sort((a, b) => (a.visitNumber || 0) - (b.visitNumber || 0));
    }
  }, [allScans, currentScan, compareMode]);

  // Auto-select first available scan when mode changes
  useMemo(() => {
    if (availableCompareScans.length > 0 && !availableCompareScans.find(s => s.id === compareScanId)) {
      setCompareScanId(availableCompareScans[0].id);
    }
  }, [availableCompareScans, compareScanId]);

  const compareScan = allScans.find(s => s.id === compareScanId);

  const getColor = (probability: number) => {
    if (probability >= 70) return '#ef4444';
    if (probability >= 40) return '#f59e0b';
    return '#22c55e';
  };

  // Calculate progression data for chart
  const progressionData = useMemo(() => {
    if (!compareScan) return [];
    
    const allDiseaseNames = [...new Set([
      ...currentScan.diseases.map(d => d.name),
      ...compareScan.diseases.map(d => d.name),
    ])];

    return allDiseaseNames.map(name => {
      const current = currentScan.diseases.find(d => d.name === name);
      const compare = compareScan.diseases.find(d => d.name === name);
      
      const currentLabel = compareMode === 'progression' 
        ? `Visit ${compareScan.visitNumber || 1}` 
        : `${compareScan.eyeSide === 'left' ? 'Left' : 'Right'} Eye`;
      const selectedLabel = compareMode === 'progression'
        ? `Visit ${currentScan.visitNumber || 1}`
        : `${currentScan.eyeSide === 'left' ? 'Left' : 'Right'} Eye`;

      return {
        name: name.length > 15 ? name.substring(0, 15) + '...' : name,
        fullName: name,
        [selectedLabel]: current?.probability || 0,
        [currentLabel]: compare?.probability || 0,
        diff: (current?.probability || 0) - (compare?.probability || 0),
      };
    });
  }, [currentScan, compareScan, compareMode]);

  // Get systemic associations from both scans
  const systemicAssociations = useMemo(() => {
    const allDiseases = [
      ...currentScan.diseases,
      ...(compareScan?.diseases || []),
    ];
    return getSystemicAssociations(allDiseases);
  }, [currentScan, compareScan]);

  // Generate analysis description
  const analysisDescription = useMemo(() => {
    if (!compareScan) return '';
    
    const improvements: string[] = [];
    const worsenings: string[] = [];
    const stable: string[] = [];
    
    progressionData.forEach(d => {
      if (d.diff < -10) {
        worsenings.push(d.fullName);
      } else if (d.diff > 10) {
        improvements.push(d.fullName);
      } else {
        stable.push(d.fullName);
      }
    });

    let description = '';
    
    // Check for drusen-related conditions in AMD
    const hasDrusen = [...currentScan.diseases, ...compareScan.diseases].some(d => 
      d.name.toLowerCase().includes('macular degeneration') || 
      d.name.toLowerCase().includes('amd') ||
      d.name.toLowerCase().includes('drusen')
    );
    
    if (compareMode === 'progression') {
      if (improvements.length > 0) {
        description += `**Improvement observed** in ${improvements.join(', ')}. `;
      }
      if (worsenings.length > 0) {
        description += `**Progression detected** in ${worsenings.join(', ')} - recommend closer monitoring. `;
      }
      if (stable.length > 0 && improvements.length === 0 && worsenings.length === 0) {
        description += 'Disease markers remain stable between visits. Continue current management plan.';
      }
      
      // Add drusen-specific note for AMD cases
      if (hasDrusen) {
        description += '\n\n**Drusen Assessment:** ';
        const amdCurrent = currentScan.diseases.find(d => d.name.toLowerCase().includes('macular') || d.name.toLowerCase().includes('amd'));
        const amdCompare = compareScan.diseases.find(d => d.name.toLowerCase().includes('macular') || d.name.toLowerCase().includes('amd'));
        if (amdCurrent && amdCompare) {
          const diff = amdCurrent.probability - amdCompare.probability;
          if (diff > 10) {
            description += 'Drusen accumulation appears reduced compared to previous visit. Monitor for continued improvement.';
          } else if (diff < -10) {
            description += 'Drusen deposits may have increased. Consider OCT imaging to assess drusen volume and evaluate for progression to intermediate AMD.';
          } else {
            description += 'Drusen deposits appear stable. Continue AREDS supplementation if indicated and maintain regular monitoring.';
          }
        } else {
          description += 'Drusen presence noted - recommend baseline drusen mapping and periodic monitoring for changes in size, number, and appearance.';
        }
      }
    } else {
      if (Math.abs(progressionData.reduce((sum, d) => sum + d.diff, 0)) > 20) {
        description += '**Asymmetry detected** between eyes. ';
        if (worsenings.length > 0) {
          description += `The ${currentScan.eyeSide === 'left' ? 'right' : 'left'} eye shows higher risk for ${worsenings.join(', ')}. `;
        }
        description += 'Bilateral asymmetry may warrant further investigation.';
      } else {
        description += 'Both eyes show similar patterns. No significant bilateral asymmetry detected.';
      }
      
      // Add drusen-specific note for bilateral comparison
      if (hasDrusen) {
        description += '\n\n**Drusen Assessment:** ';
        const amdLeft = currentScan.eyeSide === 'left' 
          ? currentScan.diseases.find(d => d.name.toLowerCase().includes('macular') || d.name.toLowerCase().includes('amd'))
          : compareScan?.diseases.find(d => d.name.toLowerCase().includes('macular') || d.name.toLowerCase().includes('amd'));
        const amdRight = currentScan.eyeSide === 'right'
          ? currentScan.diseases.find(d => d.name.toLowerCase().includes('macular') || d.name.toLowerCase().includes('amd'))
          : compareScan?.diseases.find(d => d.name.toLowerCase().includes('macular') || d.name.toLowerCase().includes('amd'));
        
        if (amdLeft && amdRight) {
          const diff = Math.abs((amdLeft?.probability || 0) - (amdRight?.probability || 0));
          if (diff > 15) {
            description += 'Bilateral asymmetry in drusen distribution detected. The eye with higher drusen load should be prioritized for monitoring as fellow eye AMD risk is elevated.';
          } else {
            description += 'Drusen appear relatively symmetric between eyes. Both eyes should be monitored equally for progression.';
          }
        } else if (amdLeft || amdRight) {
          description += 'Unilateral drusen detected - the unaffected eye has elevated risk and should be carefully monitored.';
        }
      }
    }
    
    return description;
  }, [progressionData, compareScan, compareMode, currentScan]);

  // Download comparison as PDF with images
  const downloadComparisonPDF = async () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(8, 145, 178);
    doc.text("EyeQ by LucidEye", 20, 20);
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("Scan Comparison Report", 20, 35);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 42);
    
    // Comparison Type
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Comparison Type: ${compareMode === 'left-right' ? 'Left vs Right Eye (Same Visit)' : 'Same Eye (Different Visits)'}`, 20, 55);
    
    // Scans Info
    doc.text(`Current Scan: ${currentScan.name}${currentScan.visitNumber ? ` (Visit ${currentScan.visitNumber})` : ''}`, 20, 65);
    if (compareScan) {
      doc.text(`Compare Scan: ${compareScan.name}${compareScan.visitNumber ? ` (Visit ${compareScan.visitNumber})` : ''}`, 20, 72);
    }

    // Add images side by side
    let imageY = 82;
    try {
      // Helper to load image as base64
      const loadImageAsBase64 = (url: string): Promise<string> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/jpeg', 0.8));
          };
          img.onerror = reject;
          img.src = url;
        });
      };

      const imgWidth = 80;
      const imgHeight = 60;

      // Current scan image
      if (currentScan.imageUrl) {
        try {
          const imgData = await loadImageAsBase64(currentScan.imageUrl);
          doc.addImage(imgData, 'JPEG', 20, imageY, imgWidth, imgHeight);
          doc.setFontSize(9);
          doc.text(currentScan.name, 20, imageY + imgHeight + 5);
        } catch (e) {
          console.log('Could not load current scan image');
        }
      }

      // Compare scan image
      if (compareScan?.imageUrl) {
        try {
          const imgData = await loadImageAsBase64(compareScan.imageUrl);
          doc.addImage(imgData, 'JPEG', 110, imageY, imgWidth, imgHeight);
          doc.setFontSize(9);
          doc.text(compareScan.name, 110, imageY + imgHeight + 5);
        } catch (e) {
          console.log('Could not load compare scan image');
        }
      }

      imageY += imgHeight + 15;
    } catch (e) {
      console.log('Error loading images:', e);
    }
    
    // Disease Comparison Table
    if (progressionData.length > 0) {
      doc.setFontSize(14);
      doc.text("Disease Comparison", 20, imageY + 5);
      
      const compareLabel = compareMode === 'progression' 
        ? `Visit ${compareScan?.visitNumber || 1}` 
        : `${compareScan?.eyeSide === 'left' ? 'Left' : 'Right'} Eye`;
      const currentLabel = compareMode === 'progression'
        ? `Visit ${currentScan.visitNumber || 1}`
        : `${currentScan.eyeSide === 'left' ? 'Left' : 'Right'} Eye`;
      
      autoTable(doc, {
        startY: imageY + 10,
        head: [['Condition', currentLabel, compareLabel, 'Difference']],
        body: progressionData.map(d => [
          d.fullName,
          `${d[currentLabel] || 0}%`,
          `${d[compareLabel] || 0}%`,
          `${d.diff > 0 ? '+' : ''}${d.diff}%`,
        ]),
        theme: 'striped',
        headStyles: { fillColor: [8, 145, 178] },
      });
    }
    
    // Analysis Summary
    const finalY1 = (doc as any).lastAutoTable?.finalY || imageY + 50;
    doc.setFontSize(12);
    doc.text("Analysis Summary", 20, finalY1 + 15);
    doc.setFontSize(10);
    const summaryText = analysisDescription.replace(/\*\*/g, '');
    const splitText = doc.splitTextToSize(summaryText, 170);
    doc.text(splitText, 20, finalY1 + 25);
    
    // Systemic Conditions
    if (systemicAssociations.length > 0) {
      const textHeight = splitText.length * 5;
      let systY = finalY1 + 30 + textHeight;
      
      if (systY > 250) {
        doc.addPage();
        systY = 20;
      }
      
      doc.setFontSize(12);
      doc.text("Possible Systemic Conditions", 20, systY);
      
      autoTable(doc, {
        startY: systY + 5,
        head: [['Condition', 'Related To', 'Description']],
        body: systemicAssociations.map(a => [a.condition, a.relatedTo, a.description]),
        theme: 'striped',
        headStyles: { fillColor: [245, 158, 11] },
        columnStyles: {
          2: { cellWidth: 80 },
        },
      });
    }
    
    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text("This report is generated by AI analysis and should be verified by a medical professional.", 20, 285);
    }
    
    doc.save(`scan_comparison_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto' }}>
      {/* Mode Selector */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        backgroundColor: 'white', 
        border: '1px solid #e5e7eb', 
        borderRadius: '12px', 
        padding: '16px' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: 500 }}>Compare:</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setCompareMode('left-right')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: compareMode === 'left-right' ? '2px solid #0891b2' : '1px solid #e5e7eb',
              backgroundColor: compareMode === 'left-right' ? '#ecfeff' : 'white',
              color: compareMode === 'left-right' ? '#0891b2' : '#6b7280',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500,
            }}
          >
            Left vs Right Eye (Same Visit)
          </button>
          <button
            onClick={() => setCompareMode('progression')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: compareMode === 'progression' ? '2px solid #0891b2' : '1px solid #e5e7eb',
              backgroundColor: compareMode === 'progression' ? '#ecfeff' : 'white',
              color: compareMode === 'progression' ? '#0891b2' : '#6b7280',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500,
            }}
          >
            Same Eye (Different Visits)
          </button>
        </div>

        {availableCompareScans.length > 0 && (
          <>
            <div style={{ width: '1px', height: '24px', backgroundColor: '#e5e7eb' }} />
            <select
              value={compareScanId || ''}
              onChange={(e) => setCompareScanId(e.target.value || null)}
              style={{
                backgroundColor: '#f3f4f6',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '14px',
                border: '1px solid #e5e7eb',
                outline: 'none',
              }}
            >
              {availableCompareScans.map(scan => (
                <option key={scan.id} value={scan.id}>
                  {scan.name} {scan.visitNumber ? `(Visit ${scan.visitNumber})` : ''}
                </option>
              ))}
            </select>
          </>
        )}
        </div>
        
        {/* Export PDF Button */}
        <button
          onClick={downloadComparisonPDF}
          disabled={!compareScan}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: compareScan ? '#0891b2' : '#d1d5db',
            color: 'white',
            cursor: compareScan ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontWeight: 500,
            fontSize: '13px',
          }}
        >
          <Download size={16} /> Export PDF
        </button>
      </div>

      {/* Comparison Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Current Scan */}
        <div style={{ 
          backgroundColor: 'white', 
          border: '2px solid #0891b2', 
          borderRadius: '12px', 
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <h3 style={{ fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0891b2' }} />
            {currentScan.name}
            {currentScan.visitNumber && (
              <span style={{ fontSize: '11px', padding: '2px 8px', backgroundColor: '#f3e8ff', color: '#7c3aed', borderRadius: '10px' }}>
                Visit {currentScan.visitNumber}
              </span>
            )}
          </h3>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: '8px',
            alignItems: 'stretch', 
            justifyContent: 'center', 
            backgroundColor: '#f3f4f6', 
            borderRadius: '8px', 
            marginBottom: '16px',
            padding: '8px',
            minHeight: '180px',
          }}>
            <div style={{ fontSize: '12px', fontWeight: 500, color: '#4b5563', marginBottom: '4px' }}>
              Fundus
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <img
                src={currentScan.imageUrl}
                alt={currentScan.name}
                style={{ maxWidth: '100%', maxHeight: '160px', objectFit: 'contain' }}
              />
            </div>
            {currentScan.linkedOctUrl && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ fontSize: '12px', fontWeight: 500, color: '#4b5563', marginBottom: '4px' }}>
                  {currentScan.linkedOctName || 'OCT Scan'}
                </div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <TifImage
                    src={currentScan.linkedOctUrl}
                    alt={currentScan.linkedOctName || 'OCT Scan'}
                    style={{ maxWidth: '100%', maxHeight: '160px', objectFit: 'contain' }}
                  />
                </div>
              </div>
            )}
          </div>
          <div style={{ overflowY: 'auto', maxHeight: '150px' }}>
            {currentScan.diseases.map((disease, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', padding: '4px 0' }}>
                <span style={{ color: '#6b7280' }}>{disease.name}</span>
                <span style={{ fontWeight: 600, fontFamily: 'monospace', color: getColor(disease.probability) }}>
                  {disease.probability}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Compare Scan */}
        {compareScan ? (
          <div style={{ 
            backgroundColor: 'white', 
            border: '1px solid #e5e7eb', 
            borderRadius: '12px', 
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <h3 style={{ fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#6b7280' }} />
              {compareScan.name}
              {compareScan.visitNumber && (
                <span style={{ fontSize: '11px', padding: '2px 8px', backgroundColor: '#f3e8ff', color: '#7c3aed', borderRadius: '10px' }}>
                  Visit {compareScan.visitNumber}
                </span>
              )}
            </h3>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              gap: '8px',
              alignItems: 'stretch', 
              justifyContent: 'center', 
              backgroundColor: '#f3f4f6', 
              borderRadius: '8px', 
              marginBottom: '16px',
              padding: '8px',
              minHeight: '180px',
            }}>
              <div style={{ fontSize: '12px', fontWeight: 500, color: '#4b5563', marginBottom: '4px' }}>
                Fundus
              </div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <img
                  src={compareScan.imageUrl}
                  alt={compareScan.name}
                  style={{ maxWidth: '100%', maxHeight: '160px', objectFit: 'contain' }}
                />
              </div>
              {compareScan.linkedOctUrl && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 500, color: '#4b5563', marginBottom: '4px' }}>
                    {compareScan.linkedOctName || 'OCT Scan'}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <TifImage
                      src={compareScan.linkedOctUrl}
                      alt={compareScan.linkedOctName || 'OCT Scan'}
                      style={{ maxWidth: '100%', maxHeight: '160px', objectFit: 'contain' }}
                    />
                  </div>
                </div>
              )}
            </div>
            <div style={{ overflowY: 'auto', maxHeight: '150px' }}>
              {compareScan.diseases.map((disease, i) => {
                const currentDisease = currentScan.diseases.find(d => d.name === disease.name);
                const diff = currentDisease ? disease.probability - currentDisease.probability : 0;
                
                return (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', padding: '4px 0' }}>
                    <span style={{ color: '#6b7280' }}>{disease.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 600, fontFamily: 'monospace', color: getColor(disease.probability) }}>
                        {disease.probability}%
                      </span>
                      {diff !== 0 && (
                        <span style={{ fontSize: '12px', fontFamily: 'monospace', color: diff > 0 ? '#ef4444' : '#22c55e' }}>
                          ({diff > 0 ? '+' : ''}{diff}%)
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div style={{ 
            backgroundColor: 'white', 
            border: '2px dashed #e5e7eb', 
            borderRadius: '12px', 
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
          }}>
            <span style={{ fontSize: '48px', marginBottom: '16px' }}>⚖️</span>
            <h3 style={{ fontWeight: 600, marginBottom: '8px' }}>No Comparison Available</h3>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>
              {compareMode === 'left-right' 
                ? 'Upload a scan of the opposite eye from the same visit'
                : 'Upload another scan of the same eye from a different visit'}
            </p>
          </div>
        )}
      </div>

      {/* Progression Chart */}
      {compareScan && progressionData.length > 0 && (
        <div style={{ 
          backgroundColor: 'white', 
          border: '1px solid #e5e7eb', 
          borderRadius: '12px', 
          padding: '16px',
        }}>
          <h3 style={{ fontWeight: 600, marginBottom: '16px' }}>
            {compareMode === 'progression' ? 'Disease Progression Chart' : 'Bilateral Comparison Chart'}
          </h3>
          <div style={{ height: '250px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={progressionData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} unit="%" />
                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value: number, name: string) => [`${value}%`, name]}
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Legend />
                <Bar 
                  dataKey={compareMode === 'progression' ? `Visit ${currentScan.visitNumber || 1}` : `${currentScan.eyeSide === 'left' ? 'Left' : 'Right'} Eye`}
                  fill="#0891b2" 
                  radius={[0, 4, 4, 0]}
                />
                <Bar 
                  dataKey={compareMode === 'progression' ? `Visit ${compareScan.visitNumber || 1}` : `${compareScan.eyeSide === 'left' ? 'Left' : 'Right'} Eye`}
                  fill="#94a3b8" 
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Analysis Description */}
          <div style={{ 
            marginTop: '16px', 
            padding: '12px', 
            backgroundColor: '#f8fafc', 
            borderRadius: '8px',
            borderLeft: '4px solid #0891b2',
          }}>
            <h4 style={{ fontWeight: 600, marginBottom: '8px', fontSize: '14px' }}>Analysis Summary</h4>
            <p style={{ fontSize: '13px', color: '#4b5563', lineHeight: 1.6 }}
              dangerouslySetInnerHTML={{ 
                __html: analysisDescription
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              }} 
            />
          </div>
        </div>
      )}

      {/* Systemic Conditions */}
      {systemicAssociations.length > 0 && (
        <div style={{ 
          backgroundColor: 'white', 
          border: '1px solid #e5e7eb', 
          borderRadius: '12px', 
          padding: '16px',
        }}>
          <h3 style={{ fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>🩺</span>
            Possible Systemic Conditions
          </h3>
          <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '12px' }}>
            Based on detected ocular findings with medium-to-high severity (≥40%)
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {systemicAssociations.map((assoc, i) => (
              <div key={i} style={{ 
                padding: '12px', 
                backgroundColor: '#fef3c7', 
                borderRadius: '8px',
                borderLeft: '4px solid #f59e0b',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600, color: '#92400e' }}>{assoc.condition}</span>
                  <span style={{ fontSize: '11px', color: '#6b7280', backgroundColor: 'white', padding: '2px 8px', borderRadius: '10px' }}>
                    Related to: {assoc.relatedTo}
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: '#78350f' }}>{assoc.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}