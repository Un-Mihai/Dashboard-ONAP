import React from 'react';
import './AvailabilityCard.css';

export default function AvailabilityCard({ value, unit }) {
  const displayValue = value ?? 0;
  const displayUnit = unit || '%';

  return (
    <div className="overview-card availability-card">
      <h4>Availability Mediu</h4>
      <p className="kpi-value green">
        {displayValue}{displayUnit}
      </p>
    </div>
  );
}