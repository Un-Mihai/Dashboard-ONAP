import React from 'react';
import './TotalEnergyCard.css';

export default function TotalEnergyCard({ value = 0 }) {
  const displayValue = typeof value === 'number' ? `${value} kWh` : value;

  return (
    <div className="energy-card total-energy-card">
      <h4>Total Energy </h4>
      <p className="kpi-value">{displayValue}</p>
    </div>
  );
}