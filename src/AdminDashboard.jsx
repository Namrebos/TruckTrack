import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import './AdminDashboard.css';

const trucks = ['MU466', 'RO3201', 'HK8643'];

const tabColors = {
  HK8643: '#f75e05',
  RO3201: 'linear-gradient(120deg, white 33%, red 33%, red 66%, black 66%)',
  MU466: '#cfb71d'
};

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
    ['Maijs 2024', '05-2024']
  ];
}

function filterEntriesByMonth(entries, selectedMonth) {
  return entries.filter(entry => {
    const [day, month, year] = entry.date.split('.');
    return `${month}-${year}` === selectedMonth;
  });
}

export default function AdminDashboard({ onLogout }) {
  const allEntries = JSON.parse(localStorage.getItem('truckEntries')) || [];
  const [activeTab, setActiveTab] = useState(trucks[0]);
  const [selectedMonth, setSelectedMonth] = useState(getMonthYearOptions()[0][1]);
  const monthOptions = getMonthYearOptions();
  const navigate = useNavigate();

  const truckEntries = allEntries
    .filter(entry => entry.truck === activeTab)
    .sort((a, b) => {
      const [d1, m1, y1] = a.date.split('.').map(Number);
      const [d2, m2, y2] = b.date.split('.').map(Number);
      return new Date(y1, m1 - 1, d1) - new Date(y2, m2 - 1, d2);
    });

  const filteredEntries = filterEntriesByMonth(truckEntries, selectedMonth);

  const totalKm = filteredEntries.reduce((sum, entry, index, arr) => {
    if (index === 0) return 0;
    const prev = parseFloat(arr[index - 1].odometer) || 0;
    const curr = parseFloat(entry.odometer) || 0;
    const diff = curr - prev;
    return sum + (diff > 0 ? diff : 0);
  }, 0);

  const totalFuel = filteredEntries.reduce(
    (sum, entry) => sum + (parseFloat(entry.fuel) || 0),
    0
  );

  const avgConsumption = totalKm > 0 ? ((totalFuel / totalKm) * 100).toFixed(2) : '—';

  const handleExport = () => {
    if (filteredEntries.length === 0) return alert('Nav datu ko eksportēt!');

    const exportData = filteredEntries.map(entry => ({
      Datums: entry.date,
      Odometrs: entry.odometer,
      Degviela: entry.fuel,
      Vadītājs: entry.driver
    }));

    exportData.push({
      Datums: 'Kopā',
      Odometrs: `${totalKm} km`,
      Degviela: `${totalFuel.toFixed(1)} L`,
      Vadītājs: `${avgConsumption} L/100km`
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    const monthName = monthOptions.find(([label, value]) => value === selectedMonth)?.[0] || 'Dati';

    XLSX.utils.book_append_sheet(workbook, worksheet, monthName);
    XLSX.writeFile(workbook, `${activeTab}_${selectedMonth}.xlsx`);
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <button className="admin-settings-btn" onClick={() => navigate('/admin/settings')}>
          ☰
        </button>
        <h2 className="admin-title">Admin Panelis</h2>
      </div>

      <div className="admin-tabs">
        {trucks.map(truck => (
          <button key={truck} onClick={() => setActiveTab(truck)}>
            {truck}
          </button>
        ))}
      </div>

      <div
        className="admin-tab-content"
        style={{ background: tabColors[activeTab] || 'rgba(0,0,0,0.05)' }}
      >
        <div className="admin-controls">
          <label>
            Mēnesis:
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
              {monthOptions.map(([label, value]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>

          <button onClick={handleExport} className="confirm-button">
            Exportēt uz Excel
          </button>
        </div>

        <table className="admin-table">
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
              <tr><td colSpan="4">Nav datu</td></tr>
            ) : (
              filteredEntries.map((entry, i) => (
                <tr key={i}>
                  <td>{entry.date}</td>
                  <td>{entry.odometer}</td>
                  <td>{entry.fuel}</td>
                  <td>{entry.driver}</td>
                </tr>
              ))
            )}
            {filteredEntries.length > 0 && (
              <tr className="admin-summary-row">
                <td>Kopā</td>
                <td>{totalKm} km</td>
                <td>{totalFuel.toFixed(1)} L</td>
                <td>{avgConsumption} L/100km</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <button onClick={onLogout} className="confirm-button logout" style={{ marginTop: '2rem' }}>
        Iziet no admin
      </button>
    </div>
  );
}
