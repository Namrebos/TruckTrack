import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { exportTruckDataToExcel } from './utils/exportToExcel';


function getMonthYearOptions() {
  return [
    ['Aprilis 2025', '04-2025'],
    ['Marts 2025', '03-2025'],
    ['Februāris 2025', '02-2025'],
    ['Janvāris 2025', '01-2025'],
    ['Decembris 2024', '12-2024'],
    ['Novembris 2024', '11-2024'],
    ['Oktobris 2024', '10-2024'],
    ['Septembris 2024', '09-2024'],
    ['Augusts 2024', '08-2024'],
    ['Jūlijs 2024', '07-2024'],
    ['Jūnijs 2024', '06-2024'],
    ['Maijs 2024', '05-2024']
  ];
}

function filterEntriesByMonth(entries, selectedMonth) {
  return entries.filter(entry => {
    const [day, month, year] = entry.date.split('/');
    return `${month}-${year}` === selectedMonth;
  });
}

function capitalizeName(name) {
  const map = {
    andris: 'Andris',
    janis: 'Jānis',
    didzis: 'Didzis'
  };
  return map[name?.toLowerCase()] || name;
}

export default function AdminDashboard() {
  const allEntries = JSON.parse(localStorage.getItem('truckEntries')) || [];
  const trucks = JSON.parse(localStorage.getItem('trucks')) || ['HK8643', 'RO3201', 'MU466'];
  const [activeTab, setActiveTab] = useState(trucks[0]);
  const [selectedMonth, setSelectedMonth] = useState(getMonthYearOptions()[0][1]);
  const [accessStatus, setAccessStatus] = useState(null);
  const navigate = useNavigate();

  const handleAdminAccess = () => {
    const entered = prompt("Ievadi admin paroli:");
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const admin = users.find(u => u.username === 'admin');
    if (admin && entered === admin.password) {
      setAccessStatus('success');
      navigate('/admin/settings');
    } else {
      setAccessStatus('error');
      alert('Nepareiza parole!');
    }
  };

  const filteredEntries = filterEntriesByMonth(
    allEntries.filter((entry) => entry.truck === activeTab),
    selectedMonth
  );

  const numericFuelEntries = filteredEntries
    .map(e => Number(e.fuel))
    .filter(val => !isNaN(val));
  const totalFuel = numericFuelEntries.reduce((sum, val) => sum + val, 0);

  const odometerValues = filteredEntries
    .map(e => Number(e.odometer))
    .filter(val => !isNaN(val));
  const totalOdometer = odometerValues.length > 1
    ? Math.max(...odometerValues) - Math.min(...odometerValues)
    : 0;
  const avgConsumption = totalOdometer > 0
    ? ((totalFuel / totalOdometer) * 100).toFixed(2)
    : '0.00';

    const handleExportToExcel = () => {
      const allEntries = JSON.parse(localStorage.getItem('truckEntries')) || [];
      exportTruckDataToExcel(activeTab, selectedMonth, allEntries);
    };
    

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', position: 'relative' }}>
      {/* Izlogoties */}
      <button
        onClick={() => {
          localStorage.removeItem('loggedInUser');
          window.location.reload();
        }}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          padding: '8px 16px',
          backgroundColor: '#f44336',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Izlogoties
      </button>

      {/* Admin poga */}
      <div style={{ position: 'absolute', top: '20px', left: '20px' }}>
        <button
          onClick={handleAdminAccess}
          style={{
            backgroundColor: 'red',
            color: 'white',
            padding: '8px 16px',
            border: 'none',
            borderRadius: '4px'
          }}
        >
          Admin
        </button>
        {accessStatus === 'success' && (
          <div style={{ color: 'green', marginTop: '0.5rem' }}>✓ Piekļuve piešķirta</div>
        )}
        {accessStatus === 'error' && (
          <div style={{ color: 'red', marginTop: '0.5rem' }}>✖ Nepareiza parole</div>
        )}
      </div>

      <h2 style={{ marginTop: '3rem' }}>Admin Panelis</h2>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {trucks.map((truck) => (
          <button
            key={truck}
            onClick={() => setActiveTab(truck)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: activeTab === truck ? '#ccc' : '#eee',
              border: '1px solid #999'
            }}
          >
            {truck}
          </button>
        ))}
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>
          Izvēlies mēnesi:{" "}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            {getMonthYearOptions().map(([label, value]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
      </div>

      <table border="1" cellPadding="6" cellSpacing="0">
        <thead>
          <tr>
            <th>Datums</th>
            <th>Odometrs</th>
            <th>Degviela</th>
            <th>Vadītājs</th>
          </tr>
        </thead>
        <tbody>
          {filteredEntries.length === 0 ? (
            <tr>
              <td colSpan="4">Dati šim mēnesim nav pieejami</td>
            </tr>
          ) : (
            filteredEntries.map((entry, index) => (
              <tr key={index}>
                <td>{entry.date}</td>
                <td>{entry.odometer}</td>
                <td>{entry.fuel}</td>
                <td>{capitalizeName(entry.driver || '-')}</td>
              </tr>
            ))
          )}
        </tbody>
        <tfoot>
          <tr>
            <td><strong>Kopā:</strong></td>
            <td><strong>{totalOdometer.toFixed(1)} km</strong></td>
            <td><strong>{totalFuel.toFixed(2)} L</strong></td>
            <td><strong>{avgConsumption} L/100km</strong></td>
          </tr>
        </tfoot>
      </table>

      <button
        onClick={handleExportToExcel}
        style={{
          marginTop: '1rem',
          backgroundColor: '#93f783',
          padding: '0.5rem 1rem'
        }}
      >
        Exportēt uz Excel
      </button>
    </div>
  );
}
