import React, { useEffect, useState } from 'react';
import Login from './Login';
import TruckSelector from './TruckSelector';
import DailyEntryForm from './DailyEntryForm';
import AdminDashboard from './AdminDashboard';
import AdminSettings from './AdminSettings';
import { Routes, Route, Navigate } from 'react-router-dom';

const App = () => {
  const [user, setUser] = useState(null);
  const [selectedTruck, setSelectedTruck] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (storedUser) setUser(storedUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    setUser(null);
    setSelectedTruck(null);
  };

  const handleBackToTrucks = () => {
    setSelectedTruck(null);
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          !user ? (
            <Login onLogin={setUser} />
          ) : user.role === 'admin' ? (
            <Navigate to="/admin" />
          ) : !selectedTruck ? (
            <TruckSelector onSelect={setSelectedTruck} />
          ) : (
            <DailyEntryForm
              truck={selectedTruck}
              user={user}
              onChooseAnotherTruck={handleBackToTrucks}
              onLogout={handleLogout}
            />
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
