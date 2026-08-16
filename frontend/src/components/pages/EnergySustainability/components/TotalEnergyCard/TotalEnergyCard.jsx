import React from 'react';
import './TotalEnergyCard.css';

export default function TotalEnergyCard({ value = "142.5 kWh" }) {
  return (
    <div className="energy-card total-energy-card">
      <h4>Total Energy (kWh)</h4>
      <p className="kpi-value">{value}</p>
    </div>
  );
}