import { useEffect, useState } from "react";
import { tripsAPI } from "../utils/api";
import type { Trip, User } from "../utils/api";
import "../styles/pages.css";

// 1. Добавляем описание того, что страница принимает пользователя (props)
interface MyTripsPageProps {
  currentUser: User | null;
}

export default function MyTripsPage({ currentUser }: MyTripsPageProps) {
  // 2. Создаем "копилку" для поездок и статус загрузки
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  // 3. Загружаем данные из БД при открытии страницы
  useEffect(() => {
    async function loadMyTrips() {
      if (!currentUser) return; // Ждем, пока пользователь загрузится

      setLoading(true);
      try {
        // Вызываем метод API, который мы правили ранее
        // Фильтруем только по нашему ID
        const data = await tripsAPI.list({ creator_id: currentUser.id });
        setTrips(data);
      } catch (err) {
        console.error("Не удалось загрузить ваши поездки", err);
      } finally {
        setLoading(false);
      }
    }

    loadMyTrips();
  }, [currentUser]);

  return (
    <>
      <h2 className="page-title">Мои поездки</h2>

      <div className="page-container">
        {loading ? (
          <div className="loader">Загрузка ваших приключений...</div>
        ) : (
          <div className="cards-grid">
            {trips.length > 0 ? (
              // 4. Вместо [1,2,3] используем реальный массив trips
              trips.map((trip) => (
                <div className="glass-card" key={trip.id}>
                  <div 
                    className="trip-img" 
                    style={{ 
                      backgroundImage: trip.image_url ? `url(${trip.image_url})` : 'none', 
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      height: '200px',
                      width: '100%'
                    }} 
                  />
                  <div className="trip-card-info" style={{ padding: '15px' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{trip.title}</div>
                    <div style={{ color: '#666', fontSize: '14px' }}>📅 {trip.start_date}</div>
                    <div style={{ marginTop: '5px', color: '#2e7d32', fontWeight: 'bold' }}>
                        Бюджет: {trip.budget_total} €
                    </div>
                  </div>
                  <button className="green-btn" style={{ width: '100%', marginTop: '10px' }}>
                    Подробнее
                  </button>
                </div>
              ))
            ) : (
              // Если поездок еще нет
              <div className="no-results" style={{ color: 'white' }}>
                Вы еще не создали ни одной поездки. Самое время начать! ✈️
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}