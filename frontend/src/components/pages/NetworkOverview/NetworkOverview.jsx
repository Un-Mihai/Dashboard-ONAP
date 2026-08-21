import React, { useState, useEffect } from 'react';

import {
  getNodeNames,
  getTelemetryData
} from "../../../api";

import TotalGnbCard from './components/TotalGnbCard/TotalGnbCard';
import AvailabilityCard from './components/AvailabilityCard/AvailabilityCard';
import TotalTrafficCard from './components/TotalTrafficCard/TotalTrafficCard';
import AveragePowerCard from './components/AveragePowerCard/AveragePowerCard';
import TrafficPowerChart from './components/TrafficPowerChart/TrafficPowerChart';
import NetworkOverviewTable from './components/NetworkOverviewTable/NetworkOverviewTable';

import './NetworkOverview.css';

export default function NetworkOverview({ viewMode }) {
  const [networkData, setNetworkData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Stare selecție stație + granularitate grafic
  const [selectedStation, setSelectedStation] = useState('ALL');
  const [chartBucketSize, setChartBucketSize] = useState('15m');
  const [availableNodes, setAvailableNodes] = useState([]);

  const startTime = "2026-07-28T00:00:00+03:00";
  const endTime = "2026-07-28T23:59:59+03:00";

  const metricsList = [
    "RFM_Energy_Consumption",
    "DL_Traffic_Volume",
    "UL_Traffic_Volume"
  ];

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

  const extractTime = (item) => {
    return item.bucket_time || item.time || item.timestamp || item.period_start_time || "";
  };

  const formatDisplayTime = (timeStr, currentBucket) => {
    if (!timeStr) return "";

    let cleanIso = timeStr.trim().replace(" ", "T");
    if (!cleanIso.endsWith("Z") && !cleanIso.includes("+")) {
      cleanIso += "Z";
    }

    const d = new Date(cleanIso);

    if (!isNaN(d.getTime())) {
      if (currentBucket === '1d') {
        const zi = String(d.getDate()).padStart(2, '0');
        const luna = String(d.getMonth() + 1).padStart(2, '0');
        return `${zi}/${luna}`;
      }

      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    }

    return timeStr.substring(11, 16) || timeStr;
  };

  useEffect(() => {
    const loadAllOverviewData = async () => {
      setLoading(true);
      try {
        const { data: rawNodes } = await getNodeNames();
        const nodes = Array.isArray(rawNodes) ? rawNodes : (rawNodes?.nodes || []);
        setAvailableNodes(nodes);

        const targetNodes = selectedStation === 'ALL' 
          ? nodes 
          : nodes.filter(n => String(n) === String(selectedStation));

        let totalTraffic = 0;
        let totalPower = 0;
        const stations = [];
        const history = {};

        for (let i = 0; i < targetNodes.length; i++) {
          const node = targetNodes[i];
          
          try {
            // 1. Date agregate fix ("1d") pentru Carduri și Tabel
            const resAgg = await getTelemetryData(
              node,
              metricsList,
              "1d",
              true,
              startTime,
              endTime
            );

            const aggData = resAgg.data || {};
            const power = extractVal(aggData, "RFM_Energy_Consumption");
            const dl = extractVal(aggData, "DL_Traffic_Volume");
            const ul = extractVal(aggData, "UL_Traffic_Volume");

            const dlGb = dl / (1024 ** 3);
            const ulGb = ul / (1024 ** 3);
            const traffic = dlGb + ulGb;

            totalTraffic += traffic;
            totalPower += power;

            stations.push({
              id: i + 1,
              node_name: node,
              name: `gNB_${node}`,
              availability: power > 0 || traffic > 0 ? 100 : 0,
              traffic: +(traffic || 0).toFixed(2),
              power: +(power || 0).toFixed(2),
              active_alarms: power === 0 && traffic === 0 ? 1 : 0
            });

            // 2. Serie temporală pentru grafic
            const resSeries = await getTelemetryData(
              node,
              metricsList,
              chartBucketSize,
              false,
              startTime,
              endTime
            );

            const seriesData = resSeries.data || {};
            const powerArr = Array.isArray(seriesData?.RFM_Energy_Consumption) ? seriesData.RFM_Energy_Consumption : [];
            const dlArr = Array.isArray(seriesData?.DL_Traffic_Volume) ? seriesData.DL_Traffic_Volume : [];
            const ulArr = Array.isArray(seriesData?.UL_Traffic_Volume) ? seriesData.UL_Traffic_Volume : [];

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
            console.error(`Eroare fetch nod ${node}:`, nodeErr);
          }
        }

        const avgAvail = stations.length 
          ? +(stations.reduce((acc, s) => acc + s.availability, 0) / stations.length).toFixed(1)
          : 0;

        setNetworkData({
          total_gnb: selectedStation === 'ALL' ? nodes.length : 1,
          avg_availability: avgAvail,
          total_traffic: +(totalTraffic || 0).toFixed(2),
          avg_power: stations.length ? +(totalPower / stations.length).toFixed(2) : 0,
          stations: stations
        });

        const chartPoints = Object.values(history)
          .sort((a, b) => new Date(a.rawTime.replace(" ", "T")) - new Date(b.rawTime.replace(" ", "T")))
          .map(item => ({
            time: formatDisplayTime(item.rawTime, chartBucketSize),
            trafic: +(item.trafic || 0).toFixed(2),
            putere: +(item.putere || 0).toFixed(2)
          }));

        setChartData(chartPoints);

      } catch (error) {
        console.error("Eroare încărcare date Network Overview:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAllOverviewData();
  }, [selectedStation, chartBucketSize]);

  if (loading && !networkData) return <p className="status-loading">Se încarcă datele din rețea...</p>;

  return (
    <div className="overview-page-wrapper">
      {/* Selector Dropdown Stație */}
      <div className="filters-header">
        <div className="filter-group">
          <label htmlFor="stationSelect">Filtrează Stație:</label>
          <select 
            id="stationSelect"
            value={selectedStation} 
            onChange={(e) => setSelectedStation(e.target.value)}
            className="filter-select"
          >
            <option value="ALL">Toate Stațiile (Overview General)</option>
            {availableNodes.map((node) => (
              <option key={node} value={node}>
                gNB_{node}
              </option>
            ))}
          </select>
        </div>
      </div>

      {viewMode === 'grafic' ? (
        <div className="overview-container">
          <div className="kpi-grid">
            <TotalGnbCard value={networkData?.total_gnb} />
            <AvailabilityCard value={networkData?.avg_availability} />
            <TotalTrafficCard value={networkData?.total_traffic} />
            <AveragePowerCard value={networkData?.avg_power} />
          </div>

          <TrafficPowerChart 
            data={chartData} 
            bucketSize={chartBucketSize}
            onBucketChange={(val) => setChartBucketSize(val)}
            selectedStation={selectedStation}
          />
        </div>
      ) : (
        <NetworkOverviewTable stations={networkData?.stations || []} />
      )}
    </div>
  );
}