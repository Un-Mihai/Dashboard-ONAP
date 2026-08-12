import React from 'react';

import TotalEnergyCard from './components/TotalEnergyCard/TotalEnergyCard';
import AveragePowerCard from './components/AveragePowerCard/AveragePowerCard';
import AverageVoltageCard from './components/AverageVoltageCard/AverageVoltageCard';
import EnergyEfficiencyCard from './components/EnergyEfficiencyCard/EnergyEfficiencyCard';
import TopConsumersChart from './components/TopConsumersChart/TopConsumersChart';
import EfficiencyTrendChart from './components/EfficiencyTrendChart/EfficiencyTrendChart';
import EnergySustainabilityTable from './components/EnergySustainabilityTable/EnergySustainabilityTable';

import './EnergySustainability.css';

const topConsumersData = [
  { name: 'gNB_Iulius_Town', power: 850 },
  { name: 'gNB_Complex_Stud', power: 550 },
  { name: 'gNB_Timisoara_Centru', power: 400 },
  { name: 'gNB_Calea_Sagului', power: 380 },
  { name: 'gNB_Mehala', power: 310 },
];

const efficiencyTrendData = [
  { time: '00:00', eficienta: 1.2 },
  { time: '04:00', eficienta: 0.5 },
  { time: '08:00', eficienta: 2.1 },
  { time: '12:00', eficienta: 4.8 },
  { time: '16:00', eficienta: 5.2 },
  { time: '20:00', eficienta: 3.9 },
  { time: '24:00', eficienta: 1.8 },
];

const stationEnergyData = [
  { id: 1, name: "gNB_Iulius_Town", voltage: 48.2, power: 850, traffic: 850, efficiency: 3.5 },
  { id: 2, name: "gNB_Complex_Studentesc", voltage: 47.9, power: 550, traffic: 450, efficiency: 2.8 },
  { id: 3, name: "gNB_Timisoara_Centru", voltage: 48.5, power: 400, traffic: 120, efficiency: 0.8 },
  { id: 4, name: "gNB_Gara_de_Nord", voltage: 0.0, power: 0, traffic: 0, efficiency: 0.0 },
];

export default function EnergySustainability({ viewMode }) {
  return (
    <>
      {viewMode === 'grafic' ? (
        <div className="energy-container">
          <div className="energy-kpi-grid">
            <TotalEnergyCard />
            <AveragePowerCard />
            <AverageVoltageCard />
            <EnergyEfficiencyCard />
          </div>

          <TopConsumersChart data={topConsumersData} />
          <EfficiencyTrendChart data={efficiencyTrendData} />
        </div>
      ) : (
        <EnergySustainabilityTable stationEnergyData={stationEnergyData} />
      )}
    </>
  );
}