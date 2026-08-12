import React, { useState } from 'react';
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import './StationDetails.css';

const availableStations = [
  { id: 'gNB-1024', name: 'gNB_Timisoara_Centru', power: 350, voltage: 48.2, kwh: 0.087, eff: 166.6, dlGb: 12.4, ulGb: 2.1, dlMbps: 110, ulMbps: 18, prb: 85, peakPrb: 98 },
  { id: 'gNB-1025', name: 'gNB_Complex_Studentesc', power: 550, voltage: 47.9, kwh: 0.120, eff: 120.0, dlGb: 18.2, ulGb: 3.5, dlMbps: 140, ulMbps: 22, prb: 82, peakPrb: 96 },
  { id: 'gNB-1026', name: 'gNB_Iulius_Town', power: 850, voltage: 48.2, kwh: 0.210, eff: 95.0, dlGb: 25.0, ulGb: 5.2, dlMbps: 165, ulMbps: 32, prb: 88, peakPrb: 100 },
  { id: 'gNB-1027', name: 'gNB_Gara_de_Nord', power: 0, voltage: 0, kwh: 0, eff: 0, dlGb: 0, ulGb: 0, dlMbps: 0, ulMbps: 0, prb: 0, peakPrb: 0 },
];

const stationHistoryData = [
  { time: '12:00', prb: 45, prbPeak: 70, power: 340 },
  { time: '12:15', prb: 52, prbPeak: 80, power: 355 },
  { time: '12:30', prb: 68, prbPeak: 92, power: 390 },
  { time: '12:45', prb: 85, prbPeak: 98, power: 420 },
  { time: '13:00', prb: 60, prbPeak: 85, power: 370 },
  { time: '13:15', prb: 40, prbPeak: 65, power: 330 },
];

