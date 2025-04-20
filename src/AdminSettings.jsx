import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminSettings.css';

export default function AdminSettings() {
  const [trucks, setTrucks] = useState([]);
  const [newTruck, setNewTruck] = useState('');
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'driver' });
  const [passwordChanges, setPasswordChanges] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const storedUsers = JSON.parse(localStorage.getItem('users')) || [];
    setUsers(storedUsers);

    const storedTrucks = JSON.parse(localStorage.getItem('trucks')) || ['HK8643', 'RO3201', 'MU466'];
    setTrucks(storedTrucks);
  }, []);

  const saveUsers = (updatedUsers) => {
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
  };

  const handleAddUser = () => {
    if (!newUser.username || !newUser.password) return alert("Aizpildi visus laukus!");
    if (users.some(u => u.username === newUser.username)) return alert("Lietotājvārds jau eksistē!");
    const updated = [...users, newUser];
    saveUsers(updated);
    setNewUser({ username: '', password: '', role: 'driver' });
  };

  const handleDeleteUser = (username) => {
    const updated = users.filter(u => u.username !== username);
    saveUsers(updated);
  };

  const handlePasswordChange = (username) => {
    const newPassword = passwordChanges[username];
    if (!newPassword) return alert("Ievadi jaunu paroli!");
    const updated = users.map(u =>
      u.username === username ? { ...u, password: newPassword } : u
    );
    saveUsers(updated);
    setPasswordChanges((prev) => ({ ...prev, [username]: '' }));
  };

  const handleAddTruck = () => {
    if (!newTruck.trim()) return;
    if (trucks.includes(newTruck)) return alert("Šāds auto jau eksistē.");
    const updated = [...trucks, newTruck];
    localStorage.setItem('trucks', JSON.stringify(updated));
    setTrucks(updated);
    setNewTruck('');
  };

  const handleDeleteTruck = (truck) => {
    if (!window.confirm(`Vai tiešām dzēst auto ${truck}?`)) return;
    const updated = trucks.filter(t => t !== truck);
    localStorage.setItem('trucks', JSON.stringify(updated));
    setTrucks(updated);
  };

  return (
    <div className="admin-settings-container">
      <button className="back-button" onClick={() => navigate('/')}>
        <span>&#8592;</span>
      </button>

      <h2 className="admin-title">Admin iestatījumi</h2>

      <div className="admin-section">
        <h3>Pārvaldīt kravas auto</h3>
        <div className="add-truck-row">
          <input
            type="text"
            className="admin-input short"
            placeholder="Piem. AB1234"
            value={newTruck}
            onChange={(e) => setNewTruck(e.target.value)}
          />
          <button className="green-btn" onClick={handleAddTruck}>Pievienot auto</button>
        </div>
        <ul className="truck-list">
          {trucks.map(truck => (
            <li key={truck} className="truck-row">
              <span>{truck}</span>
              <button className="green-btn delete-btn" onClick={() => handleDeleteTruck(truck)}>Dzēst</button>
            </li>
          ))}
        </ul>
      </div>

      <div className="admin-section">
        <h3>Lietotāju pārvaldība</h3>
        <div className="add-user-row">
          <input
            className="admin-input"
            type="text"
            placeholder="Lietotājvārds"
            value={newUser.username}
            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
          />
          <input
            className="admin-input"
            type="password"
            placeholder="Parole"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
          />
          <select
            className="admin-input"
            value={newUser.role}
            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
          >
            <option value="driver">Vadītājs</option>
            <option value="admin">Administrators</option>
          </select>
          <button className="green-btn" onClick={handleAddUser}>Pievienot lietotāju</button>
        </div>

        <ul className="user-list">
          {users.map((u) => (
            <li key={u.username} className="user-entry">
              <div><strong>{u.username}</strong> ({u.role})</div>
              <div className="user-actions">
                <input
                  className="admin-input"
                  type="password"
                  placeholder="Jauna parole"
                  value={passwordChanges[u.username] || ''}
                  onChange={(e) =>
                    setPasswordChanges({ ...passwordChanges, [u.username]: e.target.value })
                  }
                />
                <button className="green-btn" onClick={() => handlePasswordChange(u.username)}>Mainīt paroli</button>
                {u.username !== 'admin' && (
                  <button className="green-btn" onClick={() => handleDeleteUser(u.username)}>Dzēst</button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
