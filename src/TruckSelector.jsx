// TruckSelector.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import './TruckSelector.css';

const TruckSelector = ({ onSelect }) => {
  const [trucks, setTrucks] = useState([]);

  useEffect(() => {
    const fetchTrucks = async () => {
      const { data, error } = await supabase.from('trucks').select('*');
      if (error) {
        console.error('Kļūda iegūstot kravas auto sarakstu:', error.message);
      } else {
        setTrucks(data.map(t => t.name));
      }
    };

    fetchTrucks();
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
