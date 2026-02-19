import type { User } from '../utils/api';

interface Props {
  user: User | null;
  onLogout: () => void;
}

export default function Navbar({ user, onLogout }: Props) {
  return (
    <nav className="navbar">
      <div className="logo">Plan&Go</div>

      <div className="nav-links">
        <button>Создать поездку</button>
        <button>Мои поездки</button>
        <button>Архив поездок</button>

        {user && (
          <>
            <span>{user.name}</span>
            <button onClick={onLogout}>Выйти</button>
          </>
        )}
      </div>
    </nav>
  );
}
