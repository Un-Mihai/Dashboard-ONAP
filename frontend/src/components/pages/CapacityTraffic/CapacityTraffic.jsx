import React, { useState } from 'react';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import './CapacityTraffic.css';

const throughputTrendData = [
  { time: '00:00', dlMbps: 45, ulMbps: 8 },
  { time: '04:00', dlMbps: 20, ulMbps: 4 },
  { time: '08:00', dlMbps: 85, ulMbps: 15 },
  { time: '12:00', dlMbps: 140, ulMbps: 28 },
  { time: '16:00', dlMbps: 165, ulMbps: 32 },
  { time: '20:00', dlMbps: 130, ulMbps: 22 },
  { time: '24:00', dlMbps: 55, ulMbps: 10 },
];

const prbTrendData = [
  { time: '00:00', prbDl: 25, peakPrb: 40 },
  { time: '04:00', prbDl: 15, peakPrb: 25 },
  { time: '08:00', prbDl: 55, peakPrb: 75 },
  { time: '12:00', prbDl: 82, peakPrb: 96 },
  { time: '16:00', prbDl: 88, peakPrb: 100 },
  { time: '20:00', prbDl: 70, peakPrb: 88 },
  { time: '24:00', prbDl: 30, peakPrb: 50 },
];

const topCongestedStations = [
  { id: 1, name: "gNB_Iulius_Town", prbDl: 88.5, prbUl: 62.0, peakPrb: 100.0, throughputDl: 165.2 },
  { id: 2, name: "gNB_Complex_Studentesc", prbDl: 82.1, prbUl: 58.4, peakPrb: 96.0, throughputDl: 140.0 },
  { id: 3, name: "gNB_Timisoara_Centru", prbDl: 65.4, prbUl: 41.2, peakPrb: 82.0, throughputDl: 110.5 },
  { id: 4, name: "gNB_Mehala", prbDl: 42.0, prbUl: 28.0, peakPrb: 60.0, throughputDl: 75.0 },
  { id: 5, name: "gNB_Gara_de_Nord", prbDl: 0.0, prbUl: 0.0, peakPrb: 0.0, throughputDl: 0.0 },
];

