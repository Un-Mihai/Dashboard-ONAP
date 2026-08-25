import React, { useEffect, useState } from 'react';

import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

import {
  getNodeNames,
  getTelemetryData
} from "../../../../../api";

import './CapacityChartsGrid.css';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const peakValue =
      payload.find(p => p.dataKey === 'peakPrb')?.value;

    const isPeakAlert = peakValue >= 100;

    return (
      <div
        style={{
          backgroundColor: '#161b22',
          border: `1px solid ${
            isPeakAlert ? '#da3633' : '#30363d'
          }`,
          padding: '10px',
          borderRadius: '4px'
        }}
      >
        <p
          style={{
            margin: 0,
            color: '#8b949e',
            marginBottom: '5px'
          }}
        >
          {label}
        </p>

        {payload.map((entry, index) => (
          <p
            key={index}
            style={{
              margin: 0,
              color: entry.color,
              fontSize: '13px',
              fontWeight: 'bold'
            }}
          >
            {entry.name}: {Number(entry.value).toFixed(2)}
            {entry.dataKey === 'prbDl' ||
            entry.dataKey === 'peakPrb'
              ? '%'
              : ' KB/s'}
          </p>
        ))}

        {isPeakAlert && (
          <p
            style={{
              color: '#da3633',
              margin: '5px 0 0 0',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
          >
            ALERTĂ: SATURAȚIE MAXIMĂ (100%)
          </p>
        )}
      </div>
    );
  }

  return null;
};

