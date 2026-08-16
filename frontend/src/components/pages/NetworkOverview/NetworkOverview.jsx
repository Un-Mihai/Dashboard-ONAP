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

const startTime = "2026-07-28T00:00:00+03:00";
const endTime = "2026-07-28T23:59:59+03:00";

  const metrics = [
    "RFM_Energy_Consumption",
    "RFM_Energy_Monitoring",
    "DL_Traffic_Volume",
    "UL_Traffic_Volume"
  ];

  // Extragere robustă a valorilor agregate indiferent de împachetare
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

  // Helper pentru extragerea timestamp-ului (accepta bucket_time, time, timestamp, cu T sau spatiu)
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

  // 1. Date agregate pentru stații și KPI-uri
  useEffect(() => {
    const loadNetworkData = async () => {
      try {
        const { data: rawNodes } = await getNodeNames();
        const nodes = Array.isArray(rawNodes) ? rawNodes : (rawNodes?.nodes || []);

        let totalTraffic = 0;
        let totalPower = 0;
        const stations = [];

        for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i];
          try {
            const res = await getTelemetryData(
              node,
              metrics,
              "1d",
              true,
              startTime,
              endTime
            );

            const data = res.data || {};
            const power = extractVal(data, "RFM_Energy_Consumption");
            const dl = extractVal(data, "DL_Traffic_Volume");
            const ul = extractVal(data, "UL_Traffic_Volume");

            const dlGb = dl / (1024 ** 3);
            const ulGb = ul / (1024 ** 3);
            const traffic = dlGb + ulGb;

            totalTraffic += traffic;
            totalPower += power;

            stations.push({
              id: i + 1,
              name: `gNB_${node}`,
              availability: power > 0 || traffic > 0 ? 100 : 0,
              traffic: +(traffic || 0).toFixed(2),
              power: +(power || 0).toFixed(2),
              active_alarms: power === 0 && traffic === 0 ? 1 : 0
            });
          } catch (err) {
            console.error(`Eroare fetch la statia ${node}:`, err);
          }
        }

        const avgAvail = stations.length 
          ? +(stations.reduce((acc, s) => acc + s.availability, 0) / stations.length).toFixed(1)
          : 0;

        setNetworkData({
          total_gnb: nodes.length,
          avg_availability: avgAvail,
          total_traffic: +(totalTraffic || 0).toFixed(2),
          avg_power: stations.length ? +(totalPower / stations.length).toFixed(2) : 0,
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

  // 2. Date pentru Grafic
  useEffect(() => {
    const loadChartData = async () => {
      try {
        const { data: rawNodes } = await getNodeNames();
        const nodes = Array.isArray(rawNodes) ? rawNodes : (rawNodes?.nodes || []);
        const history = {};

        for (const node of nodes) {
          try {
            const { data } = await getTelemetryData(
              node,
              ["RFM_Energy_Consumption", "DL_Traffic_Volume", "UL_Traffic_Volume"],
              "15m",
              false,
              startTime,
              endTime
            );

            const powerArr = Array.isArray(data?.RFM_Energy_Consumption) ? data.RFM_Energy_Consumption : [];
            const dlArr = Array.isArray(data?.DL_Traffic_Volume) ? data.DL_Traffic_Volume : [];
            const ulArr = Array.isArray(data?.UL_Traffic_Volume) ? data.UL_Traffic_Volume : [];

            powerArr.forEach(item => {
              const t = extractTime(item);
              if (!t) return;
              if (!history[t]) history[t] = { rawTime: t, trafic: 0, putere: 0 };
              const val = Number(item.RFM_Energy_Consumption ?? item.value ?? Object.values(item)[1]) || 0;
              history[t].putere += val;
            });

            [...dlArr, ...ulArr].forEach(item => {
              const t = extractTime(item);
              if (!t) return;
              if (!history[t]) history[t] = { rawTime: t, trafic: 0, putere: 0 };
              const val = Number(item.DL_Traffic_Volume ?? item.UL_Traffic_Volume ?? item.value ?? 0);
              history[t].trafic += val / (1024 ** 3);
            });
          } catch (nodeErr) {
            console.warn(`Nu s-au putut lua date grafic pt nodul ${node}:`, nodeErr);
          }
        }

        const result = Object.values(history)
          .sort((a, b) => new Date(a.rawTime.replace(" ", "T")) - new Date(b.rawTime.replace(" ", "T")))
          .map(item => ({
            time: formatDisplayTime(item.rawTime),
            trafic: +(item.trafic || 0).toFixed(2),
            putere: +(item.putere || 0).toFixed(2)
          }));

        setChartData(result);
      } catch (error) {
        console.error("Eroare incarcare grafic:", error);
      }
    };

    loadChartData();
  }, []);

  if (loading) return <p className="status-loading">Se încarcă datele din rețea...</p>;

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

          <StationRealtimeGrid stations={networkData?.stations || []} />
          <TrafficPowerChart data={chartData} />
        </div>
      ) : (
        <NetworkOverviewTable stations={networkData?.stations || []} />
      )}
    </>
  );
}