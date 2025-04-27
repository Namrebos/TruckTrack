import React from 'react';
import './Confirmation.css';

export default function Confirmation({ drivenKm, onChooseAnotherTruck, onLogout }) {
  return (
    <div className="confirmation-container">
      <h2 className="confirmation-title">Dati saglabāti!</h2>
      <p className="confirmation-text">Šodien nobraukti: <strong>{drivenKm} km</strong></p>

      <div className="confirmation-buttons">
        <button className="confirm-button secondary" onClick={onChooseAnotherTruck}>
          Izvēlēties citu auto
        </button>
        <button className="confirm-button logout" onClick={onLogout}>
          Iziet
        </button>
      </div>
    </div>
  );
}