export default function CapacityChartsGrid({
  selectedStation = 'ALL',
  bucketSize = '15m',
  onBucketChange,

  
  startTime = "2026-07-28T00:00:00+03:00",
  endTime = "2026-07-28T23:59:59+03:00"
}) {

  const [throughputTrendData, setThroughputTrendData] =
    useState([]);

  const [prbTrendData, setPrbTrendData] =
    useState([]);


  const extractTime = (item) => {
    return (
      item?.bucket_time ||
      item?.time ||
      item?.timestamp ||
      item?.period_start_time ||
      ""
    );
  };



  const formatDisplayTime = (timeStr, currentBucket) => {
    if (!timeStr) return "";

    const cleanTime = String(timeStr)
      .trim()
      .replace(" ", "T");

   
    if (currentBucket === '1d') {
      const datePart = cleanTime.split('T')[0];

      if (datePart) {
        const parts = datePart.split('-');

        if (parts.length >= 3) {
          return `${parts[2]}/${parts[1]}`;
        }
      }

      return cleanTime.substring(0, 10);
    }

   
    const timePart = cleanTime.split('T')[1];

    if (timePart) {
      return timePart.substring(0, 5);
    }

    return cleanTime.substring(11, 16) || cleanTime;
  };


  const sortByTime = (a, b) => {
    const timeA = String(a.rawTime || '')
      .trim()
      .replace(' ', 'T');

    const timeB = String(b.rawTime || '')
      .trim()
      .replace(' ', 'T');

    return timeA.localeCompare(timeB);
  };



  useEffect(() => {

    const fetchChartData = async () => {

      try {

       

        const nodesResponse =
          await getNodeNames();

        const rawNodes =
          nodesResponse.data;

        const nodes =
          Array.isArray(rawNodes)
            ? rawNodes
            : (rawNodes?.nodes || []);

     

        const targetNodes =
          selectedStation === 'ALL'
            ? nodes
            : nodes.filter(
                n =>
                  String(n) ===
                  String(selectedStation)
              );

        

        const throughputMap = {};
        const prbMap = {};

        const getOrCreateThroughput = (time) => {

          if (!throughputMap[time]) {

            throughputMap[time] = {
              rawTime: time,
              dlMbps: 0,
              ulMbps: 0
            };

          }

          return throughputMap[time];
        };

        const getOrCreatePrb = (time) => {

          if (!prbMap[time]) {

            prbMap[time] = {
              rawTime: time,
              prbDl: 0,
              peakPrb: 0,
              count: 0
            };

          }

          return prbMap[time];
        };


        for (const node of targetNodes) {

          try {

            const response =
              await getTelemetryData(
                node,

                [
                  "DL_Throughput",
                  "UL_Throughput",
                  "PRB_DL",
                  "Peak_PRB"
                ],

                bucketSize,
                false,

                startTime,
                endTime
              );

            const data =
              response.data || {};

            
            // THROUGHPUT DL
          

            const dlData =
              Array.isArray(data["DL_Throughput"])
                ? data["DL_Throughput"]
                : [];

            dlData.forEach(item => {

              const t =
                extractTime(item);

              if (!t) return;

              const entry =
                getOrCreateThroughput(t);

              const value =
                Number(
                  item.DL_Throughput ??
                  item.value ??
                  0
                ) || 0;

              entry.dlMbps += value;
            });

            // THROUGHPUT UL
           

            const ulData =
              Array.isArray(data["UL_Throughput"])
                ? data["UL_Throughput"]
                : [];

            ulData.forEach(item => {

              const t =
                extractTime(item);

              if (!t) return;

              const entry =
                getOrCreateThroughput(t);

              const value =
                Number(
                  item.UL_Throughput ??
                  item.value ??
                  0
                ) || 0;

              entry.ulMbps += value;
            });

            // =============================================
            // PRB DL
            // =============================================

            const prbDlData =
              Array.isArray(data["PRB_DL"])
                ? data["PRB_DL"]
                : [];

            prbDlData.forEach(item => {

              const t =
                extractTime(item);

              if (!t) return;

              const entry =
                getOrCreatePrb(t);

              const value =
                Number(
                  item.PRB_DL ??
                  item.value ??
                  0
                ) || 0;

              entry.prbDl += value;
              entry.count += 1;
            });

            // =============================================
            // PEAK PRB
            // =============================================

            const peakPrbData =
              Array.isArray(data["Peak_PRB"])
                ? data["Peak_PRB"]
                : [];

            peakPrbData.forEach(item => {

              const t =
                extractTime(item);

              if (!t) return;

              const entry =
                getOrCreatePrb(t);

              const value =
                Number(
                  item.Peak_PRB ??
                  item.value ??
                  0
                ) || 0;

              if (value > entry.peakPrb) {
                entry.peakPrb = value;
              }

            });

          } catch (error) {

            console.error(
              `Eroare la încărcarea datelor pentru stația ${node}:`,
              error
            );

          }

        }

        // =================================================
        // GRAFIC THROUGHPUT
        // =================================================

        const formattedThroughputData =
          Object.values(throughputMap)
            .sort(sortByTime)
            .map(item => ({

              time:
                formatDisplayTime(
                  item.rawTime,
                  bucketSize
                ),

              dlMbps:
                +(item.dlMbps || 0)
                  .toFixed(2),

              ulMbps:
                +(item.ulMbps || 0)
                  .toFixed(2)

            }));

        setThroughputTrendData(
          formattedThroughputData
        );

        // =================================================
        // GRAFIC PRB
        // =================================================

        const formattedPrbData =
          Object.values(prbMap)
            .sort(sortByTime)
            .map(item => ({

              time:
                formatDisplayTime(
                  item.rawTime,
                  bucketSize
                ),

              prbDl:
                +(
                  item.count
                    ? item.prbDl / item.count
                    : item.prbDl || 0
                ).toFixed(2),

              peakPrb:
                +(item.peakPrb || 0)
                  .toFixed(2)

            }));

        setPrbTrendData(
          formattedPrbData
        );

      } catch (error) {

        console.error(
          "Eroare la încărcarea graficelor de capacitate:",
          error
        );

      }

    };

    fetchChartData();

  }, [
    selectedStation,
    bucketSize,
    startTime,
    endTime
  ]);

  // =====================================================
  // RENDER
  // =====================================================

  return (

    <div className="capacity-charts-grid">

      {/* =================================================
          GRAFIC THROUGHPUT
      ================================================= */}

      <div className="capacity-card">

        <div
          className="chart-header-row"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '15px'
          }}
        >

          <h3 style={{ margin: 0 }}>
            Evoluție Throughput DL vs. UL (KB/s)
          </h3>

          {onBucketChange && (

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >

              <label
                style={{
                  fontSize: '13px',
                  color: '#8b949e'
                }}
              >
                Granularitate:
              </label>

              <select
                value={bucketSize}
                onChange={(e) =>
                  onBucketChange(
                    e.target.value
                  )
                }
                className="filter-select"
              >

                <option value="15m">
                  15m
                </option>

                <option value="1h">
                  1h
                </option>

                <option value="1d">
                  1d
                </option>

              </select>

            </div>

          )}

        </div>

        <div className="chart-box-280">

          <ResponsiveContainer
            width="100%"
            height="100%"
          >

            <LineChart
              data={throughputTrendData}
            >

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#30363d"
              />

              <XAxis
                dataKey="time"
                stroke="#8b949e"
              />

              <YAxis
                stroke="#8b949e"
                unit=" KB/s"
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: '#161b22',
                  border: '1px solid #30363d'
                }}
              />

              <Legend />

              <Line
                type="monotone"
                dataKey="dlMbps"
                name="Throughput DL (KB/s)"
                stroke="#58a6ff"
                strokeWidth={2}
                dot={{ r: 3 }}
              />

              <Line
                type="monotone"
                dataKey="ulMbps"
                name="Throughput UL (KB/s)"
                stroke="#3fb950"
                strokeWidth={2}
                dot={{ r: 3 }}
              />

            </LineChart>

          </ResponsiveContainer>

        </div>

      </div>

      {/* =================================================
          GRAFIC PRB
      ================================================= */}

      <div className="capacity-card">

        <div
          className="chart-header-row"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '15px'
          }}
        >

          <h3 style={{ margin: 0 }}>
            Grad de Ocupare Resurse
            (PRB DL % vs Peak)
          </h3>

          {onBucketChange && (

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >

              <label
                style={{
                  fontSize: '13px',
                  color: '#8b949e'
                }}
              >
                Granularitate:
              </label>

              <select
                value={bucketSize}
                onChange={(e) =>
                  onBucketChange(
                    e.target.value
                  )
                }
                className="filter-select"
              >

                <option value="15m">
                  15m
                </option>

                <option value="1h">
                  1h
                </option>

                <option value="1d">
                  1d
                </option>

              </select>

            </div>

          )}

        </div>

        <div className="chart-box-280">

          <ResponsiveContainer
            width="100%"
            height="100%"
          >

            <AreaChart
              data={prbTrendData}
            >

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#30363d"
              />

              <XAxis
                dataKey="time"
                stroke="#8b949e"
              />

              <YAxis
                stroke="#8b949e"
                domain={[0, 100]}
                unit="%"
              />

              <Tooltip
                content={
                  <CustomTooltip />
                }
              />

              <Legend />

              <Area
                type="monotone"
                dataKey="peakPrb"
                name="Peak PRB Slot Max %"
                stroke="#f85149"
                fill="#f8514922"
              />

              <Area
                type="monotone"
                dataKey="prbDl"
                name="PRB DL Mediu %"
                stroke="#d29922"
                fill="#d2992222"
              />

            </AreaChart>

          </ResponsiveContainer>

        </div>

      </div>

    </div>
  );
}