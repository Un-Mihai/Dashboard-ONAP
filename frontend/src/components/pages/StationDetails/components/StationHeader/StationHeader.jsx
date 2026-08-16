import React from 'react';
import './StationHeader.css';

export default function StationHeader({ 
  availableStations, selectedGnb, setSelectedGnb, 
  compareGnb, setCompareGnb, isComparing, setIsComparing, 
  currentSt, handleExportPDF 
}) {
  return (
    <div className="station-card station-header">
      <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="station-select-group">
          <label htmlFor="gnb-select" style={{ color: '#8b949e', fontWeight: 'bold' }}>Stație Principală:</label>
          <select 
            id="gnb-select"
            className="station-select"
            value={selectedGnb}
            onChange={(e) => setSelectedGnb(e.target.value)}
          >
            {availableStations.map((st) => (
              <option key={st.id} value={st.id}>{st.id} - {st.name}</option>
            ))}
          </select>
        </div>

        {isComparing && (
          <div className="station-select-group">
            <label htmlFor="gnb-compare-select" style={{ color: '#d29922', fontWeight: 'bold' }}>Compară cu:</label>
            <select 
              id="gnb-compare-select"
              className="station-select"
              value={compareGnb}
              onChange={(e) => setCompareGnb(e.target.value)}
            >
              {availableStations.filter(st => st.id !== selectedGnb).map((st) => (
                <option key={st.id} value={st.id}>{st.id} - {st.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button 
          onClick={() => setIsComparing(!isComparing)}
          style={{
            backgroundColor: isComparing ? '#d29922' : '#21262d',
            color: isComparing ? '#0d1117' : '#c9d1d9',
            border: '1px solid #30363d', padding: '8px 14px', borderRadius: '6px',
            cursor: 'pointer', fontWeight: 'bold', fontSize: '13px'
          }}
        >
          {isComparing ? 'Închide Comparația' : 'Compară Stații'}
        </button>

        <button 
          onClick={handleExportPDF}
          style={{
            backgroundColor: '#238636', color: 'white', border: 'none',
            padding: '8px 14px', borderRadius: '6px', cursor: 'pointer',
            fontWeight: 'bold', fontSize: '13px'
          }}
        >
          Exportă Raport PDF
        </button>

        <div className="station-status-badges">
          <span className={`badge ${currentSt.power > 0 ? 'online' : 'down'}`}>
            {currentSt.power > 0 ? 'ONLINE' : 'OFFLINE'}
          </span>
        </div>
      </div>
    </div>
  );
}