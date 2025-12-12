import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { ScanAnalysis, ChatMessage, Disease, Patient } from "@/types/scan";
import { getImagePreviewUrl } from "@/lib/tifUtils";

// Import local fundus images
import fundus_DR165 from "@/assets/fundus/DR165.jpg";
import fundus_Glaucoma117 from "@/assets/fundus/Glaucoma117.jpg";
import fundus_Myopia12 from "@/assets/fundus/Myopia12.jpg";
import fundus_Retinitis from "@/assets/fundus/Retinitis_Pigmentosa138.jpg";
import fundus_CSCR99 from "@/assets/fundus/CSCR99.jpg";
import fundus_MacularScar from "@/assets/fundus/Macular_Scar27.jpg";
import fundus_DiscEdema6 from "@/assets/fundus/Disc_Edema6.jpg";
import fundus_DiscEdema8 from "@/assets/fundus/Disc_Edema8.jpg";

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
  addPatient: (name: string, dateOfBirth: string, age?: number, gender?: 'male' | 'female' | 'other', relevantInfo?: string, medicalTags?: string[]) => string;
  updatePatient: (patientId: string, updates: Partial<Pick<Patient, 'name' | 'dateOfBirth' | 'age' | 'gender' | 'relevantInfo' | 'medicalTags'>>) => void;
  addChatMessage: (content: string, selectedScanIds: string[]) => void;
  assignScansToPatient: (patientId: string, scanIds: string[]) => void;
}

const ScanContext = createContext<ScanContextType | undefined>(undefined);

