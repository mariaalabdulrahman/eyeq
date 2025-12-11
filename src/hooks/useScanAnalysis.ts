import { useState, useCallback } from "react";
import { ScanAnalysis, ChatMessage, Disease, Patient } from "@/types/scan";

const generateMockDiseases = (type: 'oct' | 'fundus'): Disease[] => {
  const octDiseases: Disease[] = [
    { name: "Diabetic Macular Edema", probability: Math.floor(Math.random() * 40) + 10, severity: 'low', description: "Fluid accumulation in the macula detected via cross-sectional imaging." },
    { name: "Age-Related Macular Degeneration", probability: Math.floor(Math.random() * 50) + 20, severity: 'medium', description: "Drusen deposits and RPE changes visible in OCT layers." },
    { name: "Epiretinal Membrane", probability: Math.floor(Math.random() * 30) + 5, severity: 'low', description: "Thin membrane on retinal surface causing mild distortion." },
    { name: "Vitreomacular Traction", probability: Math.floor(Math.random() * 25), severity: 'low', description: "Vitreous attachment causing tractional forces on macula." },
  ];

  const fundusDiseases: Disease[] = [
    { name: "Diabetic Retinopathy", probability: Math.floor(Math.random() * 45) + 15, severity: 'medium', description: "Microaneurysms and hemorrhages visible in fundus photography." },
    { name: "Glaucoma", probability: Math.floor(Math.random() * 35) + 10, severity: 'low', description: "Optic disc cupping and nerve fiber layer changes detected." },
    { name: "Hypertensive Retinopathy", probability: Math.floor(Math.random() * 30) + 5, severity: 'low', description: "Arteriovenous nicking and vessel wall changes observed." },
    { name: "Papilledema", probability: Math.floor(Math.random() * 20), severity: 'low', description: "Optic disc swelling potentially indicating increased intracranial pressure." },
  ];

  const diseases = type === 'oct' ? octDiseases : fundusDiseases;
  
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
    return `Analysis detected ${highRisk.length} condition(s) requiring immediate attention: ${highRisk.map(d => d.name).join(', ')}. Please consult with a specialist.`;
  } else if (mediumRisk.length > 0) {
    return `Analysis identified ${mediumRisk.length} condition(s) with moderate probability: ${mediumRisk.map(d => d.name).join(', ')}. Follow-up recommended.`;
  }
  return "Scan analysis complete. No significant abnormalities detected. Routine follow-up recommended.";
};

export function useScanAnalysis() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [currentPatientId, setCurrentPatientId] = useState<string | null>(null);
  const [scans, setScans] = useState<ScanAnalysis[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: 'Welcome to EyeQ! Upload OCT or Fundus scans to begin analysis. Select images when asking questions for contextual answers.',
      timestamp: new Date(),
      selectedScanIds: [],
    }
  ]);

  const addScan = useCallback((file: File, type: 'oct' | 'fundus', patientId?: string) => {
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
    };

    setScans(prev => [...prev, newScan]);
    setActiveTabId(newScan.id);

    // Add to patient record if patient selected
    if (patientId) {
      setPatients(prev => prev.map(p => 
        p.id === patientId 
          ? { ...p, scans: [...p.scans, newScan] }
          : p
      ));
    }
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

  const addPatient = useCallback((name: string, dateOfBirth: string) => {
    const newPatient: Patient = {
      id: crypto.randomUUID(),
      name,
      dateOfBirth,
      scans: [],
      createdAt: new Date(),
    };
    setPatients(prev => [...prev, newPatient]);
    return newPatient.id;
  }, []);

  const addChatMessage = useCallback((content: string, selectedScanIds: string[]) => {
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date(),
      selectedScanIds,
    };

    const selectedScans = scans.filter(s => selectedScanIds.includes(s.id));
    let aiResponse = "Please select at least one image to ask questions about.";
    
    if (selectedScans.length > 0) {
      const scanNames = selectedScans.map(s => s.name).join(', ');
      const allDiseases = selectedScans.flatMap(s => s.diseases);
      const highRisk = allDiseases.filter(d => d.probability >= 50);
      
      if (highRisk.length > 0) {
        aiResponse = `Based on the selected scans (${scanNames}), I found ${highRisk.length} conditions with elevated risk: ${highRisk.map(d => `${d.name} (${d.probability}%)`).join(', ')}. Would you like more details on any specific finding?`;
      } else {
        aiResponse = `Analyzing ${scanNames}: The scans show generally healthy patterns with some minor observations. All detected conditions are within low-risk ranges. Continue regular monitoring as recommended.`;
      }
    }

    const aiMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date(),
      selectedScanIds: [],
    };

    setChatHistory(prev => [...prev, userMessage, aiMessage]);
  }, [scans]);

  const assignScansToPatient = useCallback((patientId: string, scanIds: string[]) => {
    const scansToAssign = scans.filter(s => scanIds.includes(s.id));
    setPatients(prev => prev.map(p => 
      p.id === patientId 
        ? { ...p, scans: [...p.scans, ...scansToAssign] }
        : p
    ));
  }, [scans]);

  const activeScan = scans.find(s => s.id === activeTabId) || null;

  return {
    scans,
    patients,
    activeScan,
    activeTabId,
    chatHistory,
    currentPatientId,
    setActiveTabId,
    setCurrentPatientId,
    addScan,
    removeScan,
    addPatient,
    addChatMessage,
    assignScansToPatient,
  };
}
