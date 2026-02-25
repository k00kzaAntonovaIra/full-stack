import "../styles/pages.css";

export default function ArchivePage() {
  return (
    <>

      <div className="page-container">
        <h2>Архив поездок</h2>

        <div className="cards-grid">
          {[1,2].map(i => (
            <div className="glass-card" key={i}>
              <div className="trip-img" />
              <div>Завершённая поездка</div>
              <button className="green-btn">Посмотреть</button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}