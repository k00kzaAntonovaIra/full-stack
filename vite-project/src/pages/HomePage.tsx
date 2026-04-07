import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "../styles/home.css";
import type { User, Trip } from "../utils/api";
import { tripsAPI } from "../utils/api";

interface HomePageProps {
  currentUser: User | null;
}

// Добавляем расширенный интерфейс прямо здесь, если в utils/api.ts он еще не обновлен
interface TripWithWeather extends Trip {
  weather?: {
    temp: number;
    description: string;
    icon: string;
  };
}

export default function HomePage({ currentUser }: HomePageProps) {
  const [trips, setTrips] = useState<TripWithWeather[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  
  const search = searchParams.get("search") || "";
  const minBudget = searchParams.get("min_budget") || "";
  const maxBudget = searchParams.get("max_budget") || "";
  const startDate = searchParams.get("start_date") || "";
  const endDate = searchParams.get("end_date") || "";
  const sortBy = searchParams.get("sort_by") || "created_at";

  // ЭФФЕКТ ДЛЯ SEO (Лабораторная №4, пункт 2.3)
  useEffect(() => {
    if (search) {
      document.title = `Поиск: ${search} | Travel App`;
    } else {
      document.title = "Путешествия | Plan & Go";
    }
  }, [search]);

  useEffect(() => {
    async function loadTrips() {
      setLoading(true);
      try {
        const data = await tripsAPI.list({
          search: search || undefined,
          min_budget: minBudget ? Number(minBudget) : undefined,
          max_budget: maxBudget ? Number(maxBudget) : undefined,
          start_date: startDate || undefined,
          end_date: endDate || undefined,
          sort_by: sortBy,
          limit: 12, 
        });
        const tripsArray = (Array.isArray(data) ? data : (data ? [data] : [])) as TripWithWeather[];
        setTrips(tripsArray);
      } catch (err) {
        console.error("Ошибка загрузки:", err);
      } finally {
        setLoading(false);
      }
    }

    void loadTrips();
  }, [search, minBudget, maxBudget, startDate, endDate, sortBy]);

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const deleteTrip = async (id: number) => {
    if (!window.confirm("Удалить поездку?")) return;
    try {
      await tripsAPI.delete(id);
      setTrips(prev => prev.filter(trip => trip.id !== id));
    } catch (err) {
      alert("Ошибка удаления");
    }
  };

  return (
    <div className="home-container">
      {/* ПАНЕЛЬ ФИЛЬТРОВ */}
      <section className="filters-panel glass-card">
        <input 
          type="text" 
          placeholder="🔍 Поиск направления..." 
          value={search}
          onChange={(e) => updateFilter("search", e.target.value)}
          className="filter-input search-input"
        />
        
        <div className="filter-group">
          <input 
            type="number" 
            placeholder="Мин. €" 
            value={minBudget}
            onChange={(e) => updateFilter("min_budget", e.target.value)}
            className="filter-input input-small"
          />
          <input 
            type="number" 
            placeholder="Макс. €" 
            value={maxBudget}
            onChange={(e) => updateFilter("max_budget", e.target.value)}
            className="filter-input input-small"
          />
        </div>

        <div className="filter-group">
          <input 
            type="date" 
            value={startDate}
            onChange={(e) => updateFilter("start_date", e.target.value)}
            className="filter-input input-date"
          />
          <input 
            type="date" 
            value={endDate}
            onChange={(e) => updateFilter("end_date", e.target.value)}
            className="filter-input input-date"
          />
        </div>

        <select 
          value={sortBy} 
          onChange={(e) => updateFilter("sort_by", e.target.value)}
          className="filter-select"
        >
          <option value="created_at">Сначала новые</option>
          <option value="budget_total">По цене</option>
          <option value="title">По алфавиту</option>
        </select>
      </section>

      {/* СПИСОК ПОЕЗДОК */}
      {loading ? (
        <div className="loader">Загрузка поездок...</div>
      ) : (
        <section className="trips-grid">
          {trips.length > 0 ? (
            trips.map(trip => {
              const canDelete = currentUser && 
                (trip.creator_id === currentUser.id || currentUser.role?.toLowerCase() === "admin");

              return (
                <div className="glass-card trip-card" key={trip.id}>
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
                  <div className="trip-content">
                    <h3>{trip.title}</h3>
                    <p className="destination">📍 {trip.destination}</p>
                    
                    {/* ПОГОДА (Лабораторная №4, пункт 6) */}
                    {trip.weather && (
                      <div className="weather-badge" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'rgba(255, 255, 255, 0.5)',
                        padding: '4px 10px',
                        borderRadius: '10px',
                        margin: '10px 0',
                        border: '1px solid #e0e0e0'
                      }}>
                        <img 
                          src={`https://openweathermap.org/img/wn/${trip.weather.icon}.png`} 
                          alt="weather"
                          style={{ width: '25px', height: '25px' }}
                        />
                        <span style={{ fontWeight: '600' }}>{trip.weather.temp}°C</span>
                        <span style={{ fontSize: '0.85rem', color: '#666', textTransform: 'capitalize' }}>
                          {trip.weather.description}
                        </span>
                      </div>
                    )}

                    <p className="description">{trip.description}</p>
                    
                    <div className="trip-footer">
                      <span className="budget">💰 {trip.budget_total} €</span>
                      <span className="date">📅 {trip.start_date}</span>
                    </div>
                  </div>

                  <div className="card-actions">
                    <button className="green-btn">Подробнее</button>
                    {canDelete && (
                      <button className="red-btn" onClick={() => deleteTrip(trip.id)}>
                        Удалить
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="no-results">Поездок не найдено 🔍</div>
          )}
        </section>
      )}
    </div>
  );
}