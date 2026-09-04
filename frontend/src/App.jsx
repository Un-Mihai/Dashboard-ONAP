import React, { useState } from 'react';
import Sidebar from "./components/Sidebar/Sidebar";
import NetworkOverview from "./components/pages/NetworkOverview/NetworkOverview";
import EnergySustainability from "./components/pages/EnergySustainability/EnergySustainability";
import CapacityTraffic from "./components/pages/CapacityTraffic/CapacityTraffic";
import StationDetails from "./components/pages/StationDetails/StationDetails";
import ActiveAlarms from "./components/pages/ActiveAlarms/ActiveAlarms";
import Login from "./components/pages/Login/Login";
import './App.css';

// Importăm starea globală (verifică să fie corectă calea către folderul context creat anterior)
import { AuthProvider, useAuth } from './context/AuthContext';

// 1. Aceasta este aplicația ta reală, care acum are acces la memorie
function DashboardContent() {
  const [activeTab, setActiveTab] = useState('overview');
  const [viewMode, setViewMode] = useState('grafic');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Scoatem userul și funcția de logout din "memoria" globală
  const { user, logout } = useAuth();

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
    
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
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

  // 2. BARIERA DE SECURITATE: Dacă nu avem un user logat, afișăm direct pagina de Login
  if (!user) {
    return <Login />;
  }

  // Dacă avem user logat (și e admin, validat în LoginForm), afișăm Dashboard-ul
  return (
    <>
      <div className={`app-layout ${isPrinting ? 'hide-on-print' : ''}`}>
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          viewMode={viewMode}
          setViewMode={setViewMode}
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
          // Am înlocuit setIsAuthenticated cu funcția reală de logout din context!
          setIsAuthenticated={logout} 
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

// 3. Componenta principală care "îmbracă" aplicația în furnizorul de context (AuthProvider)
export default function App() {
  return (
    <AuthProvider>
      <DashboardContent />
    </AuthProvider>
  );
}