// Initial mock patients data with local fundus images
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
        name: 'DR Fundus (Left)',
        imageUrl: fundus_DR165,
        uploadedAt: new Date('2024-01-10'),
        type: 'fundus',
        eyeSide: 'left',
        linkedOctUrl: fundus_Myopia12, // Using as demo OCT
        linkedOctName: 'OCT Scan Left Eye',
        diseases: [
          { name: 'Diabetic Macular Edema', probability: 45, severity: 'medium', description: 'Fluid accumulation detected.', detectedFrom: 'both', justification: 'Fundus reveals hard exudates and macular thickening; OCT confirms intraretinal fluid pockets.', references: ['DRCR.net Protocol T, NEJM 2015'] },
          { name: 'Diabetic Retinopathy', probability: 65, severity: 'medium', description: 'Microaneurysms and hard exudates visible in fundus.', detectedFrom: 'fundus', justification: 'Multiple microaneurysms and hard exudates detected in the posterior pole of the fundus image.', references: ['ETDRS Study, 1991'] },
        ],
        summary: 'Moderate diabetic retinopathy detected with macular edema confirmed on OCT. Follow-up recommended.',
      },
      {
        id: 's1b',
        name: 'Macular Scan (Right)',
        imageUrl: fundus_MacularScar,
        uploadedAt: new Date('2024-01-15'),
        type: 'fundus',
        eyeSide: 'right',
        diseases: [
          { name: 'Macular Scar', probability: 72, severity: 'high', description: 'Macular scarring visible affecting central vision.', detectedFrom: 'fundus', justification: 'Fundus shows well-defined macular scar with pigmentary changes.', references: ['Gass JD. Stereoscopic Atlas of Macular Diseases, 1997'] },
        ],
        summary: 'Macular scarring detected. Vision assessment recommended.',
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
        name: 'Glaucoma Scan (Left)',
        imageUrl: fundus_Glaucoma117,
        uploadedAt: new Date('2024-01-12'),
        type: 'fundus',
        eyeSide: 'left',
        linkedOctUrl: fundus_CSCR99, // Using as demo OCT
        linkedOctName: 'OCT RNFL Analysis',
        diseases: [
          { name: 'Glaucoma', probability: 78, severity: 'high', description: 'Significant optic nerve changes detected.', detectedFrom: 'both', justification: 'Increased cup-to-disc ratio (0.8) with peripapillary atrophy visible in fundus. OCT shows RNFL thinning in superior and inferior quadrants.', references: ['AAO Glaucoma Guidelines, 2020'] },
        ],
        summary: 'High glaucoma risk detected with RNFL loss on OCT. Specialist referral recommended.',
      },
      {
        id: 's3b',
        name: 'CSCR Scan (Right)',
        imageUrl: fundus_CSCR99,
        uploadedAt: new Date('2024-01-14'),
        type: 'fundus',
        eyeSide: 'right',
        diseases: [
          { name: 'Central Serous Chorioretinopathy', probability: 55, severity: 'medium', description: 'Serous detachment of neurosensory retina.', detectedFrom: 'fundus', justification: 'Fundus shows characteristic dome-shaped elevation at macula consistent with CSCR.', references: ['Daruich A. et al. Prog Retin Eye Res 2015'] },
        ],
        summary: 'CSCR detected. Monitor for resolution.',
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
        name: 'Myopia Scan (Right)',
        imageUrl: fundus_Myopia12,
        uploadedAt: new Date('2024-01-15'),
        type: 'fundus',
        eyeSide: 'right',
        diseases: [
          { name: 'Pathological Myopia', probability: 68, severity: 'medium', description: 'Myopic degeneration with tessellation visible.', detectedFrom: 'fundus', justification: 'Fundus shows tigroid/tessellated appearance with visible choroidal vessels.', references: ['Ohno-Matsui K. Asia Pac J Ophthalmol 2016'] },
          { name: 'Lacquer Cracks', probability: 35, severity: 'low', description: 'Linear breaks in Bruch membrane.', detectedFrom: 'fundus', justification: 'Yellowish linear lesions visible consistent with lacquer cracks.', references: ['Ohno-Matsui K. Retina 2003'] },
        ],
        summary: 'Pathological myopia detected. Regular monitoring advised.',
      },
      {
        id: 's4b',
        name: 'Retinitis Pigmentosa (Left)',
        imageUrl: fundus_Retinitis,
        uploadedAt: new Date('2024-01-18'),
        type: 'fundus',
        eyeSide: 'left',
        diseases: [
          { name: 'Retinitis Pigmentosa', probability: 85, severity: 'high', description: 'Bone spicule pigmentation and attenuated vessels.', detectedFrom: 'fundus', justification: 'Classic bone spicule pigmentation pattern visible in mid-periphery with vessel attenuation.', references: ['Hartong DT. Lancet 2006'] },
        ],
        summary: 'Retinitis pigmentosa confirmed. Genetic counseling recommended.',
      },
    ],
  },
  {
    id: '4',
    name: 'Emily Davis',
    dateOfBirth: '1980-05-20',
    age: 44,
    gender: 'female',
    relevantInfo: 'Recent headaches, vision changes reported',
    createdAt: new Date('2024-01-20'),
    scans: [
      {
        id: 's5',
        name: 'Disc Edema Scan (Left)',
        imageUrl: fundus_DiscEdema6,
        uploadedAt: new Date('2024-01-20'),
        type: 'fundus',
        eyeSide: 'left',
        diseases: [
          { name: 'Optic Disc Edema', probability: 82, severity: 'high', description: 'Swelling of the optic disc with blurred margins.', detectedFrom: 'fundus', justification: 'Fundus shows optic disc swelling with hemorrhages at disc margin, suggestive of papilledema.', references: ['Friedman DI. UpToDate 2023'] },
        ],
        summary: 'Optic disc edema detected. Urgent neurological evaluation recommended.',
      },
      {
        id: 's6',
        name: 'Disc Edema Scan (Right)',
        imageUrl: fundus_DiscEdema8,
        uploadedAt: new Date('2024-01-20'),
        type: 'fundus',
        eyeSide: 'right',
        diseases: [
          { name: 'Optic Disc Edema', probability: 78, severity: 'high', description: 'Bilateral optic disc swelling observed.', detectedFrom: 'fundus', justification: 'Right eye also shows disc swelling confirming bilateral papilledema.', references: ['Friedman DI. UpToDate 2023'] },
        ],
        summary: 'Bilateral disc edema confirmed. MRI brain recommended.',
      },
    ],
  },
];

