import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './Login';
import TruckSelector from './TruckSelector';
import DailyEntryForm from './DailyEntryForm';
import AdminDashboard from './AdminDashboard';
import AdminSettings from './AdminSettings';

const App = () => {
  const [user, setUser] = useState(null);
  const [selectedTruck, setSelectedTruck] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('loggedInUser');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    setUser(null);
    setSelectedTruck(null);
    navigate('/');
  };

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
