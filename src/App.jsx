import React, { useEffect, useState } from 'react';
import Login from './Login';
import TruckSelector from './TruckSelector';
import DailyEntryForm from './DailyEntryForm';
import AdminDashboard from './AdminDashboard';

const App = () => {
  const [user, setUser] = useState(null);
  const [selectedTruck, setSelectedTruck] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('loggedUser'));
    if (storedUser) setUser(storedUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('loggedUser');
    setUser(null);
    setSelectedTruck(null);
  };

  const handleBackToTrucks = () => {
    setSelectedTruck(null);
  };

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  if (user.role === 'admin') {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  if (!selectedTruck) {
    return <TruckSelector onSelect={setSelectedTruck} />;
  }

  return (
    <DailyEntryForm
      truck={selectedTruck}
      user={user}
      onChooseAnotherTruck={handleBackToTrucks}
      onLogout={handleLogout}
    />
  );
};

export default App;
