import React, { useState } from 'react';
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import './StationDetails.css';

// Lista de stații disponibile pentru selecție
const availableStations = [
  { id: 'gNB-1024', name: 'gNB_Timisoara_Centru' },
  { id: 'gNB-1025', name: 'gNB_Complex_Studentesc' },
  { id: 'gNB-1026', name: 'gNB_Iulius_Town' },
  { id: 'gNB-1027', name: 'gNB_Gara_de_Nord' },
];

// Date simulate de granularitate 15 min (PT900S)
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

  return (
    <div className="station-details-container">
      
      {/* HEADER STAȚIE & SELECTOR */}
      <div className="station-card station-header">
        <div className="station-select-group">
          <label htmlFor="gnb-select" style={{ color: '#8b949e', fontWeight: 'bold' }}>Alege Stația:</label>
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

        <div className="station-status-badges">
          <span className="badge online">ONLINE</span>
          <span className="badge info">Availability: 100%</span>
        </div>
      </div>

      {/* PANOURI ENERGIE & TRAFIC (Cei 10 contori) */}
      <div className="station-panels-grid">
        
        {/* PANOU ENERGIE */}
        <div className="station-card">
          <h3>Panou Energie & Tensiune</h3>
          <div className="metrics-list">
            <div className="metric-item">
              <span className="metric-label">Putere Medie (RU_AVG_PWR_USAGE)</span>
              <span className="metric-value">350 W</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Tensiune Intrares (Voltage)</span>
              <span className="metric-value">48.2 V</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Consum 15 min (kWh)</span>
              <span className="metric-value">0.087 kWh</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Eficiență Energetică</span>
              <span className="metric-value" style={{ color: '#3fb950' }}>166.6 GB/kWh</span>
            </div>
          </div>
        </div>

        {/* PANOU TRAFIC & VITEZĂ */}
        <div className="station-card">
          <h3>Panou Trafic & Viteze</h3>
          <div className="metrics-list">
            <div className="metric-item">
              <span className="metric-label">Volum Downlink (DL)</span>
              <span className="metric-value">12.4 GB</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Volum Uplink (UL)</span>
              <span className="metric-value">2.1 GB</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Throughput Downlink</span>
              <span className="metric-value">110 Mbps</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Throughput Uplink</span>
              <span className="metric-value">18 Mbps</span>
            </div>
          </div>
        </div>

      </div>

      {/* GRAFICE EVOLUȚIE (15-min PT900S) */}
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