// Map of fundus image keys to actual imports for restoring from localStorage
const fundusImageMap: Record<string, string> = {
  'fundus_DR165': fundus_DR165,
  'fundus_Glaucoma117': fundus_Glaucoma117,
  'fundus_Myopia12': fundus_Myopia12,
  'fundus_Retinitis': fundus_Retinitis,
  'fundus_CSCR99': fundus_CSCR99,
  'fundus_MacularScar': fundus_MacularScar,
  'fundus_DiscEdema6': fundus_DiscEdema6,
  'fundus_DiscEdema8': fundus_DiscEdema8,
};

// Helper to restore image URLs from localStorage
const restoreImageUrl = (url: string): string => {
  // If it's a key for a known fundus image, return the actual import
  if (url in fundusImageMap) {
    return fundusImageMap[url];
  }
  // Check if it matches one of our imported image paths (vite adds hash)
  for (const [key, importedUrl] of Object.entries(fundusImageMap)) {
    if (url === importedUrl) return importedUrl;
  }
  // If it's a data URL or valid http URL, return as-is
  if (url.startsWith('data:') || url.startsWith('http')) {
    return url;
  }
  // Default to a known fundus image if nothing matches
  return fundus_DR165;
};

// Helper to get storage key for an image
const getStorageKey = (url: string): string => {
  for (const [key, importedUrl] of Object.entries(fundusImageMap)) {
    if (url === importedUrl) return key;
  }
  return url;
};

// Load patients from localStorage or use initial data
const loadPatientsFromStorage = (): Patient[] => {
  try {
    // For reliability, always reset to the built-in demo patients that use
    // the bundled fundus images (including the Disc Edema scans you provided).
    // This avoids older cached data with broken image URLs.
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (e) {
    console.error('Error resetting patients storage:', e);
  }
  return initialPatients;
};

const loadScansFromStorage = (): ScanAnalysis[] => {
  try {
    const stored = localStorage.getItem(SCANS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const mapped = parsed.map((s: any) => ({
        ...s,
        uploadedAt: new Date(s.uploadedAt),
      }));

      // If we detect old blob: URLs that are no longer valid, reset scans
      const hasBlobUrls = mapped.some((s: any) =>
        typeof s.imageUrl === 'string' && s.imageUrl.startsWith('blob:')
      );

      if (hasBlobUrls) {
        console.warn('Detected legacy blob URLs in stored scans. Resetting scan storage.');
        localStorage.removeItem(SCANS_STORAGE_KEY);
        return [];
      }

      return mapped;
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
      // Convert image URLs to storage keys before saving
      const patientsToStore = patients.map(p => ({
        ...p,
        scans: p.scans.map(s => ({
          ...s,
          imageUrl: getStorageKey(s.imageUrl),
          linkedOctUrl: s.linkedOctUrl ? getStorageKey(s.linkedOctUrl) : undefined,
        })),
      }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(patientsToStore));
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

  const addPatient = useCallback((name: string, dateOfBirth: string, age?: number, gender?: 'male' | 'female' | 'other', relevantInfo?: string, medicalTags?: string[]) => {
    const newPatient: Patient = {
      id: crypto.randomUUID(),
      name,
      dateOfBirth,
      age: age || 0,
      gender: gender || 'other',
      relevantInfo,
      medicalTags,
      scans: [],
      createdAt: new Date(),
    };
    setPatients(prev => [...prev, newPatient]);
    return newPatient.id;
  }, []);

  const updatePatient = useCallback((patientId: string, updates: Partial<Pick<Patient, 'name' | 'dateOfBirth' | 'age' | 'gender' | 'relevantInfo' | 'medicalTags'>>) => {
    setPatients(prev => prev.map(p => 
      p.id === patientId ? { ...p, ...updates } : p
    ));
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
      updatePatient,
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
