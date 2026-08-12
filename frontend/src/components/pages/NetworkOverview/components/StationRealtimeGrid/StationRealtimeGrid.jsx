import React from 'react';
import './StationRealtimeGrid.css';

export default function StationRealtimeGrid({ stations = [] }) {
  return (
    <div className="overview-card station-grid-card">
      <h3>Grid View Stații (Status în Timp Real)</h3>
      <div className="stations-grid">
        {stations.map((st) => {
          const isOk = st.availability >= 99.8;
          const isWarning = st.availability < 99.8 && st.availability > 0;
          const borderColor = isOk ? '#2ea043' : isWarning ? '#d29922' : '#f85149';
          const hasAlerts = st.availability === 0 || st.active_alarms > 0;

          return (
            <div key={st.id} className="station-item" style={{ border: `1px solid ${borderColor}` }}>
              {hasAlerts && (
                <div className="station-alert-badge" title={`${st.active_alarms} alerte active!`}>
                  {st.availability === 0 ? '!' : st.active_alarms}
                </div>
              )}
              <div className="station-item-title" title={st.name}>
                {st.name}
              </div>
              <div className="station-item-sub" style={{ color: borderColor }}>
                {st.availability}% OK
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}