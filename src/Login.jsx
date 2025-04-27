import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import bcrypt from 'bcryptjs';
import logo from './assets/AB Buss.png';
import './Login.css';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const passwordInputRef = useRef(null);

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Ievadi lietotājvārdu un paroli!');
      return;
    }

    const { data: usersData, error } = await supabase.from('users').select('*');

    if (error || !usersData) {
      setError('Nevar ielādēt lietotājus.');
      return;
    }

    const user = usersData.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (!user) {
      setError('Nepareizs lietotājvārds vai parole');
      return;
    }

    // Tikai hash pārbaude
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      setError('Nepareizs lietotājvārds vai parole');
      return;
    }

    localStorage.setItem('loggedInUser', JSON.stringify(user));
    onLogin(user);
    navigate(user.role === 'admin' ? '/admin' : '/select-truck');
  };

  const handleUsernameKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      passwordInputRef.current?.focus();
    }
  };

  const handlePasswordKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleLogin();
    }
  };

  return (
    <div className="login-container">
      <img src={logo} alt="AB Buss Logo" className="login-logo" />
      <h2>Autorizācija</h2>
      <input
        type="text"
        className="login-input"
        placeholder="Lietotājvārds"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        onKeyDown={handleUsernameKeyDown}
      />
      <input
        type="password"
        className="login-input"
        placeholder="Parole"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={handlePasswordKeyDown}
        ref={passwordInputRef}
      />
      {error && <p className="login-error">{error}</p>}
      <button className="login-button" onClick={handleLogin}>Ieiet</button>
    </div>
  );
}

export default Login;
