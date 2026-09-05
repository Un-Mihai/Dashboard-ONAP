import React from 'react';
import './NetworkOverviewTable.css';

export default function NetworkOverviewTable({ stations = [] }) {
  const firstStation = stations[0];
  const trafficUnitHeader = firstStation?.traffic_unit ? ` (${firstStation.traffic_unit})` : ' (GB)';
  const powerUnitHeader = firstStation?.power_unit ? ` (${firstStation.power_unit})` : ' (W)';
  const availUnitHeader = firstStation?.availability_unit ? ` (${firstStation.availability_unit})` : ' (%)';
  return (
    <div className="overview-card table-overview-card">
      <h3>Tabel Detaliat Rețea</h3>
      <table className="overview-table">
        <thead>
          <tr>
            <th>Stație (gNB)</th>
            <th>Disponibilitate{availUnitHeader}</th>
            <th>Trafic DL+UL{trafficUnitHeader}</th>
            <th>Consum Mediu{powerUnitHeader}</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {stations.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center', color: '#8b949e' }}>
                Nu există date disponibile pentru selecția curentă.
              </td>
            </tr>
          ) : (
            stations.map((st) => {
              const availUnit = st.availability_unit || '%';
              const trafficUnit = st.traffic_unit ? ` ${st.traffic_unit}` : ' GB';
              const powerUnit = st.power_unit ? ` ${st.power_unit}` : ' W';

              return (
                <tr key={st.id || st.node_name}>
                  <td>{st.name}</td>
                  <td>{st.availability}{availUnit}</td>
                  <td>{st.traffic}{trafficUnit}</td>
                  <td>{st.power}{powerUnit}</td>
                  <td>
                    <span className={`status-badge ${st.availability >= 99.8 ? 'online' : 'down'}`}>
                      {st.availability >= 99.8 ? 'ONLINE' : 'DOWN'}
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