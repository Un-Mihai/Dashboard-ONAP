import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './components/Sidebar';

function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [viewMode, setViewMode] = useState('grafic');
  
  // Stare pentru datele reale din rețea
  const [networkData, setNetworkData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Extragere date reale din Backend
    axios.get('http://localhost:8000/api/overview')
      .then((res) => {
        setNetworkData(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Eroare la preluarea datelor:", err);
        setError("Nu s-au putut încărca datele din baza de date.");
        setLoading(false);
      });
  }, []);

  return (
    <div style={{
      backgroundColor: '#0d1117',
      minHeight: '100vh',
      color: '#c9d1d9',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      display: 'flex'
    }}>
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        viewMode={viewMode} 
        setViewMode={setViewMode} 
      />

      <div style={{ marginLeft: '280px', flex: 1, padding: '32px', maxWidth: '1400px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '24px',
          borderBottom: '1px solid #21262d',
          paddingBottom: '12px'
        }}>
          <h2 style={{ color: '#f0f6fc', margin: 0, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '20px' }}>
            {activeTab.replace('-', ' ')}
          </h2>
          <span style={{ fontSize: '12px', color: '#8b949e', backgroundColor: '#161b22', padding: '6px 12px', borderRadius: '12px', border: '1px solid #30363d' }}>
            Mod Vizualizare: <strong style={{ color: '#58a6ff' }}>{viewMode.toUpperCase()}</strong>
          </span>
        </div>

        {/* PAGINA 1: NETWORK OVERVIEW */}
        {activeTab === 'overview' && (
          <div>
            {loading && <p style={{ color: '#8b949e' }}>Se încarcă datele din baza de date...</p>}
            {error && <p style={{ color: '#f85149' }}>{error}</p>}

            {!loading && !error && (
              <>
                {/* 1. VERSIUNEA GRAFICĂ */}
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
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px', marginTop: '16px' }}>
                        {(networkData?.stations || []).map((st) => {
                          const isOk = st.availability >= 99.8;
                          const isWarning = st.availability < 99.8 && st.availability > 0;
                          const color = isOk ? '#2ea043' : isWarning ? '#d29922' : '#f85149';

                          return (
                            <div key={st.id} style={{
                              backgroundColor: '#0d1117',
                              border: `1px solid ${color}`,
                              borderRadius: '6px',
                              padding: '12px',
                              textAlign: 'center'
                            }}>
                              <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#f0f6fc' }}>{st.name}</div>
                              <div style={{ fontSize: '12px', color: color, marginTop: '4px' }}>
                                {st.availability}% OK
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* 2. VERSIUNEA TABELARĂ */
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
                                padding: '2px 8px',
                                borderRadius: '10px',
                                fontSize: '11px',
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
            )}
          </div>
        )}

        {/* RESTUL PAGINILOR  */}
        {activeTab !== 'overview' && (
          <div style={cardStyle}>
            <h3>Pagina {activeTab.toUpperCase()} ({viewMode})</h3>
            <p style={{ color: '#8b949e' }}>Această pagină va fi implementată de colegi folosind șablonul din Network Overview.</p>
          </div>
        )}

      </div>
    </div>
  );
}

const cardStyle = {
  backgroundColor: '#161b22',
  border: '1px solid #30363d',
  borderRadius: '8px',
  padding: '20px',
  color: '#c9d1d9'
};

const kpiValue = {
  fontSize: '28px',
  fontWeight: 'bold',
  color: '#58a6ff',
  margin: '10px 0 0 0'
};

const thStyle = { padding: '12px', color: '#8b949e', fontSize: '13px' };
const tdStyle = { padding: '12px', fontSize: '14px' };

export default App;