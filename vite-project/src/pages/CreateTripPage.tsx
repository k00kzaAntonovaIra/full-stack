import { useState } from "react";
import "../styles/pages.css";

// Добавляем пропс currentUser, чтобы знать, кто создает поездку
export default function CreateTripPage({ currentUser }: { currentUser: any }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("");
  
  // 1. Добавляем состояние для хранения выбранного файла
  const [file, setFile] = useState<File | null>(null);

  const handleCreate = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("Вы не авторизованы");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/trips/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          destination,
          start_date: startDate, // Проверь, что формат YYYY-MM-DD
          end_date: endDate,
          budget_total: Number(budget),
          creator_id: currentUser?.id
        }),
      });

      // --- ВОТ ЭТОТ БЛОК ПОМОЖЕТ НАЙТИ ОШИБКУ ---
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Неизвестная ошибка" }));
        console.log("ОШИБКА БЭКЕНДА:", errorData);
        
        // Выведет в окно браузера точное сообщение (например, "Field 'creator_id' is required")
        alert("Бэкенд говорит: " + JSON.stringify(errorData.detail));
        return; // Останавливаем выполнение
      }
      // ------------------------------------------

      const data = await response.json();

      if (file && data.id) {
        const formData = new FormData();
        formData.append("file", file);

        const uploadRes = await fetch(`http://127.0.0.1:8000/trips/${data.id}/upload-image`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
          body: formData,
        });

        if (!uploadRes.ok) {
          console.error("Картинка не загрузилась");
        }
      }

      alert("Поездка успешно создана!");
    } catch (error) {
      console.error("Ошибка в коде фронтенда:", error);
      alert("Сетевая ошибка: проверьте консоль");
    }
  };

  return (
    <div className="page-container">
      <div className="glass-card create-trip-card">
        <h2>Создание поездки</h2>

        <div className="create-grid">
          <div className="form-side">
            {/* ... твои старые инпуты ... */}
            <input placeholder="Название" value={title} onChange={(e) => setTitle(e.target.value)} />
            <input placeholder="Направление" value={destination} onChange={(e) => setDestination(e.target.value)} />
            <textarea placeholder="Описание" value={description} onChange={(e) => setDescription(e.target.value)} />
            
            <div className="row">
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>

            <input type="number" placeholder="Бюджет" value={budget} onChange={(e) => setBudget(e.target.value)} />

            {/* НОВЫЙ ИНПУТ ДЛЯ ФАЙЛА */}
            <div style={{ margin: "15px 0" }}>
              <label style={{ display: "block", marginBottom: "5px", fontSize: "14px" }}>Обложка поездки:</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} 
              />
            </div>

            <button className="green-btn" onClick={handleCreate}>
              Создать новую поездку
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}