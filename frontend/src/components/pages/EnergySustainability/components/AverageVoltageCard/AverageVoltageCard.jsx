import React from 'react';
import './AverageVoltageCard.css';

export default function AverageVoltageCard({ value = "48.2 V" }) {
  return (
    <div className="energy-card average-voltage-card">
      <h4>Voltage Mediu (V)</h4>
      <p className="kpi-value">{value}</p>
    </div>
  );
}