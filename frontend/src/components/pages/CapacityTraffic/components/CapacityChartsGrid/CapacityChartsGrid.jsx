// components/CapacityChartsGrid/CapacityChartsGrid.jsx
import React from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './CapacityChartsGrid.css';

const throughputTrendData = [
  { time: '00:00', dlMbps: 45, ulMbps: 8 },
  { time: '04:00', dlMbps: 20, ulMbps: 4 },
  { time: '08:00', dlMbps: 85, ulMbps: 15 },
  { time: '12:00', dlMbps: 140, ulMbps: 28 },
  { time: '16:00', dlMbps: 165, ulMbps: 32 },
  { time: '20:00', dlMbps: 130, ulMbps: 22 },
  { time: '24:00', dlMbps: 55, ulMbps: 10 },
];

const prbTrendData = [
  { time: '00:00', prbDl: 25, peakPrb: 40 },
  { time: '04:00', prbDl: 15, peakPrb: 25 },
  { time: '08:00', prbDl: 55, peakPrb: 75 },
  { time: '12:00', prbDl: 82, peakPrb: 96 },
  { time: '16:00', prbDl: 88, peakPrb: 100 },
  { time: '20:00', prbDl: 70, peakPrb: 88 },
  { time: '24:00', prbDl: 30, peakPrb: 50 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const peakValue = payload.find(p => p.dataKey === 'peakPrb')?.value;
    const isPeakAlert = peakValue >= 100;

    return (
      <div style={{ backgroundColor: '#161b22', border: `1px solid ${isPeakAlert ? '#da3633' : '#30363d'}`, padding: '10px', borderRadius: '4px' }}>
        <p style={{ margin: 0, color: '#8b949e', marginBottom: '5px' }}>{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ margin: 0, color: entry.color, fontSize: '13px', fontWeight: 'bold' }}>
            {entry.name}: {entry.value}%
          </p>
        ))}
        {isPeakAlert && (
          <p style={{ color: '#da3633', margin: '5px 0 0 0', fontSize: '12px', fontWeight: 'bold' }}>
            ALERTĂ: SATURAȚIE MAXIMĂ (100%)
          </p>
        )}
      </div>
    );
  }
  return null;
};

export default function CapacityChartsGrid() {
  return (
    <div className="capacity-charts-grid">
      <div className="capacity-card">
        <h3>Evoluție Throughput DL vs. UL (Mbps)</h3>
        <div className="chart-box-280">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={throughputTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
              <XAxis dataKey="time" stroke="#8b949e" />
              <YAxis stroke="#8b949e" />
              <Tooltip contentStyle={{ backgroundColor: '#161b22', border: '1px solid #30363d' }} />
              <Legend />
              <Line type="monotone" dataKey="dlMbps" name="Throughput DL (Mbps)" stroke="#58a6ff" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="ulMbps" name="Throughput UL (Mbps)" stroke="#3fb950" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="capacity-card">
        <h3>Grad de Ocupare Resurse (PRB DL % vs Peak)</h3>
        <div className="chart-box-280">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={prbTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
              <XAxis dataKey="time" stroke="#8b949e" />
              <YAxis stroke="#8b949e" domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area type="monotone" dataKey="peakPrb" name="Peak PRB Slot Max %" stroke="#f85149" fill="#f8514922" />
              <Area type="monotone" dataKey="prbDl" name="PRB DL Mediu %" stroke="#d29922" fill="#d2992222" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}