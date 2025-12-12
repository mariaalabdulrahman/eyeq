import { useState, useRef, useEffect } from "react";
import { Patient } from "@/types/scan";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

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
}

interface PatientChatSidebarProps {
  patients: Patient[];
  onPatientSelect?: (patientId: string) => void;
}

const COLORS = ['#0891b2', '#06b6d4', '#22d3ee', '#67e8f9', '#a5f3fc', '#0e7490', '#155e75', '#164e63'];

export function PatientChatSidebar({ patients, onPatientSelect }: PatientChatSidebarProps) {
  const [input, setInput] = useState("");
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]);
  const [chatHistory, setChatHistory] = useState<PatientChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const generateChartResponse = (question: string, selectedPatientIds: string[]): PatientChatMessage => {
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
        content: `Out of ${relevantPatients.length} patient(s), ${highRiskCount} (${Math.round(highRiskCount/relevantPatients.length*100)}%) are classified as high risk. High risk patients have at least one detected condition with >70% probability.`,
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

    // Default response
    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: `I analyzed ${relevantPatients.length} patient record(s). They have a total of ${relevantPatients.reduce((sum, p) => sum + p.scans.length, 0)} scans. The most common condition is "${sortedDiseases[0]?.[0] || 'N/A'}" detected ${sortedDiseases[0]?.[1] || 0} times. You can ask about specific conditions, risk levels, or distribution patterns.`,
      timestamp: new Date(),
      selectedPatientIds,
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

    const assistantResponse = generateChartResponse(input.trim(), selectedPatients);

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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>🤖</span>
          <h3 style={{ fontWeight: 600, color: '#111' }}>Patient Analytics AI</h3>
        </div>
        <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
          Select patients or ask general queries
        </p>
      </div>

      {/* Patient Selection */}
      {patients.length > 0 && (
        <div style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb', maxHeight: '150px', overflowY: 'auto' }}>
          <p style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', marginBottom: '8px' }}>
            Filter by Patients (optional)
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {patients.map((patient) => (
              <button
                key={patient.id}
                onClick={() => {
                  togglePatientSelection(patient.id);
                  onPatientSelect?.(patient.id);
                }}
                style={{
                  padding: '4px 10px',
                  borderRadius: '14px',
                  border: selectedPatients.includes(patient.id) ? '2px solid #0891b2' : '1px solid #e5e7eb',
                  backgroundColor: selectedPatients.includes(patient.id) ? '#ecfeff' : 'white',
                  color: selectedPatients.includes(patient.id) ? '#0891b2' : '#374151',
                  fontSize: '11px',
                  cursor: 'pointer',
                }}
              >
                {selectedPatients.includes(patient.id) && '✓ '}
                {patient.name}
              </button>
            ))}
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
                <p style={{ fontSize: '14px', lineHeight: 1.5 }}>{message.content}</p>
              </div>
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