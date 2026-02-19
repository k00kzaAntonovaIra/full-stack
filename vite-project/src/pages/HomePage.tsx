import Navbar from '../components/Navbar';
import '../styles/home.css';
import type { User } from '../utils/api';

interface Props {
  user: User | null;
  onLogout: () => void;
}

export default function HomePage({ user, onLogout }: Props) {
  return (
    <>
      <Navbar user={user} onLogout={onLogout} />

      {/* HERO */}
      <section className="hero">
        <h1>Найдите попутчиков для ваших путешествий</h1>

        <p>
          Присоединяйтесь к интересным поездкам или создавайте свои.
          Путешествуйте в компании единомышленников.
        </p>
      </section>

      {/* GRID */}
      <section className="trips-grid">
        {[1,2,3,4,5].map(i => (
          <div className="trip-card" key={i}>
            <div className="trip-img" />

            <div className="trip-content">
              <div>Название</div>
              <div>Описание</div>
              <div>Даты</div>
              <div>Бюджет</div>
              <div>Человек</div>
              <div>Организатор</div>
            </div>

            <button className="details-btn">
              Подробнее
            </button>
          </div>
        ))}
      </section>
    </>
  );
}
