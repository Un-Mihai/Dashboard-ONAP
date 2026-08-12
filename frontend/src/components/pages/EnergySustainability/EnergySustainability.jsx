import React from 'react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import './EnergySustainability.css';

const topConsumersData = [
  { name: 'gNB_Iulius_Town', power: 850 },
  { name: 'gNB_Complex_Stud', power: 550 },
  { name: 'gNB_Timisoara_Centru', power: 400 },
  { name: 'gNB_Calea_Sagului', power: 380 },
  { name: 'gNB_Mehala', power: 310 },
];

const efficiencyTrendData = [
  { time: '00:00', eficienta: 1.2 },
  { time: '04:00', eficienta: 0.5 },
  { time: '08:00', eficienta: 2.1 },
  { time: '12:00', eficienta: 4.8 },
  { time: '16:00', eficienta: 5.2 },
  { time: '20:00', eficienta: 3.9 },
  { time: '24:00', eficienta: 1.8 },
];

const stationEnergyData = [
  { id: 1, name: "gNB_Iulius_Town", voltage: 48.2, power: 850, traffic: 850, efficiency: 3.5 },
  { id: 2, name: "gNB_Complex_Studentesc", voltage: 47.9, power: 550, traffic: 450, efficiency: 2.8 },
  { id: 3, name: "gNB_Timisoara_Centru", voltage: 48.5, power: 400, traffic: 120, efficiency: 0.8 },
  { id: 4, name: "gNB_Gara_de_Nord", voltage: 0.0, power: 0, traffic: 0, efficiency: 0.0 },
];

export default function EnergySustainability({ viewMode }) {
  const getEfficiencyClass = (efficiency) => {
    if (efficiency === 0) return 'critical';
    if (efficiency < 1.0) return 'critical';
    if (efficiency < 2.5) return 'medium';
    return 'good';
  };

  return (
    <>
      {viewMode === 'grafic' ? (
        <div className="energy-container">
          <div className="energy-kpi-grid">
            <div className="energy-card">
              <h4>Total Energy (kWh)</h4>
              <p className="kpi-value">142.5 kWh</p>
            </div>
            <div className="energy-card">
              <h4>Power Mediu (W)</h4>
              <p className="kpi-value warning">450 W</p>
            </div>
            <div className="energy-card">
              <h4>Voltage Mediu (V)</h4>
              <p className="kpi-value">48.2 V</p>
            </div>
            <div className="energy-card">
              <h4>Eficiență (GB / kWh)</h4>
              <p className="kpi-value success">3.2 GB/kWh</p>
            </div>
          </div>

          <div className="energy-card">
            <h3>Top Stații după Consumul Energetic (Watts)</h3>
            <div className="chart-container-280">
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

          <div className="energy-card">
            <h3>Eficiența Energetică în Timp (GB per kWh)</h3>
            <div className="chart-container-280">
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
        <div className="energy-card">
          <h3>Monitorizare RFM Energie per Stație</h3>
          <table className="energy-table">
            <thead>
              <tr>
                <th>Stație ID</th>
                <th>Tensiune (V)</th>
                <th>Consum Mediu (W)</th>
                <th>Trafic (GB)</th>
                <th>Eficiență (GB/kWh)</th>
                <th>Recomandare Sistem</th>
              </tr>
            </thead>
            <tbody>
              {stationEnergyData.map((st) => {
                const isInefficient = st.efficiency > 0 && st.efficiency < 1.0;

                return (
                  <tr key={st.id}>
                    <td>{st.name}</td>
                    <td>{st.voltage} V</td>
                    <td>{st.power} W</td>
                    <td>{st.traffic} GB</td>
                    <td>
                      <span className={`efficiency-text ${getEfficiencyClass(st.efficiency)}`}>
                        {st.efficiency} GB/kWh
                      </span>
                    </td>
                    <td>
                      {isInefficient ? (
                        <span style={{ 
                          backgroundColor: '#1f6beb', color: 'white', padding: '4px 10px', 
                          borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '5px' 
                        }}>
                          Sugestie: Activare Eco/Night Mode
                        </span>
                      ) : st.efficiency === 0 ? (
                        <span style={{ color: '#8b949e', fontStyle: 'italic', fontSize: '12px' }}>Stație Offline</span>
                      ) : (
                        <span style={{ color: '#2ea043', fontSize: '12px', fontWeight: 'bold' }}>Parametri Optimi</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}