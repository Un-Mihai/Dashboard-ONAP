import React from 'react';
import './EnergySustainabilityTable.css';

export default function EnergySustainabilityTable({ stationEnergyData = [] }) {
  const getEfficiencyClass = (efficiency) => {
    if (efficiency === 0) return 'critical';
    if (efficiency < 1.0) return 'critical';
    if (efficiency < 2.5) return 'medium';
    return 'good';
  };

  const firstStation = stationEnergyData[0];
  const voltHeader = firstStation?.voltage_unit ? ` (${firstStation.voltage_unit})` : ' (V)';
  const powerHeader = firstStation?.power_unit ? ` (${firstStation.power_unit})` : ' (W)';
  const trafficHeader = firstStation?.traffic_unit ? ` (${firstStation.traffic_unit})` : ' (GB)';
  const effHeader = firstStation?.efficiency_unit ? ` (${firstStation.efficiency_unit})` : ' (GB/kWh)';

  return (
    <div className="energy-card energy-table-card">
      <h3>Monitorizare RFM Energie per Stație</h3>
      <table className="energy-table">
        <thead>
          <tr>
            <th>Stație ID</th>
            <th>Tensiune{voltHeader}</th>
            <th>Consum Mediu{powerHeader}</th>
            <th>Trafic{trafficHeader}</th>
            <th>Eficiență{effHeader}</th>
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
            stationEnergyData.map((st) => {
              const voltUnit = st.voltage_unit ? ` ${st.voltage_unit}` : ' V';
              const powerUnit = st.power_unit ? ` ${st.power_unit}` : ' W';
              const trafficUnit = st.traffic_unit ? ` ${st.traffic_unit}` : ' GB';
              const effUnit = st.efficiency_unit ? ` ${st.efficiency_unit}` : ' GB/kWh';

              return (
                <tr key={st.id || st.node_name || st.name}>
                  <td>{st.name}</td>
                  <td>{st.voltage}{voltUnit}</td>
                  <td>{st.power}{powerUnit}</td>
                  <td>{st.traffic}{trafficUnit}</td>
                  <td>
                    <span className={`efficiency-text ${getEfficiencyClass(st.efficiency)}`}>
                      {st.efficiency}{effUnit}
                    </span>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}