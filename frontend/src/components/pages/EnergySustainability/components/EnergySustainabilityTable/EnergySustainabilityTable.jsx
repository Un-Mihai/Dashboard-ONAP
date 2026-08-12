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
            <th>Recomandare Sistem</th>
          </tr>
        </thead>
        <tbody>
          {stationEnergyData.map((st) => {
            const isInefficient = st.efficiency > 0 && st.efficiency < 1.0;

            return (
              <tr key={st.id}>
                <td>{st.name}</td>
                <td>{st.voltage} V</td>
                <td>{st.power} W</td>
                <td>{st.traffic} GB</td>
                <td>
                  <span className={`efficiency-text ${getEfficiencyClass(st.efficiency)}`}>
                    {st.efficiency} GB/kWh
                  </span>
                </td>
                <td>
                  {isInefficient ? (
                    <span className="recommendation-badge eco">
                      Sugestie: Activare Eco/Night Mode
                    </span>
                  ) : st.efficiency === 0 ? (
                    <span className="recommendation-badge offline">Stație Offline</span>
                  ) : (
                    <span className="recommendation-badge optimal">Parametri Optimi</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}