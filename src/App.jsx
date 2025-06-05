import React, { useEffect, useState, useRef } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './Login';
import TruckSelector from './TruckSelector';
import DailyEntryForm from './DailyEntryForm';
import AdminDashboard from './AdminDashboard';
import AdminSettings from './AdminSettings';
import { supabase } from './supabaseClient'; // Nepieciešams priekš izlogošanas

const App = () => {
  const [user, setUser] = useState(null);
  const [selectedTruck, setSelectedTruck] = useState(null);
  const navigate = useNavigate();

  const timeoutRef = useRef(null);
  const AUTO_LOGOUT_MS = 5 * 60 * 1000; // 5 minūtes

  const resetAutoLogoutTimer = () => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      handleLogout();
    }, AUTO_LOGOUT_MS);
  };

  const handleLogout = async () => {
    clearTimeout(timeoutRef.current);
    await supabase.auth.signOut(); // drošs Supabase logout
    localStorage.removeItem('loggedInUser');
    setUser(null);
    setSelectedTruck(null);
    navigate('/');
  };

  // Ielasa user no localStorage
  useEffect(() => {
    const stored = localStorage.getItem('loggedInUser');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  // Aktivizē auto-logout, kad ir ielogojies
  useEffect(() => {
    if (!user) return;

    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetAutoLogoutTimer));
    resetAutoLogoutTimer();

    return () => {
      clearTimeout(timeoutRef.current);
      events.forEach(event => window.removeEventListener(event, resetAutoLogoutTimer));
    };
  }, [user]);

  return (
    <Routes>
      <Route
        path="/"
        element={
          !user ? (
            <Login onLogin={(u) => {
              setUser(u);
              localStorage.setItem('loggedInUser', JSON.stringify(u));
            }} />
          ) : user.role === 'admin' ? (
            <Navigate to="/admin" />
          ) : (
            <Navigate to="/select-truck" />
          )
        }
      />

      <Route
        path="/select-truck"
        element={
          user && user.role === 'driver' ? (
            selectedTruck ? (
              <DailyEntryForm
                truck={selectedTruck}
                user={user}
                onChooseAnotherTruck={() => setSelectedTruck(null)}
                onLogout={handleLogout}
              />
            ) : (
              <TruckSelector onSelect={setSelectedTruck} />
            )
          ) : (
            <Navigate to="/" />
          )
        }
      />

      <Route
        path="/admin"
        element={
          user && user.role === 'admin' ? (
            <AdminDashboard onLogout={handleLogout} />
          ) : (
            <Navigate to="/" />
          )
        }
      />

      <Route
        path="/admin/settings"
        element={
          user && user.role === 'admin' ? (
            <AdminSettings />
          ) : (
            <Navigate to="/" />
          )
        }
      />
    </Routes>
  );
};

export default App;
