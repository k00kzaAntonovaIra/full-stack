import type { User } from "../utils/api";
import "../styles/pages.css";

// Добавляем интерфейс, чтобы App.tsx видел, что страница принимает currentUser
interface ArchivePageProps {
  currentUser: User | null;
}

export default function ArchivePage({ currentUser }: ArchivePageProps) {
  
  return (
    <>
      <div className="page-container">
        <h2 className="page-title" style={{ color: "white", padding: "20px 0" }}>
          Архив поездок
        </h2>

        <div className="cards-grid">
          {[1, 2].map((i) => (
            <div className="glass-card" key={i}>
              <div 
                className="trip-img" 
                style={{ backgroundColor: '#ccc', height: '150px' }} 
              />
              <div style={{ padding: '15px' }}>
                <div style={{ fontWeight: 'bold' }}>Завершённая поездка #{i}</div>
                <p style={{ fontSize: '12px', color: '#666' }}>Эта поездка уже состоялась</p>
              </div>
              <button className="green-btn" style={{ width: '100%', marginTop: '10px' }}>
                Посмотреть детали
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}