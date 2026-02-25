
import "../styles/pages.css";

export default function MyTripsPage() {
  return (
    <>

      <h2 className="page-title">Мои поездки</h2>

        <div className="page-container">

        <div className="cards-grid">
          {[1,2,3].map(i => (
            <div className="glass-card" key={i}>
              <div className="trip-img" />
              <div>Название</div>
              <div>Даты</div>
              <div>Бюджет</div>
              <button className="green-btn">Подробнее</button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}