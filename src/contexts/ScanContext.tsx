import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { ScanAnalysis, ChatMessage, Disease, Patient } from "@/types/scan";
import { getImagePreviewUrl } from "@/lib/tifUtils";

const STORAGE_KEY = 'eyeq_patients';
const SCANS_STORAGE_KEY = 'eyeq_scans';

const generateMockDiseases = (hasOct: boolean): Disease[] => {
  const fundusDiseases: Disease[] = [
    { 
      name: "Diabetic Retinopathy", 
      probability: Math.floor(Math.random() * 45) + 15, 
      severity: 'medium', 
      description: "Microaneurysms and hemorrhages visible in fundus photography.",
      detectedFrom: 'fundus',
      justification: "The AI detected multiple microaneurysms and dot-blot hemorrhages in the posterior pole region of the fundus image. The pattern and distribution are consistent with early non-proliferative diabetic retinopathy.",
      references: [
        "Early Treatment Diabetic Retinopathy Study (ETDRS), Ophthalmology 1991",
        "AAO Preferred Practice Pattern: Diabetic Retinopathy, 2019"
      ]
    },
    { 
      name: "Glaucoma", 
      probability: Math.floor(Math.random() * 35) + 10, 
      severity: 'low', 
      description: "Optic disc cupping and nerve fiber layer changes detected.",
      detectedFrom: hasOct ? 'both' : 'fundus',
      justification: hasOct 
        ? "The fundus image shows an increased cup-to-disc ratio (0.7), and the OCT confirms retinal nerve fiber layer (RNFL) thinning in the inferior and superior quadrants."
        : "The fundus image reveals an increased cup-to-disc ratio with associated peripapillary atrophy. OCT imaging would provide additional RNFL thickness measurements for confirmation.",
      references: [
        "American Academy of Ophthalmology Glaucoma Guidelines, 2020",
        "European Glaucoma Society Terminology and Guidelines, 5th Ed"
      ]
    },
    { 
      name: "Hypertensive Retinopathy", 
      probability: Math.floor(Math.random() * 30) + 5, 
      severity: 'low', 
      description: "Arteriovenous nicking and vessel wall changes observed.",
      detectedFrom: 'fundus',
      justification: "Arteriovenous nicking at multiple crossing points and focal arteriolar narrowing are visible in the fundus image, consistent with Grade II hypertensive retinopathy according to the Keith-Wagener-Barker classification.",
      references: [
        "Keith NM, Wagener HP, Barker NW. Hypertensive Retinopathy. Am J Med Sci 1939",
        "Wong TY, Mitchell P. Hypertensive Retinopathy. NEJM 2004"
      ]
    },
    { 
      name: "Papilledema", 
      probability: Math.floor(Math.random() * 20), 
      severity: 'low', 
      description: "Optic disc swelling potentially indicating increased intracranial pressure.",
      detectedFrom: 'fundus',
      justification: "The fundus image shows blurring of the optic disc margins with obscuration of blood vessels at the disc edge. The disc appears hyperemic with mild elevation.",
      references: [
        "Friedman DI, Jacobson DM. Papilledema. UpToDate 2023",
        "OCT Substudy Committee for NORDIC Idiopathic Intracranial Hypertension Study Group, 2015"
      ]
    },
  ];

  if (hasOct) {
    fundusDiseases.push(
      { 
        name: "Diabetic Macular Edema", 
        probability: Math.floor(Math.random() * 40) + 10, 
        severity: 'low', 
        description: "Fluid accumulation in the macula detected via cross-sectional imaging.",
        detectedFrom: 'oct',
        justification: "The OCT B-scan reveals intraretinal fluid pockets and cystoid spaces in the macular region. Central retinal thickness is elevated above normal limits (>300μm), confirming center-involving diabetic macular edema.",
        references: [
          "DRCR.net Protocol T: Anti-VEGF Treatment for DME, NEJM 2015",
          "International Council of Ophthalmology DME Guidelines, 2017"
        ]
      },
      { 
        name: "Age-Related Macular Degeneration", 
        probability: Math.floor(Math.random() * 50) + 20, 
        severity: 'medium', 
        description: "Drusen deposits and RPE changes visible in OCT layers.",
        detectedFrom: 'both',
        justification: "Multiple soft drusen are visible in the fundus image as yellow-white deposits. The OCT confirms these as RPE-basal laminar deposits with associated RPE irregularity. No subretinal fluid or CNV is detected, consistent with intermediate dry AMD.",
        references: [
          "Age-Related Eye Disease Study (AREDS) Classification, Ophthalmology 2001",
          "Ferris FL et al. Clinical Classification of AMD. Ophthalmology 2013"
        ]
      },
      { 
        name: "Epiretinal Membrane", 
        probability: Math.floor(Math.random() * 30) + 5, 
        severity: 'low', 
        description: "Thin membrane on retinal surface causing mild distortion.",
        detectedFrom: 'oct',
        justification: "The OCT clearly demonstrates a hyperreflective line on the inner retinal surface with associated retinal wrinkling and loss of the foveal depression, consistent with an epiretinal membrane.",
        references: [
          "Govetto A et al. OCT Analysis of the Epiretinal Membrane. Ophthalmology 2018",
          "Duker JS. Epiretinal Membranes. Retina, 5th Ed, Elsevier 2013"
        ]
      }
    );
  }

  return fundusDiseases
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

interface ScanContextType {
  scans: ScanAnalysis[];
  patients: Patient[];
  activeScan: ScanAnalysis | null;
  activeTabId: string | null;
  chatHistory: ChatMessage[];
  currentPatientId: string | null;
  setActiveTabId: (id: string | null) => void;
  setCurrentPatientId: (id: string | null) => void;
  addScan: (fundusFile: File, octFile?: File, patientId?: string, eyeSide?: 'left' | 'right') => void;
  removeScan: (id: string) => void;
  addPatient: (name: string, dateOfBirth: string, age?: number, gender?: 'male' | 'female' | 'other', relevantInfo?: string) => string;
  addChatMessage: (content: string, selectedScanIds: string[]) => void;
  assignScansToPatient: (patientId: string, scanIds: string[]) => void;
}

const ScanContext = createContext<ScanContextType | undefined>(undefined);

// Initial mock patients data with real eye scan images
const initialPatients: Patient[] = [
  {
    id: '1',
    name: 'John Smith',
    dateOfBirth: '1965-03-15',
    age: 59,
    gender: 'male',
    relevantInfo: 'Type 2 diabetes for 15 years, hypertension',
    createdAt: new Date('2024-01-10'),
    scans: [
      {
        id: 's1',
        name: 'Fundus Scan (Left)',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Fundus_photograph_of_normal_left_eye.jpg/640px-Fundus_photograph_of_normal_left_eye.jpg',
        uploadedAt: new Date('2024-01-10'),
        type: 'fundus',
        eyeSide: 'left',
        linkedOctUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/SD-OCT_Macula_Cross-Section.png/640px-SD-OCT_Macula_Cross-Section.png',
        linkedOctName: 'Left Eye OCT',
        diseases: [
          { name: 'Diabetic Macular Edema', probability: 45, severity: 'medium', description: 'Fluid accumulation detected.', detectedFrom: 'oct', justification: 'OCT reveals intraretinal fluid pockets in the macular region.', references: ['DRCR.net Protocol T, NEJM 2015'] },
          { name: 'Diabetic Retinopathy', probability: 55, severity: 'medium', description: 'Microaneurysms visible in fundus.', detectedFrom: 'fundus', justification: 'Multiple microaneurysms detected in the posterior pole of the fundus image.', references: ['ETDRS Study, 1991'] },
        ],
        summary: 'Moderate risk findings detected. Follow-up recommended.',
      },
    ],
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    dateOfBirth: '1978-08-22',
    age: 46,
    gender: 'female',
    relevantInfo: 'Family history of glaucoma',
    createdAt: new Date('2024-01-12'),
    scans: [
      {
        id: 's3',
        name: 'Fundus Scan (Left)',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Fundus_photo_showing_scatter_laser_surgery_for_diabetic_retinopathy_EDA09.JPG/640px-Fundus_photo_showing_scatter_laser_surgery_for_diabetic_retinopathy_EDA09.JPG',
        uploadedAt: new Date('2024-01-12'),
        type: 'fundus',
        eyeSide: 'left',
        diseases: [
          { name: 'Glaucoma', probability: 78, severity: 'high', description: 'Significant optic nerve changes detected.', detectedFrom: 'fundus', justification: 'Increased cup-to-disc ratio (0.8) with peripapillary atrophy visible in fundus.', references: ['AAO Glaucoma Guidelines, 2020'] },
        ],
        summary: 'High glaucoma risk detected. Specialist referral recommended.',
      },
    ],
  },
  {
    id: '3',
    name: 'Michael Brown',
    dateOfBirth: '1952-12-03',
    age: 72,
    gender: 'male',
    relevantInfo: 'Age-related macular degeneration in family, smoker for 30 years',
    createdAt: new Date('2024-01-15'),
    scans: [
      {
        id: 's4',
        name: 'Fundus Scan (Right)',
        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Fundus_of_patient_with_retinitis_pigmentosa%2C_mid_stage.jpg/640px-Fundus_of_patient_with_retinitis_pigmentosa%2C_mid_stage.jpg',
        uploadedAt: new Date('2024-01-15'),
        type: 'fundus',
        eyeSide: 'right',
        linkedOctUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/SD-OCT_Macula_Cross-Section.png/640px-SD-OCT_Macula_Cross-Section.png',
        linkedOctName: 'Right Eye OCT',
        diseases: [
          { name: 'Age-Related Macular Degeneration', probability: 55, severity: 'medium', description: 'Drusen deposits visible.', detectedFrom: 'both', justification: 'Drusen visible in fundus, confirmed by OCT showing RPE irregularity.', references: ['AREDS Classification, 2001'] },
          { name: 'Epiretinal Membrane', probability: 30, severity: 'low', description: 'Thin membrane on retinal surface.', detectedFrom: 'oct', justification: 'OCT shows hyperreflective line on inner retinal surface.', references: ['Govetto et al. Ophthalmology 2018'] },
        ],
        summary: 'AMD with moderate probability. Consider anti-VEGF evaluation.',
      },
    ],
  },
];

// Load patients from localStorage or use initial data
const loadPatientsFromStorage = (): Patient[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Convert date strings back to Date objects
      return parsed.map((p: any) => ({
        ...p,
        createdAt: new Date(p.createdAt),
        scans: p.scans.map((s: any) => ({
          ...s,
          uploadedAt: new Date(s.uploadedAt),
        })),
      }));
    }
  } catch (e) {
    console.error('Error loading patients from storage:', e);
  }
  return initialPatients;
};

