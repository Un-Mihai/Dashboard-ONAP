import React from 'react';
import './TotalTrafficCard.css';

export default function TotalTrafficCard({ value }) {
  return (
    <div className="overview-card total-traffic-card">
      <h4>Trafic Total (DL+UL)</h4>
      <p className="kpi-value">{value ?? 0}</p>
    </div>
  );
}