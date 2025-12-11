import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, ArrowLeft, UserPlus, Camera, Stethoscope, User, Lightbulb, FileText } from "lucide-react";
// Mock patient data
const mockPatients = [
    {
        id: '1',
        name: 'John Smith',
        dateOfBirth: '1965-03-15',
        createdAt: new Date('2024-01-10'),
        scans: [
            {
                id: 's1',
                name: 'Left Eye OCT',
                imageUrl: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400',
                uploadedAt: new Date('2024-01-10'),
                type: 'oct',
                diseases: [
                    { name: 'Diabetic Macular Edema', probability: 45, severity: 'medium', description: 'Fluid accumulation detected.' },
                    { name: 'Epiretinal Membrane', probability: 20, severity: 'low', description: 'Thin membrane on retinal surface.' },
                ],
                summary: 'Moderate risk findings detected. Follow-up recommended.',
            },
            {
                id: 's2',
                name: 'Right Eye Fundus',
                imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400',
                uploadedAt: new Date('2024-01-10'),
                type: 'fundus',
                diseases: [
                    { name: 'Diabetic Retinopathy', probability: 55, severity: 'medium', description: 'Microaneurysms visible.' },
                ],
                summary: 'Signs of diabetic retinopathy present.',
            },
        ],
    },
    {
        id: '2',
        name: 'Mary Johnson',
        dateOfBirth: '1978-08-22',
        createdAt: new Date('2024-02-05'),
        scans: [
            {
                id: 's3',
                name: 'Bilateral OCT',
                imageUrl: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400',
                uploadedAt: new Date('2024-02-05'),
                type: 'oct',
                diseases: [
                    { name: 'Age-Related Macular Degeneration', probability: 35, severity: 'low', description: 'Early drusen deposits.' },
                ],
                summary: 'Low risk findings. Routine monitoring advised.',
            },
        ],
    },
];
const PatientRecords = () => {
    const navigate = useNavigate();
    const [patients] = useState(mockPatients);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [showNewPatientModal, setShowNewPatientModal] = useState(false);
    const calculateOverallRisk = (patient) => {
        const allDiseases = patient.scans.flatMap(s => s.diseases);
        const maxProb = Math.max(...allDiseases.map(d => d.probability), 0);
        if (maxProb >= 70)
            return { level: 'High Risk', color: '#ef4444' };
        if (maxProb >= 40)
            return { level: 'Moderate Risk', color: '#f59e0b' };
        return { level: 'Low Risk', color: '#22c55e' };
    };
    const generateComprehensiveReport = (patient, forDoctor) => {
        const allDiseases = patient.scans.flatMap(s => s.diseases);
        const uniqueDiseases = allDiseases.reduce((acc, d) => {
            const existing = acc.find(e => e.name === d.name);
            if (!existing || existing.probability < d.probability) {
                return [...acc.filter(e => e.name !== d.name), d];
            }
            return acc;
        }, []);
        return uniqueDiseases.sort((a, b) => b.probability - a.probability);
    };
    return (<div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <header style={{
            backgroundColor: 'white',
            borderBottom: '1px solid #e5e7eb',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
        }}>
        <div onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            backgroundColor: '#ecfeff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <Eye size={24} style={{ color: '#0891b2' }}/>
          </div>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#111' }}>EyeQ</h1>
            <p style={{ fontSize: '12px', color: '#6b7280' }}>by LucidEye</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => navigate('/dashboard')} style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            backgroundColor: 'white',
            cursor: 'pointer',
            fontWeight: 500,
        }}>
            <ArrowLeft size={16} style={{ marginRight: '6px' }}/> Back to Dashboard
          </button>
          <button onClick={() => setShowNewPatientModal(true)} style={{
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: '#0891b2',
            color: 'white',
            cursor: 'pointer',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
        }}>
            <UserPlus size={16} style={{ marginRight: '6px' }}/> New Patient
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', height: 'calc(100vh - 73px)' }}>
        {/* Patient List */}
        <div style={{
            width: '350px',
            backgroundColor: 'white',
            borderRight: '1px solid #e5e7eb',
            overflowY: 'auto',
        }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#111' }}>Patient Records</h2>
            <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>{patients.length} patients</p>
          </div>
          {patients.map((patient) => {
            const risk = calculateOverallRisk(patient);
            return (<div key={patient.id} onClick={() => setSelectedPatient(patient)} style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #e5e7eb',
                    cursor: 'pointer',
                    backgroundColor: selectedPatient?.id === patient.id ? '#ecfeff' : 'transparent',
                    transition: 'background-color 0.2s',
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontWeight: 600, color: '#111' }}>{patient.name}</h3>
                    <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>
                      DOB: {new Date(patient.dateOfBirth).toLocaleDateString()}
                    </p>
                    <p style={{ fontSize: '13px', color: '#6b7280' }}>
                      {patient.scans.length} scan(s)
                    </p>
                  </div>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '4px 8px',
                    borderRadius: '12px',
                    backgroundColor: risk.color + '20',
                    color: risk.color,
                }}>
                    {risk.level}
                  </span>
                </div>
              </div>);
        })}
        </div>

        {/* Patient Detail */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {selectedPatient ? (<>
              {/* Patient Header */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#111' }}>{selectedPatient.name}</h2>
                    <p style={{ color: '#6b7280', marginTop: '4px' }}>
                      Date of Birth: {new Date(selectedPatient.dateOfBirth).toLocaleDateString()} | 
                      Patient since: {selectedPatient.createdAt.toLocaleDateString()}
                    </p>
                  </div>
                  <div style={{
                padding: '8px 16px',
                borderRadius: '20px',
                backgroundColor: calculateOverallRisk(selectedPatient).color + '20',
                color: calculateOverallRisk(selectedPatient).color,
                fontWeight: 600,
            }}>
                    {calculateOverallRisk(selectedPatient).level}
                  </div>
                </div>
              </div>

              {/* Scans Grid */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><Camera size={20}/> All Scans ({selectedPatient.scans.length})</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                  {selectedPatient.scans.map((scan) => (<div key={scan.id} style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    backgroundColor: '#f9fafb',
                }}>
                      <img src={scan.imageUrl} alt={scan.name} style={{ width: '100%', height: '150px', objectFit: 'cover' }}/>
                      <div style={{ padding: '12px' }}>
                        <p style={{ fontWeight: 600, fontSize: '14px' }}>{scan.name}</p>
                        <p style={{ fontSize: '12px', color: '#6b7280' }}>
                          {scan.type.toUpperCase()} • {scan.uploadedAt.toLocaleDateString()}
                        </p>
                      </div>
                    </div>))}
                </div>
              </div>

              {/* Doctor Report */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><Stethoscope size={20}/> Doctor's Comprehensive Report</h3>
                <div style={{ backgroundColor: '#f8fafc', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
                  <p style={{ fontWeight: 600, marginBottom: '8px' }}>Clinical Summary</p>
                  <p style={{ color: '#374151', lineHeight: 1.6 }}>
                    Patient presents with {selectedPatient.scans.length} documented scan(s). 
                    Analysis indicates {calculateOverallRisk(selectedPatient).level.toLowerCase()} findings 
                    requiring {calculateOverallRisk(selectedPatient).level === 'High Risk' ? 'immediate specialist consultation' :
                calculateOverallRisk(selectedPatient).level === 'Moderate Risk' ? 'follow-up within 3-6 months' : 'routine monitoring'}.
                  </p>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f3f4f6' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px' }}>Condition</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px' }}>Probability</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px' }}>Severity</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px' }}>Clinical Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {generateComprehensiveReport(selectedPatient, true).map((disease, idx) => (<tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
                        <td style={{ padding: '12px', fontWeight: 500 }}>{disease.name}</td>
                        <td style={{ padding: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                    width: '60px',
                    height: '8px',
                    backgroundColor: '#e5e7eb',
                    borderRadius: '4px',
                    overflow: 'hidden',
                }}>
                              <div style={{
                    width: `${disease.probability}%`,
                    height: '100%',
                    backgroundColor: disease.probability >= 70 ? '#ef4444' : disease.probability >= 40 ? '#f59e0b' : '#22c55e',
                }}/>
                            </div>
                            <span style={{ fontSize: '14px', fontWeight: 600 }}>{disease.probability}%</span>
                          </div>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 600,
                    backgroundColor: disease.severity === 'high' ? '#fef2f2' : disease.severity === 'medium' ? '#fffbeb' : '#f0fdf4',
                    color: disease.severity === 'high' ? '#ef4444' : disease.severity === 'medium' ? '#f59e0b' : '#22c55e',
                }}>
                            {disease.severity.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '12px', fontSize: '14px', color: '#6b7280' }}>{disease.description}</td>
                      </tr>))}
                  </tbody>
                </table>
              </div>

              {/* Patient Report */}
              <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><User size={20}/> Patient-Friendly Summary</h3>
                <div style={{ backgroundColor: '#ecfeff', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
                  <p style={{ fontWeight: 600, color: '#0891b2', marginBottom: '8px' }}>Your Eye Health Overview</p>
                  <p style={{ color: '#374151', lineHeight: 1.6 }}>
                    Based on your {selectedPatient.scans.length} eye scan(s), our AI has analyzed your eye health. 
                    Here's what we found in simple terms:
                  </p>
                </div>
                {generateComprehensiveReport(selectedPatient, false).map((disease, idx) => (<div key={idx} style={{
                    padding: '16px',
                    borderBottom: idx < generateComprehensiveReport(selectedPatient, false).length - 1 ? '1px solid #e5e7eb' : 'none',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontWeight: 600 }}>{disease.name}</span>
                      <span style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: 500,
                    backgroundColor: disease.probability >= 70 ? '#fef2f2' : disease.probability >= 40 ? '#fffbeb' : '#f0fdf4',
                    color: disease.probability >= 70 ? '#ef4444' : disease.probability >= 40 ? '#f59e0b' : '#22c55e',
                }}>
                        {disease.probability >= 70 ? 'Needs Attention' : disease.probability >= 40 ? 'Monitor' : 'Looking Good'}
                      </span>
                    </div>
                    <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.5 }}>
                      {disease.description} {disease.probability >= 40 ? 'We recommend discussing this with your eye doctor.' : 'No immediate action needed.'}
                    </p>
                  </div>))}
                <div style={{
                marginTop: '16px',
                padding: '16px',
                backgroundColor: '#f0fdf4',
                borderRadius: '8px',
                borderLeft: '4px solid #22c55e',
            }}>
                  <p style={{ fontWeight: 600, color: '#166534', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}><Lightbulb size={16}/> Next Steps</p>
                  <p style={{ fontSize: '14px', color: '#374151' }}>
                    {calculateOverallRisk(selectedPatient).level === 'High Risk'
                ? 'Please schedule an appointment with an eye specialist as soon as possible.'
                : calculateOverallRisk(selectedPatient).level === 'Moderate Risk'
                    ? 'Consider scheduling a follow-up appointment within the next few months.'
                    : 'Continue with regular eye check-ups as recommended by your doctor.'}
                  </p>
                </div>
              </div>
            </>) : (<div style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                color: '#6b7280',
            }}>
              <FileText size={48} style={{ marginBottom: '16px', color: '#9ca3af' }}/>
              <p style={{ fontSize: '18px' }}>Select a patient to view their records</p>
            </div>)}
        </div>
      </div>

      {/* New Patient Modal */}
      {showNewPatientModal && (<div style={{
                position: 'fixed',
                inset: 0,
                zIndex: 50,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
          <div onClick={() => setShowNewPatientModal(false)} style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
            }}/>
          <div style={{
                position: 'relative',
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '24px',
                width: '400px',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px' }}>Add New Patient</h2>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px' }}>Full Name</label>
              <input type="text" placeholder="Enter patient name" style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                fontSize: '14px',
            }}/>
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: 500, marginBottom: '6px' }}>Date of Birth</label>
              <input type="date" style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                fontSize: '14px',
            }}/>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowNewPatientModal(false)} style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                backgroundColor: 'white',
                cursor: 'pointer',
            }}>
                Cancel
              </button>
              <button onClick={() => setShowNewPatientModal(false)} style={{
                flex: 1,
                padding: '10px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#0891b2',
                color: 'white',
                cursor: 'pointer',
            }}>
                Create Patient
              </button>
            </div>
          </div>
        </div>)}
    </div>);
};
export default PatientRecords;
