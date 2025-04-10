import React, { useState } from 'react';

export default function DailyEntryForm({ truck, user, onChooseAnotherTruck, onLogout }) {
  const [odometer, setOdometer] = useState('');
  const [fuel, setFuel] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [kmDriven, setKmDriven] = useState(null);

  const today = new Date().toLocaleDateString('en-GB');

  const existing = JSON.parse(localStorage.getItem('truckEntries')) || [];
  const truckEntries = existing
    .filter(entry => entry.truck === truck)
    .sort((a, b) => new Date(a.date.split('/').reverse().join('/')) - new Date(b.date.split('/').reverse().join('/')));
  const lastEntry = truckEntries[truckEntries.length - 1];
  const lastOdometer = lastEntry ? Number(lastEntry.odometer) : null;

  const handleSubmit = (e) => {
    e.preventDefault();

    const newOdometer = Number(odometer);

    if (lastOdometer !== null && newOdometer < lastOdometer) {
      setError(`❌ Šodienas odometra rādījums (${newOdometer}) nedrīkst būt mazāks par iepriekšējo (${lastOdometer})`);
      return;
    }

    const newEntry = {
      date: today,
      truck,
      odometer: newOdometer,
      fuel: fuel || 'not refueled',
      driver: user.username
    };

    const drivenToday = lastOdometer !== null ? newOdometer - lastOdometer : null;
    if (drivenToday !== null) setKmDriven(drivenToday);

    existing.push(newEntry);
    localStorage.setItem('truckEntries', JSON.stringify(existing));
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px', fontSize: '28px', fontFamily: 'sans-serif' }}>
        ✅
        {kmDriven !== null && (
          <div style={{ marginTop: '20px' }}>
            Šodien uzveikti <strong>{kmDriven} km</strong>
          </div>
        )}
        <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <button onClick={onChooseAnotherTruck} style={{ padding: '12px 24px' }}>
            Cits Auto
          </button>
          <button onClick={onLogout} style={{ padding: '12px 24px' }}>
            Izlogoties
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        maxWidth: '400px',
        margin: '100px auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        fontFamily: 'sans-serif',
      }}
    >
      {/* ZAĻĀ ATPAKAĻ POGA */}
      <button
        type="button"
        onClick={onChooseAnotherTruck}
        style={{
          backgroundColor: 'green',
          color: 'white',
          border: 'none',
          padding: '0.5rem 1rem',
          fontSize: '1.2rem',
          borderRadius: '5px',
          alignSelf: 'flex-start',
        }}
      >
        ← Atpakaļ
      </button>

      <h2 style={{ textAlign: 'center' }}>Šodienas rādījumi {truck}</h2>
      <div><strong>Datums:</strong> {today}</div>
      {lastOdometer !== null && (
        <div><strong>Maiņu sākot ODO:</strong> <strong>{lastOdometer} km</strong></div>
      )}

      <label>
        Odometers (km):
        <input
          type="number"
          value={odometer}
          onChange={(e) => setOdometer(e.target.value)}
          required
        />
      </label>

      <label>
        Uzpildītā degviela (L):
        <input
          type="number"
          value={fuel}
          onChange={(e) => setFuel(e.target.value)}
          placeholder="Leave blank if not refueled"
        />
      </label>

      {error && <div style={{ color: 'red' }}>{error}</div>}

      <button type="submit" style={{ padding: '12px', fontSize: '16px' }}>
        Apstiprināt
      </button>
    </form>
  );
}
