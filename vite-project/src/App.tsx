import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import CreateTripPage from "./pages/CreateTripPage";
import MyTripsPage from "./pages/MyTripsPage";
import ProfilePage from "./pages/ProfilePage";
import ArchivePage from "./pages/ArchivePage";
import { useAuth } from "./utils/useAuth";
import type { User } from "./utils/api";

function App() {
  const { user, loading, logout, fetchUser } = useAuth();
  const navigate = useNavigate();

  if (loading) return <div className="loader">Загрузка...</div>;

  const handleLoginSuccess = async (_user: User) => {
    await fetchUser();
    navigate("/home");
  };

  return (
    <>
      {/* Навбар показываем только авторизованным */}
      {user && <Navbar onLogout={logout} />}

      <Routes>
        {/* Публичные роуты */}
        <Route path="/login" element={user ? <Navigate to="/home" /> : <LoginPage onSwitchToRegister={() => navigate("/register")} onLoginSuccess={handleLoginSuccess} />} />
        <Route path="/register" element={user ? <Navigate to="/home" /> : <RegisterPage onSwitchToLogin={() => navigate("/login")} />} />

        {/* Приватные роуты (доступны только если есть user) */}
        <Route path="/home" element={user ? <HomePage currentUser={user} /> : <Navigate to="/login" />} />
        <Route path="/create" element={user ? <CreateTripPage currentUser={user} /> : <Navigate to="/login" />} />
        <Route path="/my-trips" element={user ? <MyTripsPage currentUser={user} /> : <Navigate to="/login" />} />
        <Route path="/profile" element={user ? <ProfilePage currentUser={user} /> : <Navigate to="/login" />} />
        <Route path="/archive" element={user ? <ArchivePage currentUser={user} /> : <Navigate to="/login" />} />

        {/* Редирект с корня */}
        <Route path="/" element={<Navigate to={user ? "/home" : "/login"} />} />
      </Routes>
    </>
  );
}

export default App;