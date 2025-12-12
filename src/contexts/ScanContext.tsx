import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { ScanAnalysis, ChatMessage, Disease, Patient } from "@/types/scan";
import { getImagePreviewUrl } from "@/lib/tifUtils";

// Import local fundus images
import fundus_DR165 from "@/assets/fundus/DR165.jpg";
import fundus_DR161 from "@/assets/fundus/DR161.jpg";
import fundus_DR164 from "@/assets/fundus/DR164.jpg";
import fundus_DR168 from "@/assets/fundus/DR168.jpg";
import fundus_DR171 from "@/assets/fundus/DR171.jpg";
import fundus_DR172 from "@/assets/fundus/DR172.jpg";
import fundus_DR173 from "@/assets/fundus/DR173.jpg";
import fundus_Glaucoma117 from "@/assets/fundus/Glaucoma117.jpg";
import fundus_Glaucoma130 from "@/assets/fundus/Glaucoma130.jpg";
import fundus_Glaucoma137 from "@/assets/fundus/Glaucoma137.jpg";
import fundus_Glaucoma146 from "@/assets/fundus/Glaucoma146.jpg";
import fundus_Glaucoma156 from "@/assets/fundus/Glaucoma156.jpg";
import fundus_Myopia12 from "@/assets/fundus/Myopia12.jpg";
import fundus_Retinitis from "@/assets/fundus/Retinitis_Pigmentosa138.jpg";
import fundus_CSCR99 from "@/assets/fundus/CSCR99.jpg";
import fundus_MacularScar from "@/assets/fundus/Macular_Scar27.jpg";
import fundus_DiscEdema6 from "@/assets/fundus/Disc_Edema6.jpg";
import fundus_DiscEdema8 from "@/assets/fundus/Disc_Edema8.jpg";

