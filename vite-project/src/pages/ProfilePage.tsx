import "../styles/pages.css";

export default function ProfilePage({ currentUser }: { currentUser: any }) {
  return (
    <div className="page-container">
      <div className="glass-card">
        <h2>Профиль</h2>
        <div><strong>Имя:</strong> {currentUser?.username || "Ira"}</div>
        <div><strong>Email:</strong> {currentUser?.email}</div>
        {/* ... */}
      </div>
    </div>
  );
}