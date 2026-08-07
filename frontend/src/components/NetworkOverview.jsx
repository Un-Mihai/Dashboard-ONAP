import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// Date temporare pentru a simula istoricul pe ultimele 24h
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
    // Încercăm să luăm datele reale
    axios.get('http://localhost:8000/api/overview')
      .then((res) => {
        setNetworkData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.warn("Backend-ul nu răspunde, folosim date de test pentru design.");
        // DATE DE TEST (MOCK DATA)
        setNetworkData({
          total_gnb: 15,
          avg_availability: 99.5,
          total_traffic: 1420,
          avg_power: 450,
          stations: [
            { id: 1, name: "gNB_Timisoara_Centru", availability: 100, traffic: 120, power: 400 },
            { id: 2, name: "gNB_Complex_Studentesc", availability: 99.2, traffic: 450, power: 550 },
            { id: 3, name: "gNB_Gara_de_Nord", availability: 0, traffic: 0, power: 0 },
            { id: 4, name: "gNB_Iulius_Town", availability: 100, traffic: 850, power: 850 }
          ]
        });
        setLoading(false);
      });
  }, []);

  const cardStyle = { backgroundColor: '#161b22', border: '1px solid #30363d', borderRadius: '8px', padding: '20px', color: '#c9d1d9' };
  const kpiValue = { fontSize: '28px', fontWeight: 'bold', color: '#58a6ff', margin: '10px 0 0 0' };
  const thStyle = { padding: '12px', color: '#8b949e', fontSize: '13px', textAlign: 'left' };
  const tdStyle = { padding: '12px', fontSize: '14px' };

  if (loading) return <p style={{ color: '#8b949e' }}>Se încarcă datele din baza de date...</p>;
  if (error) return <p style={{ color: '#f85149' }}>{error}</p>;

  return (
    <>
      {viewMode === 'grafic' ? (
        <div style={{ display: 'grid', gap: '20px' }}>
          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            <div style={cardStyle}>
              <h4>Total gNB-uri</h4>
              <p style={kpiValue}>{networkData?.total_gnb || 0}</p>
            </div>
            <div style={cardStyle}>
              <h4>Availability Mediu</h4>
              <p style={{ ...kpiValue, color: '#3fb950' }}>{networkData?.avg_availability || '0'}%</p>
            </div>
            <div style={cardStyle}>
              <h4>Trafic Total (DL+UL)</h4>
              <p style={kpiValue}>{networkData?.total_traffic || '0'} GB</p>
            </div>
            <div style={cardStyle}>
              <h4>Putere Medie</h4>
              <p style={kpiValue}>{networkData?.avg_power || '0'} W</p>
            </div>
          </div>

          {/* Grid View Stații */}
          <div style={cardStyle}>
            <h3>Grid View Stații (Status în Timp Real)</h3>
            {/* Grid View Stații */}
          <div style={cardStyle}>
            <h3>Grid View Stații (Status în Timp Real)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px', marginTop: '16px' }}>
              {(networkData?.stations || []).map((st) => {
                const isOk = st.availability >= 99.8;
                const isWarning = st.availability < 99.8 && st.availability > 0;
                const color = isOk ? '#2ea043' : isWarning ? '#d29922' : '#f85149';

                return (
                  <div key={st.id} style={{
                    backgroundColor: '#0d1117', border: `1px solid ${color}`,
                    borderRadius: '6px', padding: '12px', textAlign: 'center',
                    minWidth: 0 /* Ajută la tăierea corectă a textului */
                  }}>
                    <div 
                      title={st.name} /* Arată numele complet când ții mouse-ul pe el */
                      style={{ 
                        fontWeight: 'bold', 
                        fontSize: '14px', 
                        color: '#f0f6fc',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {st.name}
                    </div>
                    <div style={{ fontSize: '12px', color: color, marginTop: '4px' }}>
                      {st.availability}% OK
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          </div>

          {/* Graficul Compus Nou */}
          <div style={cardStyle}>
            <h3>Trafic Total (GB) vs. Putere Consumată (W) în ultimele 24h</h3>
            <div style={{ height: '300px', marginTop: '20px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
                  <XAxis dataKey="time" stroke="#8b949e" />
                  
                  {/* Axa Y pentru Trafic (Stânga) */}
                  <YAxis yAxisId="left" stroke="#58a6ff" />
                  
                  {/* Axa Y pentru Putere (Dreapta) */}
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
        /* Versiunea Tabelară (Neschimbată) */
        <div style={cardStyle}>
          <h3>Tabel Detaliat Rețea</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px', color: '#c9d1d9' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #30363d', textAlign: 'left', backgroundColor: '#0d1117' }}>
                <th style={thStyle}>Stație (gNB)</th>
                <th style={thStyle}>Disponibilitate %</th>
                <th style={thStyle}>Trafic DL+UL (GB)</th>
                <th style={thStyle}>Consum Mediu (W)</th>
                <th style={thStyle}>Status</th>
              </tr>
            </thead>
            <tbody>
              {(networkData?.stations || []).map((st) => (
                <tr key={st.id} style={{ borderBottom: '1px solid #21262d' }}>
                  <td style={tdStyle}>{st.name}</td>
                  <td style={tdStyle}>{st.availability}%</td>
                  <td style={tdStyle}>{st.traffic} GB</td>
                  <td style={tdStyle}>{st.power} W</td>
                  <td style={tdStyle}>
                    <span style={{
                      padding: '2px 8px', borderRadius: '10px', fontSize: '11px',
                      backgroundColor: st.availability >= 99.8 ? '#238636' : '#da3633',
                      color: '#fff'
                    }}>
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