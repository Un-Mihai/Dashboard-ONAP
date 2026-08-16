import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './EfficiencyTrendChart.css';

export default function EfficiencyTrendChart({ data = [] }) {
  return (
    <div className="energy-card efficiency-trend-card">
      <h3>Eficiența Energetică în Timp (GB per kWh)</h3>
      <div className="chart-container-280">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
            <XAxis dataKey="time" stroke="#8b949e" />
            <YAxis stroke="#8b949e" />
            <Tooltip contentStyle={{ backgroundColor: '#161b22', border: '1px solid #30363d' }} />
            <Legend />
            <Line type="monotone" dataKey="eficienta" name="Eficiență (GB/kWh)" stroke="#2ea043" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}