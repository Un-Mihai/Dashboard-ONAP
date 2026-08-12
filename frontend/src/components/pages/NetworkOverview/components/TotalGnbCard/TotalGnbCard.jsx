import React from 'react';
import './TotalGnbCard.css';

export default function TotalGnbCard({ value }) {
  return (
    <div className="overview-card total-gnb-card">
      <h4>Total gNB-uri</h4>
      <p className="kpi-value">{value ?? 0}</p>
    </div>
  );
}