import React, { useEffect, useState } from 'react';
import './TruckSelector.css';

const preferredOrder = ['MU466', 'RO3201', 'HK8643'];

const TruckSelector = ({ onSelect }) => {
  const [trucks, setTrucks] = useState([]);

  useEffect(() => {
    const storedTrucks = JSON.parse(localStorage.getItem('trucks')) || ['HK8643', 'RO3201', 'MU466'];

    // Saglabā kārtošanu: MU466, RO3201, HK8643, pārējie pēc alfabēta
    const sorted = [...storedTrucks].sort((a, b) => {
      const indexA = preferredOrder.indexOf(a);
      const indexB = preferredOrder.indexOf(b);
      if (indexA === -1 && indexB === -1) return a.localeCompare(b);
      if (indexA === -1) return 1;
      if (indexB === -1) return -1;
      return indexA - indexB;
    });

    setTrucks(sorted);
  }, []);

  return (
    <div className="truck-selector-container">
      <h2 className="truck-selector-title">Izvēlies Auto</h2>
      <div className="truck-buttons">
        {trucks.map((truck) => (
          <button
            key={truck}
            className={`truck-btn ${truck.toLowerCase()}`}
            onClick={() => onSelect(truck)}
          >
            {truck}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TruckSelector;
