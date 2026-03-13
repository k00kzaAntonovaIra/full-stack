import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import { useAuth } from "./utils/useAuth";
import type { User } from "./utils/api";

function App() {
  const { user, loading, logout, fetchUser } = useAuth();
  const navigate = useNavigate();

  if (loading) return <div>Загрузка...</div>;

  const handleLoginSuccess = async (_user: User) => {
    await fetchUser();
    navigate("/home");
  };

  const switchToRegister = () => navigate("/register");
  const switchToLogin = () => navigate("/login");

  return (
    <>
      {user && <Navbar onLogout={logout} />}

      <Routes>
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to="/home" />
            ) : (
              <LoginPage
                onSwitchToRegister={switchToRegister}
                onLoginSuccess={handleLoginSuccess}
              />
            )
          }
        />

        <Route
          path="/register"
          element={
            user ? (
              <Navigate to="/home" />
            ) : (
              <RegisterPage onSwitchToLogin={switchToLogin} />
            )
          }
        />

        <Route
          path="/home"
          element={user ? <HomePage currentUser={user} /> : <Navigate to="/login" />}
        />

        <Route path="/" element={<Navigate to={user ? "/home" : "/login"} />} />
      </Routes>
    </>
  );
}

export default App;