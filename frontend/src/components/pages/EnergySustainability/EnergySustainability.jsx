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

  useEffect(() => {
    const fetchEnergyData = async () => {
      try {
        const { data: nodes } = await getNodeNames();

        const startTime = "2026-08-02T00:00:00+03:00";
        const endTime = "2026-08-04T00:00:00+03:00";

        const metrics = [
          "RFM_Energy_Consumption",
          "RFM_Energy_Monitoring",
          "DL_Traffic_Volume",
          "UL_Traffic_Volume"
        ];

        // Date agregate pentru fiecare stație
        const results = await Promise.all(
          nodes.map(async (nodeName, index) => {
            try {
              const { data } = await getTelemetryData(
                nodeName,
                metrics,
                "1d",
                true,
                startTime,
                endTime
              );

              const getValue = key =>
                Number(data[key]?.value ?? data[key]) || 0;

              const power = getValue("RFM_Energy_Consumption");
              const voltage = getValue("RFM_Energy_Monitoring");

              const trafficBytes =
                getValue("DL_Traffic_Volume") +
                getValue("UL_Traffic_Volume");

              const traffic = trafficBytes / (1024 ** 3);
              const energy = power / 1000;
              const efficiency =
                energy > 0 ? traffic / energy : 0;

              return {
                id: index + 1,
                name: `gNB_${nodeName}`,
                voltage: +voltage.toFixed(2),
                power: +power.toFixed(2),
                traffic: +traffic.toFixed(4),
                efficiency: +efficiency.toFixed(4),
                energy
              };
            } catch (error) {
              console.error(`Eroare pentru ${nodeName}`, error);
              return null;
            }
          })
        );

        const validStations = results.filter(Boolean);

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

        // Date neagregate pentru graficul de eficiență
        const trendResults = await Promise.all(
          nodes.map(async nodeName => {
            try {
              const { data } = await getTelemetryData(
                nodeName,
                [
                  "RFM_Energy_Consumption",
                  "DL_Traffic_Volume",
                  "UL_Traffic_Volume"
                ],
                "1h",
                false,
                startTime,
                endTime
              );

              return data;
            } catch (error) {
              console.error(`Eroare trend pentru ${nodeName}`, error);
              return null;
            }
          })
        );

        const trendMap = {};

        const addValue = (time, key, value) => {
          if (!time) return;

          if (!trendMap[time]) {
            trendMap[time] = { power: 0, dl: 0, ul: 0 };
          }

          trendMap[time][key] += Number(value) || 0;
        };

        trendResults
          .filter(Boolean)
          .flatMap(data => Array.isArray(data) ? data : [data])
          .forEach(node => {
            (node.RFM_Energy_Consumption || []).forEach(item =>
              addValue(
                item.bucket_time,
                "power",
                item.RFM_Energy_Consumption
              )
            );

            (node.DL_Traffic_Volume || []).forEach(item =>
              addValue(
                item.bucket_time,
                "dl",
                item.DL_Traffic_Volume
              )
            );

            (node.UL_Traffic_Volume || []).forEach(item =>
              addValue(
                item.bucket_time,
                "ul",
                item.UL_Traffic_Volume
              )
            );
          });

        const efficiencyTrendData = Object.entries(trendMap)
          .map(([rawTime, values]) => {
            const traffic =
              (values.dl + values.ul) / (1024 ** 3);

            const energy = values.power / 1000;

            return {
              rawTime,
              time: rawTime.split(" ")[1]?.substring(0, 5) || rawTime,
              eficienta: +(
                energy > 0 ? traffic / energy : 0
              ).toFixed(4)
            };
          })
          .sort(
            (a, b) =>
              new Date(a.rawTime.replace(" ", "T")) -
              new Date(b.rawTime.replace(" ", "T"))
          )
          .map(({ rawTime, ...item }) => item);

        console.log("EFFICIENCY TREND:", efficiencyTrendData);

        setEnergyData({
          totalEnergy: +totals.energy.toFixed(2),
          avgPower: +(count ? totals.power / count : 0).toFixed(2),
          avgVoltage: +(count ? totals.voltage / count : 0).toFixed(2),
          efficiency: +(
            totals.energy > 0
              ? totals.traffic / totals.energy
              : 0
          ).toFixed(4),
          topConsumersData,
          efficiencyTrendData,
          stationEnergyData: validStations.map(
            ({ energy, ...station }) => station
          )
        });

      } catch (error) {
        console.error(
          "Eroare la încărcarea datelor Energy & Sustainability:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEnergyData();
  }, []);

  if (loading) {
    return (
      <p className="status-loading">
        Se încarcă datele energetice...
      </p>
    );
  }

  return (
    <>
      {viewMode === 'grafic' ? (
        <div className="energy-container">
          <div className="energy-kpi-grid">
            <TotalEnergyCard
              value={`${energyData?.totalEnergy ?? 0} kWh`}
            />

            <AveragePowerCard
              value={`${energyData?.avgPower ?? 0} W`}
            />

            <AverageVoltageCard
              value={`${energyData?.avgVoltage ?? 0} V`}
            />

            <EnergyEfficiencyCard
              value={`${energyData?.efficiency ?? 0} GB/kWh`}
            />
          </div>

          <TopConsumersChart
            data={energyData?.topConsumersData ?? []}
          />

          <EfficiencyTrendChart
            data={energyData?.efficiencyTrendData ?? []}
          />
        </div>
      ) : (
        <EnergySustainabilityTable
          stationEnergyData={
            energyData?.stationEnergyData ?? []
          }
        />
      )}
    </>
  );
}