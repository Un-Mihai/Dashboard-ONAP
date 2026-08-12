import React from 'react';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './StationChartsGrid.css';

export default function StationChartsGrid({ data }) {
  return (
    <div className="station-charts-grid">
      <div className="station-card">
        <h3>Ocupare PRB DL (%) - Medie vs Peak</h3>
        <div className="chart-box">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
              <XAxis dataKey="time" stroke="#8b949e" />
              <YAxis stroke="#8b949e" />
              <Tooltip contentStyle={{ backgroundColor: '#161b22', border: '1px solid #30363d' }} />
              <Area type="monotone" dataKey="prbPeak" name="Peak PRB (%)" stroke="#f85149" fill="#f8514922" />
              <Area type="monotone" dataKey="prb" name="PRB Mediu (%)" stroke="#58a6ff" fill="#58a6ff22" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="station-card">
        <h3>Consum Electric în Timp (Watts)</h3>
        <div className="chart-box">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
              <XAxis dataKey="time" stroke="#8b949e" />
              <YAxis stroke="#8b949e" />
              <Tooltip contentStyle={{ backgroundColor: '#161b22', border: '1px solid #30363d' }} />
              <Line type="monotone" dataKey="power" name="Putere (W)" stroke="#d29922" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}