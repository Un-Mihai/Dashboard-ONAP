import React from 'react';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import './CapacityTraffic.css';

// Date de test pentru Throughput DL vs UL
const throughputTrendData = [
  { time: '00:00', dlMbps: 45, ulMbps: 8 },
  { time: '04:00', dlMbps: 20, ulMbps: 4 },
  { time: '08:00', dlMbps: 85, ulMbps: 15 },
  { time: '12:00', dlMbps: 140, ulMbps: 28 },
  { time: '16:00', dlMbps: 165, ulMbps: 32 },
  { time: '20:00', dlMbps: 130, ulMbps: 22 },
  { time: '24:00', dlMbps: 55, ulMbps: 10 },
];

// Date de test pentru Ocupare PRB (DL vs Peak)
const prbTrendData = [
  { time: '00:00', prbDl: 25, peakPrb: 40 },
  { time: '04:00', prbDl: 15, peakPrb: 25 },
  { time: '08:00', prbDl: 55, peakPrb: 75 },
  { time: '12:00', prbDl: 82, peakPrb: 96 },
  { time: '16:00', prbDl: 88, peakPrb: 99 },
  { time: '20:00', prbDl: 70, peakPrb: 88 },
  { time: '24:00', prbDl: 30, peakPrb: 50 },
];

// Top stații congestionate
const topCongestedStations = [
  { id: 1, name: "gNB_Iulius_Town", prbDl: 88.5, prbUl: 62.0, peakPrb: 99.0, throughputDl: 165.2 },
  { id: 2, name: "gNB_Complex_Studentesc", prbDl: 82.1, prbUl: 58.4, peakPrb: 96.0, throughputDl: 140.0 },
  { id: 3, name: "gNB_Timisoara_Centru", prbDl: 65.4, prbUl: 41.2, peakPrb: 82.0, throughputDl: 110.5 },
  { id: 4, name: "gNB_Mehala", prbDl: 42.0, prbUl: 28.0, peakPrb: 60.0, throughputDl: 75.0 },
  { id: 5, name: "gNB_Gara_de_Nord", prbDl: 0.0, prbUl: 0.0, peakPrb: 0.0, throughputDl: 0.0 },
];

export default function CapacityTraffic({ viewMode }) {
  const getPrbBadgeClass = (prb) => {
    if (prb >= 85) return 'critical';
    if (prb >= 70) return 'high';
    return 'normal';
  };

  return (
    <div className="capacity-container">
      
      {/* 1. KPI CARDS */}
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
          <p className="kpi-value critical">99.0%</p>
        </div>
      </div>

      {viewMode === 'grafic' ? (
        <>
          {/* 2. GRAFICE EVOLUȚIE */}
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
                    <YAxis stroke="#8b949e" />
                    <Tooltip contentStyle={{ backgroundColor: '#161b22', border: '1px solid #30363d' }} />
                    <Legend />
                    <Area type="monotone" dataKey="peakPrb" name="Peak PRB Slot Max %" stroke="#f85149" fill="#f8514922" />
                    <Area type="monotone" dataKey="prbDl" name="PRB DL Mediu %" stroke="#d29922" fill="#d2992222" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* 3. TOP STAȚII CONGESTIONATE */}
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
                {topCongestedStations.map((st) => (
                  <tr key={st.id}>
                    <td>{st.name}</td>
                    <td>{st.prbDl}%</td>
                    <td>{st.prbUl}%</td>
                    <td>{st.peakPrb}%</td>
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
        /* VERSIUNE TABELARĂ COMPLETA */
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
              {topCongestedStations.map((st) => (
                <tr key={st.id}>
                  <td>{st.name}</td>
                  <td>{st.prbDl}%</td>
                  <td>{st.prbUl}%</td>
                  <td>{st.peakPrb}%</td>
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