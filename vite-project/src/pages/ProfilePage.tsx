import "../styles/pages.css";

export default function ProfilePage() {
  return (
    <>

      <div className="page-container">
        <div className="glass-card">
          <h2>Профиль</h2>

          <div><strong>Имя:</strong> Иван</div>
          <div><strong>Email:</strong> example@mail.com</div>

          <button className="green-btn">
            Редактировать профиль
          </button>
        </div>
      </div>
    </>
  );
}