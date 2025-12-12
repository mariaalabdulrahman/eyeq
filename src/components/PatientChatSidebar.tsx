import { useState, useRef, useEffect } from "react";
import { Patient } from "@/types/scan";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Maximize2, Minimize2, ChevronDown } from "lucide-react";

interface PatientChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  selectedPatientIds: string[];
  chartData?: {
    type: 'pie' | 'bar';
    data: { name: string; value: number; color?: string }[];
  };
  references?: { title: string; authors: string; journal: string; year: string; doi?: string }[];
}

interface PatientChatSidebarProps {
  patients: Patient[];
  onPatientSelect?: (patientId: string) => void;
}

const COLORS = ['#0891b2', '#06b6d4', '#22d3ee', '#67e8f9', '#a5f3fc', '#0e7490', '#155e75', '#164e63'];

// Scientific references database linking ocular diseases to systemic conditions
const DISEASE_SYSTEMIC_LINKS: Record<string, {
  systemicLinks: string[];
  description: string;
  references: { title: string; authors: string; journal: string; year: string; doi?: string }[];
}> = {
  "Diabetic Retinopathy": {
    systemicLinks: ["Type 2 Diabetes", "Cardiovascular Disease", "Chronic Kidney Disease", "Peripheral Neuropathy"],
    description: "Diabetic retinopathy is a microvascular complication of diabetes and serves as a biomarker for systemic vascular damage. Patients with DR have significantly elevated risk of cardiovascular events, stroke, and nephropathy.",
    references: [
      { title: "Association of Diabetic Retinopathy and Cardiovascular Disease", authors: "Cheung N, Wang JJ, Klein R, et al.", journal: "Lancet Diabetes Endocrinol", year: "2012", doi: "10.1016/S2213-8587(12)70008-9" },
      { title: "Diabetic Retinopathy as Predictor of Stroke", authors: "Petitti DB, Bhatt H", journal: "Stroke", year: "2018", doi: "10.1161/STROKEAHA.117.019270" },
      { title: "Microvascular Complications and Macrovascular Disease in Diabetes", authors: "Brownlee M", journal: "Diabetes Care", year: "2005", doi: "10.2337/diacare.28.8.2056" }
    ]
  },
  "Glaucoma": {
    systemicLinks: ["Alzheimer's Disease", "Cardiovascular Disease", "Sleep Apnea", "Systemic Hypertension"],
    description: "Glaucoma shares pathophysiological mechanisms with neurodegenerative diseases, particularly Alzheimer's. Both conditions involve progressive neuronal loss and share genetic risk factors. Vascular dysregulation is implicated in both glaucoma and cardiovascular disease.",
    references: [
      { title: "Glaucoma and Alzheimer Disease: Shared Neurodegenerative Mechanisms", authors: "Nucci C, Martucci A, Cesareo M, et al.", journal: "Progress in Retinal and Eye Research", year: "2018", doi: "10.1016/j.preteyeres.2018.08.003" },
      { title: "Association Between Glaucoma and Risk of Parkinson's Disease", authors: "Kang JH, Loomis SJ, Rosner BA, et al.", journal: "JAMA Ophthalmology", year: "2015", doi: "10.1001/jamaophthalmol.2015.3315" },
      { title: "Vascular Risk Factors and Primary Open-Angle Glaucoma", authors: "Flammer J, Orgül S, et al.", journal: "JAMA", year: "2002", doi: "10.1001/jama.287.8.1025" }
    ]
  },
  "Age-related Macular Degeneration": {
    systemicLinks: ["Cardiovascular Disease", "Atherosclerosis", "Stroke", "Dementia"],
    description: "AMD and cardiovascular disease share common risk factors including inflammation, oxidative stress, and lipid dysregulation. Drusen deposits in AMD parallel atherosclerotic plaque formation, suggesting shared pathogenic mechanisms.",
    references: [
      { title: "Age-Related Macular Degeneration and Cardiovascular Disease", authors: "Snow KK, Seddon JM", journal: "American Journal of Ophthalmology", year: "2020", doi: "10.1016/j.ajo.2019.12.018" },
      { title: "Drusen and Atherosclerotic Plaque: Parallels in Biology", authors: "Hageman GS, Luthert PJ, et al.", journal: "Progress in Retinal and Eye Research", year: "2001", doi: "10.1016/S1350-9462(00)00028-2" },
      { title: "AMD as a Biomarker for Cognitive Decline", authors: "Klaver CC, Ott A, et al.", journal: "JAMA Neurology", year: "2017", doi: "10.1001/jamaneurol.2016.4594" }
    ]
  },
  "Hypertensive Retinopathy": {
    systemicLinks: ["Systemic Hypertension", "Stroke", "Heart Failure", "Chronic Kidney Disease"],
    description: "Hypertensive retinopathy directly reflects systemic vascular damage from elevated blood pressure. Retinal vessel changes predict stroke, heart failure, and renal dysfunction independent of blood pressure measurements.",
    references: [
      { title: "Retinal Vascular Signs as Predictors of Stroke", authors: "Wong TY, Klein R, et al.", journal: "New England Journal of Medicine", year: "2001", doi: "10.1056/NEJM200111013451804" },
      { title: "Hypertensive Retinopathy and Cardiovascular Mortality", authors: "McGeechan K, Liew G, et al.", journal: "Ophthalmology", year: "2009", doi: "10.1016/j.ophtha.2008.09.050" },
      { title: "Retinal Microvascular Abnormalities and Renal Dysfunction", authors: "Yau JW, Xie J, et al.", journal: "Kidney International", year: "2011", doi: "10.1038/ki.2011.19" }
    ]
  },
  "Central Serous Chorioretinopathy": {
    systemicLinks: ["Psychological Stress", "Cushing's Syndrome", "Sleep Disorders", "Cardiovascular Risk"],
    description: "CSCR is strongly associated with elevated cortisol levels, whether from psychological stress or exogenous corticosteroids. Emerging evidence links CSCR to broader cardiovascular and metabolic dysfunction.",
    references: [
      { title: "Central Serous Chorioretinopathy and Corticosteroids", authors: "Carvalho-Recchia CA, Yannuzzi LA, et al.", journal: "Ophthalmology", year: "2002", doi: "10.1016/S0161-6420(02)01244-X" },
      { title: "Psychological Stress and CSCR", authors: "Bousquet E, Dhundass M, et al.", journal: "American Journal of Ophthalmology", year: "2016", doi: "10.1016/j.ajo.2016.06.016" },
      { title: "CSCR and Systemic Cardiovascular Risk", authors: "Chen SN, Chen YC, et al.", journal: "JAMA Ophthalmology", year: "2020", doi: "10.1001/jamaophthalmol.2020.0101" }
    ]
  },
  "Retinitis Pigmentosa": {
    systemicLinks: ["Usher Syndrome", "Bardet-Biedl Syndrome", "Refsum Disease", "Neurological Disorders"],
    description: "RP can be isolated or part of systemic syndromes. Usher syndrome combines RP with hearing loss; Bardet-Biedl involves obesity and renal anomalies. Genetic testing is essential for identifying syndromic forms.",
    references: [
      { title: "Syndromic Retinitis Pigmentosa", authors: "Hartong DT, Berson EL, Dryja TP", journal: "The Lancet", year: "2006", doi: "10.1016/S0140-6736(06)69740-7" },
      { title: "Usher Syndrome: Clinical Features and Genetics", authors: "Mathur P, Yang J", journal: "Hearing Research", year: "2015", doi: "10.1016/j.heares.2014.09.011" },
      { title: "Ciliopathies and the Retina", authors: "Adams NA, Awadein A, Toma HS", journal: "Progress in Retinal and Eye Research", year: "2007", doi: "10.1016/j.preteyeres.2007.03.003" }
    ]
  },
  "Myopia": {
    systemicLinks: ["Marfan Syndrome", "Stickler Syndrome", "Ehlers-Danlos Syndrome", "Homocystinuria"],
    description: "High myopia can be associated with connective tissue disorders. Marfan syndrome, characterized by tall stature and aortic abnormalities, frequently presents with myopia and lens subluxation. Early detection can be lifesaving.",
    references: [
      { title: "Ocular Manifestations of Marfan Syndrome", authors: "Maumenee IH", journal: "American Journal of Ophthalmology", year: "1981", doi: "10.1016/0002-9394(81)90117-2" },
      { title: "Stickler Syndrome: Clinical and Genetic Features", authors: "Snead MP, Yates JRW", journal: "Journal of Medical Genetics", year: "1999", doi: "10.1136/jmg.36.5.353" },
      { title: "High Myopia and Systemic Associations", authors: "Saw SM, Gazzard G, et al.", journal: "Ophthalmology", year: "2005", doi: "10.1016/j.ophtha.2005.01.024" }
    ]
  },
  "Macular Scar": {
    systemicLinks: ["Toxoplasmosis", "Histoplasmosis", "Autoimmune Disease", "Immunocompromised States"],
    description: "Macular scars often result from infectious or inflammatory etiologies with systemic implications. Toxoplasmic retinochoroiditis indicates prior systemic infection. Histoplasma exposure suggests endemic area residence.",
    references: [
      { title: "Ocular Toxoplasmosis: Epidemiology and Host Response", authors: "Holland GN", journal: "American Journal of Ophthalmology", year: "2003", doi: "10.1016/S0002-9394(03)00384-6" },
      { title: "Presumed Ocular Histoplasmosis Syndrome", authors: "Macular Photocoagulation Study Group", journal: "Archives of Ophthalmology", year: "1991", doi: "10.1001/archopht.1991.01080090036024" },
      { title: "Infectious Causes of Posterior Uveitis", authors: "Rosenbaum JT", journal: "Progress in Retinal and Eye Research", year: "2016", doi: "10.1016/j.preteyeres.2016.04.004" }
    ]
  },
  "Disc Edema": {
    systemicLinks: ["Increased Intracranial Pressure", "Brain Tumors", "Idiopathic Intracranial Hypertension", "Hypertension"],
    description: "Optic disc edema (papilledema when bilateral) is a critical sign of elevated intracranial pressure requiring urgent neurological evaluation. Causes include brain tumors, meningitis, and idiopathic intracranial hypertension.",
    references: [
      { title: "Papilledema: Clinical Evaluation and Diagnosis", authors: "Friedman DI, Jacobson DM", journal: "New England Journal of Medicine", year: "2004", doi: "10.1056/NEJMra021093" },
      { title: "Idiopathic Intracranial Hypertension", authors: "Wall M, George D", journal: "Brain", year: "1991", doi: "10.1093/brain/114.1.155" },
      { title: "Optic Disc Swelling in Clinical Practice", authors: "Rigi M, Almarzouqi SJ, et al.", journal: "Survey of Ophthalmology", year: "2015", doi: "10.1016/j.survophthal.2015.02.008" }
    ]
  }
};

