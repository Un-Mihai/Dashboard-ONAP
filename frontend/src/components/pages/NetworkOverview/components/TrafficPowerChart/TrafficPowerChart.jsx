import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import './TrafficPowerChart.css';

export default function TrafficPowerChart({ data = [] }) {
  return (
    <div className="overview-card traffic-chart-card">
      <h3>Trafic Total (GB) vs. Putere Consumată (W) în ultimele 24h</h3>
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
            <XAxis dataKey="time" stroke="#8b949e" />
            <YAxis yAxisId="left" stroke="#58a6ff" />
            <YAxis yAxisId="right" orientation="right" stroke="#e34c26" />
            <Tooltip contentStyle={{ backgroundColor: '#161b22', border: '1px solid #30363d' }} />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="trafic" name="Trafic (GB)" stroke="#58a6ff" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            <Line yAxisId="right" type="monotone" dataKey="putere" name="Putere (W)" stroke="#e34c26" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}