export default function CapacityTraffic({ viewMode }) {
  const [showOnlyCongested, setShowOnlyCongested] = useState(false);

  const getPrbBadgeClass = (prb) => {
    if (prb >= 85) return 'critical';
    if (prb >= 70) return 'high';
    return 'normal';
  };

  const displayedStations = showOnlyCongested 
    ? topCongestedStations.filter(st => st.prbDl > 75)
    : topCongestedStations;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const peakValue = payload.find(p => p.dataKey === 'peakPrb')?.value;
      const isPeakAlert = peakValue >= 100;

      return (
        <div style={{ backgroundColor: '#161b22', border: `1px solid ${isPeakAlert ? '#da3633' : '#30363d'}`, padding: '10px', borderRadius: '4px' }}>
          <p style={{ margin: 0, color: '#8b949e', marginBottom: '5px' }}>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ margin: 0, color: entry.color, fontSize: '13px', fontWeight: 'bold' }}>
              {entry.name}: {entry.value}%
            </p>
          ))}
          {isPeakAlert && (
            <p style={{ color: '#da3633', margin: '5px 0 0 0', fontSize: '12px', fontWeight: 'bold' }}>
              ALERTĂ: SATURAȚIE MAXIMĂ (100%)
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="capacity-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h2 style={{ margin: 0, color: '#c9d1d9' }}>Capacity & Traffic Management</h2>
        <button 
          onClick={() => setShowOnlyCongested(!showOnlyCongested)}
          style={{
            backgroundColor: showOnlyCongested ? '#da3633' : '#238636',
            color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px',
            cursor: 'pointer', fontWeight: 'bold'
          }}
        >
          {showOnlyCongested ? 'Elimină Filtru' : 'Filtrează: Congestie (>75%)'}
        </button>
      </div>

      <div className="capacity-kpi-grid">
        <div className="capacity-card">
          <h4>DL Throughput Mediu</h4>
          <p className="kpi-value">118.5 Mbps</p>
        </div>
        <div className="capacity-card">
          <h4>UL Throughput Mediu</h4>
          <p className="kpi-value">19.8 Mbps</p>
        </div>
        <div className="capacity-card">
          <h4>PRB DL Mediu %</h4>
          <p className="kpi-value warning">72.4%</p>
        </div>
        <div className="capacity-card">
          <h4>Peak PRB Slot Max %</h4>
          <p className="kpi-value critical">100.0% (MAX)</p>
        </div>
      </div>

      {viewMode === 'grafic' ? (
        <>
          <div className="capacity-charts-grid">
            <div className="capacity-card">
              <h3>Evoluție Throughput DL vs. UL (Mbps)</h3>
              <div className="chart-box-280">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={throughputTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
                    <XAxis dataKey="time" stroke="#8b949e" />
                    <YAxis stroke="#8b949e" />
                    <Tooltip contentStyle={{ backgroundColor: '#161b22', border: '1px solid #30363d' }} />
                    <Legend />
                    <Line type="monotone" dataKey="dlMbps" name="Throughput DL (Mbps)" stroke="#58a6ff" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="ulMbps" name="Throughput UL (Mbps)" stroke="#3fb950" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="capacity-card">
              <h3>Grad de Ocupare Resurse (PRB DL % vs Peak)</h3>
              <div className="chart-box-280">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={prbTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
                    <XAxis dataKey="time" stroke="#8b949e" />
                    <YAxis stroke="#8b949e" domain={[0, 100]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area type="monotone" dataKey="peakPrb" name="Peak PRB Slot Max %" stroke="#f85149" fill="#f8514922" />
                    <Area type="monotone" dataKey="prbDl" name="PRB DL Mediu %" stroke="#d29922" fill="#d2992222" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="capacity-card">
            <h3>Top Stații Congestionate (Ordonat după Ocuparea PRB DL)</h3>
            <table className="capacity-table">
              <thead>
                <tr>
                  <th>Stație ID</th>
                  <th>PRB DL %</th>
                  <th>PRB UL %</th>
                  <th>Peak PRB %</th>
                  <th>Throughput DL (Mbps)</th>
                  <th>Nivel Congestie</th>
                </tr>
              </thead>
              <tbody>
                {displayedStations.map((st) => (
                  <tr key={st.id}>
                    <td>{st.name}</td>
                    <td>{st.prbDl}%</td>
                    <td>{st.prbUl}%</td>
                    <td style={{ color: st.peakPrb >= 100 ? '#da3633' : 'inherit', fontWeight: st.peakPrb >= 100 ? 'bold' : 'normal' }}>
                      {st.peakPrb}% {st.peakPrb >= 100 && '(MAX)'}
                    </td>
                    <td>{st.throughputDl} Mbps</td>
                    <td>
                      <span className={`prb-badge ${getPrbBadgeClass(st.prbDl)}`}>
                        {st.prbDl >= 85 ? 'CRITICAL' : st.prbDl >= 70 ? 'WARNING' : 'OK'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="capacity-card">
          <h3>Raport Detaliat Capacitate & Trafic Radio</h3>
          <table className="capacity-table">
            <thead>
              <tr>
                <th>Stație ID</th>
                <th>PRB DL Utilizat %</th>
                <th>PRB UL Utilizat %</th>
                <th>Peak PRB Slot Max %</th>
                <th>DL Throughput (Mbps)</th>
                <th>Status Ocupare</th>
              </tr>
            </thead>
            <tbody>
              {displayedStations.map((st) => (
                <tr key={st.id}>
                  <td>{st.name}</td>
                  <td>{st.prbDl}%</td>
                  <td>{st.prbUl}%</td>
                  <td style={{ color: st.peakPrb >= 100 ? '#da3633' : 'inherit', fontWeight: st.peakPrb >= 100 ? 'bold' : 'normal' }}>
                    {st.peakPrb}% {st.peakPrb >= 100 && '(MAX)'}
                  </td>
                  <td>{st.throughputDl} Mbps</td>
                  <td>
                    <span className={`prb-badge ${getPrbBadgeClass(st.prbDl)}`}>
                      {st.prbDl >= 85 ? 'CONGESTIONAT' : st.prbDl >= 70 ? 'ÎNCĂRCAT' : 'OPTIM'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}