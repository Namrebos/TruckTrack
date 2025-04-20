import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminSettings() {
  const [trucks, setTrucks] = useState([]);
  const [newTruck, setNewTruck] = useState('');
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'driver' });
  const [passwordChanges, setPasswordChanges] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    try {
      const storedUsers = JSON.parse(localStorage.getItem('users')) || [];
      setUsers(storedUsers);

      const storedTrucks = JSON.parse(localStorage.getItem('trucks')) || ['HK8643', 'RO3201', 'MU466'];
      setTrucks(storedTrucks);
    } catch (error) {
      console.error('Kļūda ielādējot localStorage:', error);
    }
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
    <div style={{ padding: '2rem' }}>
      <button
        onClick={() => navigate('/')}
        style={{
          backgroundColor: '#ccc',
          padding: '8px 16px',
          border: '1px solid #999',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '1rem'
        }}
      >
        ← Atpakaļ uz pārskatu
      </button>

      <h2>Admin iestatījumi</h2>

      <h3>Pārvaldīt kravas auto</h3>
      <input
        type="text"
        placeholder="Jauns auto (piem. AB1234)"
        value={newTruck}
        onChange={(e) => setNewTruck(e.target.value)}
      />
      <button onClick={handleAddTruck}>Pievienot auto</button>
      <ul>
        {trucks.map(truck => (
          <li key={truck}>
            {truck} <button onClick={() => handleDeleteTruck(truck)}>Dzēst</button>
          </li>
        ))}
      </ul>

      <h3>Lietotāju pārvaldība</h3>
      <input
        type="text"
        placeholder="Lietotājvārds"
        value={newUser.username}
        onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
      />
      <input
        type="password"
        placeholder="Parole"
        value={newUser.password}
        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
      />
      <select
        value={newUser.role}
        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
      >
        <option value="driver">Vadītājs</option>
        <option value="admin">Administrators</option>
      </select>
      <button onClick={handleAddUser}>Pievienot lietotāju</button>

      <ul>
        {users.map((u) => (
          <li key={u.username}>
            <strong>{u.username}</strong> ({u.role})<br />
            <input
              type="password"
              placeholder="Jauna parole"
              value={passwordChanges[u.username] || ''}
              onChange={(e) =>
                setPasswordChanges({ ...passwordChanges, [u.username]: e.target.value })
              }
            />
            <button onClick={() => handlePasswordChange(u.username)}>Mainīt paroli</button>
            {u.username !== 'admin' && (
              <button onClick={() => handleDeleteUser(u.username)}>Dzēst</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}