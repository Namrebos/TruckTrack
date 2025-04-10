import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const trucks = ['HK8643', 'RO3201', 'MU466'];

function getMonthYearOptions() {
  return [
    ['Aprīlis 2025', '04-2025'],
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
    ['Maijs 2024', '05-2024'],
  ];
}

function filterEntriesByMonth(entries, selectedMonth) {
  return entries.filter(entry => {
    const [day, month, year] = entry.date.split('/');
    return `${month}-${year}` === selectedMonth;
  });
}

function capitalize(str) {
  if (!str) return '-';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
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

  const totalKm = (() => {
    const odos = filteredEntries.map(e => parseFloat(e.odometer)).filter(n => !isNaN(n));
    if (odos.length < 2) return null;
    return Math.max(...odos) - Math.min(...odos);
  })();

  const totalFuel = filteredEntries
    .map(e => parseFloat(e.fuel))
    .filter(n => !isNaN(n))
    .reduce((sum, val) => sum + val, 0);

  const avgConsumption =
    totalKm && totalFuel ? (totalFuel / totalKm) * 100 : null;

  const handleExport = () => {
    const exportData = filteredEntries.map((entry) => ({
      Datums: entry.date,
      OdometraRādījums: entry.odometer,
      Degviela: entry.fuel,
      Vadītājs: capitalize(entry.driver)
    }));

    // Pievienojam kopsavilkuma rindu
    exportData.push({
      Datums: 'Kopā:',
      OdometraRādījums: totalKm !== null ? `${totalKm.toFixed(1)} km` : '-',
      Degviela: `${totalFuel.toFixed(2)} L`,
      Vadītājs: avgConsumption ? `${avgConsumption.toFixed(2)} L/100km` : '-'
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `${activeTab}_${selectedMonth}`);

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `${activeTab}_${selectedMonth}.xlsx`);
  };

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

      <h2>Admin Panelis</h2>

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
          Izvēlies mēnesi:{" "}
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
            <th>Datums</th>
            <th>Odometrs</th>
            <th>Degviela</th>
            <th>Vadītājs</th>
          </tr>
        </thead>
        <tbody>
          {filteredEntries.length === 0 ? (
            <tr>
              <td colSpan="4">Šim mēnesim nav datu</td>
            </tr>
          ) : (
            <>
              {filteredEntries.map((entry, index) => (
                <tr key={index}>
                  <td>{entry.date}</td>
                  <td>{entry.odometer}</td>
                  <td>{entry.fuel}</td>
                  <td>{capitalize(entry.driver)}</td>
                </tr>
              ))}
              <tr style={{ fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>
                <td>Kopā:</td>
                <td>{totalKm !== null ? `${totalKm.toFixed(1)} km` : '-'}</td>
                <td>{totalFuel.toFixed(2)} L</td>
                <td>{avgConsumption ? `${avgConsumption.toFixed(2)} L/100km` : '-'}</td>
              </tr>
            </>
          )}
        </tbody>
      </table>

      {filteredEntries.length > 0 && (
        <button
          onClick={handleExport}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: '#93f783',
            border: '2px solid black',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Exportēt uz Excel
        </button>
      )}
    </div>
  );
}
