import React from 'react';

export default function EnergySustainability({ viewMode }) {
  const cardStyle = {
    backgroundColor: '#161b22',
    border: '1px solid #30363d',
    borderRadius: '8px',
    padding: '20px',
    color: '#c9d1d9'
  };

  return (
    <div style={cardStyle}>
      <h3>Pagina de Energie & Sustenabilitate (Mod: {viewMode})</h3>
      <p style={{ color: '#8b949e' }}>Această pagină este în construcție. Aici vom adăuga graficele pentru eficiență energetică.</p>
    </div>
  );
}