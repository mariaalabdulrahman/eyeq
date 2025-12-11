import { useState, useCallback } from "react";
import { ScanAnalysis, ChatMessage, Disease } from "@/types/scan";

// Mock disease data for demo
const generateMockDiseases = (type: 'eye' | 'ultrasound'): Disease[] => {
  const eyeDiseases: Disease[] = [
    { name: "Diabetic Retinopathy", probability: Math.floor(Math.random() * 40) + 10, severity: 'low', description: "Early signs of diabetic damage to retinal blood vessels. Regular monitoring recommended." },
    { name: "Glaucoma", probability: Math.floor(Math.random() * 30) + 5, severity: 'low', description: "Optic nerve shows minimal changes. Baseline measurement established for future comparison." },
    { name: "Macular Degeneration", probability: Math.floor(Math.random() * 50) + 20, severity: 'medium', description: "Some drusen deposits detected in macular region. Follow-up recommended in 6 months." },
    { name: "Cataracts", probability: Math.floor(Math.random() * 25), severity: 'low', description: "Lens clarity within normal range. No significant opacity detected." },
  ];

  const ultrasoundDiseases: Disease[] = [
    { name: "Tissue Abnormality", probability: Math.floor(Math.random() * 35) + 15, severity: 'medium', description: "Irregular tissue density detected. Further imaging may be warranted." },
    { name: "Cyst Formation", probability: Math.floor(Math.random() * 20) + 5, severity: 'low', description: "Small fluid-filled structure identified. Likely benign, monitoring suggested." },
    { name: "Inflammation Markers", probability: Math.floor(Math.random() * 45) + 25, severity: 'medium', description: "Increased echogenicity suggesting possible inflammatory process." },
    { name: "Structural Anomaly", probability: Math.floor(Math.random() * 15), severity: 'low', description: "Minor anatomical variation observed. Within normal limits." },
  ];

  const diseases = type === 'eye' ? eyeDiseases : ultrasoundDiseases;
  
  // Randomly select 2-4 diseases and adjust severity based on probability
  return diseases
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.floor(Math.random() * 3) + 2)
    .map(d => ({
      ...d,
      severity: d.probability >= 70 ? 'high' : d.probability >= 40 ? 'medium' : 'low' as const,
    }));
};

const generateSummary = (diseases: Disease[]): string => {
  const highRisk = diseases.filter(d => d.probability >= 70);
  const mediumRisk = diseases.filter(d => d.probability >= 40 && d.probability < 70);
  
  if (highRisk.length > 0) {
    return `Analysis detected ${highRisk.length} condition(s) requiring immediate attention: ${highRisk.map(d => d.name).join(', ')}. Please consult with a specialist for further evaluation and treatment options.`;
  } else if (mediumRisk.length > 0) {
    return `Analysis identified ${mediumRisk.length} condition(s) with moderate probability: ${mediumRisk.map(d => d.name).join(', ')}. Regular monitoring and follow-up examination recommended within 3-6 months.`;
  }
  return "Scan analysis complete. No significant abnormalities detected. All measurements within normal parameters. Routine follow-up recommended as per standard care guidelines.";
};

export function useScanAnalysis() {
  const [scans, setScans] = useState<ScanAnalysis[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  const addScan = useCallback((file: File, type: 'eye' | 'ultrasound') => {
    const imageUrl = URL.createObjectURL(file);
    const diseases = generateMockDiseases(type);
    
    const newScan: ScanAnalysis = {
      id: crypto.randomUUID(),
      name: file.name.replace(/\.[^/.]+$/, ""),
      imageUrl,
      uploadedAt: new Date(),
      type,
      diseases,
      summary: generateSummary(diseases),
      chatHistory: [
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `I've analyzed your ${type === 'eye' ? 'eye scan' : 'ultrasound'} image. ${generateSummary(diseases)} Feel free to ask me any questions about the findings.`,
          timestamp: new Date(),
        }
      ],
    };

    setScans(prev => [...prev, newScan]);
    setActiveTabId(newScan.id);
  }, []);

  const removeScan = useCallback((id: string) => {
    setScans(prev => {
      const newScans = prev.filter(s => s.id !== id);
      if (activeTabId === id) {
        setActiveTabId(newScans[0]?.id || null);
      }
      return newScans;
    });
  }, [activeTabId]);

  const addChatMessage = useCallback((scanId: string, content: string) => {
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    // Simulate AI response
    const aiResponses = [
      "Based on the scan analysis, I can see that the detected conditions are within manageable ranges. Regular monitoring would be beneficial.",
      "The imaging shows some areas of interest that warrant attention. I'd recommend discussing these findings with your healthcare provider.",
      "Looking at the probability scores, the analysis suggests a relatively healthy baseline with some minor observations to note.",
      "The scan quality is good and allows for detailed analysis. The highlighted regions indicate areas where the AI detected potential markers.",
      "Comparing this to typical findings, the results show some deviation from baseline that should be monitored over time.",
    ];

    const aiMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: aiResponses[Math.floor(Math.random() * aiResponses.length)],
      timestamp: new Date(),
    };

    setScans(prev => prev.map(scan => {
      if (scan.id === scanId) {
        return {
          ...scan,
          chatHistory: [...scan.chatHistory, userMessage, aiMessage],
        };
      }
      return scan;
    }));
  }, []);

  const activeScan = scans.find(s => s.id === activeTabId) || null;

  return {
    scans,
    activeScan,
    activeTabId,
    setActiveTabId,
    addScan,
    removeScan,
    addChatMessage,
  };
}
