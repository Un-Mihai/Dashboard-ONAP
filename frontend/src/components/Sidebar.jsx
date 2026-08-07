import React from 'react';

const Sidebar = ({ activeTab, setActiveTab, viewMode, setViewMode }) => {
  const menuItems = [
    { id: 'overview', label: '1. Network Overview' },
    { id: 'energy', label: '2. Energy & Sustainability' },
    { id: 'capacity', label: '3. Capacity & Traffic' },
    { id: 'station', label: '4. Station Details' },
    { id: 'alarms', label: '5. Alarms & Thresholds' },
  ];

  return (
    <div style={{
      width: '280px',
      height: '100vh',
      backgroundColor: '#0a0c10',
      borderRight: '1px solid #1f242d',
      padding: '20px 16px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      boxSizing: 'border-box',
      position: 'fixed',
      left: 0,
      top: 0
    }}>
      <div>
        {/* Logo ONAP Stilizat */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', paddingLeft: '8px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '900',
            fontSize: '20px',
            color: '#000',
            boxShadow: '0 0 12px rgba(79, 172, 254, 0.4)'
          }}>
            O
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: '800', color: '#fff', letterSpacing: '1px' }}>
              ONAP
            </div>
            <div style={{ fontSize: '10px', color: '#4facfe', fontWeight: '700', letterSpacing: '1.5px' }}>
              DATA DASHBOARD
            </div>
          </div>
        </div>

        {/* Navigare Meniu Lateral */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  textAlign: 'left',
                  background: isActive ? '#161b22' : 'transparent',
                  color: isActive ? '#58a6ff' : '#8b949e',
                  border: isActive ? '1px solid #30363d' : '1px solid transparent',
                  padding: '12px 14px',
                  fontSize: '13px',
                  fontWeight: isActive ? '700' : '500',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                  outline: 'none'
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Comutator Vederi: Grafic vs Tabel (Așezat în josul Sidebar-ului) */}
      <div style={{
        backgroundColor: '#161b22',
        borderRadius: '8px',
        padding: '4px',
        border: '1px solid #30363d',
        display: 'flex',
        gap: '4px'
      }}>
        <button
          onClick={() => setViewMode('grafic')}
          style={{
            flex: 1,
            padding: '8px 0',
            borderRadius: '6px',
            border: 'none',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            backgroundColor: viewMode === 'grafic' ? '#4facfe' : 'transparent',
            color: viewMode === 'grafic' ? '#000' : '#8b949e',
            transition: 'all 0.2s ease'
          }}
        >
          📊 Grafic
        </button>
        <button
          onClick={() => setViewMode('tabel')}
          style={{
            flex: 1,
            padding: '8px 0',
            borderRadius: '6px',
            border: 'none',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            backgroundColor: viewMode === 'tabel' ? '#4facfe' : 'transparent',
            color: viewMode === 'tabel' ? '#000' : '#8b949e',
            transition: 'all 0.2s ease'
          }}
        >
          📋 Tabel
        </button>
      </div>
    </div>
  );
};

export default Sidebar;