// Import OCT scans (B&W TIF images)
import oct_09 from "@/assets/oct/oct_09.tif";
import oct_017_2 from "@/assets/oct/oct_017_2.tif";
import oct_024 from "@/assets/oct/oct_024.tif";
import oct_012 from "@/assets/oct/oct_012.tif";
import oct_030 from "@/assets/oct/oct_030.tif";
import oct_039 from "@/assets/oct/oct_039.tif";
import oct_01_2 from "@/assets/oct/oct_01_2.tif";
import oct_010 from "@/assets/oct/oct_010.tif";
import oct_017_3 from "@/assets/oct/oct_017_3.tif";

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
  addScanToPatient: (patientId: string, fundusFile: File, octFile?: File, eyeSide?: 'left' | 'right', visitNumber?: number, visitDate?: Date) => void;
  removeScan: (id: string, patientId?: string) => void;
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
    relevantInfo: 'Type 2 diabetes for 15 years, hypertension, cardiovascular disease',
    medicalTags: ['Diabetes Type 2', 'Hypertension', 'Cardiovascular Disease', 'Obesity', 'High Cholesterol', 'Blurred Vision', 'Floaters'],
    createdAt: new Date('2024-01-10'),
    scans: [
      // Visit 1 - January 2024
      {
        id: 's1a',
        name: 'DR Fundus (Left)',
        imageUrl: fundus_DR161,
        uploadedAt: new Date('2024-01-10'),
        type: 'fundus',
        eyeSide: 'left',
        visitNumber: 1,
        visitDate: new Date('2024-01-10'),
        linkedOctUrl: oct_09,
        linkedOctName: 'OCT Scan Left Eye V1',
        diseases: [
          { name: 'Diabetic Retinopathy', probability: 72, severity: 'high', description: 'Moderate non-proliferative diabetic retinopathy with microaneurysms and hemorrhages.', detectedFrom: 'fundus', justification: 'Multiple microaneurysms, dot-blot hemorrhages, and hard exudates detected in the posterior pole. The pattern is consistent with moderate NPDR.', references: ['ETDRS Study, 1991', 'AAO Preferred Practice Pattern: Diabetic Retinopathy, 2019'] },
          { name: 'Diabetic Macular Edema', probability: 58, severity: 'medium', description: 'Center-involving macular edema confirmed on OCT.', detectedFrom: 'both', justification: 'Fundus reveals hard exudates approaching fovea; OCT confirms intraretinal fluid pockets with central subfield thickness of 340μm.', references: ['DRCR.net Protocol T, NEJM 2015'] },
        ],
        summary: 'Moderate NPDR with center-involving DME detected. Anti-VEGF treatment recommended.',
      },
      {
        id: 's1b',
        name: 'DR Fundus (Right)',
        imageUrl: fundus_DR164,
        uploadedAt: new Date('2024-01-10'),
        type: 'fundus',
        eyeSide: 'right',
        visitNumber: 1,
        visitDate: new Date('2024-01-10'),
        linkedOctUrl: oct_017_2,
        linkedOctName: 'OCT Scan Right Eye V1',
        diseases: [
          { name: 'Diabetic Retinopathy', probability: 65, severity: 'medium', description: 'Mild to moderate NPDR with scattered microaneurysms.', detectedFrom: 'fundus', justification: 'Scattered microaneurysms and few dot hemorrhages visible. Less severe than left eye.', references: ['ETDRS Study, 1991'] },
          { name: 'Hard Exudates', probability: 48, severity: 'medium', description: 'Lipid deposits in outer retinal layers.', detectedFrom: 'both', justification: 'Yellow-white deposits visible temporal to macula consistent with lipid exudation from leaky microaneurysms.', references: ['AAO Preferred Practice Pattern: Diabetic Retinopathy, 2019'] },
        ],
        summary: 'Mild-moderate NPDR in right eye. Monitor closely and optimize glycemic control.',
      },
      // Visit 2 - April 2024
      {
        id: 's1c',
        name: 'Follow-up (Left)',
        imageUrl: fundus_DR168,
        uploadedAt: new Date('2024-04-15'),
        type: 'fundus',
        eyeSide: 'left',
        visitNumber: 2,
        visitDate: new Date('2024-04-15'),
        linkedOctUrl: oct_024,
        linkedOctName: 'OCT Follow-up Left V2',
        diseases: [
          { name: 'Diabetic Retinopathy', probability: 68, severity: 'medium', description: 'Stable NPDR following treatment.', detectedFrom: 'fundus', justification: 'Microaneurysms stable, no new hemorrhages. Partial resolution of hard exudates after anti-VEGF.', references: ['DRCR.net Protocol T, NEJM 2015'] },
          { name: 'Diabetic Macular Edema', probability: 42, severity: 'medium', description: 'Reduced macular edema.', detectedFrom: 'both', justification: 'OCT shows reduced central subfield thickness to 285μm. Intraretinal fluid decreased.', references: ['DRCR.net Protocol T, NEJM 2015'] },
        ],
        summary: 'Improvement in DME following anti-VEGF therapy. Continue treatment.',
      },
      {
        id: 's1d',
        name: 'Follow-up (Right)',
        imageUrl: fundus_DR171,
        uploadedAt: new Date('2024-04-15'),
        type: 'fundus',
        eyeSide: 'right',
        visitNumber: 2,
        visitDate: new Date('2024-04-15'),
        linkedOctUrl: oct_012,
        linkedOctName: 'OCT Follow-up Right V2',
        diseases: [
          { name: 'Diabetic Retinopathy', probability: 70, severity: 'high', description: 'Progression to moderate NPDR with new hemorrhages.', detectedFrom: 'fundus', justification: 'New intraretinal hemorrhages noted. Microaneurysms increased in number.', references: ['ETDRS Study, 1991'] },
          { name: 'Diabetic Macular Edema', probability: 52, severity: 'medium', description: 'New onset macular edema in right eye.', detectedFrom: 'both', justification: 'OCT reveals new intraretinal cysts near fovea. Central thickness 310μm.', references: ['DRCR.net Protocol T, NEJM 2015'] },
        ],
        summary: 'DR progression in right eye with new DME. Initiate anti-VEGF treatment.',
      },
      // Visit 3 - August 2024 (no OCT)
      {
        id: 's1e',
        name: 'Check-up (Left)',
        imageUrl: fundus_DR172,
        uploadedAt: new Date('2024-08-20'),
        type: 'fundus',
        eyeSide: 'left',
        visitNumber: 3,
        visitDate: new Date('2024-08-20'),
        diseases: [
          { name: 'Diabetic Retinopathy', probability: 55, severity: 'medium', description: 'Continued improvement with treatment.', detectedFrom: 'fundus', justification: 'Reduction in hemorrhages and microaneurysms. Hard exudates resolving.', references: ['ETDRS Study, 1991'] },
        ],
        summary: 'Good response to treatment. DR stable. Continue monitoring.',
      },
      {
        id: 's1f',
        name: 'Check-up (Right)',
        imageUrl: fundus_DR173,
        uploadedAt: new Date('2024-08-20'),
        type: 'fundus',
        eyeSide: 'right',
        visitNumber: 3,
        visitDate: new Date('2024-08-20'),
        diseases: [
          { name: 'Diabetic Retinopathy', probability: 62, severity: 'medium', description: 'Stabilized following anti-VEGF treatment.', detectedFrom: 'fundus', justification: 'No new hemorrhages. Previous hemorrhages resolving. Microaneurysms stable.', references: ['ETDRS Study, 1991'] },
          { name: 'Diabetic Macular Edema', probability: 38, severity: 'low', description: 'Resolved macular edema.', detectedFrom: 'fundus', justification: 'Clinical examination suggests resolution. OCT recommended for confirmation.', references: ['DRCR.net Protocol T, NEJM 2015'] },
        ],
        summary: 'Good treatment response. DME likely resolved. Continue monitoring every 3-4 months.',
      },
    ],
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    dateOfBirth: '1978-08-22',
    age: 46,
    gender: 'female',
    relevantInfo: 'Primary open-angle glaucoma diagnosed 2 years ago, elevated IOP (22-26 mmHg), family history of glaucoma (mother)',
    medicalTags: ['Primary Open-Angle Glaucoma', 'Glaucoma Family History', 'Elevated Intraocular Pressure', 'Hypertension', 'Sleep Apnea', 'Peripheral Vision Loss', 'Eye Drops (Latanoprost)'],
    createdAt: new Date('2024-01-12'),
    scans: [
      // Visit 1 - January 2024
      {
        id: 's3a',
        name: 'Glaucoma Scan (Left)',
        imageUrl: fundus_Glaucoma130,
        uploadedAt: new Date('2024-01-12'),
        type: 'fundus',
        eyeSide: 'left',
        visitNumber: 1,
        visitDate: new Date('2024-01-12'),
        linkedOctUrl: oct_030,
        linkedOctName: 'OCT RNFL Left V1',
        diseases: [
          { name: 'Glaucoma', probability: 78, severity: 'high', description: 'Significant optic nerve cupping with RNFL thinning.', detectedFrom: 'both', justification: 'Cup-to-disc ratio of 0.75 with vertical elongation visible on fundus. OCT confirms RNFL thinning in inferior quadrant (58μm) below normal limits.', references: ['AAO Preferred Practice Pattern: Primary Open-Angle Glaucoma, 2020', 'European Glaucoma Society Guidelines, 5th Ed'] },
        ],
        summary: 'Advanced glaucomatous optic neuropathy in left eye with significant RNFL loss. IOP control critical.',
      },
      {
        id: 's3b',
        name: 'Glaucoma Scan (Right)',
        imageUrl: fundus_Glaucoma137,
        uploadedAt: new Date('2024-01-12'),
        type: 'fundus',
        eyeSide: 'right',
        visitNumber: 1,
        visitDate: new Date('2024-01-12'),
        linkedOctUrl: oct_039,
        linkedOctName: 'OCT RNFL Right V1',
        diseases: [
          { name: 'Glaucoma', probability: 72, severity: 'high', description: 'Optic disc changes consistent with glaucoma.', detectedFrom: 'both', justification: 'Cup-to-disc ratio of 0.7 with notching at inferior neuroretinal rim. OCT shows borderline RNFL thickness inferiorly (72μm).', references: ['AAO Preferred Practice Pattern: Primary Open-Angle Glaucoma, 2020'] },
        ],
        summary: 'Moderate glaucomatous changes in right eye. Continue current IOP-lowering therapy.',
      },
      // Visit 2 - June 2024
      {
        id: 's3c',
        name: 'Follow-up (Left)',
        imageUrl: fundus_Glaucoma146,
        uploadedAt: new Date('2024-06-15'),
        type: 'fundus',
        eyeSide: 'left',
        visitNumber: 2,
        visitDate: new Date('2024-06-15'),
        linkedOctUrl: oct_01_2,
        linkedOctName: 'OCT RNFL Left V2',
        diseases: [
          { name: 'Glaucoma', probability: 75, severity: 'high', description: 'Stable glaucomatous changes with maintained IOP control.', detectedFrom: 'both', justification: 'Cup-to-disc ratio stable at 0.75. OCT RNFL thickness stable compared to baseline (57μm inferior). No progression detected.', references: ['Chauhan BC, et al. Ophthalmology 2008 - RNFL progression criteria'] },
        ],
        summary: 'Stable glaucoma in left eye on current therapy. Continue monitoring every 6 months.',
      },
      {
        id: 's3d',
        name: 'Follow-up (Right)',
        imageUrl: fundus_Glaucoma156,
        uploadedAt: new Date('2024-06-15'),
        type: 'fundus',
        eyeSide: 'right',
        visitNumber: 2,
        visitDate: new Date('2024-06-15'),
        linkedOctUrl: oct_010,
        linkedOctName: 'OCT RNFL Right V2',
        diseases: [
          { name: 'Glaucoma', probability: 70, severity: 'high', description: 'Glaucoma stable with good IOP response to treatment.', detectedFrom: 'both', justification: 'Cup-to-disc ratio unchanged at 0.7. RNFL thickness on OCT shows no significant change from baseline. IOP reduced to 16 mmHg on therapy.', references: ['Heijl A, et al. Arch Ophthalmol 2002 - Early Manifest Glaucoma Trial'] },
        ],
        summary: 'Good treatment response in right eye. Target IOP achieved. Continue current regimen.',
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
    medicalTags: ['AMD Family History', 'Smoking History', 'Hypertension', 'Coronary Artery Disease', 'Stroke History', 'Central Vision Loss', 'Difficulty Reading'],
    createdAt: new Date('2024-01-15'),
    scans: [
      {
        id: 's4',
        name: 'Myopia Scan (Right)',
        imageUrl: fundus_Myopia12,
        uploadedAt: new Date('2024-01-15'),
        type: 'fundus',
        eyeSide: 'right',
        visitNumber: 1,
        visitDate: new Date('2024-01-15'),
        linkedOctUrl: oct_01_2,
        linkedOctName: 'OCT Macula Right',
        diseases: [
          { name: 'Pathological Myopia', probability: 68, severity: 'medium', description: 'Myopic degeneration with tessellation visible.', detectedFrom: 'both', justification: 'Fundus shows tigroid/tessellated appearance with visible choroidal vessels. OCT confirms posterior staphyloma and retinal thinning.', references: ['Ohno-Matsui K. Asia Pac J Ophthalmol 2016'] },
          { name: 'Lacquer Cracks', probability: 35, severity: 'low', description: 'Linear breaks in Bruch membrane.', detectedFrom: 'fundus', justification: 'Yellowish linear lesions visible consistent with lacquer cracks.', references: ['Ohno-Matsui K. Retina 2003'] },
        ],
        summary: 'Pathological myopia detected with OCT confirmation. Regular monitoring advised.',
      },
      {
        id: 's4b',
        name: 'Retinitis Pigmentosa (Left)',
        imageUrl: fundus_Retinitis,
        uploadedAt: new Date('2024-01-15'),
        type: 'fundus',
        eyeSide: 'left',
        visitNumber: 1,
        visitDate: new Date('2024-01-15'),
        linkedOctUrl: oct_010,
        linkedOctName: 'OCT Macula Left',
        diseases: [
          { name: 'Retinitis Pigmentosa', probability: 85, severity: 'high', description: 'Bone spicule pigmentation and attenuated vessels.', detectedFrom: 'both', justification: 'Classic bone spicule pigmentation pattern visible in mid-periphery with vessel attenuation. OCT shows outer retinal layer loss.', references: ['Hartong DT. Lancet 2006'] },
        ],
        summary: 'Retinitis pigmentosa confirmed on fundus and OCT. Genetic counseling recommended.',
      },
    ],
  },
  {
    id: '4',
    name: 'Emily Davis',
    dateOfBirth: '1980-05-20',
    age: 44,
    gender: 'female',
    relevantInfo: 'Recent headaches, vision changes reported, possible idiopathic intracranial hypertension',
    medicalTags: ['Headache', 'Obesity', 'Idiopathic Intracranial Hypertension', 'Nausea', 'Transient Visual Obscurations', 'Depression'],
    createdAt: new Date('2024-01-20'),
    scans: [
      {
        id: 's5',
        name: 'Disc Edema Scan (Left)',
        imageUrl: fundus_DiscEdema6,
        uploadedAt: new Date('2024-01-20'),
        type: 'fundus',
        eyeSide: 'left',
        visitNumber: 1,
        visitDate: new Date('2024-01-20'),
        linkedOctUrl: oct_017_3,
        linkedOctName: 'OCT Optic Nerve Left',
        diseases: [
          { name: 'Optic Disc Edema', probability: 82, severity: 'high', description: 'Swelling of the optic disc with blurred margins.', detectedFrom: 'both', justification: 'Fundus shows optic disc swelling with hemorrhages at disc margin. OCT confirms RNFL thickening consistent with papilledema.', references: ['Friedman DI. UpToDate 2023'] },
        ],
        summary: 'Optic disc edema confirmed on OCT. Urgent neurological evaluation recommended.',
      },
      {
        id: 's6',
        name: 'Disc Edema Scan (Right)',
        imageUrl: fundus_DiscEdema8,
        uploadedAt: new Date('2024-01-20'),
        type: 'fundus',
        eyeSide: 'right',
        visitNumber: 1,
        visitDate: new Date('2024-01-20'),
        diseases: [
          { name: 'Optic Disc Edema', probability: 78, severity: 'high', description: 'Bilateral optic disc swelling observed.', detectedFrom: 'fundus', justification: 'Right eye also shows disc swelling confirming bilateral papilledema.', references: ['Friedman DI. UpToDate 2023'] },
        ],
        summary: 'Bilateral disc edema confirmed. MRI brain recommended.',
      },
    ],
  },
];

