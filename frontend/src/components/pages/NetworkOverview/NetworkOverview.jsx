import React, { useState, useEffect } from 'react';

import {
  getNodeNames,
  getTelemetryData
} from "../../../api";

import TotalGnbCard from './components/TotalGnbCard/TotalGnbCard';
import AvailabilityCard from './components/AvailabilityCard/AvailabilityCard';
import TotalTrafficCard from './components/TotalTrafficCard/TotalTrafficCard';
import AveragePowerCard from './components/AveragePowerCard/AveragePowerCard';
import StationRealtimeGrid from './components/StationRealtimeGrid/StationRealtimeGrid';
import TrafficPowerChart from './components/TrafficPowerChart/TrafficPowerChart';
import NetworkOverviewTable from './components/NetworkOverviewTable/NetworkOverviewTable';

import './NetworkOverview.css';

export default function NetworkOverview({ viewMode }) {
  const [networkData, setNetworkData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  const startTime = "2026-08-02T00:00:00+03:00";
  const endTime = "2026-08-04T00:00:00+03:00";

  const metrics = [
    "RFM_Energy_Consumption",
    "RFM_Energy_Monitoring",
    "DL_Traffic_Volume",
    "UL_Traffic_Volume"
  ];

  const getValue = (data, metric) =>
    Number(data[metric]?.value ?? data[metric]) || 0;

  // Date agregate pentru toate stațiile
  useEffect(() => {
    const loadNetworkData = async () => {
      try {
        const { data: nodes } = await getNodeNames();

        let totalTraffic = 0;
        let totalPower = 0;
        const stations = [];

        for (let i = 0; i < nodes.length; i++) {
          try {
            const { data } = await getTelemetryData(
              nodes[i],
              metrics,
              "1d",
              true,
              startTime,
              endTime
            );

            const power = getValue(data, "RFM_Energy_Consumption");
            const dl = getValue(data, "DL_Traffic_Volume");
            const ul = getValue(data, "UL_Traffic_Volume");

            const dlGb = dl / (1024 ** 3);
            const ulGb = ul / (1024 ** 3);
            const traffic = dlGb + ulGb;

            totalTraffic += traffic;
            totalPower += power;

            stations.push({
              id: i + 1,
              name: `gNB_${nodes[i]}`,
              availability: 0,
              traffic: +traffic.toFixed(4),
              power: +power.toFixed(2),
              active_alarms: 0
            });

          } catch (error) {
            console.error(
              `Eroare la stația ${nodes[i]}:`,
              error
            );
          }
        }

        setNetworkData({
          total_gnb: nodes.length,
          avg_availability: 0,
          total_traffic: +totalTraffic.toFixed(4),
          avg_power: stations.length
            ? +(totalPower / stations.length).toFixed(2)
            : 0,
          stations
        });

      } catch (error) {
        console.error("Eroare Network Overview:", error);
      } finally {
        setLoading(false);
      }
    };

    loadNetworkData();
  }, []);

  // Date reale pentru grafic
  useEffect(() => {
    const loadChartData = async () => {
      try {
        const { data: nodes } = await getNodeNames();
        const history = {};

        for (const node of nodes) {
          const { data } = await getTelemetryData(
            node,
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

          const power = data.RFM_Energy_Consumption || [];
          const dl = data.DL_Traffic_Volume || [];
          const ul = data.UL_Traffic_Volume || [];

          power.forEach(item => {
            const t = item.bucket_time;

            if (!history[t])
              history[t] = { rawTime: t, trafic: 0, putere: 0 };

            history[t].putere +=
              Number(item.RFM_Energy_Consumption) || 0;
          });

          [...dl, ...ul].forEach(item => {
            const t = item.bucket_time;

            if (!history[t])
              history[t] = { rawTime: t, trafic: 0, putere: 0 };

            const metric =
              item.DL_Traffic_Volume ??
              item.UL_Traffic_Volume ??
              0;

            history[t].trafic +=
              Number(metric) / (1024 ** 3);
          });
        }

        const result = Object.values(history)
          .sort((a, b) =>
            new Date(a.rawTime.replace(" ", "T")) -
            new Date(b.rawTime.replace(" ", "T"))
          )
          .map(item => ({
            time: item.rawTime?.split(" ")[1]?.substring(0, 5),
            trafic: +item.trafic.toFixed(4),
            putere: +item.putere.toFixed(2)
          }));

        setChartData(result);

      } catch (error) {
        console.error("Eroare grafic:", error);
      }
    };

    loadChartData();
  }, []);

  if (loading)
    return (
      <p className="status-loading">
        Se încarcă datele din rețea...
      </p>
    );

  return (
    <>
      {viewMode === 'grafic' ? (
        <div className="overview-container">

          <div className="kpi-grid">
            <TotalGnbCard value={networkData?.total_gnb} />
            <AvailabilityCard value={networkData?.avg_availability} />
            <TotalTrafficCard value={networkData?.total_traffic} />
            <AveragePowerCard value={networkData?.avg_power} />
          </div>

          <StationRealtimeGrid
            stations={networkData?.stations || []}
          />

          <TrafficPowerChart data={chartData} />

        </div>
      ) : (
        <NetworkOverviewTable
          stations={networkData?.stations || []}
        />
      )}
    </>
  );
}