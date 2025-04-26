import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';
import './AdminSettings.css';

export default function AdminSettings() {
  const [trucks, setTrucks] = useState([]);
  const [users, setUsers] = useState([]);
  const [newTruck, setNewTruck] = useState('');
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'driver' });
  const [passwordChanges, setPasswordChanges] = useState({});
  const navigate = useNavigate();

  // UZLĀDĒ TRUCKS un USERS no SUPABASE
  useEffect(() => {
    fetchTrucks();
    fetchUsers();
  }, []);

  const fetchTrucks = async () => {
    const { data, error } = await supabase.from('trucks').select('*');
    if (error) console.error('Kļūda ielādējot kravas auto:', error.message);
    else setTrucks(data.map(t => t.name));
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase.from('users').select('*');
    if (error) console.error('Kļūda ielādējot lietotājus:', error.message);
    else setUsers(data);
  };

  // AUTO funkcijas
  const handleAddTruck = async () => {
    if (!newTruck.trim()) return alert('Ievadi auto numuru!');
    if (trucks.includes(newTruck)) return alert('Šāds auto jau eksistē!');

    const { error } = await supabase.from('trucks').insert([{ name: newTruck }]);
    if (error) {
      alert('Kļūda pievienojot auto: ' + error.message);
    } else {
      setNewTruck('');
      fetchTrucks();
    }
  };

  const handleDeleteTruck = async (truck) => {
    if (!window.confirm(`Vai tiešām dzēst auto ${truck}?`)) return;

    const { error } = await supabase.from('trucks').delete().eq('name', truck);
    if (error) {
      alert('Kļūda dzēšot auto: ' + error.message);
    } else {
      fetchTrucks();
    }
  };

  // LIETOTĀJU funkcijas
  const handleAddUser = async () => {
    if (!newUser.username || !newUser.password) return alert('Aizpildi visus laukus!');
    if (users.some(u => u.username === newUser.username)) return alert('Šāds lietotājvārds jau eksistē!');

    const { error } = await supabase.from('users').insert([newUser]);
    if (error) {
      alert('Kļūda pievienojot lietotāju: ' + error.message);
    } else {
      setNewUser({ username: '', password: '', role: 'driver' });
      fetchUsers();
    }
  };

  const handleDeleteUser = async (username) => {
    if (!window.confirm(`Vai tiešām dzēst lietotāju ${username}?`)) return;

    const { error } = await supabase.from('users').delete().eq('username', username);
    if (error) {
      alert('Kļūda dzēšot lietotāju: ' + error.message);
    } else {
      fetchUsers();
    }
  };

  const handlePasswordChange = async (username) => {
    const newPassword = passwordChanges[username];
    if (!newPassword) return alert('Ievadi jaunu paroli!');

    const { error } = await supabase
      .from('users')
      .update({ password: newPassword })
      .eq('username', username);

    if (error) {
      alert('Kļūda mainot paroli: ' + error.message);
    } else {
      setPasswordChanges(prev => ({ ...prev, [username]: '' }));
      fetchUsers();
    }
  };

  return (
    <div className="admin-settings-container">
      <button className="back-button" onClick={() => navigate('/')}>
        ←
      </button>

      <h2 className="admin-title">Admin iestatījumi</h2>

      {/* Kravas auto sadaļa */}
      <div className="admin-section">
        <h3>Pārvaldīt kravas auto</h3>
        <div className="add-truck-row">
          <input
            type="text"
            className="admin-input short"
            placeholder="Jauns auto (piem. AB1234)"
            value={newTruck}
            onChange={(e) => setNewTruck(e.target.value)}
          />
          <button className="green-btn" onClick={handleAddTruck}>Pievienot auto</button>
        </div>
        <ul className="truck-list">
          {trucks.map((truck) => (
            <li key={truck} className="truck-row">
              {truck}
              <button className="green-btn" onClick={() => handleDeleteTruck(truck)}>Dzēst</button>
            </li>
          ))}
        </ul>
      </div>

      {/* Lietotāju sadaļa */}
      <div className="admin-section">
        <h3>Lietotāju pārvaldība</h3>
        <div className="add-user-row">
          <input
            type="text"
            className="admin-input short"
            placeholder="Lietotājvārds"
            value={newUser.username}
            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
          />
          <input
            type="password"
            className="admin-input short"
            placeholder="Parole"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
          />
          <select
            className="admin-input short"
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
                  type="password"
                  className="admin-input short"
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
