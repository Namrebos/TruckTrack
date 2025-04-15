import React, { useState, useEffect } from 'react';

const TruckSelector = ({ onSelect }) => {
  const [trucks, setTrucks] = useState([]);

  useEffect(() => {
    const storedTrucks = JSON.parse(localStorage.getItem('trucks')) || ['HK8643', 'RO3201', 'MU466'];
    setTrucks(storedTrucks);
  }, []);

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>AB Autoparks</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '2rem' }}>
        {trucks.map((truck) => (
          <button key={truck} onClick={() => onSelect(truck)}>
            {truck}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TruckSelector;