export default function StationDetails() {
  const [selectedGnb, setSelectedGnb] = useState('gNB-1024');
  const [compareGnb, setCompareGnb] = useState('gNB-1026');
  const [isComparing, setIsComparing] = useState(false);

  const currentSt = availableStations.find(st => st.id === selectedGnb) || availableStations[0];
  const compareSt = availableStations.find(st => st.id === compareGnb) || availableStations[2];

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="station-details-container">
      <div className="station-card station-header">
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="station-select-group">
            <label htmlFor="gnb-select" style={{ color: '#8b949e', fontWeight: 'bold' }}>Stație Principală:</label>
            <select 
              id="gnb-select"
              className="station-select"
              value={selectedGnb}
              onChange={(e) => setSelectedGnb(e.target.value)}
            >
              {availableStations.map((st) => (
                <option key={st.id} value={st.id}>{st.id} - {st.name}</option>
              ))}
            </select>
          </div>

          {isComparing && (
            <div className="station-select-group">
              <label htmlFor="gnb-compare-select" style={{ color: '#d29922', fontWeight: 'bold' }}>Compară cu:</label>
              <select 
                id="gnb-compare-select"
                className="station-select"
                value={compareGnb}
                onChange={(e) => setCompareGnb(e.target.value)}
              >
                {availableStations.filter(st => st.id !== selectedGnb).map((st) => (
                  <option key={st.id} value={st.id}>{st.id} - {st.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button 
            onClick={() => setIsComparing(!isComparing)}
            style={{
              backgroundColor: isComparing ? '#d29922' : '#21262d',
              color: isComparing ? '#0d1117' : '#c9d1d9',
              border: '1px solid #30363d', padding: '8px 14px', borderRadius: '6px',
              cursor: 'pointer', fontWeight: 'bold', fontSize: '13px'
            }}
          >
            {isComparing ? 'Închide Comparația' : 'Compară Stații'}
          </button>

          <button 
            onClick={handleExportPDF}
            style={{
              backgroundColor: '#238636', color: 'white', border: 'none',
              padding: '8px 14px', borderRadius: '6px', cursor: 'pointer',
              fontWeight: 'bold', fontSize: '13px'
            }}
          >
            Exportă Raport PDF
          </button>

          <div className="station-status-badges">
            <span className={`badge ${currentSt.power > 0 ? 'online' : 'down'}`}>
              {currentSt.power > 0 ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>
        </div>
      </div>

      <div className="station-panels-grid">
        <div className="station-card">
          <h3 style={{ borderBottom: '1px solid #30363d', paddingBottom: '10px', marginTop: 0 }}>
            Panou Energie & Tensiune {isComparing && `(${currentSt.id} vs ${compareSt.id})`}
          </h3>
          <div className="metrics-list">
            <div className="metric-item">
              <span className="metric-label">Putere Medie (RU_AVG_PWR_USAGE)</span>
              <span className="metric-value" style={{ color: '#d29922' }}>
                {currentSt.power} W {isComparing && <span style={{ color: '#8b949e', fontSize: '12px' }}>/ {compareSt.power} W</span>}
              </span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Tensiune Intrare (Voltage)</span>
              <span className="metric-value" style={{ color: '#d29922' }}>
                {currentSt.voltage} V {isComparing && <span style={{ color: '#8b949e', fontSize: '12px' }}>/ {compareSt.voltage} V</span>}
              </span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Consum 15 min (kWh)</span>
              <span className="metric-value" style={{ color: '#d29922' }}>
                {currentSt.kwh} kWh {isComparing && <span style={{ color: '#8b949e', fontSize: '12px' }}>/ {compareSt.kwh} kWh</span>}
              </span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Eficiență Energetică</span>
              <span className="metric-value" style={{ color: '#3fb950' }}>
                {currentSt.eff} GB/kWh {isComparing && <span style={{ color: '#8b949e', fontSize: '12px' }}>/ {compareSt.eff} GB/kWh</span>}
              </span>
            </div>
          </div>
        </div>

        <div className="station-card">
          <h3 style={{ borderBottom: '1px solid #30363d', paddingBottom: '10px', marginTop: 0 }}>
            Panou Trafic & Viteze {isComparing && `(${currentSt.id} vs ${compareSt.id})`}
          </h3>
          <div className="metrics-list">
            <div className="metric-item">
              <span className="metric-label">Volum Downlink (DL)</span>
              <span className="metric-value">
                {currentSt.dlGb} GB {isComparing && <span style={{ color: '#8b949e', fontSize: '12px' }}>/ {compareSt.dlGb} GB</span>}
              </span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Volum Uplink (UL)</span>
              <span className="metric-value">
                {currentSt.ulGb} GB {isComparing && <span style={{ color: '#8b949e', fontSize: '12px' }}>/ {compareSt.ulGb} GB</span>}
              </span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Throughput Downlink</span>
              <span className="metric-value">
                {currentSt.dlMbps} Mbps {isComparing && <span style={{ color: '#8b949e', fontSize: '12px' }}>/ {compareSt.dlMbps} Mbps</span>}
              </span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Throughput Uplink</span>
              <span className="metric-value">
                {currentSt.ulMbps} Mbps {isComparing && <span style={{ color: '#8b949e', fontSize: '12px' }}>/ {compareSt.ulMbps} Mbps</span>}
              </span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Ocupare PRB DL (Curent)</span>
              <span className="metric-value" style={{ color: '#f85149' }}>
                {currentSt.prb}% {isComparing && <span style={{ color: '#8b949e', fontSize: '12px' }}>/ {compareSt.prb}%</span>}
              </span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Peak PRB (Max)</span>
              <span className="metric-value" style={{ color: '#f85149' }}>
                {currentSt.peakPrb}% {isComparing && <span style={{ color: '#8b949e', fontSize: '12px' }}>/ {compareSt.peakPrb}%</span>}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="station-charts-grid">
        <div className="station-card">
          <h3>Ocupare PRB DL (%) - Medie vs Peak</h3>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stationHistoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
                <XAxis dataKey="time" stroke="#8b949e" />
                <YAxis stroke="#8b949e" />
                <Tooltip contentStyle={{ backgroundColor: '#161b22', border: '1px solid #30363d' }} />
                <Area type="monotone" dataKey="prbPeak" name="Peak PRB (%)" stroke="#f85149" fill="#f8514922" />
                <Area type="monotone" dataKey="prb" name="PRB Mediu (%)" stroke="#58a6ff" fill="#58a6ff22" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="station-card">
          <h3>Consum Electric în Timp (Watts)</h3>
          <div className="chart-box">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stationHistoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
                <XAxis dataKey="time" stroke="#8b949e" />
                <YAxis stroke="#8b949e" />
                <Tooltip contentStyle={{ backgroundColor: '#161b22', border: '1px solid #30363d' }} />
                <Line type="monotone" dataKey="power" name="Putere (W)" stroke="#d29922" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}