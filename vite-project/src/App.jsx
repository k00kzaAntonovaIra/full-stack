import { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CreateProfile from './pages/CreateProfile';
import { tokenManager, authAPI } from './utils/api';

function App() {
  const [currentPage, setCurrentPage] = useState('login'); // 'login' or 'register'
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateProfile, setShowCreateProfile] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      if (tokenManager.isAuthenticated()) {
        try {
          const userData = await authAPI.getCurrentUser();
          setUser(userData);
          // Check if profile needs to be created (no bio or minimal info)
          if (!userData.bio || userData.bio.trim().length === 0) {
            setShowCreateProfile(true);
          }
        } catch (error) {
          // Token is invalid, clear it
          tokenManager.clearTokens();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    // Check if profile needs to be created after login
    if (!userData.bio || userData.bio.trim().length === 0) {
      setShowCreateProfile(true);
    }
  };

  const handleRegisterSuccess = (userData) => {
    setUser(userData);
    // Show create profile screen after registration
    setShowCreateProfile(true);
  };

  const handleProfileComplete = async (updatedUser) => {
    setUser(updatedUser);
    setShowCreateProfile(false);
  };

  const handleProfileCancel = () => {
    setShowCreateProfile(false);
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
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Загрузка...</div>
      </div>
    );
  }

  // Show create profile screen if needed
  if (user && showCreateProfile) {
    return (
      <CreateProfile
        userId={user.id}
        onComplete={handleProfileComplete}
        onCancel={handleProfileCancel}
      />
    );
  }

  if (user) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        padding: '20px'
      }}>
        <div style={{
          background: 'rgba(198, 240, 164, 0.8)',
          border: '1px solid #5F725A',
          borderRadius: '20px',
          padding: '40px',
          maxWidth: '500px',
          width: '100%'
        }}>
          <h1 style={{ color: '#053B11', marginBottom: '20px' }}>
            Добро пожаловать, {user.name}!
          </h1>
          <p style={{ color: '#053B11', marginBottom: '20px' }}>
            Email: {user.email}
          </p>
          {user.bio && (
            <p style={{ color: '#053B11', marginBottom: '20px' }}>
              О себе: {user.bio}
            </p>
          )}
          <button
            onClick={() => setShowCreateProfile(true)}
            style={{
              width: '100%',
              padding: '12px',
              marginBottom: '10px',
              background: '#805AD5',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            Редактировать профиль
          </button>
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
              fontWeight: '600'
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




