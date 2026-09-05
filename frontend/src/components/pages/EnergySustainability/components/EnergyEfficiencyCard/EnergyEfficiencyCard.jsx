import React from 'react';
import './EnergyEfficiencyCard.css';

export default function EnergyEfficiencyCard({ value = 0, unit = 'GB/kWh' }) {
  const displayUnit = unit ? ` ${unit}` : '';
  const displayValue = typeof value === 'number' ? `${value}${displayUnit}` : value;

  return (
    <div className="energy-card energy-efficiency-card">
      <h4>Eficiență</h4>
      <p className="kpi-value success">{displayValue}</p>
    </div>
  );
}