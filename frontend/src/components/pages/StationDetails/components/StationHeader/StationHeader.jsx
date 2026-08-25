import React from 'react';
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
  handleExportPDF
}) {
  return (
    <div className="station-card station-header">

      {/* Partea stanga */}
      <div className="station-header-left">

        {/* Statia principala */}
        <div className="station-select-group">
          <label
            htmlFor="gnb-select"
            className="station-label"
          >
            Stație Principală:
          </label>

          <select
            id="gnb-select"
            className="station-select"
            value={selectedGnb}
            onChange={(e) =>
              setSelectedGnb(e.target.value)
            }
          >
            {availableStations.map((st) => (
              <option
                key={st.id}
                value={st.id}
              >
                {st.id} - {st.name}
              </option>
            ))}
          </select>
        </div>

        {/* Statia de comparatie */}
        {isComparing && (
          <div className="station-select-group">

            <label
              htmlFor="gnb-compare-select"
              className="station-label compare-label"
            >
              Compară cu:
            </label>

            <select
              id="gnb-compare-select"
              className="station-select"
              value={compareGnb}
              onChange={(e) =>
                setCompareGnb(e.target.value)
              }
            >
              {availableStations
                .filter(st => st.id !== selectedGnb)
                .map((st) => (
                  <option
                    key={st.id}
                    value={st.id}
                  >
                    {st.id} - {st.name}
                  </option>
                ))}
            </select>

          </div>
        )}

        {/* Perioada */}
        <div className="station-select-group">

          <label
            htmlFor="start-time"
            className="station-label"
          >
            De la:
          </label>

          <input
  id="start-time"
  type="date"
  className="station-input"
  value={startTime}
  onChange={(e) =>
    setStartTime(e.target.value)
  }
/>

        </div>

        <div className="station-select-group">

          <label
            htmlFor="end-time"
            className="station-label"
          >
            Până la:
          </label>

          <input
  id="end-time"
  type="date"
  className="station-input"
  value={endTime}
  onChange={(e) =>
    setEndTime(e.target.value)
  }
/>

        </div>


      </div>

      {/* Partea dreapta */}
      <div className="station-header-right">

        <button
          onClick={() =>
            setIsComparing(!isComparing)
          }
          className={
            isComparing
              ? "station-button compare-active"
              : "station-button compare-button"
          }
        >
          {isComparing
            ? 'Închide Comparația'
            : 'Compară Stații'}
        </button>

        <button
          onClick={handleExportPDF}
          className="station-button export-button"
        >
          Exportă Raport PDF
        </button>

        <div className="station-status-badges">

          <span
            className={`badge ${
              currentSt.power > 0
                ? 'online'
                : 'down'
            }`}
          >
            {currentSt.power > 0
              ? 'ONLINE'
              : 'OFFLINE'}
          </span>

        </div>

      </div>

    </div>
  );
}