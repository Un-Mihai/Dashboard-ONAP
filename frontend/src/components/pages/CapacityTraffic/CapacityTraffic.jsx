import React, { useState, useEffect } from 'react';
import CapacityKpiGrid from './components/CapacityKpiGrid/CapacityKpiGrid';
import CapacityChartsGrid from './components/CapacityChartsGrid/CapacityChartsGrid';
import CapacityTable from './components/CapacityTable/CapacityTable';
import { getNodeNames, getTelemetryData } from "../../../api";
import './CapacityTraffic.css';

export default function CapacityTraffic({ viewMode }) {
  // Stare selecție stație & granularitate grafice
  const [selectedStation, setSelectedStation] = useState('ALL');
  const [chartBucketSize, setChartBucketSize] = useState('15m');
  const [availableNodes, setAvailableNodes] = useState([]);

  // Filtrare dinamică congestie setată de utilizator
  const [enableCongestionFilter, setEnableCongestionFilter] = useState(false);
  const [congestionThreshold, setCongestionThreshold] = useState(75);

  const [stationsData, setStationsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Intervalul real din baza de date SQL
  const startTime = "2026-07-28T00:00:00+03:00";
  const endTime = "2026-07-28T23:59:59+03:00";

  const metrics = [
    "DL_Throughput",
    "PRB_DL",
    "PRB_UL",
    "Peak_PRB"
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

  useEffect(() => {
    const fetchTableData = async () => {
      setIsLoading(true);
      try {
        const nodesResponse = await getNodeNames();
        const rawNodes = nodesResponse.data;
        const nodes = Array.isArray(rawNodes) ? rawNodes : (rawNodes?.nodes || []);
        setAvailableNodes(nodes);

        const targetNodes = selectedStation === 'ALL'
          ? nodes
          : nodes.filter(n => String(n) === String(selectedStation));

        const stationPromises = targetNodes.map(async (nodeName, index) => {
          try {
            const res = await getTelemetryData(
              nodeName,
              metrics,
              "1d",
              true,
              startTime,
              endTime
            );

            const data = res.data || {};

            const prbDl = extractVal(data, "PRB_DL");
            const prbUl = extractVal(data, "PRB_UL");
            const peakPrb = extractVal(data, "Peak_PRB");
            const throughputDl = extractVal(data, "DL_Throughput");

            return {
              id: index + 1,
              node_name: nodeName,
              name: `gNB_${nodeName}`,
              prbDl: +(prbDl || 0).toFixed(2),
              prbUl: +(prbUl || 0).toFixed(2),
              peakPrb: +(peakPrb || 0).toFixed(2),
              throughputDl: +(throughputDl || 0).toFixed(2)
            };
          } catch (err) {
            console.error(`Eroare la extragerea datelor pentru stația ${nodeName}`, err);
            return null;
          }
        });

        const results = await Promise.all(stationPromises);
        const validStations = results
          .filter(st => st !== null)
          .sort((a, b) => b.prbDl - a.prbDl);

        setStationsData(validStations);
      } catch (error) {
        console.error("Eroare majoră la încărcarea tabelului:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTableData();
  }, [selectedStation]);

  // Aplicare filtru prag definit de utilizator
  const displayedStations = enableCongestionFilter
    ? stationsData.filter(st => st.prbDl >= Number(congestionThreshold || 0))
    : stationsData;

  return (
    <div className="capacity-container">
      {/* Antet Filtre: Dropdown Stație + Configurator Filtru Congestie */}
      <div className="capacity-header-controls" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '10px' }}>
        <h2 style={{ margin: 0, color: '#c9d1d9' }}>
          Capacity & Traffic Management
        </h2>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {/* Selector Stație */}
          <div className="filter-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label htmlFor="capStationSelect" style={{ color: '#8b949e', fontSize: '13px' }}>Filtrează Stație:</label>
            <select 
              id="capStationSelect"
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

          {/* Configurator Filtru Congestie Dinamic */}
          <div className="congestion-filter-box" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#161b22', padding: '6px 12px', borderRadius: '6px', border: '1px solid #30363d' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px', color: '#c9d1d9' }}>
              <input 
                type="checkbox" 
                checked={enableCongestionFilter}
                onChange={(e) => setEnableCongestionFilter(e.target.checked)}
                style={{ cursor: 'pointer' }}
              />
              Filtru Congestie PRB &ge;
            </label>
            <input 
              type="number"
              min="0"
              max="100"
              value={congestionThreshold}
              onChange={(e) => setCongestionThreshold(e.target.value)}
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
                opacity: enableCongestionFilter ? 1 : 0.5
              }}
            />
            <span style={{ fontSize: '13px', color: '#8b949e' }}>%</span>
          </div>
        </div>
      </div>

      <CapacityKpiGrid selectedStation={selectedStation} />

      {viewMode === 'grafic' ? (
        <>
          <CapacityChartsGrid 
            selectedStation={selectedStation}
            bucketSize={chartBucketSize}
            onBucketChange={(val) => setChartBucketSize(val)}
          />

          <div className="capacity-card">
            <h3>Top Stații Congestionate (Ordonat după Ocuparea PRB DL)</h3>

            {isLoading ? (
              <p style={{ color: '#8b949e', padding: '20px 0' }}>Se încarcă datele rețelei...</p>
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
          <h3>Raport Detaliat Capacitate & Traffic Radio</h3>

          {isLoading ? (
            <p style={{ color: '#8b949e', padding: '20px 0' }}>Se încarcă datele rețelei...</p>
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