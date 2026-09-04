import React, { useState } from 'react';
import Sidebar from "./components/Sidebar/Sidebar";
import NetworkOverview from "./components/pages/NetworkOverview/NetworkOverview";
import EnergySustainability from "./components/pages/EnergySustainability/EnergySustainability";
import CapacityTraffic from "./components/pages/CapacityTraffic/CapacityTraffic";
import StationDetails from "./components/pages/StationDetails/StationDetails";
import ActiveAlarms from "./components/pages/ActiveAlarms/ActiveAlarms";
import Login from "./components/pages/Login/Login";
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [viewMode, setViewMode] = useState('grafic');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // --- LOGICA DE EXPORT MULTI-PAGINĂ ---
  const [isPrinting, setIsPrinting] = useState(false);
  const [printSelections, setPrintSelections] = useState({
    overview: false,
    energy: false,
    capacity: false,
    station: false
  });

  const handleMultiPageExport = (selections) => {
    setPrintSelections(selections);
    setIsPrinting(true);
    
    // Așteptăm 800ms pentru a lăsa graficele de pe celelalte pagini să se randeze în DOM, apoi printăm
    setTimeout(() => {
      window.print();
      setIsPrinting(false); // După printare, închidem modul de print
    }, 800);
  };
  // --------------------------------------

  const renderContent = () => {
    let pageComponent = null;

    switch (activeTab) {
      case 'overview':
        pageComponent = <NetworkOverview viewMode={viewMode} />;
        break;
      case 'energy':
        pageComponent = <EnergySustainability viewMode={viewMode} />;
        break;
      case 'capacity':
        pageComponent = <CapacityTraffic viewMode={viewMode} />;
        break;
      case 'station':
        // Transmitem funcția mai departe către StationDetails
        pageComponent = <StationDetails handleMultiPageExport={handleMultiPageExport} />;
        break;
      case 'alarms':
        pageComponent = <ActiveAlarms />;
        break;
      default:
        pageComponent = <NetworkOverview viewMode={viewMode} />;
    }

    return (
      <div style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
        {pageComponent}
      </div>
    );
  };

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <>
      {/* Containerul aplicației normale (ascuns în timpul printării efective) */}
      <div className={`app-layout ${isPrinting ? 'hide-on-print' : ''}`}>
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          viewMode={viewMode}
          setViewMode={setViewMode}
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
          setIsAuthenticated={setIsAuthenticated}
        />

        <div className={`main-content-wrapper ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          <div className="page-top-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="sidebar-toggle-inline-btn"
              >
                ☰
              </button>
              <h2>{activeTab.replace('-', ' ')}</h2>
            </div>

            {activeTab !== 'alarms' && activeTab !== 'station' && (
              <span className="view-mode-badge">
                Mod Vizualizare:{' '}
                <strong style={{ color: '#58a6ff' }}>{viewMode.toUpperCase()}</strong>
              </span>
            )}
          </div>

          {renderContent()}
        </div>
      </div>

      {/* Containerul ascuns pentru export (randat doar când se apasă butonul) */}
      {isPrinting && (
        <div className="print-only-container">
          {printSelections.overview && (
            <div className="print-page-break"><NetworkOverview viewMode="grafic" /></div>
          )}
          {printSelections.energy && (
            <div className="print-page-break"><EnergySustainability viewMode="grafic" /></div>
          )}
          {printSelections.capacity && (
            <div className="print-page-break"><CapacityTraffic viewMode="grafic" /></div>
          )}
          {printSelections.station && (
            <div className="print-page-break"><StationDetails /></div>
          )}
        </div>
      )}
    </>
  );
}