import { useEffect, useState } from "react";
import "../styles/home.css";
import type { User } from "../utils/api";

interface HomePageProps {
  currentUser: User | null;
}

interface Trip {
  id: number;
  title: string;
  description: string;
  destination: string;
  start_date: string;
  end_date: string;
  budget_total: number;
  creator_id: number;
}

export default function HomePage({ currentUser }: HomePageProps) {
  const [trips, setTrips] = useState<Trip[]>([]);

  // Загружаем поездки
  useEffect(() => {
    fetch("http://127.0.0.1:8000/trips/")
      .then(res => res.json())
      .then(data => {
        console.log("Trips from backend:", data);
        setTrips(data);
      })
      .catch(err => console.error(err));
  }, []);

  const deleteTrip = async (id: number) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    await fetch(`http://127.0.0.1:8000/trips/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setTrips(prev => prev.filter(trip => trip.id !== id));
  };

  console.log("CURRENT USER:", currentUser);

  return (
    <section className="trips-grid">
      {trips.map(trip => {
        const canDelete =
          currentUser &&
          (
            Number(trip.creator_id) === Number(currentUser.id) ||
            currentUser.role?.toLowerCase() === "admin"
          );

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

            <button className="green-btn">
              Подробнее
            </button>

            {canDelete && (
              <button
                className="red-btn"
                onClick={() => deleteTrip(trip.id)}
              >
                Удалить
              </button>
            )}
          </div>
        );
      })}
    </section>
  );
}