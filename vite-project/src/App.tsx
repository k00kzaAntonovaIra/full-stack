import { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CreateProfile from './pages/CreateProfile';
import HomePage from './pages/HomePage';
import CreateTripPage from './pages/CreateTripPage';
import MyTripsPage from './pages/MyTripsPage';
import ProfilePage from './pages/ProfilePage';
import ArchivePage from './pages/ArchivePage';

import { authAPI, tokenManager } from './utils/api';
import type { User } from './utils/api';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const hasProfile = (u: User) =>
    Boolean(u.name && u.name.trim().length > 0);

  useEffect(() => {
    const checkAuth = async () => {
      if (!tokenManager.isAuthenticated()) {
        setLoading(false);
        navigate('/login');
        return;
      }

      try {
        const userData = await authAPI.getCurrentUser();
        setUser(userData);

        if (hasProfile(userData)) {
          navigate('/home');
        } else {
          navigate('/create-profile');
        }
      } catch {
        tokenManager.clearTokens();
        navigate('/login');
      }

      setLoading(false);
    };

    void checkAuth();
  }, []);

  const handleLoginSuccess = (userData: User) => {
    setUser(userData);

    if (hasProfile(userData)) {
      navigate('/home');
    } else {
      navigate('/create-profile');
    }
  };

  const handleRegisterSuccess = (userData: User) => {
    setUser(userData);
    navigate('/create-profile');
  };

  const handleProfileCreated = () => {
    navigate('/home');
  };

  const handleLogout = () => {
    const refreshToken = tokenManager.getRefreshToken();
    if (refreshToken) {
      authAPI.logout(refreshToken).catch(() => {});
    }

    tokenManager.clearTokens();
    setUser(null);
    navigate('/login');
  };

  if (loading) return <div>Загрузка...</div>;

  return (
    <>
      {user && <Navbar onLogout={handleLogout} />}

      <Routes>

        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route
          path="/login"
          element={
            <LoginPage
              onSwitchToRegister={() => navigate('/register')}
              onLoginSuccess={handleLoginSuccess}
            />
          }
        />

        <Route
          path="/register"
          element={
            <RegisterPage
              onSwitchToLogin={() => navigate('/login')}
              onRegisterSuccess={handleRegisterSuccess}
            />
          }
        />

        <Route
          path="/create-profile"
          element={
            user
              ? <CreateProfile onProfileCreated={handleProfileCreated} />
              : <Navigate to="/login" replace />
          }
        />

        <Route
          path="/home"
          element={
            user
              ? <HomePage currentUser={user} />
              : <Navigate to="/login" replace />
          }
        />

        <Route
          path="/create"
          element={
            user
              ? <CreateTripPage />
              : <Navigate to="/login" replace />
          }
        />

        <Route
          path="/my-trips"
          element={
            user
              ? <MyTripsPage />
              : <Navigate to="/login" replace />
          }
        />

        <Route
          path="/profile"
          element={
            user
              ? <ProfilePage />
              : <Navigate to="/login" replace />
          }
        />

        <Route
          path="/archive"
          element={
            user
              ? <ArchivePage />
              : <Navigate to="/login" replace />
          }
        />

      </Routes>
    </>
  );
}

export default App;