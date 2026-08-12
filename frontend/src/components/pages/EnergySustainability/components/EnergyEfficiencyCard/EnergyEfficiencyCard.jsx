import React from 'react';
import './EnergyEfficiencyCard.css';

export default function EnergyEfficiencyCard({ value = "3.2 GB/kWh" }) {
  return (
    <div className="energy-card energy-efficiency-card">
      <h4>Eficiență (GB / kWh)</h4>
      <p className="kpi-value success">{value}</p>
    </div>
  );
}