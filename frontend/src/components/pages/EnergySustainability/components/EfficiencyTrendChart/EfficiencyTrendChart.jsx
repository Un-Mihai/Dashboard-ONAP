import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './EfficiencyTrendChart.css';

export default function EfficiencyTrendChart({ 
  data = [], 
  bucketSize = '15m', 
  onBucketChange, 
  selectedStation = 'ALL' 
}) {
  const stationLabel = selectedStation === 'ALL' ? 'Toată Rețeaua' : `gNB_${selectedStation}`;

  return (
    <div className="energy-card efficiency-trend-card">
      <div className="chart-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ margin: 0 }}>Eficiența Energetică în Timp (GB per kWh) — {stationLabel}</h3>
        
        {/* Selector de granularitate dedicat graficului */}
        <div className="chart-granularity-control" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '13px', color: '#8b949e' }}>Granularitate:</label>
          <select 
            value={bucketSize} 
            onChange={(e) => onBucketChange(e.target.value)}
            className="filter-select"
          >
            <option value="15m">15 Minute (15m)</option>
            <option value="1h">1 Oră (1h)</option>
            <option value="1d">1 Zi (1d)</option>
          </select>
        </div>
      </div>

      <div className="chart-container-280">
        {data.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#8b949e' }}>
            Nu există date de eficiență pentru selecția curentă.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
              <XAxis dataKey="time" stroke="#8b949e" />
              <YAxis stroke="#8b949e" unit=" GB/kWh" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#161b22', 
                  border: '1px solid #30363d',
                  borderRadius: '6px',
                  color: '#c9d1d9'
                }} 
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="eficienta" 
                name="Eficiență (GB/kWh)" 
                stroke="#2ea043" 
                strokeWidth={2} 
                dot={{ r: 4 }} 
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}