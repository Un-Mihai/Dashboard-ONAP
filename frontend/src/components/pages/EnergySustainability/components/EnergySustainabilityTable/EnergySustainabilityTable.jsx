import React from 'react';
import './EnergySustainabilityTable.css';

export default function EnergySustainabilityTable({ stationEnergyData = [] }) {
  const getEfficiencyClass = (efficiency) => {
    if (efficiency === 0) return 'critical';
    if (efficiency < 1.0) return 'critical';
    if (efficiency < 2.5) return 'medium';
    return 'good';
  };

  return (
    <div className="energy-card energy-table-card">
      <h3>Monitorizare RFM Energie per Stație</h3>
      <table className="energy-table">
        <thead>
          <tr>
            <th>Stație ID</th>
            <th>Tensiune (V)</th>
            <th>Consum Mediu (W)</th>
            <th>Trafic (GB)</th>
            <th>Eficiență (GB/kWh)</th>
          </tr>
        </thead>
        <tbody>
          {stationEnergyData.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center', color: '#8b949e', padding: '20px' }}>
                Nu există date disponibile.
              </td>
            </tr>
          ) : (
            stationEnergyData.map((st) => (
              <tr key={st.id || st.node_name || st.name}>
                <td>{st.name}</td>
                <td>{st.voltage} V</td>
                <td>{st.power} W</td>
                <td>{st.traffic} GB</td>
                <td>
                  <span className={`efficiency-text ${getEfficiencyClass(st.efficiency)}`}>
                    {st.efficiency} GB/kWh
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}