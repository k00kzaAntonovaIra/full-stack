import { useEffect, useState } from "react";
import "../styles/home.css";
import type { User, Trip } from "../utils/api";
import { tripsAPI, tokenManager } from "../utils/api";

interface HomePageProps {
  currentUser: User | null;
}

export default function HomePage({ currentUser }: HomePageProps) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTrips() {
      try {
        // Получаем старый токен один раз
        const oldToken = tokenManager.getAccessToken();
        console.log("OLD ACCESS TOKEN:", oldToken);

        const data = await tripsAPI.list() as Trip[];
        setTrips(data);

        // Новый токен после запроса
        const newToken = tokenManager.getAccessToken();
        if (oldToken !== newToken) {
          console.log("NEW ACCESS TOKEN:", newToken);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    void loadTrips();
  }, []); // пустой массив — useEffect сработает один раз

  const deleteTrip = async (id: number) => {
    try {
      await tripsAPI.delete(id);
      setTrips(prev => prev.filter(trip => trip.id !== id));
    } catch (err) {
      console.error("Ошибка при удалении:", err);
      alert("Не удалось удалить поездку");
    }
  };

  if (loading) return <div>Загрузка поездок...</div>;

  return (
    <section className="trips-grid">
      {trips.map(trip => {
        const canDelete =
          currentUser &&
          (trip.creator_id === currentUser.id || currentUser.role?.toLowerCase() === "admin");

        return (
          <div className="glass-card" key={trip.id}>
            <div className="trip-img" />

            <div className="trip-content">
              <div><strong>{trip.title}</strong></div>
              <div>{trip.description}</div>
              <div>{trip.start_date} — {trip.end_date}</div>
              <div>Бюджет: {trip.budget_total} €</div>
              <div>Локация: {trip.destination}</div>
              <div>Организатор ID: {trip.creator_id}</div>
            </div>

            <button className="green-btn">Подробнее</button>

            {canDelete && (
              <button className="red-btn" onClick={() => deleteTrip(trip.id)}>
                Удалить
              </button>
            )}
          </div>
        );
      })}
    </section>
  );
}