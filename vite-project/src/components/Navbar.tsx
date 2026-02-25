import { Link, useNavigate } from "react-router-dom";
import "../styles/navbar.css";

interface Props {
  onLogout: () => void;
}

export default function Navbar({ onLogout }: Props) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate("/login"); // редирект после выхода
  };

  return (
    <div className="hero-wrapper">
      <nav className="navbar">

        <div className="logo">
          <Link to="/home">Plan & Go</Link>
        </div>

        <div className="nav-links">
          <Link to="/create">Создать поездку</Link>
          <Link to="/my-trips">Мои поездки</Link>
          <Link to="/profile">Профиль</Link>
          <Link to="/archive">Архив поездок</Link>

          <button className="logout-link" onClick={handleLogout}>
            Выход
          </button>
        </div>

      </nav>
    </div>
  );
}