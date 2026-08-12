import React from 'react';
import './AveragePowerCard.css';

export default function AveragePowerCard({ value }) {
  return (
    <div className="overview-card average-power-card">
      <h4>Putere Medie</h4>
      <p className="kpi-value">{value ?? 0} W</p>
    </div>
  );
}