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

  useEffect(() => {
    const fetchTableData = async () => {
      try {
        const nodesResponse = await getNodeNames();
        const nodes = nodesResponse.data;

        const metrics = [
          "DL_Throughput",
          "PRB_DL",
          "PRB_UL",
          "Peak_PRB"
        ];

        const stationPromises = nodes.map(async (nodeName, index) => {
          try {
            const res = await getTelemetryData(
              nodeName,
              metrics,
              "1d",
              true,
              "2026-08-02T00:00:00+03:00",
              "2026-08-04T00:00:00+03:00"
            );

            const data = res.data;

            return {
              id: index + 1,
              name: `Stația ${nodeName}`,
              prbDl: data["PRB_DL"]?.value || 0,
              prbUl: data["PRB_UL"]?.value || 0,
              peakPrb: data["Peak_PRB"]?.value || 0,
              throughputDl: data["DL_Throughput"]?.value || 0
            };
          } catch (err) {
            console.error(
              `Eroare la extragerea datelor pentru stația ${nodeName}`,
              err
            );
            return null;
          }
        });

        const results = await Promise.all(stationPromises);

        const validStations = results
          .filter(st => st !== null)
          .sort((a, b) => b.prbDl - a.prbDl);

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
        <h2
          style={{
            margin: 0,
            color: '#c9d1d9'
          }}
        >
          Capacity & Traffic Management
        </h2>

        <button
          onClick={() => setShowOnlyCongested(!showOnlyCongested)}
          style={{
            backgroundColor: showOnlyCongested
              ? '#da3633'
              : '#238636',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          {showOnlyCongested
            ? 'Elimină Filtru'
            : 'Filtrează: Congestie (>75%)'}
        </button>
      </div>

      <CapacityKpiGrid />

      {viewMode === 'grafic' ? (
        <>
          <CapacityChartsGrid />

          <div className="capacity-card">
            <h3>
              Top Stații Congestionate (Ordonat după Ocuparea PRB DL)
            </h3>

            {isLoading ? (
              <p style={{ color: 'white' }}>
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
          <h3>Raport Detaliat Capacitate & Traffic Radio</h3>

          {isLoading ? (
            <p style={{ color: 'white' }}>
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