// Map of image keys to actual imports for restoring from localStorage
const fundusImageMap: Record<string, string> = {
  'fundus_DR165': fundus_DR165,
  'fundus_DR161': fundus_DR161,
  'fundus_DR164': fundus_DR164,
  'fundus_DR168': fundus_DR168,
  'fundus_DR171': fundus_DR171,
  'fundus_DR172': fundus_DR172,
  'fundus_DR173': fundus_DR173,
  'fundus_Glaucoma117': fundus_Glaucoma117,
  'fundus_Glaucoma130': fundus_Glaucoma130,
  'fundus_Glaucoma137': fundus_Glaucoma137,
  'fundus_Glaucoma146': fundus_Glaucoma146,
  'fundus_Glaucoma156': fundus_Glaucoma156,
  'fundus_Myopia12': fundus_Myopia12,
  'fundus_Retinitis': fundus_Retinitis,
  'fundus_CSCR99': fundus_CSCR99,
  'fundus_MacularScar': fundus_MacularScar,
  'fundus_DiscEdema6': fundus_DiscEdema6,
  'fundus_DiscEdema8': fundus_DiscEdema8,
  // OCT scans
  'oct_09': oct_09,
  'oct_017_2': oct_017_2,
  'oct_024': oct_024,
  'oct_012': oct_012,
  'oct_030': oct_030,
  'oct_039': oct_039,
  'oct_01_2': oct_01_2,
  'oct_010': oct_010,
  'oct_017_3': oct_017_3,
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
    
    // Calculate visit number for this patient
    let visitNumber = 1;
    if (patientId) {
      const patient = patients.find(p => p.id === patientId);
      if (patient) {
        const maxVisit = Math.max(0, ...patient.scans.map(s => s.visitNumber || 0));
        // Check if there are scans from today
        const today = new Date().toDateString();
        const todayScans = patient.scans.filter(s => new Date(s.uploadedAt).toDateString() === today);
        if (todayScans.length > 0) {
          visitNumber = todayScans[0].visitNumber || maxVisit + 1;
        } else {
          visitNumber = maxVisit + 1;
        }
      }
    }
    
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
      visitNumber,
      visitDate: new Date(),
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
  }, [patients]);

  const addScanToPatient = useCallback(async (patientId: string, fundusFile: File, octFile?: File, eyeSide?: 'left' | 'right', visitNumber?: number, visitDate?: Date) => {
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
      visitNumber: visitNumber || 1,
      visitDate: visitDate || new Date(),
    };

    setPatients(prev => prev.map(p => 
      p.id === patientId 
        ? { ...p, scans: [...p.scans, newScan] }
        : p
    ));
    setActiveTabId(newScan.id);
  }, []);

  const removeScan = useCallback((id: string, patientId?: string) => {
    if (patientId) {
      // Remove from patient's scans
      setPatients(prev => prev.map(p => 
        p.id === patientId 
          ? { ...p, scans: p.scans.filter(s => s.id !== id) }
          : p
      ));
    }
    
    // Also remove from global scans if present
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
      addScanToPatient,
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
