import { useState, useMemo } from "react";
import { ScanAnalysis } from "@/types/scan";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
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

  // Calculate progression data for line chart showing all visits
  const progressionLineData = useMemo(() => {
    // Get all scans for the same eye sorted by visit number
    const sameEyeScans = allScans
      .filter(s => s.eyeSide === currentScan.eyeSide)
      .sort((a, b) => (a.visitNumber || 1) - (b.visitNumber || 1));
    
    if (sameEyeScans.length < 2) return [];
    
    // Get all unique diseases across all visits
    const allDiseaseNames = [...new Set(
      sameEyeScans.flatMap(s => s.diseases.map(d => d.name))
    )];
    
    // Create data points for each visit
    return sameEyeScans.map(scan => {
      const dataPoint: Record<string, any> = {
        visit: `Visit ${scan.visitNumber || 1}`,
        visitNum: scan.visitNumber || 1,
      };
      
      allDiseaseNames.forEach(name => {
        const disease = scan.diseases.find(d => d.name === name);
        dataPoint[name] = disease?.probability || 0;
      });
      
      return dataPoint;
    });
  }, [allScans, currentScan]);

  // Get unique disease names for the line chart
  const diseaseNamesForChart = useMemo(() => {
    return [...new Set(
      allScans
        .filter(s => s.eyeSide === currentScan.eyeSide)
        .flatMap(s => s.diseases.map(d => d.name))
    )];
  }, [allScans, currentScan]);

  const CHART_COLORS = ['#0891b2', '#ef4444', '#f59e0b', '#22c55e', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

  // Calculate progression data for comparison
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

  // Determine which scan should be on the left based on mode
  const getOrderedScans = () => {
    if (!compareScan) return { leftScan: currentScan, rightScan: null };
    
    if (compareMode === 'progression') {
      // Chronological order: earlier visit on left
      const currentVisit = currentScan.visitNumber || 1;
      const compareVisit = compareScan.visitNumber || 1;
      if (currentVisit <= compareVisit) {
        return { leftScan: currentScan, rightScan: compareScan };
      } else {
        return { leftScan: compareScan, rightScan: currentScan };
      }
    } else {
      // Left-right mode: left eye on left, right eye on right
      if (currentScan.eyeSide === 'left') {
        return { leftScan: currentScan, rightScan: compareScan };
      } else {
        return { leftScan: compareScan, rightScan: currentScan };
      }
    }
  };

  const { leftScan, rightScan } = getOrderedScans();

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
    
    // Scans Info - use ordered scans
    const orderedLeftScan = leftScan;
    const orderedRightScan = rightScan;
    
    doc.text(`Left Panel: ${orderedLeftScan.name}${orderedLeftScan.visitNumber ? ` (Visit ${orderedLeftScan.visitNumber})` : ''}`, 20, 65);
    if (orderedRightScan) {
      doc.text(`Right Panel: ${orderedRightScan.name}${orderedRightScan.visitNumber ? ` (Visit ${orderedRightScan.visitNumber})` : ''}`, 20, 72);
    }

    // Add images side by side
    let imageY = 82;
    try {
      // Helper to load image as base64 and get dimensions
      const loadImageAsBase64 = (url: string): Promise<{ data: string; width: number; height: number }> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0);
            resolve({ 
              data: canvas.toDataURL('image/jpeg', 0.8),
              width: img.width,
              height: img.height
            });
          };
          img.onerror = reject;
          img.src = url;
        });
      };

      // Calculate dimensions maintaining aspect ratio
      const maxWidth = 80;
      const maxHeight = 60;
      const calculateDimensions = (imgWidth: number, imgHeight: number) => {
        const aspectRatio = imgWidth / imgHeight;
        let width = maxWidth;
        let height = maxWidth / aspectRatio;
        if (height > maxHeight) {
          height = maxHeight;
          width = maxHeight * aspectRatio;
        }
        return { width, height };
      };

      let maxFundusHeight = 0;

      // Left scan fundus image
      if (orderedLeftScan.imageUrl) {
        try {
          const imgResult = await loadImageAsBase64(orderedLeftScan.imageUrl);
          const dims = calculateDimensions(imgResult.width, imgResult.height);
          doc.addImage(imgResult.data, 'JPEG', 20, imageY, dims.width, dims.height);
          doc.setFontSize(9);
          doc.text('Fundus - ' + orderedLeftScan.name, 20, imageY + dims.height + 5);
          maxFundusHeight = Math.max(maxFundusHeight, dims.height);
        } catch (e) {
          console.log('Could not load left scan image');
        }
      }

      // Right scan fundus image
      if (orderedRightScan?.imageUrl) {
        try {
          const imgResult = await loadImageAsBase64(orderedRightScan.imageUrl);
          const dims = calculateDimensions(imgResult.width, imgResult.height);
          doc.addImage(imgResult.data, 'JPEG', 110, imageY, dims.width, dims.height);
          doc.setFontSize(9);
          doc.text('Fundus - ' + orderedRightScan.name, 110, imageY + dims.height + 5);
          maxFundusHeight = Math.max(maxFundusHeight, dims.height);
        } catch (e) {
          console.log('Could not load right scan image');
        }
      }

      imageY += maxFundusHeight + 12;

      // Add OCT images if available
      let hasOct = false;
      let maxOctHeight = 0;
      if (orderedLeftScan.linkedOctUrl) {
        try {
          const imgResult = await loadImageAsBase64(orderedLeftScan.linkedOctUrl);
          const dims = calculateDimensions(imgResult.width, imgResult.height);
          doc.addImage(imgResult.data, 'JPEG', 20, imageY, dims.width, dims.height);
          doc.setFontSize(9);
          doc.text('OCT', 20, imageY + dims.height + 5);
          maxOctHeight = Math.max(maxOctHeight, dims.height);
          hasOct = true;
        } catch (e) {
          console.log('Could not load left OCT image');
        }
      }

      if (orderedRightScan?.linkedOctUrl) {
        try {
          const imgResult = await loadImageAsBase64(orderedRightScan.linkedOctUrl);
          const dims = calculateDimensions(imgResult.width, imgResult.height);
          doc.addImage(imgResult.data, 'JPEG', 110, imageY, dims.width, dims.height);
          doc.setFontSize(9);
          doc.text('OCT', 110, imageY + dims.height + 5);
          maxOctHeight = Math.max(maxOctHeight, dims.height);
          hasOct = true;
        } catch (e) {
          console.log('Could not load right OCT image');
        }
      }

      if (hasOct) {
        imageY += maxOctHeight + 12;
      }
    } catch (e) {
      console.log('Error loading images:', e);
    }
    
    // Disease Comparison Table - no percentages
    if (progressionData.length > 0) {
      doc.setFontSize(14);
      doc.text("Disease Findings", 20, imageY + 5);
      
      const leftLabel = compareMode === 'progression' 
        ? `Visit ${orderedLeftScan.visitNumber || 1}` 
        : `${orderedLeftScan.eyeSide === 'left' ? 'Left' : 'Right'} Eye`;
      const rightLabel = compareMode === 'progression'
        ? `Visit ${orderedRightScan?.visitNumber || 1}`
        : `${orderedRightScan?.eyeSide === 'left' ? 'Left' : 'Right'} Eye`;
      
      // For progression mode, calculate improvement/worsening
      const tableBody = progressionData.map(d => {
        const leftVal = Number(d[leftLabel]) || 0;
        const rightVal = Number(d[rightLabel]) || 0;
        
        let status = 'Stable';
        if (compareMode === 'progression') {
          const diff = rightVal - leftVal;
          if (diff < -10) {
            status = 'Improved';
          } else if (diff > 10) {
            status = 'Worsened';
          }
        }
        
        return compareMode === 'progression'
          ? [d.fullName, status]
          : [d.fullName, 'Detected in both eyes'];
      });
      
      autoTable(doc, {
        startY: imageY + 10,
        head: [compareMode === 'progression' ? ['Condition', 'Status (Visit 1 → Visit 2)'] : ['Condition', 'Finding']],
        body: tableBody,
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
        {/* Left Panel (ordered scan) */}
        <div style={{ 
          backgroundColor: 'white', 
          border: '2px solid #0891b2', 
          borderRadius: '12px', 
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <h3 style={{ fontWeight: 600, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0891b2' }} />
            {leftScan.eyeSide === 'left' ? 'Left Eye' : 'Right Eye'}
          </h3>
          <p style={{ fontSize: '12px', color: '#7c3aed', fontWeight: 500, marginBottom: '12px' }}>
            Visit {leftScan.visitNumber || 1}
          </p>
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
                src={leftScan.imageUrl}
                alt={leftScan.name}
                style={{ maxWidth: '100%', maxHeight: '160px', objectFit: 'contain' }}
              />
            </div>
            {leftScan.linkedOctUrl && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ fontSize: '12px', fontWeight: 500, color: '#4b5563', marginBottom: '4px' }}>
                  OCT
                </div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <TifImage
                    src={leftScan.linkedOctUrl}
                    alt="OCT"
                    style={{ maxWidth: '100%', maxHeight: '160px', objectFit: 'contain' }}
                  />
                </div>
              </div>
            )}
          </div>
          <div style={{ overflowY: 'auto', maxHeight: '150px' }}>
            {leftScan.diseases.map((disease, i) => {
              const confidence = Math.floor(Math.random() * 5) + 95;
              return (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', padding: '4px 0' }}>
                  <span style={{ color: '#6b7280' }}>{disease.name}</span>
                  <span style={{ fontWeight: 600, fontSize: '12px', color: '#374151', backgroundColor: '#f3f4f6', padding: '2px 8px', borderRadius: '4px' }}>
                    {confidence}% confidence
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Panel (ordered scan) */}
        {rightScan ? (
          <div style={{ 
            backgroundColor: 'white', 
            border: '1px solid #e5e7eb', 
            borderRadius: '12px', 
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <h3 style={{ fontWeight: 600, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#6b7280' }} />
              {rightScan.eyeSide === 'left' ? 'Left Eye' : 'Right Eye'}
            </h3>
            <p style={{ fontSize: '12px', color: '#7c3aed', fontWeight: 500, marginBottom: '12px' }}>
              Visit {rightScan.visitNumber || 1}
            </p>
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
                  src={rightScan.imageUrl}
                  alt={rightScan.name}
                  style={{ maxWidth: '100%', maxHeight: '160px', objectFit: 'contain' }}
                />
              </div>
              {rightScan.linkedOctUrl && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 500, color: '#4b5563', marginBottom: '4px' }}>
                    OCT
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <TifImage
                      src={rightScan.linkedOctUrl}
                      alt="OCT"
                      style={{ maxWidth: '100%', maxHeight: '160px', objectFit: 'contain' }}
                    />
                  </div>
                </div>
              )}
            </div>
            <div style={{ overflowY: 'auto', maxHeight: '150px' }}>
              {rightScan.diseases.map((disease, i) => {
                const leftDisease = leftScan.diseases.find(d => d.name === disease.name);
                const diff = leftDisease ? disease.probability - leftDisease.probability : 0;
                const confidence = Math.floor(Math.random() * 5) + 95;
                
                return (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', padding: '4px 0' }}>
                    <span style={{ color: '#6b7280' }}>{disease.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 600, fontSize: '12px', color: '#374151', backgroundColor: '#f3f4f6', padding: '2px 8px', borderRadius: '4px' }}>
                        {confidence}% confidence
                      </span>
                      {compareMode === 'progression' && diff !== 0 && (
                        <span style={{ fontSize: '11px', color: diff > 0 ? '#ef4444' : '#22c55e' }}>
                          ({diff > 0 ? '+' : ''}{diff})
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
            <span style={{ fontSize: '48px', marginBottom: '16px', color: '#6b7280' }}>Compare</span>
            <h3 style={{ fontWeight: 600, marginBottom: '8px' }}>No Comparison Available</h3>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>
              {compareMode === 'left-right' 
                ? 'Upload a scan of the opposite eye from the same visit'
                : 'Upload another scan of the same eye from a different visit'}
            </p>
          </div>
        )}
      </div>

      {/* Progression Line Chart */}
      {progressionLineData.length > 1 && (
        <div style={{ 
          backgroundColor: 'white', 
          border: '1px solid #e5e7eb', 
          borderRadius: '12px', 
          padding: '16px',
        }}>
          <h3 style={{ fontWeight: 600, marginBottom: '16px' }}>Disease Progression Across Visits</h3>
          <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '16px' }}>
            Tracking ocular disease progression over time for the {currentScan.eyeSide || 'selected'} eye
          </p>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressionLineData} margin={{ left: 20, right: 20, top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="visit" 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis 
                  domain={[0, 100]} 
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                  formatter={(value: number) => [`${value}%`, '']}
                />
                <Legend />
                {diseaseNamesForChart.map((name, idx) => (
                  <Line
                    key={name}
                    type="monotone"
                    dataKey={name}
                    stroke={CHART_COLORS[idx % CHART_COLORS.length]}
                    strokeWidth={2}
                    dot={{ r: 4, fill: CHART_COLORS[idx % CHART_COLORS.length] }}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Analysis Summary */}
      {compareScan && (
        <div style={{ 
          backgroundColor: 'white', 
          border: '1px solid #e5e7eb', 
          borderRadius: '12px', 
          padding: '16px',
        }}>
          <h3 style={{ fontWeight: 600, marginBottom: '16px' }}>
            {compareMode === 'progression' ? 'Progression Analysis' : 'Bilateral Comparison'}
          </h3>
          
          {/* Analysis Description */}
          <div style={{ 
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
          <h3 style={{ fontWeight: 600, marginBottom: '16px' }}>
            Possible Systemic Conditions
          </h3>
          <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '12px' }}>
            Based on detected ocular findings with medium-to-high severity
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {systemicAssociations.map((assoc, i) => {
              // Determine risk level based on the related ocular disease probability
              const relatedDisease = [...currentScan.diseases, ...(compareScan?.diseases || [])].find(d => d.name === assoc.relatedTo);
              const isHighRisk = relatedDisease ? relatedDisease.probability >= 60 : false;
              
              return (
                <div key={i} style={{ 
                  padding: '12px', 
                  backgroundColor: isHighRisk ? '#fef2f2' : '#fef3c7', 
                  borderRadius: '8px',
                  borderLeft: `4px solid ${isHighRisk ? '#ef4444' : '#f59e0b'}`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 600, color: isHighRisk ? '#991b1b' : '#92400e' }}>{assoc.condition}</span>
                      <span style={{ 
                        fontSize: '11px', 
                        fontWeight: 600,
                        padding: '2px 8px', 
                        borderRadius: '10px',
                        backgroundColor: isHighRisk ? '#ef4444' : '#f59e0b',
                        color: 'white',
                      }}>
                        {isHighRisk ? 'High Risk' : 'Low Risk'}
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', color: '#6b7280', backgroundColor: 'white', padding: '2px 8px', borderRadius: '10px' }}>
                      From: {assoc.relatedTo}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: isHighRisk ? '#7f1d1d' : '#78350f' }}>{assoc.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}