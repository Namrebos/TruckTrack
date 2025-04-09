import React, { useState } from 'react';

export default function DailyEntryForm({ truck, user, onChooseAnotherTruck, onLogout }) {
  const [odometer, setOdometer] = useState('');
  const [fuel, setFuel] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [kmDriven, setKmDriven] = useState(null);

  const today = new Date().toLocaleDateString('en-GB');

  const handleSubmit = (e) => {
    e.preventDefault();

    const newOdometer = Number(odometer);
    const existing = JSON.parse(localStorage.getItem('truckEntries')) || [];

    const truckEntries = existing
      .filter(entry => entry.truck === truck)
      .sort((a, b) => new Date(a.date.split('/').reverse().join('/')) - new Date(b.date.split('/').reverse().join('/')));

    const lastEntry = truckEntries[truckEntries.length - 1];
    let drivenToday = 0;

    if (lastEntry) {
      const prevOdo = Number(lastEntry.odometer);
      if (newOdometer < prevOdo) {
        setError(`❌ Today's odometer (${newOdometer}) cannot be less than previous (${prevOdo})`);
        return;
      }
      drivenToday = newOdometer - prevOdo;
      setKmDriven(drivenToday);
    }

    const newEntry = {
      date: today,
      truck,
      odometer: newOdometer,
      fuel: fuel || 'not refueled',
      driver: user.username
    };

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
            You drove <strong>{kmDriven} km</strong> today
          </div>
        )}
        <div style={{ marginTop: '40px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <button onClick={onChooseAnotherTruck} style={{ padding: '12px 24px' }}>
            Choose another truck
          </button>
          <button onClick={onLogout} style={{ padding: '12px 24px' }}>
            Exit
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

      <h2 style={{ textAlign: 'center' }}>Daily Entry for {truck}</h2>
      <div><strong>Date:</strong> {today}</div>

      <label>
        Odometer (km):
        <input
          type="number"
          value={odometer}
          onChange={(e) => setOdometer(e.target.value)}
          required
        />
      </label>

      <label>
        Fuel refilled (liters):
        <input
          type="number"
          value={fuel}
          onChange={(e) => setFuel(e.target.value)}
          placeholder="Leave blank if not refueled"
        />
      </label>

      {error && <div style={{ color: 'red' }}>{error}</div>}

      <button type="submit" style={{ padding: '12px', fontSize: '16px' }}>
        Submit
      </button>
    </form>
  );
}
