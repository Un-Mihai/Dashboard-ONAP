import React from 'react';
import './AverageVoltageCard.css';

export default function AverageVoltageCard({ value = 0 }) {
  const displayValue = typeof value === 'number' ? `${value} V` : value;

  return (
    <div className="energy-card average-voltage-card">
      <h4>Voltage Mediu (V)</h4>
      <p className="kpi-value">{displayValue}</p>
    </div>
  );
}