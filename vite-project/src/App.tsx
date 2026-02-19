import { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';


import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CreateProfile from './pages/CreateProfile';
import HomePage from './pages/HomePage';

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
      if (tokenManager.isAuthenticated()) {
        try {
          const userData = await authAPI.getCurrentUser();
          setUser(userData);

          if (hasProfile(userData)) {
            navigate('/home');
          } else {
            navigate('/register');
          }
        } catch {
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
    setUser(userData);

    if (hasProfile(userData)) {
      navigate('/home');
    } else {
      navigate('/register');
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

  if (loading) return <div>Загрузка...</div>;

  return (
    <Routes>

      {/* ВОТ ЭТО ДОБАВЬ */}
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

      <Route
        path="/home"
        element={
          <HomePage
            user={user}
            onLogout={handleLogout}
          />
        }
      />

    </Routes>
  );

}

export default App;
