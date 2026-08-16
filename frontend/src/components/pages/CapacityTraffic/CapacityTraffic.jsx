import React, { useState, useEffect } from 'react';
import CapacityKpiGrid from './components/CapacityKpiGrid/CapacityKpiGrid';
import CapacityChartsGrid from './components/CapacityChartsGrid/CapacityChartsGrid';
import CapacityTable from './components/CapacityTable/CapacityTable';
import { getNodeNames, getTelemetryData } from "../../../api";
import './CapacityTraffic.css';

export default function CapacityTraffic({ viewMode }) {
  const [showOnlyCongested, setShowOnlyCongested] = useState(false);
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
      try {
        const nodesResponse = await getNodeNames();
        const rawNodes = nodesResponse.data;
        const nodes = Array.isArray(rawNodes) ? rawNodes : (rawNodes?.nodes || []);

        const stationPromises = nodes.map(async (nodeName, index) => {
          try {
            const res = await getTelemetryData(
              nodeName,
              metrics,
              "15m",
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
              name: `Stația ${nodeName}`,
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
  }, []);

  const displayedStations = showOnlyCongested
    ? stationsData.filter(st => st.prbDl > 75)
    : stationsData;

  return (
    <div className="capacity-container">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '10px'
        }}
      >
        <h2 style={{ margin: 0, color: '#c9d1d9' }}>
          Capacity & Traffic Management
        </h2>

        <button
          onClick={() => setShowOnlyCongested(!showOnlyCongested)}
          style={{
            backgroundColor: showOnlyCongested ? '#da3633' : '#238636',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          {showOnlyCongested ? 'Elimină Filtru' : 'Filtrează: Congestie (>75%)'}
        </button>
      </div>

      <CapacityKpiGrid />

      {viewMode === 'grafic' ? (
        <>
          <CapacityChartsGrid />

          <div className="capacity-card">
            <h3>Top Stații Congestionate (Ordonat după Ocuparea PRB DL)</h3>

            {isLoading ? (
              <p style={{ color: 'white' }}>Se încarcă datele rețelei...</p>
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
            <p style={{ color: 'white' }}>Se încarcă datele rețelei...</p>
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