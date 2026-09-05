import React from 'react';
import './AveragePowerCard.css';

export default function AveragePowerCard({ value = 0, unit = 'W' }) {
  const displayUnit = unit ? ` ${unit}` : '';
  const displayValue = typeof value === 'number' ? `${value}${displayUnit}` : value;

  return (
    <div className="energy-card average-power-card">
      <h4>Power Mediu</h4>
      <p className="kpi-value warning">{displayValue}</p>
    </div>
  );
}