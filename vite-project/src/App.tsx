import { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { authAPI, tokenManager } from './utils/api';
import type { User } from './utils/api';

type Page = 'login' | 'register';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (tokenManager.isAuthenticated()) {
        try {
          const userData = await authAPI.getCurrentUser();
          setUser(userData);
        } catch {
          tokenManager.clearTokens();
        }
      }
      setLoading(false);
    };

    void checkAuth();
  }, []);

  const handleLoginSuccess = (userData: User) => {
    setUser(userData);
  };

  const handleRegisterSuccess = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    const refreshToken = tokenManager.getRefreshToken();
    if (refreshToken) {
      authAPI.logout(refreshToken).catch(() => {
        // Ignore errors on logout
      });
    }
    tokenManager.clearTokens();
    setUser(null);
    setCurrentPage('login');
  };

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <div>Загрузка...</div>
      </div>
    );
  }

  if (user) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          padding: '20px',
        }}
      >
        <div
          style={{
            background: 'rgba(198, 240, 164, 0.8)',
            border: '1px solid #5F725A',
            borderRadius: '20px',
            padding: '40px',
            maxWidth: '500px',
            width: '100%',
          }}
        >
          <h1 style={{ color: '#053B11', marginBottom: '20px' }}>
            Добро пожаловать, {user.name}!
          </h1>
          <p style={{ color: '#053B11', marginBottom: '20px' }}>Email: {user.email}</p>
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '12px',
              background: '#053B11',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
            }}
          >
            Выйти
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {currentPage === 'login' ? (
        <LoginPage
          onSwitchToRegister={() => setCurrentPage('register')}
          onLoginSuccess={handleLoginSuccess}
        />
      ) : (
        <RegisterPage
          onSwitchToLogin={() => setCurrentPage('login')}
          onRegisterSuccess={handleRegisterSuccess}
        />
      )}
    </>
  );
}

export default App;

