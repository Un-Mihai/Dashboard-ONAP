import React from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// Date de test pentru consumul top stațiilor (Bar Chart)
const topConsumersData = [
  { name: 'gNB_Iulius_Town', power: 850 },
  { name: 'gNB_Complex_Stud', power: 550 },
  { name: 'gNB_Timisoara_Centru', power: 400 },
  { name: 'gNB_Calea_Sagului', power: 380 },
  { name: 'gNB_Mehala', power: 310 },
];

// Date de test pentru trendul de eficiență GB/kWh (Line Chart)
const efficiencyTrendData = [
  { time: '00:00', eficienta: 1.2 },
  { time: '04:00', eficienta: 0.5 }, // Scade noaptea când e trafic mic dar stația consumă curent
  { time: '08:00', eficienta: 2.1 },
  { time: '12:00', eficienta: 4.8 },
  { time: '16:00', eficienta: 5.2 },
  { time: '20:00', eficienta: 3.9 },
  { time: '24:00', eficienta: 1.8 },
];

// Date de test pentru tabel
const stationEnergyData = [
  { id: 1, name: "gNB_Iulius_Town", voltage: 48.2, power: 850, traffic: 850, efficiency: 3.5 },
  { id: 2, name: "gNB_Complex_Studentesc", voltage: 47.9, power: 550, traffic: 450, efficiency: 2.8 },
  { id: 3, name: "gNB_Timisoara_Centru", voltage: 48.5, power: 400, traffic: 120, efficiency: 1.1 },
  { id: 4, name: "gNB_Gara_de_Nord", voltage: 0.0, power: 0, traffic: 0, efficiency: 0.0 },
];

export default function EnergySustainability({ viewMode }) {
  const cardStyle = { backgroundColor: '#161b22', border: '1px solid #30363d', borderRadius: '8px', padding: '20px', color: '#c9d1d9' };
  const kpiValue = { fontSize: '28px', fontWeight: 'bold', color: '#58a6ff', margin: '10px 0 0 0' };
  const thStyle = { padding: '12px', color: '#8b949e', fontSize: '13px', textAlign: 'left' };
  const tdStyle = { padding: '12px', fontSize: '14px' };

  return (
    <>
      {viewMode === 'grafic' ? (
        <div style={{ display: 'grid', gap: '20px' }}>
          
          {/* 1. METRICI ENERGIE & EFICIENȚĂ (KPI Cards) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            <div style={cardStyle}>
              <h4>Total Energy (kWh)</h4>
              <p style={kpiValue}>142.5 kWh</p>
            </div>
            <div style={cardStyle}>
              <h4>Power Mediu (W)</h4>
              <p style={{ ...kpiValue, color: '#d29922' }}>450 W</p>
            </div>
            <div style={cardStyle}>
              <h4>Voltage Mediu (V)</h4>
              <p style={kpiValue}>48.2 V</p>
            </div>
            <div style={cardStyle}>
              <h4>Eficiență (GB / kWh)</h4>
              <p style={{ ...kpiValue, color: '#3fb950' }}>3.2 GB/kWh</p>
            </div>
          </div>

          {/* 2. GRAFIC 1: Top Consumatori de Energie (Bar Chart) */}
          <div style={cardStyle}>
            <h3>Top Stații după Consumul Energetic (Watts)</h3>
            <div style={{ height: '280px', marginTop: '20px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topConsumersData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
                  <XAxis dataKey="name" stroke="#8b949e" />
                  <YAxis stroke="#8b949e" />
                  <Tooltip contentStyle={{ backgroundColor: '#161b22', border: '1px solid #30363d' }} />
                  <Bar dataKey="power" name="Consum Mediu (W)" fill="#d29922" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 3. GRAFIC 2: Eficiența Energetică în Timp (Line Chart) */}
          <div style={cardStyle}>
            <h3>Eficiența Energetică în Timp (GB per kWh)</h3>
            <div style={{ height: '280px', marginTop: '20px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={efficiencyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
                  <XAxis dataKey="time" stroke="#8b949e" />
                  <YAxis stroke="#8b949e" />
                  <Tooltip contentStyle={{ backgroundColor: '#161b22', border: '1px solid #30363d' }} />
                  <Legend />
                  <Line type="monotone" dataKey="eficienta" name="Eficiență (GB/kWh)" stroke="#2ea043" strokeWidth={2} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      ) : (
        /* VERSIUNEA TABELARĂ: RFM Energy Monitoring */
        <div style={cardStyle}>
          <h3>Monitorizare RFM Energie per Stație</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px', color: '#c9d1d9' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #30363d', backgroundColor: '#0d1117' }}>
                <th style={thStyle}>Stație ID</th>
                <th style={thStyle}>Tensiune (V)</th>
                <th style={thStyle}>Consum Mediu (W)</th>
                <th style={thStyle}>Trafic (GB)</th>
                <th style={thStyle}>Eficiență (GB/kWh)</th>
              </tr>
            </thead>
            <tbody>
              {stationEnergyData.map((st) => (
                <tr key={st.id} style={{ borderBottom: '1px solid #21262d' }}>
                  <td style={tdStyle}>{st.name}</td>
                  <td style={tdStyle}>{st.voltage} V</td>
                  <td style={tdStyle}>{st.power} W</td>
                  <td style={tdStyle}>{st.traffic} GB</td>
                  <td style={tdStyle}>
                    <span style={{
                      fontWeight: 'bold',
                      color: st.efficiency < 1.0 ? '#f85149' : st.efficiency < 2.5 ? '#d29922' : '#3fb950'
                    }}>
                      {st.efficiency} GB/kWh
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}