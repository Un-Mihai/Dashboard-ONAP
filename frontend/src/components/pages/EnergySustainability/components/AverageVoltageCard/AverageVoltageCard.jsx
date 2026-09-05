import React from 'react';
import './AverageVoltageCard.css';

export default function AverageVoltageCard({ value = 0, unit = 'V' }) {
  const displayUnit = unit ? ` ${unit}` : '';
  const displayValue = typeof value === 'number' ? `${value}${displayUnit}` : value;

  return (
    <div className="energy-card average-voltage-card">
      <h4>Voltage Mediu</h4>
      <p className="kpi-value">{displayValue}</p>
    </div>
  );
}