import React from 'react';
import './CapacityTable.css';

export default function CapacityTable({ stations = [], viewMode = 'grafic' }) {
  const getPrbBadgeClass = (prb) => {
    if (prb >= 85) return 'critical';
    if (prb >= 70) return 'high';
    return 'normal';
  };

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
          <th>{viewMode === 'grafic' ? 'Throughput DL (KB/s)' : 'DL Throughput (KB/s)'}</th>
          <th>{viewMode === 'grafic' ? 'Nivel Congestie' : 'Status Ocupare'}</th>
        </tr>
      </thead>
      <tbody>
        {stations.length === 0 ? (
          <tr>
            <td colSpan="6" style={{ textAlign: 'center', color: '#8b949e', padding: '20px' }}>
              Nicio stație nu corespunde criteriilor de filtrare.
            </td>
          </tr>
        ) : (
          stations.map((st) => (
            <tr key={st.id || st.node_name || st.name}>
              <td>{st.name}</td>
              <td>{st.prbDl}%</td>
              <td>{st.prbUl}%</td>
              <td style={{ 
                color: st.peakPrb >= 100 ? '#da3633' : 'inherit', 
                fontWeight: st.peakPrb >= 100 ? 'bold' : 'normal' 
              }}>
                {st.peakPrb}% {st.peakPrb >= 100 && '(MAX)'}
              </td>
              <td>{st.throughputDl} KB/s</td>
              <td>
                <span className={`prb-badge ${getPrbBadgeClass(st.prbDl)}`}>
                  {getStatusText(st.prbDl, viewMode)}
                </span>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}