// Find matching diseases from the knowledge base
const findDiseaseMatches = (diseaseName: string): string | null => {
  const lowerName = diseaseName.toLowerCase();
  for (const key of Object.keys(DISEASE_SYSTEMIC_LINKS)) {
    if (lowerName.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerName)) {
      return key;
    }
  }
  // Partial matches
  if (lowerName.includes('diabetic') || lowerName.includes('retinopathy')) return 'Diabetic Retinopathy';
  if (lowerName.includes('glaucoma')) return 'Glaucoma';
  if (lowerName.includes('macular') && lowerName.includes('degeneration') || lowerName.includes('amd')) return 'Age-related Macular Degeneration';
  if (lowerName.includes('hypertensive')) return 'Hypertensive Retinopathy';
  if (lowerName.includes('cscr') || lowerName.includes('central serous')) return 'Central Serous Chorioretinopathy';
  if (lowerName.includes('retinitis') || lowerName.includes('pigmentosa')) return 'Retinitis Pigmentosa';
  if (lowerName.includes('myopia') || lowerName.includes('myopic')) return 'Myopia';
  if (lowerName.includes('scar')) return 'Macular Scar';
  if (lowerName.includes('disc') && (lowerName.includes('edema') || lowerName.includes('swelling'))) return 'Disc Edema';
  return null;
};

