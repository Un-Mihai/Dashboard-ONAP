import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

import './StationChartsGrid.css';

export default function StationChartsGrid({
  data,
  bucketSize,
  onBucketChange
}) {

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) {
      return null;
    }

    return (
      <div
        style={{
          backgroundColor: '#161b22',
          border: '1px solid #30363d',
          padding: '10px',
          borderRadius: '4px'
        }}
      >
        <p
          style={{
            margin: 0,
            color: '#8b949e',
            marginBottom: '5px'
          }}
        >
          {label}
        </p>

        {payload.map((entry, index) => (
          <p
            key={index}
            style={{
              margin: 0,
              color: entry.color,
              fontSize: '13px',
              fontWeight: 'bold'
            }}
          >
            {entry.name}: {Number(entry.value).toFixed(2)}
          </p>
        ))}
      </div>
    );
  };

  return (
    <div className="station-charts-grid">

      {}

      <div className="station-card">

        <div
          className="chart-header-row"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '15px'
          }}
        >

          <h3 style={{ margin: 0 }}>
            Evoluție Consum Energie
          </h3>

          {}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >

            <label
              style={{
                fontSize: '13px',
                color: '#8b949e'
              }}
            >
              Granularitate:
            </label>

            <select
              value={bucketSize}
              onChange={(e) =>
                onBucketChange(e.target.value)
              }
              className="filter-select"
            >
              <option value="15m">
                15m
              </option>

              <option value="1h">
                1h
              </option>

              <option value="1d">
                1d
              </option>
            </select>

          </div>

        </div>

        <div className="chart-box-280">

          <ResponsiveContainer
            width="100%"
            height="100%"
          >

            <LineChart data={data}>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#30363d"
              />

              <XAxis
                dataKey="time"
                stroke="#8b949e"
              />

              <YAxis
                stroke="#8b949e"
              />

              <Tooltip
                content={
                  <CustomTooltip />
                }
              />

              <Legend />

              <Line
                type="monotone"
                dataKey="power"
                name="Consum Energie"
                stroke="#58a6ff"
                strokeWidth={2}
                dot={{ r: 3 }}
              />

            </LineChart>

          </ResponsiveContainer>

        </div>

      </div>


      {/* ==========================================
          GRAFIC PRB
      ========================================== */}

      <div className="station-card">

        <div
          className="chart-header-row"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '15px'
          }}
        >

          <h3 style={{ margin: 0 }}>
            Grad de Ocupare Resurse PRB
          </h3>

        </div>

        <div className="chart-box-280">

          <ResponsiveContainer
            width="100%"
            height="100%"
          >

            <AreaChart data={data}>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#30363d"
              />

              <XAxis
                dataKey="time"
                stroke="#8b949e"
              />

              <YAxis
                stroke="#8b949e"
                domain={[0, 100]}
                unit="%"
              />

              <Tooltip
                content={
                  <CustomTooltip />
                }
              />

              <Legend />

              <Area
                type="monotone"
                dataKey="prbPeak"
                name="Peak PRB"
                stroke="#f85149"
                fill="#f8514922"
              />

              <Area
                type="monotone"
                dataKey="prb"
                name="PRB DL"
                stroke="#d29922"
                fill="#d2992222"
              />

            </AreaChart>

          </ResponsiveContainer>

        </div>

      </div>

    </div>
  );
}