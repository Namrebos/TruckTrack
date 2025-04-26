// AdminDashboard.jsx (pilnā salabotā versija)
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { supabase } from './supabaseClient';
import './AdminDashboard.css';

export default function AdminDashboard({ onLogout }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [entries, setEntries] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [activeTab, setActiveTab] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(getMonthYearOptions()[0][1]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (!storedUser || storedUser.role !== 'admin') {
      navigate('/');
    } else {
      setUser(storedUser);
      fetchData();
    }
  }, []);

  const fetchData = async () => {
    const { data: trucksData } = await supabase.from('trucks').select('*');
    const { data: entriesData } = await supabase.from('entries').select('*');

    setTrucks(trucksData || []);
    if (trucksData && trucksData.length > 0) {
      setActiveTab(trucksData[0].name);
    }
    setEntries(entriesData || []);
  };

  const monthOptions = getMonthYearOptions();

  function getMonthYearOptions() {
    return [
      ['Aprīlis 2025', '04-2025'],
      ['Marts 2025', '03-2025'],
      ['Februāris 2025', '02-2025'],
      ['Janvāris 2025', '01-2025'],
      ['Decembris 2024', '12-2024'],
    ];
  }

  const truckEntries = entries
    .filter(entry => entry.truck === activeTab)
    .sort((a, b) => {
      const [da, ma, ya] = a.date.split('.');
      const [db, mb, yb] = b.date.split('.');
      return new Date(`${ya}-${ma}-${da}`) - new Date(`${yb}-${mb}-${db}`);
    });

  const filteredEntries = truckEntries.filter(entry => {
    const [day, month, year] = entry.date.split('.');
    return `${month}-${year}` === selectedMonth;
  });

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
      Vadītājs: entry.driver,
    }));

    exportData.push({
      Datums: 'Kopā',
      Odometrs: `${totalKm} km`,
      Degviela: `${totalFuel.toFixed(1)} L`,
      Vadītājs: `${avgConsumption} L/100km`,
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    const monthName =
      monthOptions.find(([label, value]) => value === selectedMonth)?.[0] || 'Dati';

    XLSX.utils.book_append_sheet(workbook, worksheet, monthName);
    XLSX.writeFile(workbook, `${activeTab}_${selectedMonth}.xlsx`);
  };

  const getActiveTruckColor = () => {
    return trucks.find(t => t.name === activeTab)?.color || '#eee';
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
        {trucks.map((truck) => (
          <button
            key={truck.name}
            onClick={() => setActiveTab(truck.name)}
            style={{ background: truck.color || '#ddd' }}
          >
            {truck.name}
          </button>
        ))}
      </div>

      <div className="admin-tab-content" style={{ background: getActiveTruckColor() }}>
        <div className="admin-controls">
          <label>
            Mēnesis:
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
              <tr>
                <td colSpan="4">Nav datu</td>
              </tr>
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

      <button onClick={onLogout} className="confirm-button logout">
        Iziet no admin
      </button>
    </div>
  );
}
