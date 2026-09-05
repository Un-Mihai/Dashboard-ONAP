import React from 'react';
import './TotalTrafficCard.css';

export default function TotalTrafficCard({ value, unit }) {
  const displayValue = value ?? 0;
  const displayUnit = unit ? ` ${unit}` : '';

  return (
    <div className="overview-card total-traffic-card">
      <h4>Trafic Total (DL+UL)</h4>
      <p className="kpi-value">
        {displayValue}{displayUnit}
      </p>
    </div>
  );
}