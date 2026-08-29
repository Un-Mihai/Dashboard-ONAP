import React from 'react';
import './EnergyEfficiencyCard.css';

export default function EnergyEfficiencyCard({ value = 0 }) {
  const displayValue = typeof value === 'number' ? `${value} GB/kWh` : value;

  return (
    <div className="energy-card energy-efficiency-card">
      <h4>Eficiență </h4>
      <p className="kpi-value success">{displayValue}</p>
    </div>
  );
}