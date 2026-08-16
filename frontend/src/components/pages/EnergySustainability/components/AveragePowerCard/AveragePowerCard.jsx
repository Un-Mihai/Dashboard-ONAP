import React from 'react';
import './AveragePowerCard.css';

export default function AveragePowerCard({ value = "450 W" }) {
  return (
    <div className="energy-card average-power-card">
      <h4>Power Mediu (W)</h4>
      <p className="kpi-value warning">{value}</p>
    </div>
  );
}