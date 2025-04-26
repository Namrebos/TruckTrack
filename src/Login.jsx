// Login.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import logo from './assets/AB Buss.png'; // Pārliecinies, ka ceļš ir pareizs!
import './Login.css';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const passwordInputRef = useRef(null); // 👉 ref parolei

  // TEST Supabase Connection
  useEffect(() => {
    const testSupabaseConnection = async () => {
      const { data, error } = await supabase.from('users').select('*');
      if (error) {
        console.error('❌ Supabase SELECT error:', error.message);
      } else {
        console.log('✅ Supabase connection OK, users data:', data);
      }
    };
    testSupabaseConnection();
  }, []);

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Ievadi lietotājvārdu un paroli!');
      return;
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .single();

    if (error || !user) {
      setError('Nepareizs lietotājvārds vai parole');
    } else {
      localStorage.setItem('loggedInUser', JSON.stringify(user));
      onLogin(user);
      navigate(user.role === 'admin' ? '/admin' : '/select-truck');
    }
  };

  const handleUsernameKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      passwordInputRef.current?.focus(); // 👉 fokusē uz paroli
    }
  };

  const handlePasswordKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleLogin(); // 👉 login kad Enter uz paroles
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
