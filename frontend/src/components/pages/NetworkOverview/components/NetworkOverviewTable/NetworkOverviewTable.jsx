import React from 'react';
import './NetworkOverviewTable.css';

export default function NetworkOverviewTable({ stations = [] }) {
  return (
    <div className="overview-card table-overview-card">
      <h3>Tabel Detaliat Rețea</h3>
      <table className="overview-table">
        <thead>
          <tr>
            <th>Stație (gNB)</th>
            <th>Disponibilitate %</th>
            <th>Trafic DL+UL (GB)</th>
            <th>Consum Mediu (W)</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {stations.map((st) => (
            <tr key={st.id}>
              <td>{st.name}</td>
              <td>{st.availability}%</td>
              <td>{st.traffic} GB</td>
              <td>{st.power} W</td>
              <td>
                <span className={`status-badge ${st.availability >= 99.8 ? 'online' : 'down'}`}>
                  {st.availability >= 99.8 ? 'ONLINE' : 'DOWN'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}