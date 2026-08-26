import React from 'react';
import './StationPanelsGrid.css';

// Sub-componentă DRY pentru rândurile de metrici
function MetricItem({ label, val1, val2, unit, isComparing, activeColor }) {
  return (
    <div className="metric-item">
      <span className="metric-label">{label}</span>
      <span className="metric-value" style={{ color: activeColor || '#58a6ff' }}>
        {val1} {unit}
        {isComparing && (
          <span style={{ color: '#8b949e', fontSize: '12px', fontWeight: 'normal' }}>
            / {val2} {unit}
          </span>
        )}
      </span>
    </div>
  );
}

export default function StationPanelsGrid({ currentSt, compareSt, isComparing }) {
  const energyMetrics = [
    { label: "Putere Medie", val1: currentSt.power, val2: compareSt.power, unit: "", color: "#d29922" },
    { label: "Tensiune", val1: currentSt.voltage, val2: compareSt.voltage, unit: "", color: "#d29922" },
    { label: "Consum", val1: currentSt.kwh, val2: compareSt.kwh, unit: "", color: "#d29922" },
    { label: "Eficiență Energetică", val1: currentSt.eff, val2: compareSt.eff, unit: "GB/kWh", color: "#3fb950" }
  ];

  const trafficMetrics = [
    { label: "Volum Downlink (DL)", val1: currentSt.dlGb, val2: compareSt.dlGb, unit: "GB" },
    { label: "Volum Uplink (UL)", val1: currentSt.ulGb, val2: compareSt.ulGb, unit: "GB" },
    { label: "Throughput Downlink", val1: currentSt.dlMbps, val2: compareSt.dlMbps, unit: "Mbps" },
    { label: "Throughput Uplink", val1: currentSt.ulMbps, val2: compareSt.ulMbps, unit: "Mbps" },
    { label: "Ocupare PRB DL (Curent)", val1: currentSt.prb, val2: compareSt.prb, unit: "%", color: "#f85149" },
    { label: "Peak PRB (Max)", val1: currentSt.peakPrb, val2: compareSt.peakPrb, unit: "%", color: "#f85149" }
  ];

  return (
    <div className="station-panels-grid">
      <div className="station-card">
        <h3 style={{ borderBottom: '1px solid #30363d', paddingBottom: '10px', marginTop: 0 }}>
          Panou Energie & Tensiune {isComparing && `(${currentSt.id} vs ${compareSt.id})`}
        </h3>
        <div className="metrics-list">
          {energyMetrics.map((m, idx) => (
            <MetricItem key={idx} label={m.label} val1={m.val1} val2={m.val2} unit={m.unit} isComparing={isComparing} activeColor={m.color} />
          ))}
        </div>
      </div>

      <div className="station-card">
        <h3 style={{ borderBottom: '1px solid #30363d', paddingBottom: '10px', marginTop: 0 }}>
          Panou Trafic & Viteze {isComparing && `(${currentSt.id} vs ${compareSt.id})`}
        </h3>
        <div className="metrics-list">
          {trafficMetrics.map((m, idx) => (
            <MetricItem key={idx} label={m.label} val1={m.val1} val2={m.val2} unit={m.unit} isComparing={isComparing} activeColor={m.color} />
          ))}
        </div>
      </div>
    </div>
  );
}