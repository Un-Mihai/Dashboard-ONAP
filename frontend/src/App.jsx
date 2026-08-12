import React, { useState } from 'react';
<<<<<<< HEAD
import Sidebar from "./components/Sidebar/Sidebar";
import NetworkOverview from "./components/pages/NetworkOverview/NetworkOverview";
import EnergySustainability from "./components/pages/EnergySustainability/EnergySustainability";
import CapacityTraffic from "./components/pages/CapacityTraffic/CapacityTraffic";
import StationDetails from "./components/pages/StationDetails/StationDetails";
=======

import Sidebar from './components/Sidebar/Sidebar';
import NetworkOverview from './components/pages/NetworkOverview/NetworkOverview';
import EnergySustainability from './components/pages/EnergySustainability/EnergySustainability';
import CapacityTraffic from './components/pages/CapacityTraffic/CapacityTraffic';
import StationDetails from './components/pages/StationDetails/StationDetails';
import ActiveAlarms from './components/pages/ActiveAlarms/ActiveAlarms';

>>>>>>> f6eafbae4beaf954074d4d5918904829d6f25094
function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [viewMode, setViewMode] = useState('grafic');

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <NetworkOverview viewMode={viewMode} />;
      case 'energy':
        return <EnergySustainability viewMode={viewMode} />;
      case 'capacity':
        return <CapacityTraffic viewMode={viewMode} />;
      case 'station-details':
        return <StationDetails />;
      case 'alarms':
        return <ActiveAlarms />;
      default:
        return <NetworkOverview viewMode={viewMode} />;
    }
  };

  return (
    <div style={{ backgroundColor: '#0d1117', minHeight: '100vh', color: '#c9d1d9', display: 'flex' }}>
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        viewMode={viewMode} 
        setViewMode={setViewMode} 
      />
      <div style={{ marginLeft: '280px', flex: 1, padding: '32px', maxWidth: '1400px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #21262d', paddingBottom: '12px' }}>
          <h2 style={{ color: '#f0f6fc', margin: 0, textTransform: 'uppercase' }}>
            {activeTab.replace('-', ' ')}
          </h2>
          {activeTab !== 'alarms' && activeTab !== 'station-details' && (
            <span style={{ fontSize: '12px', color: '#8b949e', backgroundColor: '#161b22', padding: '6px 12px', borderRadius: '12px', border: '1px solid #30363d' }}>
              Mod Vizualizare: <strong style={{ color: '#58a6ff' }}>{viewMode.toUpperCase()}</strong>
            </span>
          )}
        </div>
        {renderContent()}
      </div>
    </div>
  );
}

export default App;