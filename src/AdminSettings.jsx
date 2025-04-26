import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';
import bcrypt from 'bcryptjs';
import './AdminSettings.css';

function AdminSettings() {
  const [trucks, setTrucks] = useState([]);
  const [newTruck, setNewTruck] = useState('');
  const [truckColor, setTruckColor] = useState('#cccccc');
  const [users, setUsers] = useState([]);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('driver');

  const navigate = useNavigate();

  useEffect(() => {
    fetchTrucks();
    fetchUsers();
  }, []);

  const fetchTrucks = async () => {
    const { data, error } = await supabase.from('trucks').select('*');
    if (!error) setTrucks(data || []);
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase.from('users').select('*');
    if (!error) setUsers(data || []);
  };

  const addTruck = async () => {
    if (!newTruck) return;
    const { error } = await supabase.from('trucks').insert([{ name: newTruck, color: truckColor }]);
    if (!error) {
      setNewTruck('');
      setTruckColor('#cccccc');
      fetchTrucks();
    }
  };

  const deleteTruck = async (truckName) => {
    const { error } = await supabase.from('trucks').delete().eq('name', truckName);
    if (!error) fetchTrucks();
  };

  const addUser = async () => {
    if (!newUsername || !newPassword) return;

    // 🔒 Šifrējam paroli pirms saglabāšanas
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(newPassword, salt);

    const { error } = await supabase.from('users').insert([
      { username: newUsername, password: hashedPassword, role: newRole }
    ]);

    if (!error) {
      setNewUsername('');
      setNewPassword('');
      setNewRole('driver');
      fetchUsers();
    }
  };

  const deleteUser = async (username) => {
    const { error } = await supabase.from('users').delete().eq('username', username);
    if (!error) fetchUsers();
  };

  const updateUserPassword = async (username, newPassword) => {
    if (!newPassword) return;

    // 🔒 Šifrējam jauno paroli
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(newPassword, salt);

    const { error } = await supabase
      .from('users')
      .update({ password: hashedPassword })
      .eq('username', username);

    if (!error) fetchUsers();
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
                  onChange={(e) => user.newPassword = e.target.value}
                />
                <button
                  className="green-btn"
                  onClick={() => updateUserPassword(user.username, user.newPassword)}
                >
                  Mainīt paroli
                </button>
                {!(user.role === 'admin' && users.filter(u => u.role === 'admin').length === 1) && (
                  <button
                    className="red-btn"
                    onClick={() => deleteUser(user.username)}
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
