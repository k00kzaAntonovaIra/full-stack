import '../styles/home.css';
import type { User } from '../utils/api';

// interface Props {
//   user: User | null;
//   onLogout: () => void;
// }

export default function HomePage() {
  return (
    <>

      <section className="trips-grid">
        {[1,2,3,4,5].map(i => (
          <div className="glass-card" key={i}>
            <div className="trip-img" />

            <div className="trip-content">
              <div>Название</div>
              <div>Описание</div>
              <div>Даты</div>
              <div>Бюджет</div>
              <div>Человек</div>
              <div>Организатор</div>
            </div>

            <button className="green-btn">
              Подробнее
            </button>
          </div>
        ))}
      </section>
    </>
  );
}