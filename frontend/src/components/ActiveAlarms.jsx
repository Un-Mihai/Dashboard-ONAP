import React, { useState } from 'react';
import './ActiveAlarms.css';

// Lista inițială de alerte simulate conform regilor din cerințe
const initialAlarms = [
  { id: 1, severity: 'CRITICAL', station: 'gNB_Gara_de_Nord', category: 'Disponibilitate', rule: 'Cell Availability = 0%', value: '0%', time: '14:15:00' },
  { id: 2, severity: 'MAJOR', station: 'gNB_Iulius_Town', category: 'Energie', rule: 'High Power Usage', value: '850 W', time: '14:00:00' },
  { id: 3, severity: 'WARNING', station: 'gNB_Complex_Studentesc', category: 'Trafic', rule: 'High PRB Utilization (DL)', value: '88.5%', time: '13:45:00' },
  { id: 4, severity: 'WARNING', station: 'gNB_Timisoara_Centru', category: 'Energie', rule: 'Low Energy Efficiency', value: '0.8 GB/kWh', time: '13:30:00' },
];

export default function ActiveAlarms() {
  const [categoryFilter, setCategoryFilter] = useState('Toate');
  const [severityFilter, setSeverityFilter] = useState('Toate');

  // Stare pentru Configuratorul de Praguri
  const [thresholds, setThresholds] = useState({
    availMin: 98,
    powerMax: 800,
    prbMax: 85,
    effMin: 1.0,
  });

  const handleThresholdChange = (key, val) => {
    setThresholds((prev) => ({ ...prev, [key]: Number(val) }));
  };

  const filteredAlarms = initialAlarms.filter((alarm) => {
    const matchCategory = categoryFilter === 'Toate' || alarm.category === categoryFilter;
    const matchSeverity = severityFilter === 'Toate' || alarm.severity === severityFilter;
    return matchCategory && matchSeverity;
  });

  const countBySeverity = (sev) => initialAlarms.filter((a) => a.severity === sev).length;

  return (
    <div className="alarms-container">
      
      {/* 1. SUMMARY CARDS */}
      <div className="alarms-summary-grid">
        <div className="alarm-card">
          <h4>Total Alerte Active</h4>
          <p className="kpi-value info">{initialAlarms.length}</p>
        </div>
        <div className="alarm-card">
          <h4>Critical</h4>
          <p className="kpi-value critical">{countBySeverity('CRITICAL')}</p>
        </div>
        <div className="alarm-card">
          <h4>Major</h4>
          <p className="kpi-value major">{countBySeverity('MAJOR')}</p>
        </div>
        <div className="alarm-card">
          <h4>Warning</h4>
          <p className="kpi-value warning">{countBySeverity('WARNING')}</p>
        </div>
      </div>

      {/* 2. TABEL ALERTE + FILTRE RAPIDE */}
      <div className="alarm-card">
        <h3>Lista Alerte în Timp Real</h3>
        
        {/* FILTRE RAPIDE */}
        <div className="alarms-filters-bar" style={{ marginTop: '15px' }}>
          <div className="filter-group">
            <label>Categorie:</label>
            <select className="alarm-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="Toate">Toate Categorii</option>
              <option value="Disponibilitate">Disponibilitate</option>
              <option value="Energie">Energie & Tensiune</option>
              <option value="Trafic">Capacitate & Trafic</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Severitate:</label>
            <select className="alarm-select" value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}>
              <option value="Toate">Toate Severitățile</option>
              <option value="CRITICAL">Critical</option>
              <option value="MAJOR">Major</option>
              <option value="WARNING">Warning</option>
            </select>
          </div>
        </div>

        {/* TABEL */}
        <table className="alarms-table">
          <thead>
            <tr>
              <th>Severitate</th>
              <th>Stație ID</th>
              <th>Categorie</th>
              <th>Regulă Depășită</th>
              <th>Valoare Actuală</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {filteredAlarms.length > 0 ? (
              filteredAlarms.map((alarm) => (
                <tr key={alarm.id}>
                  <td>
                    <span className={`severity-badge ${alarm.severity.toLowerCase()}`}>
                      {alarm.severity}
                    </span>
                  </td>
                  <td>{alarm.station}</td>
                  <td>{alarm.category}</td>
                  <td>{alarm.rule}</td>
                  <td>{alarm.value}</td>
                  <td>{alarm.time}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', color: '#8b949e', padding: '20px' }}>
                  Nicio alertă găsiți pentru filtrele selectate.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 3. CONFIGURATOR PRAGURI */}
      <div className="alarm-card">
        <h3>Configurator Praguri Alerte</h3>
        <p style={{ color: '#8b949e', fontSize: '13px' }}>
          Ajustează pragurile de mai jos pentru a declanșa automat alertarea în rețea.
        </p>

        <div className="thresholds-grid">
          
          <div className="threshold-item">
            <div className="threshold-header">
              <span>Cell Availability Min (%)</span>
              <span className="threshold-value">{thresholds.availMin}%</span>
            </div>
            <div className="threshold-input-group">
              <input 
                type="range" className="threshold-slider" min="80" max="100" step="1" 
                value={thresholds.availMin} onChange={(e) => handleThresholdChange('availMin', e.target.value)} 
              />
            </div>
          </div>

          <div className="threshold-item">
            <div className="threshold-header">
              <span>Consum Max Curent (Watts)</span>
              <span className="threshold-value">{thresholds.powerMax} W</span>
            </div>
            <div className="threshold-input-group">
              <input 
                type="range" className="threshold-slider" min="300" max="1200" step="50" 
                value={thresholds.powerMax} onChange={(e) => handleThresholdChange('powerMax', e.target.value)} 
              />
            </div>
          </div>

          <div className="threshold-item">
            <div className="threshold-header">
              <span>PRB DL Utilization Max (%)</span>
              <span className="threshold-value">{thresholds.prbMax}%</span>
            </div>
            <div className="threshold-input-group">
              <input 
                type="range" className="threshold-slider" min="50" max="98" step="1" 
                value={thresholds.prbMax} onChange={(e) => handleThresholdChange('prbMax', e.target.value)} 
              />
            </div>
          </div>

          <div className="threshold-item">
            <div className="threshold-header">
              <span>Eficiență Energetică Min (GB/kWh)</span>
              <span className="threshold-value">{thresholds.effMin} GB/kWh</span>
            </div>
            <div className="threshold-input-group">
              <input 
                type="range" className="threshold-slider" min="0.1" max="5.0" step="0.1" 
                value={thresholds.effMin} onChange={(e) => handleThresholdChange('effMin', e.target.value)} 
              />
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}