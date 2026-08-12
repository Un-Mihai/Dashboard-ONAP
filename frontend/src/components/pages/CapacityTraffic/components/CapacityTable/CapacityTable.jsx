// components/CapacityTable/CapacityTable.jsx
import React from 'react';
import './CapacityTable.css';

export default function CapacityTable({ stations, viewMode }) {
  const getPrbBadgeClass = (prb) => {
    if (prb >= 85) return 'critical';
    if (prb >= 70) return 'high';
    return 'normal';
  }; // Corectat aici: } în loc de ]

  const getStatusText = (prb, mode) => {
    if (mode === 'grafic') {
      return prb >= 85 ? 'CRITICAL' : prb >= 70 ? 'WARNING' : 'OK';
    }
    return prb >= 85 ? 'CONGESTIONAT' : prb >= 70 ? 'ÎNCĂRCAT' : 'OPTIM';
  };

  return (
    <table className="capacity-table">
      <thead>
        <tr>
          <th>Stație ID</th>
          <th>{viewMode === 'grafic' ? 'PRB DL %' : 'PRB DL Utilizat %'}</th>
          <th>{viewMode === 'grafic' ? 'PRB UL %' : 'PRB UL Utilizat %'}</th>
          <th>{viewMode === 'grafic' ? 'Peak PRB %' : 'Peak PRB Slot Max %'}</th>
          <th>{viewMode === 'grafic' ? 'Throughput DL (Mbps)' : 'DL Throughput (Mbps)'}</th>
          <th>{viewMode === 'grafic' ? 'Nivel Congestie' : 'Status Ocupare'}</th>
        </tr>
      </thead>
      <tbody>
        {stations.map((st) => (
          <tr key={st.id}>
            <td>{st.name}</td>
            <td>{st.prbDl}%</td>
            <td>{st.prbUl}%</td>
            <td style={{ color: st.peakPrb >= 100 ? '#da3633' : 'inherit', fontWeight: st.peakPrb >= 100 ? 'bold' : 'normal' }}>
              {st.peakPrb}% {st.peakPrb >= 100 && '(MAX)'}
            </td>
            <td>{st.throughputDl} Mbps</td>
            <td>
              <span className={`prb-badge ${getPrbBadgeClass(st.prbDl)}`}>
                {getStatusText(st.prbDl, viewMode)}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}