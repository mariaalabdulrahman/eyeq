import { useState } from "react";
import { Patient } from "@/types/scan";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from "recharts";
import { Filter, Users, Activity, AlertTriangle, TrendingUp } from "lucide-react";

interface PatientStatisticsProps {
  patients: Patient[];
}

const COLORS = ['#0891b2', '#06b6d4', '#22d3ee', '#ef4444', '#f59e0b', '#22c55e', '#8b5cf6', '#ec4899'];

export function PatientStatistics({ patients }: PatientStatisticsProps) {
  const [ageFilter, setAgeFilter] = useState<string>('all');
  const [diseaseFilter, setDiseaseFilter] = useState<string>('all');

  // Calculate age from DOB
  const getAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Get all unique diseases
  const allDiseases = Array.from(new Set(
    patients.flatMap(p => p.scans.flatMap(s => s.diseases.map(d => d.name)))
  ));

  // Filter patients
  const filteredPatients = patients.filter(p => {
    const age = getAge(p.dateOfBirth);
    const patientDiseases = p.scans.flatMap(s => s.diseases.map(d => d.name));
    
    let ageMatch = true;
    if (ageFilter === '0-20') ageMatch = age >= 0 && age <= 20;
    else if (ageFilter === '21-40') ageMatch = age >= 21 && age <= 40;
    else if (ageFilter === '41-60') ageMatch = age >= 41 && age <= 60;
    else if (ageFilter === '60+') ageMatch = age > 60;
    
    const diseaseMatch = diseaseFilter === 'all' || patientDiseases.includes(diseaseFilter);
    
    return ageMatch && diseaseMatch;
  });

  // Disease distribution data
  const diseaseDistribution = filteredPatients.reduce((acc, p) => {
    p.scans.forEach(s => {
      s.diseases.forEach(d => {
        acc[d.name] = (acc[d.name] || 0) + 1;
      });
    });
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(diseaseDistribution)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({ name, value }));

  // Risk distribution
  const riskData = [
    { name: 'High Risk', value: filteredPatients.filter(p => {
      const maxProb = Math.max(...p.scans.flatMap(s => s.diseases.map(d => d.probability)), 0);
      return maxProb >= 70;
    }).length, color: '#ef4444' },
    { name: 'Moderate', value: filteredPatients.filter(p => {
      const maxProb = Math.max(...p.scans.flatMap(s => s.diseases.map(d => d.probability)), 0);
      return maxProb >= 40 && maxProb < 70;
    }).length, color: '#f59e0b' },
    { name: 'Low Risk', value: filteredPatients.filter(p => {
      const maxProb = Math.max(...p.scans.flatMap(s => s.diseases.map(d => d.probability)), 0);
      return maxProb < 40;
    }).length, color: '#22c55e' },
  ];

  // Age distribution
  const ageDistribution = [
    { name: '0-20', value: filteredPatients.filter(p => getAge(p.dateOfBirth) <= 20).length },
    { name: '21-40', value: filteredPatients.filter(p => { const a = getAge(p.dateOfBirth); return a >= 21 && a <= 40; }).length },
    { name: '41-60', value: filteredPatients.filter(p => { const a = getAge(p.dateOfBirth); return a >= 41 && a <= 60; }).length },
    { name: '60+', value: filteredPatients.filter(p => getAge(p.dateOfBirth) > 60).length },
  ];

  // Scan type distribution
  const scanTypeData = [
    { name: 'OCT', value: filteredPatients.reduce((sum, p) => sum + p.scans.filter(s => s.type === 'oct').length, 0) },
    { name: 'Fundus', value: filteredPatients.reduce((sum, p) => sum + p.scans.filter(s => s.type === 'fundus').length, 0) },
  ];

  return (
    <div style={{ padding: '24px', overflowY: 'auto', height: '100%' }}>
      {/* Filters */}
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '12px', 
        padding: '20px',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Filter size={20} style={{ color: '#0891b2' }} />
          <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Filters</h3>
        </div>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '6px', color: '#6b7280' }}>Age Range</label>
            <select
              value={ageFilter}
              onChange={(e) => setAgeFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                fontSize: '14px',
                minWidth: '120px',
              }}
            >
              <option value="all">All Ages</option>
              <option value="0-20">0-20 years</option>
              <option value="21-40">21-40 years</option>
              <option value="41-60">41-60 years</option>
              <option value="60+">60+ years</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, marginBottom: '6px', color: '#6b7280' }}>Disease</label>
            <select
              value={diseaseFilter}
              onChange={(e) => setDiseaseFilter(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                fontSize: '14px',
                minWidth: '180px',
              }}
            >
              <option value="all">All Diseases</option>
              {allDiseases.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#ecfeff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={24} style={{ color: '#0891b2' }} />
            </div>
            <div>
              <p style={{ fontSize: '28px', fontWeight: 700, color: '#111' }}>{filteredPatients.length}</p>
              <p style={{ fontSize: '13px', color: '#6b7280' }}>Total Patients</p>
            </div>
          </div>
        </div>
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={24} style={{ color: '#ef4444' }} />
            </div>
            <div>
              <p style={{ fontSize: '28px', fontWeight: 700, color: '#111' }}>{riskData[0].value}</p>
              <p style={{ fontSize: '13px', color: '#6b7280' }}>High Risk</p>
            </div>
          </div>
        </div>
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={24} style={{ color: '#22c55e' }} />
            </div>
            <div>
              <p style={{ fontSize: '28px', fontWeight: 700, color: '#111' }}>{filteredPatients.reduce((sum, p) => sum + p.scans.length, 0)}</p>
              <p style={{ fontSize: '13px', color: '#6b7280' }}>Total Scans</p>
            </div>
          </div>
        </div>
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={24} style={{ color: '#f59e0b' }} />
            </div>
            <div>
              <p style={{ fontSize: '28px', fontWeight: 700, color: '#111' }}>{Object.keys(diseaseDistribution).length}</p>
              <p style={{ fontSize: '13px', color: '#6b7280' }}>Conditions Found</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
        {/* Disease Distribution */}
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Disease Distribution</h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                dataKey="value"
                label={({ name, percent }) => `${name.slice(0,10)}${name.length > 10 ? '..' : ''} (${(percent * 100).toFixed(0)}%)`}
                labelLine={false}
              >
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Risk Levels */}
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Risk Level Distribution</h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={riskData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
                labelLine={false}
              >
                {riskData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Age Distribution */}
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Age Distribution</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={ageDistribution}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#0891b2" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Scan Types */}
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Scan Types</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={scanTypeData} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={60} />
              <Tooltip />
              <Bar dataKey="value" fill="#06b6d4" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}