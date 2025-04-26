import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Confirmation from './Confirmation';
import './DailyEntryForm.css';

const DailyEntryForm = ({ truck, user, onChooseAnotherTruck, onLogout }) => {
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
      const { data, error } = await supabase
        .from('entries')
        .select('*')
        .eq('truck', truck)
        .order('date', { ascending: true });

      if (error) {
        console.error('❌ Neizdevās ielādēt ierakstus no Supabase:', error.message);
      } else {
        const lastEntry = data[data.length - 1];
        setLastOdometer(lastEntry ? Number(lastEntry.odometer) : 0);
      }
      setLoading(false);
    };

    fetchEntries();
  }, [truck]);

  const handleSubmit = async () => {
    if (!odometer) return alert("Ievadi odometra rādījumu!");
    if (Number(odometer) < lastOdometer) return alert("Odometra rādījums nevar būt mazāks par iepriekšējo!");

    const entry = {
      truck,
      user: user.username,
      driver: capitalize(user.username),
      date,
      odometer,
      fuel: fuel || '0'
    };

    const { error } = await supabase.from('entries').insert([entry]);

    if (error) {
      console.error('❌ Ieraksta saglabāšana neizdevās:', error.message);
      alert('Neizdevās saglabāt datus. Mēģini vēlreiz!');
      return;
    }

    const kmToday = Number(odometer) - lastOdometer;
    setDrivenKm(kmToday > 0 ? kmToday : 0);
    setShowConfirmation(true);
  };

  const capitalize = (name) => {
    const mapping = {
      andris: 'Andris',
      janis: 'Jānis',
      didzis: 'Didzis'
    };
    return mapping[name.toLowerCase()] || name;
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
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('fuelInput')?.focus();
          }
        }}
      />

      <label className="daily-entry-sub-label">Uzpildītā degviela (L):</label>
      <input
        type="number"
        id="fuelInput"
        className="daily-entry-input"
        value={fuel}
        onChange={(e) => setFuel(e.target.value)}
        placeholder="Piem. 35.5"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleSubmit();
          }
        }}
      />

      <button className="confirm-button" onClick={handleSubmit}>Apstiprināt</button>
    </div>
  );
};

export default DailyEntryForm;
