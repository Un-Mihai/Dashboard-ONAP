import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import './NetworkOverview.css';

const mockChartData = [
  { time: '00:00', trafic: 120, putere: 300 },
  { time: '04:00', trafic: 80, putere: 250 },
  { time: '08:00', trafic: 250, putere: 450 },
  { time: '12:00', trafic: 450, putere: 600 },
  { time: '16:00', trafic: 500, putere: 620 },
  { time: '20:00', trafic: 380, putere: 510 },
  { time: '24:00', trafic: 150, putere: 320 },
];

export default function NetworkOverview({ viewMode }) {
  const [networkData, setNetworkData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:8000/api/overview')
      .then((res) => {
        setNetworkData(res.data);
        setLoading(false);
      })
      .catch(() => {
        console.warn("Backend-ul nu răspunde, folosim date de test pentru design.");
        setNetworkData({
          total_gnb: 15,
          avg_availability: 99.5,
          total_traffic: 1420,
          avg_power: 450,
          stations: [
            // Am adaugat campul "active_alarms" pentru a testa ideea Denisei
            { id: 1, name: "gNB_Timisoara_Centru", availability: 100, traffic: 120, power: 400, active_alarms: 0 },
            { id: 2, name: "gNB_Complex_Studentesc", availability: 99.2, traffic: 450, power: 550, active_alarms: 2 },
            { id: 3, name: "gNB_Gara_de_Nord", availability: 0, traffic: 0, power: 0, active_alarms: 5 },
            { id: 4, name: "gNB_Iulius_Town", availability: 100, traffic: 850, power: 850, active_alarms: 0 }
          ]
        });
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="status-loading">Se încarcă datele din baza de date...</p>;
  if (error) return <p className="status-error">{error}</p>;

  return (
    <>
      {viewMode === 'grafic' ? (
        <div className="overview-container">
          {/* KPI Cards */}
          <div className="kpi-grid">
            <div className="overview-card">
              <h4>Total gNB-uri</h4>
              <p className="kpi-value">{networkData?.total_gnb || 0}</p>
            </div>
            <div className="overview-card">
              <h4>Availability Mediu</h4>
              <p className="kpi-value green">{networkData?.avg_availability || '0'}%</p>
            </div>
            <div className="overview-card">
              <h4>Trafic Total (DL+UL)</h4>
              <p className="kpi-value">{networkData?.total_traffic || '0'} GB</p>
            </div>
            <div className="overview-card">
              <h4>Putere Medie</h4>
              <p className="kpi-value">{networkData?.avg_power || '0'} W</p>
            </div>
          </div>

          {/* Grid View Stații cu Indicatori de Alertă (Ideea Denisei) */}
          <div className="overview-card">
            <h3>Grid View Stații (Status în Timp Real)</h3>
            <div className="stations-grid">
              {(networkData?.stations || []).map((st) => {
                const isOk = st.availability >= 99.8;
                const isWarning = st.availability < 99.8 && st.availability > 0;
                const borderColor = isOk ? '#2ea043' : isWarning ? '#d29922' : '#f85149';
                
                // Verificam daca statia e picata SAU are alarme active
                const hasAlerts = st.availability === 0 || st.active_alarms > 0;

                return (
                  <div key={st.id} className="station-item" style={{ border: `1px solid ${borderColor}`, position: 'relative' }}>
                    
                    {/* BULINA DE ALERTĂ */}
                    {hasAlerts && (
                      <div 
                        title={`${st.active_alarms} alerte active!`}
                        style={{
                          position: 'absolute', top: '-8px', right: '-8px',
                          backgroundColor: '#f85149', color: 'white',
                          borderRadius: '50%', width: '22px', height: '22px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '11px', fontWeight: 'bold', border: '2px solid #0d1117',
                          boxShadow: '0 0 8px rgba(248, 81, 73, 0.6)'
                        }}
                      >
                        {st.availability === 0 ? '!' : st.active_alarms}
                      </div>
                    )}

                    <div className="station-item-title" title={st.name}>
                      {st.name}
                    </div>
                    <div className="station-item-sub" style={{ color: borderColor }}>
                      {st.availability}% OK
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Graficul Compus */}
          <div className="overview-card">
            <h3>Trafic Total (GB) vs. Putere Consumată (W) în ultimele 24h</h3>
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
                  <XAxis dataKey="time" stroke="#8b949e" />
                  <YAxis yAxisId="left" stroke="#58a6ff" />
                  <YAxis yAxisId="right" orientation="right" stroke="#e34c26" />
                  <Tooltip contentStyle={{ backgroundColor: '#161b22', border: '1px solid #30363d' }} />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="trafic" name="Trafic (GB)" stroke="#58a6ff" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line yAxisId="right" type="monotone" dataKey="putere" name="Putere (W)" stroke="#e34c26" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        /* Versiunea Tabelară */
        <div className="overview-card">
          <h3>Tabel Detaliat Rețea</h3>
          <table className="overview-table">
            <thead>
              <tr>
                <th>Stație (gNB)</th>
                <th>Disponibilitate %</th>
                <th>Trafic DL+UL (GB)</th>
                <th>Consum Mediu (W)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {(networkData?.stations || []).map((st) => (
                <tr key={st.id}>
                  <td>{st.name}</td>
                  <td>{st.availability}%</td>
                  <td>{st.traffic} GB</td>
                  <td>{st.power} W</td>
                  <td>
                    <span className={`status-badge ${st.availability >= 99.8 ? 'online' : 'down'}`}>
                      {st.availability >= 99.8 ? 'ONLINE' : 'DOWN'}
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