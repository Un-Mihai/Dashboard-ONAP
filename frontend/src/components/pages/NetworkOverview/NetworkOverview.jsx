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

  const [selectedStation, setSelectedStation] = useState('ALL');
  const [chartBucketSize, setChartBucketSize] = useState('15m');
  const [availableNodes, setAvailableNodes] = useState([]);

  const [selectedMetric, setSelectedMetric] = useState('total_traffic');

  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });

  const startIso = `${startDate}T00:00:00+03:00`;
  const endIso = `${endDate}T23:59:59+03:00`;

  const metricsList = [
    "Cell_Availability",
    "RFM_Energy_Consumption",
    "DL_Traffic_Volume",
    "UL_Traffic_Volume"
  ];

  const extractVal = (data, key) => {
    if (!data || data[key] === undefined || data[key] === null) {
      return 0;
    }

    const val = data[key];

    if (typeof val === 'number') {
      return val;
    }

    if (Array.isArray(val) && val.length > 0) {
      return Number(
        val[0].value ??
        val[0][key] ??
        Object.values(val[0])[0]
      ) || 0;
    }

    if (typeof val === 'object') {
      return Number(
        val.value ??
        Object.values(val)[0]
      ) || 0;
    }

    return Number(val) || 0;
  };

  const extractTime = (item) => {
    return (
      item.bucket_time ||
      item.time ||
      item.timestamp ||
      item.period_start_time ||
      ""
    );
  };

  const formatDisplayTime = (timeStr, currentBucket) => {
    if (!timeStr) return "";
    
    const cleanTime = String(timeStr).trim();

    if (currentBucket === '1d') {
      const datePart = cleanTime.split(' ')[0] || cleanTime.split('T')[0];
      if (datePart) {
        const parts = datePart.split('-');
        if (parts.length >= 3) {
          return `${parts[2]}.${parts[1]}`;
        }
      }
      return datePart.substring(0, 10);
    }

    let timePart = "";
    if (cleanTime.includes(' ')) {
      timePart = cleanTime.split(' ')[1];
    } else if (cleanTime.includes('T')) {
      timePart = cleanTime.split('T')[1];
    } else {
      timePart = cleanTime;
    }

    if (timePart) {
      return timePart.substring(0, 5);
    }

    return cleanTime;
  };

  useEffect(() => {
    const loadAllOverviewData = async () => {
      setLoading(true);

      try {
        const { data: rawNodes } = await getNodeNames();

        const nodes = Array.isArray(rawNodes)
          ? rawNodes
          : (rawNodes?.nodes || []);

        setAvailableNodes(nodes);

        const targetNodes =
          selectedStation === 'ALL'
            ? nodes
            : nodes.filter(
                n => String(n) === String(selectedStation)
              );

        let totalTraffic = 0;
        let totalPower = 0;
        let totalAvailSum = 0;

        const stations = [];
        const history = {};

        for (let i = 0; i < targetNodes.length; i++) {
          const node = targetNodes[i];

          try {
            const resAgg = await getTelemetryData(
              node,
              metricsList,
              "1d",
              true,
              startIso,
              endIso
            );

            const aggData = resAgg.data || {};

            const power = extractVal(
              aggData,
              "RFM_Energy_Consumption"
            );

            const dl = extractVal(
              aggData,
              "DL_Traffic_Volume"
            );

            const ul = extractVal(
              aggData,
              "UL_Traffic_Volume"
            );

            const availability =
              extractVal(
                aggData,
                "Cell_Availability"
              ) ||
              (power > 0 || dl > 0 ? 100 : 0);

            const dlGb = dl / (1024 ** 3);
            const ulGb = ul / (1024 ** 3);
            const traffic = dlGb + ulGb;

            totalTraffic += traffic;
            totalPower += power;
            totalAvailSum += availability;

            stations.push({
              id: i + 1,
              node_name: node,
              name: `gNB_${node}`,
              availability: +(availability || 0).toFixed(1),
              traffic: +(traffic || 0).toFixed(2),
              power: +(power || 0).toFixed(2),
              active_alarms: availability < 100 ? 1 : 0
            });

            const resSeries = await getTelemetryData(
              node,
              metricsList,
              chartBucketSize,
              false,
              startIso,
              endIso
            );

            const seriesData = resSeries.data || {};

            const powerArr =
              Array.isArray(
                seriesData?.RFM_Energy_Consumption
              )
                ? seriesData.RFM_Energy_Consumption
                : [];

            const dlArr =
              Array.isArray(
                seriesData?.DL_Traffic_Volume
              )
                ? seriesData.DL_Traffic_Volume
                : [];

            const ulArr =
              Array.isArray(
                seriesData?.UL_Traffic_Volume
              )
                ? seriesData.UL_Traffic_Volume
                : [];

            powerArr.forEach(item => {
              const t = extractTime(item);
              if (!t) return;

              if (!history[t]) {
                history[t] = {
                  rawTime: t,
                  trafic: 0,
                  dl: 0,
                  ul: 0,
                  putere: 0
                };
              }

              const val =
                Number(
                  item.RFM_Energy_Consumption ??
                  item.value ??
                  Object.values(item)[1]
                ) || 0;

              history[t].putere += val;
            });

            dlArr.forEach(item => {
              const t = extractTime(item);
              if (!t) return;

              if (!history[t]) {
                history[t] = {
                  rawTime: t,
                  trafic: 0,
                  dl: 0,
                  ul: 0,
                  putere: 0
                };
              }

              const val = Number(item.DL_Traffic_Volume ?? item.value ?? 0);
              const valGb = val / (1024 ** 3);

              history[t].dl += valGb;
              history[t].trafic += valGb;
            });

            ulArr.forEach(item => {
              const t = extractTime(item);
              if (!t) return;

              if (!history[t]) {
                history[t] = {
                  rawTime: t,
                  trafic: 0,
                  dl: 0,
                  ul: 0,
                  putere: 0
                };
              }

              const val = Number(item.UL_Traffic_Volume ?? item.value ?? 0);
              const valGb = val / (1024 ** 3);

              history[t].ul += valGb;
              history[t].trafic += valGb;
            });

          } catch (nodeErr) {
            console.error(`Eroare fetch nod ${node}:`, nodeErr);
          }
        }

        const avgAvail = stations.length
          ? +(totalAvailSum / stations.length).toFixed(1)
          : 0;

        setNetworkData({
          total_gnb: selectedStation === 'ALL' ? nodes.length : 1,
          avg_availability: avgAvail,
          total_traffic: +(totalTraffic || 0).toFixed(2),
          avg_power: stations.length ? +(totalPower / stations.length).toFixed(2) : 0,
          stations: stations
        });

        const chartPoints = Object.values(history)
          .sort((a, b) => String(a.rawTime).localeCompare(String(b.rawTime)))
          .map(item => ({
            time: formatDisplayTime(item.rawTime, chartBucketSize),
            trafic: +(item.trafic || 0).toFixed(2),
            dl: +(item.dl || 0).toFixed(2),
            ul: +(item.ul || 0).toFixed(2),
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

  }, [selectedStation, chartBucketSize, startDate, endDate]);

  if (loading && !networkData) {
    return (
      <p className="status-loading">
        Se încarcă datele din rețea...
      </p>
    );
  }

  return (
    <div className="overview-page-wrapper" style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>

      <div className="filters-header" style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>

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

        <div className="date-picker-group">
          <div className="filter-group">
            <label>De la:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="filter-input-date"
            />
          </div>

          <div className="filter-group">
            <label>Până la:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="filter-input-date"
            />
          </div>
        </div>

      </div>

      {viewMode === 'grafic' ? (

        <div className="overview-container" style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>

          <div className="kpi-grid" style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
            <TotalGnbCard value={networkData?.total_gnb} />
            <AvailabilityCard value={networkData?.avg_availability} />
            <TotalTrafficCard value={networkData?.total_traffic} />
            <AveragePowerCard value={networkData?.avg_power} />
          </div>

          <div className="filters-header" style={{ margin: '20px 0 12px 0', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ color: '#c9d1d9', fontSize: '16px', margin: 0, fontWeight: '600' }}>
              Evoluție Metrică Rețea
            </h3>
            
            <div className="filter-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0 }}>
              <label style={{ fontSize: '13px', color: '#8b949e', margin: 0 }}>
                Alege metrica:
              </label>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="filter-select"
                style={{ minWidth: '220px' }}
              >
                <option value="total_traffic">Trafic Total (DL + UL)</option>
                <option value="dl">Trafic Downlink (DL)</option>
                <option value="ul">Trafic Uplink (UL)</option>
                <option value="putere">Putere Medie (W)</option>
              </select>
            </div>
          </div>

          <TrafficPowerChart
            data={chartData}
            bucketSize={chartBucketSize}
            onBucketChange={(val) => setChartBucketSize(val)}
            selectedStation={selectedStation}
            selectedMetric={selectedMetric}
          />

        </div>

      ) : (

        <NetworkOverviewTable
          stations={networkData?.stations || []}
        />

      )}

    </div>
  );
}