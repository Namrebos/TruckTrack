import React from 'react';

const TruckSelector = ({ onSelect }) => {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>AB Autoparks</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
        <button onClick={() => onSelect('HK8643')}>HK8643</button>
        <button onClick={() => onSelect('RO3201')}>RO3201</button>
        <button onClick={() => onSelect('MU466')}>MU466</button>
      </div>
    </div>
  );
};

export default TruckSelector;
