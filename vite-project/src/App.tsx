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

  // Проверка авторизации при старте
  useEffect(() => {
    const checkAuth = async () => {
      console.log("CHECK AUTH START");

      if (tokenManager.isAuthenticated()) {
        try {
          console.log("TRY GET CURRENT USER");

          const userData = await authAPI.getCurrentUser();
          console.log("CHECK AUTH USER:", userData);
          setUser(userData);

          if (hasProfile(userData)) {
            navigate('/home');
          } else {
            navigate('/create-profile');
          }
        } catch {
          console.log("GET CURRENT USER FAILED");

          tokenManager.clearTokens();
          navigate('/login');
        }
      } else {
        navigate('/login');
      }
      setLoading(false);
    };

    void checkAuth();
  }, []);

  // LOGIN
  const handleLoginSuccess = (userData: User) => {
    console.log("LOGIN USER DATA:", userData);

    setUser(userData);

    if (hasProfile(userData)) {
      navigate('/home');
    } else {
      navigate('/create-profile');
    }
  };


  // REGISTER
  const handleRegisterSuccess = (userData: User) => {
    setUser(userData);
    navigate('/create-profile');
  };

  // PROFILE CREATED
  const handleProfileCreated = () => {
    navigate('/home');
  };

  // LOGOUT
  const handleLogout = () => {
    const refreshToken = tokenManager.getRefreshToken();
    if (refreshToken) {
      authAPI.logout(refreshToken).catch(() => {});
    }

    tokenManager.clearTokens();
    setUser(null);
    navigate('/login');
  };

  console.log("APP RENDER, loading =", loading);

  if (loading) return <div>Загрузка...</div>;

  return (
  <>
    {/* Navbar показываем только если пользователь есть */}
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
          <CreateProfile
            onProfileCreated={handleProfileCreated}
          />
        }
      />

      <Route path="/home" element={<HomePage />} />

      <Route path="/create" element={<CreateTripPage />} />
      <Route path="/my-trips" element={<MyTripsPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/archive" element={<ArchivePage />} />

    </Routes>
  </>
);

}

export default App;
