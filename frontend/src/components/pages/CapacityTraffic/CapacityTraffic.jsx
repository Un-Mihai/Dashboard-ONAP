import React, { useState, useEffect } from 'react';

import CapacityKpiGrid from './components/CapacityKpiGrid/CapacityKpiGrid';
import CapacityChartsGrid from './components/CapacityChartsGrid/CapacityChartsGrid';
import CapacityTable from './components/CapacityTable/CapacityTable';

import {
  getNodeNames,
  getTelemetryData
} from "../../../api";

import './CapacityTraffic.css';

export default function CapacityTraffic({ viewMode }) {

  const [selectedStation, setSelectedStation] = useState('ALL');
  const [chartBucketSize, setChartBucketSize] = useState('15m');
  const [availableNodes, setAvailableNodes] = useState([]);

  // Stare nouă pentru dropdown-ul de metrici de pe pagina Capacity & Traffic
  const [selectedMetric, setSelectedMetric] = useState('throughput');

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

  const [enableCongestionFilter, setEnableCongestionFilter] = useState(false);
  const [congestionThreshold, setCongestionThreshold] = useState(75);

  const [stationsData, setStationsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const metrics = [
    "DL_Throughput",
    "UL_Throughput",
    "PRB_DL",
    "PRB_UL",
    "Peak_PRB"
  ];

  const extractVal = (data, key) => {
    if (
      !data ||
      data[key] === undefined ||
      data[key] === null
    ) {
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

  useEffect(() => {

    const fetchTableData = async () => {

      setIsLoading(true);

      try {
        const nodesResponse = await getNodeNames();

        const rawNodes = nodesResponse.data;

        const nodes = Array.isArray(rawNodes)
          ? rawNodes
          : (rawNodes?.nodes || []);

        setAvailableNodes(nodes);

        const targetNodes =
          selectedStation === 'ALL'
            ? nodes
            : nodes.filter(
                n =>
                  String(n) ===
                  String(selectedStation)
              );

        const stationPromises = targetNodes.map(
          async (nodeName, index) => {

            try {

              const res = await getTelemetryData(
                nodeName,
                metrics,
                "1d",
                true,
                startIso,
                endIso
              );

              const data = res.data || {};

              const prbDl =
                extractVal(data, "PRB_DL");

              const prbUl =
                extractVal(data, "PRB_UL");

              const peakPrb =
                extractVal(data, "Peak_PRB");

              const throughputDl =
                extractVal(data, "DL_Throughput");

              return {
                id: index + 1,
                node_name: nodeName,
                name: `gNB_${nodeName}`,

                prbDl:
                  +(prbDl || 0).toFixed(2),

                prbUl:
                  +(prbUl || 0).toFixed(2),

                peakPrb:
                  +(peakPrb || 0).toFixed(2),

                throughputDl:
                  +(throughputDl || 0).toFixed(2)
              };

            } catch (err) {

              console.error(
                `Eroare la extragerea datelor pentru stația ${nodeName}`,
                err
              );

              return null;
            }
          }
        );

        const results =
          await Promise.all(stationPromises);

        const validStations =
          results
            .filter(st => st !== null)
            .sort(
              (a, b) =>
                b.prbDl - a.prbDl
            );

        setStationsData(validStations);

      } catch (error) {

        console.error(
          "Eroare majoră la încărcarea tabelului:",
          error
        );

      } finally {

        setIsLoading(false);

      }
    };

    fetchTableData();

  }, [
    selectedStation,
    startDate,
    endDate
  ]);

  const displayedStations =
    enableCongestionFilter
      ? stationsData.filter(
          st =>
            st.prbDl >=
            Number(congestionThreshold || 0)
        )
      : stationsData;

  return (
    <div className="capacity-container">

      <div className="filters-header">

        <div className="filter-group">
          <label htmlFor="capStationSelect">
            Filtrează Stație:
          </label>

          <select
            id="capStationSelect"
            value={selectedStation}
            onChange={(e) =>
              setSelectedStation(e.target.value)
            }
            className="filter-select"
          >
            <option value="ALL">
              Toate Stațiile (Overview General)
            </option>

            {availableNodes.map((node) => (
              <option
                key={node}
                value={node}
              >
                gNB_{node}
              </option>
            ))}

          </select>

        </div>

        <div className="date-picker-group">

          <div className="filter-group">
            <label>
              De la:
            </label>

            <input
              type="date"
              value={startDate}
              onChange={(e) =>
                setStartDate(e.target.value)
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
                setEndDate(e.target.value)
              }
              className="filter-input-date"
            />
          </div>

        </div>

        <div className="congestion-filter-box">
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              fontSize: '13px',
              color: '#c9d1d9'
            }}
          >
            <input
              type="checkbox"
              checked={enableCongestionFilter}
              onChange={(e) =>
                setEnableCongestionFilter(
                  e.target.checked
                )
              }
              style={{
                cursor: 'pointer'
              }}
            />
            Filtru Congestie PRB &ge;
          </label>

          <input
            type="number"
            min="0"
            max="100"
            value={congestionThreshold}
            onChange={(e) =>
              setCongestionThreshold(
                e.target.value
              )
            }
            disabled={!enableCongestionFilter}
            style={{
              width: '55px',
              background: '#0d1117',
              border: '1px solid #30363d',
              color: '#c9d1d9',
              borderRadius: '4px',
              padding: '3px 6px',
              textAlign: 'center',
              fontSize: '13px',
              opacity:
                enableCongestionFilter
                  ? 1
                  : 0.5
            }}
          />

          <span
            style={{
              fontSize: '13px',
              color: '#8b949e'
            }}
          >
            %
          </span>

        </div>

      </div>

      <CapacityKpiGrid
        selectedStation={selectedStation}
        startTime={startIso}
        endTime={endIso}
      />

      {viewMode === 'grafic' ? (

        <>
          {/* Bara cu titlul și dropdown-ul pentru metricele de capacitate */}
          <div className="filters-header" style={{ margin: '20px 0 12px 0', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ color: '#c9d1d9', fontSize: '16px', margin: 0, fontWeight: '600' }}>
              Evoluție Metrică Capacitate & Trafic
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
                <option value="throughput">Throughput Rețea (DL & UL)</option>
                <option value="prb">Grad Ocupare PRB (DL & UL)</option>
                <option value="peak_prb">Peak PRB Maxim (%)</option>
              </select>
            </div>
          </div>

          <CapacityChartsGrid
            selectedStation={selectedStation}
            bucketSize={chartBucketSize}
            onBucketChange={(val) =>
              setChartBucketSize(val)
            }
            startTime={startIso}
            endTime={endIso}
            selectedMetric={selectedMetric}
          />

          <div className="capacity-card">
            <h3>
              Top Stații Congestionate
              (Ordonat după Ocuparea PRB DL)
            </h3>

            {isLoading ? (
              <p
                style={{
                  color: '#8b949e',
                  padding: '20px 0'
                }}
              >
                Se încarcă datele rețelei...
              </p>
            ) : (
              <CapacityTable
                stations={displayedStations}
                viewMode={viewMode}
              />
            )}

          </div>

        </>

      ) : (

        <div className="capacity-card">
          <h3>
            Raport Detaliat Capacitate & Traffic Radio
          </h3>

          {isLoading ? (
            <p
              style={{
                color: '#8b949e',
                padding: '20px 0'
              }}
            >
              Se încarcă datele rețelei...
            </p>
          ) : (
            <CapacityTable
              stations={displayedStations}
              viewMode={viewMode}
            />
          )}

        </div>

      )}

    </div>
  );
}