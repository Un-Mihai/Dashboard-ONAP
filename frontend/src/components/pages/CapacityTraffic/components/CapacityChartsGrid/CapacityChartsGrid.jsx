import React, { useEffect, useState } from 'react';
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

import { getTelemetryData } from "../../../../../api";
import './CapacityChartsGrid.css';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const peakValue = payload.find(
      p => p.dataKey === 'peakPrb'
    )?.value;

    const isPeakAlert = peakValue >= 100;

    return (
      <div
        style={{
          backgroundColor: '#161b22',
          border: `1px solid ${isPeakAlert ? '#da3633' : '#30363d'}`,
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
            {entry.dataKey === 'prbDl' ||
            entry.dataKey === 'peakPrb'
              ? '%'
              : ' KB/s'}
          </p>
        ))}

        {isPeakAlert && (
          <p
            style={{
              color: '#da3633',
              margin: '5px 0 0 0',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
          >
            ALERTĂ: SATURAȚIE MAXIMĂ (100%)
          </p>
        )}
      </div>
    );
  }

  return null;
};

export default function CapacityChartsGrid() {
  const [throughputTrendData, setThroughputTrendData] = useState([]);
  const [prbTrendData, setPrbTrendData] = useState([]);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await getTelemetryData(
          "43620",
          [
            "DL_Throughput",
            "UL_Throughput",
            "PRB_DL",
            "Peak_PRB"
          ],
          "1h",
          false,
          "2026-08-02T00:00:00+03:00",
          "2026-08-04T00:00:00+03:00"
        );

        const data = response.data;

        const dlData = data["DL_Throughput"] || [];
        const ulData = data["UL_Throughput"] || [];
        const prbDlData = data["PRB_DL"] || [];
        const peakPrbData = data["Peak_PRB"] || [];

        const throughputMap = {};

        dlData.forEach(item => {
          const time = item.bucket_time;

          if (!throughputMap[time]) {
            throughputMap[time] = {
              time
            };
          }

          throughputMap[time].dlMbps =
            Number(item["DL_Throughput"]) || 0;
        });

        ulData.forEach(item => {
          const time = item.bucket_time;

          if (!throughputMap[time]) {
            throughputMap[time] = {
              time
            };
          }

          throughputMap[time].ulMbps =
            Number(item["UL_Throughput"]) || 0;
        });

        const formattedThroughputData = Object.values(throughputMap)
          .map(item => ({
            ...item,
            time: new Date(item.time).toLocaleString('ro-RO', {
              hour: '2-digit',
              minute: '2-digit'
            }),
            dlMbps: item.dlMbps || 0,
            ulMbps: item.ulMbps || 0
          }));

        setThroughputTrendData(formattedThroughputData);

        const prbMap = {};

        prbDlData.forEach(item => {
          const time = item.bucket_time;

          if (!prbMap[time]) {
            prbMap[time] = {
              time
            };
          }

          prbMap[time].prbDl =
            Number(item["PRB_DL"]) || 0;
        });

        peakPrbData.forEach(item => {
          const time = item.bucket_time;

          if (!prbMap[time]) {
            prbMap[time] = {
              time
            };
          }

          prbMap[time].peakPrb =
            Number(item["Peak_PRB"]) || 0;
        });

        const formattedPrbData = Object.values(prbMap)
          .map(item => ({
            ...item,
            time: new Date(item.time).toLocaleString('ro-RO', {
              hour: '2-digit',
              minute: '2-digit'
            }),
            prbDl: item.prbDl || 0,
            peakPrb: item.peakPrb || 0
          }));

        setPrbTrendData(formattedPrbData);

      } catch (error) {
        console.error(
          "Eroare la încărcarea graficelor:",
          error
        );
      }
    };

    fetchChartData();
  }, []);

  return (
    <div className="capacity-charts-grid">

      <div className="capacity-card">
        <h3>Evoluție Throughput DL vs. UL (KB/s)</h3>

        <div className="chart-box-280">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={throughputTrendData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#30363d"
              />

              <XAxis
                dataKey="time"
                stroke="#8b949e"
              />

              <YAxis stroke="#8b949e" />

              <Tooltip
                contentStyle={{
                  backgroundColor: '#161b22',
                  border: '1px solid #30363d'
                }}
              />

              <Legend />

              <Line
                type="monotone"
                dataKey="dlMbps"
                name="Throughput DL (KB/s)"
                stroke="#58a6ff"
                strokeWidth={2}
                dot={{ r: 3 }}
              />

              <Line
                type="monotone"
                dataKey="ulMbps"
                name="Throughput UL (KB/s)"
                stroke="#3fb950"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="capacity-card">
        <h3>Grad de Ocupare Resurse (PRB DL % vs Peak)</h3>

        <div className="chart-box-280">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={prbTrendData}>
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
              />

              <Tooltip content={<CustomTooltip />} />

              <Legend />

              <Area
                type="monotone"
                dataKey="peakPrb"
                name="Peak PRB Slot Max %"
                stroke="#f85149"
                fill="#f8514922"
              />

              <Area
                type="monotone"
                dataKey="prbDl"
                name="PRB DL Mediu %"
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