import React, { useState } from 'react';
import StationHeader from './components/StationHeader/StationHeader';
import StationPanelsGrid from './components/StationPanelsGrid/StationPanelsGrid';
import StationChartsGrid from './components/StationChartsGrid/StationChartsGrid';
import './StationDetails.css';

const availableStations = [
  { id: 'gNB-1024', name: 'gNB_Timisoara_Centru', power: 350, voltage: 48.2, kwh: 0.087, eff: 166.6, dlGb: 12.4, ulGb: 2.1, dlMbps: 110, ulMbps: 18, prb: 85, peakPrb: 98 },
  { id: 'gNB-1025', name: 'gNB_Complex_Studentesc', power: 550, voltage: 47.9, kwh: 0.120, eff: 120.0, dlGb: 18.2, ulGb: 3.5, dlMbps: 140, ulMbps: 22, prb: 82, peakPrb: 96 },
  { id: 'gNB-1026', name: 'gNB_Iulius_Town', power: 850, voltage: 48.2, kwh: 0.210, eff: 95.0, dlGb: 25.0, ulGb: 5.2, dlMbps: 165, ulMbps: 32, prb: 88, peakPrb: 100 },
  { id: 'gNB-1027', name: 'gNB_Gara_de_Nord', power: 0, voltage: 0, kwh: 0, eff: 0, dlGb: 0, ulGb: 0, dlMbps: 0, ulMbps: 0, prb: 0, peakPrb: 0 },
];

const stationHistoryData = [
  { time: '12:00', prb: 45, prbPeak: 70, power: 340 },
  { time: '12:15', prb: 52, prbPeak: 80, power: 355 },
  { time: '12:30', prb: 68, prbPeak: 92, power: 390 },
  { time: '12:45', prb: 85, prbPeak: 98, power: 420 },
  { time: '13:00', prb: 60, prbPeak: 85, power: 370 },
  { time: '13:15', prb: 40, prbPeak: 65, power: 330 },
];

export default function StationDetails() {
  const [selectedGnb, setSelectedGnb] = useState('gNB-1024');
  const [compareGnb, setCompareGnb] = useState('gNB-1026');
  const [isComparing, setIsComparing] = useState(false);

  const currentSt = availableStations.find(st => st.id === selectedGnb) || availableStations[0];
  const compareSt = availableStations.find(st => st.id === compareGnb) || availableStations[2];

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="station-details-container">
      <StationHeader 
        availableStations={availableStations}
        selectedGnb={selectedGnb}
        setSelectedGnb={setSelectedGnb}
        compareGnb={compareGnb}
        setCompareGnb={setCompareGnb}
        isComparing={isComparing}
        setIsComparing={setIsComparing}
        currentSt={currentSt}
        handleExportPDF={handleExportPDF}
      />

      <StationPanelsGrid 
        currentSt={currentSt}
        compareSt={compareSt}
        isComparing={isComparing}
      />

      <StationChartsGrid 
        data={stationHistoryData}
      />
    </div>
  );
}