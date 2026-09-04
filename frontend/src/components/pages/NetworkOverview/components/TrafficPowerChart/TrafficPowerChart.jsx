import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import './TrafficPowerChart.css';

export default function TrafficPowerChart({ 
  data = [], 
  bucketSize = '15m', 
  onBucketChange,
  selectedStation = 'ALL',
  selectedMetric = 'total_traffic' 
}) {
  const stationLabel = selectedStation === 'ALL' ? 'Toată Rețeaua' : `gNB_${selectedStation}`;

  // Determinăm titlul și unitatea de măsură în funcție de metrica selectată
  const getChartConfig = () => {
    switch (selectedMetric) {
      case 'dl':
        return { title: 'Trafic Downlink (DL)', dataKey: 'dl', unit: ' GB', color: '#58a6ff', yId: 'left' };
      case 'ul':
        return { title: 'Trafic Uplink (UL)', dataKey: 'ul', unit: ' GB', color: '#3fb950', yId: 'left' };
      case 'putere':
        return { title: 'Putere Medie (W)', dataKey: 'putere', unit: ' W', color: '#e34c26', yId: 'right' };
      case 'total_traffic':
      default:
        return { title: 'Trafic Total (DL + UL) vs. Putere', dataKey: 'trafic', unit: ' GB', color: '#58a6ff', yId: 'left' };
    }
  };

  const config = getChartConfig();

  return (
    <div className="overview-card traffic-chart-card">
      <div className="traffic-chart-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={{ margin: 0 }}>{config.title} — {stationLabel}</h3>
        
        {/* Selector de granularitate dedicat exclusiv graficului */}
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

      <div className="chart-wrapper">
        {data.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#8b949e' }}>
            Nu există date de telemetrie pentru selecția curentă.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
              <XAxis dataKey="time" stroke="#8b949e" />
              
              {/* Afișăm axele în funcție de ce metrică e activă */}
              <YAxis yAxisId="left" stroke="#58a6ff" unit=" GB" />
              <YAxis yAxisId="right" orientation="right" stroke="#e34c26" unit=" W" />

              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#161b22', 
                  border: '1px solid #30363d',
                  borderRadius: '6px',
                  color: '#c9d1d9'
                }} 
              />
              <Legend />

              {/* Dacă este selectat Trafic Total, afișăm ambele linii (Trafic + Putere, ca înainte) */}
              {selectedMetric === 'total_traffic' ? (
                <>
                  <Line 
                    yAxisId="left" 
                    type="monotone" 
                    dataKey="trafic" 
                    name="Trafic Total (GB)" 
                    stroke="#58a6ff" 
                    strokeWidth={2} 
                    dot={{ r: 4 }} 
                    activeDot={{ r: 6 }} 
                  />
                  <Line 
                    yAxisId="right" 
                    type="monotone" 
                    dataKey="putere" 
                    name="Putere (W)" 
                    stroke="#e34c26" 
                    strokeWidth={2} 
                    dot={{ r: 4 }} 
                    activeDot={{ r: 6 }} 
                  />
                </>
              ) : (
                /* Altfel, afișăm o singură linie dinamică în funcție de opțiunea aleasă în dropdown */
                <Line 
                  yAxisId={config.yId} 
                  type="monotone" 
                  dataKey={config.dataKey} 
                  name={config.title} 
                  stroke={config.color} 
                  strokeWidth={2} 
                  dot={{ r: 4 }} 
                  activeDot={{ r: 6 }} 
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}