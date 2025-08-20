import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { getToken, removeToken } from './auth';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!getToken());

  const handleLogin = () => setIsLoggedIn(true);
  const handleLogout = () => {
    removeToken();
    setIsLoggedIn(false);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            isLoggedIn ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />
          }
        />
        <Route
          path="/dashboard"
          element={
            isLoggedIn ? <Dashboard onLogout={handleLogout} /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/"
          element={
            isLoggedIn ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
