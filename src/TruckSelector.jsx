import React from 'react';
import './TruckSelector.css';

const TruckSelector = ({ onSelect }) => {
  return (
    <div className="truck-selector-container">
      <h2 className="truck-selector-title">Izvēlies Auto</h2>
      <div className="truck-buttons">
        <button className="truck-btn mu466" onClick={() => onSelect('MU466')}>MU466</button>
        <button className="truck-btn ro3201" onClick={() => onSelect('RO3201')}>RO3201</button>
        <button className="truck-btn hk8643" onClick={() => onSelect('HK8643')}>HK8643</button>
      </div>
    </div>
  );
};

export default TruckSelector;
