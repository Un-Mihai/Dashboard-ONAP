import React from 'react';
import './AvailabilityCard.css';

export default function AvailabilityCard({ value }) {
  return (
    <div className="overview-card availability-card">
      <h4>Availability Mediu</h4>
      <p className="kpi-value green">{value ?? 0}%</p>
    </div>
  );
}