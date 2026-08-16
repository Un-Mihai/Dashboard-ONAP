import React, { useState, useEffect } from 'react';
import axios from 'axios';

import TotalGnbCard from './components/TotalGnbCard/TotalGnbCard';
import AvailabilityCard from './components/AvailabilityCard/AvailabilityCard';
import TotalTrafficCard from './components/TotalTrafficCard/TotalTrafficCard';
import AveragePowerCard from './components/AveragePowerCard/AveragePowerCard';
import StationRealtimeGrid from './components/StationRealtimeGrid/StationRealtimeGrid';
import TrafficPowerChart from './components/TrafficPowerChart/TrafficPowerChart';
import NetworkOverviewTable from './components/NetworkOverviewTable/NetworkOverviewTable';

import './NetworkOverview.css';

const mockChartData = [
  { time: '00:00', trafic: 120, putere: 300 },
  { time: '04:00', trafic: 80, putere: 250 },
  { time: '08:00', trafic: 250, putere: 450 },
  { time: '12:00', trafic: 450, putere: 600 },
  { time: '16:00', trafic: 500, putere: 620 },
  { time: '20:00', trafic: 380, putere: 510 },
  { time: '24:00', trafic: 150, putere: 320 },
];

export default function NetworkOverview({ viewMode }) {
  const [networkData, setNetworkData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:8000/api/overview')
      .then((res) => {
        setNetworkData(res.data);
        setLoading(false);
      })
      .catch(() => {
        setNetworkData({
          total_gnb: 15,
          avg_availability: 99.5,
          total_traffic: 1420,
          avg_power: 450,
          stations: [
            { id: 1, name: "gNB_Timisoara_Centru", availability: 100, traffic: 120, power: 400, active_alarms: 0 },
            { id: 2, name: "gNB_Complex_Studentesc", availability: 99.2, traffic: 450, power: 550, active_alarms: 2 },
            { id: 3, name: "gNB_Gara_de_Nord", availability: 0, traffic: 0, power: 0, active_alarms: 5 },
            { id: 4, name: "gNB_Iulius_Town", availability: 100, traffic: 850, power: 850, active_alarms: 0 }
          ]
        });
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="status-loading">Se încarcă datele din baza de date...</p>;

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

          <StationRealtimeGrid stations={networkData?.stations} />
          <TrafficPowerChart data={mockChartData} />
        </div>
      ) : (
        <NetworkOverviewTable stations={networkData?.stations} />
      )}
    </>
  );
}