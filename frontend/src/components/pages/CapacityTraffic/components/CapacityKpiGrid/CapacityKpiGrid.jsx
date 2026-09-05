import React, { useState, useEffect } from 'react';
import { getNodeNames, getTelemetryData } from "../../../../../api";
import { extractMetric, clampPercent } from "../../../../../formatters";
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

        let detectedDlUnit = 'KB/s';
        let detectedUlUnit = 'KB/s';
        let detectedPrbUnit = '%';

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
            const dlMetric = extractMetric(data, "DL_Throughput");
            const ulMetric = extractMetric(data, "UL_Throughput");
            const prbMetric = extractMetric(data, "PRB_DL");
            const peakMetric = extractMetric(data, "Peak_PRB");

            if (dlMetric.units) detectedDlUnit = dlMetric.units;
            if (ulMetric.units) detectedUlUnit = ulMetric.units;
            if (prbMetric.units) detectedPrbUnit = prbMetric.units;

            const valDl = Number(dlMetric.value) || 0;
            const valUl = Number(ulMetric.value) || 0;
            const valPrb = clampPercent(prbMetric.value);
            const valPeak = clampPercent(peakMetric.value);

            totalDl += valDl;
            totalUl += valUl;
            totalPrb += valPrb;

            if (valPeak > maxPeakPrb) {
              maxPeakPrb = valPeak;
            }

            count++;
          } catch (err) {
            console.error(`Eroare KPI pentru statia ${node}:`, err);
          }
        }

        const avgDl = count > 0 ? (totalDl / count) : 0;
        const avgUl = count > 0 ? (totalUl / count) : 0;
        const avgPrb = count > 0 ? (totalPrb / count) : 0;

        const cleanDl = isNaN(avgDl) ? 0 : avgDl;
        const cleanUl = isNaN(avgUl) ? 0 : avgUl;
        const cleanPrb = isNaN(avgPrb) ? 0 : avgPrb;
        const cleanPeak = isNaN(maxPeakPrb) ? 0 : maxPeakPrb;

        setKpis([
          {
            title: "DL Throughput Mediu",
            value: `${cleanDl.toFixed(2)} ${detectedDlUnit}`,
            type: ""
          },
          {
            title: "UL Throughput Mediu",
            value: `${cleanUl.toFixed(2)} ${detectedUlUnit}`,
            type: ""
          },
          {
            title: `PRB DL Mediu ${detectedPrbUnit}`,
            value: `${cleanPrb.toFixed(2)}${detectedPrbUnit}`,
            type: cleanPrb >= 70 ? "warning" : ""
          },
          {
            title: `Peak PRB Slot Max ${detectedPrbUnit}`,
            value: `${cleanPeak.toFixed(2)}${detectedPrbUnit}`,
            type: cleanPeak >= 100 ? "critical" : ""
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