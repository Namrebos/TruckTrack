import React, { useState, useEffect } from 'react';
import { api } from './api';
import Confirmation from './Confirmation';
import './DailyEntryForm.css';

const DailyEntryForm = ({ truck, onChooseAnotherTruck, onLogout }) => {
  const [odometer, setOdometer] = useState('');
  const [fuel, setFuel] = useState('');
  const [drivenKm, setDrivenKm] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [lastOdometer, setLastOdometer] = useState(0);
  const [loading, setLoading] = useState(true);

  const date = new Date().toLocaleDateString('lv-LV');

  useEffect(() => {
    const fetchEntries = async () => {
      setLoading(true);
      try {
        const { entries } = await api.entries(truck);
        const lastEntry = entries[entries.length - 1];
        setLastOdometer(lastEntry ? Number(lastEntry.odometer) : 0);
      } catch (error) {
        console.error('❌ Neizdevās ielādēt ierakstus:', error.message);
      }
      setLoading(false);
    };

    fetchEntries();
  }, [truck]);

  const handleSubmit = async () => {
    if (!odometer) return alert("Ievadi odometra rādījumu!");
    if (Number(odometer) < lastOdometer) return alert("Odometra rādījums nevar būt mazāks par iepriekšējo!");

    const kmToday = Number(odometer) - lastOdometer;

    if (kmToday >= 400) {
      const confirmResult = window.confirm(`🚨 Ievadīts ļoti liels nobraukums (${kmToday} km). Vai esi pārliecināts?`);
      if (!confirmResult) {
        setOdometer('');
        return;
      }
    }

    const entry = {
      truck,
      date,
      odometer: parseInt(odometer, 10),
      fuel: parseInt(fuel, 10) || 0
    };

    try {
      await api.addEntry(entry);
    } catch (error) {
      console.error('❌ Ieraksta saglabāšana neizdevās:', error.message);
      alert(error.message);
      return;
    }

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

  if (loading) return <div className="daily-entry-container"><p>Notiek ielāde...</p></div>;

  return (
    <div className="daily-entry-container">
      <button className="back-button" onClick={onChooseAnotherTruck} aria-label="Atpakaļ">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>

      <h2 className="daily-entry-title">Ievadi Datus</h2>

      <div className="daily-entry-label">Datums: {date}</div>
      <div className="daily-entry-label">
        Maiņu sākot ODO: <strong>{lastOdometer} km</strong>
      </div>

      <label className="daily-entry-sub-label">Odometrs (km):</label>
      <input
        type="text"
        className="daily-entry-input"
        value={odometer}
        onChange={(e) => {
          const value = e.target.value;
          if (/^\d*$/.test(value)) {
            setOdometer(value);
          }
        }}
        placeholder="Piem. 126500"
      />

      <label className="daily-entry-sub-label">Uzpildītā degviela (L):</label>
      <input
        type="text"
        className="daily-entry-input"
        value={fuel}
        onChange={(e) => {
          const value = e.target.value;
          if (/^\d*$/.test(value)) {
            setFuel(value);
          }
        }}
        placeholder="Piem. 35"
      />

      <button className="confirm-button" onClick={handleSubmit}>Apstiprināt</button>
    </div>
  );
};

export default DailyEntryForm;
