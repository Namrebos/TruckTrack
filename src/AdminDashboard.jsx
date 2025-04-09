import React, { useState } from 'react';

const trucks = ['MAN', 'RO3201', 'MU466'];

function getMonthYearOptions() {
  return [
    ['April 2025', '04-2025'],
    ['March 2025', '03-2025'],
    ['February 2025', '02-2025'],
    ['January 2025', '01-2025'],
    ['December 2024', '12-2024'],
    ['November 2024', '11-2024'],
    ['October 2024', '10-2024'],
    ['September 2024', '09-2024'],
    ['August 2024', '08-2024'],
    ['July 2024', '07-2024'],
    ['June 2024', '06-2024'],
    ['May 2024', '05-2024']
  ];
}

function filterEntriesByMonth(entries, selectedMonth) {
  return entries.filter(entry => {
    const [day, month, year] = entry.date.split('/');
    return `${month}-${year}` === selectedMonth;
  });
}

export default function AdminDashboard() {
  const allEntries = JSON.parse(localStorage.getItem('truckEntries')) || [];
  const [activeTab, setActiveTab] = useState(trucks[0]);
  const [selectedMonth, setSelectedMonth] = useState(getMonthYearOptions()[0][1]);

  const monthOptions = getMonthYearOptions();

  const filteredEntries = filterEntriesByMonth(
    allEntries.filter((entry) => entry.truck === activeTab),
    selectedMonth
  );

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', position: 'relative' }}>
      <button
        onClick={() => {
          localStorage.removeItem('loggedUser');
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

      <h2>Admin Dashboard</h2>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        {trucks.map((truck) => (
          <button
            key={truck}
            onClick={() => setActiveTab(truck)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: activeTab === truck ? '#ccc' : '#eee',
              border: '1px solid #999',
            }}
          >
            {truck}
          </button>
        ))}
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label>
          Select month:{" "}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            {monthOptions.map(([label, value]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <table border="1" cellPadding="6" cellSpacing="0">
        <thead>
          <tr>
            <th>Date</th>
            <th>Odometer</th>
            <th>Fuel</th>
            <th>Driver</th>
          </tr>
        </thead>
        <tbody>
          {filteredEntries.length === 0 ? (
            <tr>
              <td colSpan="4">No data for this month</td>
            </tr>
          ) : (
            filteredEntries.map((entry, index) => (
              <tr key={index}>
                <td>{entry.date}</td>
                <td>{entry.odometer}</td>
                <td>{entry.fuel}</td>
                <td>{entry.driver || '-'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}