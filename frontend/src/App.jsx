import React from 'react'

function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <header style={{ borderBottom: '1px solid #ccc', paddingBottom: '10px', marginBottom: '20px' }}>
        <h1>ONAP Data Dashboard</h1>
        <p>Monitorizare rețea și explicații detaliate ale parametrilor</p>
      </header>
      
      <main>
        {/* Aici vom aduce componentele și datele reale */}
        <div style={{ padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '5px' }}>
          <p>Se așteaptă conexiunea cu backend-ul...</p>
        </div>
      </main>
    </div>
  )
}

export default App