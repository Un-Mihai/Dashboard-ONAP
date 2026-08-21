import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './TopConsumersChart.css';

export default function TopConsumersChart({ data = [] }) {
  return (
    <div className="energy-card top-consumers-card">
      <h3>Top Stații după Consumul Energetic (Watts)</h3>
      <div className="chart-container-280">
        {data.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#8b949e' }}>
            Nu există date de consum disponibile.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
              <XAxis dataKey="name" stroke="#8b949e" />
              <YAxis stroke="#8b949e" unit=" W" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#161b22', 
                  border: '1px solid #30363d',
                  borderRadius: '6px',
                  color: '#c9d1d9' 
                }} 
              />
              <Bar 
                dataKey="power" 
                name="Consum Mediu (W)" 
                fill="#d29922" 
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}