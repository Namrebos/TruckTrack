import React, { useState } from 'react';
import Confirmation from './Confirmation';
import './DailyEntryForm.css';

const DailyEntryForm = ({ truck, user, onChooseAnotherTruck, onLogout }) => {
  const [odometer, setOdometer] = useState('');
  const [fuel, setFuel] = useState('');
  const [drivenKm, setDrivenKm] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Formatēts datums kā "dd/mm/yyyy"
  const now = new Date();
  const date = now.toLocaleDateString('lv-LV').replace(/\./g, '/');

  const previousEntries = JSON.parse(localStorage.getItem('truckEntries')) || [];
  const truckEntries = previousEntries.filter(entry => entry.truck === truck);
  const lastEntry = [...truckEntries].reverse().find(e => e.odometer);
  const lastOdometer = lastEntry ? Number(lastEntry.odometer) : 0;

  const handleSubmit = () => {
    if (!odometer) return alert("Ievadi odometra rādījumu!");
    if (Number(odometer) < lastOdometer) return alert("Odometra rādījums nevar būt mazāks par iepriekšējo!");

    const entry = {
      truck,
      date,
      odometer,
      fuel: fuel || '0',
      driver: user.username.toLowerCase() // saglabā tikai mazos burtos (andris, janis, didzis)
    };

    const updatedEntries = [...previousEntries, entry];
    localStorage.setItem('truckEntries', JSON.stringify(updatedEntries));

    const kmToday = Number(odometer) - lastOdometer;
    setDrivenKm(kmToday > 0 ? kmToday : 0);
    setShowConfirmation(true);
  };

  if (showConfirmation) {
    return (
      <Confirmation
        drivenKm={drivenKm}
        onChooseAnotherTruck={onChooseAnotherTruck}
        onLogout={onLogout}
      />
    );
  }

  return (
    <div className="daily-entry-container">
      <button className="back-button" onClick={onChooseAnotherTruck} aria-label="Atpakaļ">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      <h2 className="daily-entry-title">Ievadi Datus</h2>

      <div className="daily-entry-label">Datums: {date}</div>
      <div className="daily-entry-label">
        Maiņu sākot ODO: <strong>{lastOdometer} km</strong>
      </div>

      <label className="daily-entry-sub-label">Odometrs (km):</label>
      <input
        type="number"
        className="daily-entry-input"
        value={odometer}
        onChange={(e) => setOdometer(e.target.value)}
        placeholder="Piem. 126500"
      />

      <label className="daily-entry-sub-label">Uzpildītā degviela (L):</label>
      <input
        type="number"
        className="daily-entry-input"
        value={fuel}
        onChange={(e) => setFuel(e.target.value)}
        placeholder="Piem. 35.5"
      />

      <button className="confirm-button" onClick={handleSubmit}>Apstiprināt</button>
    </div>
  );
};

export default DailyEntryForm;
