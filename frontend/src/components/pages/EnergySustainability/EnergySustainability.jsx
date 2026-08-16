import React, { useState, useEffect } from 'react';

import { getNodeNames, getTelemetryData } from "../../../api";

import TotalEnergyCard from './components/TotalEnergyCard/TotalEnergyCard';
import AveragePowerCard from './components/AveragePowerCard/AveragePowerCard';
import AverageVoltageCard from './components/AverageVoltageCard/AverageVoltageCard';
import EnergyEfficiencyCard from './components/EnergyEfficiencyCard/EnergyEfficiencyCard';
import TopConsumersChart from './components/TopConsumersChart/TopConsumersChart';
import EfficiencyTrendChart from './components/EfficiencyTrendChart/EfficiencyTrendChart';
import EnergySustainabilityTable from './components/EnergySustainabilityTable/EnergySustainabilityTable';

import './EnergySustainability.css';

export default function EnergySustainability({ viewMode }) {
  const [energyData, setEnergyData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Intervalul real prezent în baza de date SQL
  const startTime = "2026-07-28T00:00:00+03:00";
  const endTime = "2026-07-28T23:59:59+03:00";

  const metrics = [
    "RFM_Energy_Consumption",
    "RFM_Energy_Monitoring",
    "DL_Traffic_Volume",
    "UL_Traffic_Volume"
  ];

  // Helper robust pentru extragerea valorilor agregate
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

  // Helper pentru extragerea timestamp-ului
  const extractTime = (item) => {
    return item.bucket_time || item.time || item.timestamp || item.period_start_time || "";
  };

  // Formatare oră (HH:MM)
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
    const fetchEnergyData = async () => {
      try {
        const { data: rawNodes } = await getNodeNames();
        const nodes = Array.isArray(rawNodes) ? rawNodes : (rawNodes?.nodes || []);

        // 1. Date Agregate per Stație
        const stationPromises = nodes.map(async (nodeName, index) => {
          try {
            const { data } = await getTelemetryData(
              nodeName,
              metrics,
              "15m",
              true,
              startTime,
              endTime
            );

            const power = extractVal(data, "RFM_Energy_Consumption");
            const voltage = extractVal(data, "RFM_Energy_Monitoring");
            const dl = extractVal(data, "DL_Traffic_Volume");
            const ul = extractVal(data, "UL_Traffic_Volume");

            const traffic = (dl + ul) / (1024 ** 3);
            const energy = power / 1000;
            const efficiency = energy > 0 ? traffic / energy : 0;

            return {
              id: index + 1,
              name: `gNB_${nodeName}`,
              voltage: +(voltage || 0).toFixed(2),
              power: +(power || 0).toFixed(2),
              traffic: +(traffic || 0).toFixed(4),
              efficiency: +(efficiency || 0).toFixed(4),
              energy: +(energy || 0).toFixed(4)
            };
          } catch (error) {
            console.error(`Eroare pentru statia ${nodeName}:`, error);
            return null;
          }
        });

        const validStations = (await Promise.all(stationPromises)).filter(Boolean);

        const totals = validStations.reduce(
          (acc, station) => ({
            energy: acc.energy + station.energy,
            power: acc.power + station.power,
            voltage: acc.voltage + station.voltage,
            traffic: acc.traffic + station.traffic
          }),
          { energy: 0, power: 0, voltage: 0, traffic: 0 }
        );

        const count = validStations.length;

        const topConsumersData = [...validStations]
          .sort((a, b) => b.power - a.power)
          .slice(0, 5)
          .map(({ name, power }) => ({ name, power }));

        // 2. Date Neagregate pentru Graficul de Eficiență în Timp
        const trendMap = {};
        const addTrendVal = (t, key, val) => {
          if (!t) return;
          if (!trendMap[t]) trendMap[t] = { rawTime: t, power: 0, dl: 0, ul: 0 };
          trendMap[t][key] += Number(val) || 0;
        };

        for (const nodeName of nodes) {
          try {
            const { data } = await getTelemetryData(
              nodeName,
              ["RFM_Energy_Consumption", "DL_Traffic_Volume", "UL_Traffic_Volume"],
              "15m",
              false,
              startTime,
              endTime
            );

            const pArr = Array.isArray(data?.RFM_Energy_Consumption) ? data.RFM_Energy_Consumption : [];
            const dlArr = Array.isArray(data?.DL_Traffic_Volume) ? data.DL_Traffic_Volume : [];
            const ulArr = Array.isArray(data?.UL_Traffic_Volume) ? data.UL_Traffic_Volume : [];

            pArr.forEach(item => {
              const t = extractTime(item);
              const val = Number(item.RFM_Energy_Consumption ?? item.value ?? Object.values(item)[1]) || 0;
              addTrendVal(t, "power", val);
            });

            dlArr.forEach(item => {
              const t = extractTime(item);
              const val = Number(item.DL_Traffic_Volume ?? item.value ?? 0);
              addTrendVal(t, "dl", val);
            });

            ulArr.forEach(item => {
              const t = extractTime(item);
              const val = Number(item.UL_Traffic_Volume ?? item.value ?? 0);
              addTrendVal(t, "ul", val);
            });
          } catch (err) {
            console.warn(`Eroare trend statia ${nodeName}:`, err);
          }
        }

        const efficiencyTrendData = Object.values(trendMap)
          .sort((a, b) => new Date(a.rawTime.replace(" ", "T")) - new Date(b.rawTime.replace(" ", "T")))
          .map(item => {
            const trafficGb = (item.dl + item.ul) / (1024 ** 3);
            const energyKwh = item.power / 1000;
            const eficienta = energyKwh > 0 ? trafficGb / energyKwh : 0;

            return {
              time: formatDisplayTime(item.rawTime),
              eficienta: +(eficienta || 0).toFixed(4),
              power: +(item.power || 0).toFixed(2),
              traffic: +(trafficGb || 0).toFixed(4)
            };
          });

        setEnergyData({
          totalEnergy: +totals.energy.toFixed(2),
          avgPower: +(count ? totals.power / count : 0).toFixed(2),
          avgVoltage: +(count ? totals.voltage / count : 0).toFixed(2),
          efficiency: +(totals.energy > 0 ? totals.traffic / totals.energy : 0).toFixed(4),
          topConsumersData,
          efficiencyTrendData,
          stationEnergyData: validStations
        });

      } catch (error) {
        console.error("Eroare la încărcarea datelor Energy & Sustainability:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEnergyData();
  }, []);

  if (loading) {
    return <p className="status-loading">Se încarcă datele energetice...</p>;
  }

  return (
    <>
      {viewMode === 'grafic' ? (
        <div className="energy-container">
          <div className="energy-kpi-grid">
            <TotalEnergyCard value={`${energyData?.totalEnergy ?? 0} kWh`} />
            <AveragePowerCard value={`${energyData?.avgPower ?? 0} W`} />
            <AverageVoltageCard value={`${energyData?.avgVoltage ?? 0} V`} />
            <EnergyEfficiencyCard value={`${energyData?.efficiency ?? 0} GB/kWh`} />
          </div>

          <TopConsumersChart data={energyData?.topConsumersData ?? []} />
          <EfficiencyTrendChart data={energyData?.efficiencyTrendData ?? []} />
        </div>
      ) : (
        <EnergySustainabilityTable stationEnergyData={energyData?.stationEnergyData ?? []} />
      )}
    </>
  );
}