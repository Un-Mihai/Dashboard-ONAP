// CapacityTraffic.jsx
import React, { useState } from 'react';
import CapacityKpiGrid from './components/CapacityKpiGrid/CapacityKpiGrid';
import CapacityChartsGrid from './components/CapacityChartsGrid/CapacityChartsGrid';
import CapacityTable from './components/CapacityTable/CapacityTable';
import './CapacityTraffic.css';

const topCongestedStations = [
  { id: 1, name: "gNB_Iulius_Town", prbDl: 88.5, prbUl: 62.0, peakPrb: 100.0, throughputDl: 165.2 },
  { id: 2, name: "gNB_Complex_Studentesc", prbDl: 82.1, prbUl: 58.4, peakPrb: 96.0, throughputDl: 140.0 },
  { id: 3, name: "gNB_Timisoara_Centru", prbDl: 65.4, prbUl: 41.2, peakPrb: 82.0, throughputDl: 110.5 },
  { id: 4, name: "gNB_Mehala", prbDl: 42.0, prbUl: 28.0, peakPrb: 60.0, throughputDl: 75.0 },
  { id: 5, name: "gNB_Gara_de_Nord", prbDl: 0.0, prbUl: 0.0, peakPrb: 0.0, throughputDl: 0.0 },
];

export default function CapacityTraffic({ viewMode }) {
  const [showOnlyCongested, setShowOnlyCongested] = useState(false);

  const displayedStations = showOnlyCongested 
    ? topCongestedStations.filter(st => st.prbDl > 75)
    : topCongestedStations;

  return (
    <div className="capacity-container">
      {/* Header Secțiune */}
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

      {/* 1. Grid-ul de KPI-uri */}
      <CapacityKpiGrid />

      {/* Condiționarea modului de vizualizare (Grafic vs Raport tabelar) */}
      {viewMode === 'grafic' ? (
        <>
          {/* 2. Grid-ul de Grafice */}
          <CapacityChartsGrid />

          {/* 3. Tabelul în mod grafic */}
          <div className="capacity-card">
            <h3>Top Stații Congestionate (Ordonat după Ocuparea PRB DL)</h3>
            <CapacityTable stations={displayedStations} viewMode={viewMode} />
          </div>
        </>
      ) : (
        /* 3. Același Tabel, dar în mod Text/Raport */
        <div className="capacity-card">
          <h3>Raport Detaliat Capacitate & Trafic Radio</h3>
          <CapacityTable stations={displayedStations} viewMode={viewMode} />
        </div>
      )}
    </div>
  );
}