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

  const [selectedStation, setSelectedStation] = useState('ALL');
  const [chartBucketSize, setChartBucketSize] = useState('15m');
  const [availableNodes, setAvailableNodes] = useState([]);

  // Doar data - automat folosim toată ziua
  const [startDate, setStartDate] = useState("2026-07-28");
  const [endDate, setEndDate] = useState("2026-07-28");

  const startIso = `${startDate}T00:00:00+03:00`;
  const endIso = `${endDate}T23:59:59+03:00`;

  const metrics = [
    "RFM_Energy_Consumption",
    "RFM_Energy_Monitoring",
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

  // IMPORTANT:
  // Nu mai folosim new Date() pentru afișarea orei.
  // Luăm direct ora din bucket_time primit de la backend.
  const formatDisplayTime = (timeStr, currentBucket) => {
    if (!timeStr) return "";

    const cleanTime = timeStr.trim();

    if (currentBucket === '1d') {
      const datePart = cleanTime.substring(0, 10);

      if (datePart.length === 10) {
        const [year, month, day] = datePart.split('-');
        return `${day}/${month}`;
      }
    }

    const timePart = cleanTime.substring(11, 16);

    if (timePart.length === 5) {
      return timePart;
    }

    return cleanTime;
  };

  useEffect(() => {
    const fetchEnergyData = async () => {
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

        // ==========================================
        // DATE AGREGATE PENTRU KPI + TABEL
        // ==========================================

        const stationPromises = targetNodes.map(
          async (nodeName, index) => {
            try {
              const { data } = await getTelemetryData(
                nodeName,
                metrics,
                "1d",
                true,
                startIso,
                endIso
              );

              const power = extractVal(
                data,
                "RFM_Energy_Consumption"
              );

              const voltage = extractVal(
                data,
                "RFM_Energy_Monitoring"
              );

              const dl = extractVal(
                data,
                "DL_Traffic_Volume"
              );

              const ul = extractVal(
                data,
                "UL_Traffic_Volume"
              );

              const traffic =
                (dl + ul) / (1024 ** 3);

              const energy = power / 1000;

              const efficiency =
                energy > 0
                  ? traffic / energy
                  : 0;

              return {
                id: index + 1,
                node_name: nodeName,
                name: `gNB_${nodeName}`,

                voltage: +(voltage || 0).toFixed(2),
                power: +(power || 0).toFixed(2),
                traffic: +(traffic || 0).toFixed(4),
                efficiency: +(efficiency || 0).toFixed(4),
                energy: +(energy || 0).toFixed(4)
              };

            } catch (error) {
              console.error(
                `Eroare agregare pentru stația ${nodeName}:`,
                error
              );

              return null;
            }
          }
        );

        const validStations =
          (await Promise.all(stationPromises))
            .filter(Boolean);

        // ==========================================
        // TOTALURI
        // ==========================================

        const totals = validStations.reduce(
          (acc, station) => ({
            energy:
              acc.energy + station.energy,

            power:
              acc.power + station.power,

            voltage:
              acc.voltage + station.voltage,

            traffic:
              acc.traffic + station.traffic
          }),
          {
            energy: 0,
            power: 0,
            voltage: 0,
            traffic: 0
          }
        );

        const count = validStations.length;

        // ==========================================
        // TOP CONSUMATORI
        // ==========================================

        const topConsumersData =
          [...validStations]
            .sort(
              (a, b) =>
                b.power - a.power
            )
            .slice(0, 5)
            .map(
              ({ name, power }) => ({
                name,
                power
              })
            );

        // ==========================================
        // SERIE TEMPORALĂ
        // ==========================================

        const trendMap = {};

        const addTrendVal = (
          t,
          key,
          val
        ) => {
          if (!t) return;

          if (!trendMap[t]) {
            trendMap[t] = {
              rawTime: t,
              power: 0,
              dl: 0,
              ul: 0
            };
          }

          trendMap[t][key] +=
            Number(val) || 0;
        };

        for (const nodeName of targetNodes) {
          try {
            const { data } =
              await getTelemetryData(
                nodeName,
                [
                  "RFM_Energy_Consumption",
                  "DL_Traffic_Volume",
                  "UL_Traffic_Volume"
                ],
                chartBucketSize,
                false,
                startIso,
                endIso
              );

            const pArr =
              Array.isArray(
                data?.RFM_Energy_Consumption
              )
                ? data.RFM_Energy_Consumption
                : [];

            const dlArr =
              Array.isArray(
                data?.DL_Traffic_Volume
              )
                ? data.DL_Traffic_Volume
                : [];

            const ulArr =
              Array.isArray(
                data?.UL_Traffic_Volume
              )
                ? data.UL_Traffic_Volume
                : [];

            pArr.forEach(item => {
              const t = extractTime(item);

              const val =
                Number(
                  item.RFM_Energy_Consumption ??
                  item.value ??
                  Object.values(item)[1]
                ) || 0;

              addTrendVal(
                t,
                "power",
                val
              );
            });

            dlArr.forEach(item => {
              const t = extractTime(item);

              const val =
                Number(
                  item.DL_Traffic_Volume ??
                  item.value ??
                  0
                ) || 0;

              addTrendVal(
                t,
                "dl",
                val
              );
            });

            ulArr.forEach(item => {
              const t = extractTime(item);

              const val =
                Number(
                  item.UL_Traffic_Volume ??
                  item.value ??
                  0
                ) || 0;

              addTrendVal(
                t,
                "ul",
                val
              );
            });

          } catch (err) {
            console.warn(
              `Eroare trend stația ${nodeName}:`,
              err
            );
          }
        }

        // ==========================================
        // SORTARE FĂRĂ CONVERSIE TIMEZONE
        // ==========================================

        const efficiencyTrendData =
          Object.values(trendMap)
            .sort(
              (a, b) =>
                a.rawTime.localeCompare(
                  b.rawTime
                )
            )
            .map(item => {

              const trafficGb =
                (item.dl + item.ul) /
                (1024 ** 3);

              const energyKwh =
                item.power / 1000;

              const eficienta =
                energyKwh > 0
                  ? trafficGb / energyKwh
                  : 0;

              return {
                time: formatDisplayTime(
                  item.rawTime,
                  chartBucketSize
                ),

                eficienta:
                  +(eficienta || 0)
                    .toFixed(4),

                power:
                  +(item.power || 0)
                    .toFixed(2),

                traffic:
                  +(trafficGb || 0)
                    .toFixed(4)
              };
            });

        // ==========================================
        // SETARE DATE
        // ==========================================

        setEnergyData({
          totalEnergy:
            +totals.energy.toFixed(2),

          avgPower:
            +(
              count
                ? totals.power / count
                : 0
            ).toFixed(2),

          avgVoltage:
            +(
              count
                ? totals.voltage / count
                : 0
            ).toFixed(2),

          efficiency:
            +(
              totals.energy > 0
                ? totals.traffic /
                  totals.energy
                : 0
            ).toFixed(4),

          topConsumersData,

          efficiencyTrendData,

          stationEnergyData:
            validStations
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

  }, [
    selectedStation,
    chartBucketSize,
    startDate,
    endDate
  ]);

  if (loading && !energyData) {
    return (
      <p className="status-loading">
        Se încarcă datele energetice...
      </p>
    );
  }

  return (
    <div className="energy-page-wrapper">

      {/* ========================================
          FILTRE
      ======================================== */}

      <div className="filters-header">

        {/* STAȚIE */}

        <div className="filter-group">

          <label htmlFor="energyStationSelect">
            Filtrează Stație:
          </label>

          <select
            id="energyStationSelect"
            value={selectedStation}
            onChange={(e) =>
              setSelectedStation(
                e.target.value
              )
            }
            className="filter-select"
          >

            <option value="ALL">
              Toate Stațiile (Overview General)
            </option>

            {availableNodes.map(
              (node) => (
                <option
                  key={node}
                  value={node}
                >
                  gNB_{node}
                </option>
              )
            )}

          </select>

        </div>

        {/* DOAR DATA */}

        <div className="date-picker-group">

          <div className="filter-group">

            <label>
              De la:
            </label>

            <input
              type="date"
              value={startDate}
              onChange={(e) =>
                setStartDate(
                  e.target.value
                )
              }
              className="filter-input-date"
            />

          </div>

          <div className="filter-group">

            <label>
              Până la:
            </label>

            <input
              type="date"
              value={endDate}
              onChange={(e) =>
                setEndDate(
                  e.target.value
                )
              }
              className="filter-input-date"
            />

          </div>

        </div>

      </div>

      {/* ========================================
          CONTENT
      ======================================== */}

      {viewMode === 'grafic' ? (

        <div className="energy-container">

          <div className="energy-kpi-grid">

            <TotalEnergyCard
              value={
                energyData?.totalEnergy ?? 0
              }
            />

            <AveragePowerCard
              value={
                energyData?.avgPower ?? 0
              }
            />

            <AverageVoltageCard
              value={
                energyData?.avgVoltage ?? 0
              }
            />

            <EnergyEfficiencyCard
              value={
                energyData?.efficiency ?? 0
              }
            />

          </div>

          <TopConsumersChart
            data={
              energyData?.topConsumersData ?? []
            }
          />

          <EfficiencyTrendChart
            data={
              energyData?.efficiencyTrendData ?? []
            }
            bucketSize={chartBucketSize}
            onBucketChange={(val) =>
              setChartBucketSize(val)
            }
            selectedStation={
              selectedStation
            }
          />

        </div>

      ) : (

        <EnergySustainabilityTable
          stationEnergyData={
            energyData?.stationEnergyData ?? []
          }
        />

      )}

    </div>
  );
}