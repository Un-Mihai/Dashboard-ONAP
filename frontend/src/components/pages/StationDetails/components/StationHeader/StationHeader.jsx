import React, { useState } from 'react';
import './StationHeader.css';

export default function StationHeader({
  availableStations,
  selectedGnb,
  setSelectedGnb,
  compareGnb,
  setCompareGnb,
  isComparing,
  setIsComparing,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  bucketSize,
  setBucketSize,
  currentSt,
  handleMultiPageExport
}) {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    overview: false,
    energy: false,
    capacity: false,
    station: true
  });

  const toggleOption = (key) => {
    setExportOptions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const confirmAndExport = () => {
    setShowExportMenu(false);
    handleMultiPageExport(exportOptions);
  };

  return (
    <div className="station-card station-header">

      {/* PARTEA STÂNGĂ - Restaurată (Selectoare și Date) */}
      <div className="station-header-left">
        
        {/* Statia principala */}
        <div className="station-select-group">
          <label htmlFor="gnb-select" className="station-label">
            Stație Principală:
          </label>
          <select
            id="gnb-select"
            className="station-select"
            value={selectedGnb}
            onChange={(e) => setSelectedGnb(e.target.value)}
          >
            {availableStations.map((st) => (
              <option key={st.id} value={st.id}>
                {st.id} - {st.name}
              </option>
            ))}
          </select>
        </div>

        {/* Statia de comparatie */}
        {isComparing && (
          <div className="station-select-group">
            <label htmlFor="gnb-compare-select" className="station-label compare-label">
              Compară cu:
            </label>
            <select
              id="gnb-compare-select"
              className="station-select"
              value={compareGnb}
              onChange={(e) => setCompareGnb(e.target.value)}
            >
              {availableStations
                .filter(st => st.id !== selectedGnb)
                .map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.id} - {st.name}
                  </option>
                ))}
            </select>
          </div>
        )}

        {/* Perioada De la */}
        <div className="station-select-group">
          <label htmlFor="start-time" className="station-label">
            De la:
          </label>
          <input
            id="start-time"
            type="date"
            className="station-input"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>

        {/* Perioada Până la */}
        <div className="station-select-group">
          <label htmlFor="end-time" className="station-label">
            Până la:
          </label>
          <input
            id="end-time"
            type="date"
            className="station-input"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>
      </div>

      {/* PARTEA DREAPTĂ - Meniul nou de Export */}
      <div className="station-header-right">
        <button
          onClick={() => setIsComparing(!isComparing)}
          className={isComparing ? "station-button compare-active" : "station-button compare-button"}
        >
          {isComparing ? 'Închide Comparația' : 'Compară Stații'}
        </button>

        <div className="export-dropdown-wrapper">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="station-button export-button"
          >
            Exportă Raport ▾
          </button>

          {showExportMenu && (
            <div className="export-dropdown-menu">
              <h4>Selectează paginile:</h4>
              
              <label className="export-checkbox-label">
                <input type="checkbox" checked={exportOptions.overview} onChange={() => toggleOption('overview')} />
                Network Overview
              </label>

              <label className="export-checkbox-label">
                <input type="checkbox" checked={exportOptions.energy} onChange={() => toggleOption('energy')} />
                Energy & Sustainability
              </label>

              <label className="export-checkbox-label">
                <input type="checkbox" checked={exportOptions.capacity} onChange={() => toggleOption('capacity')} />
                Capacity & Traffic
              </label>

              <label className="export-checkbox-label">
                <input type="checkbox" checked={exportOptions.station} onChange={() => toggleOption('station')} />
                Station Details (Curent)
              </label>

              <button onClick={confirmAndExport} className="station-button confirm-export-btn">
                Generează
              </button>
            </div>
          )}
        </div>

        <div className="station-status-badges">
          <span className={`badge ${currentSt.power > 0 ? 'online' : 'down'}`}>
            {currentSt.power > 0 ? 'ONLINE' : 'OFFLINE'}
          </span>
        </div>
      </div>

    </div>
  );
}