const loadScansFromStorage = (): ScanAnalysis[] => {
  try {
    const stored = localStorage.getItem(SCANS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((s: any) => ({
        ...s,
        uploadedAt: new Date(s.uploadedAt),
      }));
    }
  } catch (e) {
    console.error('Error loading scans from storage:', e);
  }
  return [];
};

export function ScanProvider({ children }: { children: ReactNode }) {
  const [patients, setPatients] = useState<Patient[]>(() => loadPatientsFromStorage());
  const [currentPatientId, setCurrentPatientId] = useState<string | null>(null);
  const [scans, setScans] = useState<ScanAnalysis[]>(() => loadScansFromStorage());
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: 'Welcome to EyeQ! Upload fundus scans (with optional OCT) to begin analysis. Select images when asking questions for contextual answers.',
      timestamp: new Date(),
      selectedScanIds: [],
    }
  ]);

  // Persist patients to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
    } catch (e) {
      console.error('Error saving patients to storage:', e);
    }
  }, [patients]);

  // Persist scans to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(SCANS_STORAGE_KEY, JSON.stringify(scans));
    } catch (e) {
      console.error('Error saving scans to storage:', e);
    }
  }, [scans]);

  const addScan = useCallback(async (fundusFile: File, octFile?: File, patientId?: string, eyeSide?: 'left' | 'right') => {
    const fundusUrl = await getImagePreviewUrl(fundusFile);
    const octUrl = octFile ? await getImagePreviewUrl(octFile) : undefined;
    const diseases = generateMockDiseases(!!octFile);
    const baseName = fundusFile.name.replace(/\.[^/.]+$/, "");
    const eyeLabel = eyeSide === 'left' ? '(Left)' : '(Right)';
    
    const newScan: ScanAnalysis = {
      id: crypto.randomUUID(),
      name: `${baseName} ${eyeLabel}`,
      imageUrl: fundusUrl,
      uploadedAt: new Date(),
      type: 'fundus',
      diseases,
      summary: generateSummary(diseases),
      linkedOctUrl: octUrl,
      linkedOctName: octFile ? octFile.name.replace(/\.[^/.]+$/, "") : undefined,
      eyeSide: eyeSide || 'right',
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

  const addPatient = useCallback((name: string, dateOfBirth: string, age?: number, gender?: 'male' | 'female' | 'other', relevantInfo?: string) => {
    const newPatient: Patient = {
      id: crypto.randomUUID(),
      name,
      dateOfBirth,
      age: age || 0,
      gender: gender || 'other',
      relevantInfo,
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
    
    // Check for systemic disease questions
    const lowerContent = content.toLowerCase();
    const isSystemicQuery = lowerContent.includes('systemic') || 
                            lowerContent.includes('cardiovascular') || 
                            lowerContent.includes('diabetes') ||
                            lowerContent.includes('hypertension') ||
                            lowerContent.includes('heart') ||
                            lowerContent.includes('stroke') ||
                            lowerContent.includes('alzheimer') ||
                            lowerContent.includes('neurological') ||
                            lowerContent.includes('kidney');

    if (isSystemicQuery) {
      // Provide scientific references for ocular-systemic disease links
      aiResponse = `**Ocular Manifestations of Systemic Diseases - Scientific Evidence:**

The retina provides a unique window to assess systemic vascular health. Here are evidence-based connections:

**Diabetic Retinopathy & Systemic Complications:**
Diabetic retinopathy severity correlates with cardiovascular disease risk and nephropathy progression.
📚 *References:*
• Wong TY, et al. "Retinopathy and Risk of Congestive Heart Failure." JAMA. 2005;293(1):63-69. DOI: 10.1001/jama.293.1.63
• Cheung N, et al. "Diabetic retinopathy and systemic vascular complications." Prog Retin Eye Res. 2008;27(2):161-176.

**Hypertensive Retinopathy & Cardiovascular Risk:**
Retinal microvascular changes predict stroke, coronary heart disease, and heart failure.
📚 *References:*
• Wong TY, Mitchell P. "Hypertensive Retinopathy." N Engl J Med. 2004;351:2310-2317. DOI: 10.1056/NEJMra032865
• Ong YT, et al. "Hypertensive retinopathy and risk of stroke." Hypertension. 2013;62(4):706-711.

**Retinal Changes & Alzheimer's Disease:**
Retinal nerve fiber layer thinning and vascular changes may precede cognitive decline.
📚 *References:*
• Cheung CY, et al. "Retinal imaging in Alzheimer's disease." J Neurol Neurosurg Psychiatry. 2021;92(9):983-994. DOI: 10.1136/jnnp-2020-325347
• Koronyo Y, et al. "Retinal amyloid pathology and proof-of-concept imaging trial in Alzheimer's disease." JCI Insight. 2017;2(16):e93621.

Would you like more specific information about any particular systemic-ocular relationship?`;
    } else if (selectedScans.length > 0) {
      const scanNames = selectedScans.map(s => s.name).join(', ');
      const allDiseases = selectedScans.flatMap(s => s.diseases);
      const highRisk = allDiseases.filter(d => d.probability >= 50);
      
      if (highRisk.length > 0) {
        const diseaseDetails = highRisk.map(d => {
          const refs = d.references ? `\n   📚 ${d.references.join('; ')}` : '';
          return `• **${d.name}** (${d.probability}%): ${d.justification || d.description}${refs}`;
        }).join('\n');
        
        aiResponse = `Based on the selected scans (${scanNames}), I found ${highRisk.length} conditions with elevated risk:\n\n${diseaseDetails}\n\nWould you like more details on any specific finding or its systemic implications?`;
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

  return (
    <ScanContext.Provider value={{
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
    }}>
      {children}
    </ScanContext.Provider>
  );
}

export function useScanContext() {
  const context = useContext(ScanContext);
  if (context === undefined) {
    throw new Error('useScanContext must be used within a ScanProvider');
  }
  return context;
}
