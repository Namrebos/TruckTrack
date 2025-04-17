import React from "react";
import "./TruckSelector.css";

const TruckSelector = ({ onSelect }) => {
  return (
    <div className="truck-selector-container">
      <h2 className="truck-selector-title">Izvēlies Auto</h2>
      <div className="truck-buttons">
        <button onClick={() => onSelect("HK8643")}>HK8643</button>
        <button onClick={() => onSelect("RO3201")}>RO3201</button>
        <button onClick={() => onSelect("MU466")}>MU466</button>
      </div>
    </div>
  );
};

export default TruckSelector;
