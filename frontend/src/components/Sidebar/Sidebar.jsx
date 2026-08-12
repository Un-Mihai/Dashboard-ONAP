import React from 'react';
import './Sidebar.css';

const menuItems = [
  { id: 'overview', label: 'Network Overview', icon: '🌐' },
  { id: 'energy', label: 'Energy & Sustainability', icon: '⚡' },
  { id: 'capacity', label: 'Capacity & Traffic', icon: '📈' },
  { id: 'station', label: 'Station Details', icon: '📡' },
  { id: 'alarms', label: 'Alarms & Thresholds', icon: '🚨' },
];

export default function Sidebar({ activeTab, setActiveTab, viewMode, setViewMode }) {
  return (
    <div className="sidebar-container">
      <div>
        {/* Logo ONAP Stilizat */}
        <div className="sidebar-logo-wrapper">
          <div className="sidebar-logo-box">O</div>
          <div>
            <div className="sidebar-logo-title">ONAP</div>
            <div className="sidebar-logo-subtitle">DATA DASHBOARD</div>
          </div>
        </div>

        {/* Navigare Meniu Lateral */}
        <div className="sidebar-menu-list">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`sidebar-menu-btn ${isActive ? 'active' : ''}`}
              >
                <span className="menu-icon">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        {/* Indicator de Stare Sistem */}
        <div className="sidebar-status-box">
          <span className="status-dot"></span>
          <span>System Online • MSSQL Active</span>
        </div>

        {/* Comutator Vederi: Grafic vs Tabel */}
        <div className="view-mode-toggle">
          <button
            onClick={() => setViewMode('grafic')}
            className={`toggle-btn ${viewMode === 'grafic' ? 'active' : ''}`}
          >
            📊 Grafic
          </button>
          <button
            onClick={() => setViewMode('tabel')}
            className={`toggle-btn ${viewMode === 'tabel' ? 'active' : ''}`}
          >
            📋 Tabel
          </button>
        </div>
      </div>
    </div>
  );
}