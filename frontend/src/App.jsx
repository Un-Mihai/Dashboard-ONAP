import React, { useState, useEffect } from 'react';
// Importăm doar funcția specifică de care avem nevoie din noul fișier
import { getSystemStatus } from './api';

function App() {
  const [connectionStatus, setConnectionStatus] = useState("Se încarcă statusul...");
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    // Folosim funcția curată din api.js
    getSystemStatus()
      .then(response => {
        setConnectionStatus(response.data.status);
      })
      .catch(error => {
        console.error("Eroare la conexiune:", error);
        setErrorMsg("Nu s-a putut realiza conexiunea. Asigură-te că serverul backend rulează.");
      });
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '900px', margin: '0 auto' }}>
      <header style={{ borderBottom: '1px solid #ccc', paddingBottom: '10px', marginBottom: '20px' }}>
        <h1>ONAP Data Dashboard</h1>
      </header>
      
      <main>
        {/* Păstrăm layout-ul funcțional și detaliat, fără elemente inutile */}
        <div style={{ padding: '15px', border: '1px solid #ccc', borderRadius: '5px', backgroundColor: '#fafafa' }}>
          <h3>Status sistem</h3>
          {errorMsg ? (
            <p style={{ color: 'red', fontWeight: 'bold' }}>{errorMsg}</p>
          ) : (
            <p style={{ color: 'green', fontWeight: 'bold' }}>{connectionStatus}</p>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;