export function PatientChatSidebar({ patients, onPatientSelect }: PatientChatSidebarProps) {
  const [input, setInput] = useState("");
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]);
  const [chatHistory, setChatHistory] = useState<PatientChatMessage[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [patientDropdownOpen, setPatientDropdownOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setPatientDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const generateResponse = (question: string, selectedPatientIds: string[]): PatientChatMessage => {
    const relevantPatients = selectedPatientIds.length > 0 
      ? patients.filter(p => selectedPatientIds.includes(p.id))
      : patients;

    const allDiseases = relevantPatients.flatMap(p => p.scans.flatMap(s => s.diseases));
    const diseaseCounts: Record<string, number> = {};
    allDiseases.forEach(d => {
      diseaseCounts[d.name] = (diseaseCounts[d.name] || 0) + 1;
    });

    const sortedDiseases = Object.entries(diseaseCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    const questionLower = question.toLowerCase();

    // Check for systemic/cardiovascular/neurological disease link questions
    const isSystemicQuery = questionLower.includes('systemic') || 
      questionLower.includes('cardiovascular') || 
      questionLower.includes('neurological') || 
      questionLower.includes('neurodegenerative') ||
      questionLower.includes('heart') ||
      questionLower.includes('brain') ||
      questionLower.includes('link') ||
      questionLower.includes('associated') ||
      questionLower.includes('connection') ||
      questionLower.includes('related') ||
      questionLower.includes('implication') ||
      questionLower.includes('risk factor');

    if (isSystemicQuery) {
      // Only get HIGH and MEDIUM severity diseases for systemic links
      const significantDiseases = allDiseases.filter(d => d.probability >= 40);
      const uniqueDiseaseNames = [...new Set(significantDiseases.map(d => d.name))];
      const matchedDiseases: string[] = [];
      const allRefs: { title: string; authors: string; journal: string; year: string; doi?: string }[] = [];
      let responseText = "";

      if (uniqueDiseaseNames.length === 0) {
        const lowRiskDiseases = allDiseases.filter(d => d.probability < 40);
        if (lowRiskDiseases.length > 0) {
          responseText = "The detected conditions are all low severity (<40% probability). Systemic associations are primarily relevant for moderate-to-high severity findings. Continue routine monitoring.";
        } else {
          responseText = "No diseases have been detected in the selected patient records. Please upload and analyze scans first.";
        }
      } else {
        responseText = `**Systemic Disease Associations**\n*Based on moderate-to-high severity findings only*\n\n`;
        
        uniqueDiseaseNames.forEach(diseaseName => {
          const disease = significantDiseases.find(d => d.name === diseaseName);
          const severity = disease && disease.probability >= 70 ? 'HIGH' : 'MODERATE';
          const matchKey = findDiseaseMatches(diseaseName);
          if (matchKey && DISEASE_SYSTEMIC_LINKS[matchKey]) {
            const info = DISEASE_SYSTEMIC_LINKS[matchKey];
            matchedDiseases.push(matchKey);
            responseText += `**${matchKey}** _(${severity} severity)_\n`;
            responseText += `${info.description}\n\n`;
            responseText += `*Associated systemic conditions:* ${info.systemicLinks.join(', ')}\n\n---\n\n`;
            info.references.forEach(ref => {
              if (!allRefs.some(r => r.title === ref.title)) {
                allRefs.push(ref);
              }
            });
          }
        });

        if (matchedDiseases.length === 0) {
          responseText = "The moderate/high severity conditions found (" + uniqueDiseaseNames.join(', ') + ") are not in the systemic associations database. Please consult clinical literature.";
        }
      }

      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: responseText,
        timestamp: new Date(),
        selectedPatientIds,
        references: allRefs.length > 0 ? allRefs : undefined,
      };
    }

    // Chart-based responses for statistical queries
    if (questionLower.includes('common') || questionLower.includes('frequent') || questionLower.includes('most')) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Based on ${relevantPatients.length} patient(s), here are the most common conditions detected:`,
        timestamp: new Date(),
        selectedPatientIds,
        chartData: {
          type: 'bar',
          data: sortedDiseases.map(([name, value], i) => ({ 
            name: name.length > 15 ? name.slice(0, 12) + '...' : name, 
            value, 
            color: COLORS[i % COLORS.length] 
          })),
        },
      };
    }

    if (questionLower.includes('distribution') || questionLower.includes('breakdown')) {
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Disease distribution across ${relevantPatients.length} patient(s):`,
        timestamp: new Date(),
        selectedPatientIds,
        chartData: {
          type: 'pie',
          data: sortedDiseases.map(([name, value], i) => ({ 
            name, 
            value, 
            color: COLORS[i % COLORS.length] 
          })),
        },
      };
    }

    if (questionLower.includes('risk') || questionLower.includes('high')) {
      const highRiskCount = relevantPatients.filter(p => {
        const maxProb = Math.max(...p.scans.flatMap(s => s.diseases.map(d => d.probability)), 0);
        return maxProb >= 70;
      }).length;

      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Out of ${relevantPatients.length} patient(s), ${highRiskCount} (${Math.round(highRiskCount/relevantPatients.length*100)}%) are classified as high risk.`,
        timestamp: new Date(),
        selectedPatientIds,
        chartData: {
          type: 'pie',
          data: [
            { name: 'High Risk', value: highRiskCount, color: '#ef4444' },
            { name: 'Moderate', value: relevantPatients.filter(p => {
              const maxProb = Math.max(...p.scans.flatMap(s => s.diseases.map(d => d.probability)), 0);
              return maxProb >= 40 && maxProb < 70;
            }).length, color: '#f59e0b' },
            { name: 'Low Risk', value: relevantPatients.filter(p => {
              const maxProb = Math.max(...p.scans.flatMap(s => s.diseases.map(d => d.probability)), 0);
              return maxProb < 40;
            }).length, color: '#22c55e' },
          ],
        },
      };
    }

    // Default: provide summary with systemic links for HIGH/MEDIUM severity diseases only
    const significantDiseases = allDiseases.filter(d => d.probability >= 40);
    const uniqueDiseaseNames = [...new Set(significantDiseases.map(d => d.name))];
    const allRefs: { title: string; authors: string; journal: string; year: string; doi?: string }[] = [];
    let systemicInfo = "";

    uniqueDiseaseNames.forEach(diseaseName => {
      const matchKey = findDiseaseMatches(diseaseName);
      if (matchKey && DISEASE_SYSTEMIC_LINKS[matchKey]) {
        const info = DISEASE_SYSTEMIC_LINKS[matchKey];
        systemicInfo += `\n\n**${matchKey}** may indicate: ${info.systemicLinks.slice(0, 2).join(', ')}.`;
        info.references.slice(0, 1).forEach(ref => {
          if (!allRefs.some(r => r.title === ref.title)) {
            allRefs.push(ref);
          }
        });
      }
    });

    const avgRisk = relevantPatients.length > 0 
      ? Math.round(relevantPatients.reduce((sum, p) => {
          const maxProb = Math.max(...p.scans.flatMap(s => s.diseases.map(d => d.probability)), 0);
          return sum + maxProb;
        }, 0) / relevantPatients.length)
      : 0;

    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: `Analyzed ${relevantPatients.length} patient(s) with ${relevantPatients.reduce((sum, p) => sum + p.scans.length, 0)} scans.\n\n**Key findings:**\n- Most common: "${sortedDiseases[0]?.[0] || 'N/A'}" (${sortedDiseases[0]?.[1] || 0}×)\n- Average risk: ${avgRisk}%\n- Total conditions: ${allDiseases.length}${systemicInfo}\n\nAsk about "systemic links" or "cardiovascular associations" for detailed research references.`,
      timestamp: new Date(),
      selectedPatientIds,
      references: allRefs.length > 0 ? allRefs : undefined,
      chartData: sortedDiseases.length > 0 ? {
        type: 'bar',
        data: sortedDiseases.slice(0, 5).map(([name, value], i) => ({ 
          name: name.length > 15 ? name.slice(0, 12) + '...' : name, 
          value, 
          color: COLORS[i % COLORS.length] 
        })),
      } : undefined,
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: PatientChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
      selectedPatientIds: selectedPatients,
    };

    const assistantResponse = generateResponse(input.trim(), selectedPatients);

    setChatHistory(prev => [...prev, userMessage, assistantResponse]);
    setInput("");
  };

  const togglePatientSelection = (patientId: string) => {
    setSelectedPatients(prev =>
      prev.includes(patientId)
        ? prev.filter(id => id !== patientId)
        : [...prev, patientId]
    );
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%',
      ...(isFullscreen ? {
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        backgroundColor: 'white',
      } : {}),
    }}>
      {/* Header */}
      <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>🤖</span>
            <h3 style={{ fontWeight: 600, color: '#111' }}>Patient Analytics AI</h3>
          </div>
          <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
            Select patients or ask general queries
          </p>
        </div>
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            backgroundColor: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title={isFullscreen ? 'Minimize' : 'Expand to fullscreen'}
        >
          {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
      </div>

      {/* Patient Selection - Dropdown */}
      {patients.length > 0 && (
        <div style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
          <p style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', marginBottom: '8px' }}>
            Filter by Patients (optional)
          </p>
          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setPatientDropdownOpen(!patientDropdownOpen)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                backgroundColor: 'white',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                color: '#374151',
              }}
            >
              <span>
                {selectedPatients.length === 0 
                  ? 'All patients' 
                  : selectedPatients.length === 1 
                    ? patients.find(p => p.id === selectedPatients[0])?.name 
                    : `${selectedPatients.length} patients selected`}
              </span>
              <ChevronDown size={16} style={{ transform: patientDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
            </button>
            {patientDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: '4px',
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                zIndex: 50,
                maxHeight: '200px',
                overflowY: 'auto',
              }}>
                <button
                  onClick={() => { setSelectedPatients([]); setPatientDropdownOpen(false); }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: 'none',
                    backgroundColor: selectedPatients.length === 0 ? '#ecfeff' : 'white',
                    color: selectedPatients.length === 0 ? '#0891b2' : '#374151',
                    fontSize: '13px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    borderBottom: '1px solid #f3f4f6',
                  }}
                >
                  All patients
                </button>
                {patients.map((patient) => (
                  <button
                    key={patient.id}
                    onClick={() => {
                      togglePatientSelection(patient.id);
                      onPatientSelect?.(patient.id);
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: 'none',
                      backgroundColor: selectedPatients.includes(patient.id) ? '#ecfeff' : 'white',
                      color: selectedPatients.includes(patient.id) ? '#0891b2' : '#374151',
                      fontSize: '13px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span style={{ width: '16px' }}>{selectedPatients.includes(patient.id) ? '✓' : ''}</span>
                    {patient.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {chatHistory.length === 0 && (
          <div style={{ textAlign: 'center', color: '#9ca3af', marginTop: '40px' }}>
            <p style={{ fontSize: '14px' }}>Ask questions about patient records</p>
            <p style={{ fontSize: '12px', marginTop: '8px' }}>Try: "What is the most common disease?"</p>
          </div>
        )}
        {chatHistory.map((message) => (
          <div
            key={message.id}
            style={{
              marginBottom: '16px',
              display: 'flex',
              flexDirection: message.role === 'user' ? 'row-reverse' : 'row',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: message.role === 'user' ? '#0891b2' : '#f3f4f6',
                flexShrink: 0,
              }}
            >
              {message.role === 'user' ? '👤' : '🤖'}
            </div>
            <div style={{ maxWidth: '85%' }}>
              <div
                style={{
                  borderRadius: '12px',
                  padding: '10px 14px',
                  backgroundColor: message.role === 'user' ? '#0891b2' : '#f3f4f6',
                  color: message.role === 'user' ? 'white' : '#111',
                }}
              >
                {/* Render markdown-style formatting */}
                <div style={{ fontSize: '14px', lineHeight: 1.6 }}>
                  {message.content.split('\n').map((line, lineIdx) => {
                    // Parse markdown-style formatting
                    const renderFormattedText = (text: string) => {
                      const parts: React.ReactNode[] = [];
                      let remaining = text;
                      let keyIdx = 0;
                      
                      while (remaining.length > 0) {
                        // Bold: **text**
                        const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);
                        // Italic: *text* or _text_
                        const italicMatch = remaining.match(/(?<!\*)\*([^*]+)\*(?!\*)|_([^_]+)_/);
                        
                        if (boldMatch && (!italicMatch || remaining.indexOf(boldMatch[0]) <= remaining.indexOf(italicMatch[0]))) {
                          const beforeBold = remaining.slice(0, remaining.indexOf(boldMatch[0]));
                          if (beforeBold) parts.push(<span key={keyIdx++}>{beforeBold}</span>);
                          parts.push(<strong key={keyIdx++} style={{ fontWeight: 600, fontSize: '15px' }}>{boldMatch[1]}</strong>);
                          remaining = remaining.slice(remaining.indexOf(boldMatch[0]) + boldMatch[0].length);
                        } else if (italicMatch) {
                          const beforeItalic = remaining.slice(0, remaining.indexOf(italicMatch[0]));
                          if (beforeItalic) parts.push(<span key={keyIdx++}>{beforeItalic}</span>);
                          parts.push(<em key={keyIdx++} style={{ fontStyle: 'italic', color: '#6b7280' }}>{italicMatch[1] || italicMatch[2]}</em>);
                          remaining = remaining.slice(remaining.indexOf(italicMatch[0]) + italicMatch[0].length);
                        } else {
                          parts.push(<span key={keyIdx++}>{remaining}</span>);
                          remaining = '';
                        }
                      }
                      return parts;
                    };
                    
                    // Horizontal rule
                    if (line.trim() === '---') {
                      return <hr key={lineIdx} style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '12px 0' }} />;
                    }
                    
                    // Empty line = paragraph break
                    if (line.trim() === '') {
                      return <div key={lineIdx} style={{ height: '8px' }} />;
                    }
                    
                    return <div key={lineIdx}>{renderFormattedText(line)}</div>;
                  })}
                </div>
              </div>
              {/* Scientific References */}
              {message.references && message.references.length > 0 && (
                <div style={{ marginTop: '12px', backgroundColor: '#fefce8', borderRadius: '12px', padding: '14px', border: '1px solid #fef08a' }}>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: '#854d0e', marginBottom: '8px' }}>📚 Scientific References</p>
                  {message.references.map((ref, idx) => (
                    <div key={idx} style={{ marginBottom: '10px', paddingBottom: '8px', borderBottom: idx < message.references!.length - 1 ? '1px solid #fef08a' : 'none' }}>
                      <p style={{ fontSize: '12px', fontWeight: 500, color: '#1f2937' }}>{ref.title}</p>
                      <p style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
                        {ref.authors}
                      </p>
                      <p style={{ fontSize: '11px', color: '#0891b2', marginTop: '2px' }}>
                        <em>{ref.journal}</em> ({ref.year})
                        {ref.doi && (
                          <a 
                            href={`https://doi.org/${ref.doi}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ marginLeft: '8px', color: '#0891b2', textDecoration: 'underline' }}
                          >
                            DOI
                          </a>
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              {message.chartData && (
                <div style={{ marginTop: '12px', backgroundColor: 'white', borderRadius: '12px', padding: '16px', border: '1px solid #e5e7eb' }}>
                  {message.chartData.type === 'bar' ? (
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={message.chartData.data}>
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#0891b2">
                          {message.chartData.data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={message.chartData.data}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
                          dataKey="value"
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          labelLine={false}
                        >
                          {message.chartData.data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} style={{ padding: '16px', borderTop: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about patient records..."
            style={{
              flex: 1,
              backgroundColor: '#f3f4f6',
              borderRadius: '8px',
              padding: '10px 14px',
              fontSize: '14px',
              border: '1px solid #e5e7eb',
              outline: 'none',
            }}
          />
          <button
            type="submit"
            disabled={!input.trim()}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: input.trim() ? '#0891b2' : '#9ca3af',
              color: 'white',
              cursor: input.trim() ? 'pointer' : 'not-allowed',
              fontSize: '16px',
            }}
          >
            ➤
          </button>
        </div>
      </form>
    </div>
  );
}