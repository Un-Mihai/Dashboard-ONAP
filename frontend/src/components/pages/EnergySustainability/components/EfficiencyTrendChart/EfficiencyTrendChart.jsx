import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './EfficiencyTrendChart.css';

export default function EfficiencyTrendChart({ 
  data = [], 
  bucketSize = '15m', 
  onBucketChange, 
  selectedStation = 'ALL',
  selectedMetric = 'efficiency_trend'
}) {
  const stationLabel = selectedStation === 'ALL' ? 'Toată Rețeaua' : `gNB_${selectedStation}`;

  const getChartConfig = () => {
    switch (selectedMetric) {
      case 'power':
        return { title: 'Consum Putere în Timp', dataKey: 'power', unit: ' W', color: '#e34c26', name: 'Putere (W)' };
      case 'voltage':
        return { title: 'Tensiune Medie în Timp', dataKey: 'voltage', unit: ' V', color: '#58a6ff', name: 'Tensiune (V)' };
      case 'traffic':
        return { title: 'Trafic Total în Timp', dataKey: 'traffic', unit: ' GB', color: '#1f6feb', name: 'Trafic (GB)' };
      case 'efficiency_trend':
      default:
        return { title: 'Eficiența Energetică în Timp', dataKey: 'eficienta', unit: ' GB/kWh', color: '#2ea043', name: 'Eficiență (GB/kWh)' };
    }
  };

  const config = getChartConfig();

  return (
    <div className="energy-card efficiency-trend-card">
      <div className="chart-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ margin: 0 }}>{config.title} ({config.unit.trim()}) — {stationLabel}</h3>
        
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
            Nu există date pentru selecția curentă.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
              <XAxis dataKey="time" stroke="#8b949e" />
              <YAxis stroke="#8b949e" unit={config.unit} />
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
                dataKey={config.dataKey} 
                name={config.name} 
                stroke={config.color} 
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