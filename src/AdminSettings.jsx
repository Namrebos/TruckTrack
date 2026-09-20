import React, { useState, useEffect } from 'react';
import { api } from './api';
import { useNavigate } from 'react-router-dom';
import './AdminSettings.css';

function AdminSettings() {
  const [trucks, setTrucks] = useState([]);
  const [newTruck, setNewTruck] = useState('');
  const [truckColor, setTruckColor] = useState('#cccccc');
  const [users, setUsers] = useState([]);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('driver');
  const [passwordDrafts, setPasswordDrafts] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([fetchTrucks(), fetchUsers()]).catch(() => navigate('/'));
  }, []);

  const fetchTrucks = async () => {
    const { trucks: rows } = await api.trucks();
    setTrucks(rows || []);
  };

  const fetchUsers = async () => {
    const { users: rows } = await api.users();
    setUsers(rows || []);
  };

  const addTruck = async () => {
    if (!newTruck) return;
    try {
      await api.addTruck(newTruck, truckColor);
      setNewTruck('');
      setTruckColor('#cccccc');
      await fetchTrucks();
    } catch (error) {
      alert(error.message);
    }
  };

  const deleteTruck = async (truckName) => {
    try {
      await api.deleteTruck(truckName);
      await fetchTrucks();
    } catch (error) {
      alert(error.message);
    }
  };

  const addUser = async () => {
    if (!newUsername || !newPassword) return;

    try {
      await api.addUser({ username: newUsername, password: newPassword, role: newRole });
      setNewUsername('');
      setNewPassword('');
      setNewRole('driver');
      await fetchUsers();
    } catch (error) {
      alert(error.message);
    }
  };

  const deleteUser = async (id) => {
    try {
      await api.deleteUser(id);
      await fetchUsers();
    } catch (error) {
      alert(error.message);
    }
  };

  const updateUserPassword = async (id, newPassword) => {
    if (!newPassword) return;
    try {
      await api.updatePassword(id, newPassword);
      setPasswordDrafts((drafts) => ({ ...drafts, [id]: '' }));
      await fetchUsers();
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="admin-settings-container">
      <button className="back-button" onClick={() => navigate('/admin')}>
        ←
      </button>
      <h2 className="admin-title">Admin Settings</h2>

      <div className="admin-section">
        <h3>Pārvaldīt kravas auto</h3>
        <div className="add-truck-row">
          <input
            className="admin-input short"
            placeholder="Auto nosaukums"
            value={newTruck}
            onChange={(e) => setNewTruck(e.target.value)}
          />
          <input
            type="color"
            value={truckColor}
            onChange={(e) => setTruckColor(e.target.value)}
            className="color-picker"
          />
          <button className="green-btn" onClick={addTruck}>Pievienot auto</button>
        </div>

        <ul className="truck-list">
          {trucks.map(truck => (
            <li key={truck.name} className="truck-row">
              <div className="truck-name-group">
                <div className="color-sample" style={{ background: truck.color }} />
                {truck.name}
              </div>
              <button className="red-btn" onClick={() => deleteTruck(truck.name)}>Dzēst</button>
            </li>
          ))}
        </ul>
      </div>

      <div className="admin-section">
        <h3>Pārvaldīt lietotājus</h3>
        <div className="add-user-row">
          <input
            className="admin-input short"
            placeholder="Lietotājvārds"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
          />
          <input
            className="admin-input short"
            placeholder="Parole"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <select
            className="admin-input short"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
          >
            <option value="driver">Driver</option>
            <option value="admin">Admin</option>
          </select>
          <button className="green-btn" onClick={addUser}>Pievienot lietotāju</button>
        </div>

        <ul className="user-list">
          {users.map(user => (
            <li key={user.username} className="user-entry">
              {user.username} ({user.role})
              <div className="user-actions">
                <input
                  type="password"
                  className="admin-input short"
                  placeholder="Jauna parole"
                  value={passwordDrafts[user.id] || ''}
                  onChange={(e) => setPasswordDrafts((drafts) => ({ ...drafts, [user.id]: e.target.value }))}
                />
                <button
                  className="green-btn"
                  onClick={() => updateUserPassword(user.id, passwordDrafts[user.id])}
                >
                  Mainīt paroli
                </button>
                {!(user.role === 'admin' && users.filter(u => u.role === 'admin').length === 1) && (
                  <button
                    className="red-btn"
                    onClick={() => deleteUser(user.id)}
                  >
                    Dzēst
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default AdminSettings;
