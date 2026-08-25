import React, { useState, useEffect } from 'react';
import { getNodeNames, getTelemetryData } from "../../../../../api";
import './CapacityKpiGrid.css';

export default function CapacityKpiGrid({ 
  selectedStation = 'ALL',
  startTime = "2026-07-28T00:00:00+03:00",
  endTime = "2026-07-28T23:59:59+03:00"
}) {
  const [kpis, setKpis] = useState([
    { title: "DL Throughput Mediu", value: "Se încarcă...", type: "" },
    { title: "UL Throughput Mediu", value: "Se încarcă...", type: "" },
    { title: "PRB DL Mediu %", value: "Se încarcă...", type: "" },
    { title: "Peak PRB Slot Max %", value: "Se încarcă...", type: "" }
  ]);

  const extractVal = (data, key) => {
    if (!data || data[key] === undefined || data[key] === null) return 0;
    const val = data[key];
    if (typeof val === 'number') return val;
    if (Array.isArray(val) && val.length > 0) {
      return Number(val[0].value ?? val[0][key] ?? Object.values(val[0])[0]) || 0;
    }
    if (typeof val === 'object') {
      return Number(val.value ?? Object.values(val)[0]) || 0;
    }
    return Number(val) || 0;
  };

  useEffect(() => {
    const fetchKpis = async () => {
      try {
        const nodesResponse = await getNodeNames();
        const rawNodes = nodesResponse.data;
        const nodes = Array.isArray(rawNodes) ? rawNodes : (rawNodes?.nodes || []);
        
        const targetNodes = selectedStation === 'ALL'
          ? nodes
          : nodes.filter(n => String(n) === String(selectedStation));

        let totalDl = 0;
        let totalUl = 0;
        let totalPrb = 0;
        let maxPeakPrb = 0;
        let count = 0;

        for (const node of targetNodes) {
          try {
            const response = await getTelemetryData(
              node,
              ["DL_Throughput", "UL_Throughput", "PRB_DL", "Peak_PRB"],
              "1d",
              true,
              startTime,
              endTime
            );

            const data = response.data || {};
            const dl = extractVal(data, "DL_Throughput");
            const ul = extractVal(data, "UL_Throughput");
            const prb = extractVal(data, "PRB_DL");
            const peak = extractVal(data, "Peak_PRB");

            totalDl += dl;
            totalUl += ul;
            totalPrb += prb;
            if (peak > maxPeakPrb) maxPeakPrb = peak;
            count++;
          } catch (err) {
            console.error(`Eroare KPI pentru statia ${node}:`, err);
          }
        }

        const avgDl = count ? totalDl / count : 0;
        const avgUl = count ? totalUl / count : 0;
        const avgPrb = count ? totalPrb / count : 0;

        setKpis([
          {
            title: "DL Throughput Mediu",
            value: `${Number(avgDl).toFixed(2)} KB/s`,
            type: ""
          },
          {
            title: "UL Throughput Mediu",
            value: `${Number(avgUl).toFixed(2)} KB/s`,
            type: ""
          },
          {
            title: "PRB DL Mediu %",
            value: `${Number(avgPrb).toFixed(2)}%`,
            type: avgPrb >= 70 ? "warning" : ""
          },
          {
            title: "Peak PRB Slot Max %",
            value: `${Number(maxPeakPrb).toFixed(2)}%`,
            type: maxPeakPrb >= 100 ? "critical" : ""
          }
        ]);
      } catch (error) {
        console.error("Eroare la preluarea KPI-urilor:", error);
        setKpis([
          { title: "DL Throughput Mediu", value: "0.00 KB/s", type: "" },
          { title: "UL Throughput Mediu", value: "0.00 KB/s", type: "" },
          { title: "PRB DL Mediu %", value: "0.00%", type: "" },
          { title: "Peak PRB Slot Max %", value: "0.00%", type: "" }
        ]);
      }
    };

    fetchKpis();
  }, [selectedStation, startTime, endTime]);

  return (
    <div className="capacity-kpi-grid">
      {kpis.map((kpi, index) => (
        <div key={index} className="capacity-card">
          <h4>{kpi.title}</h4>
          <p className={`kpi-value ${kpi.type}`}>
            {kpi.value}
          </p>
        </div>
      ))}
    </div>
  );
}