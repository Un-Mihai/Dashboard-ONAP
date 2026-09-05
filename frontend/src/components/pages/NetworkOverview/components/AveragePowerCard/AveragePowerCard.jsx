import React from 'react';
import './AveragePowerCard.css';

export default function AveragePowerCard({ value, unit }) {
  const displayValue = value ?? 0;
  const displayUnit = unit ? ` ${unit}` : '';

  return (
    <div className="overview-card average-power-card">
      <h4>Putere Medie</h4>
      <p className="kpi-value">
        {displayValue}{displayUnit}
      </p>
    </div>
  );
}