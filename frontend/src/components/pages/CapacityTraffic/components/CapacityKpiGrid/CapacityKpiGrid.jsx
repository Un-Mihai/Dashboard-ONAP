import React, { useState, useEffect } from 'react';
import { getTelemetryData } from "../../../../../api";
import './CapacityKpiGrid.css';

export default function CapacityKpiGrid() {
  const [kpis, setKpis] = useState([
    { title: "DL Throughput Mediu", value: "Se încarcă...", type: "" },
    { title: "UL Throughput Mediu", value: "Se încarcă...", type: "" },
    { title: "PRB DL Mediu %", value: "Se încarcă...", type: "" },
    { title: "Peak PRB Slot Max %", value: "Se încarcă...", type: "" }
  ]);

  useEffect(() => {
    const fetchKpis = async () => {
      try {
        const response = await getTelemetryData(
          "43620",
          [
            "DL_Throughput",
            "UL_Throughput",
            "PRB_DL",
            "Peak_PRB"
          ],
          "1d",
          true,
          "2026-08-02T00:00:00+03:00",
          "2026-08-04T00:00:00+03:00"
        );

        const data = response.data;

        const dlThroughput = data["DL_Throughput"]?.value || 0;
        const ulThroughput = data["UL_Throughput"]?.value || 0;
        const prbDl = data["PRB_DL"]?.value || 0;
        const peakPrb = data["Peak_PRB"]?.value || 0;

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
          { title: "Eroare conexiune", value: "Lipsă date", type: "critical" },
          { title: "Eroare conexiune", value: "Lipsă date", type: "critical" },
          { title: "Eroare conexiune", value: "Lipsă date", type: "critical" },
          { title: "Eroare conexiune", value: "Lipsă date", type: "critical" }
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