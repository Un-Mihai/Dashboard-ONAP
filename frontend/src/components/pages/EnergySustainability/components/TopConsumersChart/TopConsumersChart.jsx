import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './TopConsumersChart.css';

export default function TopConsumersChart({ data = [], powerUnit = 'W' }) {
  const displayUnit = powerUnit ? ` ${powerUnit}` : ' W';

  return (
    <div className="energy-card top-consumers-card">
      <h3 style={{ margin: 0, marginBottom: '15px' }}>
        Top Stații după Consumul Energetic ({powerUnit || 'W'})
      </h3>
      <div className="chart-container-280">
        {data.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#8b949e' }}>
            Nu există date de consum disponibile.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={data}
              margin={{ top: 15, right: 30, left: 20, bottom: 15 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
              <XAxis dataKey="name" stroke="#8b949e" tickMargin={8} />
              <YAxis stroke="#8b949e" unit={displayUnit} width={65} />
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
                name={`Consum Mediu (${powerUnit || 'W'})`} 
                fill="#d29922" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={60}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}