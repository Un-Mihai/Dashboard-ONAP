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

import { getNodeNames, getTelemetryData } from "../../../../../api";
import './CapacityChartsGrid.css';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const peakValue = payload.find(p => p.dataKey === 'peakPrb')?.value;
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
        <p style={{ margin: 0, color: '#8b949e', marginBottom: '5px' }}>
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
            {entry.dataKey === 'prbDl' || entry.dataKey === 'peakPrb' ? '%' : ' KB/s'}
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

  const startTime = "2026-07-28T00:00:00+03:00";
  const endTime = "2026-07-28T23:59:59+03:00";

  const extractTime = (item) => {
    return item.bucket_time || item.time || item.timestamp || item.period_start_time || "";
  };

  const formatDisplayTime = (timeStr) => {
    if (!timeStr) return "";
    const cleanStr = timeStr.replace(" ", "T");
    const d = new Date(cleanStr);
    if (!isNaN(d.getTime())) {
      return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    }
    const parts = timeStr.split(/[\sT]/);
    return parts[1] ? parts[1].substring(0, 5) : timeStr.substring(0, 5);
  };

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const nodesResponse = await getNodeNames();
        const rawNodes = nodesResponse.data;
        const nodes = Array.isArray(rawNodes) ? rawNodes : (rawNodes?.nodes || []);
        const targetNode = nodes[0] || "43618";

        const response = await getTelemetryData(
          targetNode,
          [
            "DL_Throughput",
            "UL_Throughput",
            "PRB_DL",
            "Peak_PRB"
          ],
          "15m",
          false,
          startTime,
          endTime
        );

        const data = response.data || {};

        const dlData = Array.isArray(data["DL_Throughput"]) ? data["DL_Throughput"] : [];
        const ulData = Array.isArray(data["UL_Throughput"]) ? data["UL_Throughput"] : [];
        const prbDlData = Array.isArray(data["PRB_DL"]) ? data["PRB_DL"] : [];
        const peakPrbData = Array.isArray(data["Peak_PRB"]) ? data["Peak_PRB"] : [];

        // 1. Mapare Throughput DL vs UL
        const throughputMap = {};
        const getOrCreateThroughput = (t) => {
          if (!throughputMap[t]) {
            throughputMap[t] = { rawTime: t, dlMbps: 0, ulMbps: 0 };
          }
          return throughputMap[t];
        };

        dlData.forEach(item => {
          const t = extractTime(item);
          if (!t) return;
          const entry = getOrCreateThroughput(t);
          entry.dlMbps = Number(item.DL_Throughput ?? item.value ?? 0);
        });

        ulData.forEach(item => {
          const t = extractTime(item);
          if (!t) return;
          const entry = getOrCreateThroughput(t);
          entry.ulMbps = Number(item.UL_Throughput ?? item.value ?? 0);
        });

        const formattedThroughputData = Object.values(throughputMap)
          .sort((a, b) => new Date(a.rawTime.replace(" ", "T")) - new Date(b.rawTime.replace(" ", "T")))
          .map(item => ({
            time: formatDisplayTime(item.rawTime),
            dlMbps: +(item.dlMbps || 0).toFixed(2),
            ulMbps: +(item.ulMbps || 0).toFixed(2)
          }));

        setThroughputTrendData(formattedThroughputData);

        // 2. Mapare Grad de Ocupare Resurse (PRB DL vs Peak)
        const prbMap = {};
        const getOrCreatePrb = (t) => {
          if (!prbMap[t]) {
            prbMap[t] = { rawTime: t, prbDl: 0, peakPrb: 0 };
          }
          return prbMap[t];
        };

        prbDlData.forEach(item => {
          const t = extractTime(item);
          if (!t) return;
          const entry = getOrCreatePrb(t);
          entry.prbDl = Number(item.PRB_DL ?? item.value ?? 0);
        });

        peakPrbData.forEach(item => {
          const t = extractTime(item);
          if (!t) return;
          const entry = getOrCreatePrb(t);
          entry.peakPrb = Number(item.Peak_PRB ?? item.value ?? 0);
        });

        const formattedPrbData = Object.values(prbMap)
          .sort((a, b) => new Date(a.rawTime.replace(" ", "T")) - new Date(b.rawTime.replace(" ", "T")))
          .map(item => ({
            time: formatDisplayTime(item.rawTime),
            prbDl: +(item.prbDl || 0).toFixed(2),
            peakPrb: +(item.peakPrb || 0).toFixed(2)
          }));

        setPrbTrendData(formattedPrbData);

      } catch (error) {
        console.error("Eroare la încărcarea graficelor:", error);
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
              <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
              <XAxis dataKey="time" stroke="#8b949e" />
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
              <CartesianGrid strokeDasharray="3 3" stroke="#30363d" />
              <XAxis dataKey="time" stroke="#8b949e" />
              <YAxis stroke="#8b949e" domain={[0, 100]} />
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