import React, { useState } from 'react';

const users = [
  { username: 'andris', password: '1234', role: 'driver' },
  { username: 'janis', password: '5678', role: 'driver' },
  { username: 'didzis', password: '9012', role: 'driver' },
  { username: 'admin', password: 'adminpass', role: 'admin' },
];

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const found = users.find((u) => u.username === username && u.password === password);
    if (found) {
      onLogin(found);
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        maxWidth: '400px',
        margin: '100px auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        fontFamily: 'sans-serif',
      }}
    >
      <h2 style={{ textAlign: 'center' }}>Login</h2>

      <label>
        Username:
        <select value={username} onChange={(e) => setUsername(e.target.value)} required>
          <option value="">-- Select driver --</option>
          <option value="andris">Andris</option>
          <option value="janis">Jānis</option>
          <option value="didzis">Didzis</option>
          <option value="admin">Admin</option>
        </select>
      </label>

      <label>
        Password:
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </label>

      {error && <div style={{ color: 'red' }}>{error}</div>}

      <button type="submit" style={{ padding: '12px', fontSize: '16px' }}>
        Log In
      </button>
    </form>
  );
}

export default Login;
