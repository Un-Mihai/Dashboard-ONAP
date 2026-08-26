import React, { useState } from 'react';
import Sidebar from "./components/Sidebar/Sidebar";
import NetworkOverview from "./components/pages/NetworkOverview/NetworkOverview";
import EnergySustainability from "./components/pages/EnergySustainability/EnergySustainability";
import CapacityTraffic from "./components/pages/CapacityTraffic/CapacityTraffic";
import StationDetails from "./components/pages/StationDetails/StationDetails";
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [viewMode, setViewMode] = useState('grafic');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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
        pageComponent = <StationDetails />;
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

  return (
    <div className="app-layout">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        viewMode={viewMode}
        setViewMode={setViewMode}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      <div className={`main-content-wrapper ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="page-top-header">
          <h2>
            {activeTab.replace('-', ' ')}
          </h2>

          {activeTab !== 'alarms' && activeTab !== 'station' && (
            <span className="view-mode-badge">
              Mod Vizualizare:{' '}
              <strong style={{ color: '#58a6ff' }}>
                {viewMode.toUpperCase()}
              </strong>
            </span>
          )}
        </div>

        {renderContent()}
      </div>
    </div>
  );
}