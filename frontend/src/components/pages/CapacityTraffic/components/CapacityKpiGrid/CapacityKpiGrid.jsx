import React, { useState, useEffect } from 'react';
import { getNodeNames, getTelemetryData } from "../../../../../api";
import './CapacityKpiGrid.css';

export default function CapacityKpiGrid() {
  const [kpis, setKpis] = useState([
    { title: "DL Throughput Mediu", value: "Se încarcă...", type: "" },
    { title: "UL Throughput Mediu", value: "Se încarcă...", type: "" },
    { title: "PRB DL Mediu %", value: "Se încarcă...", type: "" },
    { title: "Peak PRB Slot Max %", value: "Se încarcă...", type: "" }
  ]);

  const startTime = "2026-07-28T00:00:00+03:00";
  const endTime = "2026-07-28T23:59:59+03:00";

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
          true,
          startTime,
          endTime
        );

        const data = response.data || {};

        const dlThroughput = extractVal(data, "DL_Throughput");
        const ulThroughput = extractVal(data, "UL_Throughput");
        const prbDl = extractVal(data, "PRB_DL");
        const peakPrb = extractVal(data, "Peak_PRB");

        setKpis([
          {
            title: "DL Throughput Mediu",
            value: `${Number(dlThroughput).toFixed(2)} KB/s`,
            type: ""
          },
          {
            title: "UL Throughput Mediu",
            value: `${Number(ulThroughput).toFixed(2)} KB/s`,
            type: ""
          },
          {
            title: "PRB DL Mediu %",
            value: `${Number(prbDl).toFixed(2)}%`,
            type: prbDl >= 70 ? "warning" : ""
          },
          {
            title: "Peak PRB Slot Max %",
            value: `${Number(peakPrb).toFixed(2)}%`,
            type: peakPrb >= 100 ? "critical" : ""
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
  }, []);

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