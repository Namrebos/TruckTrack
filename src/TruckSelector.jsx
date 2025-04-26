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
        setTrucks(data || []);
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
            key={truck.name}
            className="truck-btn"
            style={{ background: truck.color || '#cccccc', color: 'black' }}
            onClick={() => onSelect(truck.name)}
          >
            {truck.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TruckSelector;