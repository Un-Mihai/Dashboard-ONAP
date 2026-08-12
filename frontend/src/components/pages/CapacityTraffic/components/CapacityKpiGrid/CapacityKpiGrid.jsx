// components/CapacityKpiGrid/CapacityKpiGrid.jsx
import React from 'react';
import './CapacityKpiGrid.css';

export default function CapacityKpiGrid() {
  const kpis = [
    { title: "DL Throughput Mediu", value: "118.5 Mbps", type: "" },
    { title: "UL Throughput Mediu", value: "19.8 Mbps", type: "" },
    { title: "PRB DL Mediu %", value: "72.4%", type: "warning" },
    { title: "Peak PRB Slot Max %", value: "100.0% (MAX)", type: "critical" }
  ];

  return (
    <div className="capacity-kpi-grid">
      {kpis.map((kpi, index) => (
        <div key={index} className="capacity-card">
          <h4>{kpi.title}</h4>
          <p className={`kpi-value ${kpi.type}`}>{kpi.value}</p>
        </div>
      ))}
    </div>
  );
}